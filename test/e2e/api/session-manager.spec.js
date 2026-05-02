import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('sessionManager does not print session identifiers to console', async () => {
  const source = await readFile('src/utils/sessionManager.js', 'utf8');

  expect(source).not.toContain('console.log');
  expect(source).not.toContain('[SessionManager]');
  expect(source).not.toContain("'ID:', sessionId");
});
