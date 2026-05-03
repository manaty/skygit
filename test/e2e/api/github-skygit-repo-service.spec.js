import { test, expect } from '@playwright/test';
import {
  createInitialSkyGitConfig,
  createSkyGitRepoPayload
} from '../../../src/services/githubSkyGitRepoService.js';

test('github skygit repo service builds the private config repo payload', () => {
  expect(createSkyGitRepoPayload()).toEqual({
    name: 'skygit-config',
    private: true,
    description: 'Configuration repo for SkyGit',
    auto_init: true
  });
});

test('github skygit repo service builds the initial config document', () => {
  expect(createInitialSkyGitConfig('2026-05-03T00:00:00.000Z')).toEqual({
    created: '2026-05-03T00:00:00.000Z',
    encryption: false,
    media: 'github',
    commitPolicy: 'manual'
  });
});
