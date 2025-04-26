// repoPresence.js
// Handles presence heartbeats and polling via GitHub Discussions comments

// For simplicity, we'll use GitHub Discussions comments. 

const BASE_API = 'https://api.github.com';

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
async function getOrCreatePresenceDiscussion(token, repoFullName) {
  const headers = {
    Authorization: `token ${token}`,
    /*
     * For Discussions endpoints we must request the **inertia** preview
     * or GitHub responds with 404 as if the route does not exist.
     */
    Accept: 'application/vnd.github+json, application/vnd.github.inertia-preview+json, application/vnd.github.squirrel-girl-preview+json'
  };
  const discussionsUrl = `${BASE_API}/repos/${repoFullName}/discussions`;
  let discussions = [];
  try {
    const res = await fetch(discussionsUrl, { headers });
    if (res.ok) {
      discussions = await res.json();
    }
  } catch (_) {
    // ignore errors listing discussions, proceed to creation
  }
  // Look for existing presence channel
  const existing = discussions.find(d => d.title === 'SkyGit Presence Channel');
  if (existing) {
    return existing.number;
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
    return data.createDiscussion.discussion.number;
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
    throw new Error('Failed to create presence discussion');
  }
  const created = await createRes.json();
  return created.number;
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
async function postPresenceComment(token, repoFullName, username, sessionId, signaling_info = null) {
  const discussionNumber = await getOrCreatePresenceDiscussion(token, repoFullName);
  const headers = {
    Authorization: `token ${token}`,
    Accept: 'application/vnd.github+json, application/vnd.github.inertia-preview+json, application/vnd.github.squirrel-girl-preview+json'
  };
  const commentsUrl = `${BASE_API}/repos/${repoFullName}/discussions/${discussionNumber}/comments`;
  const now = new Date().toISOString();
  // Determine join timestamp: preserve original for updates
  let join_timestamp = now;
  // Fetch existing comments to detect prior join time
  const res = await fetch(commentsUrl, { headers });
  let comments = [];
  if (res.ok) {
    comments = await res.json();
  }
  // Find if a comment for this session already exists
  const myComment = comments.find(c => {
    try {
      const body = JSON.parse(c.body);
      return body.username === username && body.session_id === sessionId;
    } catch (e) { return false; }
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
    const updateUrl = `${commentsUrl}/${myComment.id}`;
    const updateRes = await fetch(updateUrl, {
      method: 'PATCH',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: JSON.stringify(presenceBody) })
    });
    // console.debug('[SkyGit][Presence] updated presence comment', updateRes.status);
  } else if (!myComment) {
    // 3. Post a new comment (REST first, GraphQL fallback)
    const bodyJson = JSON.stringify({ body: JSON.stringify(presenceBody) });
    const postRes = await fetch(commentsUrl, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: bodyJson
    });

    if (!postRes.ok && postRes.status === 404) {
      // Some repos still 404 on the REST comments endpoint; fall back to
      // GraphQL addDiscussionComment.
      try {
        const [owner, name] = repoFullName.split('/');
        // 1. Get discussion node id
        const q1 = `query($owner:String!,$name:String!,$number:Int!){
          repository(owner:$owner,name:$name){ discussion(number:$number){ id } }
        }`;
        const d1 = await ghGraphQL(token, q1, { owner, name, number: discussionNumber });
        const discId = d1.repository.discussion.id;
        // 2. Add comment
        const mut = `mutation($id:ID!,$body:String!){
          addDiscussionComment(input:{discussionId:$id,body:$body}){ clientMutationId }
        }`;
        await ghGraphQL(token, mut, { id: discId, body: JSON.stringify(presenceBody) });
        console.log('[SkyGit][Presence] posted presence via GraphQL');
      } catch (e) {
        console.warn('[SkyGit][Presence] GraphQL comment fallback failed', e);
      }
    } else {
      // console.debug('[SkyGit][Presence] posted presence comment', postRes.status);
    }
  }

  // Clean up old session comments for this user
  for (const c of comments) {
    try {
      const body = JSON.parse(c.body);
      if (body.username === username && body.session_id !== sessionId) {
        const delUrl = `${commentsUrl}/${c.id}`;
        await fetch(delUrl, { method: 'DELETE', headers });
        // console.debug('[SkyGit][Presence] deleted old presence comment', c.id);
      }
    } catch (e) {}
  }
}

// Mark another peer's comment for removal
export async function markPeerForPendingRemoval(token, repoFullName, peerUsername, peerSessionId, removerUsername) {
  const discussionNumber = await getOrCreatePresenceDiscussion(token, repoFullName);
  const headers = {
    Authorization: `token ${token}`,
    Accept: 'application/vnd.github+json, application/vnd.github.inertia-preview+json, application/vnd.github.squirrel-girl-preview+json'
  };
  const commentsUrl = `${BASE_API}/repos/${repoFullName}/discussions/${discussionNumber}/comments`;
  const res = await fetch(commentsUrl, { headers });
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
    const updateUrl = `${commentsUrl}/${peerComment.id}`;
    await fetch(updateUrl, {
      method: 'PATCH',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: JSON.stringify(body) })
    });
    console.log('[SkyGit][Presence] marked peer for pending removal', peerUsername, peerSessionId);
  }
}

// Remove a peer's comment if pendingRemovalBy is set and not updated in 1min
export async function cleanupStalePeerPresence(token, repoFullName, peerUsername, peerSessionId) {
  const discussionNumber = await getOrCreatePresenceDiscussion(token, repoFullName);
  const headers = {
    Authorization: `token ${token}`,
    Accept: 'application/vnd.github+json, application/vnd.github.inertia-preview+json, application/vnd.github.squirrel-girl-preview+json'
  };
  const commentsUrl = `${BASE_API}/repos/${repoFullName}/discussions/${discussionNumber}/comments`;
  const res = await fetch(commentsUrl, { headers });
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
        const delUrl = `${commentsUrl}/${peerComment.id}`;
        await fetch(delUrl, { method: 'DELETE', headers });
        console.log('[SkyGit][Presence] deleted stale peer presence', peerUsername, peerSessionId);
      }
    }
  }
}

// Poll presence from discussion comments
async function pollPresenceFromDiscussion(token, repoFullName) {
  const discussionNumber = await getOrCreatePresenceDiscussion(token, repoFullName);
  const headers = {
    Authorization: `token ${token}`,
    Accept: 'application/vnd.github+json, application/vnd.github.squirrel-girl-preview+json'
  };
  const commentsUrl = `${BASE_API}/repos/${repoFullName}/discussions/${discussionNumber}/comments`;
  const res = await fetch(commentsUrl, { headers });
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
export async function postHeartbeat(token, repoFullName, username, sessionId, signaling_info = null) {
  await postPresenceComment(token, repoFullName, username, sessionId, signaling_info);
}

// Refactor pollPresence to use discussion comments
export async function pollPresence(token, repoFullName) {
  return await pollPresenceFromDiscussion(token, repoFullName);
}
