// repoPresence.js
// Handles presence heartbeats and polling via GitHub Discussions comments

// For simplicity, we'll use GitHub Discussions comments. 

const BASE_API = 'https://api.github.com';

// Per-browser context identifier helper
import { getContextId } from '../utils/contextId.js';

// Track once-per-page beforeunload registration
let unloadRegistered = false;

// ---------------- GraphQL helpers (shared) ------------------------------
async function getDiscussionNodeId(token, repoFullName, discussionNumber) {
  const [owner, name] = repoFullName.split('/');
  const data = await ghGraphQL(token, `
    query($owner:String!,$name:String!,$number:Int!){
      repository(owner:$owner,name:$name){ discussion(number:$number){ id } }
    }`, { owner, name, number: discussionNumber });
  return data.repository.discussion.id;
}

async function addDiscussionCommentGQL(token, discussionId, bodyStr) {
  await ghGraphQL(token, `
    mutation($id:ID!,$body:String!){
      addDiscussionComment(input:{discussionId:$id,body:$body}){ clientMutationId }
    }`, { id: discussionId, body: bodyStr });
}

async function updateDiscussionCommentGQL(token, commentId, bodyStr) {
  await ghGraphQL(token, `
    mutation($cid:ID!,$body:String!){
      updateDiscussionComment(input:{commentId:$cid,body:$body}){ clientMutationId }
    }`, { cid: commentId, body: bodyStr });
}

async function deleteDiscussionCommentGQL(token, commentId) {
  await ghGraphQL(token, `
    mutation($cid:ID!){ deleteDiscussionComment(input:{id:$cid}){ clientMutationId } }`,
    { cid: commentId });
}

async function deleteDiscussionGQL(token, discussionNodeId) {
  await ghGraphQL(token, `
    mutation($id:ID!){ deleteDiscussion(input:{id:$id}){ clientMutationId } }`,
    { id: discussionNodeId });
}

