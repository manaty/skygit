import { test, expect } from '@playwright/test';
import {
  createSecretsFileBody,
  shouldStoreEncryptedCredentials
} from '../../../src/services/githubSecretsService.js';

test('github secrets service builds secrets file write bodies', () => {
  const body = createSecretsFileBody({ s3: 'encrypted' }, 'sha-123');

  expect(body.message).toBe('Update secrets.json');
  expect(JSON.parse(decodeURIComponent(escape(atob(body.content))))).toEqual({ s3: 'encrypted' });
  expect(body.sha).toBe('sha-123');
});

test('github secrets service skips empty credential references', () => {
  expect(shouldStoreEncryptedCredentials({
    config: {
      storage_info: {
        credentials: {}
      }
    }
  })).toBe(false);

  expect(shouldStoreEncryptedCredentials({
    config: {
      storage_info: {
        credentials: { accessKeyId: 'key' }
      }
    }
  })).toBe(true);
});
