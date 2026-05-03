import {
  buildPersistedRepoPath,
  buildSkyGitConfigContentsUrl,
  encodeJsonBase64,
  getGitHubHeaders
} from './githubApiCore.js';
import { getGitHubUsername } from './githubSkyGitRepoService.js';

const pendingGitHubWrites = new Map();
const lastGitHubPayloads = new Map();

export function createRepoCommitBody(repo, content, sha = null) {
  return {
    message: `Update repo ${repo.full_name}`,
    content,
    ...(sha && { sha })
  };
}

export function getPendingGitHubWrite(key) {
  return pendingGitHubWrites.get(key);
}

export function setPendingGitHubWrite(key, promise) {
  pendingGitHubWrites.set(key, promise);
}

export function clearPendingGitHubWrite(key) {
  pendingGitHubWrites.delete(key);
}

export function getLastGitHubPayload(key) {
  return lastGitHubPayloads.get(key);
}

export function setLastGitHubPayload(key, content) {
  lastGitHubPayloads.set(key, content);
}

export async function commitRepoToGitHub(token, repo, maxRetries = 2) {
  const username = await getGitHubUsername(token);
  const filePath = buildPersistedRepoPath(repo);
  const inFlight = getPendingGitHubWrite(filePath);
  if (inFlight) return inFlight;

  const headers = getGitHubHeaders(token, { 'Content-Type': 'application/json' });
  const content = encodeJsonBase64(repo);

  if (getLastGitHubPayload(filePath) === content) {
    return;
  }

  let attempts = 0;
  let lastErr = null;

  const doCommitCore = async () => {
    while (attempts <= maxRetries) {
      let sha = null;
      try {
        const checkRes = await fetch(buildSkyGitConfigContentsUrl(username, filePath), { headers });
        if (checkRes.ok) {
          const existing = await checkRes.json();
          sha = existing.sha;
        }
      } catch (_) {
        // The later PUT carries the real failure state for callers.
      }

      const res = await fetch(buildSkyGitConfigContentsUrl(username, filePath), {
        method: 'PUT',
        headers,
        body: JSON.stringify(createRepoCommitBody(repo, content, sha)),
        keepalive: true
      });

      if (res.ok) {
        setLastGitHubPayload(filePath, content);
        return;
      }

      lastErr = await res.text();

      if (res.status === 409) {
        attempts += 1;
        continue;
      }

      break;
    }

    throw new Error(`GitHub commit failed: ${lastErr}`);
  };

  const promise = doCommitCore().finally(() => clearPendingGitHubWrite(filePath));
  setPendingGitHubWrite(filePath, promise);

  return promise;
}
