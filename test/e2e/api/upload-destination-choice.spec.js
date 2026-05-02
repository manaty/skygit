import { test, expect } from '@playwright/test';
import { chooseRecordingUploadDestination } from '../../../src/utils/uploadDestinationChoice.js';

test('chooseRecordingUploadDestination returns null when no destination is available', () => {
  const result = chooseRecordingUploadDestination([], () => 's3');

  expect(result).toBeNull();
});

test('chooseRecordingUploadDestination auto-selects the only destination', () => {
  const result = chooseRecordingUploadDestination(['google_drive'], () => 's3');

  expect(result).toBe('google_drive');
});

test('chooseRecordingUploadDestination delegates to the UI when multiple destinations are available', async () => {
  const result = await chooseRecordingUploadDestination(['google_drive', 's3'], () => Promise.resolve('s3'));

  expect(result).toBe('s3');
});
