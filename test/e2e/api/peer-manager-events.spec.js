import { test, expect } from '@playwright/test';
import { bindPeerManagerEvents } from '../../../src/utils/peerManagerEvents.js';

function createPeer() {
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

test('bindPeerManagerEvents wires PeerJS manager lifecycle events', () => {
  const peer = createPeer();
  const incomingConnection = { peer: 'peer-a', metadata: { username: 'alice' } };
  const error = new Error('boom');
  const calls = [];

  const result = bindPeerManagerEvents(peer, {
    startPeerDiscovery: () => calls.push(['discover']),
    initializeCallHandling: () => calls.push(['calls']),
    handleIncomingConnection: (connection) => calls.push(['incoming', connection]),
    log: (...args) => calls.push(['log', ...args]),
    reportError: (...args) => calls.push(['error', ...args])
  });

  peer.emit('open', 'local-peer');
  peer.emit('connection', incomingConnection);
  peer.emit('error', error);
  peer.emit('disconnected');
  peer.emit('close');

  expect(result).toBe(peer);
  expect(peer.boundEvents).toEqual(['open', 'connection', 'error', 'disconnected', 'close']);
  expect(calls).toEqual([
    ['log', '[PeerJS] Connected to PeerJS server with ID:', 'local-peer'],
    ['discover'],
    ['calls'],
    ['log', '[PeerJS] ✅ Incoming connection from:', 'peer-a', 'metadata:', { username: 'alice' }],
    ['incoming', incomingConnection],
    ['error', '[PeerJS] Peer error:', error],
    ['log', '[PeerJS] Disconnected from PeerJS server'],
    ['log', '[PeerJS] Peer connection closed']
  ]);
});
