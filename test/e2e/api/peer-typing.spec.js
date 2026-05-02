import { test, expect } from '@playwright/test';
import {
  applyTypingStatus,
  clearExpiredTypingStatus,
  createTypingStatusMessage,
  isValidTypingMessage,
  TYPING_CLEAR_DELAY_MS
} from '../../../src/utils/peerTyping.js';

test('isValidTypingMessage requires an explicit boolean typing state', () => {
  expect(isValidTypingMessage({ isTyping: true })).toBe(true);
  expect(isValidTypingMessage({ isTyping: false })).toBe(true);
  expect(isValidTypingMessage({ isTyping: 'yes' })).toBe(false);
  expect(isValidTypingMessage(null)).toBe(false);
});

test('applyTypingStatus adds and removes typing users immutably', () => {
  const users = { existing: { username: 'bob', isTyping: true, lastTypingTime: 1 } };

  expect(applyTypingStatus(users, 'peer-a', 'alice', true, 1234)).toEqual({
    existing: { username: 'bob', isTyping: true, lastTypingTime: 1 },
    'peer-a': { username: 'alice', isTyping: true, lastTypingTime: 1234 }
  });
  expect(applyTypingStatus(users, 'existing', 'bob', false, 1234)).toEqual({});
  expect(users).toEqual({ existing: { username: 'bob', isTyping: true, lastTypingTime: 1 } });
});

test('clearExpiredTypingStatus removes stale typing entries only', () => {
  expect(clearExpiredTypingStatus({
    'peer-a': { username: 'alice', isTyping: true, lastTypingTime: 1000 }
  }, 'peer-a', 1000 + TYPING_CLEAR_DELAY_MS)).toEqual({});

  expect(clearExpiredTypingStatus({
    'peer-a': { username: 'alice', isTyping: true, lastTypingTime: 1000 }
  }, 'peer-a', 999 + TYPING_CLEAR_DELAY_MS)).toEqual({
    'peer-a': { username: 'alice', isTyping: true, lastTypingTime: 1000 }
  });
});

test('createTypingStatusMessage builds outbound typing payloads', () => {
  expect(createTypingStatusMessage(true, 1234)).toEqual({
    type: 'typing',
    isTyping: true,
    timestamp: 1234
  });
});
