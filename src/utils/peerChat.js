export function isValidChatMessage(message) {
  return Boolean(message?.conversationId && message.content);
}

export function shouldIgnoreChatMessage(fromPeerId, localPeerId) {
  return fromPeerId === localPeerId;
}

export function createIncomingChatMessage(message, fromUsername, createId = () => crypto.randomUUID(), now = () => Date.now()) {
  return {
    id: message.id || createId(),
    sender: fromUsername,
    content: message.content,
    timestamp: message.timestamp || now(),
    hash: message.hash || null,
    in_response_to: message.in_response_to || null
  };
}

export function processIncomingPeerChatMessage({
  message,
  fromUsername,
  fromPeerId,
  localPeerId,
  repoFullName,
  appendMessage,
  setLastMessage,
  updateContact,
  isLeader,
  getCurrentLeader,
  queueConversationForCommit,
  now = () => Date.now(),
  log = () => {},
  warn = () => {}
}) {
  if (!isValidChatMessage(message)) {
    warn('[PeerJS] Invalid chat message format:', message);
    return 'invalid';
  }

  if (shouldIgnoreChatMessage(fromPeerId, localPeerId)) {
    log('[PeerJS] Ignoring message from same session');
    return 'ignored';
  }

  const messageData = createIncomingChatMessage(message, fromUsername, undefined, now);

  appendMessage(message.conversationId, repoFullName, messageData);
  setLastMessage(fromUsername, messageData);
  updateContact(fromUsername, {
    online: true,
    lastSeen: now()
  });

  if (isLeader()) {
    log('[PeerJS] Queueing message for commit (I am leader)');
    queueConversationForCommit(repoFullName, message.conversationId);
    return 'queued';
  }

  log('[PeerJS] Skipping commit queue (not leader), current leader:', getCurrentLeader());
  return 'not_leader';
}
