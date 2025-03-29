import { syncState } from '../stores/syncStateStore.js';
import { syncRepoListFromGitHub } from '../stores/repoStore.js';

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

export async function commitRepoToGitHub(token, repo) {
    const username = await getGitHubUsername(token);
    const filePath = `repositories/${repo.owner}-${repo.name}.json`;

    const content = btoa(unescape(encodeURIComponent(JSON.stringify(repo, null, 2))));

    const res = await fetch(`https://api.github.com/repos/${username}/skygit-config/contents/${filePath}`, {
        method: 'PUT',
        headers: {
            Authorization: `token ${token}`,
            Accept: 'application/vnd.github+json'
        },
        body: JSON.stringify({
            message: `Add repo ${repo.full_name}`,
            content
        })
    });

    if (!res.ok) {
        const error = await res.text();
        throw new Error(`GitHub commit failed: ${error}`);
    }
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
