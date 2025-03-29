import { repoList, queueRepoForCommit } from '../stores/repoStore.js';
import { syncState } from '../stores/syncStateStore.js';

const headers = (token) => ({
  Authorization: `token ${token}`,
  Accept: 'application/vnd.github+json'
});
let cancelRequested = false;

export function cancelDiscovery() {
  cancelRequested = true;
}

export async function discoverAllRepos(token) {
  cancelRequested = false;

  const seen = new Set();
  const local = JSON.parse(localStorage.getItem('skygit_repos') || '[]').map((r) => r.full_name);
  const allRepos = [];

  const userRepos = await fetchAllPaginated('https://api.github.com/user/repos', headers(token));
  allRepos.push(...userRepos);

  const orgs = await fetchAllPaginated('https://api.github.com/user/orgs', headers(token));
  for (const org of orgs) {
    if (cancelRequested) return;
    const orgRepos = await fetchAllPaginated(`https://api.github.com/orgs/${org.login}/repos`, headers(token));
    allRepos.push(...orgRepos);
  }

  for (const repo of allRepos) {
    if (cancelRequested) return;

    const fullName = repo.full_name;
    if (seen.has(fullName) || local.includes(fullName)) continue;

    seen.add(fullName);
    const hasMessages = await checkMessagesDirectory(token, fullName);

    const enrichedRepo = {
      name: repo.name,
      owner: repo.owner.login,
      full_name: fullName,
      url: repo.html_url,
      private: repo.private,
      has_messages: hasMessages
    };

    queueRepoForCommit(enrichedRepo);
  }
  
  syncState.update((s) => ({ ...s, phase: 'idle' }));
}


function getLocalRepoFullNames() {
  let stored = localStorage.getItem('skygit_repos');
  if (!stored) return [];
  try {
    return JSON.parse(stored).map((r) => r.full_name);
  } catch {
    return [];
  }
}

async function fetchAllPaginated(url, headers) {
  let results = [];
  let page = 1;
  let done = false;

  while (!done) {
    const res = await fetch(`${url}?per_page=100&page=${page}`, { headers });
    const data = await res.json();
    if (res.ok && Array.isArray(data)) {
      results = results.concat(data);
      done = data.length < 100;
      page++;
    } else {
      done = true;
    }
  }

  return results;
}

async function checkMessagesDirectory(token, fullName) {
    try {
      const res = await fetch(`https://api.github.com/repos/${fullName}/contents/.messages`, {
        headers: headers(token)
      });
  
      return res.status === 200;
    } catch (err) {
      // Network-level error (e.g., disconnected)
      return false;
    }
  }