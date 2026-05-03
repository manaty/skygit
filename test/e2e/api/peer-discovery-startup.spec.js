import { test, expect } from '@playwright/test';
import {
  attemptDiscoveryLeadership,
  connectToDiscoveryLeader,
  createDiscoverySessionOrchestrator,
  initializePeerDiscoverySession
} from '../../../src/utils/peerDiscoveryStartup.js';

test('initializePeerDiscoverySession exits early without discovery bootstrap', async () => {
  const calls = [];

  const result = await initializePeerDiscoverySession({
    auth: null,
    repoFullName: 'manaty/skygit',
    createDiscoveryBootstrap: () => null,
    loadContacts: () => calls.push('loadContacts'),
    connectToLeader: () => calls.push('connectToLeader'),
    attemptLeadership: () => calls.push('attemptLeadership'),
    startHealthCheckSystem: () => calls.push('startHealthCheckSystem'),
    log: (...args) => calls.push(['log', ...args])
  });

  expect(result).toEqual({
    status: 'missing_auth'
  });
  expect(calls).toEqual([['log', '[Discovery] No GitHub auth available']]);
});

test('initializePeerDiscoverySession connects to an existing leader and starts health checks', async () => {
  const calls = [];

  const result = await initializePeerDiscoverySession({
    auth: { user: { login: 'alice' } },
    repoFullName: 'manaty/skygit',
    createDiscoveryBootstrap: () => ({
      orgId: 'manaty',
      leaderId: 'skygit_discovery_manaty'
    }),
    loadContacts: (orgId) => calls.push(['loadContacts', orgId]),
    connectToLeader: async (leaderId) => {
      calls.push(['connectToLeader', leaderId]);
      return true;
    },
    attemptLeadership: async () => calls.push('attemptLeadership'),
    startHealthCheckSystem: (orgId) => calls.push(['startHealthCheckSystem', orgId])
  });

  expect(result).toEqual({
    status: 'connected_to_leader',
    orgId: 'manaty',
    leaderId: 'skygit_discovery_manaty',
    connected: true
  });
  expect(calls).toEqual([
    ['loadContacts', 'manaty'],
    ['connectToLeader', 'skygit_discovery_manaty'],
    ['startHealthCheckSystem', 'manaty']
  ]);
});

test('initializePeerDiscoverySession attempts leadership when no leader is available', async () => {
  const calls = [];

  const result = await initializePeerDiscoverySession({
    auth: { user: { login: 'alice' } },
    repoFullName: 'manaty/skygit',
    createDiscoveryBootstrap: () => ({
      orgId: 'manaty',
      leaderId: 'skygit_discovery_manaty'
    }),
    loadContacts: (orgId) => calls.push(['loadContacts', orgId]),
    connectToLeader: async (leaderId) => {
      calls.push(['connectToLeader', leaderId]);
      return false;
    },
    attemptLeadership: async (leaderId, orgId) => calls.push(['attemptLeadership', leaderId, orgId]),
    startHealthCheckSystem: (orgId) => calls.push(['startHealthCheckSystem', orgId])
  });

  expect(result).toEqual({
    status: 'leadership_attempted',
    orgId: 'manaty',
    leaderId: 'skygit_discovery_manaty',
    connected: false
  });
  expect(calls).toEqual([
    ['loadContacts', 'manaty'],
    ['connectToLeader', 'skygit_discovery_manaty'],
    ['attemptLeadership', 'skygit_discovery_manaty', 'manaty'],
    ['startHealthCheckSystem', 'manaty']
  ]);
});

test('connectToDiscoveryLeader stores and sets up successful leader connections', async () => {
  const connection = { peer: 'leader', open: true };
  const calls = [];

  const result = await connectToDiscoveryLeader({
    leaderId: 'leader',
    connectToPeer: async (peerId, timeout) => {
      calls.push(['connectToPeer', peerId, timeout]);
      return connection;
    },
    setupLeaderConnection: (conn) => calls.push(['setupLeaderConnection', conn]),
    setConnectedToLeader: (conn) => calls.push(['setConnectedToLeader', conn])
  });

  expect(result).toBe(true);
  expect(calls).toEqual([
    ['connectToPeer', 'leader', 3000],
    ['setConnectedToLeader', connection],
    ['setupLeaderConnection', connection]
  ]);
});

test('connectToDiscoveryLeader reports unavailable leaders without setup', async () => {
  const logs = [];
  const calls = [];

  const result = await connectToDiscoveryLeader({
    leaderId: 'leader',
    connectToPeer: async () => {
      throw new Error('Connection timeout');
    },
    setupLeaderConnection: () => calls.push('setupLeaderConnection'),
    setConnectedToLeader: () => calls.push('setConnectedToLeader'),
    log: (...args) => logs.push(args)
  });

  expect(result).toBe(false);
  expect(calls).toEqual([]);
  expect(logs).toContainEqual(['[Discovery] Leader unavailable:', 'Connection timeout']);
});

