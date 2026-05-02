import { test, expect } from '@playwright/test';
import {
  dispatchPeerMessage,
  getPeerMessageType
} from '../../../src/utils/peerMessages.js';

test('getPeerMessageType rejects invalid peer message payloads', () => {
  expect(getPeerMessageType(null)).toBeNull();
  expect(getPeerMessageType('chat')).toBeNull();
  expect(getPeerMessageType({})).toBeNull();
});

test('getPeerMessageType returns the declared message type', () => {
  expect(getPeerMessageType({ type: 'chat', content: 'hello' })).toBe('chat');
});

test('dispatchPeerMessage calls the matching handler and returns the handled type', () => {
  const calls = [];
  const message = { type: 'typing', isTyping: true };

  const result = dispatchPeerMessage(message, {
    typing: (payload) => calls.push(payload)
  });

  expect(result).toBe('typing');
  expect(calls).toEqual([message]);
});

test('dispatchPeerMessage reports unknown message types', () => {
  const unknownTypes = [];

  const result = dispatchPeerMessage(
    { type: 'unexpected' },
    {},
    (type) => unknownTypes.push(type)
  );

  expect(result).toBe('unknown');
  expect(unknownTypes).toEqual(['unexpected']);
});

test('dispatchPeerMessage reports invalid payloads without calling unknown handler', () => {
  const unknownTypes = [];

  const result = dispatchPeerMessage(null, {}, (type) => unknownTypes.push(type));

  expect(result).toBe('invalid');
  expect(unknownTypes).toEqual([]);
});
