import { writable } from 'svelte/store';
import { commitRepoToGitHub } from '../services/githubApi.js';

const LOCAL_KEY = 'skygit_repos';
const COMMIT_DELAY = 5 * 60 * 1000; // 5 minutes
const BATCH_SIZE = 10;

let commitQueue = [];
let commitTimer = null;

// Load from localStorage on init
const saved = JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
export const repoList = writable(saved);
export const filteredCount = writable(0);
export const selectedRepo = writable(null);

// Keep localStorage in sync
repoList.subscribe((list) => {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(list));
});

export function queueRepoForCommit(repo) {
  // 1. Add to local repo list
  repoList.update((list) => {
    const exists = list.some((r) => r.full_name === repo.full_name);
    return exists ? list : [...list, repo];
  });

  // 2. Add to batch queue
  const alreadyQueued = commitQueue.some((r) => r.full_name === repo.full_name);
  if (!alreadyQueued) {
    commitQueue.push(repo);
  }

  // 3. Commit now if we hit batch size
  if (commitQueue.length >= BATCH_SIZE) {
    flushRepoCommitQueue();
    return;
  }

  // 4. Otherwise, schedule a flush
  if (!commitTimer) {
    commitTimer = setTimeout(flushRepoCommitQueue, COMMIT_DELAY);
  }
}

export async function flushRepoCommitQueue() {
  if (commitQueue.length === 0) return;

  const token = localStorage.getItem('skygit_token');
  if (!token) return;

  const batch = [...commitQueue];
  commitQueue = [];
  clearTimeout(commitTimer);
  commitTimer = null;

  for (const repo of batch) {
    try {
      await commitRepoToGitHub(token, repo);
      console.log('[SkyGit] Repo committed:', repo.full_name);
    } catch (err) {
      console.error('[SkyGit] Failed to commit repo:', repo.full_name, err);
    }
  }
}

export function syncRepoListFromGitHub(repoArray) {
    repoList.update((current) => {
      const currentMap = new Map(current.map((r) => [r.full_name, r]));
  
      for (const repo of repoArray) {
        currentMap.set(repo.full_name, repo); // overwrite or add
      }
  
      const merged = Array.from(currentMap.values());
      localStorage.setItem('skygit_repos', JSON.stringify(merged));
      return merged;
    });
  }

  export function hasPendingRepoCommits() {
    return commitQueue.length > 0;
  }
  