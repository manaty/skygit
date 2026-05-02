import {
  getLocalPeerConnectionReadiness,
  hasPeerConnection,
  markPeerConnectionFailed,
  OUTGOING_CONNECTION_RETRY_DELAY_MS
} from './peerConnectionLifecycle.js';
import { bindPeerDataConnection } from './peerConnectionEvents.js';
import { createPeerConnectionMetadata } from './peerConnectionState.js';

export function getIncomingConnectionUsername(connection) {
  return (connection.metadata?.username || 'Unknown').toLowerCase();
}

export function bindIncomingPeerDataConnection(connection, {
  addPeerConnection,
  handlePeerMessage,
  removePeerConnection,
  log = () => {},
  reportError = () => {}
}) {
  log('[PeerJS] Setting up incoming connection from:', connection.peer);
  log('[PeerJS] Connection metadata:', connection.metadata);

  return bindPeerDataConnection(connection, {
    username: getIncomingConnectionUsername(connection),
    open: (peerId, peerUsername) => {
      log('[PeerJS] ✅ Incoming connection opened from:', peerId, 'username:', peerUsername);
      addPeerConnection(connection, peerUsername);
    },
    data: (data, peerId, peerUsername) => {
      log('[PeerJS] Received data from:', peerId, data);
      handlePeerMessage(data, peerId, peerUsername);
    },
    close: (peerId) => {
      log('[PeerJS] Incoming connection closed from:', peerId);
      removePeerConnection(peerId);
    },
    error: (error, peerId) => {
      reportError('[PeerJS] ❌ Incoming connection error from:', peerId, error);
      removePeerConnection(peerId);
    }
  });
}

export function bindOutgoingPeerDataConnection(connection, {
  peerId,
  username,
  addPeerConnection,
  handlePeerMessage,
  removePeerConnection,
  failedConnections,
  retryDelayMs = OUTGOING_CONNECTION_RETRY_DELAY_MS,
  failedConnectionScheduler = setTimeout,
  log = () => {},
  reportError = () => {}
}) {
  return bindPeerDataConnection(connection, {
    peerId,
    username,
    open: (targetPeerId, peerUsername) => {
      log('[PeerJS] ✅ Outgoing connection opened to:', targetPeerId);
      addPeerConnection(connection, peerUsername);
    },
    data: (data, targetPeerId, peerUsername) => {
      log('[PeerJS] Received data from:', targetPeerId, data);
      handlePeerMessage(data, targetPeerId, peerUsername);
    },
    close: (targetPeerId) => {
      log('[PeerJS] Outgoing connection closed to:', targetPeerId);
      removePeerConnection(targetPeerId);
    },
    error: (error, targetPeerId) => {
      reportError('[PeerJS] ❌ Outgoing connection error to:', targetPeerId, error);
      removePeerConnection(targetPeerId);
      markPeerConnectionFailed(failedConnections, targetPeerId, retryDelayMs, failedConnectionScheduler);
    }
  });
}

export function connectToOutgoingPeer({
  localPeer,
  targetPeerId,
  username,
  connections,
  localUsername,
  repoFullName,
  sessionId,
  addPeerConnection,
  handlePeerMessage,
  removePeerConnection,
  failedConnections,
  failedConnectionScheduler,
  log = () => {},
  reportError = () => {}
}) {
  log('[PeerJS] Connecting to peer:', targetPeerId, 'username:', username);
  log('[PeerJS] Local peer ID:', localPeer?.id, 'Local peer open:', localPeer?.open);

  const readiness = getLocalPeerConnectionReadiness(localPeer);
  if (readiness === 'missing') {
    reportError('[PeerJS] Local peer not initialized');
    return undefined;
  }

  if (readiness === 'closed') {
    reportError('[PeerJS] Local peer not connected to signaling server yet');
    return undefined;
  }

  if (hasPeerConnection(connections, targetPeerId)) {
    log('[PeerJS] Already have connection to:', targetPeerId);
    return undefined;
  }

  log('[PeerJS] Initiating connection to:', targetPeerId);
  const connection = localPeer.connect(targetPeerId, {
    metadata: createPeerConnectionMetadata(localUsername, repoFullName, sessionId)
  });

  log('[PeerJS] Connection object created:', connection);

  bindOutgoingPeerDataConnection(connection, {
    peerId: targetPeerId,
    username,
    addPeerConnection,
    handlePeerMessage,
    removePeerConnection,
    failedConnections,
    failedConnectionScheduler,
    log,
    reportError
  });

  return connection;
}