// Minimal helper to talk to GitHub GraphQL v4 when a REST preview
// endpoint is missing or returns 404.  We keep it local to this file so
// the rest of SkyGit can stay on the REST API.
async function ghGraphQL(token, query, variables = {}) {
  const res = await fetch(`${BASE_API}/graphql`, {
    method: 'POST',
    headers: {
      Authorization: `bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query, variables })
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GraphQL API error (${res.status}): ${text}`);
  }
  const json = await res.json();
  if (json.errors && json.errors.length) {
    throw new Error(`GraphQL API returned errors: ${JSON.stringify(json.errors)}`);
  }
  return json.data;
}


// Helper: Get or create the SkyGit Presence Channel discussion
// Cache discussion number per repo in localStorage to avoid race-conditions
function cacheKey(repoFullName) {
  return `skygit_presence_discussion_${repoFullName}`;
}

async function getOrCreatePresenceDiscussion(token, repoFullName, cleanupMode = false) {
  // 1. cached value?
  if (!cleanupMode && typeof window !== 'undefined') {
    const cached = localStorage.getItem(cacheKey(repoFullName));
    if (cached) {
      // verify it still exists (in case user deleted discussion manually)
      try {
        const res = await fetch(`${BASE_API}/repos/${repoFullName}/discussions/${cached}`, {
          headers: { Authorization: `token ${token}` },
        });
        if (res.ok) {
          return Number(cached);
        }
        // no longer exists – purge cache
        localStorage.removeItem(cacheKey(repoFullName));
      } catch (_) {
        /* network error – fallthrough to standard path */
      }
    }
  }
  const headers = {
    Authorization: `token ${token}`,
    /*
     * For Discussions endpoints we must request the **inertia** preview
     * or GitHub responds with 404 as if the route does not exist.
     */
    Accept: 'application/vnd.github+json, application/vnd.github.inertia-preview+json, application/vnd.github.squirrel-girl-preview+json'
  };
  const discussionsUrl = `${BASE_API}/repos/${repoFullName}/discussions?per_page=100`;
  let discussions = [];
  try {
    let page = 1;
    while (true) {
      const res = await fetch(`${discussionsUrl}&page=${page}`, { headers });
      if (!res.ok) break;
      const arr = await res.json();
      discussions = discussions.concat(arr);
      if (arr.length < 100) break;
      page++;
    }
  } catch (_) {
    // ignore errors listing discussions, proceed to creation
  }
  const presenceList = discussions.filter(d => d.title === 'SkyGit Presence Channel');
  if (presenceList.length) {
    const chosen = presenceList[0];
    if (cleanupMode && presenceList.length > 1) {
      for (const dup of presenceList.slice(1)) {
        try {
          await deleteDiscussionGQL(token, dup.node_id);
        } catch (_) {}
      }
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem(cacheKey(repoFullName), chosen.number);
    }
    return chosen.number;
  }
  // We need a category to create a discussion. Fetch existing categories and
  // pick the first (usually "General"). The Discussions REST API requires the
  // numeric `category_id` field – without it the request will fail with
  // validation error 422.
  // ---------------- REST attempt -----------------------------
  let categoryId;
  try {
    const categoriesRes = await fetch(`${BASE_API}/repos/${repoFullName}/discussions/categories`, { headers });
    if (categoriesRes.ok) {
      const categories = await categoriesRes.json();
      if (categories.length) {
        categoryId = categories.find(c => c.slug === 'general')?.id || categories[0].id;
      }
    }
  } catch (_) {
    /* ignored – we'll try GraphQL next */
  }

  // ---------------- GraphQL fallback -------------------------
  if (!categoryId) {
    const [owner, name] = repoFullName.split('/');
    try {
      const data = await ghGraphQL(token, `
        query($owner:String!,$name:String!){
          repository(owner:$owner,name:$name){
            discussionCategories(first:50){ nodes{ id slug name } }
          }
        }`, { owner, name });
      const cats = data.repository.discussionCategories.nodes;
      if (cats.length) {
        const general = cats.find(c => c.slug === 'general');
        categoryId = (general || cats[0]).id; // GraphQL global id
      }
    } catch (e) {
      console.warn('[SkyGit][Presence] GraphQL categories fallback failed', e);
    }
  }

  if (!categoryId) {
    throw new Error('Failed to resolve a discussion category id');
  }

  // Create new discussion under the chosen category
  // If categoryId is a global GraphQL node id (starts with "DIC_"), we
  // must create the discussion via GraphQL; the REST endpoint only
  // accepts numeric ids.
  if (typeof categoryId === 'string' && categoryId.startsWith('DIC_')) {
    const [owner, name] = repoFullName.split('/');
    const mutation = `
      mutation($repoId:ID!,$catId:ID!,$title:String!,$body:String!){
        createDiscussion(input:{repositoryId:$repoId,categoryId:$catId,title:$title,body:$body}){
          discussion{ number }
        }
      }`;
    // Need repositoryId too
    const repoData = await ghGraphQL(token, `query($owner:String!,$name:String!){repository(owner:$owner,name:$name){id}}`, { owner, name });
    const repoId = repoData.repository.id;
    const data = await ghGraphQL(token, mutation, {
      repoId,
      catId: categoryId,
      title: 'SkyGit Presence Channel',
      body: 'Discussion used by SkyGit for presence signaling. Safe to ignore.'
    });
    return cacheReturn(data.createDiscussion.discussion.number);
  }

  function cacheReturn(num) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(cacheKey(repoFullName), num);
    }
    return num;
  }

  // Otherwise we have a numeric REST id – use REST to create.
  const createRes = await fetch(discussionsUrl, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'SkyGit Presence Channel',
      body: 'Discussion used by SkyGit for presence signaling. Safe to ignore.',
      category_id: categoryId
    })
  });
  if (!createRes.ok) {
    if (createRes.status === 422 || createRes.status === 409) {
      // Likely another tab created it simultaneously. Fetch again.
      const retryRes = await fetch(discussionsUrl, { headers });
      if (retryRes.ok) {
        const list = await retryRes.json();
        const found = list.find(d => d.title === 'SkyGit Presence Channel');
        if (found) return cacheReturn(found.number);
      }
    }
    throw new Error('Failed to create presence discussion');
  }
  const created = await createRes.json();
  return cacheReturn(created.number);
}

// Helper: Deep compare two presence objects (ignore last_seen)
function presenceEquals(a, b) {
  const omit = o => {
    const { last_seen, ...rest } = o;
    return rest;
  };
  return JSON.stringify(omit(a)) === JSON.stringify(omit(b));
}

