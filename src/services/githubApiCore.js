export const GITHUB_API_BASE_URL = 'https://api.github.com';
export const SKYGIT_CONFIG_REPO_NAME = 'skygit-config';

export function getGitHubHeaders(token, extraHeaders = {}) {
  return {
    Authorization: `token ${token}`,
    Accept: 'application/vnd.github+json',
    ...extraHeaders
  };
}

export function encodeJsonBase64(value) {
  return btoa(unescape(encodeURIComponent(JSON.stringify(value, null, 2))));
}

export function encodeEmptyBase64() {
  return btoa('');
}

export function buildGitHubApiUrl(path) {
  return `${GITHUB_API_BASE_URL}/${path.replace(/^\/+/, '')}`;
}

export function buildRepoUrl(owner, repoName) {
  return buildGitHubApiUrl(`repos/${owner}/${repoName}`);
}

export function buildRepoContentsUrl(repoFullName, path = '') {
  const suffix = path ? `/${path}` : '';
  return buildGitHubApiUrl(`repos/${repoFullName}/contents${suffix}`);
}

export function buildSkyGitConfigContentsUrl(username, path = '') {
  return buildRepoContentsUrl(`${username}/${SKYGIT_CONFIG_REPO_NAME}`, path);
}

export function buildPersistedRepoPath(repo) {
  return `repositories/${repo.owner}-${repo.name}.json`;
}
