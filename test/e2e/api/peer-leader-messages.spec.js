import { test, expect } from '@playwright/test';
import {
  dispatchDiscoveryMessage,
  getDiscoveryMessageType,
  handleLeaderDiscoveryResponse
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
