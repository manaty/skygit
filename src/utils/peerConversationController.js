import {
  createUpdateConversationsMessage,
  subscribeCommittedMessageBroadcasts
} from './peerCommitProtocol.js';
import {
  getCurrentLeaderId,
  isLocalPeerLeader,
  refreshLeaderCommitInterval
} from './peerCommitInterval.js';
import { processLocalConversationUpdate } from './peerConversationUpdates.js';

export function createPeerConversationController({
  getLocalPeerId,
  getConnections,
  getCurrentDiscoveryLeader,
  getPeerRegistry,
  getLeaderConnection,
  flushCommitQueue,
  clearTimer,
  committedEvents,
  broadcastToAllPeers,
  createUpdateMessage = createUpdateConversationsMessage,
  processConversationUpdate = processLocalConversationUpdate,
  refreshCommitInterval = refreshLeaderCommitInterval,
  getLeaderId = getCurrentLeaderId,
  checkLocalLeader = isLocalPeerLeader,
  subscribeCommittedBroadcasts = subscribeCommittedMessageBroadcasts,
  log = () => {}
}) {
  let leaderCommitInterval = null;

  const getCurrentLeader = () => getLeaderId(getLocalPeerId(), getConnections());
  const isLeader = () => checkLocalLeader(getLocalPeerId(), getConnections());

  const refreshLeaderInterval = () => {
    leaderCommitInterval = refreshCommitInterval({
      localPeerId: getLocalPeerId(),
      connections: getConnections(),
      currentInterval: leaderCommitInterval,
      flushCommitQueue,
      isStillLeader: isLeader,
      log
    });

    return leaderCommitInterval;
  };

  const subscribePeerConnectionChanges = peerConnections => peerConnections.subscribe(() => {
    refreshLeaderInterval();
  });

  const stopLeaderCommitInterval = () => {
    leaderCommitInterval = clearTimer(leaderCommitInterval);
    return leaderCommitInterval;
  };

  const updateMyConversations = conversations => processConversationUpdate({
    conversations,
    isCurrentLeader: getCurrentDiscoveryLeader(),
    peerRegistry: getPeerRegistry(),
    localPeerId: getLocalPeerId(),
    leaderConnection: getLeaderConnection(),
    createUpdateMessage,
    log
  });

  const subscribeCommittedMessages = () => subscribeCommittedBroadcasts({
    committedEvents,
    broadcastToAllPeers,
    log
  });

  return {
    getCurrentLeader,
    isLeader,
    refreshLeaderInterval,
    subscribePeerConnectionChanges,
    stopLeaderCommitInterval,
    updateMyConversations,
    subscribeCommittedMessages
  };
}
