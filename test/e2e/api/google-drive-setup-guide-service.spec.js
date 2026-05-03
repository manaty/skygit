import { test, expect } from '@playwright/test';
import {
  GOOGLE_DRIVE_SCOPE,
  GOOGLE_DRIVE_SETUP_STEPS,
  GOOGLE_OAUTH_PLAYGROUND_URL,
  buildGoogleDriveAuthorizationUrl,
  buildGoogleDriveTokenExchangeScript,
  createInitialGoogleDriveCredentials,
  getAppBaseUrl,
  getSuggestedGoogleDriveFolderName,
  isGoogleDriveSetupComplete
} from '../../../src/services/googleDriveSetupGuideService.js';

test('google drive setup guide service provides setup defaults', () => {
  expect(GOOGLE_DRIVE_SETUP_STEPS).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  expect(GOOGLE_DRIVE_SCOPE).toBe('https://www.googleapis.com/auth/drive.file');
  expect(GOOGLE_OAUTH_PLAYGROUND_URL).toBe('https://developers.google.com/oauthplayground');
  expect(createInitialGoogleDriveCredentials()).toEqual({
    client_id: '',
    client_secret: '',
    refresh_token: '',
    folder_url: ''
  });
});

test('google drive setup guide service derives app and folder labels', () => {
  expect(getSuggestedGoogleDriveFolderName({ user: { login: 'alice' } })).toBe('SkyGit-alice');
  expect(getSuggestedGoogleDriveFolderName(null)).toBe('SkyGit-user');
  expect(getAppBaseUrl({ protocol: 'https:', hostname: 'manaty.net', port: '' })).toBe('https://manaty.net');
  expect(getAppBaseUrl({ protocol: 'http:', hostname: 'localhost', port: '5173' })).toBe('http://localhost:5173');
});

test('google drive setup guide service builds oauth helper content', () => {
  const authUrl = buildGoogleDriveAuthorizationUrl({
    clientId: 'client-123',
    redirectUri: 'https://manaty.net/skygit'
  });
  const parsed = new URL(authUrl);

  expect(parsed.origin + parsed.pathname).toBe('https://accounts.google.com/o/oauth2/v2/auth');
  expect(parsed.searchParams.get('client_id')).toBe('client-123');
  expect(parsed.searchParams.get('redirect_uri')).toBe('https://manaty.net/skygit');
  expect(parsed.searchParams.get('scope')).toBe(GOOGLE_DRIVE_SCOPE);

  const script = buildGoogleDriveTokenExchangeScript({
    clientId: 'client-123',
    clientSecret: 'secret-456'
  });

  expect(script).toContain('CLIENT_ID = "client-123"');
  expect(script).toContain('CLIENT_SECRET = "secret-456"');
  expect(script).toContain('https://oauth2.googleapis.com/token');
});

test('google drive setup guide service validates required credentials', () => {
  expect(isGoogleDriveSetupComplete({
    client_id: 'id',
    client_secret: 'secret',
    refresh_token: 'refresh',
    folder_url: 'https://drive.google.com/drive/folders/folder'
  })).toBe(true);

  expect(isGoogleDriveSetupComplete({
    client_id: 'id',
    client_secret: '',
    refresh_token: 'refresh',
    folder_url: 'https://drive.google.com/drive/folders/folder'
  })).toBe(false);
});
