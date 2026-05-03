import { test, expect } from '@playwright/test';
import {
  createRecordingMessage,
  uploadAndShareConversationRecording,
  uploadRecordingToDestination
} from '../../../src/services/conversationRecordingUploadService.js';

test('recording upload helpers create chat messages and route uploads by destination', async () => {
  const blob = { type: 'video/webm' };
  const calls = [];

  expect(createRecordingMessage('https://example.com/video.webm')).toEqual({
    type: 'chat',
    content: '📹 Recording: https://example.com/video.webm'
  });

  await expect(uploadRecordingToDestination({
    blob,
    destination: 's3',
    credentials: 's3-creds',
    uploadToS3: async (...args) => {
      calls.push(['s3', ...args]);
      return 's3-link';
    },
    uploadToGoogleDrive: async () => 'drive-link'
  })).resolves.toBe('s3-link');

  await expect(uploadRecordingToDestination({
    blob,
    destination: 'google_drive',
    credentials: 'drive-creds',
    uploadToS3: async () => 's3-link',
    uploadToGoogleDrive: async (...args) => {
      calls.push(['drive', ...args]);
      return 'drive-link';
    }
  })).resolves.toBe('drive-link');

  await expect(uploadRecordingToDestination({
    blob,
    destination: 'unknown',
    credentials: {},
    uploadToS3: async () => 's3-link',
    uploadToGoogleDrive: async () => 'drive-link'
  })).resolves.toBeNull();

  expect(calls).toEqual([
    ['s3', blob, 's3-creds'],
    ['drive', blob, 'drive-creds']
  ]);
});

test('uploadAndShareConversationRecording uploads, sends the recording link, and alerts the user', async () => {
  const calls = [];

  const result = await uploadAndShareConversationRecording({
    blob: 'blob',
    decryptedSettings: { setting: true },
    repoConfig: { repo: true },
    chooseUploadDestination: async () => 's3',
    uploadToS3: async (...args) => {
      calls.push(['uploadToS3', ...args]);
      return 'https://example.com/recording.webm';
    },
    uploadToGoogleDrive: async () => null,
    sendMessageToPeer: (...args) => calls.push(['sendMessageToPeer', ...args]),
    currentCallPeer: 'peer-a',
    alertUser: message => calls.push(['alert', message]),
    getCredentials: (settings, repoConfig) => {
      calls.push(['getCredentials', settings, repoConfig]);
      return { credentials: { s3: 's3-creds' } };
    }
  });

  expect(result).toEqual({
    status: 'shared',
    destination: 's3',
    link: 'https://example.com/recording.webm'
  });
  expect(calls).toEqual([
    ['getCredentials', { setting: true }, { repo: true }],
    ['uploadToS3', 'blob', 's3-creds'],
    ['sendMessageToPeer', 'peer-a', {
      type: 'chat',
      content: '📹 Recording: https://example.com/recording.webm'
    }],
    ['alert', 'Recording uploaded and link shared!']
  ]);
});

test('uploadAndShareConversationRecording reports missing destinations and upload failures', async () => {
  const missingCalls = [];
  await expect(uploadAndShareConversationRecording({
    blob: 'blob',
    decryptedSettings: {},
    repoConfig: {},
    chooseUploadDestination: async () => null,
    uploadToS3: async () => null,
    uploadToGoogleDrive: async () => null,
    sendMessageToPeer: () => {},
    currentCallPeer: 'peer-a',
    alertUser: message => missingCalls.push(['alert', message]),
    getCredentials: () => ({ credentials: {} })
  })).resolves.toEqual({ status: 'missing_destination' });
  expect(missingCalls).toEqual([
    ['alert', 'No upload destination (S3 or Google Drive) configured.']
  ]);

  const error = new Error('upload failed');
  const failedCalls = [];
  await expect(uploadAndShareConversationRecording({
    blob: 'blob',
    decryptedSettings: {},
    repoConfig: {},
    chooseUploadDestination: async () => 'google_drive',
    uploadToS3: async () => null,
    uploadToGoogleDrive: async () => { throw error; },
    sendMessageToPeer: () => failedCalls.push(['send']),
    currentCallPeer: 'peer-a',
    alertUser: message => failedCalls.push(['alert', message]),
    getCredentials: () => ({ credentials: { google_drive: 'drive-creds' } })
  })).resolves.toEqual({ status: 'failed', destination: 'google_drive', error });
  expect(failedCalls).toEqual([
    ['alert', 'upload failed']
  ]);
});
