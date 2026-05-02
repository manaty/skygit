import {
  persistOrgPeerRegistryContacts,
  processDiscoveredPeerConnections
} from './peerDiscovery.js';

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
