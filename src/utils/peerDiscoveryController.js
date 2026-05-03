import {
  buildLeaderId,
  createHeartbeatMessage,
  createLeadershipChangeMessage,
  getOrgId,
  LEADERSHIP_RECONNECT_DELAY_MS,
  PEER_STALE_THRESHOLD_MS
} from './peerDiscovery.js';
import { createDiscoverySessionOrchestrator } from './peerDiscoveryStartup.js';
import {
  clearTimer,
  closeConnection,
  destroyPeer
} from './peerLifecycle.js';
import {
  createLeaderHealthController,
  scheduleLeaderReconnect
} from './peerLeaderHealth.js';
import { createDiscoveryLeaderRoleController } from './peerLeaderRole.js';
import { createLeaderConnectionController } from './peerLeaderResponses.js';

export function createPeerDiscoveryController({
  PeerClass,
  getAuth,
  getLocalPeer,
  getLocalPeerId,
  getLocalUsername,
  getRepoFullName,
  getConnections,
  getFailedConnections,
  getStorage,
  loadContacts,
  updateContact,
  connectToPeer,
  createLeaderRole = createDiscoveryLeaderRoleController,
  createLeaderConnection = createLeaderConnectionController,
  createDiscoverySession = createDiscoverySessionOrchestrator,
  createLeaderHealth = createLeaderHealthController,
  clearTimerFn = clearTimer,
  closeConnectionFn = closeConnection,
  destroyPeerFn = destroyPeer,
  log = () => {},
  warn = () => {}
}) {
  let isCurrentLeader = false;
  let leadershipPeer = null;
  let connectedToLeader = null;
  const peerRegistry = new Map();
  let healthCheckInterval = null;
  let leaderHealth = null;

  const setConnectedToLeader = connection => {
    connectedToLeader = connection;
  };
  const setLeadershipPeer = peer => {
    leadershipPeer = peer;
  };
  const setCurrentLeader = isLeader => {
    isCurrentLeader = isLeader;
  };

  const leaderRole = createLeaderRole({
    getLeadershipPeer: () => leadershipPeer,
    getLocalPeerId,
    getLocalUsername,
    getRepoFullName,
    peerRegistry,
    getOrgId,
    staleThresholdMs: PEER_STALE_THRESHOLD_MS,
    log,
    warn
  });

  const reconnectToLeader = orgId => leaderHealth.reconnectToLeader(orgId);

  const leaderConnection = createLeaderConnection({
    getRepoFullName,
    getLocalUsername,
    getLocalPeerId,
    getConnections,
    getFailedConnections,
    getStorage,
    getOrgId,
    updateContact,
    connectToPeer,
    reconnectToLeader,
    setConnectedToLeader,
    reconnectDelayMs: LEADERSHIP_RECONNECT_DELAY_MS,
    scheduleReconnect: scheduleLeaderReconnect,
    log,
    warn
  });

  const discoverySession = createDiscoverySession({
    getAuth,
    getRepoFullName,
    getLocalPeer,
    getLocalUsername,
    PeerClass,
    loadContacts,
    setupLeaderConnection: leaderConnection.setupLeaderConnection,
    setupLeadershipRole: leaderRole.setupLeadershipRole,
    startHealthCheckSystem: orgId => leaderHealth.startHealthCheckSystem(orgId),
    setConnectedToLeader,
    setLeadershipPeer,
    setCurrentLeader,
    log
  });

  leaderHealth = createLeaderHealth({
    getCurrentLeader: () => isCurrentLeader,
    getConnectedToLeader: () => connectedToLeader,
    getPeerRegistry: () => peerRegistry,
    getLeadershipPeer: () => leadershipPeer,
    getHealthCheckInterval: () => healthCheckInterval,
    setHealthCheckInterval: interval => {
      healthCheckInterval = interval;
    },
    buildLeaderId,
    createHeartbeatMessage,
    createLeadershipChangeMessage,
    destroyPeer: destroyPeerFn,
    setConnectedToLeader,
    setLeadershipPeer,
    setCurrentLeader,
    connectToLeader: discoverySession.connectToLeader,
    attemptLeadership: discoverySession.attemptLeadership,
    clearTimer: clearTimerFn,
    log,
    warn
  });

  const initializeDiscoverySystem = () => discoverySession.initialize();

  const stepDownFromLeadership = () => leaderHealth.stepDownFromLeadership();

  const shutdownDiscovery = () => {
    healthCheckInterval = clearTimerFn(healthCheckInterval);
    leadershipPeer = destroyPeerFn(leadershipPeer);
    connectedToLeader = closeConnectionFn(connectedToLeader);
    isCurrentLeader = false;
    peerRegistry.clear();
  };

  return {
    initializeDiscoverySystem,
    reconnectToLeader,
    stepDownFromLeadership,
    shutdownDiscovery,
    broadcastPeerListUpdate: leaderRole.broadcastPeerListUpdate,
    getPeerRegistry: () => peerRegistry,
    getConnectedToLeader: () => connectedToLeader,
    isCurrentLeader: () => isCurrentLeader
  };
}
