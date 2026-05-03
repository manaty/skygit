import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('peer manager stores are isolated from the peer manager facade', async () => {
  const storeSource = await readFile('src/services/peerManagerStores.js', 'utf8');
  const facadeSource = await readFile('src/services/peerJsManager.js', 'utf8');
  const contactsSource = await readFile('src/stores/contactsStore.js', 'utf8');

  expect(storeSource).toContain("import { writable } from 'svelte/store'");
  expect(storeSource).toContain('export const peerConnections = writable({})');
  expect(storeSource).toContain('export const onlinePeers = writable([])');
  expect(storeSource).toContain('export const typingUsers = writable({})');
  expect(storeSource).not.toContain('peerJsManager');
  expect(facadeSource).toContain("import { peerConnections, onlinePeers, typingUsers } from './peerManagerStores.js'");
  expect(facadeSource).toContain('export { peerConnections, onlinePeers, typingUsers }');
  expect(contactsSource).toContain("import { peerConnections } from '../services/peerManagerStores.js'");
  expect(contactsSource).not.toContain("from '../services/peerJsManager.js'");
});
