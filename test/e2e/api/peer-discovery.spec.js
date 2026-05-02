import { test, expect } from '@playwright/test';
import {
  buildFilteredPeerList,
  buildLeaderId,
  buildPeerRegistryList,
  createDiscoveryBootstrap,
  createHeartbeatMessage,
  createLeaderRegistryEntry,
  createLeadershipChangeMessage,
  createPeerListMessage,
  createPeerRegistryMessage,
  createRegisteredPeerEntry,
  createRegisterWithLeaderMessage,
  createStoredPeerContactUpdate,
  generatePeerId,
  getConnectablePeers,
  getOrgId,
  getPeerConnectionStatus,
  getStoredPeerContactUpdateEntries,
  groupPeersByConnectionStatus,
  isPeerStale,
  PEER_STALE_THRESHOLD_MS,
  persistOrgPeerRegistry,
  sendFilteredPeerListSnapshot,
  sendPeerRegistrySnapshot,
  toStoredOrgPeers
} from '../../../src/utils/peerDiscovery.js';

test('generatePeerId sanitizes repo, user and session details deterministically', () => {
  expect(generatePeerId('Org/Repo', 'Alice', 'session_123!')).toBe('org-repo-alice-session123');
});

test('discovery helpers derive organization and leader identifiers', () => {
  expect(getOrgId('manaty/skygit')).toBe('manaty');
  expect(buildLeaderId('manaty')).toBe('skygit_discovery_manaty');
});

test('createDiscoveryBootstrap requires auth and derives discovery ids', () => {
  expect(createDiscoveryBootstrap({ user: { login: 'alice' } }, 'manaty/skygit')).toEqual({
    orgId: 'manaty',
    leaderId: 'skygit_discovery_manaty'
  });
  expect(createDiscoveryBootstrap(null, 'manaty/skygit')).toBeNull();
  expect(createDiscoveryBootstrap({ user: {} }, 'manaty/skygit')).toBeNull();
});

test('buildPeerRegistryList keeps serializable peer metadata', () => {
  const registry = new Map([
    ['peer-a', {
      username: 'alice',
      conversations: ['manaty/skygit'],
      connection: { open: true },
      isLeader: true,
      lastSeen: 1000
    }],
    ['peer-b', {
      username: 'bob',
      conversations: ['manaty/skygit', 'manaty/docs'],
      lastSeen: 2000
    }]
  ]);

  expect(buildPeerRegistryList(registry)).toEqual([
    {
      peerId: 'peer-a',
      username: 'alice',
      conversations: ['manaty/skygit'],
      isLeader: true,
      lastSeen: 1000
    },
    {
      peerId: 'peer-b',
      username: 'bob',
      conversations: ['manaty/skygit', 'manaty/docs'],
      isLeader: false,
      lastSeen: 2000
    }
  ]);
});

test('buildFilteredPeerList limits discovery responses to matching conversations', () => {
  const registry = new Map([
    ['peer-a', { username: 'alice', conversations: ['manaty/skygit'], isLeader: true }],
    ['peer-b', { username: 'bob', conversations: ['manaty/docs'], isLeader: false }]
  ]);

  expect(buildFilteredPeerList(registry, 'manaty/skygit')).toEqual([
    {
      peerId: 'peer-a',
      username: 'alice',
      conversations: ['manaty/skygit'],
      isLeader: true
    }
  ]);
  expect(buildFilteredPeerList(registry)).toHaveLength(2);
});

test('toStoredOrgPeers normalizes peers for browser storage', () => {
  expect(toStoredOrgPeers([
    {
      peerId: 'peer-a',
      username: 'Alice',
      conversations: ['manaty/skygit'],
      isLeader: false,
      lastSeen: 3000
    }
  ])).toEqual([
    {
      peerId: 'peer-a',
      username: 'alice',
      conversations: ['manaty/skygit'],
      isLeader: false,
      lastSeen: 3000,
      online: true
    }
  ]);
});

test('persistOrgPeerRegistry stores normalized peers and contact update entries', () => {
  const writes = [];
  const storage = {
    setItem: (key, value) => writes.push([key, value])
  };
  const peers = [{
    peerId: 'peer-a',
    username: 'Alice',
    conversations: ['manaty/skygit'],
    isLeader: false,
    lastSeen: 3000
  }];

  const orgPeers = persistOrgPeerRegistry(storage, 'manaty', peers);

  expect(orgPeers).toEqual([
    {
      peerId: 'peer-a',
      username: 'alice',
      conversations: ['manaty/skygit'],
      isLeader: false,
      lastSeen: 3000,
      online: true
    }
  ]);
  expect(writes).toEqual([
    ['skygit_peers_manaty', JSON.stringify(orgPeers)]
  ]);
  expect(getStoredPeerContactUpdateEntries(orgPeers)).toEqual([
    [
      'alice',
      {
        peerId: 'peer-a',
        username: 'alice',
        conversations: ['manaty/skygit'],
        isLeader: false,
        lastSeen: 3000,
        online: false
      }
    ]
  ]);
});

test('isPeerStale uses the shared stale peer threshold', () => {
  expect(isPeerStale({ lastSeen: 1000 }, 1000 + PEER_STALE_THRESHOLD_MS)).toBe(false);
  expect(isPeerStale({ lastSeen: 1000 }, 1001 + PEER_STALE_THRESHOLD_MS)).toBe(true);
});

