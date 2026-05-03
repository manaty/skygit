import { encryptJSON } from './encryption.js';
import {
  buildSkyGitConfigContentsUrl,
  encodeJsonBase64,
  getGitHubHeaders
} from './githubApiCore.js';
import { getGitHubUsername } from './githubSkyGitRepoService.js';

export function createSecretsFileBody(secrets, sha = null) {
  return {
    message: 'Update secrets.json',
    content: encodeJsonBase64(secrets),
    ...(sha && { sha })
  };
}

export function shouldStoreEncryptedCredentials(repo) {
  const credentials = repo.config.storage_info.credentials;
  return Boolean(credentials && Object.keys(credentials).length > 0);
}

export async function getSecretsMap(token) {
  const username = await getGitHubUsername(token);
  const url = buildSkyGitConfigContentsUrl(username, 'secrets.json');

  const res = await fetch(url, {
    headers: getGitHubHeaders(token)
  });

  if (res.status === 404) return { secrets: {}, sha: null };

  const json = await res.json();
  return {
    secrets: JSON.parse(atob(json.content)),
    sha: json.sha
  };
}

export async function saveSecretsMap(token, secrets, sha = null) {
  const username = await getGitHubUsername(token);
  const url = buildSkyGitConfigContentsUrl(username, 'secrets.json');

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
  }

  const saveRes = await fetch(url, {
    method: 'PUT',
    headers: getGitHubHeaders(token),
    body: JSON.stringify(createSecretsFileBody(secrets, sha))
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

  if (!shouldStoreEncryptedCredentials(repo)) {
    return;
  }

  const encrypted = await encryptJSON(token, credentials);
  const { secrets, sha } = await getSecretsMap(token);

  secrets[url] = encrypted;

  await saveSecretsMap(token, secrets, sha);
}
