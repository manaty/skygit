import { test, expect } from '@playwright/test';
import {
  dispatchDiscoveryMessage,
  getDiscoveryMessageType,
  handleLeaderDiscoveryResponse,
  processLeaderPeerMessage
} from '../../../src/utils/peerLeaderMessages.js';

test('getDiscoveryMessageType rejects invalid discovery payloads', () => {
  expect(getDiscoveryMessageType(null)).toBeNull();
  expect(getDiscoveryMessageType('heartbeat')).toBeNull();
  expect(getDiscoveryMessageType({})).toBeNull();
});

test('getDiscoveryMessageType returns the declared discovery message type', () => {
  expect(getDiscoveryMessageType({ type: 'register', username: 'alice' })).toBe('register');
});

test('dispatchDiscoveryMessage calls the matching discovery handler', () => {
  const calls = [];
  const message = { type: 'peer_registry', peers: [] };

  const result = dispatchDiscoveryMessage(message, {
    peer_registry: (payload) => calls.push(payload)
  });

  expect(result).toBe('peer_registry');
  expect(calls).toEqual([message]);
});

test('dispatchDiscoveryMessage reports unknown and invalid discovery messages', () => {
  const unknownTypes = [];

  expect(dispatchDiscoveryMessage(
    { type: 'missing_handler' },
    {},
    (type) => unknownTypes.push(type)
  )).toBe('unknown');
  expect(unknownTypes).toEqual(['missing_handler']);
  expect(dispatchDiscoveryMessage(null, {}, (type) => unknownTypes.push(type))).toBe('invalid');
  expect(unknownTypes).toEqual(['missing_handler']);
});

test('handleLeaderDiscoveryResponse routes leader responses to orchestration callbacks', () => {
  const calls = [];
  const logs = [];
  const handlers = {
    updateKnownPeers: (peers) => calls.push(['update', peers]),
    storePeerRegistry: (peers, orgId) => calls.push(['store', peers, orgId]),
    connectToOrgPeers: (peers) => calls.push(['connect', peers]),
    onLeadershipChange: () => calls.push(['leadership_change']),
    log: (...args) => logs.push(args)
  };
  const peers = [{ peerId: 'peer-a', username: 'alice' }];

  expect(handleLeaderDiscoveryResponse({ type: 'peer_registry', peers, orgId: 'manaty' }, handlers)).toBe('peer_registry');
  expect(handleLeaderDiscoveryResponse({ type: 'peer_list', peers }, handlers)).toBe('peer_list');
  expect(handleLeaderDiscoveryResponse({ type: 'leadership_change' }, handlers)).toBe('leadership_change');
  expect(handleLeaderDiscoveryResponse({ type: 'unexpected' }, handlers)).toBe('unknown');

  expect(calls).toEqual([
    ['update', peers],
    ['store', peers, 'manaty'],
    ['connect', peers],
    ['update', peers],
    ['leadership_change']
  ]);
  expect(logs).toContainEqual(['[Discovery] Received peer registry:', peers, 'for org:', 'manaty']);
  expect(logs).toContainEqual(['[Discovery] Received peer list:', peers]);
  expect(logs).toContainEqual(['[Discovery] Leadership change detected, reconnecting']);
  expect(logs).toContainEqual(['[Discovery] Unknown leader response type:', 'unexpected']);
});

test('processLeaderPeerMessage registers peers and broadcasts the updated registry', () => {
  const connection = { peer: 'peer-a', open: true };
  const registry = new Map();
  const calls = [];
  const logs = [];

  const result = processLeaderPeerMessage({
    data: {
      type: 'register',
      username: 'alice',
      conversations: ['manaty/skygit']
    },
    connection,
    peerRegistry: registry,
    sendPeerRegistry: (conn) => calls.push(['sendPeerRegistry', conn.peer]),
    broadcastPeerListUpdate: () => calls.push(['broadcastPeerListUpdate']),
    log: (...args) => logs.push(args)
  });

  expect(result).toBe('register');
  expect(registry.get('peer-a')).toMatchObject({
    username: 'alice',
    conversations: ['manaty/skygit'],
    connection,
    isLeader: false
  });
  expect(calls).toEqual([
    ['sendPeerRegistry', 'peer-a'],
    ['broadcastPeerListUpdate']
  ]);
  expect(logs).toContainEqual(['[Discovery] Registering peer:', 'peer-a', 'username:', 'alice']);
});

test('processLeaderPeerMessage handles peer requests, conversation updates, and heartbeats', () => {
  const connection = { peer: 'peer-a' };
  const registry = new Map([
    ['peer-a', {
      username: 'alice',
      conversations: ['old/repo'],
      lastSeen: 1,
      connection,
      isLeader: false
    }]
  ]);
  const calls = [];

  expect(processLeaderPeerMessage({
    data: { type: 'request_peers' },
    connection,
    peerRegistry: registry,
    sendPeerRegistry: (conn) => calls.push(['sendPeerRegistry', conn.peer]),
    broadcastPeerListUpdate: () => calls.push(['broadcastPeerListUpdate'])
  })).toBe('request_peers');

  expect(processLeaderPeerMessage({
    data: { type: 'update_conversations', conversations: ['manaty/skygit'] },
    connection,
    peerRegistry: registry,
    sendPeerRegistry: () => calls.push('unexpected'),
    broadcastPeerListUpdate: () => calls.push('unexpected')
  })).toBe('update_conversations');

  const previousLastSeen = registry.get('peer-a').lastSeen;
  expect(processLeaderPeerMessage({
    data: { type: 'heartbeat' },
    connection,
    peerRegistry: registry,
    sendPeerRegistry: () => calls.push('unexpected'),
    broadcastPeerListUpdate: () => calls.push('unexpected')
  })).toBe('heartbeat');

  expect(calls).toEqual([
    ['sendPeerRegistry', 'peer-a']
  ]);
  expect(registry.get('peer-a').conversations).toEqual(['manaty/skygit']);
  expect(registry.get('peer-a').lastSeen).toBeGreaterThanOrEqual(previousLastSeen);
});

test('processLeaderPeerMessage reports unknown leader peer messages', () => {
  const logs = [];
  const result = processLeaderPeerMessage({
    data: { type: 'unexpected' },
    connection: { peer: 'peer-a' },
    peerRegistry: new Map(),
    sendPeerRegistry: () => {},
    broadcastPeerListUpdate: () => {},
    log: (...args) => logs.push(args)
  });

  expect(result).toBe('unknown');
  expect(logs).toContainEqual(['[Discovery] Unknown leader message type:', 'unexpected']);
});
