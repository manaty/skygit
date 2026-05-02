import {
  sendFilteredPeerListSnapshot,
  sendPeerRegistrySnapshot
} from './peerDiscovery.js';

export function sendCompletePeerRegistry(connection, peerRegistry, orgId, log = () => {}) {
  const peerList = sendPeerRegistrySnapshot(connection, peerRegistry, orgId);

  log(`[Discovery] Sending complete peer registry to ${connection.peer}:`, peerList);

  return peerList;
}

export function sendDiscoveryPeerList(connection, peerRegistry, conversationFilter, log = () => {}) {
  const filteredPeers = sendFilteredPeerListSnapshot(connection, peerRegistry, conversationFilter);

  log(`[Discovery] Sending peer list to ${connection.peer}:`, filteredPeers);

  return filteredPeers;
}

export function broadcastDiscoveryPeerListUpdate(peerRegistry, sendPeerList) {
  const notifiedPeerIds = [];

  for (const [peerId, info] of peerRegistry.entries()) {
    if (info.connection?.open) {
      sendPeerList(info.connection);
      notifiedPeerIds.push(peerId);
    }
  }

  return notifiedPeerIds;
}
