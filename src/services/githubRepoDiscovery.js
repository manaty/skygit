import { repoList, queueRepoForCommit } from '../stores/repoStore.js';
import { discoverConversations } from './conversationService.js';
import { syncState } from '../stores/syncStateStore.js';

const headers = (token) => ({
  Authorization: `token ${token}`,
  Accept: 'application/vnd.github+json'
});

let cancelRequested = false;

export function cancelDiscovery() {
  cancelRequested = true;
}

// Helper: Check if discussions are enabled for a repo
async function repoHasDiscussions(token, repoFullName) {
  const url = `https://api.github.com/repos/${repoFullName}`;
  const res = await fetch(url, { headers: headers(token) });
  if (!res.ok) return false;
  const repo = await res.json();
  return repo.has_discussions === true;
}

export async function discoverAllRepos(token) {
  cancelRequested = false;

  const seen = new Set();
  // Do not skip repos present in localStorage; always re-check discussion status
  // const local = JSON.parse(localStorage.getItem('skygit_repos') || '[]').map((r) => r.full_name);
  const allRepos = [];

  const userRepos = await fetchAllPaginated('https://api.github.com/user/repos', headers(token));
  allRepos.push(...userRepos);
  syncState.update((s) => ({ ...s, totalCount: allRepos.length }));

  const orgs = await fetchAllPaginated('https://api.github.com/user/orgs', headers(token));
  for (const org of orgs) {
    if (cancelRequested) return;
    const orgRepos = await fetchAllPaginated(`https://api.github.com/orgs/${org.login}/repos`, headers(token));
    allRepos.push(...orgRepos);
    syncState.update((s) => ({ ...s, totalCount: allRepos.length }));
  }

  for (const repo of allRepos) {
    if (cancelRequested) return;

    const fullName = repo.full_name;
    if (seen.has(fullName)) {
      // Skip duplicates in allRepos list
      syncState.update((s) => ({ ...s, loadedCount: s.loadedCount + 1 }));
      continue;
    }

    seen.add(fullName);

    const hasMessages = await checkMessagesDirectory(token, fullName);

    // Determine if Discussions are enabled for this repo
    let hasDiscussions = false;
    try {
      const detailRes = await fetch(`https://api.github.com/repos/${fullName}`, { headers: headers(token) });
      if (detailRes.ok) {
        const detailData = await detailRes.json();
        hasDiscussions = detailData.has_discussions === true;
      }
    } catch (e) {
      console.warn(`[SkyGit] Failed to fetch discussion status for ${fullName}`, e);
    }
    const enrichedRepo = {
      name: repo.name,
      owner: repo.owner.login,
      full_name: fullName,
      url: repo.html_url,
      private: repo.private,
      has_messages: hasMessages,
      has_discussions: hasDiscussions,
      config: null
    };

    // Only try to discover conversations if discussions are enabled
    if (enrichedRepo.has_discussions) {
      try {
        const configRes = await fetch(`https://api.github.com/repos/${fullName}/contents/.messages/config.json`, {
          headers: headers(token)
        });

        if (configRes.ok) {
          const cfg = await configRes.json();
          enrichedRepo.config = JSON.parse(atob(cfg.content));

          //discover conversations
          await discoverConversations(token, enrichedRepo);
        }
      } catch (e) {
        console.warn(`[SkyGit] Invalid config.json in ${fullName}`, e);
      }
    }

    syncState.update((s) => ({
      ...s,
      loadedCount: s.loadedCount + 1
    }));

    queueRepoForCommit(enrichedRepo);
  }

  syncState.update((s) => ({ ...s, phase: 'idle' }));
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
    return false;
  }
}
