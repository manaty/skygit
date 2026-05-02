import { test, expect } from '@playwright/test';
import {
  bindConnectionEvents,
  bindLeaderConnectionEvents,
  bindPeerDataConnection,
  bindPeerEvents
} from '../../../src/utils/peerConnectionEvents.js';

function createConnection() {
  const handlers = new Map();

  return {
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

test('bindConnectionEvents attaches provided PeerJS connection handlers', () => {
  const connection = createConnection();
  const calls = [];

  const result = bindConnectionEvents(connection, {
    open: () => calls.push('open'),
    data: (payload) => calls.push(['data', payload]),
    close: () => calls.push('close'),
    error: (error) => calls.push(['error', error.message])
  });

  const error = new Error('boom');
  connection.emit('open');
  connection.emit('data', { type: 'heartbeat' });
  connection.emit('close');
  connection.emit('error', error);

  expect(result).toBe(connection);
  expect(connection.boundEvents).toEqual(['open', 'data', 'close', 'error']);
  expect(calls).toEqual([
    'open',
    ['data', { type: 'heartbeat' }],
    'close',
    ['error', 'boom']
  ]);
});

test('bindConnectionEvents skips missing handlers', () => {
  const connection = createConnection();

  bindConnectionEvents(connection, {
    data: () => {}
  });

  expect(connection.boundEvents).toEqual(['data']);
});

test('bindPeerDataConnection passes peer identity to data connection handlers', () => {
  const connection = {
    ...createConnection(),
    peer: 'remote-peer'
  };
  const calls = [];

  const result = bindPeerDataConnection(connection, {
    username: 'alice',
    open: (peerId, username) => calls.push(['open', peerId, username]),
    data: (payload, peerId, username) => calls.push(['data', payload, peerId, username]),
    close: (peerId, username) => calls.push(['close', peerId, username]),
    error: (error, peerId, username) => calls.push(['error', error.message, peerId, username])
  });

  connection.emit('open');
  connection.emit('data', { type: 'chat' });
  connection.emit('close');
  connection.emit('error', new Error('boom'));

  expect(result).toBe(connection);
  expect(connection.boundEvents).toEqual(['open', 'data', 'close', 'error']);
  expect(calls).toEqual([
    ['open', 'remote-peer', 'alice'],
    ['data', { type: 'chat' }, 'remote-peer', 'alice'],
    ['close', 'remote-peer', 'alice'],
    ['error', 'boom', 'remote-peer', 'alice']
  ]);
});

test('bindPeerDataConnection supports peer id overrides and partial handlers', () => {
  const connection = createConnection();
  const calls = [];

  bindPeerDataConnection(connection, {
    peerId: 'target-peer',
    data: (payload, peerId) => calls.push([payload, peerId])
  });

  connection.emit('data', 'payload');

  expect(connection.boundEvents).toEqual(['data']);
  expect(calls).toEqual([['payload', 'target-peer']]);
});

test('bindLeaderConnectionEvents binds leader lifecycle and registers once', () => {
  const connection = createConnection();
  const calls = [];
  const error = new Error('boom');

  const result = bindLeaderConnectionEvents(connection, {
    data: (payload) => calls.push(['data', payload]),
    disconnected: (reason) => calls.push(['disconnected', reason?.message || null]),
    register: (conn) => calls.push(['register', conn === connection]),
    log: (...args) => calls.push(['log', ...args]),
    warn: (...args) => calls.push(['warn', ...args])
  });

  connection.emit('data', { type: 'peer_list' });
  connection.emit('close');
  connection.emit('error', error);

  expect(result).toBe(connection);
  expect(connection.boundEvents).toEqual(['data', 'close', 'error']);
  expect(calls).toEqual([
    ['log', '[Discovery] Setting up connection to leader'],
    ['register', true],
    ['data', { type: 'peer_list' }],
    ['log', '[Discovery] Leader connection closed'],
    ['disconnected', null],
    ['warn', '[Discovery] Leader connection error:', error],
    ['disconnected', 'boom']
  ]);
});

test('bindPeerEvents attaches arbitrary peer event handlers', () => {
  const peer = createConnection();
  const calls = [];

  const result = bindPeerEvents(peer, {
    open: (id) => calls.push(['open', id]),
    connection: (connection) => calls.push(['connection', connection.peer]),
    call: (call) => calls.push(['call', call.peer]),
    missing: null
  });

  peer.emit('open', 'peer-id');
  peer.emit('connection', { peer: 'remote-peer' });
  peer.emit('call', { peer: 'call-peer' });

  expect(result).toBe(peer);
  expect(peer.boundEvents).toEqual(['open', 'connection', 'call']);
  expect(calls).toEqual([
    ['open', 'peer-id'],
    ['connection', 'remote-peer'],
    ['call', 'call-peer']
  ]);
});
