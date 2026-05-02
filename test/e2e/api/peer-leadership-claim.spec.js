import { test, expect } from '@playwright/test';
import {
  claimPeerLeadershipSlot,
  createLeadershipPeerOptions,
  getLeadershipClaimErrorResult,
  LEADERSHIP_CLAIM_TIMEOUT_MS
} from '../../../src/utils/peerLeadershipClaim.js';

class FakePeer {
  static instances = [];

  constructor(id, options) {
    this.id = id;
    this.options = options;
    this.handlers = {};
    this.destroyed = false;
    FakePeer.instances.push(this);
  }

  on(event, handler) {
    this.handlers[event] = handler;
  }

  emit(event, payload) {
    this.handlers[event](payload);
  }

  destroy() {
    this.destroyed = true;
  }
}

test.beforeEach(() => {
  FakePeer.instances = [];
});

test('createLeadershipPeerOptions keeps leader claim PeerJS noise low', () => {
  expect(createLeadershipPeerOptions()).toEqual({ debug: 0 });
  expect(LEADERSHIP_CLAIM_TIMEOUT_MS).toBe(5000);
});

test('getLeadershipClaimErrorResult maps unavailable IDs to taken leadership', () => {
  expect(getLeadershipClaimErrorResult({ type: 'unavailable-id' })).toBe('taken');
  expect(getLeadershipClaimErrorResult({ type: 'network' })).toBe('error');
  expect(getLeadershipClaimErrorResult()).toBe('error');
});

test('claimPeerLeadershipSlot resolves true when the requested leader id opens', async () => {
  const leadershipPeers = [];
  const setups = [];
  const cleared = [];
  const promise = claimPeerLeadershipSlot({
    PeerClass: FakePeer,
    leaderId: 'leader-org',
    onLeadershipPeer: (peer) => leadershipPeers.push(peer),
    onLeadershipSetup: () => setups.push('setup'),
    setTimeoutFn: () => 7,
    clearTimeoutFn: (timer) => cleared.push(timer)
  });

  FakePeer.instances[0].emit('open', 'leader-org');

  await expect(promise).resolves.toBe(true);
  expect(leadershipPeers).toEqual([FakePeer.instances[0]]);
  expect(setups).toEqual(['setup']);
  expect(cleared).toEqual([7]);
});

test('claimPeerLeadershipSlot resolves false when leadership is already taken', async () => {
  const promise = claimPeerLeadershipSlot({
    PeerClass: FakePeer,
    leaderId: 'leader-org',
    onLeadershipPeer: () => {},
    onLeadershipSetup: () => {},
    setTimeoutFn: () => 8,
    clearTimeoutFn: () => {}
  });

  FakePeer.instances[0].emit('error', { type: 'unavailable-id' });

  await expect(promise).resolves.toBe(false);
});

test('claimPeerLeadershipSlot rejects non-availability errors', async () => {
  const error = new Error('network down');
  const promise = claimPeerLeadershipSlot({
    PeerClass: FakePeer,
    leaderId: 'leader-org',
    onLeadershipPeer: () => {},
    onLeadershipSetup: () => {},
    setTimeoutFn: () => 9,
    clearTimeoutFn: () => {}
  });

  FakePeer.instances[0].emit('error', error);

  await expect(promise).rejects.toThrow('network down');
});

test('claimPeerLeadershipSlot destroys the temporary peer on timeout', async () => {
  let timeoutCallback;
  const promise = claimPeerLeadershipSlot({
    PeerClass: FakePeer,
    leaderId: 'leader-org',
    onLeadershipPeer: () => {},
    onLeadershipSetup: () => {},
    setTimeoutFn: (callback) => {
      timeoutCallback = callback;
      return 10;
    },
    clearTimeoutFn: () => {}
  });

  timeoutCallback();

  await expect(promise).rejects.toThrow('Leadership claim timeout');
  expect(FakePeer.instances[0].destroyed).toBe(true);
});