// Post or update presence comment (with minimal updates)
async function postPresenceComment(token, repoFullName, username, sessionId, signaling_info = null, cleanupMode = false) {
  const discussionNumber = await getOrCreatePresenceDiscussion(token, repoFullName, cleanupMode);
  const headers = {
    Authorization: `token ${token}`,
    Accept: 'application/vnd.github+json, application/vnd.github.inertia-preview+json, application/vnd.github.squirrel-girl-preview+json'
  };
  const commentsUrl = `${BASE_API}/repos/${repoFullName}/discussions/${discussionNumber}/comments`;

  // Lazily fetch and cache the discussion node ID for GraphQL mutations.
  let cachedDiscussionId = null;
  async function discussionId() {
    if (cachedDiscussionId) return cachedDiscussionId;
    cachedDiscussionId = await getDiscussionNodeId(token, repoFullName, discussionNumber);
    return cachedDiscussionId;
  }
  const now = new Date().toISOString();
  // Determine join timestamp: preserve original for updates
  let join_timestamp = now;
  // Fetch existing comments to detect prior join time
  let res = await fetch(commentsUrl, { headers });
  let comments = [];
  if (!res.ok && res.status === 404) {
    clearCachedDiscussion(repoFullName);
    const freshNum = await getOrCreatePresenceDiscussion(token, repoFullName, cleanupMode);
    if (freshNum !== discussionNumber) {
      discussionNumber = freshNum;
      cachedDiscussionId = null;
      res = await fetch(`${BASE_API}/repos/${repoFullName}/discussions/${discussionNumber}/comments`, { headers });
    }
  }
  if (res.ok) {
    comments = await res.json();
  }

  // Resolve the browser-context ID before it is first used below to avoid TDZ errors.
  const contextId = getContextId();

  // Try cached comment id first (skips the list delay burst)
  let cacheId = null;
  if (typeof window !== 'undefined') {
    cacheId = localStorage.getItem(commentCacheKey());
  }
  if (cacheId && !comments.some(c => String(c.id) === cacheId)) {
    // Fetch the specific comment to verify it still exists
    try {
      const cRes = await fetch(`${BASE_API}/repos/${repoFullName}/discussions/comments/${cacheId}`, { headers });
      if (cRes.ok) {
        const single = await cRes.json();
        comments.push(single);
      } else {
        // remove stale cache
        if (typeof window !== 'undefined') localStorage.removeItem(commentCacheKey());
        cacheId = null;
      }
    } catch (_) {
      /* network error: ignore */
    }
  }
  // ---- Per-context comment cache helpers ----
  function commentCacheKey() {
    return `skygit_presence_comment_${repoFullName}_${contextId}`;
  }

  // Collect all comments created by this browser context (identified by context_id)
  const myComments = comments.filter(c => {
    try {
      const body = JSON.parse(c.body);
      return body.username === username && body.context_id === contextId;
    } catch { return false; }
  });

  // Prefer a comment matching the current session
  const myComment = myComments.find(c => {
    try { return JSON.parse(c.body).session_id === sessionId; } catch { return false; }
  });

  if (myComment) {
    try {
      const existing = JSON.parse(myComment.body);
      if (existing.join_timestamp) {
        join_timestamp = existing.join_timestamp;
      }
    } catch {}
  }
  const presenceBody = {
    username,
    context_id: contextId,
    session_id: sessionId,
    join_timestamp,
    last_seen: now,
    signaling_info
  };


  let shouldUpdate = false;
  if (myComment) {
    // Only update if not equal (ignoring last_seen), or >30s since last_seen
    let existing;
    try { existing = JSON.parse(myComment.body); } catch (e) { existing = {}; }
    const lastSeenGap = Math.abs(new Date(now) - new Date(existing.last_seen));
    if (!presenceEquals(existing, presenceBody) || lastSeenGap > 30000) {
      shouldUpdate = true;
    }
  }

  if (myComment && shouldUpdate) {
    // Prefer GraphQL update; REST fallback only if GraphQL fails.
    try {
      await updateDiscussionCommentGQL(token, myComment.node_id, JSON.stringify(presenceBody));
      if (typeof window !== 'undefined') localStorage.setItem(commentCacheKey(), String(myComment.id));
    } catch (e) {
      const updateUrl = `${commentsUrl}/${myComment.id}`;
      await fetch(updateUrl, {
        method: 'PATCH',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: JSON.stringify(presenceBody) })
      });
      if (typeof window !== 'undefined') localStorage.setItem(commentCacheKey(), String(myComment.id));
    }
    if (!unloadRegistered) registerBeforeUnload(repoFullName, myComment.id);
  } else if (!myComment) {
    // Post new comment – GraphQL first.
    try {
      const did = await discussionId();
      await addDiscussionCommentGQL(token, did, JSON.stringify(presenceBody));
      // Re-fetch to obtain the id so we can cache it
      const listRes = await fetch(commentsUrl, { headers });
      if (listRes.ok) {
        const list = await listRes.json();
        const created = list.find(c => {
          try {
            const body = JSON.parse(c.body);
            return body.session_id === sessionId && body.context_id === contextId;
          } catch { return false; }
        });
        if (created && typeof window !== 'undefined') {
          localStorage.setItem(commentCacheKey(), String(created.id));
          if (!unloadRegistered) registerBeforeUnload(repoFullName, created.id);
        }
      }
    } catch (_) {
      // GraphQL failed (unlikely) – fall back to REST
      await fetch(commentsUrl, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: JSON.stringify(presenceBody) })
      });
      // REST returns the created comment with id – cache it
      try {
        const created = await fetch(commentsUrl + '?per_page=1', { headers });
        if (created.ok) {
          const arr = await created.json();
          if (arr.length && typeof window !== 'undefined') {
            localStorage.setItem(commentCacheKey(), String(arr[0].id));
          }
        }
      } catch (_) {}
    }
  }

  // Remove stale comments for this browser context so only one remains.
  // (Keep comments from the same user but other contexts.)
  const tenMin = 10 * 60 * 1000;
  for (const c of myComments) {
    if (myComment && c.id === myComment.id) continue;
    try {
      const body = JSON.parse(c.body);
      const age = Date.now() - new Date(body.last_seen || body.join_timestamp).getTime();
      if (age > tenMin) {
        await deleteDiscussionCommentGQL(token, c.node_id);
        if (typeof window !== 'undefined' && cacheId === String(c.id)) {
          localStorage.removeItem(commentCacheKey());
        }
      }
    } catch (_) {}
  }
}

