import { test, expect } from '@playwright/test';
import { createPeerManagerLifecycleController } from '../../../src/utils/peerManagerLifecycleController.js';

test('createPeerManagerLifecycleController initializes new PeerJS sessions and binds events', () => {
  const calls = [];
  const state = createState();
  const controller = createPeerManagerLifecycleController({
    ...createBaseDependencies(calls, state),
    createSession: (repoName, username, sessionId) => ({
      peerId: `peer-${sessionId}`,
      peerOptions: { host: 'peer.example.test' },
      repoFullName: repoName,
      username: username.toLowerCase(),
      sessionId
    }),
    bindManagerEvents: (peer, handlers) => {
      calls.push(['bindManagerEvents', peer.id, Object.keys(handlers)]);
      return 'bound';
    }
  });

  const peer = controller.initializePeerManager({
    _repoFullName: 'Manaty/SkyGit',
    _username: 'Alice',
    _sessionId: 'session-a'
  });

  expect(peer.id).toBe('peer-session-a');
  expect(controller.getLocalSessionId()).toBe('session-a');
  expect(controller.getLocalPeerId()).toBe('peer-session-a');
  expect(state.localUsername).toBe('alice');
  expect(state.repoFullName).toBe('Manaty/SkyGit');
  expect(calls).toContainEqual([
    'bindManagerEvents',
    'peer-session-a',
    expect.arrayContaining(['startPeerDiscovery', 'initializeCallHandling', 'handleIncomingConnection'])
  ]);
});

test('createPeerManagerLifecycleController skips same open sessions and shuts down before switching', () => {
  const calls = [];
  const state = createState({
    localPeer: { id: 'current-peer', open: true },
    repoFullName: 'manaty/skygit',
    sessionId: 'session-a',
    leadershipPeer: { id: 'leader-peer' },
    connectedToLeader: { id: 'leader-connection' }
  });
  const controller = createPeerManagerLifecycleController({
    ...createBaseDependencies(calls, state),
    isSameSession: () => true
  });

  expect(controller.initializePeerManager({
    _repoFullName: 'manaty/skygit',
    _username: 'alice',
    _sessionId: 'session-a'
  })).toBe('same_session');

  const switchingController = createPeerManagerLifecycleController({
    ...createBaseDependencies(calls, state),
    isSameSession: () => false,
    createSession: () => ({
      peerId: 'next-peer',
      peerOptions: {},
      repoFullName: 'manaty/next',
      username: 'bob',
      sessionId: 'session-b'
    })
  });

  switchingController.initializePeerManager({
    _repoFullName: 'manaty/next',
    _username: 'bob',
    _sessionId: 'session-b'
  });

  expect(calls).toContainEqual(['closeOpenPeerConnections', { 'peer-a': {} }]);
  expect(calls).toContainEqual(['resetStores', ['peerConnections', 'onlinePeers', 'typingUsers']]);
  expect(calls).toContainEqual(['stopLeaderCommitInterval']);
  expect(state.localPeer.id).toBe('next-peer');
  expect(state.repoFullName).toBe('manaty/next');
});

test('createPeerManagerLifecycleController clears all runtime state on shutdown', () => {
  const calls = [];
  const state = createState({
    localPeer: { id: 'local-peer' },
    isCurrentLeader: true,
    leadershipPeer: { id: 'leader-peer' },
    connectedToLeader: { id: 'leader-connection' },
    healthCheckInterval: 'health-interval'
  });
  state.peerRegistry.set('peer-a', {});
  state.failedConnections.add('peer-b');
  const controller = createPeerManagerLifecycleController(createBaseDependencies(calls, state));

  controller.shutdownPeerManager();

  expect(state.healthCheckInterval).toBeNull();
  expect(state.leadershipPeer).toBeNull();
  expect(state.connectedToLeader).toBeNull();
  expect(state.isCurrentLeader).toBe(false);
  expect(state.peerRegistry.size).toBe(0);
  expect(state.failedConnections.size).toBe(0);
  expect(calls).toEqual([
    ['closeTimer', 'health-interval'],
    ['destroyPeerInstance', { id: 'leader-peer' }],
    ['closeLeaderConnection', { id: 'leader-connection' }],
    ['closeOpenPeerConnections', { 'peer-a': {} }],
    ['destroyPeerInstance', { id: 'local-peer' }],
    ['resetStores', ['peerConnections', 'onlinePeers', 'typingUsers']],
    ['stopLeaderCommitInterval']
  ]);
});

function createBaseDependencies(calls, state = createState()) {
  return {
    PeerClass: class FakePeer {
      constructor(id, options) {
        this.id = id;
        this.options = options;
      }
    },
    generatePeerId: () => 'generated-peer',
    getLocalPeer: () => state.localPeer,
    setLocalPeer: peer => {
      state.localPeer = peer;
    },
    getLocalUsername: () => state.localUsername,
    setLocalUsername: username => {
      state.localUsername = username;
    },
    getRepoFullName: () => state.repoFullName,
    setRepoFullName: repoFullName => {
      state.repoFullName = repoFullName;
    },
    getSessionId: () => state.sessionId,
    setSessionId: sessionId => {
      state.sessionId = sessionId;
    },
    getHealthCheckInterval: () => state.healthCheckInterval,
    setHealthCheckInterval: interval => {
      state.healthCheckInterval = interval;
    },
    getLeadershipPeer: () => state.leadershipPeer,
    setLeadershipPeer: peer => {
      state.leadershipPeer = peer;
    },
    getConnectedToLeader: () => state.connectedToLeader,
    setConnectedToLeader: connection => {
      state.connectedToLeader = connection;
    },
    setCurrentLeader: isLeader => {
      state.isCurrentLeader = isLeader;
    },
    getPeerRegistry: () => state.peerRegistry,
    getPeerConnections: () => state.peerConnections,
    peerStores: state.peerStores,
    getFailedConnections: () => state.failedConnections,
    stopLeaderCommitInterval: () => calls.push(['stopLeaderCommitInterval']),
    startPeerDiscovery: () => calls.push(['startPeerDiscovery']),
    initializeCallHandling: () => calls.push(['initializeCallHandling']),
    handleIncomingConnection: () => calls.push(['handleIncomingConnection']),
    bindManagerEvents: () => calls.push(['bindManagerEvents']),
    createSession: () => ({
      peerId: 'created-peer',
      peerOptions: {},
      repoFullName: 'manaty/skygit',
      username: 'alice',
      sessionId: 'session-a'
    }),
    isSameSession: () => false,
    closeTimer: interval => {
      calls.push(['closeTimer', interval]);
      return null;
    },
    closeOpenPeerConnections: connections => calls.push(['closeOpenPeerConnections', connections]),
    closeLeaderConnection: connection => {
      calls.push(['closeLeaderConnection', connection]);
      return null;
    },
    destroyPeerInstance: peer => {
      calls.push(['destroyPeerInstance', peer]);
      return null;
    },
    resetStores: stores => calls.push(['resetStores', Object.keys(stores)]),
    log: (...args) => calls.push(['log', ...args]),
    reportError: (...args) => calls.push(['reportError', ...args])
  };
}

function createState(overrides = {}) {
  return {
    localPeer: null,
    localUsername: null,
    repoFullName: null,
    sessionId: null,
    healthCheckInterval: null,
    leadershipPeer: null,
    connectedToLeader: null,
    isCurrentLeader: false,
    peerRegistry: new Map(),
    peerConnections: { 'peer-a': {} },
    peerStores: {
      peerConnections: {},
      onlinePeers: {},
      typingUsers: {}
    },
    failedConnections: new Set(),
    ...overrides
  };
}
