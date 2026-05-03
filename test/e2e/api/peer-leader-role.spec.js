import { test, expect } from '@playwright/test';
import {
  bindDiscoveryPeerConnection,
  createDiscoveryLeaderRoleController,
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

test('createDiscoveryLeaderRoleController wires leadership setup and peer connections', () => {
  const leadershipPeer = createEventTarget('leader');
  const connection = createEventTarget('peer-a');
  const registry = new Map();
  const calls = [];
  const controller = createDiscoveryLeaderRoleController({
    getLeadershipPeer: () => leadershipPeer,
    getLocalPeerId: () => 'local-peer',
    getLocalUsername: () => 'alice',
    getRepoFullName: () => 'manaty/skygit',
    peerRegistry: registry,
    getOrgId: repoName => repoName.split('/')[0],
    staleThresholdMs: 1000,
    setupLeadershipRole: ({ setupPeerConnection, startLeaderMaintenanceTasks, ...args }) => {
      calls.push(['setupLeadershipRole', args.leadershipPeer.peer, args.localPeerId, args.localUsername, args.repoFullName]);
      setupPeerConnection(connection);
      startLeaderMaintenanceTasks();
      return 'leader-entry';
    },
    bindPeerConnection: ({ connection, handleLeaderMessage, broadcastPeerListUpdate }) => {
      calls.push(['bindPeerConnection', connection.peer]);
      handleLeaderMessage({ type: 'register' }, connection);
      broadcastPeerListUpdate();
      return 'bound-peer';
    },
    processLeaderMessage: ({ data, connection }) => calls.push(['processLeaderMessage', data.type, connection.peer]),
    broadcastPeerList: () => calls.push(['broadcastPeerList']),
    startMaintenanceTimer: performMaintenance => {
      calls.push(['startMaintenanceTimer']);
      performMaintenance();
      return 'timer';
    },
    performMaintenance: ({ localPeerId, staleThresholdMs }) => calls.push(['performMaintenance', localPeerId, staleThresholdMs])
  });

  expect(controller.setupLeadershipRole('manaty')).toBe('leader-entry');

  expect(calls).toEqual([
    ['setupLeadershipRole', 'leader', 'local-peer', 'alice', 'manaty/skygit'],
    ['bindPeerConnection', 'peer-a'],
    ['processLeaderMessage', 'register', 'peer-a'],
    ['broadcastPeerList'],
    ['startMaintenanceTimer'],
    ['performMaintenance', 'local-peer', 1000]
  ]);
});

test('createDiscoveryLeaderRoleController delegates registry snapshots and broadcasts', () => {
  const registry = new Map();
  const connection = createEventTarget('peer-a');
  const calls = [];
  const controller = createDiscoveryLeaderRoleController({
    getLeadershipPeer: () => createEventTarget('leader'),
    getLocalPeerId: () => 'local-peer',
    getLocalUsername: () => 'alice',
    getRepoFullName: () => 'manaty/skygit',
    peerRegistry: registry,
    getOrgId: repoName => repoName.split('/')[0],
    staleThresholdMs: 1000,
    sendRegistry: (conn, peers, orgId) => {
      calls.push(['sendRegistry', conn.peer, peers, orgId]);
      return ['registry'];
    },
    sendPeerListSnapshot: (conn, peers, conversationFilter) => {
      calls.push(['sendPeerListSnapshot', conn.peer, peers, conversationFilter]);
      return ['peer-list'];
    },
    broadcastPeerList: (peers, sendPeerList) => {
      calls.push(['broadcastPeerList', peers]);
      sendPeerList(connection, 'manaty/skygit#1');
      return ['peer-a'];
    }
  });

  expect(controller.sendPeerRegistry(connection)).toEqual(['registry']);
  expect(controller.sendPeerList(connection, null)).toEqual(['peer-list']);
  expect(controller.broadcastPeerListUpdate()).toEqual(['peer-a']);

  expect(calls).toEqual([
    ['sendRegistry', 'peer-a', registry, 'manaty'],
    ['sendPeerListSnapshot', 'peer-a', registry, null],
    ['broadcastPeerList', registry],
    ['sendPeerListSnapshot', 'peer-a', registry, 'manaty/skygit#1']
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
