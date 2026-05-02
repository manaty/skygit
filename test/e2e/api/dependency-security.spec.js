import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import packageJson from '../../../package.json' with { type: 'json' };

test('dependency policy pins patched uuid and serialize-javascript versions', () => {
  expect(packageJson.dependencies.uuid).toMatch(/^\^14\./);
  expect(packageJson.overrides['serialize-javascript']).toBe('^7.0.5');
});

test('ci workflow runs build, audit, and both e2e suites', async () => {
  const workflow = await readFile('.github/workflows/ci.yml', 'utf8');

  expect(workflow).toContain('npm audit');
  expect(workflow).toContain('npm run build');
  expect(workflow).toContain('npm run test:e2e:api');
  expect(workflow).toContain('npm run test:e2e:ui');
});
