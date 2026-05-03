import { bindPeerManagerEvents } from './peerManagerEvents.js';
import {
  clearTimer,
  closeConnection,
  closeOpenConnections,
  createPeerManagerSession,
  destroyPeer,
  isSameOpenPeerSession,
  resetPeerStores
} from './peerLifecycle.js';

export function createPeerManagerLifecycleController({
  PeerClass,
  generatePeerId,
  getLocalPeer,
  setLocalPeer,
  getLocalUsername,
  setLocalUsername,
  getRepoFullName,
  setRepoFullName,
  getSessionId,
  setSessionId,
  getHealthCheckInterval,
  setHealthCheckInterval,
  getLeadershipPeer,
  setLeadershipPeer,
  getConnectedToLeader,
  setConnectedToLeader,
  setCurrentLeader,
  getPeerRegistry,
  getPeerConnections,
  peerStores,
  getFailedConnections,
  shutdownDiscovery,
  stopLeaderCommitInterval,
  startPeerDiscovery,
  initializeCallHandling,
  handleIncomingConnection,
  bindManagerEvents = bindPeerManagerEvents,
  createSession = createPeerManagerSession,
  isSameSession = isSameOpenPeerSession,
  closeTimer = clearTimer,
  closeOpenPeerConnections = closeOpenConnections,
  closeLeaderConnection = closeConnection,
  destroyPeerInstance = destroyPeer,
  resetStores = resetPeerStores,
  log = () => {},
  reportError = () => {}
}) {
  const getLocalSessionId = () => getSessionId();
  const getLocalPeerId = () => getLocalPeer()?.id;

  const shutdownPeerManager = () => {
    if (shutdownDiscovery) {
      shutdownDiscovery();
    } else {
      setHealthCheckInterval(closeTimer(getHealthCheckInterval()));
      setLeadershipPeer(destroyPeerInstance(getLeadershipPeer()));
      setConnectedToLeader(closeLeaderConnection(getConnectedToLeader()));
      setCurrentLeader(false);
      getPeerRegistry().clear();
    }

    closeOpenPeerConnections(getPeerConnections());
    setLocalPeer(destroyPeerInstance(getLocalPeer()));

    resetStores(peerStores);
    getFailedConnections().clear();
    stopLeaderCommitInterval();
  };

  const initializePeerManager = ({ _token, _repoFullName, _username, _sessionId }) => {
    log('[PeerJS] Initializing peer manager:', { _repoFullName, _username, _sessionId });

    if (isSameSession(getLocalPeer(), getRepoFullName(), getSessionId(), _repoFullName, _sessionId)) {
      log('[PeerJS] Already connected to this repo with same session, skipping initialization');
      return 'same_session';
    }

    if (getLocalPeer()) {
      log('[PeerJS] Switching from', getRepoFullName(), 'to', _repoFullName, 'or session changed');
      shutdownPeerManager();
    }

    const nextSession = createSession(_repoFullName, _username, _sessionId, generatePeerId);
    setLocalUsername(nextSession.username);
    setRepoFullName(nextSession.repoFullName);
    setSessionId(nextSession.sessionId);

    log('[PeerJS] Generated peer ID:', nextSession.peerId);

    const peer = new PeerClass(nextSession.peerId, nextSession.peerOptions);
    setLocalPeer(peer);

    bindManagerEvents(peer, {
      startPeerDiscovery,
      initializeCallHandling,
      handleIncomingConnection,
      log,
      reportError
    });

    return peer;
  };

  return {
    getLocalSessionId,
    getLocalPeerId,
    shutdownPeerManager,
    initializePeerManager
  };
}
