import { settingsStore } from '../stores/settingsStore.js';
import { decryptJSON } from './encryption.js';
import { getGitHubUsername } from './githubApi.js';

export async function initializeSettings(token) {
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
}
