import { settingsStore } from '../stores/settingsStore.js';
import { setConversationsForRepo } from '../stores/conversationStore.js';
import { syncRepoListFromGitHub } from '../stores/repoStore.js';
import { decryptJSON } from './encryption.js';
import {
  getGitHubUsername,
  streamPersistedReposFromGitHub,
  streamPersistedConversationsFromGitHub
} from './githubApi.js';
import { removeFromSkyGitConversations } from './conversationService.js';

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
    decrypted: {},
    encryptedSecrets: {},
    secretsSha: null,
    cleanupMode: localStorage.getItem('skygit_cleanup_mode') === 'true'
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
    try {
      const plaintext = JSON.parse(atob(file.content)); // ✅ plaintext JSON with encrypted values
      const decrypted = {};

      for (const [url, encrypted] of Object.entries(plaintext)) {
        try {
          decrypted[url] = await decryptJSON(token, encrypted);
        } catch (err) {
          console.warn(`[SkyGit] Failed to decrypt secret for ${url}:`, err);
        }
      }

      settings.encryptedSecrets = plaintext;
      settings.decrypted = decrypted;
      settings.secrets = decrypted;
      settings.secretsSha = file.sha;
    } catch (decryptErr) {
      console.warn('[SkyGit] Failed to parse or decrypt secrets.json:', decryptErr);
      console.warn('[SkyGit] Content preview:', file.content.slice(0, 50));
      settings.encryptedSecrets = {};
      settings.decrypted = {};
      settings.secrets = {};
      settings.secretsSha = file.sha;
    }
  } else if (res.status === 404) {
    settings.encryptedSecrets = {};
    settings.decrypted = {};
    settings.secrets = {};
    settings.secretsSha = null;
  } else {
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
    const invalidConversations = [];

    // Validate each conversation still exists in its source repository
    for (const convo of conversations) {
      const [owner, repo] = convo.repo.split('/');
      const safeRepo = convo.repo.replace(/\W+/g, '_');
      const safeTitle = convo.title.replace(/\W+/g, '_');
      const conversationPath = `.messages/${safeRepo}_${safeTitle}.json`;
      
      try {
        const checkRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${conversationPath}`, {
          headers: {
            Authorization: `token ${token}`,
            Accept: 'application/vnd.github+json'
          }
        });
        
        if (checkRes.status === 404) {
          console.log(`[SkyGit] Conversation "${convo.title}" no longer exists in ${convo.repo}, marking for cleanup`);
          invalidConversations.push(convo);
          continue;
        }
      } catch (error) {
        console.warn(`[SkyGit] Error checking conversation ${convo.title} in ${convo.repo}:`, error);
        // Include it anyway if we can't verify - don't remove due to network errors
      }

      // Add valid conversations to the grouped list
      if (!grouped[convo.repo]) grouped[convo.repo] = [];
      grouped[convo.repo].push({
        id: convo.id,
        title: convo.title,
        name: `${convo.repo.replace(/\W+/g, '_')}_${convo.title.replace(/\W+/g, '_')}.json`,
        path: `.messages/${convo.repo.replace(/\W+/g, '_')}_${convo.title.replace(/\W+/g, '_')}.json`,
        repo: convo.repo
      });
    }

    // Clean up invalid conversations from skygit-config
    for (const invalidConvo of invalidConversations) {
      try {
        await removeFromSkyGitConversations(token, invalidConvo);
      } catch (error) {
        console.warn(`[SkyGit] Failed to remove invalid conversation ${invalidConvo.title}:`, error);
      }
    }

    // Load valid conversations into the store
    for (const repoName in grouped) {
      setConversationsForRepo(repoName, grouped[repoName]);
    }

    if (invalidConversations.length > 0) {
      console.log(`[SkyGit] Cleaned up ${invalidConversations.length} deleted conversation(s) from skygit-config`);
    }
  } catch (e) {
    console.warn('[SkyGit] Failed to stream conversations:', e);
  }
}
