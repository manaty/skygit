import {
  persistOrgPeerRegistryContacts,
  sendRegisterWithLeader,
  processDiscoveredPeerConnections
} from './peerDiscovery.js';
import { bindLeaderConnectionEvents } from './peerConnectionEvents.js';
import { handleLeaderDiscoveryResponse } from './peerLeaderMessages.js';

export function storeDiscoveredPeerRegistry({
  storage,
  orgId,
  peers,
  updateContact,
  log = () => {}
}) {
  const orgPeers = persistOrgPeerRegistryContacts(storage, orgId, peers, updateContact);

  log('[Discovery] Stored', orgPeers.length, 'peers for org:', orgId);

  return orgPeers;
}

export function connectToReceivedOrgPeers({
  peers,
  localPeerId,
  connections,
  failedConnections,
  connectToPeer,
  log = () => {}
}) {
  log('[Discovery] Connecting to all org peers:', peers.length);

  return processDiscoveredPeerConnections({
    peers,
    localPeerId,
    connections,
    failedConnections,
    sourceLabel: 'org peer',
    connectToPeer,
    log
  });
}

export function updateKnownPeerConnections({
  peers,
  localPeerId,
  connections,
  failedConnections,
  connectToPeer,
  log = () => {}
}) {
  log('[Discovery] Processing peer list, found', peers.length, 'peers');

  peers.forEach(peer => {
    log('[Discovery] Processing peer:', peer.peerId, 'username:', peer.username, 'isLeader:', peer.isLeader);
  });

  return processDiscoveredPeerConnections({
    peers,
    localPeerId,
    connections,
    failedConnections,
    sourceLabel: 'discovered peer',
    connectToPeer,
    log,
    includeSelfLog: true
  });
}

export function createLeaderConnectionController({
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
  reconnectDelayMs,
  bindLeaderConnection = bindLeaderConnectionEvents,
  sendRegister = sendRegisterWithLeader,
  handleLeaderResponse = handleLeaderDiscoveryResponse,
  storeRegistry = storeDiscoveredPeerRegistry,
  connectOrgPeers = connectToReceivedOrgPeers,
  updateKnownPeers = updateKnownPeerConnections,
  scheduleReconnect = setTimeout,
  log = () => {},
  warn = () => {}
}) {
  const registerWithLeader = connection => sendRegister(connection, getLocalUsername(), getRepoFullName());

  const storePeerRegistry = (peers, orgId) => storeRegistry({
    storage: getStorage(),
    orgId,
    peers,
    updateContact,
    log
  });

  const connectToOrgPeers = peers => connectOrgPeers({
    peers,
    localPeerId: getLocalPeerId(),
    connections: getConnections(),
    failedConnections: getFailedConnections(),
    connectToPeer,
    log
  });

  const updateKnownPeerList = peers => updateKnownPeers({
    peers,
    localPeerId: getLocalPeerId(),
    connections: getConnections(),
    failedConnections: getFailedConnections(),
    connectToPeer,
    log
  });

  const handleResponse = data => handleLeaderResponse(data, {
    updateKnownPeers: updateKnownPeerList,
    storePeerRegistry,
    connectToOrgPeers,
    onLeadershipChange: () => {
      setConnectedToLeader(null);
      scheduleReconnect(() => reconnectToLeader(getOrgId(getRepoFullName())), reconnectDelayMs);
    },
    log
  });

  const setupLeaderConnection = connection => bindLeaderConnection(connection, {
    data: handleResponse,
    disconnected: () => {
      setConnectedToLeader(null);
    },
    register: registerWithLeader,
    log,
    warn
  });

  return {
    setupLeaderConnection,
    registerWithLeader,
    handleLeaderResponse: handleResponse,
    storePeerRegistry,
    connectToOrgPeers,
    updateKnownPeers: updateKnownPeerList
  };
}
