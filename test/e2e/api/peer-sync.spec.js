import { test, expect } from '@playwright/test';
import {
  createConversationNotFoundSyncResponse,
  createSyncNeedsChainResponse,
  createSyncRequest,
  createSyncRequestChain,
  createSyncChainRequestForNeed,
  createSyncResponseAfterHash,
  createSyncResponseForChainRequest,
  createSyncResponseForRequest,
  createSyncResponseFromHashChain,
  findRepoConversation,
  getNormalizedSyncResponseMessages,
  getSyncResponseDeliveryType,
  isValidSyncChainRequestMessage,
  isValidSyncRequestMessage,
  isValidSyncResponseMessage,
  normalizeSyncMessages
} from '../../../src/utils/peerSync.js';

const messages = [
  { id: 'm1', sender: 'alice', content: 'one', hash: 'h1', timestamp: 1 },
  { id: 'm2', sender: 'bob', content: 'two', hash: 'h2', timestamp: 2 },
  { id: 'm3', sender: 'alice', content: 'three', hash: 'h3', timestamp: 3 }
];

test('sync request builders create timestamped protocol messages', () => {
  expect(createSyncRequest('conversation-a', 'h1', 1000)).toEqual({
    type: 'sync_request',
    conversationId: 'conversation-a',
    lastHash: 'h1',
    timestamp: 1000
  });

  expect(createSyncRequestChain('conversation-a', ['h3', 'h2'], 2000)).toEqual({
    type: 'sync_request_chain',
    conversationId: 'conversation-a',
    hashChain: ['h3', 'h2'],
    timestamp: 2000
  });
});

test('sync message validators reject incomplete protocol payloads', () => {
  expect(isValidSyncRequestMessage({ conversationId: 'conversation-a', lastHash: 'h1' })).toBe(true);
  expect(isValidSyncRequestMessage({ conversationId: 'conversation-a' })).toBe(false);
  expect(isValidSyncChainRequestMessage({ conversationId: 'conversation-a', hashChain: ['h2'] })).toBe(true);
  expect(isValidSyncChainRequestMessage({ conversationId: 'conversation-a', hashChain: 'h2' })).toBe(false);
  expect(isValidSyncResponseMessage({ conversationId: 'conversation-a', messages: [] })).toBe(true);
  expect(isValidSyncResponseMessage({ conversationId: 'conversation-a' })).toBe(false);
});

test('findRepoConversation locates conversations inside the active repository bucket', () => {
  const conversation = { id: 'conversation-a', messages };

  expect(findRepoConversation({ 'org/repo': [conversation] }, 'org/repo', 'conversation-a')).toBe(conversation);
  expect(findRepoConversation({ 'org/repo': [conversation] }, 'org/repo', 'missing')).toBeUndefined();
  expect(findRepoConversation({}, 'org/repo', 'conversation-a')).toBeUndefined();
});

test('createSyncChainRequestForNeed builds hash-chain requests from local conversations', () => {
  expect(createSyncChainRequestForNeed(
    { conversationId: 'conversation-a' },
    { 'org/repo': [{ id: 'conversation-a', messages }] },
    'org/repo',
    3000
  )).toEqual({
    type: 'sync_request_chain',
    conversationId: 'conversation-a',
    hashChain: ['h3', 'h2', 'h1'],
    timestamp: 3000
  });

  expect(createSyncChainRequestForNeed({}, { 'org/repo': [] }, 'org/repo')).toBeNull();
  expect(createSyncChainRequestForNeed({ conversationId: 'missing' }, { 'org/repo': [] }, 'org/repo')).toBeNull();
});

test('sync response helpers cover missing conversations and missing hashes', () => {
  expect(createConversationNotFoundSyncResponse('conversation-a')).toEqual({
    type: 'sync_response',
    conversationId: 'conversation-a',
    messages: [],
    error: 'Conversation not found'
  });

  expect(createSyncNeedsChainResponse('conversation-a')).toEqual({
    type: 'sync_needs_chain',
    conversationId: 'conversation-a',
    error: 'Hash not found, please send hash chain'
  });

  expect(createSyncResponseAfterHash(null, 'conversation-a', 'h1')).toEqual(
    createConversationNotFoundSyncResponse('conversation-a')
  );
  expect(createSyncResponseAfterHash({ messages }, 'conversation-a', 'missing')).toEqual(
    createSyncNeedsChainResponse('conversation-a')
  );
});

test('request response wrappers derive responses from sync protocol messages', () => {
  expect(createSyncResponseForRequest(
    { conversationId: 'conversation-a', lastHash: 'h2' },
    { messages }
  )).toEqual({
    type: 'sync_response',
    conversationId: 'conversation-a',
    messages: [messages[2]]
  });

  expect(createSyncResponseForChainRequest(
    { conversationId: 'conversation-a', hashChain: ['h2'] },
    { messages }
  )).toEqual({
    type: 'sync_response',
    conversationId: 'conversation-a',
    messages: [messages[2]],
    commonAncestor: 'h2'
  });
});

test('createSyncResponseAfterHash returns messages after the requested hash', () => {
  expect(createSyncResponseAfterHash({ messages }, 'conversation-a', 'h1')).toEqual({
    type: 'sync_response',
    conversationId: 'conversation-a',
    messages: [messages[1], messages[2]]
  });
});

test('createSyncResponseFromHashChain returns messages after the common ancestor', () => {
  expect(createSyncResponseFromHashChain({ messages }, 'conversation-a', ['h2'])).toEqual({
    type: 'sync_response',
    conversationId: 'conversation-a',
    messages: [messages[2]],
    commonAncestor: 'h2'
  });
});

test('createSyncResponseFromHashChain falls back to full sync without a common ancestor', () => {
  expect(createSyncResponseFromHashChain({ messages }, 'conversation-a', ['remote-hash'])).toEqual({
    type: 'sync_response',
    conversationId: 'conversation-a',
    messages,
    fullSync: true
  });
});

test('normalizeSyncMessages filters incomplete messages and fills defaults', () => {
  expect(normalizeSyncMessages(
    [
      { sender: 'alice', content: 'hello', hash: 'h1' },
      { sender: 'bob' },
      { content: 'missing sender' }
    ],
    () => 'generated-id',
    () => 1234
  )).toEqual([
    {
      id: 'generated-id',
      sender: 'alice',
      content: 'hello',
      timestamp: 1234,
      hash: 'h1',
      in_response_to: null
    }
  ]);
});

test('getNormalizedSyncResponseMessages validates and normalizes response payloads', () => {
  expect(getNormalizedSyncResponseMessages({ conversationId: 'conversation-a' })).toBeNull();
  expect(getNormalizedSyncResponseMessages(
    { conversationId: 'conversation-a', messages: [{ sender: 'alice', content: 'hello' }] }
  )).toHaveLength(1);
});

test('getSyncResponseDeliveryType classifies sync responses for peer delivery logs', () => {
  expect(getSyncResponseDeliveryType({ error: 'Conversation not found' })).toBe('conversation_not_found');
  expect(getSyncResponseDeliveryType({ type: 'sync_needs_chain' })).toBe('sync_needs_chain');
  expect(getSyncResponseDeliveryType({ fullSync: true })).toBe('full_sync');
  expect(getSyncResponseDeliveryType({ messages: [] })).toBe('messages');
});
