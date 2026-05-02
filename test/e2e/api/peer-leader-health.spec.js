import { test, expect } from '@playwright/test';
import {
  closeRemovedPeerConnections,
  getLeaderHealthAction,
  isLeaderConnectionOpen,
  notifyLeadershipChange,
  pruneStalePeerRegistry,
  scheduleLeaderReconnect,
  sendLeaderHeartbeat,
  startLeaderHealthTimer,
  startLeaderMaintenanceTimer
} from '../../../src/utils/peerLeaderHealth.js';
import {
  LEADER_HEALTH_CHECK_INTERVAL_MS,
  LEADER_MAINTENANCE_INTERVAL_MS,
  PEER_STALE_THRESHOLD_MS
} from '../../../src/utils/peerDiscovery.js';

test('leader timer helpers use the shared discovery intervals', () => {
  const scheduled = [];
  const fn = () => {};

  expect(startLeaderMaintenanceTimer(fn, (callback, interval) => scheduled.push(['maintenance', callback, interval]))).toBe(1);
  expect(startLeaderHealthTimer(fn, (callback, interval) => scheduled.push(['health', callback, interval]))).toBe(2);
  expect(scheduled).toEqual([
    ['maintenance', fn, LEADER_MAINTENANCE_INTERVAL_MS],
    ['health', fn, LEADER_HEALTH_CHECK_INTERVAL_MS]
  ]);
});

test('pruneStalePeerRegistry removes stale remote peers only', () => {
  const now = 10_000;
  const registry = new Map([
    ['local', { lastSeen: 1 }],
    ['fresh', { lastSeen: now - PEER_STALE_THRESHOLD_MS + 1 }],
    ['stale', { lastSeen: now - PEER_STALE_THRESHOLD_MS - 1 }]
  ]);

  const removed = pruneStalePeerRegistry(registry, 'local', now, PEER_STALE_THRESHOLD_MS);

  expect(removed.map(({ peerId }) => peerId)).toEqual(['stale']);
  expect([...registry.keys()]).toEqual(['local', 'fresh']);
});

test('closeRemovedPeerConnections closes open stale connections', () => {
  const closed = [];
  closeRemovedPeerConnections([
    { peerId: 'open', info: { connection: { open: true, close: () => closed.push('open') } } },
    { peerId: 'closed', info: { connection: { open: false, close: () => closed.push('closed') } } },
    { peerId: 'missing', info: {} }
  ]);

  expect(closed).toEqual(['open']);
});

test('notifyLeadershipChange sends to open registered peer connections', () => {
  const sent = [];
  const registry = new Map([
    ['peer-a', { connection: { open: true, send: (message) => sent.push(['peer-a', message]) } }],
    ['peer-b', { connection: { open: false, send: (message) => sent.push(['peer-b', message]) } }]
  ]);

  notifyLeadershipChange(registry, { type: 'leadership_change' });

  expect(sent).toEqual([['peer-a', { type: 'leadership_change' }]]);
});

test('leader health helpers classify connection state and heartbeat work', () => {
  const sent = [];
  const connection = { open: true, send: (message) => sent.push(message) };

  expect(getLeaderHealthAction(true, null)).toBe('skip');
  expect(getLeaderHealthAction(false, connection)).toBe('heartbeat');
  expect(getLeaderHealthAction(false, null)).toBe('reconnect');
  expect(isLeaderConnectionOpen(connection)).toBe(true);
  expect(isLeaderConnectionOpen({ open: false })).toBe(false);
  expect(isLeaderConnectionOpen(null)).toBe(false);

  sendLeaderHeartbeat(connection, { type: 'heartbeat' });
  expect(sent).toEqual([{ type: 'heartbeat' }]);
});

test('scheduleLeaderReconnect delegates delayed reconnect scheduling', () => {
  const reconnect = () => {};
  const scheduled = [];

  expect(scheduleLeaderReconnect(reconnect, 250, (callback, delay) => scheduled.push([callback, delay]))).toBe(1);
  expect(scheduled).toEqual([[reconnect, 250]]);
});
