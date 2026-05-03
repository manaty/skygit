import { createDiscoveryBootstrap, createDiscoveryConnectionMetadata } from './peerDiscovery.js';
import { connectPeerWithTimeout } from './peerConnection.js';
import { claimPeerLeadershipSlot } from './peerLeadershipClaim.js';

export async function initializePeerDiscoverySession({
  auth,
  repoFullName,
  createDiscoveryBootstrap,
  loadContacts,
  connectToLeader,
  attemptLeadership,
  startHealthCheckSystem,
  log = () => {}
}) {
  const discovery = createDiscoveryBootstrap(auth, repoFullName);
  if (!discovery) {
    log('[Discovery] No GitHub auth available');
    return {
      status: 'missing_auth'
    };
  }

  const { orgId, leaderId } = discovery;
  log('[Discovery] Initializing for org:', orgId, 'Leader ID:', leaderId);

  loadContacts(orgId);

  const connected = await connectToLeader(leaderId);
  log('[Discovery] Connection attempt result:', connected);

  if (!connected) {
    log('[Discovery] No leader found, attempting to become leader');
    await attemptLeadership(leaderId, orgId);
  }

  log('[Discovery] Starting health check system');
  startHealthCheckSystem(orgId);

  return {
    status: connected ? 'connected_to_leader' : 'leadership_attempted',
    orgId,
    leaderId,
    connected
  };
}

export async function connectToDiscoveryLeader({
  leaderId,
  connectToPeer,
  setupLeaderConnection,
  setConnectedToLeader,
  log = () => {}
}) {
  log('[Discovery] Attempting to connect to leader:', leaderId);

  try {
    const connection = await connectToPeer(leaderId, 3000);

    if (connection) {
      log('[Discovery] ✅ Connected to leader');
      setConnectedToLeader(connection);
      setupLeaderConnection(connection);
      return true;
    }
  } catch (error) {
    log('[Discovery] Leader unavailable:', error.message);
  }

  return false;
}

export async function attemptDiscoveryLeadership({
  leaderId,
  orgId,
  claimLeadershipSlot,
  setCurrentLeader,
  log = () => {}
}) {
  log('[Discovery] Attempting to claim leadership:', leaderId);

  try {
    const success = await claimLeadershipSlot(leaderId, orgId);
    if (success) {
      log('[Discovery] 👑 Became leader');
      setCurrentLeader(true);
      return 'leader';
    }

    log('[Discovery] Leadership already taken, operating as regular peer');
    return 'peer';
  } catch (error) {
    log('[Discovery] Failed to claim leadership:', error.message);
    return 'failed';
  }
}

export function createDiscoverySessionOrchestrator({
  getAuth,
  getRepoFullName,
  getLocalPeer,
  getLocalUsername,
  PeerClass,
  loadContacts,
  setupLeaderConnection,
  setupLeadershipRole,
  startHealthCheckSystem,
  setConnectedToLeader,
  setLeadershipPeer,
  setCurrentLeader,
  createDiscoveryBootstrap: buildDiscoveryBootstrap = createDiscoveryBootstrap,
  createDiscoveryConnectionMetadata: buildConnectionMetadata = createDiscoveryConnectionMetadata,
  connectPeer = connectPeerWithTimeout,
  claimLeadership = claimPeerLeadershipSlot,
  log = () => {}
}) {
  const connectToPeer = (peerId, timeout = 5000) => connectPeer(
    getLocalPeer(),
    peerId,
    buildConnectionMetadata(getLocalUsername()),
    timeout
  );

  const connectToLeader = leaderId => connectToDiscoveryLeader({
    leaderId,
    connectToPeer,
    setupLeaderConnection,
    setConnectedToLeader,
    log
  });

  const claimLeadershipSlot = (leaderId, orgId) => claimLeadership({
    PeerClass,
    leaderId,
    onLeadershipPeer: setLeadershipPeer,
    onLeadershipSetup: () => setupLeadershipRole(orgId)
  });

  const attemptLeadership = (leaderId, orgId) => attemptDiscoveryLeadership({
    leaderId,
    orgId,
    claimLeadershipSlot,
    setCurrentLeader,
    log
  });

  const initialize = () => initializePeerDiscoverySession({
    auth: getAuth(),
    repoFullName: getRepoFullName(),
    createDiscoveryBootstrap: buildDiscoveryBootstrap,
    loadContacts,
    connectToLeader,
    attemptLeadership,
    startHealthCheckSystem,
    log
  });

  return {
    initialize,
    connectToLeader,
    attemptLeadership
  };
}
