import { syncState } from '../stores/syncStateStore.js';
import { syncRepoListFromGitHub } from '../stores/repoStore.js';
import { encryptJSON } from './encryption.js';

// ---------------------------------------------------------------------------
// Internal: commit call de‑duplication.
// We keep a map filePath -> pending Promise so that if several parts of the
// UI ask to commit the same repo JSON at nearly the same time, we perform the
// network operation only once and every caller awaits the same Promise.
// The entry is cleared once the Promise settles, letting subsequent (later)
// updates through.
// ---------------------------------------------------------------------------

const _pendingRepoCommits = new Map();

const BASE_API = 'https://api.github.com';
const REPO_NAME = 'skygit-config';

/**
 * Common GitHub headers with auth.
 */
function getHeaders(token) {
    return {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github+json'
    };
}

/**
 * Gets authenticated user's login name.
 */
export async function getGitHubUsername(token) {
    const res = await fetch(`${BASE_API}/user`, { headers: getHeaders(token) });
    if (!res.ok) throw new Error('Failed to fetch GitHub user');
    const user = await res.json();
    return user.login;
}

/**
 * Checks if the `skygit-config` repo exists in the user’s account.
 */
export async function checkSkyGitRepoExists(token, username) {
    const res = await fetch(`https://api.github.com/repos/${username}/${REPO_NAME}`, {
        headers: getHeaders(token)
    });

    if (res.status === 404) {
        return false; // This is expected if the repo doesn't exist
    }

    if (!res.ok) {
        const error = await res.text();
        throw new Error('Error checking repo existence');
    }

    return true;
}

/**
 * Creates the `skygit-config` repo as private.
 */
export async function createSkyGitRepo(token) {
    const headers = {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github+json'
    };

    // Step 1: Create the repo
    const repoRes = await fetch('https://api.github.com/user/repos', {
        method: 'POST',
        headers,
        body: JSON.stringify({
            name: 'skygit-config',
            private: true,
            description: 'Configuration repo for SkyGit',
            auto_init: true // creates an initial commit (README.md)
        })
    });

    if (!repoRes.ok) {
        const error = await repoRes.text();
        throw new Error(`Failed to create repo: ${error}`);
    }

    const repo = await repoRes.json();
    const username = repo.owner.login;

    // Step 2: Prepare config file
    const configContent = {
        created: new Date().toISOString(),
        encryption: false,
        media: 'github',
        commitPolicy: 'manual'
    };

    const configBase64 = btoa(unescape(encodeURIComponent(JSON.stringify(configContent, null, 2))));

    // Step 3: Add config.json
    await fetch(`https://api.github.com/repos/${username}/skygit-config/contents/config.json`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
            message: 'Initialize SkyGit config',
            content: configBase64
        })
    });

    // Step 4: Add .gitkeep to .messages/
    await fetch(`https://api.github.com/repos/${username}/skygit-config/contents/.messages/.gitkeep`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
            message: 'Create .messages folder',
            content: btoa('')
        })
    });

    return repo;
}

/**
 * Ensures the `skygit-config` repo exists — creates it if not.
 */
export async function ensureSkyGitRepo(token) {
    const username = await getGitHubUsername(token);
    const exists = await checkSkyGitRepoExists(token, username);

    if (!exists) {
        return await createSkyGitRepo(token);
    }

    const res = await fetch(`${BASE_API}/repos/${username}/${REPO_NAME}`, {
        headers: getHeaders(token)
    });
    return await res.json(); // return repo info
}

