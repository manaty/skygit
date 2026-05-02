import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('SidebarChats keeps a single previousOrg state declaration', async () => {
  const source = await readFile('src/components/SidebarChats.svelte', 'utf8');
  const declarations = source.match(/\blet\s+previousOrg\s*=/g) || [];

  expect(declarations).toHaveLength(1);
});

test('touched modal components avoid self-closing non-void controls', async () => {
  const files = [
    'src/components/GoogleDriveSetupGuide.svelte',
    'src/components/SaveRecordingModal.svelte',
    'src/components/SidebarContacts.svelte',
    'src/components/SidebarNotifications.svelte'
  ];

  for (const file of files) {
    const source = await readFile(file, 'utf8');

    expect(source, `${file} should not self-close textarea elements`).not.toMatch(/<textarea\b[^>]*\/>/s);
    expect(source, `${file} should not self-close button elements`).not.toMatch(/<button\b[^>]*\/>/s);
  }
});

test('security documentation makes browser token storage explicit', async () => {
  const source = await readFile('SECURITY.md', 'utf8');

  expect(source).toContain('localStorage');
  expect(source).toContain('skygit_token');
  expect(source).toContain('minimum scopes');
});

test('repoStore is not dynamically imported from touched modules', async () => {
  const files = [
    'src/routes/Repos.svelte',
    'src/services/githubApi.js'
  ];

  for (const file of files) {
    const source = await readFile(file, 'utf8');
    expect(source, `${file} should use static repoStore imports`).not.toContain("import('../stores/repoStore.js')");
    expect(source, `${file} should use static repoStore imports`).not.toContain('import("../stores/repoStore.js")');
  }
});
