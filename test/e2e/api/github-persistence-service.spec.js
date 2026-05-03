import { test, expect } from '@playwright/test';

async function loadPersistenceService() {
  globalThis.localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {}
  };

  return await import('../../../src/services/githubPersistenceService.js');
}

test('github persistence service filters json content files', async () => {
  const { filterGitHubJsonFiles } = await loadPersistenceService();

  expect(filterGitHubJsonFiles([
    { name: 'alice-repo.json' },
    { name: 'README.md' },
    { name: 'bob-repo.json' }
  ])).toEqual([
    { name: 'alice-repo.json' },
    { name: 'bob-repo.json' }
  ]);
});

test('github persistence service decodes GitHub base64 json content', async () => {
  const { decodeGitHubJsonContent } = await loadPersistenceService();
  const payload = { full_name: 'alice/repo', messages: [{ id: 'm1' }] };

  expect(decodeGitHubJsonContent(btoa(JSON.stringify(payload)))).toEqual(payload);
});
