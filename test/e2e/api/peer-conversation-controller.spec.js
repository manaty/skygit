import { test, expect } from '@playwright/test';
import { createPeerConversationController } from '../../../src/utils/peerConversationController.js';

test('createPeerConversationController reports leader status from live connections', () => {
  const controller = createPeerConversationController({
    ...createBaseDependencies(),
    getLocalPeerId: () => 'peer-a',
    getConnections: () => ({
      'peer-b': {},
      'peer-c': {}
    })
  });

  expect(controller.getCurrentLeader()).toBe('peer-a');
  expect(controller.isLeader()).toBe(true);
});

test('createPeerConversationController refreshes and stops leader commit intervals', () => {
  const calls = [];
  let subscribedCallback = null;
  const controller = createPeerConversationController({
    ...createBaseDependencies(calls),
    refreshCommitInterval: ({ localPeerId, connections, currentInterval, isStillLeader }) => {
      calls.push(['refreshCommitInterval', localPeerId, connections, currentInterval, isStillLeader()]);
      return 'interval-a';
    },
    clearTimer: interval => {
      calls.push(['clearTimer', interval]);
      return null;
    }
  });

  expect(controller.subscribePeerConnectionChanges({
    subscribe: callback => {
      subscribedCallback = callback;
      return 'unsubscribe';
    }
  })).toBe('unsubscribe');

  subscribedCallback();
  expect(controller.stopLeaderCommitInterval()).toBeNull();

  expect(calls).toEqual([
    ['refreshCommitInterval', 'peer-a', { 'peer-b': {} }, null, true],
    ['clearTimer', 'interval-a']
  ]);
});

test('createPeerConversationController updates discovery conversations', () => {
  const calls = [];
  const registry = new Map();
  const leaderConnection = { open: true };
  const controller = createPeerConversationController({
    ...createBaseDependencies(calls),
    getCurrentDiscoveryLeader: () => true,
    getPeerRegistry: () => registry,
    getLeaderConnection: () => leaderConnection,
    processConversationUpdate: (options) => {
      calls.push(['processConversationUpdate', options]);
      return 'updated';
    }
  });

  expect(controller.updateMyConversations(['manaty/skygit'])).toBe('updated');
  expect(calls).toEqual([
    ['processConversationUpdate', expect.objectContaining({
      conversations: ['manaty/skygit'],
      isCurrentLeader: true,
      peerRegistry: registry,
      localPeerId: 'peer-a',
      leaderConnection
    })]
  ]);
});

test('createPeerConversationController subscribes committed message broadcasts', () => {
  const calls = [];
  const controller = createPeerConversationController({
    ...createBaseDependencies(calls),
    subscribeCommittedBroadcasts: (options) => {
      calls.push(['subscribeCommittedBroadcasts', options]);
      return 'unsubscribe-commits';
    }
  });

  expect(controller.subscribeCommittedMessages()).toBe('unsubscribe-commits');
  expect(calls).toEqual([
    ['subscribeCommittedBroadcasts', expect.objectContaining({
      committedEvents: 'committed-events',
      broadcastToAllPeers: expect.any(Function)
    })]
  ]);
});

function createBaseDependencies(calls = []) {
  return {
    getLocalPeerId: () => 'peer-a',
    getConnections: () => ({ 'peer-b': {} }),
    getCurrentDiscoveryLeader: () => false,
    getPeerRegistry: () => new Map(),
    getLeaderConnection: () => null,
    flushCommitQueue: () => calls.push(['flushCommitQueue']),
    clearTimer: interval => interval,
    committedEvents: 'committed-events',
    broadcastToAllPeers: (...args) => calls.push(['broadcastToAllPeers', ...args]),
    log: (...args) => calls.push(['log', ...args])
  };
}
