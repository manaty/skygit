export function getPeerMessageType(message) {
  if (!message || typeof message !== 'object') {
    return null;
  }

  return message.type || null;
}

export function dispatchPeerMessage(message, handlers, onUnknown = () => {}) {
  const messageType = getPeerMessageType(message);

  if (!messageType) {
    return 'invalid';
  }

  const handler = handlers[messageType];
  if (!handler) {
    onUnknown(messageType);
    return 'unknown';
  }

  handler(message);
  return messageType;
}

export function getPeerMessageSenderUsername(connections, fromPeerId, fromUsername = null, fallback = 'Unknown') {
  return fromUsername || connections?.[fromPeerId]?.username || fallback;
}

export function processPeerDataMessage({
  data,
  fromPeerId,
  fromUsername = null,
  connections,
  handlers,
  log = () => {},
  warn = () => {}
}) {
  const username = getPeerMessageSenderUsername(connections, fromPeerId, fromUsername);

  log('[PeerJS] Handling message from:', username, data);

  if (!getPeerMessageType(data)) {
    warn('[PeerJS] Invalid message format:', data);
    return {
      status: 'invalid',
      username
    };
  }

  const status = dispatchPeerMessage(data, {
    chat: (message) => handlers.chat(message, username, fromPeerId),
    presence: (message) => handlers.presence(message, username, fromPeerId),
    typing: (message) => handlers.typing(message, username, fromPeerId),
    sync_request: (message) => handlers.syncRequest(message, fromPeerId),
    sync_request_chain: (message) => handlers.syncRequestChain(message, fromPeerId),
    sync_response: (message) => handlers.syncResponse(message, fromPeerId),
    sync_needs_chain: (message) => handlers.syncNeedsChain(message, fromPeerId),
    messages_committed: (message) => handlers.messagesCommitted(message, fromPeerId)
  }, (messageType) => {
    log('[PeerJS] Unknown message type:', messageType);
  });

  return {
    status,
    username
  };
}
