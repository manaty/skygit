import { test, expect } from '@playwright/test';
import {
  addPeerConnectionToState,
  getConversationSyncRequests,
  getLocalPeerConnectionReadiness,
  getPeerConnectionUsername,
  hasPeerConnection,
  markPeerConnectionFailed,
  OUTGOING_CONNECTION_RETRY_DELAY_MS,
  processClosedPeerConnection,
  processOpenedPeerConnection,
  REMOVED_CONNECTION_RETRY_DELAY_MS,
  removePeerConnectionFromState,
  removePeerTypingUser,
  sendConversationSyncRequests
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

test('processOpenedPeerConnection stores the connection and triggers contact, UI, and sync updates', () => {
  const calls = [];
  let connectionState = {};
  const connection = {
    peer: 'peer-a',
    metadata: { username: 'alice' }
  };

  expect(processOpenedPeerConnection({
    connection,
    updatePeerConnections: (updater) => {
      connectionState = updater(connectionState);
      calls.push(['connections']);
    },
    updateContact: (...args) => calls.push(['contact', ...args]),
    updateOnlinePeers: () => calls.push(['online']),
    syncConversationsWithPeer: (...args) => calls.push(['sync', ...args]),
    log: (...args) => calls.push(['log', ...args])
  })).toEqual({
    peerId: 'peer-a',
    username: 'alice'
  });

  expect(connectionState).toEqual({
    'peer-a': {
      conn: connection,
      status: 'connected',
      username: 'alice'
    }
  });
  expect(calls[0]).toEqual(['log', '[PeerJS] Adding peer connection:', 'peer-a', 'username:', 'alice']);
  expect(calls[1]).toEqual(['connections']);
  expect(calls[2][0]).toBe('contact');
  expect(calls[2][1]).toBe('alice');
  expect(calls[2][2]).toMatchObject({ online: true, peerId: 'peer-a' });
  expect(calls[3]).toEqual(['online']);
  expect(calls[4]).toEqual(['sync', 'peer-a']);
});

test('processOpenedPeerConnection lets explicit usernames override connection metadata', () => {
  let connectionState = {};

  expect(processOpenedPeerConnection({
    connection: {
      peer: 'peer-a',
      metadata: { username: 'alice' }
    },
    username: 'bob',
    updatePeerConnections: (updater) => {
      connectionState = updater(connectionState);
    },
    updateContact: () => {},
    updateOnlinePeers: () => {},
    syncConversationsWithPeer: () => {}
  })).toMatchObject({ username: 'bob' });
  expect(connectionState['peer-a'].username).toBe('bob');
});

test('processClosedPeerConnection removes peer state, updates contact, and marks retry delay', () => {
  const calls = [];
  const failedConnections = new Set();
  const peerRegistry = new Map([
    ['peer-a', { username: 'alice' }]
  ]);
  let connectionState = {
    'peer-a': { username: 'alice' },
    'peer-b': { username: 'bob' }
  };
  let typingState = {
    'peer-a': { isTyping: true }
  };

  expect(processClosedPeerConnection({
    peerId: 'peer-a',
    connections: connectionState,
    updatePeerConnections: (updater) => {
      connectionState = updater(connectionState);
      calls.push(['connections']);
    },
    updateTypingUsers: (updater) => {
      typingState = updater(typingState);
      calls.push(['typing']);
    },
    updateContact: (...args) => calls.push(['contact', ...args]),
    updateOnlinePeers: () => calls.push(['online']),
    peerRegistry,
    isCurrentLeader: true,
    broadcastPeerListUpdate: () => calls.push(['broadcast']),
    failedConnections,
    retryDelayMs: 10,
    log: (...args) => calls.push(['log', ...args])
  })).toBe('alice');

  expect(connectionState).toEqual({
    'peer-b': { username: 'bob' }
  });
  expect(typingState).toEqual({});
  expect(peerRegistry.has('peer-a')).toBe(false);
  expect(failedConnections.has('peer-a')).toBe(true);
  expect(calls).toContainEqual(['contact', 'alice', expect.objectContaining({ online: false })]);
  expect(calls).toContainEqual(['broadcast']);
  expect(calls).toContainEqual(['online']);
});

test('processClosedPeerConnection tolerates missing contact usernames', () => {
  const calls = [];
  const failedConnections = new Set();

  expect(processClosedPeerConnection({
    peerId: 'peer-a',
    connections: {},
    updatePeerConnections: (updater) => updater({}),
    updateTypingUsers: (updater) => updater({}),
    updateContact: (...args) => calls.push(['contact', ...args]),
    updateOnlinePeers: () => calls.push(['online']),
    peerRegistry: new Map(),
    isCurrentLeader: false,
    broadcastPeerListUpdate: () => calls.push(['broadcast']),
    failedConnections,
    retryDelayMs: 10
  })).toBeNull();
  expect(calls).toEqual([['online']]);
  expect(failedConnections.has('peer-a')).toBe(true);
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

test('sendConversationSyncRequests sends only hashed repo conversation sync requests', () => {
  const sent = [];
  const logs = [];
  const requests = sendConversationSyncRequests(
    'peer-a',
    {
      'manaty/skygit': [
        { id: 'empty', messages: [] },
        { id: 'missing-hash', messages: [{ content: 'hello' }] },
        { id: 'ready', messages: [{ hash: 'old' }, { hash: 'new' }] }
      ],
      'manaty/docs': [
        { id: 'other-repo', messages: [{ hash: 'other' }] }
      ]
    },
    'manaty/skygit',
    (peerId, conversationId, lastHash) => sent.push([peerId, conversationId, lastHash]),
    (...args) => logs.push(args)
  );

  expect(requests).toEqual([{ conversationId: 'ready', lastHash: 'new' }]);
  expect(sent).toEqual([['peer-a', 'ready', 'new']]);
  expect(logs).toEqual([
    ['[PeerJS] Requesting sync for conversation:', 'ready', 'last hash:', 'new']
  ]);
});
