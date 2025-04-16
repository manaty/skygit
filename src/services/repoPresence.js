// repoPresence.js
// Handles presence heartbeats and polling via GitHub Discussions comments

// For simplicity, we'll use GitHub Discussions comments. 

const BASE_API = 'https://api.github.com';

// Helper: Get or create the SkyGit Presence Channel discussion
async function getOrCreatePresenceDiscussion(token, repoFullName) {
  const headers = {
    Authorization: `token ${token}`,
    Accept: 'application/vnd.github+json'
  };
  // List discussions
  const discussionsUrl = `${BASE_API}/repos/${repoFullName}/discussions`;
  const res = await fetch(discussionsUrl, { headers });
  if (!res.ok) throw new Error('Failed to list discussions');
  const discussions = await res.json();
  let discussion = discussions.find(d => d.title === 'SkyGit Presence Channel');
  if (discussion) return discussion.number;
  // Create if not found
  const createRes = await fetch(discussionsUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      title: 'SkyGit Presence Channel',
      body: 'Discussion used by SkyGit for presence signaling. Safe to ignore.'
    })
  });
  if (!createRes.ok) throw new Error('Failed to create presence discussion');
  const created = await createRes.json();
  return created.number;
}

// Post or update presence comment (one per session per user)
async function postPresenceComment(token, repoFullName, username, sessionId, signaling_info = null) {
  const discussionNumber = await getOrCreatePresenceDiscussion(token, repoFullName);
  const headers = {
    Authorization: `token ${token}`,
    Accept: 'application/vnd.github+json'
  };
  const commentsUrl = `${BASE_API}/repos/${repoFullName}/discussions/${discussionNumber}/comments`;
  const now = new Date().toISOString();
  const presenceBody = JSON.stringify({ username, session_id: sessionId, last_seen: now, signaling_info });

  // 1. Find if a comment for this session already exists (by this user)
  const res = await fetch(commentsUrl, { headers });
  let comments = [];
  if (res.ok) {
    comments = await res.json();
  }
  // Try to find a comment by this username+sessionId
  const myComment = comments.find(c => {
    try {
      const body = JSON.parse(c.body);
      return body.username === username && body.session_id === sessionId;
    } catch (e) { return false; }
  });

  if (myComment) {
    // 2. Update the comment
    const updateUrl = `${commentsUrl}/${myComment.id}`;
    const updateRes = await fetch(updateUrl, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ body: presenceBody })
    });
    console.log('[SkyGit][Presence] updated presence comment', updateRes.status, updateRes.statusText);
  } else {
    // 3. Post a new comment
    const postRes = await fetch(commentsUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({ body: presenceBody })
    });
    console.log('[SkyGit][Presence] posted new presence comment', postRes.status, postRes.statusText);
  }

  // 4. Optionally, clean up old comments by this user (other sessions)
  for (const c of comments) {
    try {
      const body = JSON.parse(c.body);
      if (body.username === username && body.session_id !== sessionId) {
        // Delete old session comments
        const delUrl = `${commentsUrl}/${c.id}`;
        await fetch(delUrl, { method: 'DELETE', headers });
        console.log('[SkyGit][Presence] deleted old presence comment', c.id);
      }
    } catch (e) {}
  }
}

// Poll presence from discussion comments
async function pollPresenceFromDiscussion(token, repoFullName) {
  const discussionNumber = await getOrCreatePresenceDiscussion(token, repoFullName);
  const headers = {
    Authorization: `token ${token}`,
    Accept: 'application/vnd.github+json'
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
