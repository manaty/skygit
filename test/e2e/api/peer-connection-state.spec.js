import { test, expect } from '@playwright/test';
import {
  createOfflineContactUpdate,
  createOnlineContactUpdate,
  createPeerConnectionEntry,
  createPeerConnectionMetadata,
  getConnectionUsername
} from '../../../src/utils/peerConnectionState.js';

test('createPeerConnectionMetadata builds outbound PeerJS metadata', () => {
  expect(createPeerConnectionMetadata('alice', 'manaty/skygit', 'session-a')).toEqual({
    username: 'alice',
    repo: 'manaty/skygit',
    sessionId: 'session-a'
  });
});

test('getConnectionUsername prefers explicit usernames before metadata fallback', () => {
  expect(getConnectionUsername({ metadata: { username: 'metadata-user' } }, 'explicit-user')).toBe('explicit-user');
  expect(getConnectionUsername({ metadata: { username: 'metadata-user' } })).toBe('metadata-user');
  expect(getConnectionUsername({})).toBe('Unknown');
});

test('createPeerConnectionEntry stores the connected peer state', () => {
  const conn = { peer: 'peer-a' };

  expect(createPeerConnectionEntry(conn, 'alice')).toEqual({
    conn,
    status: 'connected',
    username: 'alice'
  });
});

test('contact update helpers build online and offline patches', () => {
  expect(createOnlineContactUpdate('peer-a', 1234)).toEqual({
    online: true,
    lastSeen: 1234,
    peerId: 'peer-a'
  });

  expect(createOfflineContactUpdate(5678)).toEqual({
    online: false,
    lastSeen: 5678
  });
});
