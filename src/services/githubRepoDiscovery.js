import { get } from 'svelte/store';
import { queueRepoForCommit, flushRepoCommitQueue } from '../stores/repoStore.js';
import { discoverConversations } from './conversationService.js';
import { syncState } from '../stores/syncStateStore.js';

const headers = (token) => ({
  Authorization: `token ${token}`,
  Accept: 'application/vnd.github+json'
});

let cancelRequested = false;
const PERSONAL_KEY = '__personal__';

export function cancelDiscovery() {
  cancelRequested = true;
  syncState.update((s) => ({ ...s, paused: true }));
}

export async function discoverAllRepos(token) {
  cancelRequested = false;

  const organizations = await discoverOrganizations(token);
  for (const org of organizations) {
    if (cancelRequested) break;
    await discoverReposForOrg(token, org.id);
  }

  syncState.update((s) => ({
    ...s,
    phase: 'idle',
    currentOrg: null,
    paused: true
  }));
}

export async function discoverOrganizations(token) {
  cancelRequested = false;
  syncState.update((s) => ({
    ...s,
    phase: 'discover-orgs',
    paused: false,
    loadedCount: 0,
    totalCount: null,
    currentOrg: null,
    lastCompletedOrg: null,
    organizations: []
  }));

  const authHeaders = headers(token);
  const userRes = await fetch('https://api.github.com/user', { headers: authHeaders });
  const user = userRes.ok ? await userRes.json() : null;
  const orgs = await fetchAllPaginated('https://api.github.com/user/orgs', authHeaders);

  const organizations = [];

  if (user?.login) {
    organizations.push({
      id: PERSONAL_KEY,
      login: user.login,
      type: 'user',
      label: `${user.login} (personal)`,
      avatar_url: user.avatar_url
    });
  }

  for (const org of orgs) {
    organizations.push({
      id: org.login,
      login: org.login,
      type: 'org',
      label: org.login,
      avatar_url: org.avatar_url
    });
  }

  syncState.update((s) => ({
    ...s,
    phase: 'discover-orgs',
    organizations,
    userLogin: user?.login ?? s.userLogin
  }));

  return organizations;
}

export async function discoverReposForOrg(token, orgId) {
  cancelRequested = false;
  const state = get(syncState);
  const target = state.organizations.find((org) => org.id === orgId || org.login === orgId);

  if (!target) {
    console.warn('[SkyGit] Requested discovery for unknown organization:', orgId);
    return;
  }

  syncState.update((s) => ({
    ...s,
    phase: 'discover-repos',
    paused: false,
    loadedCount: 0,
    totalCount: null,
    currentOrg: target.id
  }));

  const authHeaders = headers(token);
  let repos;

  if (target.type === 'user') {
    repos = await fetchAllPaginated('https://api.github.com/user/repos', authHeaders);
    repos = repos.filter((repo) => repo.owner?.login === state.userLogin);
  } else {
    repos = await fetchAllPaginated(`https://api.github.com/orgs/${target.login}/repos`, authHeaders);
  }

  syncState.update((s) => ({
    ...s,
    totalCount: repos.length
  }));

  const seen = new Set();

  for (const repo of repos) {
    if (cancelRequested) break;

    const fullName = repo.full_name;
    if (seen.has(fullName)) {
      syncState.update((s) => ({ ...s, loadedCount: s.loadedCount + 1 }));
      continue;
    }

    seen.add(fullName);

    const hasMessages = await checkMessagesDirectory(token, fullName);

    const enrichedRepo = {
      name: repo.name,
      owner: repo.owner.login,
      full_name: fullName,
      url: repo.html_url,
      private: repo.private,
      has_messages: hasMessages,
      config: null
    };

    if (enrichedRepo.has_messages) {
      try {
        const configRes = await fetch(
          `https://api.github.com/repos/${fullName}/contents/.messages/config.json`,
          { headers: authHeaders }
        );
        if (configRes.ok) {
          const cfg = await configRes.json();
          enrichedRepo.config = JSON.parse(atob(cfg.content));
        }
      } catch (e) {
        console.warn(`[SkyGit] Invalid config.json in ${fullName}`, e);
      }
      await discoverConversations(token, enrichedRepo);
    }

    syncState.update((s) => ({
      ...s,
      loadedCount: s.loadedCount + 1
    }));

    queueRepoForCommit(enrichedRepo);
  }

  try {
    await flushRepoCommitQueue();
  } catch (e) {
    console.warn('[SkyGit] Failed to flush repo commit queue:', e);
  }

  syncState.update((s) => ({
    ...s,
    phase: 'discover-orgs',
    paused: true,
    loadedCount: 0,
    totalCount: null,
    currentOrg: null,
    lastCompletedOrg: target.label || target.login
  }));
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
