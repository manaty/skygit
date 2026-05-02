import { test, expect } from '@playwright/test';
import {
  bindIncomingPeerDataConnection,
  bindOutgoingPeerDataConnection,
  connectToOutgoingPeer,
  getIncomingConnectionUsername
} from '../../../src/utils/peerDataConnections.js';

function createConnection(peer = 'remote-peer', metadata = {}) {
  const handlers = new Map();

  return {
    peer,
    metadata,
    boundEvents: [],
    on(eventName, handler) {
      this.boundEvents.push(eventName);
      handlers.set(eventName, handler);
    },
    emit(eventName, payload) {
      handlers.get(eventName)?.(payload);
    }
  };
}

function createPeer({ open = true } = {}) {
  return {
    id: 'local-peer',
    open,
    connectCalls: [],
    connect(peerId, options) {
      this.connectCalls.push({ peerId, options });
      return createConnection(peerId, options.metadata);
    }
  };
}

test('getIncomingConnectionUsername normalizes metadata usernames', () => {
  expect(getIncomingConnectionUsername(createConnection('peer-a', { username: 'Alice' }))).toBe('alice');
  expect(getIncomingConnectionUsername(createConnection('peer-b'))).toBe('unknown');
});

test('bindIncomingPeerDataConnection wires peer lifecycle callbacks', () => {
  const connection = createConnection('peer-a', { username: 'Alice' });
  const calls = [];

  bindIncomingPeerDataConnection(connection, {
    addPeerConnection: (conn, username) => calls.push(['add', conn === connection, username]),
    handlePeerMessage: (data, peerId, username) => calls.push(['message', data, peerId, username]),
    removePeerConnection: (peerId) => calls.push(['remove', peerId]),
    log: (...args) => calls.push(['log', ...args]),
    reportError: (...args) => calls.push(['error', ...args])
  });

  const error = new Error('boom');
  connection.emit('open');
  connection.emit('data', { type: 'chat' });
  connection.emit('close');
  connection.emit('error', error);

  expect(connection.boundEvents).toEqual(['open', 'data', 'close', 'error']);
  expect(calls).toContainEqual(['add', true, 'alice']);
  expect(calls).toContainEqual(['message', { type: 'chat' }, 'peer-a', 'alice']);
  expect(calls).toContainEqual(['remove', 'peer-a']);
  expect(calls).toContainEqual(['error', '[PeerJS] ❌ Incoming connection error from:', 'peer-a', error]);
});

test('bindOutgoingPeerDataConnection marks failed peers on errors', () => {
  const connection = createConnection('peer-b');
  const failedConnections = new Set();
  const calls = [];

  bindOutgoingPeerDataConnection(connection, {
    peerId: 'peer-b',
    username: 'bob',
    addPeerConnection: (conn, username) => calls.push(['add', conn === connection, username]),
    handlePeerMessage: (data, peerId, username) => calls.push(['message', data, peerId, username]),
    removePeerConnection: (peerId) => calls.push(['remove', peerId]),
    failedConnections,
    failedConnectionScheduler: () => {},
    log: (...args) => calls.push(['log', ...args]),
    reportError: (...args) => calls.push(['error', ...args])
  });

  const error = new Error('boom');
  connection.emit('open');
  connection.emit('data', { type: 'presence' });
  connection.emit('close');
  connection.emit('error', error);

  expect(connection.boundEvents).toEqual(['open', 'data', 'close', 'error']);
  expect(calls).toContainEqual(['add', true, 'bob']);
  expect(calls).toContainEqual(['message', { type: 'presence' }, 'peer-b', 'bob']);
  expect(calls).toContainEqual(['remove', 'peer-b']);
  expect(calls).toContainEqual(['error', '[PeerJS] ❌ Outgoing connection error to:', 'peer-b', error]);
  expect(failedConnections.has('peer-b')).toBe(true);
});

test('connectToOutgoingPeer validates readiness before creating PeerJS connections', () => {
  const calls = [];
  const options = {
    targetPeerId: 'peer-c',
    username: 'carol',
    connections: {},
    localUsername: 'local-user',
    repoFullName: 'acme/project',
    sessionId: 'session-1',
    addPeerConnection: () => {},
    handlePeerMessage: () => {},
    removePeerConnection: () => {},
    failedConnections: new Set(),
    failedConnectionScheduler: () => {},
    log: (...args) => calls.push(['log', ...args]),
    reportError: (...args) => calls.push(['error', ...args])
  };

  expect(connectToOutgoingPeer({ ...options, localPeer: null })).toBeUndefined();
  expect(connectToOutgoingPeer({ ...options, localPeer: createPeer({ open: false }) })).toBeUndefined();
  expect(connectToOutgoingPeer({
    ...options,
    localPeer: createPeer(),
    connections: { 'peer-c': { status: 'connected' } }
  })).toBeUndefined();

  const localPeer = createPeer();
  const connection = connectToOutgoingPeer({ ...options, localPeer });

  expect(connection.peer).toBe('peer-c');
  expect(localPeer.connectCalls).toEqual([{
    peerId: 'peer-c',
    options: {
      metadata: {
        username: 'local-user',
        repo: 'acme/project',
        sessionId: 'session-1'
      }
    }
  }]);
  expect(connection.boundEvents).toEqual(['open', 'data', 'close', 'error']);
});
