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

test('deployed e2e scripts target GitHub Pages with configurable base URL', async () => {
  const playwrightConfig = await readFile('playwright.config.js', 'utf8');

  expect(packageJson.scripts['test:e2e:deployed:api']).toContain('PLAYWRIGHT_BASE_URL=https://manaty.net/skygit/');
  expect(packageJson.scripts['test:e2e:deployed:ui']).toContain('PLAYWRIGHT_BASE_URL=https://manaty.net/skygit/');
  expect(packageJson.scripts['test:e2e:deployed:ui']).toContain('PLAYWRIGHT_SKIP_WEB_SERVER=1');
  expect(playwrightConfig).toContain('process.env.PLAYWRIGHT_BASE_URL');
});
