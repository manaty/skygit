import { test, expect } from '@playwright/test';
import {
  applyConversationPresencePolling,
  getConversationPresenceContext,
  isPresencePollingActive,
  startConversationPresence,
  toggleConversationPresence
} from '../../../src/services/conversationPresenceService.js';

function createPresenceDeps(calls) {
  return {
    getSessionId: repo => {
      calls.push(['session', repo]);
      return `session:${repo}`;
    },
    initializePeerManager: options => calls.push(['init', options]),
    updateMyConversations: repos => calls.push(['update', repos]),
    shutdownPeerManager: () => calls.push(['shutdown']),
    setPollingState: (repo, active) => calls.push(['polling', repo, active]),
    schedule: (callback, delay) => {
      calls.push(['schedule', delay]);
      callback();
      return 'timer-a';
    }
  };
}

test('conversation presence service resolves context and polling defaults', () => {
  expect(getConversationPresenceContext({
    conversation: { repo: 'manaty/skygit' },
    token: 'token-a',
    auth: { user: { login: 'alice' } }
  })).toEqual({
    repoFullName: 'manaty/skygit',
    token: 'token-a',
    username: 'alice'
  });
  expect(isPresencePollingActive({}, 'manaty/skygit')).toBe(true);
  expect(isPresencePollingActive({ 'manaty/skygit': false }, 'manaty/skygit')).toBe(false);
});

test('startConversationPresence initializes PeerJS and schedules conversation discovery update', () => {
  const calls = [];
  const result = startConversationPresence({
    repoFullName: 'manaty/skygit',
    token: 'token-a',
    username: 'alice',
    ...createPresenceDeps(calls)
  });

  expect(result).toEqual({ status: 'started', sessionId: 'session:manaty/skygit', timeoutId: 'timer-a' });
  expect(calls).toEqual([
    ['session', 'manaty/skygit'],
    ['init', {
      _token: 'token-a',
      _repoFullName: 'manaty/skygit',
      _username: 'alice',
      _sessionId: 'session:manaty/skygit'
    }],
    ['schedule', 2000],
    ['update', ['manaty/skygit']]
  ]);
});

test('applyConversationPresencePolling starts or stops according to repo polling state', () => {
  const startedCalls = [];
  const started = applyConversationPresencePolling({
    repoFullName: 'manaty/skygit',
    token: 'token-a',
    username: 'alice',
    pollingMap: {},
    ...createPresenceDeps(startedCalls)
  });

  const stoppedCalls = [];
  const stopped = applyConversationPresencePolling({
    repoFullName: 'manaty/skygit',
    token: 'token-a',
    username: 'alice',
    pollingMap: { 'manaty/skygit': false },
    ...createPresenceDeps(stoppedCalls)
  });

  expect(started.status).toBe('started');
  expect(started.pollingActive).toBe(true);
  expect(stopped).toEqual({ status: 'stopped', pollingActive: false });
  expect(stoppedCalls).toEqual([['shutdown']]);
});

test('toggleConversationPresence flips polling and starts or stops PeerJS presence', () => {
  const stopCalls = [];
  const stopped = toggleConversationPresence({
    repoFullName: 'manaty/skygit',
    token: 'token-a',
    username: 'alice',
    pollingActive: true,
    ...createPresenceDeps(stopCalls)
  });

  const startCalls = [];
  const started = toggleConversationPresence({
    repoFullName: 'manaty/skygit',
    token: 'token-a',
    username: 'alice',
    pollingActive: false,
    ...createPresenceDeps(startCalls)
  });

  expect(stopped).toEqual({ status: 'stopped', pollingActive: false });
  expect(stopCalls).toEqual([
    ['polling', 'manaty/skygit', false],
    ['shutdown']
  ]);
  expect(started.status).toBe('started');
  expect(started.pollingActive).toBe(true);
  expect(startCalls[0]).toEqual(['polling', 'manaty/skygit', true]);
});