test('getPeerConnectionStatus classifies peers before connection attempts', () => {
  const connections = {
    'peer-connected': { open: true }
  };
  const failedConnections = new Set(['peer-failed']);

  expect(getPeerConnectionStatus({ peerId: 'local-peer' }, 'local-peer', connections, failedConnections)).toBe('self');
  expect(getPeerConnectionStatus({ peerId: 'peer-connected' }, 'local-peer', connections, failedConnections)).toBe('connected');
  expect(getPeerConnectionStatus({ peerId: 'peer-failed' }, 'local-peer', connections, failedConnections)).toBe('failed');
  expect(getPeerConnectionStatus({ peerId: 'peer-new' }, 'local-peer', connections, failedConnections)).toBe('available');
});

test('getConnectablePeers returns only new remote peers', () => {
  const peers = [
    { peerId: 'local-peer' },
    { peerId: 'peer-connected' },
    { peerId: 'peer-failed' },
    { peerId: 'peer-new' }
  ];

  expect(getConnectablePeers(
    peers,
    'local-peer',
    { 'peer-connected': { open: true } },
    new Set(['peer-failed'])
  )).toEqual([{ peerId: 'peer-new' }]);
});

test('groupPeersByConnectionStatus buckets discovered peers by connection state', () => {
  const peers = [
    { peerId: 'local-peer', username: 'local' },
    { peerId: 'peer-connected', username: 'alice' },
    { peerId: 'peer-failed', username: 'bob' },
    { peerId: 'peer-new', username: 'carol' }
  ];

  expect(groupPeersByConnectionStatus(
    peers,
    'local-peer',
    { 'peer-connected': { open: true } },
    new Set(['peer-failed'])
  )).toEqual({
    available: [{ peerId: 'peer-new', username: 'carol' }],
    connected: [{ peerId: 'peer-connected', username: 'alice' }],
    failed: [{ peerId: 'peer-failed', username: 'bob' }],
    self: [{ peerId: 'local-peer', username: 'local' }]
  });
});

test('createLeaderRegistryEntry registers the local leader peer', () => {
  expect(createLeaderRegistryEntry('alice', 'manaty/skygit', 1234)).toEqual({
    username: 'alice',
    conversations: ['manaty/skygit'],
    lastSeen: 1234,
    connection: null,
    isLeader: true
  });
});

test('createRegisteredPeerEntry records remote peer discovery details', () => {
  const connection = { peer: 'peer-a' };

  expect(createRegisteredPeerEntry({
    username: 'bob',
    conversations: ['manaty/skygit']
  }, connection, 5678)).toEqual({
    username: 'bob',
    conversations: ['manaty/skygit'],
    lastSeen: 5678,
    connection,
    isLeader: false
  });
  expect(createRegisteredPeerEntry({ username: 'carol' }, connection, 5678).conversations).toEqual([]);
});

test('discovery message builders shape leader protocol payloads', () => {
  expect(createPeerRegistryMessage([{ peerId: 'peer-a' }], 'manaty')).toEqual({
    type: 'peer_registry',
    peers: [{ peerId: 'peer-a' }],
    orgId: 'manaty'
  });
  expect(createPeerListMessage([{ peerId: 'peer-a' }])).toEqual({
    type: 'peer_list',
    peers: [{ peerId: 'peer-a' }]
  });
  expect(createRegisterWithLeaderMessage('alice', 'manaty/skygit', 1000)).toEqual({
    type: 'register',
    username: 'alice',
    conversations: ['manaty/skygit'],
    timestamp: 1000
  });
  expect(createHeartbeatMessage(2000)).toEqual({
    type: 'heartbeat',
    timestamp: 2000
  });
  expect(createLeadershipChangeMessage()).toEqual({
    type: 'leadership_change',
    message: 'Leader stepping down, reconnect to discovery system'
  });
});

test('snapshot senders serialize registry and filtered peer lists', () => {
  const sent = [];
  const connection = { send: (message) => sent.push(message) };
  const registry = new Map([
    ['peer-a', { username: 'alice', conversations: ['manaty/skygit'], lastSeen: 1000 }],
    ['peer-b', { username: 'bob', conversations: ['manaty/docs'], lastSeen: 2000 }]
  ]);

  expect(sendPeerRegistrySnapshot(connection, registry, 'manaty')).toEqual([
    { peerId: 'peer-a', username: 'alice', conversations: ['manaty/skygit'], isLeader: false, lastSeen: 1000 },
    { peerId: 'peer-b', username: 'bob', conversations: ['manaty/docs'], isLeader: false, lastSeen: 2000 }
  ]);
  expect(sendFilteredPeerListSnapshot(connection, registry, 'manaty/skygit')).toEqual([
    { peerId: 'peer-a', username: 'alice', conversations: ['manaty/skygit'], isLeader: false }
  ]);
  expect(sent).toEqual([
    {
      type: 'peer_registry',
      peers: [
        { peerId: 'peer-a', username: 'alice', conversations: ['manaty/skygit'], isLeader: false, lastSeen: 1000 },
        { peerId: 'peer-b', username: 'bob', conversations: ['manaty/docs'], isLeader: false, lastSeen: 2000 }
      ],
      orgId: 'manaty'
    },
    {
      type: 'peer_list',
      peers: [
        { peerId: 'peer-a', username: 'alice', conversations: ['manaty/skygit'], isLeader: false }
      ]
    }
  ]);
});

test('createStoredPeerContactUpdate marks persisted discovery contacts offline until connected', () => {
  expect(createStoredPeerContactUpdate({
    peerId: 'peer-a',
    username: 'alice',
    conversations: ['manaty/skygit'],
    isLeader: false,
    lastSeen: 1234
  })).toEqual({
    peerId: 'peer-a',
    username: 'alice',
    conversations: ['manaty/skygit'],
    isLeader: false,
    lastSeen: 1234,
    online: false
  });
});