// ---------------- beforeunload util ---------------------
function registerBeforeUnload(repoFullName, commentId) {
  if (typeof window === 'undefined' || unloadRegistered) return;
  unloadRegistered = true;
  window.addEventListener('beforeunload', () => {
    const url = `${BASE_API}/repos/${repoFullName}/discussions/comments/${commentId}`;
    const bodyData = { body: JSON.stringify({ left_at: new Date().toISOString() }) };
    fetch(url, {
      method: 'PATCH',
      headers: {
        Authorization: `token ${localStorage.getItem('skygit_token') || ''}`,
        Accept: 'application/vnd.github+json, application/vnd.github.inertia-preview+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bodyData),
      keepalive: true,
    }).catch(() => {});
  });
}

// Mark another peer's comment for removal
export async function markPeerForPendingRemoval(token, repoFullName, peerUsername, peerSessionId, removerUsername, cleanupMode = false) {
  const discussionNumber = await getOrCreatePresenceDiscussion(token, repoFullName, cleanupMode);
  const headers = {
    Authorization: `token ${token}`,
    Accept: 'application/vnd.github+json, application/vnd.github.inertia-preview+json, application/vnd.github.squirrel-girl-preview+json'
  };
  const commentsUrl = `${BASE_API}/repos/${repoFullName}/discussions/${discussionNumber}/comments`;
  let res = await fetch(commentsUrl, { headers });
  if (!res.ok && res.status === 404) {
    clearCachedDiscussion(repoFullName);
    const freshNum = await getOrCreatePresenceDiscussion(token, repoFullName, cleanupMode);
    if (freshNum !== discussionNumber) {
      discussionNumber = freshNum;
      res = await fetch(`${BASE_API}/repos/${repoFullName}/discussions/${discussionNumber}/comments`, { headers });
    }
  }
  if (!res.ok) return;
  const comments = await res.json();
  const peerComment = comments.find(c => {
    try {
      const body = JSON.parse(c.body);
      return body.username === peerUsername && body.session_id === peerSessionId;
    } catch (e) { return false; }
  });
  if (peerComment) {
    let body;
    try { body = JSON.parse(peerComment.body); } catch (e) { body = {}; }
    body.pendingRemovalBy = removerUsername;
    body.pendingRemovalAt = new Date().toISOString();
    try {
      await updateDiscussionCommentGQL(token, peerComment.node_id, JSON.stringify(body));
    } catch (_) {
      const updateUrl = `${commentsUrl}/${peerComment.id}`;
      await fetch(updateUrl, {
        method: 'PATCH',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: JSON.stringify(body) })
      });
    }
    console.debug('[SkyGit][Presence] marked peer for pending removal', peerUsername, peerSessionId);
  }
}

