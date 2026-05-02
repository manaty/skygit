import { test, expect } from '@playwright/test';
import packageJson from '../../../package.json' with { type: 'json' };

test('dependency policy pins patched uuid and serialize-javascript versions', () => {
  expect(packageJson.dependencies.uuid).toMatch(/^\^14\./);
  expect(packageJson.overrides['serialize-javascript']).toBe('^7.0.5');
});
