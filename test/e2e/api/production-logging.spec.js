import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('recorder service does not emit routine recording lifecycle logs', async () => {
  const source = await readFile('src/services/recorderService.js', 'utf8');

  expect(source).not.toContain('[Recorder] Started recording');
  expect(source).not.toContain('[Recorder] Stopped recording');
  expect(source).not.toContain('console.log');
});

test('conversation service does not emit conversation payloads to console', async () => {
  const source = await readFile('src/services/conversationService.js', 'utf8');

  expect(source).not.toContain('console.log');
  expect(source).not.toContain('⏩ Payload');
  expect(source).not.toContain('Conversation to remove');
  expect(source).not.toContain('createConversation called');
});

test('peer manager shutdown avoids routine production lifecycle logs', async () => {
  const source = await readFile('src/services/peerJsManager.js', 'utf8');
  const shutdownSource = source.slice(
    source.indexOf('export function shutdownPeerManager'),
    source.indexOf('// Initialize PeerJS connection')
  );

  expect(shutdownSource).not.toContain('console.log');
  expect(shutdownSource).not.toContain('Shutting down peer manager');
  expect(shutdownSource).not.toContain('Shutdown complete');
});

test('startup service does not emit routine startup progress logs', async () => {
  const source = await readFile('src/services/startupService.js', 'utf8');

  expect(source).not.toContain('console.log');
  expect(source).not.toContain('Streaming saved repos');
  expect(source).not.toContain('Streaming saved conversations');
  expect(source).not.toContain('Loaded conversations from localStorage');
});

test('SidebarChats does not emit routine auto-discovery logs', async () => {
  const source = await readFile('src/components/SidebarChats.svelte', 'utf8');

  expect(source).not.toContain('console.log');
  expect(source).not.toContain('Auto-discovering conversations');
});

test('Repos route does not emit routine discovery or creation logs', async () => {
  const source = await readFile('src/routes/Repos.svelte', 'utf8');

  expect(source).not.toContain('console.log');
  expect(source).not.toContain('Auto-discovering conversations');
  expect(source).not.toContain('handleCreate() called');
});
