export function applyLeaderConversationUpdate(peerRegistry, localPeerId, conversations, now = Date.now()) {
  if (!peerRegistry.has(localPeerId)) return false;

  const localInfo = peerRegistry.get(localPeerId);
  localInfo.conversations = conversations;
  localInfo.lastSeen = now;

  return true;
}

export function shouldNotifyLeaderOfConversations(leaderConnection) {
  return Boolean(leaderConnection?.open);
}

export function notifyLeaderOfConversations(leaderConnection, conversations, createMessage) {
  leaderConnection.send(createMessage(conversations));
}

export function processLocalConversationUpdate({
  conversations,
  isCurrentLeader,
  peerRegistry,
  localPeerId,
  leaderConnection,
  createUpdateMessage,
  log = () => {}
}) {
  const result = {
    updatedLeaderRegistry: false,
    notifiedLeader: false
  };

  if (isCurrentLeader && applyLeaderConversationUpdate(peerRegistry, localPeerId, conversations)) {
    log('[Discovery] Leader updated own conversations:', conversations);
    result.updatedLeaderRegistry = true;
  }

  if (shouldNotifyLeaderOfConversations(leaderConnection)) {
    notifyLeaderOfConversations(leaderConnection, conversations, createUpdateMessage);
    log('[Discovery] Notified leader of conversation update:', conversations);
    result.notifiedLeader = true;
  }

  return result;
}
