import { test, expect } from '@playwright/test';
import {
  createIncomingChatMessage,
  isValidChatMessage,
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
