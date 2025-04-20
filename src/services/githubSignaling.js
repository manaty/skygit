// githubSignaling.js
// Signaling via GitHub Discussions for WebRTC (ICE, offer, answer)

import { getGitHubUsername } from './githubApi.js';

const BASE_API = 'https://api.github.com';

/**
 * Ensure a GitHub Discussion exists for signaling for a conversation.
 * Returns the discussion id and url.
 */
export async function ensureSignalingDiscussion(token, repoFullName, conversationId) {
  const headers = {
    Authorization: `token ${token}`,
    Accept: 'application/vnd.github+json'
  };

  // Find or create a discussion titled "SkyGit Signaling: <conversationId>"
  const discussionsUrl = `${BASE_API}/repos/${repoFullName}/discussions`;
  const res = await fetch(discussionsUrl, { headers });
  if (!res.ok) throw new Error('Failed to list discussions');
  const discussions = await res.json();
  let discussion = discussions.find(d => d.title === `SkyGit Signaling: ${conversationId}`);
  if (discussion) return { id: discussion.number, url: discussion.url };

  // Create if not found. First obtain an existing discussion category so we
  // can provide the mandatory `category_id` field – the REST API rejects
  // requests without it.

  const categoriesRes = await fetch(`${BASE_API}/repos/${repoFullName}/discussions/categories`, { headers });
  if (!categoriesRes.ok) throw new Error('Failed to fetch discussion categories');
  const categories = await categoriesRes.json();
  if (!categories.length) throw new Error('No discussion categories found');

  const categoryId = categories.find(c => c.slug === 'general')?.id || categories[0].id;

  const createRes = await fetch(discussionsUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      title: `SkyGit Signaling: ${conversationId}`,
      body: 'WebRTC signaling channel for SkyGit',
      category_id: categoryId
    })
  });
  if (!createRes.ok) throw new Error('Failed to create signaling discussion');
  const created = await createRes.json();
  return { id: created.number, url: created.url };
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
    headers,
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
