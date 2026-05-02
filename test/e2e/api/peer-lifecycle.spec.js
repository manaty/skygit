import { test, expect } from '@playwright/test';
import {
  clearTimer,
  closeConnection,
  closeOpenConnections,
  createPeerManagerSession,
  createPeerJsOptions,
  destroyPeer,
  isSameOpenPeerSession,
  normalizePeerUsername,
  resetPeerStores
} from '../../../src/utils/peerLifecycle.js';

test('isSameOpenPeerSession matches only the current open repo session', () => {
  expect(isSameOpenPeerSession({ open: true }, 'org/repo', 'session-a', 'org/repo', 'session-a')).toBe(true);
  expect(isSameOpenPeerSession({ open: false }, 'org/repo', 'session-a', 'org/repo', 'session-a')).toBe(false);
  expect(isSameOpenPeerSession({ open: true }, 'org/repo', 'session-a', 'org/other', 'session-a')).toBe(false);
  expect(isSameOpenPeerSession({ open: true }, 'org/repo', 'session-a', 'org/repo', 'session-b')).toBe(false);
});

test('normalizePeerUsername lowercases missing and provided usernames safely', () => {
  expect(normalizePeerUsername('Alice')).toBe('alice');
  expect(normalizePeerUsername()).toBe('');
});

test('createPeerJsOptions keeps the shared PeerJS server configuration', () => {
  expect(createPeerJsOptions()).toEqual({
    debug: 2,
    config: {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }
      ]
    }
  });
});

test('createPeerManagerSession normalizes identity and packages PeerJS options', () => {
  expect(createPeerManagerSession(
    'Org/Repo',
    'Alice',
    'session-1',
    (repo, username, sessionId) => `${repo}:${username}:${sessionId}`
  )).toEqual({
    repoFullName: 'Org/Repo',
    username: 'alice',
    sessionId: 'session-1',
    peerId: 'Org/Repo:alice:session-1',
    peerOptions: createPeerJsOptions()
  });
});

test('clearTimer clears existing timers and returns a null assignment value', () => {
  const cleared = [];

  expect(clearTimer(42, (timer) => cleared.push(timer))).toBeNull();
  expect(cleared).toEqual([42]);
  expect(clearTimer(null, (timer) => cleared.push(timer))).toBeNull();
  expect(cleared).toEqual([42]);
});

test('closeOpenConnections closes only open peer connections and reports every entry', () => {
  const closed = [];
  const seen = [];
  const connections = {
    'peer-a': { conn: { open: true, close: () => closed.push('peer-a') } },
    'peer-b': { conn: { open: false, close: () => closed.push('peer-b') } },
    'peer-c': {}
  };

  closeOpenConnections(connections, (peerId) => seen.push(peerId));

  expect(seen).toEqual(['peer-a', 'peer-b', 'peer-c']);
  expect(closed).toEqual(['peer-a']);
});

test('closeConnection and destroyPeer clean up nullable resources', () => {
  const calls = [];

  expect(closeConnection({ close: () => calls.push('close') })).toBeNull();
  expect(destroyPeer({ destroy: () => calls.push('destroy') })).toBeNull();
  expect(closeConnection(null)).toBeNull();
  expect(destroyPeer(null)).toBeNull();
  expect(calls).toEqual(['close', 'destroy']);
});

test('resetPeerStores restores all peer manager stores to empty values', () => {
  const updates = [];
  const makeStore = (name) => ({ set: (value) => updates.push([name, value]) });

  resetPeerStores({
    peerConnections: makeStore('connections'),
    onlinePeers: makeStore('online'),
    typingUsers: makeStore('typing')
  });

  expect(updates).toEqual([
    ['connections', {}],
    ['online', []],
    ['typing', {}]
  ]);
});
