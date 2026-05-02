export const PEER_STALE_THRESHOLD_MS = 60000;
export const LEADER_MAINTENANCE_INTERVAL_MS = 30000;
export const LEADER_HEALTH_CHECK_INTERVAL_MS = 10000;
export const LEADERSHIP_RECONNECT_DELAY_MS = 1000;

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

export function createDiscoveryBootstrap(auth, repoFullName) {
  if (!auth?.user?.login) return null;

  const orgId = getOrgId(repoFullName);

  return {
    orgId,
    leaderId: buildLeaderId(orgId)
  };
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

export function persistOrgPeerRegistry(storage, orgId, peers) {
  const orgPeers = toStoredOrgPeers(peers);
  storage.setItem(`skygit_peers_${orgId}`, JSON.stringify(orgPeers));
  return orgPeers;
}

export function getStoredPeerContactUpdateEntries(orgPeers) {
  return orgPeers.map(peer => [
    peer.username,
    createStoredPeerContactUpdate(peer)
  ]);
}

export function createLeaderRegistryEntry(username, repoFullName, now = Date.now()) {
  return {
    username,
    conversations: [repoFullName],
    lastSeen: now,
    connection: null,
    isLeader: true
  };
}

export function createRegisteredPeerEntry(data, connection, now = Date.now()) {
  return {
    username: data.username,
    conversations: data.conversations || [],
    lastSeen: now,
    connection,
    isLeader: false
  };
}

export function registerPeerInRegistry(peerRegistry, peerId, message, connection, now = Date.now()) {
  const entry = createRegisteredPeerEntry(message, connection, now);
  peerRegistry.set(peerId, entry);
  return entry;
}

export function updatePeerRegistryConversations(peerRegistry, peerId, conversations, now = Date.now()) {
  const peerInfo = peerRegistry.get(peerId);
  if (!peerInfo) return false;

  peerInfo.conversations = conversations;
  peerInfo.lastSeen = now;
  return true;
}

export function touchPeerRegistryHeartbeat(peerRegistry, peerId, now = Date.now()) {
  const peerInfo = peerRegistry.get(peerId);
  if (!peerInfo) return false;

  peerInfo.lastSeen = now;
  return true;
}

export function removePeerFromRegistry(peerRegistry, peerId) {
  return peerRegistry.delete(peerId);
}

export function createPeerRegistryMessage(peers, orgId) {
  return {
    type: 'peer_registry',
    peers,
    orgId
  };
}

export function createPeerListMessage(peers) {
  return {
    type: 'peer_list',
    peers
  };
}

export function sendPeerRegistrySnapshot(connection, peerRegistry, orgId) {
  const peerList = buildPeerRegistryList(peerRegistry);
  connection.send(createPeerRegistryMessage(peerList, orgId));
  return peerList;
}

export function sendFilteredPeerListSnapshot(connection, peerRegistry, conversationFilter) {
  const filteredPeers = buildFilteredPeerList(peerRegistry, conversationFilter);
  connection.send(createPeerListMessage(filteredPeers));
  return filteredPeers;
}

export function createRegisterWithLeaderMessage(username, repoFullName, timestamp = Date.now()) {
  return {
    type: 'register',
    username,
    conversations: [repoFullName],
    timestamp
  };
}

export function sendRegisterWithLeader(connection, username, repoFullName) {
  const message = createRegisterWithLeaderMessage(username, repoFullName);
  connection.send(message);
  return message;
}

export function createHeartbeatMessage(timestamp = Date.now()) {
  return {
    type: 'heartbeat',
    timestamp
  };
}

export function createLeadershipChangeMessage() {
  return {
    type: 'leadership_change',
    message: 'Leader stepping down, reconnect to discovery system'
  };
}

export function createStoredPeerContactUpdate(peer) {
  return {
    peerId: peer.peerId,
    username: peer.username,
    conversations: peer.conversations,
    isLeader: peer.isLeader,
    lastSeen: peer.lastSeen,
    online: false
  };
}

export function isPeerStale(peerInfo, now, threshold = PEER_STALE_THRESHOLD_MS) {
  return now - peerInfo.lastSeen > threshold;
}

export function getPeerConnectionStatus(peer, localPeerId, connections, failedConnections) {
  if (peer.peerId === localPeerId) {
    return 'self';
  }

  if (connections[peer.peerId]) {
    return 'connected';
  }

  if (failedConnections.has(peer.peerId)) {
    return 'failed';
  }

  return 'available';
}

export function groupPeersByConnectionStatus(peers, localPeerId, connections, failedConnections) {
  return peers.reduce((groups, peer) => {
    const status = getPeerConnectionStatus(peer, localPeerId, connections, failedConnections);
    groups[status].push(peer);
    return groups;
  }, {
    available: [],
    connected: [],
    failed: [],
    self: []
  });
}

export function getConnectablePeers(peers, localPeerId, connections, failedConnections) {
  return groupPeersByConnectionStatus(peers, localPeerId, connections, failedConnections).available;
}
