import { syncState } from '../stores/syncStateStore.js';
import { syncRepoListFromGitHub } from '../stores/repoStore.js';
import {
  buildPersistedRepoPath,
  buildSkyGitConfigContentsUrl,
  getGitHubHeaders
} from './githubApiCore.js';
import { getGitHubUsername } from './githubSkyGitRepoService.js';

export function filterGitHubJsonFiles(files) {
  return files.filter((file) => file.name.endsWith('.json'));
}

export function decodeGitHubJsonContent(content) {
  return JSON.parse(atob(content));
}

export async function streamPersistedReposFromGitHub(token) {
  const username = await getGitHubUsername(token);
  const path = buildSkyGitConfigContentsUrl(username, 'repositories');
  const headers = getGitHubHeaders(token);
  const res = await fetch(path, { headers });

  if (res.status === 404) {
    syncState.update((state) => ({
      ...state,
      phase: 'idle',
      loadedCount: 0,
      totalCount: 0,
      paused: true
    }));
    return;
  }

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to load repository list: ${error}`);
  }

  const files = await res.json();
  const jsonFiles = filterGitHubJsonFiles(files);

  syncState.update((state) => ({
    ...state,
    phase: 'streaming',
    loadedCount: 0,
    totalCount: jsonFiles.length,
    paused: false
  }));

  for (const file of jsonFiles) {
    let paused = false;
    syncState.subscribe((state) => (paused = state.paused))();
    if (paused) break;

    try {
      const contentRes = await fetch(file.url, { headers });
      if (!contentRes.ok) {
        console.warn(`[SkyGit] Skipped missing repo file: ${file.name} (${contentRes.status})`);
        continue;
      }

      const meta = await contentRes.json();
      const data = decodeGitHubJsonContent(meta.content);

      syncRepoListFromGitHub([data]);

      syncState.update((state) => ({
        ...state,
        loadedCount: state.loadedCount + 1
      }));
    } catch (error) {
      console.warn(`[SkyGit] Skipped malformed repo file: ${file.name}`, error);
      continue;
    }
  }

  syncState.update((state) => ({ ...state, phase: 'idle' }));
}

export async function streamPersistedConversationsFromGitHub(token) {
  const username = await getGitHubUsername(token);
  const url = buildSkyGitConfigContentsUrl(username, 'conversations');
  const headers = getGitHubHeaders(token);
  const res = await fetch(url, { headers });
  if (res.status === 404) return;

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to load conversations: ${error}`);
  }

  const files = await res.json();
  const jsonFiles = filterGitHubJsonFiles(files);
  const conversations = [];

  for (const file of jsonFiles) {
    const contentRes = await fetch(file.url, { headers });
    if (!contentRes.ok) continue;
    const meta = await contentRes.json();
    conversations.push(decodeGitHubJsonContent(meta.content));
  }

  return conversations;
}

export async function deleteRepoFromGitHub(token, repo) {
  const username = await getGitHubUsername(token);
  const path = buildPersistedRepoPath(repo);
  const headers = getGitHubHeaders(token);

  const res = await fetch(buildSkyGitConfigContentsUrl(username, path), { headers });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Unable to locate repo file for deletion: ${err}`);
  }

  const file = await res.json();
  const deleteRes = await fetch(buildSkyGitConfigContentsUrl(username, path), {
    method: 'DELETE',
    headers,
    body: JSON.stringify({
      message: `Remove repo ${repo.full_name}`,
      sha: file.sha
    })
  });

  if (!deleteRes.ok) {
    const err = await deleteRes.text();
    throw new Error(`Failed to delete repo file: ${err}`);
  }
}
