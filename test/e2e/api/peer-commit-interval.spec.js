import { test, expect } from '@playwright/test';
import {
  getCurrentLeaderId,
  isLocalPeerLeader,
  LEADER_COMMIT_INTERVAL_MS,
  refreshLeaderCommitInterval,
  shouldRunLeaderCommitInterval,
  startLeaderCommitTimer,
  stopLeaderCommitTimer
} from '../../../src/utils/peerCommitInterval.js';

test('getCurrentLeaderId chooses the lexicographically smallest available peer id', () => {
  expect(getCurrentLeaderId('peer-c', {
    'peer-b': {},
    'peer-a': {}
  })).toBe('peer-a');
  expect(getCurrentLeaderId(null, { 'peer-b': {} })).toBe('peer-b');
  expect(getCurrentLeaderId(null, {})).toBeUndefined();
});

test('isLocalPeerLeader and shouldRunLeaderCommitInterval require local leadership with remotes', () => {
  expect(isLocalPeerLeader('peer-a', { 'peer-b': {} })).toBe(true);
  expect(isLocalPeerLeader('peer-b', { 'peer-a': {} })).toBe(false);
  expect(shouldRunLeaderCommitInterval('peer-a', { 'peer-b': {} })).toBe(true);
  expect(shouldRunLeaderCommitInterval('peer-a', {})).toBe(false);
  expect(shouldRunLeaderCommitInterval('peer-b', { 'peer-a': {} })).toBe(false);
});

test('startLeaderCommitTimer flushes only while the local peer remains leader', () => {
  const flushes = [];
  const intervals = [];
  let stillLeader = true;

  const timer = startLeaderCommitTimer(
    () => flushes.push('flush'),
    () => stillLeader,
    (callback, delay) => {
      intervals.push({ callback, delay });
      return 13;
    }
  );

  expect(timer).toBe(13);
  expect(intervals[0].delay).toBe(LEADER_COMMIT_INTERVAL_MS);
  intervals[0].callback();
  stillLeader = false;
  intervals[0].callback();
  expect(flushes).toEqual(['flush']);
});

test('stopLeaderCommitTimer clears existing timers and returns a null assignment value', () => {
  const cleared = [];

  expect(stopLeaderCommitTimer(13, (timer) => cleared.push(timer))).toBeNull();
  expect(stopLeaderCommitTimer(null, (timer) => cleared.push(timer))).toBeNull();
  expect(cleared).toEqual([13]);
});

test('refreshLeaderCommitInterval starts, keeps, and stops the leader commit timer', () => {
  const calls = [];

  expect(refreshLeaderCommitInterval({
    localPeerId: 'peer-a',
    connections: { 'peer-b': {} },
    currentInterval: null,
    flushCommitQueue: () => calls.push('flush'),
    isStillLeader: () => true,
    startTimer: (flush, isLeader) => {
      calls.push(['start', isLeader()]);
      flush();
      return 42;
    },
    log: (...args) => calls.push(['log', ...args])
  })).toBe(42);

  expect(refreshLeaderCommitInterval({
    localPeerId: 'peer-a',
    connections: { 'peer-b': {} },
    currentInterval: 42,
    flushCommitQueue: () => calls.push('flush-again'),
    isStillLeader: () => true,
    startTimer: () => { throw new Error('should not restart'); }
  })).toBe(42);

  expect(refreshLeaderCommitInterval({
    localPeerId: 'peer-b',
    connections: { 'peer-a': {} },
    currentInterval: 42,
    flushCommitQueue: () => {},
    isStillLeader: () => false,
    stopTimer: (timer) => {
      calls.push(['stop', timer]);
      return null;
    },
    log: (...args) => calls.push(['log', ...args])
  })).toBeNull();

  expect(calls).toEqual([
    ['log', '[PeerJS] Starting leader commit interval'],
    ['start', true],
    'flush',
    ['log', '[PeerJS] Stopping leader commit interval - no peers or not leader'],
    ['stop', 42]
  ]);
});