// Remove a peer's comment if pendingRemovalBy is set and not updated in 1min
export async function cleanupStalePeerPresence(token, repoFullName, peerUsername, peerSessionId, cleanupMode = false) {
  const discussionNumber = await getOrCreatePresenceDiscussion(token, repoFullName, cleanupMode);
  const headers = {
    Authorization: `token ${token}`,
    Accept: 'application/vnd.github+json, application/vnd.github.inertia-preview+json, application/vnd.github.squirrel-girl-preview+json'
  };
  const commentsUrl = `${BASE_API}/repos/${repoFullName}/discussions/${discussionNumber}/comments`;
  let res = await fetch(commentsUrl, { headers });
  if (!res.ok && res.status === 404) {
    clearCachedDiscussion(repoFullName);
    const freshNum = await getOrCreatePresenceDiscussion(token, repoFullName, cleanupMode);
    if (freshNum !== discussionNumber) {
      discussionNumber = freshNum;
      res = await fetch(`${BASE_API}/repos/${repoFullName}/discussions/${discussionNumber}/comments`, { headers });
    }
  }
  if (!res.ok) return;
  const comments = await res.json();
  const peerComment = comments.find(c => {
    try {
      const body = JSON.parse(c.body);
      return body.username === peerUsername && body.session_id === peerSessionId;
    } catch (e) { return false; }
  });
  if (peerComment) {
    let body;
    try { body = JSON.parse(peerComment.body); } catch (e) { body = {}; }
    if (body.pendingRemovalBy && body.pendingRemovalAt) {
      const age = Date.now() - new Date(body.pendingRemovalAt).getTime();
      if (age > 60000) { // 1 min
        try {
          await deleteDiscussionCommentGQL(token, peerComment.node_id);
        } catch (_) {
          const delUrl = `${commentsUrl}/${peerComment.id}`;
          await fetch(delUrl, { method: 'DELETE', headers });
        }
        console.debug('[SkyGit][Presence] deleted stale peer presence', peerUsername, peerSessionId);
      }
    }
  }
}

// Poll presence from discussion comments
async function pollPresenceFromDiscussion(token, repoFullName, cleanupMode = false) {
  const discussionNumber = await getOrCreatePresenceDiscussion(token, repoFullName, cleanupMode);
  const headers = {
    Authorization: `token ${token}`,
    Accept: 'application/vnd.github+json, application/vnd.github.squirrel-girl-preview+json'
  };
  const commentsUrl = `${BASE_API}/repos/${repoFullName}/discussions/${discussionNumber}/comments`;
  let res = await fetch(commentsUrl, { headers });
  if (!res.ok && res.status === 404) {
    clearCachedDiscussion(repoFullName);
    const freshNum = await getOrCreatePresenceDiscussion(token, repoFullName, cleanupMode);
    if (freshNum !== discussionNumber) {
      discussionNumber = freshNum;
      res = await fetch(`${BASE_API}/repos/${repoFullName}/discussions/${discussionNumber}/comments`, { headers });
    }
  }
  if (!res.ok) {
    console.warn('[SkyGit][Presence] pollPresenceFromDiscussion failed', res.status, res.statusText);
    return [];
  }
  const comments = await res.json();
  // Parse presence info from comments
  const now = Date.now();
  const presence = comments.map(c => {
    try {
      return JSON.parse(c.body);
    } catch (e) {
      return null;
    }
  }).filter(Boolean).filter(p => p.last_seen && (now - new Date(p.last_seen).getTime() < 2 * 60 * 1000));
  console.log('[SkyGit][Presence] pollPresenceFromDiscussion got peers', presence);
  return presence;
}

// Refactor postHeartbeat to use discussion comments
export async function postHeartbeat(token, repoFullName, username, sessionId, signaling_info = null, cleanupMode = false) {
  await postPresenceComment(token, repoFullName, username, sessionId, signaling_info, cleanupMode);
}

// Refactor pollPresence to use discussion comments
export async function pollPresence(token, repoFullName, cleanupMode = false) {
  return await pollPresenceFromDiscussion(token, repoFullName, cleanupMode);
}

// Delete the current browser's presence comment on GitHub and clear cache
export async function deleteOwnPresenceComment(token, repoFullName) {
  if (typeof window === 'undefined') return;
  const key = `skygit_presence_comment_${repoFullName}_${getContextId()}`;
  const commentId = localStorage.getItem(key);
  if (!commentId) return;
  const headers = {
    Authorization: `token ${token}`,
    Accept:
      'application/vnd.github+json, application/vnd.github.inertia-preview+json, application/vnd.github.squirrel-girl-preview+json'
  };
  try {
    await fetch(
      `${BASE_API}/repos/${repoFullName}/discussions/comments/${commentId}`,
      { method: 'DELETE', headers }
    );
  } catch (e) {
    console.warn('[SkyGit][Presence] failed to delete own presence comment', e);
  }
  localStorage.removeItem(key);
}
