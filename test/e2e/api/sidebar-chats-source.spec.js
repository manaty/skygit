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

test('Chats delegates participants modal rendering to a component', async () => {
  const chatsSource = await readFile('src/routes/Chats.svelte', 'utf8');
  const modalSource = await readFile('src/components/ParticipantsModal.svelte', 'utf8');

  expect(chatsSource).toContain("import ParticipantsModal from '../components/ParticipantsModal.svelte'");
  expect(chatsSource).toContain('<ParticipantsModal');
  expect(chatsSource).not.toContain('Count user agents per user');
  expect(modalSource).toContain('aria-label="Close participants modal"');
  expect(modalSource).toContain("import { buildParticipantRows } from '../utils/participants.js'");
});

test('Chats keeps PeerJS imports consolidated', async () => {
  const source = await readFile('src/routes/Chats.svelte', 'utf8');
  const imports = source.match(/from '..\/services\/peerJsManager\.js'/g) || [];

  expect(imports).toHaveLength(1);
  expect(source).not.toContain('getLocalSessionId');
});

test('Chats delegates remote conversation merging to a utility', async () => {
  const source = await readFile('src/routes/Chats.svelte', 'utf8');

  expect(source).toContain("import { mergeRemoteConversation } from '../utils/conversationSync.js'");
  expect(source).toContain('mergeRemoteConversation(selectedConversation, remoteConversation)');
  expect(source).not.toContain('const messageMap = new Map()');
});

test('Chats delegates recording upload credential selection to a utility', async () => {
  const source = await readFile('src/routes/Chats.svelte', 'utf8');

  expect(source).toContain("import { getRecordingUploadCredentials } from '../utils/uploadCredentials.js'");
  expect(source).toContain('getRecordingUploadCredentials(');
  expect(source).not.toContain('window.selectedRepo');
  expect(source).not.toContain('getDriveCredential');
});
