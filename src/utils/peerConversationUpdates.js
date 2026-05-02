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
