import { test, expect } from '@playwright/test';
import {
  broadcastPeerMessage,
  broadcastPeerMessageToAll,
  broadcastPeerTypingStatus,
  requestPeerMessageSync,
  requestPeerSyncWithHashChain,
  sendPeerMessage
} from '../../../src/utils/peerMessageActions.js';

function createConnection(open = true) {
  const calls = [];
  return {
    open,
    calls,
    send: (message) => calls.push(message)
  };
}

test('sendPeerMessage sends through connected peer entries and warns when missing', () => {
  const connection = createConnection();
  const calls = [];

  expect(sendPeerMessage({
    peerId: 'peer-a',
    message: { type: 'chat' },
    connections: {
      'peer-a': { conn: connection, status: 'connected' }
    },
    log: (...args) => calls.push(['log', ...args]),
    warn: (...args) => calls.push(['warn', ...args])
  })).toBe(true);

  expect(sendPeerMessage({
    peerId: 'missing-peer',
    message: { type: 'chat' },
    connections: {},
    warn: (...args) => calls.push(['warn', ...args])
  })).toBe(false);

  expect(connection.calls).toEqual([{ type: 'chat' }]);
  expect(calls).toContainEqual(['log', '[PeerJS] Message sent successfully']);
  expect(calls).toContainEqual(['warn', '[PeerJS] No connection found for peer:', 'missing-peer']);
});

test('broadcastPeerMessage delegates participant filtering to broadcast utilities', () => {
  const connected = createConnection();
  const ignored = createConnection();
  const calls = [];

  broadcastPeerMessage({
    message: { type: 'chat' },
    conversationId: 'conversation-a',
    connections: {
      'peer-a': { conn: connected, status: 'connected', username: 'alice' },
      'peer-b': { conn: ignored, status: 'connected', username: 'bob' }
    },
    participants: [{ peerId: 'peer-a', username: 'alice' }],
    log: (...args) => calls.push(['log', ...args]),
    warn: (...args) => calls.push(['warn', ...args]),
    error: (...args) => calls.push(['error', ...args])
  });

  expect(connected.calls).toEqual([{ type: 'chat' }]);
  expect(ignored.calls).toEqual([]);
  expect(calls).toContainEqual(['log', '[PeerJS] Broadcasting message:', { type: 'chat' }, 'to conversation:', 'conversation-a']);
});

test('broadcastPeerMessageToAll sends to every open connected peer', () => {
  const openConnection = createConnection();
  const closedConnection = createConnection(false);

  broadcastPeerMessageToAll({
    message: { type: 'typing' },
    connections: {
      'peer-a': { conn: openConnection, status: 'connected' },
      'peer-b': { conn: closedConnection, status: 'connected' }
    }
  });

  expect(openConnection.calls).toEqual([{ type: 'typing' }]);
  expect(closedConnection.calls).toEqual([]);
});

test('sync request actions build and send protocol messages', () => {
  const calls = [];

  expect(requestPeerMessageSync({
    peerId: 'peer-a',
    conversationId: 'conversation-a',
    lastHash: 'h1',
    sendMessageToPeer: (...args) => calls.push(args),
    log: (...args) => calls.push(['log', ...args])
  })).toEqual({
    type: 'sync_request',
    conversationId: 'conversation-a',
    lastHash: 'h1',
    timestamp: expect.any(Number)
  });

  expect(requestPeerSyncWithHashChain({
    peerId: 'peer-b',
    conversationId: 'conversation-b',
    hashChain: ['h3', 'h2'],
    sendMessageToPeer: (...args) => calls.push(args),
    log: (...args) => calls.push(['log', ...args])
  })).toEqual({
    type: 'sync_request_chain',
    conversationId: 'conversation-b',
    hashChain: ['h3', 'h2'],
    timestamp: expect.any(Number)
  });

  const sentMessages = calls.filter(([peerId]) => String(peerId).startsWith('peer-'));
  expect(sentMessages[0][0]).toBe('peer-a');
  expect(sentMessages[0][1].type).toBe('sync_request');
  expect(sentMessages[1][0]).toBe('peer-b');
  expect(sentMessages[1][1].type).toBe('sync_request_chain');
});

test('broadcastPeerTypingStatus builds a typing message and broadcasts it', () => {
  const calls = [];

  expect(broadcastPeerTypingStatus(true, (message) => calls.push(message))).toEqual({
    type: 'typing',
    isTyping: true,
    timestamp: expect.any(Number)
  });

  expect(calls).toHaveLength(1);
  expect(calls[0].isTyping).toBe(true);
});
