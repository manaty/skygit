import { test, expect } from '@playwright/test';
import { connectPeerWithTimeout } from '../../../src/utils/peerConnection.js';

function createConnection() {
  const handlers = new Map();

  return {
    closed: false,
    on(eventName, handler) {
      handlers.set(eventName, handler);
    },
    emit(eventName, payload) {
      handlers.get(eventName)?.(payload);
    },
    close() {
      this.closed = true;
    }
  };
}

function createPeer(conn) {
  return {
    lastPeerId: null,
    lastOptions: null,
    connect(peerId, options) {
      this.lastPeerId = peerId;
      this.lastOptions = options;
      return conn;
    }
  };
}

test('connectPeerWithTimeout resolves when the peer connection opens', async () => {
  const conn = createConnection();
  const peer = createPeer(conn);
  const promise = connectPeerWithTimeout(peer, 'peer-a', { type: 'discovery' }, 50);

  conn.emit('open');

  await expect(promise).resolves.toBe(conn);
  expect(peer.lastPeerId).toBe('peer-a');
  expect(peer.lastOptions).toEqual({ metadata: { type: 'discovery' } });
  expect(conn.closed).toBe(false);
});

test('connectPeerWithTimeout rejects and closes the connection on timeout', async () => {
  const conn = createConnection();
  const peer = createPeer(conn);
  const promise = connectPeerWithTimeout(peer, 'peer-b', { username: 'alice' }, 1);

  await expect(promise).rejects.toThrow('Connection timeout');
  expect(conn.closed).toBe(true);
});

test('connectPeerWithTimeout rejects on peer connection errors', async () => {
  const conn = createConnection();
  const peer = createPeer(conn);
  const promise = connectPeerWithTimeout(peer, 'peer-c', { type: 'discovery' }, 50);
  const error = new Error('unavailable-id');

  conn.emit('error', error);

  await expect(promise).rejects.toThrow('unavailable-id');
  expect(conn.closed).toBe(false);
});
