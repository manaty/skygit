import { test, expect } from '@playwright/test';
import {
  dispatchDiscoveryMessage,
  getDiscoveryMessageType
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
