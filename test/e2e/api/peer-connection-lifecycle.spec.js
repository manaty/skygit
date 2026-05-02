import { test, expect } from '@playwright/test';
import {
  addPeerConnectionToState,
  getConversationSyncRequests,
  getLocalPeerConnectionReadiness,
  getPeerConnectionUsername,
  hasPeerConnection,
  markPeerConnectionFailed,
  OUTGOING_CONNECTION_RETRY_DELAY_MS,
  REMOVED_CONNECTION_RETRY_DELAY_MS,
  removePeerConnectionFromState,
  removePeerTypingUser
} from '../../../src/utils/peerConnectionLifecycle.js';

test('getLocalPeerConnectionReadiness classifies PeerJS connection availability', () => {
  expect(getLocalPeerConnectionReadiness(null)).toBe('missing');
  expect(getLocalPeerConnectionReadiness({ open: false })).toBe('closed');
  expect(getLocalPeerConnectionReadiness({ open: true })).toBe('ready');
});

test('peer connection state helpers add, read, and remove connections', () => {
  const state = {};
  const entry = { conn: { peer: 'peer-a' }, username: 'alice' };

  expect(hasPeerConnection(state, 'peer-a')).toBe(false);
  expect(addPeerConnectionToState(state, 'peer-a', entry)).toBe(state);
  expect(hasPeerConnection(state, 'peer-a')).toBe(true);
  expect(getPeerConnectionUsername(state, 'peer-a')).toBe('alice');
  expect(getPeerConnectionUsername(state, 'peer-b')).toBeNull();
  expect(removePeerConnectionFromState(state, 'peer-a')).toBe(state);
  expect(state).toEqual({});
});

test('removePeerTypingUser deletes the disconnected peer typing status', () => {
  const users = {
    'peer-a': { isTyping: true },
    'peer-b': { isTyping: true }
  };

  expect(removePeerTypingUser(users, 'peer-a')).toBe(users);
  expect(users).toEqual({
    'peer-b': { isTyping: true }
  });
});

test('markPeerConnectionFailed records a peer until the retry delay expires', () => {
  const failedConnections = new Set();
  let timeoutCallback;
  const timers = [];

  const timer = markPeerConnectionFailed(failedConnections, 'peer-a', OUTGOING_CONNECTION_RETRY_DELAY_MS, (callback, delay) => {
    timeoutCallback = callback;
    timers.push(delay);
    return 11;
  });

  expect(timer).toBe(11);
  expect(failedConnections.has('peer-a')).toBe(true);
  expect(timers).toEqual([OUTGOING_CONNECTION_RETRY_DELAY_MS]);

  timeoutCallback();
  expect(failedConnections.has('peer-a')).toBe(false);
  expect(REMOVED_CONNECTION_RETRY_DELAY_MS).toBe(5000);
});

test('getConversationSyncRequests returns last hashes for conversations with messages', () => {
  expect(getConversationSyncRequests([
    { id: 'empty', messages: [] },
    { id: 'missing' },
    { id: 'without-hash', messages: [{ content: 'hello' }] },
    { id: 'with-hash', messages: [{ hash: 'old' }, { hash: 'new' }] }
  ])).toEqual([
    { conversationId: 'with-hash', lastHash: 'new' }
  ]);
});
