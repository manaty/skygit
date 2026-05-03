import { queueRepoForCommit } from '../stores/repoStore.js';
import {
    buildRepoContentsUrl,
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

export { commitRepoToGitHub } from './githubRepoCommitService.js';

export {
    deleteRepoFromGitHub,
    streamPersistedConversationsFromGitHub,
    streamPersistedReposFromGitHub
} from './githubPersistenceService.js';

export {
    getSecretsMap,
    saveSecretsMap,
    storeEncryptedCredentials
} from './githubSecretsService.js';

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
