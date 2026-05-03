import { test, expect } from '@playwright/test';
import {
  GITHUB_API_BASE_URL,
  SKYGIT_CONFIG_REPO_NAME,
  buildGitHubApiUrl,
  buildPersistedRepoPath,
  buildRepoContentsUrl,
  buildRepoUrl,
  buildSkyGitConfigContentsUrl,
  encodeJsonBase64,
  getGitHubHeaders
} from '../../../src/services/githubApiCore.js';

test('github api core builds authenticated request details', () => {
  expect(GITHUB_API_BASE_URL).toBe('https://api.github.com');
  expect(SKYGIT_CONFIG_REPO_NAME).toBe('skygit-config');
  expect(getGitHubHeaders('token-123', { 'Content-Type': 'application/json' })).toEqual({
    Authorization: 'token token-123',
    Accept: 'application/vnd.github+json',
    'Content-Type': 'application/json'
  });
});

test('github api core builds repository and content urls', () => {
  expect(buildGitHubApiUrl('/user/repos')).toBe('https://api.github.com/user/repos');
  expect(buildRepoUrl('alice', 'skygit-config')).toBe('https://api.github.com/repos/alice/skygit-config');
  expect(buildRepoContentsUrl('alice/repo', '.messages/config.json')).toBe(
    'https://api.github.com/repos/alice/repo/contents/.messages/config.json'
  );
  expect(buildSkyGitConfigContentsUrl('alice', 'repositories/alice-repo.json')).toBe(
    'https://api.github.com/repos/alice/skygit-config/contents/repositories/alice-repo.json'
  );
});

test('github api core encodes json and persisted repo paths', () => {
  const repo = { owner: 'alice', name: 'repo', full_name: 'alice/repo' };

  expect(JSON.parse(decodeURIComponent(escape(atob(encodeJsonBase64(repo)))))).toEqual(repo);
  expect(buildPersistedRepoPath(repo)).toBe('repositories/alice-repo.json');
});
