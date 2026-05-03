import { test, expect } from '@playwright/test';
import { createPeerDiscoveryController } from '../../../src/utils/peerDiscoveryController.js';

test('createPeerDiscoveryController wires leader role, leader connection, session and health controllers', () => {
  const calls = [];
  const controller = createPeerDiscoveryController({
    ...createBaseDependencies(calls),
    createLeaderRole: (options) => {
      calls.push(['createLeaderRole', options.staleThresholdMs]);
      return {
        setupLeadershipRole: orgId => calls.push(['setupLeadershipRole', orgId]),
        broadcastPeerListUpdate: () => calls.push(['broadcastPeerListUpdate'])
      };
    },
    createLeaderConnection: (options) => {
      calls.push(['createLeaderConnection', options.reconnectDelayMs]);
      return {
        setupLeaderConnection: connection => calls.push(['setupLeaderConnection', connection])
      };
    },
    createDiscoverySession: (options) => {
      calls.push(['createDiscoverySession', options.PeerClass.name]);
      options.setConnectedToLeader('leader-connection');
      options.setLeadershipPeer('leader-peer');
      options.setCurrentLeader(true);
      return {
        initialize: () => {
          calls.push(['initialize']);
          options.startHealthCheckSystem('manaty');
          return 'initialized';
        },
        connectToLeader: () => 'connected',
        attemptLeadership: () => 'claimed'
      };
    },
    createLeaderHealth: (options) => {
      calls.push(['createLeaderHealth']);
      return {
        startHealthCheckSystem: orgId => {
          calls.push(['startHealthCheckSystem', orgId]);
          options.setHealthCheckInterval('health-interval');
          return 'health-interval';
        },
        reconnectToLeader: orgId => calls.push(['reconnectToLeader', orgId]),
        stepDownFromLeadership: () => calls.push(['stepDownFromLeadership'])
      };
    }
  });

  expect(controller.initializeDiscoverySystem()).toBe('initialized');
  expect(controller.getConnectedToLeader()).toBe('leader-connection');
  expect(controller.isCurrentLeader()).toBe(true);
  controller.broadcastPeerListUpdate();
  controller.stepDownFromLeadership();
  controller.reconnectToLeader('manaty');

  expect(calls).toEqual([
    ['createLeaderRole', expect.any(Number)],
    ['createLeaderConnection', expect.any(Number)],
    ['createDiscoverySession', 'FakePeer'],
    ['createLeaderHealth'],
    ['initialize'],
    ['startHealthCheckSystem', 'manaty'],
    ['broadcastPeerListUpdate'],
    ['stepDownFromLeadership'],
    ['reconnectToLeader', 'manaty']
  ]);
});

test('createPeerDiscoveryController resets discovery runtime state on shutdown', () => {
  const calls = [];
  const controller = createPeerDiscoveryController({
    ...createBaseDependencies(calls),
    createDiscoverySession: (options) => {
      options.setConnectedToLeader({ id: 'leader-connection' });
      options.setLeadershipPeer({ id: 'leader-peer' });
      options.setCurrentLeader(true);
      return {
        initialize: () => {
          options.startHealthCheckSystem('manaty');
          return 'initialized';
        },
        connectToLeader: () => {},
        attemptLeadership: () => {}
      };
    },
    createLeaderHealth: (options) => ({
      startHealthCheckSystem: () => {
        options.setHealthCheckInterval('health-interval');
      },
      reconnectToLeader: () => {},
      stepDownFromLeadership: () => {}
    }),
    clearTimerFn: interval => {
      calls.push(['clearTimer', interval]);
      return null;
    },
    destroyPeerFn: peer => {
      calls.push(['destroyPeer', peer]);
      return null;
    },
    closeConnectionFn: connection => {
      calls.push(['closeConnection', connection]);
      return null;
    }
  });

  controller.initializeDiscoverySystem();
  controller.getPeerRegistry().set('peer-a', {});
  controller.shutdownDiscovery();

  expect(controller.isCurrentLeader()).toBe(false);
  expect(controller.getConnectedToLeader()).toBeNull();
  expect(controller.getPeerRegistry().size).toBe(0);
  expect(calls).toEqual([
    ['clearTimer', 'health-interval'],
    ['destroyPeer', { id: 'leader-peer' }],
    ['closeConnection', { id: 'leader-connection' }]
  ]);
});

function createBaseDependencies(calls) {
  class FakePeer {}

  return {
    PeerClass: FakePeer,
    getAuth: () => ({ token: 'token' }),
    getLocalPeer: () => ({ id: 'local-peer' }),
    getLocalPeerId: () => 'local-peer',
    getLocalUsername: () => 'alice',
    getRepoFullName: () => 'manaty/skygit',
    getConnections: () => ({}),
    getFailedConnections: () => new Set(),
    getStorage: () => ({ getItem: () => null, setItem: () => {} }),
    loadContacts: () => calls.push(['loadContacts']),
    updateContact: (...args) => calls.push(['updateContact', ...args]),
    connectToPeer: (...args) => calls.push(['connectToPeer', ...args]),
    log: (...args) => calls.push(['log', ...args]),
    warn: (...args) => calls.push(['warn', ...args])
  };
}
