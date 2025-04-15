// repoPresence.js
// Handles presence heartbeats and polling via GitHub Discussions or .messages/presence.json

// For simplicity, we'll use .messages/presence.json. You can adapt to use Discussions if needed.

const BASE_API = 'https://api.github.com';

export async function postHeartbeat(token, repoFullName, username, sessionId, signaling_info = null) {
  const headers = {
    Authorization: `token ${token}`,
    Accept: 'application/vnd.github+json'
  };
  const path = `.messages/presence.json`;
  const url = `${BASE_API}/repos/${repoFullName}/contents/${path}`;

  // Get existing presence data
  let presence = [];
  let sha = null;
  const res = await fetch(url, { headers });
  if (res.ok) {
    const meta = await res.json();
    sha = meta.sha;
    try {
      presence = JSON.parse(atob(meta.content));
    } catch (e) { presence = []; }
  }

  // Update or add our own heartbeat
  const now = new Date().toISOString();
  const idx = presence.findIndex(p => p.username === username && p.session_id === sessionId);
  const entry = { username, session_id: sessionId, last_seen: now, signaling_info };
  if (idx >= 0) presence[idx] = entry;
  else presence.push(entry);

  // Remove old entries (older than 2min)
  const cutoff = Date.now() - 2 * 60 * 1000;
  presence = presence.filter(p => new Date(p.last_seen).getTime() > cutoff);

  // Save back to GitHub
  const content = btoa(JSON.stringify(presence, null, 2));
  const body = { message: 'Update presence', content };
  if (sha) body.sha = sha;
  await fetch(url, {
    method: 'PUT',
    headers,
    body: JSON.stringify(body)
  });
}

export async function pollPresence(token, repoFullName) {
  const headers = {
    Authorization: `token ${token}`,
    Accept: 'application/vnd.github+json'
  };
  const path = `.messages/presence.json`;
  const url = `${BASE_API}/repos/${repoFullName}/contents/${path}`;
  const res = await fetch(url, { headers });
  if (!res.ok) return [];
  const meta = await res.json();
  try {
    return JSON.parse(atob(meta.content));
  } catch {
    return [];
  }
}
