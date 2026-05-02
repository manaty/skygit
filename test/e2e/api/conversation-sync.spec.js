import { test, expect } from '@playwright/test';
import { mergeRemoteConversation } from '../../../src/utils/conversationSync.js';

test('mergeRemoteConversation adds remote messages by id and sorts by timestamp', () => {
  const merged = mergeRemoteConversation(
    {
      id: 'convo-1',
      repo: 'owner/repo',
      participants: ['alice'],
      messages: [
        { id: 'm2', content: 'local second', timestamp: 2 },
        { id: 'm1', content: 'local first', timestamp: 1 }
      ]
    },
    {
      participants: ['bob', 'alice'],
      messages: [
        { id: 'm3', content: 'remote third', timestamp: 3 },
        { id: 'm2', content: 'remote update wins', timestamp: 2 }
      ]
    }
  );

  expect(merged.messages.map((message) => message.id)).toEqual(['m1', 'm2', 'm3']);
  expect(merged.messages[1].content).toBe('remote update wins');
  expect(merged.participants).toEqual(['alice', 'bob']);
});

test('mergeRemoteConversation returns null when remote has no new ids', () => {
  const merged = mergeRemoteConversation(
    {
      id: 'convo-1',
      messages: [
        { id: 'm1', content: 'first', timestamp: 1 }
      ]
    },
    {
      messages: [
        { id: 'm1', content: 'same id', timestamp: 1 }
      ]
    }
  );

  expect(merged).toBeNull();
});
