import { test, expect } from '@playwright/test';
import {
  bindDiscoveryPeerConnection,
  setupDiscoveryLeadershipRole
} from '../../../src/utils/peerLeaderRole.js';

test('setupDiscoveryLeadershipRole registers the leader and binds incoming discovery connections', () => {
  const leadershipPeer = createEventTarget('leader');
  const registry = new Map();
  const calls = [];

  const entry = setupDiscoveryLeadershipRole({
    leadershipPeer,
    localPeerId: 'local-peer',
    localUsername: 'alice',
    repoFullName: 'manaty/skygit',
    peerRegistry: registry,
    setupPeerConnection: (connection) => calls.push(['setupPeerConnection', connection.peer]),
    startLeaderMaintenanceTasks: () => calls.push(['startLeaderMaintenanceTasks']),
    log: (...args) => calls.push(['log', ...args])
  });

  expect(entry).toMatchObject({
    username: 'alice',
    conversations: ['manaty/skygit'],
    connection: null,
    isLeader: true
  });
  expect(registry.get('local-peer')).toBe(entry);

  const connection = createEventTarget('peer-a');
  leadershipPeer.emit('connection', connection);

  expect(calls).toContainEqual(['setupPeerConnection', 'peer-a']);
  expect(calls).toContainEqual(['startLeaderMaintenanceTasks']);
  expect(calls).toContainEqual(['log', '[Discovery] Leader registered self in peer registry']);
});

test('bindDiscoveryPeerConnection routes data and removes closed peers from the registry', () => {
  const connection = createEventTarget('peer-a');
  const registry = new Map([
    ['peer-a', { connection }]
  ]);
  const calls = [];

  bindDiscoveryPeerConnection({
    connection,
    peerRegistry: registry,
    handleLeaderMessage: (data, conn) => calls.push(['handleLeaderMessage', data, conn.peer]),
    broadcastPeerListUpdate: () => calls.push(['broadcastPeerListUpdate']),
    log: (...args) => calls.push(['log', ...args])
  });

  connection.emit('open');
  connection.emit('data', { type: 'register' });
  connection.emit('close');

  expect(registry.has('peer-a')).toBe(false);
  expect(calls).toEqual([
    ['log', '[Discovery] Peer connection opened:', 'peer-a'],
    ['handleLeaderMessage', { type: 'register' }, 'peer-a'],
    ['log', '[Discovery] Peer disconnected:', 'peer-a'],
    ['broadcastPeerListUpdate']
  ]);
});

test('bindDiscoveryPeerConnection removes errored peers without broadcasting', () => {
  const connection = createEventTarget('peer-a');
  const registry = new Map([
    ['peer-a', { connection }]
  ]);
  const calls = [];
  const error = new Error('closed');

  bindDiscoveryPeerConnection({
    connection,
    peerRegistry: registry,
    handleLeaderMessage: () => calls.push('handleLeaderMessage'),
    broadcastPeerListUpdate: () => calls.push('broadcastPeerListUpdate'),
    warn: (...args) => calls.push(['warn', ...args])
  });

  connection.emit('error', error);

  expect(registry.has('peer-a')).toBe(false);
  expect(calls).toEqual([
    ['warn', '[Discovery] Peer connection error:', error]
  ]);
});

function createEventTarget(peer) {
  const handlers = new Map();

  return {
    peer,
    on(eventName, handler) {
      handlers.set(eventName, handler);
    },
    emit(eventName, payload) {
      handlers.get(eventName)?.(payload);
    }
  };
}
