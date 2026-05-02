import { createLeaderRegistryEntry, removePeerFromRegistry } from './peerDiscovery.js';
import { bindConnectionEvents, bindPeerEvents } from './peerConnectionEvents.js';

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
