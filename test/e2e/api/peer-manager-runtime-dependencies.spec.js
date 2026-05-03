import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('peer manager facade delegates app dependency assembly to a dedicated module', async () => {
  const facadeSource = await readFile('src/services/peerJsManager.js', 'utf8');
  const dependencySource = await readFile('src/services/peerManagerRuntimeDependencies.js', 'utf8');

  expect(facadeSource).toContain("import { createPeerManagerRuntimeDependencies } from './peerManagerRuntimeDependencies.js'");
  expect(facadeSource).toContain('createPeerManagerRuntime(createPeerManagerRuntimeDependencies({');
  expect(facadeSource).toContain('PeerClass: Peer');
  expect(facadeSource).toContain('peerStores');
  expect(facadeSource).not.toContain("from '../stores/conversationStore.js'");
  expect(facadeSource).not.toContain("from '../stores/authStore.js'");
  expect(facadeSource).not.toContain("from '../stores/callStore.js'");
  expect(dependencySource).toContain("from '../stores/conversationStore.js'");
  expect(dependencySource).toContain("from '../stores/authStore.js'");
  expect(dependencySource).toContain("from '../stores/callStore.js'");
  expect(dependencySource).toContain('export function createPeerManagerRuntimeDependencies');
  expect(dependencySource).toContain('callStores: {');
  expect(dependencySource).toContain('resetCallState');
});
