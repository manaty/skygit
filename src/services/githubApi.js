import { queueRepoForCommit } from '../stores/repoStore.js';
import { encryptJSON } from './encryption.js';
import {
    buildRepoContentsUrl,
    buildSkyGitConfigContentsUrl,
    encodeJsonBase64,
    getGitHubHeaders
} from './githubApiCore.js';
import {
    clearPendingGitHubWrite,
    commitRepoToGitHub,
    getLastGitHubPayload,
    getPendingGitHubWrite,
    setLastGitHubPayload,
    setPendingGitHubWrite
} from './githubRepoCommitService.js';
import { getGitHubUsername } from './githubSkyGitRepoService.js';

export { commitRepoToGitHub } from './githubRepoCommitService.js';

export {
    deleteRepoFromGitHub,
    streamPersistedConversationsFromGitHub,
    streamPersistedReposFromGitHub
} from './githubPersistenceService.js';

export {
    checkSkyGitRepoExists,
    createSkyGitRepo,
    ensureSkyGitRepo,
    getGitHubUsername
} from './githubSkyGitRepoService.js';

export async function activateMessagingForRepo(token, repo) {
    const headers = getGitHubHeaders(token);

    const config = {
        commit_frequency_min: 1440,
        binary_storage_type: 'gitfs',
        storage_info: {
            type: 'gitfs',
            url: ''
        }
    };

    // Path helpers must be defined before use
    const configPath = `.messages/config.json`;
    const uniqueKey = `${repo.full_name}/${configPath}`;

    const base64 = encodeJsonBase64(config);

    // ── de-duplication ──
    if (getLastGitHubPayload(uniqueKey) === base64) {
        return; // no change – skip network call
    }

    const inFlight = getPendingGitHubWrite(uniqueKey);
    if (inFlight) return inFlight;

    const apiUrl = buildRepoContentsUrl(repo.full_name, configPath);

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
    const headers = getGitHubHeaders(token);

    const config = repo.config;
    const configPath = `.messages/config.json`;
    const uniqueKey = `${repo.full_name}/${configPath}`;

    const base64 = encodeJsonBase64(config);

    // Get existing SHA for config.json
    const configRes = await fetch(buildRepoContentsUrl(repo.full_name, configPath), {
        headers
    });

    let sha = null;
    if (configRes.ok) {
        const existing = await configRes.json();
        sha = existing.sha;
    }

    // Update .messages/config.json in target repo
    const commitPromise = fetch(buildRepoContentsUrl(repo.full_name, configPath), {
        method: 'PUT',
        headers,
        body: JSON.stringify({
            message: `Update messaging config`,
            content: base64,
            ...(sha && { sha })
        })
    }).then(async (res) => {
        if (!res.ok) {
            const err = await res.text();
            throw new Error(`Failed to update config.json: ${err}`);
        }
            setLastGitHubPayload(uniqueKey, base64);
    }).finally(() => {
        clearPendingGitHubWrite(uniqueKey);
    });

    setPendingGitHubWrite(uniqueKey, commitPromise);

    await commitPromise;


    // ✅ Also update repo JSON in skygit-config
    await queueRepoForCommit(repo); // queue the repo for commit
}

export async function getSecretsMap(token) {
    const username = await getGitHubUsername(token);
    const url = buildSkyGitConfigContentsUrl(username, 'secrets.json');

    const res = await fetch(url, {
        headers: getGitHubHeaders(token)
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
    const url = buildSkyGitConfigContentsUrl(username, 'secrets.json');

    const content = encodeJsonBase64(secrets);

    // Try to get the current SHA if not provided
    if (!sha) {
        const res = await fetch(url, {
            headers: getGitHubHeaders(token)
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
        headers: getGitHubHeaders(token),
        body: JSON.stringify(body)
    });

    if (!saveRes.ok) {
        const err = await saveRes.text();
        throw new Error(`Failed to write secrets.json: ${err}`);
    }

    const result = await saveRes.json().catch(() => null);
    return result?.content?.sha ?? sha ?? null;
}


export async function storeEncryptedCredentials(token, repo) {
    const url = repo.config.storage_info.url;
    const credentials = repo.config.storage_info.credentials;

    // If the repo just points to an existing credential URL and no new
    // credential blob is supplied, there is nothing to (re)-encrypt or save.
    if (!credentials || Object.keys(credentials).length === 0) {
        return; // no-op – reference to an already-stored secret
    }

    const encrypted = await encryptJSON(token, credentials);

    const { secrets, sha } = await getSecretsMap(token);

    secrets[url] = encrypted;

    await saveSecretsMap(token, secrets, sha);
}
