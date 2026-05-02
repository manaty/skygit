import { test, expect } from '@playwright/test';
import {
  applyTypingStatus,
  clearExpiredTypingStatus,
  createTypingStatusMessage,
  isValidTypingMessage,
  processIncomingTypingMessage,
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

test('processIncomingTypingMessage updates typing users and schedules auto-clear', () => {
  const timers = [];
  let state = {};
  const updateTypingUsers = (updater) => {
    state = updater(state);
  };

  expect(processIncomingTypingMessage({
    message: { isTyping: true },
    fromUsername: 'alice',
    fromPeerId: 'peer-a',
    updateTypingUsers,
    setTimeoutFn: (callback, delay) => {
      timers.push([callback, delay]);
      return 11;
    },
    now: () => 1234
  })).toBe('typing');

  expect(state).toEqual({
    'peer-a': { username: 'alice', isTyping: true, lastTypingTime: 1234 }
  });
  expect(timers).toHaveLength(1);
  expect(timers[0][1]).toBe(TYPING_CLEAR_DELAY_MS);

  timers[0][0]();
  expect(state).toEqual({});
});

test('processIncomingTypingMessage rejects invalid payloads and clears explicit stops', () => {
  const warnings = [];
  let state = {
    'peer-a': { username: 'alice', isTyping: true, lastTypingTime: 1 }
  };
  const updateTypingUsers = (updater) => {
    state = updater(state);
  };

  expect(processIncomingTypingMessage({
    message: { isTyping: 'yes' },
    fromUsername: 'alice',
    fromPeerId: 'peer-a',
    updateTypingUsers,
    warn: (...args) => warnings.push(args)
  })).toBe('invalid');
  expect(state).toHaveProperty('peer-a');

  expect(processIncomingTypingMessage({
    message: { isTyping: false },
    fromUsername: 'alice',
    fromPeerId: 'peer-a',
    updateTypingUsers
  })).toBe('not_typing');
  expect(state).toEqual({});
  expect(warnings).toEqual([['[PeerJS] Invalid typing message format:', { isTyping: 'yes' }]]);
});
