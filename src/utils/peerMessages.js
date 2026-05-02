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