export async function commitRepoToGitHub(token, repo, maxRetries = 2) {
    const username = await getGitHubUsername(token);
    const filePath = `repositories/${repo.owner}-${repo.name}.json`;

    // Deduplication: if there is already a commit in flight for this file we
    // return the same promise so callers wait for the existing operation
    // instead of starting a new identical request.
    const inFlight = _pendingRepoCommits.get(filePath);
    if (inFlight) return inFlight;
    const headers = {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json'
    };

    const content = btoa(unescape(encodeURIComponent(JSON.stringify(repo, null, 2))));

    let attempts = 0;
    let lastErr = null;

    const doCommitCore = async () => {
        while (attempts <= maxRetries) {
        // 1️⃣ fetch current SHA (if any)
        let sha = null;
        try {
            const checkRes = await fetch(`https://api.github.com/repos/${username}/skygit-config/contents/${filePath}`, { headers });
            if (checkRes.ok) {
                const existing = await checkRes.json();
                sha = existing.sha;
            }
        } catch (_) {
            // ignore network errors here – will surface on PUT
        }

        const body = {
            message: `Update repo ${repo.full_name}`,
            content,
            ...(sha && { sha })
        };

        const res = await fetch(`https://api.github.com/repos/${username}/skygit-config/contents/${filePath}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(body)
        });

        if (res.ok) {
            return; // success ✅
        }

        // Capture error for possible retry analysis
        const errText = await res.text();
        lastErr = errText;

        // 409 Conflict usually means SHA mismatch – retry once with fresh SHA
        if (res.status === 409) {
            attempts += 1;
            continue; // loop again to get latest SHA and retry
        }

        break; // unrecoverable error (not 409)
    }

        throw new Error(`GitHub commit failed: ${lastErr}`);
    };

    const p = doCommitCore().finally(() => _pendingRepoCommits.delete(filePath));

    _pendingRepoCommits.set(filePath, p);

    return p;
}


export async function streamPersistedReposFromGitHub(token) {
    const username = await getGitHubUsername(token);
    const path = `https://api.github.com/repos/${username}/skygit-config/contents/repositories`;

    const headers = {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github+json'
    };

    const res = await fetch(path, { headers });

    if (res.status === 404) {
        syncState.set({ phase: 'idle', loadedCount: 0, totalCount: 0, paused: false });
        return;
    }

    if (!res.ok) {
        const error = await res.text();
        throw new Error(`Failed to load repository list: ${error}`);
    }

    const files = await res.json();
    const jsonFiles = files.filter((f) => f.name.endsWith('.json'));

    syncState.set({
        phase: 'streaming',
        loadedCount: 0,
        totalCount: jsonFiles.length,
        paused: false
    });

    for (const file of jsonFiles) {
        let paused = false;
        syncState.subscribe((s) => (paused = s.paused))();
        if (paused) break;

        try {
            const contentRes = await fetch(file.url, { headers });
            if (!contentRes.ok) {
                console.warn(`[SkyGit] Skipped missing repo file: ${file.name} (${contentRes.status})`);
                continue;
            }

            const meta = await contentRes.json();
            const decoded = atob(meta.content);
            const data = JSON.parse(decoded);

            syncRepoListFromGitHub([data]);

            syncState.update((s) => ({
                ...s,
                loadedCount: s.loadedCount + 1
            }));
        } catch (e) {
            console.warn(`[SkyGit] Skipped malformed repo file: ${file.name}`, e);
            continue;
        }
    }

    syncState.update((s) => ({ ...s, phase: 'idle' }));
}

export async function streamPersistedConversationsFromGitHub(token) {
    const username = await getGitHubUsername(token);
    const url = `https://api.github.com/repos/${username}/skygit-config/contents/conversations`;
  
    const headers = {
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github+json'
    };
  
    const res = await fetch(url, { headers });
    if (res.status === 404) return; // No conversations yet
  
    if (!res.ok) {
      const error = await res.text();
      throw new Error(`Failed to load conversations: ${error}`);
    }
  
    const files = await res.json();
    const jsonFiles = files.filter((f) => f.name.endsWith('.json'));
  
    const conversations = [];
    for (const file of jsonFiles) {
      const res = await fetch(file.url, { headers });
      if (!res.ok) continue;
      const meta = await res.json();
      const decoded = JSON.parse(atob(meta.content));
      conversations.push(decoded);
    }
  
    return conversations; // you can store in localStorage or dispatch to store
  }
  

export async function deleteRepoFromGitHub(token, repo) {
    const username = await getGitHubUsername(token);
    const path = `repositories/${repo.owner}-${repo.name}.json`;

    // Step 1: Get the file SHA first
    const res = await fetch(`https://api.github.com/repos/${username}/skygit-config/contents/${path}`, {
        headers: {
            Authorization: `token ${token}`,
            Accept: 'application/vnd.github+json'
        }
    });

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Unable to locate repo file for deletion: ${err}`);
    }

    const file = await res.json();

    // Step 2: Delete the file using its SHA
    const deleteRes = await fetch(`https://api.github.com/repos/${username}/skygit-config/contents/${path}`, {
        method: 'DELETE',
        headers: {
            Authorization: `token ${token}`,
            Accept: 'application/vnd.github+json'
        },
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

export async function activateMessagingForRepo(token, repo) {
    const headers = {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github+json'
    };

    const config = {
        commit_frequency_min: 1440,
        binary_storage_type: 'gitfs',
        storage_info: {
            type: 'gitfs',
            url: ''
        }
    };

    const base64 = btoa(unescape(encodeURIComponent(JSON.stringify(config, null, 2))));
    const configPath = `.messages/config.json`;
    const apiUrl = `https://api.github.com/repos/${repo.full_name}/contents/${configPath}`;

    let sha = null;

    try {
        const res = await fetch(apiUrl, { headers });
        if (res.ok) {
            const existing = await res.json();
            sha = existing.sha; // we're updating
        } else if (res.status !== 404) {
            const err = await res.text();
            throw new Error(`Failed to check if config.json exists: ${err}`);
        }
        // else: 404 is OK (we'll create new)
    } catch (e) {
        console.warn("Error checking for config.json", e);
    }

    const saveRes = await fetch(apiUrl, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
            message: 'Activate messaging: add .messages/config.json',
            content: base64,
            ...(sha && { sha }) // only add sha if updating
        })
    });

    if (!saveRes.ok) {
        const err = await saveRes.text();
        throw new Error(`Failed to commit config.json: ${err}`);
    }

    repo.has_messages = true;
    repo.config = config;

    await commitRepoToGitHub(token, repo);
}

export async function updateRepoMessagingConfig(token, repo) {
    const headers = {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github+json'
    };

    const config = repo.config;
    const configPath = `.messages/config.json`;

    const base64 = btoa(unescape(encodeURIComponent(JSON.stringify(config, null, 2))));

    // Get existing SHA for config.json
    const configRes = await fetch(`https://api.github.com/repos/${repo.full_name}/contents/${configPath}`, {
        headers
    });

    let sha = null;
    if (configRes.ok) {
        const existing = await configRes.json();
        sha = existing.sha;
    }

    // Update .messages/config.json in target repo
    const saveRes = await fetch(`https://api.github.com/repos/${repo.full_name}/contents/${configPath}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
            message: `Update messaging config`,
            content: base64,
            ...(sha && { sha })
        })
    });

    if (!saveRes.ok) {
        const err = await saveRes.text();
        throw new Error(`Failed to update config.json: ${err}`);
    }

    // ✅ Also update repo JSON in skygit-config
    const { commitRepoToGitHub } = await import('./githubApi.js');
    await commitRepoToGitHub(token, repo); // includes updated repo.config
}

export async function getSecretsMap(token) {
    const username = await getGitHubUsername(token);
    const url = `https://api.github.com/repos/${username}/skygit-config/contents/secrets.json`;

    const res = await fetch(url, {
        headers: {
            Authorization: `token ${token}`,
            Accept: 'application/vnd.github+json'
        }
    });

    if (res.status === 404) return { secrets: {}, sha: null }; // first time

    const json = await res.json();
    return {
        secrets: JSON.parse(atob(json.content)),
        sha: json.sha
    };
}

export async function saveSecretsMap(token, secrets, sha = null) {
    const username = await getGitHubUsername(token);
    const url = `https://api.github.com/repos/${username}/skygit-config/contents/secrets.json`;

    const content = btoa(unescape(encodeURIComponent(JSON.stringify(secrets, null, 2))));

    // Try to get the current SHA if not provided
    if (!sha) {
        const res = await fetch(url, {
            headers: {
                Authorization: `token ${token}`,
                Accept: 'application/vnd.github+json'
            }
        });

        if (res.ok) {
            const data = await res.json();
            sha = data.sha;
        } else if (res.status !== 404) {
            const err = await res.text();
            throw new Error(`Failed to check secrets.json: ${err}`);
        }
        // else: 404 means file doesn't exist, so we continue without sha
    }

    const body = {
        message: "Update secrets.json",
        content,
        ...(sha && { sha })
    };

    const saveRes = await fetch(url, {
        method: 'PUT',
        headers: {
            Authorization: `token ${token}`,
            Accept: 'application/vnd.github+json'
        },
        body: JSON.stringify(body)
    });

    if (!saveRes.ok) {
        const err = await saveRes.text();
        throw new Error(`Failed to write secrets.json: ${err}`);
    }
}


export async function storeEncryptedCredentials(token, repo) {
  const url = repo.config.storage_info.url;
  const credentials = repo.config.storage_info.credentials;

  const encrypted = await encryptJSON(token, credentials);
  const { secrets, sha } = await getSecretsMap(token);

  secrets[url] = encrypted;

  await saveSecretsMap(token, secrets, sha);
}

