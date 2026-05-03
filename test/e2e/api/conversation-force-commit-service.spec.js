import { test, expect } from '@playwright/test';
import {
  createConversationCommitQueueKey,
  forceCommitSelectedConversation
} from '../../../src/services/conversationForceCommitService.js';

test('conversation force commit service creates queue keys for valid conversations', () => {
  expect(createConversationCommitQueueKey({
    repo: 'manaty/skygit',
    id: 'conversation-a'
  })).toBe('manaty/skygit::conversation-a');
  expect(createConversationCommitQueueKey(null)).toBeNull();
  expect(createConversationCommitQueueKey({ repo: 'manaty/skygit' })).toBeNull();
  expect(createConversationCommitQueueKey({ id: 'conversation-a' })).toBeNull();
});

test('conversation force commit service queues selected conversation commits', () => {
  const calls = [];
  const result = forceCommitSelectedConversation({
    conversation: {
      repo: 'manaty/skygit',
      id: 'conversation-a'
    },
    flushQueue: keys => calls.push(keys)
  });

  expect(result).toEqual({
    status: 'queued',
    key: 'manaty/skygit::conversation-a'
  });
  expect(calls).toEqual([['manaty/skygit::conversation-a']]);
});

test('conversation force commit service skips missing conversations', () => {
  const calls = [];

  expect(forceCommitSelectedConversation({
    conversation: null,
    flushQueue: keys => calls.push(keys)
  })).toEqual({ status: 'skipped' });
  expect(calls).toEqual([]);
});
