import {
  buildGitHubApiUrl,
  buildRepoUrl,
  buildSkyGitConfigContentsUrl,
  encodeEmptyBase64,
  encodeJsonBase64,
  getGitHubHeaders,
  SKYGIT_CONFIG_REPO_NAME
} from './githubApiCore.js';

let cachedUserPromise = null;

export function createSkyGitRepoPayload() {
  return {
    name: SKYGIT_CONFIG_REPO_NAME,
    private: true,
    description: 'Configuration repo for SkyGit',
    auto_init: true
  };
}

export function createInitialSkyGitConfig(created = new Date().toISOString()) {
  return {
    created,
    encryption: false,
    media: 'github',
    commitPolicy: 'manual'
  };
}

export async function getGitHubUsername(token) {
  if (cachedUserPromise) return cachedUserPromise;

  cachedUserPromise = (async () => {
    const res = await fetch(buildGitHubApiUrl('user'), { headers: getGitHubHeaders(token) });
    if (!res.ok) {
      cachedUserPromise = null;
      throw new Error('Failed to fetch GitHub user');
    }
    const user = await res.json();
    return user.login;
  })();

  return cachedUserPromise;
}

export async function checkSkyGitRepoExists(token, username) {
  const res = await fetch(buildRepoUrl(username, SKYGIT_CONFIG_REPO_NAME), {
    headers: getGitHubHeaders(token)
  });

  if (res.status === 404) {
    return false;
  }

  if (!res.ok) {
    await res.text();
    throw new Error('Error checking repo existence');
  }

  return true;
}

export async function createSkyGitRepo(token) {
  const headers = getGitHubHeaders(token);

  const repoRes = await fetch(buildGitHubApiUrl('user/repos'), {
    method: 'POST',
    headers,
    body: JSON.stringify(createSkyGitRepoPayload())
  });

  if (!repoRes.ok) {
    if (repoRes.status === 422) {
      console.warn('[SkyGit] Repo creation failed (422), assuming it exists. Fetching...');
      const userRes = await fetch(buildGitHubApiUrl('user'), { headers });
      if (userRes.ok) {
        const user = await userRes.json();
        const existingRes = await fetch(buildRepoUrl(user.login, SKYGIT_CONFIG_REPO_NAME), { headers });
        if (existingRes.ok) {
          return await existingRes.json();
        }
      }
    }

    const error = await repoRes.text();
    throw new Error(`Failed to create repo: ${error}`);
  }

  const repo = await repoRes.json();
  const username = repo.owner.login;
  const configBase64 = encodeJsonBase64(createInitialSkyGitConfig());

  await fetch(buildSkyGitConfigContentsUrl(username, 'config.json'), {
    method: 'PUT',
    headers,
    body: JSON.stringify({
      message: 'Initialize SkyGit config',
      content: configBase64
    })
  });

  await fetch(buildSkyGitConfigContentsUrl(username, '.messages/.gitkeep'), {
    method: 'PUT',
    headers,
    body: JSON.stringify({
      message: 'Create .messages folder',
      content: encodeEmptyBase64()
    })
  });

  return repo;
}

export async function ensureSkyGitRepo(token) {
  const username = await getGitHubUsername(token);
  const exists = await checkSkyGitRepoExists(token, username);

  if (!exists) {
    return await createSkyGitRepo(token);
  }

  const res = await fetch(buildRepoUrl(username, SKYGIT_CONFIG_REPO_NAME), {
    headers: getGitHubHeaders(token)
  });
  return await res.json();
}
