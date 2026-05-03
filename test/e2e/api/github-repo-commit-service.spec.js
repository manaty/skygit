import { test, expect } from '@playwright/test';
import {
  clearPendingGitHubWrite,
  createRepoCommitBody,
  getLastGitHubPayload,
  getPendingGitHubWrite,
  setLastGitHubPayload,
  setPendingGitHubWrite
} from '../../../src/services/githubRepoCommitService.js';

test('github repo commit service builds commit bodies with optional sha', () => {
  const repo = { full_name: 'alice/repo' };

  expect(createRepoCommitBody(repo, 'base64')).toEqual({
    message: 'Update repo alice/repo',
    content: 'base64'
  });
  expect(createRepoCommitBody(repo, 'base64', 'sha-123')).toEqual({
    message: 'Update repo alice/repo',
    content: 'base64',
    sha: 'sha-123'
  });
});

test('github repo commit service stores pending writes and last payloads by key', () => {
  const promise = Promise.resolve();

  setPendingGitHubWrite('repositories/alice-repo.json', promise);
  setLastGitHubPayload('repositories/alice-repo.json', 'payload-a');

  expect(getPendingGitHubWrite('repositories/alice-repo.json')).toBe(promise);
  expect(getLastGitHubPayload('repositories/alice-repo.json')).toBe('payload-a');

  clearPendingGitHubWrite('repositories/alice-repo.json');

  expect(getPendingGitHubWrite('repositories/alice-repo.json')).toBeUndefined();
});
