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
