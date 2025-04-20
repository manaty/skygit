// githubSignaling.js
// Signaling via GitHub Discussions for WebRTC (ICE, offer, answer)

import { getGitHubUsername } from './githubApi.js';

const BASE_API = 'https://api.github.com';

/**
 * Returns discussion #1 unconditionally – we rely on an existing
 * "General" discussion with id 1 in every repository to act as the
 * signaling hub. No creation logic, which avoids extra API calls and
 * permissions.
 */
// From now on we keep signaling ultra‑simple: every repository will use
// discussion #1 as the shared signaling channel. We no longer create one
// per conversation.

export async function ensureSignalingDiscussion(_token, repoFullName, _conversationId) {
  return { id: 1, url: `${BASE_API}/repos/${repoFullName}/discussions/1` };
}

/**
 * Post a signaling message (ICE/SDP) as a comment in the discussion.
 */
export async function postSignal(token, repoFullName, conversationId, signalData) {
  const { id } = await ensureSignalingDiscussion(token, repoFullName, conversationId);
  const headers = {
    Authorization: `token ${token}`,
    Accept: 'application/vnd.github+json'
  };
  const commentsUrl = `${BASE_API}/repos/${repoFullName}/discussions/${id}/comments`;
  const body = JSON.stringify({
    body: `SKYGIT_SIGNAL\n${btoa(JSON.stringify(signalData))}`
  });
  const res = await fetch(commentsUrl, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body
  });
  if (!res.ok) throw new Error('Failed to post signal');
  return await res.json();
}

/**
 * Poll for new signaling messages (returns array of decoded signal objects).
 * Optionally pass sinceCommentId to only fetch newer comments.
 */
export async function pollSignals(token, repoFullName, conversationId, sinceCommentId = null) {
  const { id } = await ensureSignalingDiscussion(token, repoFullName, conversationId);
  const headers = {
    Authorization: `token ${token}`,
    Accept: 'application/vnd.github+json'
  };
  const commentsUrl = `${BASE_API}/repos/${repoFullName}/discussions/${id}/comments`;
  const res = await fetch(commentsUrl, { headers });
  if (!res.ok) throw new Error('Failed to fetch signaling comments');
  const comments = await res.json();
  const filtered = sinceCommentId
    ? comments.filter(c => c.id > sinceCommentId)
    : comments;
  return filtered
    .filter(c => c.body.startsWith('SKYGIT_SIGNAL'))
    .map(c => {
      try {
        return {
          id: c.id,
          signal: JSON.parse(atob(c.body.split('\n')[1]))
        };
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}
