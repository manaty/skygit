import { test, expect } from '@playwright/test';
import {
  buildFilteredPeerList,
  buildLeaderId,
  buildPeerRegistryList,
  generatePeerId,
  getConnectablePeers,
  getOrgId,
  getPeerConnectionStatus,
  isPeerStale,
  PEER_STALE_THRESHOLD_MS,
  toStoredOrgPeers
} from '../../../src/utils/peerDiscovery.js';

test('generatePeerId sanitizes repo, user and session details deterministically', () => {
  expect(generatePeerId('Org/Repo', 'Alice', 'session_123!')).toBe('org-repo-alice-session123');
});

test('discovery helpers derive organization and leader identifiers', () => {
  expect(getOrgId('manaty/skygit')).toBe('manaty');
  expect(buildLeaderId('manaty')).toBe('skygit_discovery_manaty');
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
