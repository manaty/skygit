// repoPresence.js
// Handles presence heartbeats and polling via GitHub Discussions comments

// For simplicity, we'll use GitHub Discussions comments. 

const BASE_API = 'https://api.github.com';


// Helper: Get or create the SkyGit Presence Channel discussion
async function getOrCreatePresenceDiscussion(token, repoFullName) {
  const headers = {
    Authorization: `token ${token}`,
    // Include Discussions preview media type
    Accept: 'application/vnd.github+json, application/vnd.github.squirrel-girl-preview+json'
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
  // Create new discussion
  const createRes = await fetch(discussionsUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      title: 'SkyGit Presence Channel',
      body: 'Discussion used by SkyGit for presence signaling. Safe to ignore.'
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
    Accept: 'application/vnd.github+json, application/vnd.github.squirrel-girl-preview+json'
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
      headers,
      body: JSON.stringify({ body: JSON.stringify(presenceBody) })
    });
    console.log('[SkyGit][Presence] updated presence comment', updateRes.status, updateRes.statusText);
  } else if (!myComment) {
    // 3. Post a new comment
    const postRes = await fetch(commentsUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({ body: JSON.stringify(presenceBody) })
    });
    console.log('[SkyGit][Presence] posted new presence comment', postRes.status, postRes.statusText);
  }

  // Clean up old session comments for this user
  for (const c of comments) {
    try {
      const body = JSON.parse(c.body);
      if (body.username === username && body.session_id !== sessionId) {
        const delUrl = `${commentsUrl}/${c.id}`;
        await fetch(delUrl, { method: 'DELETE', headers });
        console.log('[SkyGit][Presence] deleted old presence comment', c.id);
      }
    } catch (e) {}
  }
}

// Mark another peer's comment for removal
export async function markPeerForPendingRemoval(token, repoFullName, peerUsername, peerSessionId, removerUsername) {
  const discussionNumber = await getOrCreatePresenceDiscussion(token, repoFullName);
  const headers = {
    Authorization: `token ${token}`,
    Accept: 'application/vnd.github+json, application/vnd.github.squirrel-girl-preview+json'
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
      headers,
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
    Accept: 'application/vnd.github+json, application/vnd.github.squirrel-girl-preview+json'
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
