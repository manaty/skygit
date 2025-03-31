import { settingsStore } from '../stores/settingsStore.js';
import { setConversationsForRepo } from '../stores/conversationStore.js';
import { syncRepoListFromGitHub } from '../stores/repoStore.js';
import { decryptJSON } from './encryption.js';
import {
  getGitHubUsername,
  streamPersistedReposFromGitHub,
  streamPersistedConversationsFromGitHub
} from './githubApi.js';

/**
 * Full startup initialization:
 * - Loads config.json and secrets.json
 * - Streams saved repos to local store
 * - Streams saved conversations to local store
 */
export async function initializeStartupState(token) {
  const username = await getGitHubUsername(token);
  const headers = {
    Authorization: `token ${token}`,
    Accept: 'application/vnd.github+json'
  };

  const settings = {
    config: null,
    secrets: {},
    secretsSha: null
  };
  
  // Load local cached conversations immediately
  try {
    const localConvos = JSON.parse(localStorage.getItem('skygit_conversations') || '{}');
    for (const repoName in localConvos) {
      setConversationsForRepo(repoName, localConvos[repoName]);
    }
    console.log('[SkyGit] ✅ Loaded conversations from localStorage');
  } catch (e) {
    console.warn('[SkyGit] Failed to load local conversations:', e);
  }

  // Load config.json
  try {
    const res = await fetch(`https://api.github.com/repos/${username}/skygit-config/contents/config.json`, { headers });
    if (res.ok) {
      const file = await res.json();
      settings.config = JSON.parse(atob(file.content));
    } else if (res.status !== 404) {
      console.warn('[SkyGit] Failed to load config.json:', await res.text());
    }
  } catch (e) {
    console.warn('[SkyGit] Error loading config.json:', e);
  }

  // Load secrets.json
  try {
    const res = await fetch(`https://api.github.com/repos/${username}/skygit-config/contents/secrets.json`, { headers });
    if (res.ok) {
      const file = await res.json();
      const decrypted = await decryptJSON(token, file.content);
      settings.secrets = decrypted;
      settings.secretsSha = file.sha;
    } else if (res.status !== 404) {
      console.warn('[SkyGit] Failed to load secrets.json:', await res.text());
    }
  } catch (e) {
    console.warn('[SkyGit] Error loading secrets.json:', e);
  }

  settingsStore.set(settings);

  // ✅ Load saved repos
  try {
    console.log('[SkyGit] Streaming saved repos...');
    await streamPersistedReposFromGitHub(token);
  } catch (e) {
    console.warn('[SkyGit] Failed to stream repos:', e);
  }

  // ✅ Load saved conversations
  try {
    console.log('[SkyGit] Streaming saved conversations...');
    const conversations = await streamPersistedConversationsFromGitHub(token) || [];
    const grouped = {};

    for (const convo of conversations) {
      if (!grouped[convo.repo]) grouped[convo.repo] = [];
      grouped[convo.repo].push({
        id: convo.id,
        title: convo.title,
        name: `${convo.repo.replace(/\W+/g, '_')}_${convo.title.replace(/\W+/g, '_')}.json`,
        path: `.messages/${convo.repo.replace(/\W+/g, '_')}_${convo.title.replace(/\W+/g, '_')}.json`,
        repo: convo.repo
      });
    }

    for (const repoName in grouped) {
      setConversationsForRepo(repoName, grouped[repoName]);
    }
  } catch (e) {
    console.warn('[SkyGit] Failed to stream conversations:', e);
  }
}
