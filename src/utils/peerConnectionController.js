import { buildOnlinePeerRows } from './peerBroadcast.js';
import {
  processClosedPeerConnection,
  processOpenedPeerConnection,
  sendConversationSyncRequests
} from './peerConnectionLifecycle.js';
import {
  bindIncomingPeerDataConnection,
  connectToOutgoingPeer
} from './peerDataConnections.js';

export function createPeerConnectionController({
  getLocalPeer,
  getLocalUsername,
  getRepoFullName,
  getSessionId,
  getConnections,
  getConversations,
  getPeerRegistry,
  getCurrentDiscoveryLeader,
  getFailedConnections,
  updatePeerConnections,
  setOnlinePeers,
  updateTypingUsers,
  updateContact,
  requestMessageSync,
  handlePeerMessage,
  broadcastPeerListUpdate,
  bindIncomingConnection = bindIncomingPeerDataConnection,
  connectOutgoingPeer = connectToOutgoingPeer,
  processOpenedConnection = processOpenedPeerConnection,
  processClosedConnection = processClosedPeerConnection,
  buildOnlineRows = buildOnlinePeerRows,
  sendSyncRequests = sendConversationSyncRequests,
  log = () => {},
  reportError = () => {}
}) {
  const updateOnlinePeers = () => {
    setOnlinePeers(buildOnlineRows(getConnections()));
  };

  const syncConversationsWithPeer = peerId => {
    log('[PeerJS] Starting conversation sync with peer:', peerId);
    sendSyncRequests(peerId, getConversations(), getRepoFullName(), requestMessageSync, log);
  };

  const addPeerConnection = (connection, username = null) => processOpenedConnection({
    connection,
    username,
    updatePeerConnections,
    updateContact,
    updateOnlinePeers,
    syncConversationsWithPeer,
    log
  });

  const removePeerConnection = peerId => {
    log('[PeerJS] Removing peer connection:', peerId);

    return processClosedConnection({
      peerId,
      connections: getConnections(),
      updatePeerConnections,
      updateTypingUsers,
      updateContact,
      updateOnlinePeers,
      peerRegistry: getPeerRegistry(),
      isCurrentLeader: getCurrentDiscoveryLeader(),
      broadcastPeerListUpdate,
      failedConnections: getFailedConnections(),
      log
    });
  };

  const handleIncomingConnection = connection => bindIncomingConnection(connection, {
    addPeerConnection,
    handlePeerMessage,
    removePeerConnection,
    log,
    reportError
  });

  const connectToPeer = (targetPeerId, username) => connectOutgoingPeer({
    localPeer: getLocalPeer(),
    targetPeerId,
    username,
    connections: getConnections(),
    localUsername: getLocalUsername(),
    repoFullName: getRepoFullName(),
    sessionId: getSessionId(),
    addPeerConnection,
    handlePeerMessage,
    removePeerConnection,
    failedConnections: getFailedConnections(),
    log,
    reportError
  });

  return {
    updateOnlinePeers,
    syncConversationsWithPeer,
    addPeerConnection,
    removePeerConnection,
    handleIncomingConnection,
    connectToPeer
  };
}
