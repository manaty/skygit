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
