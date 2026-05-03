import { createLeaderRegistryEntry, removePeerFromRegistry } from './peerDiscovery.js';
import { bindConnectionEvents, bindPeerEvents } from './peerConnectionEvents.js';
import {
  broadcastDiscoveryPeerListUpdate,
  sendCompletePeerRegistry,
  sendDiscoveryPeerList
} from './peerLeaderBroadcast.js';
import {
  performLeaderRegistryMaintenance,
  startLeaderMaintenanceTimer
} from './peerLeaderHealth.js';
import { processLeaderPeerMessage } from './peerLeaderMessages.js';

export function setupDiscoveryLeadershipRole({
  leadershipPeer,
  localPeerId,
  localUsername,
  repoFullName,
  peerRegistry,
  setupPeerConnection,
  startLeaderMaintenanceTasks,
  log = () => {}
}) {
  log('[Discovery] Setting up leadership responsibilities');

  peerRegistry.set(localPeerId, createLeaderRegistryEntry(localUsername, repoFullName));

  log('[Discovery] Leader registered self in peer registry');

  bindPeerEvents(leadershipPeer, {
    connection: (connection) => {
      log('[Discovery] New peer connected to leader:', connection.peer);
      setupPeerConnection(connection);
    }
  });

  startLeaderMaintenanceTasks();

  return peerRegistry.get(localPeerId);
}

export function bindDiscoveryPeerConnection({
  connection,
  peerRegistry,
  handleLeaderMessage,
  broadcastPeerListUpdate,
  log = () => {},
  warn = () => {}
}) {
  return bindConnectionEvents(connection, {
    open: () => {
      log('[Discovery] Peer connection opened:', connection.peer);
    },
    data: (data) => {
      handleLeaderMessage(data, connection);
    },
    close: () => {
      log('[Discovery] Peer disconnected:', connection.peer);
      removePeerFromRegistry(peerRegistry, connection.peer);
      broadcastPeerListUpdate();
    },
    error: (error) => {
      warn('[Discovery] Peer connection error:', error);
      removePeerFromRegistry(peerRegistry, connection.peer);
    }
  });
}

export function createDiscoveryLeaderRoleController({
  getLeadershipPeer,
  getLocalPeerId,
  getLocalUsername,
  getRepoFullName,
  peerRegistry,
  getOrgId,
  staleThresholdMs,
  setupLeadershipRole = setupDiscoveryLeadershipRole,
  bindPeerConnection = bindDiscoveryPeerConnection,
  processLeaderMessage = processLeaderPeerMessage,
  sendRegistry = sendCompletePeerRegistry,
  sendPeerListSnapshot = sendDiscoveryPeerList,
  broadcastPeerList = broadcastDiscoveryPeerListUpdate,
  startMaintenanceTimer = startLeaderMaintenanceTimer,
  performMaintenance = performLeaderRegistryMaintenance,
  log = () => {},
  warn = () => {}
}) {
  const sendPeerRegistry = connection => sendRegistry(
    connection,
    peerRegistry,
    getOrgId(getRepoFullName()),
    log
  );

  const sendPeerList = (connection, conversationFilter) => sendPeerListSnapshot(
    connection,
    peerRegistry,
    conversationFilter,
    log
  );

  const broadcastPeerListUpdate = () => broadcastPeerList(peerRegistry, sendPeerList);

  const handleLeaderMessage = (data, connection) => processLeaderMessage({
    data,
    connection,
    peerRegistry,
    sendPeerRegistry,
    broadcastPeerListUpdate,
    log
  });

  const setupPeerConnection = connection => bindPeerConnection({
    connection,
    peerRegistry,
    handleLeaderMessage,
    broadcastPeerListUpdate,
    log,
    warn
  });

  const runMaintenance = () => performMaintenance({
    peerRegistry,
    localPeerId: getLocalPeerId(),
    staleThresholdMs,
    log
  });

  const startMaintenanceTasks = () => startMaintenanceTimer(runMaintenance);

  const setupRole = () => setupLeadershipRole({
    leadershipPeer: getLeadershipPeer(),
    localPeerId: getLocalPeerId(),
    localUsername: getLocalUsername(),
    repoFullName: getRepoFullName(),
    peerRegistry,
    setupPeerConnection,
    startLeaderMaintenanceTasks: startMaintenanceTasks,
    log
  });

  return {
    setupLeadershipRole: setupRole,
    setupPeerConnection,
    handleLeaderMessage,
    sendPeerRegistry,
    sendPeerList,
    broadcastPeerListUpdate,
    startLeaderMaintenanceTasks: startMaintenanceTasks,
    performLeaderMaintenance: runMaintenance
  };
}
