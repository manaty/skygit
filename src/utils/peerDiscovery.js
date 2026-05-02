export const PEER_STALE_THRESHOLD_MS = 60000;

export function generatePeerId(repoFullName, username, sessionId) {
  const base = `${repoFullName.replace('/', '-')}-${username}-${sessionId}`;
  return base.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase();
}

export function getOrgId(repoFullName) {
  return repoFullName.split('/')[0];
}

export function buildLeaderId(orgId) {
  return `skygit_discovery_${orgId}`;
}

export function buildPeerRegistryList(peerRegistry) {
  return Array.from(peerRegistry.entries()).map(([peerId, info]) => ({
    peerId,
    username: info.username,
    conversations: info.conversations,
    isLeader: info.isLeader || false,
    lastSeen: info.lastSeen
  }));
}

export function buildFilteredPeerList(peerRegistry, conversationFilter) {
  return Array.from(peerRegistry.entries())
    .filter(([, info]) => {
      if (conversationFilter) {
        return info.conversations.some(conversation => conversation === conversationFilter);
      }
      return true;
    })
    .map(([peerId, info]) => ({
      peerId,
      username: info.username,
      conversations: info.conversations,
      isLeader: info.isLeader || false
    }));
}

export function toStoredOrgPeers(peers) {
  return peers.map(peer => ({
    peerId: peer.peerId,
    username: peer.username.toLowerCase(),
    conversations: peer.conversations,
    isLeader: peer.isLeader,
    lastSeen: peer.lastSeen,
    online: true
  }));
}

export function isPeerStale(peerInfo, now, threshold = PEER_STALE_THRESHOLD_MS) {
  return now - peerInfo.lastSeen > threshold;
}
