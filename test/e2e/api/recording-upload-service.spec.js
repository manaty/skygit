import { test, expect } from '@playwright/test';
import {
  getGoogleAccessToken,
  uploadRecordingToS3
} from '../../../src/services/recordingUploadService.js';

test('uploadRecordingToS3 validates required credential fields', async () => {
  await expect(uploadRecordingToS3(new Blob(['video']), { bucket: 'demo' }, async () => {
    throw new Error('fetch should not be called');
  })).rejects.toThrow('S3 credential missing bucket or region.');
});

test('getGoogleAccessToken exchanges a refresh token with Google OAuth', async () => {
  const calls = [];
  const fetchImpl = async (url, options) => {
    calls.push({ url, options });
    return {
      ok: true,
      json: async () => ({ access_token: 'access-token-123' })
    };
  };

  const token = await getGoogleAccessToken({
    client_id: 'client-id',
    client_secret: 'client-secret',
    refresh_token: 'refresh-token'
  }, fetchImpl);

  expect(token).toBe('access-token-123');
  expect(calls).toHaveLength(1);
  expect(calls[0].url).toBe('https://oauth2.googleapis.com/token');
  expect(calls[0].options.method).toBe('POST');
  expect(calls[0].options.body).toContain('grant_type=refresh_token');
  expect(calls[0].options.body).toContain('refresh_token=refresh-token');
});
