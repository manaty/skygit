import { test, expect } from '@playwright/test';
import {
  dispatchPeerMessage,
  getPeerMessageSenderUsername,
  getPeerMessageType,
  processPeerDataMessage
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

test('getPeerMessageSenderUsername prefers explicit usernames before connection metadata', () => {
  const connections = {
    'peer-1': {
      username: 'from-connection'
    }
  };

  expect(getPeerMessageSenderUsername(connections, 'peer-1', 'explicit-user')).toBe('explicit-user');
  expect(getPeerMessageSenderUsername(connections, 'peer-1')).toBe('from-connection');
  expect(getPeerMessageSenderUsername(connections, 'peer-2')).toBe('Unknown');
});

test('processPeerDataMessage dispatches typed messages with resolved peer context', () => {
  const calls = [];
  const logs = [];
  const message = { type: 'chat', text: 'hello' };

  const result = processPeerDataMessage({
    data: message,
    fromPeerId: 'peer-1',
    connections: {
      'peer-1': {
        username: 'alice'
      }
    },
    handlers: createPeerDataHandlers(calls),
    log: (...args) => logs.push(args)
  });

  expect(result).toEqual({
    status: 'chat',
    username: 'alice'
  });
  expect(calls).toEqual([['chat', message, 'alice', 'peer-1']]);
  expect(logs).toContainEqual(['[PeerJS] Handling message from:', 'alice', message]);
});

test('processPeerDataMessage warns on invalid payloads without dispatching handlers', () => {
  const calls = [];
  const warnings = [];

  const result = processPeerDataMessage({
    data: null,
    fromPeerId: 'peer-1',
    connections: {},
    handlers: createPeerDataHandlers(calls),
    warn: (...args) => warnings.push(args)
  });

  expect(result).toEqual({
    status: 'invalid',
    username: 'Unknown'
  });
  expect(calls).toEqual([]);
  expect(warnings).toEqual([['[PeerJS] Invalid message format:', null]]);
});

test('processPeerDataMessage logs unknown message types', () => {
  const calls = [];
  const logs = [];

  const result = processPeerDataMessage({
    data: { type: 'mystery' },
    fromPeerId: 'peer-1',
    fromUsername: 'bob',
    connections: {},
    handlers: createPeerDataHandlers(calls),
    log: (...args) => logs.push(args)
  });

  expect(result).toEqual({
    status: 'unknown',
    username: 'bob'
  });
  expect(calls).toEqual([]);
  expect(logs).toContainEqual(['[PeerJS] Unknown message type:', 'mystery']);
});

function createPeerDataHandlers(calls) {
  return {
    chat: (...args) => calls.push(['chat', ...args]),
    presence: (...args) => calls.push(['presence', ...args]),
    typing: (...args) => calls.push(['typing', ...args]),
    syncRequest: (...args) => calls.push(['syncRequest', ...args]),
    syncRequestChain: (...args) => calls.push(['syncRequestChain', ...args]),
    syncResponse: (...args) => calls.push(['syncResponse', ...args]),
    syncNeedsChain: (...args) => calls.push(['syncNeedsChain', ...args]),
    messagesCommitted: (...args) => calls.push(['messagesCommitted', ...args])
  };
}
