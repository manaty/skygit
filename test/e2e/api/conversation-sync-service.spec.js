import { test, expect } from '@playwright/test';
import {
  createConversationSyncController,
  fetchAndMergeConversation
} from '../../../src/services/conversationSyncService.js';

test('fetchAndMergeConversation fetches GitHub content and merges new messages', async () => {
  const calls = [];
  const fetchImpl = async (url, options) => {
    calls.push({ url, options });
    return {
      ok: true,
      json: async () => ({
        content: btoa(JSON.stringify({
          messages: [
            { id: 'm2', content: 'remote', timestamp: 2 }
          ],
          participants: ['bob']
        }))
      })
    };
  };

  const merged = await fetchAndMergeConversation({
    conversation: {
      id: 'convo',
      repo: 'owner/repo',
      path: '.messages/convo.json',
      participants: ['alice'],
      messages: [
        { id: 'm1', content: 'local', timestamp: 1 }
      ]
    },
    token: 'token-123',
    fetchImpl
  });

  expect(calls[0].url).toBe('https://api.github.com/repos/owner/repo/contents/.messages/convo.json');
  expect(calls[0].options.headers.Authorization).toBe('token token-123');
  expect(merged.messages.map((message) => message.id)).toEqual(['m1', 'm2']);
  expect(merged.participants).toEqual(['alice', 'bob']);
});

test('createConversationSyncController starts immediately and prevents duplicate intervals', () => {
  let syncCount = 0;
  const timers = [];
  const controller = createConversationSyncController({
    sync: () => syncCount += 1,
    intervalMs: 123,
    setTimer: (callback, intervalMs) => {
      timers.push({ callback, intervalMs });
      return timers.length;
    },
    clearTimer: (timerId) => {
      timers[timerId - 1].cleared = true;
    }
  });

  controller.start();
  controller.start();

  expect(syncCount).toBe(1);
  expect(timers).toHaveLength(1);
  expect(timers[0].intervalMs).toBe(123);
  expect(controller.isRunning()).toBe(true);

  controller.stop();

  expect(timers[0].cleared).toBe(true);
  expect(controller.isRunning()).toBe(false);
});
