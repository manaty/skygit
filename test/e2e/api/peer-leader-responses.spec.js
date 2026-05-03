import { test, expect } from '@playwright/test';
import {
  connectToReceivedOrgPeers,
  createLeaderConnectionController,
  storeDiscoveredPeerRegistry,
  updateKnownPeerConnections
} from '../../../src/utils/peerLeaderResponses.js';

test('storeDiscoveredPeerRegistry persists discovered peers and updates contacts', () => {
  const storage = createMemoryStorage();
  const contactUpdates = [];
  const logs = [];
  const peers = [{
    peerId: 'peer-a',
    username: 'Alice',
    conversations: ['manaty/skygit'],
    isLeader: false,
    lastSeen: 10
  }];

  const orgPeers = storeDiscoveredPeerRegistry({
    storage,
    orgId: 'manaty',
    peers,
    updateContact: (username, update) => contactUpdates.push([username, update]),
    log: (...args) => logs.push(args)
  });

  expect(orgPeers).toEqual([{
    peerId: 'peer-a',
    username: 'alice',
    conversations: ['manaty/skygit'],
    isLeader: false,
    lastSeen: 10,
    online: true
  }]);
  expect(JSON.parse(storage.getItem('skygit_peers_manaty'))).toEqual(orgPeers);
  expect(contactUpdates).toEqual([[
    'alice',
    {
      peerId: 'peer-a',
      username: 'alice',
      conversations: ['manaty/skygit'],
      isLeader: false,
      lastSeen: 10,
      online: false
    }
  ]]);
  expect(logs).toEqual([
    ['[Discovery] Stored', 1, 'peers for org:', 'manaty']
  ]);
});

test('connectToReceivedOrgPeers connects only available organization peers', () => {
  const connections = {
    'peer-connected': {}
  };
  const failedConnections = new Set(['peer-failed']);
  const connectedPeers = [];
  const logs = [];
  const peers = [
    { peerId: 'local', username: 'me' },
    { peerId: 'peer-connected', username: 'connected' },
    { peerId: 'peer-failed', username: 'failed' },
    { peerId: 'peer-new', username: 'new' }
  ];

  const groups = connectToReceivedOrgPeers({
    peers,
    localPeerId: 'local',
    connections,
    failedConnections,
    connectToPeer: (peerId, username) => connectedPeers.push([peerId, username]),
    log: (...args) => logs.push(args)
  });

  expect(groups.available.map(peer => peer.peerId)).toEqual(['peer-new']);
  expect(connectedPeers).toEqual([['peer-new', 'new']]);
  expect(logs).toContainEqual(['[Discovery] Connecting to all org peers:', 4]);
  expect(logs).toContainEqual(['[Discovery] Connecting to org peer:', 'peer-new', 'username:', 'new']);
});

test('updateKnownPeerConnections logs known peers and includes self diagnostics', () => {
  const connectedPeers = [];
  const logs = [];
  const peers = [
    { peerId: 'local', username: 'me', isLeader: true },
    { peerId: 'peer-new', username: 'new', isLeader: false }
  ];

  const groups = updateKnownPeerConnections({
    peers,
    localPeerId: 'local',
    connections: {},
    failedConnections: new Set(),
    connectToPeer: (peerId, username) => connectedPeers.push([peerId, username]),
    log: (...args) => logs.push(args)
  });

  expect(groups.self.map(peer => peer.peerId)).toEqual(['local']);
  expect(groups.available.map(peer => peer.peerId)).toEqual(['peer-new']);
  expect(connectedPeers).toEqual([['peer-new', 'new']]);
  expect(logs).toContainEqual(['[Discovery] Processing peer list, found', 2, 'peers']);
  expect(logs).toContainEqual(['[Discovery] Processing peer:', 'local', 'username:', 'me', 'isLeader:', true]);
  expect(logs).toContainEqual(['[Discovery] Skipping self:', 'local']);
});

test('createLeaderConnectionController binds leader connections and registers peers', () => {
  const connection = { peer: 'leader' };
  const states = [];
  const calls = [];
  const controller = createLeaderConnectionController({
    getRepoFullName: () => 'manaty/skygit',
    getLocalUsername: () => 'alice',
    getLocalPeerId: () => 'local',
    getConnections: () => ({}),
    getFailedConnections: () => new Set(),
    getStorage: createMemoryStorage,
    getOrgId: repoName => repoName.split('/')[0],
    updateContact: () => {},
    connectToPeer: () => {},
    reconnectToLeader: () => {},
    setConnectedToLeader: value => states.push(value),
    reconnectDelayMs: 50,
    bindLeaderConnection: (conn, handlers) => {
      calls.push(['bindLeaderConnection', conn.peer]);
      handlers.register(conn);
      handlers.disconnected();
      handlers.data({ type: 'peer_list', peers: [] });
      return 'bound-leader';
    },
    sendRegister: (conn, username, repoFullName) => calls.push(['sendRegister', conn.peer, username, repoFullName]),
    handleLeaderResponse: (data) => calls.push(['handleLeaderResponse', data.type])
  });

  expect(controller.setupLeaderConnection(connection)).toBe('bound-leader');

  expect(calls).toEqual([
    ['bindLeaderConnection', 'leader'],
    ['sendRegister', 'leader', 'alice', 'manaty/skygit'],
    ['handleLeaderResponse', 'peer_list']
  ]);
  expect(states).toEqual([null]);
});

test('createLeaderConnectionController routes leader responses and schedules reconnects', () => {
  const storage = createMemoryStorage();
  const failedConnections = new Set(['peer-failed']);
  const connections = { 'peer-connected': {} };
  const peers = [{ peerId: 'peer-new', username: 'new' }];
  const calls = [];
  const states = [];
  const controller = createLeaderConnectionController({
    getRepoFullName: () => 'manaty/skygit',
    getLocalUsername: () => 'alice',
    getLocalPeerId: () => 'local',
    getConnections: () => connections,
    getFailedConnections: () => failedConnections,
    getStorage: () => storage,
    getOrgId: repoName => repoName.split('/')[0],
    updateContact: (username, update) => calls.push(['updateContact', username, update.peerId]),
    connectToPeer: (peerId, username) => calls.push(['connectToPeer', peerId, username]),
    reconnectToLeader: orgId => calls.push(['reconnectToLeader', orgId]),
    setConnectedToLeader: value => states.push(value),
    reconnectDelayMs: 50,
    scheduleReconnect: (callback, delay) => {
      calls.push(['scheduleReconnect', delay]);
      callback();
    },
    handleLeaderResponse: (_data, handlers) => {
      handlers.updateKnownPeers(peers);
      handlers.storePeerRegistry(peers, 'manaty');
      handlers.connectToOrgPeers(peers);
      handlers.onLeadershipChange();
      return 'handled';
    },
    log: (...args) => calls.push(['log', ...args])
  });

  expect(controller.handleLeaderResponse({ type: 'peer_registry' })).toBe('handled');

  expect(JSON.parse(storage.getItem('skygit_peers_manaty')).map(peer => peer.peerId)).toEqual(['peer-new']);
  expect(calls).toContainEqual(['connectToPeer', 'peer-new', 'new']);
  expect(calls).toContainEqual(['scheduleReconnect', 50]);
  expect(calls).toContainEqual(['reconnectToLeader', 'manaty']);
  expect(states).toEqual([null]);
});

function createMemoryStorage() {
  const entries = new Map();

  return {
    getItem(key) {
      return entries.get(key) || null;
    },
    setItem(key, value) {
      entries.set(key, value);
    }
  };
}
