import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('recorder service does not emit routine recording lifecycle logs', async () => {
  const source = await readFile('src/services/recorderService.js', 'utf8');

  expect(source).not.toContain('[Recorder] Started recording');
  expect(source).not.toContain('[Recorder] Stopped recording');
  expect(source).not.toContain('console.log');
});
