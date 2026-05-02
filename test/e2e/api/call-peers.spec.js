import { test, expect } from '@playwright/test';
import { getAvailableCallPeers } from '../../../src/utils/callPeers.js';

test('getAvailableCallPeers excludes the local peer by session id', () => {
  const peers = [
    { session_id: 'local-session', username: 'alice' },
    { session_id: 'remote-session', username: 'alice' }
  ];

  expect(getAvailableCallPeers(peers, 'local-session', null)).toEqual([
    { session_id: 'remote-session', username: 'alice' }
  ]);
});

test('getAvailableCallPeers keeps only conversation participants when listed', () => {
  const peers = [
    { session_id: 'alice-phone', username: 'alice' },
    { session_id: 'bob-laptop', username: 'bob' },
    { session_id: 'mallory-tab', username: 'mallory' }
  ];

  expect(getAvailableCallPeers(peers, 'alice-phone', {
    participants: ['alice', 'bob']
  })).toEqual([
    { session_id: 'bob-laptop', username: 'bob' }
  ]);
});

test('getAvailableCallPeers allows any connected remote peer without participants', () => {
  const peers = [
    { session_id: 'local-session', username: 'alice' },
    { session_id: 'remote-session', username: 'mallory' }
  ];

  expect(getAvailableCallPeers(peers, 'local-session', { participants: [] })).toEqual([
    { session_id: 'remote-session', username: 'mallory' }
  ]);
});
