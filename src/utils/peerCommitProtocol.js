export function createUpdateConversationsMessage(conversations) {
  return {
    type: 'update_conversations',
    conversations
  };
}

export function createCommittedMessagesMessage(event, timestamp = Date.now()) {
  return {
    type: 'messages_committed',
    repoName: event.repoName,
    conversationId: event.convoId,
    messageIds: event.messageIds,
    timestamp
  };
}

export function isValidCommittedMessagesMessage(message) {
  return Boolean(message?.repoName && message.conversationId && message.messageIds);
}

export function shouldBroadcastCommittedEvent(event) {
  return Boolean(event);
}

export function broadcastCommittedEvent(event, broadcastMessage, createMessage = createCommittedMessagesMessage) {
  broadcastMessage(createMessage(event));
}

export function applyCommittedMessagesNotification(message, markCommitted) {
  if (!isValidCommittedMessagesMessage(message)) return false;

  markCommitted(message.conversationId, message.repoName, message.messageIds);
  return true;
}

export function subscribeCommittedMessageBroadcasts({
  committedEvents,
  broadcastToAllPeers,
  log = () => {}
}) {
  return committedEvents.subscribe(event => {
    if (!shouldBroadcastCommittedEvent(event)) return false;

    log('[PeerJS] Broadcasting committed messages:', event);
    broadcastCommittedEvent(event, broadcastToAllPeers, createCommittedMessagesMessage);
    return true;
  });
}

export function processCommittedMessagesMessage({
  message,
  fromPeerId,
  markMessagesCommitted,
  log = () => {}
}) {
  log('[PeerJS] Received committed messages notification from:', fromPeerId, message);

  return applyCommittedMessagesNotification(message, markMessagesCommitted);
}
