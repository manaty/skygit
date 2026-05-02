import { test, expect } from '@playwright/test';
import {
  connectToReceivedOrgPeers,
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
