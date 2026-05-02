import { test, expect } from '@playwright/test';
import {
  createIncomingChatMessage,
  isValidChatMessage,
  processIncomingPeerChatMessage,
  shouldIgnoreChatMessage
} from '../../../src/utils/peerChat.js';

test('isValidChatMessage requires a conversation id and content', () => {
  expect(isValidChatMessage({ conversationId: 'c1', content: 'hello' })).toBe(true);
  expect(isValidChatMessage({ conversationId: 'c1' })).toBe(false);
  expect(isValidChatMessage({ content: 'hello' })).toBe(false);
  expect(isValidChatMessage(null)).toBe(false);
});

test('shouldIgnoreChatMessage rejects messages from the same peer session', () => {
  expect(shouldIgnoreChatMessage('peer-a', 'peer-a')).toBe(true);
  expect(shouldIgnoreChatMessage('peer-a', 'peer-b')).toBe(false);
});

test('createIncomingChatMessage normalizes peer chat payloads', () => {
  expect(createIncomingChatMessage(
    {
      content: 'hello',
      hash: 'h1'
    },
    'alice',
    () => 'generated-id',
    () => 1234
  )).toEqual({
    id: 'generated-id',
    sender: 'alice',
    content: 'hello',
    timestamp: 1234,
    hash: 'h1',
    in_response_to: null
  });
});

test('processIncomingPeerChatMessage applies accepted messages and queues leader commits', () => {
  const calls = [];
  const status = processIncomingPeerChatMessage({
    message: { conversationId: 'c1', content: 'hello', timestamp: 1234, id: 'm1' },
    fromUsername: 'alice',
    fromPeerId: 'peer-a',
    localPeerId: 'local-peer',
    repoFullName: 'manaty/skygit',
    appendMessage: (...args) => calls.push(['append', ...args]),
    setLastMessage: (...args) => calls.push(['last', ...args]),
    updateContact: (...args) => calls.push(['contact', ...args]),
    isLeader: () => true,
    getCurrentLeader: () => 'local-peer',
    queueConversationForCommit: (...args) => calls.push(['queue', ...args]),
    now: () => 2000
  });

  expect(status).toBe('queued');
  expect(calls).toEqual([
    ['append', 'c1', 'manaty/skygit', {
      id: 'm1',
      sender: 'alice',
      content: 'hello',
      timestamp: 1234,
      hash: null,
      in_response_to: null
    }],
    ['last', 'alice', {
      id: 'm1',
      sender: 'alice',
      content: 'hello',
      timestamp: 1234,
      hash: null,
      in_response_to: null
    }],
    ['contact', 'alice', { online: true, lastSeen: 2000 }],
    ['queue', 'manaty/skygit', 'c1']
  ]);
});

test('processIncomingPeerChatMessage rejects invalid and same-session chat messages', () => {
  const warnings = [];
  const logs = [];
  const baseHandlers = {
    fromUsername: 'alice',
    fromPeerId: 'peer-a',
    localPeerId: 'peer-a',
    repoFullName: 'manaty/skygit',
    appendMessage: () => { throw new Error('should not append'); },
    setLastMessage: () => {},
    updateContact: () => {},
    isLeader: () => false,
    getCurrentLeader: () => 'peer-b',
    queueConversationForCommit: () => {},
    log: (...args) => logs.push(args),
    warn: (...args) => warnings.push(args)
  };

  expect(processIncomingPeerChatMessage({ ...baseHandlers, message: { content: 'missing conversation' } })).toBe('invalid');
  expect(processIncomingPeerChatMessage({ ...baseHandlers, message: { conversationId: 'c1', content: 'hello' } })).toBe('ignored');
  expect(warnings).toEqual([['[PeerJS] Invalid chat message format:', { content: 'missing conversation' }]]);
  expect(logs).toEqual([['[PeerJS] Ignoring message from same session']]);
});
