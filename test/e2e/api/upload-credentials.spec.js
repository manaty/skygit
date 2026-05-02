import { test, expect } from '@playwright/test';
import { getRecordingUploadCredentials } from '../../../src/utils/uploadCredentials.js';

test('getRecordingUploadCredentials prefers repo credential when configured', () => {
  const result = getRecordingUploadCredentials(
    {
      's3://user-bucket': { type: 's3', bucket: 'user' },
      's3://repo-bucket': { type: 's3', bucket: 'repo' },
      'drive://user': { type: 'google_drive', folder: 'user-drive' }
    },
    {
      storage_info: {
        url: 's3://repo-bucket'
      }
    }
  );

  expect(result.availableDestinations).toEqual(['s3', 'google_drive']);
  expect(result.credentials.s3.bucket).toBe('repo');
  expect(result.credentials.google_drive.folder).toBe('user-drive');
});

test('getRecordingUploadCredentials returns no destinations without matching credentials', () => {
  const result = getRecordingUploadCredentials({}, {
    storage_info: {
      url: 'missing'
    }
  });

  expect(result.availableDestinations).toEqual([]);
  expect(result.credentials).toEqual({
    s3: null,
    google_drive: null
  });
});
