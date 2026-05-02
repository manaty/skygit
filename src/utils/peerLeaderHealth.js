import {
  LEADER_HEALTH_CHECK_INTERVAL_MS,
  LEADER_MAINTENANCE_INTERVAL_MS,
  PEER_STALE_THRESHOLD_MS
} from './peerDiscovery.js';

export function startLeaderMaintenanceTimer(performMaintenance, setIntervalFn = setInterval) {
  return setIntervalFn(performMaintenance, LEADER_MAINTENANCE_INTERVAL_MS);
}

export function pruneStalePeerRegistry(
  peerRegistry,
  localPeerId,
  now = Date.now(),
  staleThresholdMs = PEER_STALE_THRESHOLD_MS
) {
  const removedPeers = [];

  for (const [peerId, info] of peerRegistry.entries()) {
    if (peerId === localPeerId) continue;

    if (now - (info.lastSeen || 0) > staleThresholdMs) {
      peerRegistry.delete(peerId);
      removedPeers.push({ peerId, info });
    }
  }

  return removedPeers;
}

export function closeRemovedPeerConnections(removedPeers) {
  removedPeers.forEach(({ info }) => {
    if (info.connection?.open) {
      info.connection.close();
    }
  });
}

export function notifyLeadershipChange(peerRegistry, message) {
  peerRegistry.forEach((info) => {
    if (info.connection?.open) {
      info.connection.send(message);
    }
  });
}

export function performLeaderRegistryMaintenance({
  peerRegistry,
  localPeerId,
  now = Date.now(),
  staleThresholdMs = PEER_STALE_THRESHOLD_MS,
  closeConnections = closeRemovedPeerConnections,
  log = () => {}
}) {
  log('[Discovery] Performing leader maintenance, current peers:', peerRegistry.size);

  const removedPeers = pruneStalePeerRegistry(peerRegistry, localPeerId, now, staleThresholdMs);
  removedPeers.forEach(({ peerId }) => log('[Discovery] Removing stale peer:', peerId));
  closeConnections(removedPeers);

  return removedPeers;
}

export function stepDownFromDiscoveryLeadership({
  peerRegistry,
  leadershipPeer,
  leadershipChangeMessage,
  destroyPeer,
  setLeadershipPeer,
  setCurrentLeader,
  log = () => {}
}) {
  log('[Discovery] Stepping down from leadership');

  notifyLeadershipChange(peerRegistry, leadershipChangeMessage);

  const nextLeadershipPeer = destroyPeer(leadershipPeer);
  setLeadershipPeer(nextLeadershipPeer);
  setCurrentLeader(false);
  peerRegistry.clear();

  return nextLeadershipPeer;
}

export function startLeaderHealthTimer(checkHealth, setIntervalFn = setInterval) {
  return setIntervalFn(checkHealth, LEADER_HEALTH_CHECK_INTERVAL_MS);
}

export function getLeaderHealthAction(isCurrentLeader, connectedToLeader) {
  if (isCurrentLeader) return 'skip';
  if (connectedToLeader) return 'heartbeat';

  return 'reconnect';
}

export function handleLeaderHealthTick({
  isCurrentLeader,
  connectedToLeader,
  checkLeaderHealth,
  reconnectToLeader
}) {
  const action = getLeaderHealthAction(isCurrentLeader, connectedToLeader);
  if (action === 'skip') return action;
  if (action === 'heartbeat') {
    checkLeaderHealth();
    return action;
  }

  reconnectToLeader();
  return action;
}

export function isLeaderConnectionOpen(connection) {
  return Boolean(connection && connection.open !== false);
}

export function sendLeaderHeartbeat(connection, message) {
  connection.send(message);
}

export function checkDiscoveryLeaderHealth({
  connectedToLeader,
  heartbeatMessage,
  reconnectToLeader,
  setConnectedToLeader,
  log = () => {},
  warn = () => {}
}) {
  if (!isLeaderConnectionOpen(connectedToLeader)) {
    log('[Discovery] Leader connection lost, attempting reconnection');
    setConnectedToLeader(null);
    reconnectToLeader();
    return 'reconnect';
  }

  try {
    sendLeaderHeartbeat(connectedToLeader, heartbeatMessage);
    return 'heartbeat';
  } catch (error) {
    warn('[Discovery] Failed to send heartbeat to leader:', error);
    setConnectedToLeader(null);
    reconnectToLeader();
    return 'reconnect';
  }
}

export async function reconnectToDiscoveryLeader({
  orgId,
  buildLeaderId,
  connectToLeader,
  attemptLeadership,
  log = () => {}
}) {
  const leaderId = buildLeaderId(orgId);
  const connected = await connectToLeader(leaderId);

  if (!connected) {
    log('[Discovery] No leader available, attempting to become leader');
    await attemptLeadership(leaderId, orgId);
  }

  return {
    leaderId,
    connected
  };
}

export function scheduleLeaderReconnect(reconnect, delayMs, setTimeoutFn = setTimeout) {
  return setTimeoutFn(reconnect, delayMs);
}