test('attemptDiscoveryLeadership marks the local peer leader only after a successful claim', async () => {
  const leaderStates = [];

  const result = await attemptDiscoveryLeadership({
    leaderId: 'leader',
    orgId: 'manaty',
    claimLeadershipSlot: async () => true,
    setCurrentLeader: (isLeader) => leaderStates.push(isLeader)
  });

  expect(result).toBe('leader');
  expect(leaderStates).toEqual([true]);
});

test('attemptDiscoveryLeadership handles taken and failed leadership claims', async () => {
  const takenResult = await attemptDiscoveryLeadership({
    leaderId: 'leader',
    orgId: 'manaty',
    claimLeadershipSlot: async () => false,
    setCurrentLeader: () => {}
  });
  const failedResult = await attemptDiscoveryLeadership({
    leaderId: 'leader',
    orgId: 'manaty',
    claimLeadershipSlot: async () => {
      throw new Error('unavailable');
    },
    setCurrentLeader: () => {}
  });

  expect(takenResult).toBe('peer');
  expect(failedResult).toBe('failed');
});

test('createDiscoverySessionOrchestrator connects to leaders with discovery metadata', async () => {
  const connection = { peer: 'leader', open: true };
  const localPeer = { id: 'local-peer' };
  const calls = [];
  const states = [];
  const orchestrator = createDiscoverySessionOrchestrator({
    getAuth: () => ({ user: { login: 'alice' } }),
    getRepoFullName: () => 'manaty/skygit',
    getLocalPeer: () => localPeer,
    getLocalUsername: () => 'Alice',
    PeerClass: class Peer {},
    loadContacts: orgId => calls.push(['loadContacts', orgId]),
    setupLeaderConnection: conn => calls.push(['setupLeaderConnection', conn]),
    setupLeadershipRole: orgId => calls.push(['setupLeadershipRole', orgId]),
    startHealthCheckSystem: orgId => calls.push(['startHealthCheckSystem', orgId]),
    setConnectedToLeader: conn => states.push(['connectedToLeader', conn]),
    setLeadershipPeer: peer => states.push(['leadershipPeer', peer]),
    setCurrentLeader: isLeader => states.push(['currentLeader', isLeader]),
    createDiscoveryBootstrap: () => ({
      orgId: 'manaty',
      leaderId: 'skygit_discovery_manaty'
    }),
    createDiscoveryConnectionMetadata: username => ({ username }),
    connectPeer: async (...args) => {
      calls.push(['connectPeer', ...args]);
      return connection;
    },
    claimLeadership: () => {
      calls.push('claimLeadership');
      return true;
    }
  });

  await expect(orchestrator.initialize()).resolves.toMatchObject({
    status: 'connected_to_leader',
    connected: true
  });

  expect(calls).toEqual([
    ['loadContacts', 'manaty'],
    ['connectPeer', localPeer, 'skygit_discovery_manaty', { username: 'Alice' }, 3000],
    ['setupLeaderConnection', connection],
    ['startHealthCheckSystem', 'manaty']
  ]);
  expect(states).toEqual([
    ['connectedToLeader', connection]
  ]);
});

test('createDiscoverySessionOrchestrator claims leadership when no leader is available', async () => {
  const leadershipPeer = { id: 'leader-peer' };
  const states = [];
  const calls = [];
  class Peer {}
  const orchestrator = createDiscoverySessionOrchestrator({
    getAuth: () => ({ user: { login: 'alice' } }),
    getRepoFullName: () => 'manaty/skygit',
    getLocalPeer: () => ({ id: 'local-peer' }),
    getLocalUsername: () => 'Alice',
    PeerClass: Peer,
    loadContacts: orgId => calls.push(['loadContacts', orgId]),
    setupLeaderConnection: conn => calls.push(['setupLeaderConnection', conn]),
    setupLeadershipRole: orgId => calls.push(['setupLeadershipRole', orgId]),
    startHealthCheckSystem: orgId => calls.push(['startHealthCheckSystem', orgId]),
    setConnectedToLeader: conn => states.push(['connectedToLeader', conn]),
    setLeadershipPeer: peer => states.push(['leadershipPeer', peer]),
    setCurrentLeader: isLeader => states.push(['currentLeader', isLeader]),
    createDiscoveryBootstrap: () => ({
      orgId: 'manaty',
      leaderId: 'skygit_discovery_manaty'
    }),
    createDiscoveryConnectionMetadata: username => ({ username }),
    connectPeer: async () => {
      throw new Error('Connection timeout');
    },
    claimLeadership: ({ PeerClass, leaderId, onLeadershipPeer, onLeadershipSetup }) => {
      calls.push(['claimLeadership', PeerClass, leaderId]);
      onLeadershipPeer(leadershipPeer);
      onLeadershipSetup();
      return true;
    }
  });

  await expect(orchestrator.initialize()).resolves.toMatchObject({
    status: 'leadership_attempted',
    connected: false
  });

  expect(calls).toEqual([
    ['loadContacts', 'manaty'],
    ['claimLeadership', Peer, 'skygit_discovery_manaty'],
    ['setupLeadershipRole', 'manaty'],
    ['startHealthCheckSystem', 'manaty']
  ]);
  expect(states).toEqual([
    ['leadershipPeer', leadershipPeer],
    ['currentLeader', true]
  ]);
});
