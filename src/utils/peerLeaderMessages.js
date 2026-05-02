export function getDiscoveryMessageType(message) {
  if (!message || typeof message !== 'object') {
    return null;
  }

  return message.type || null;
}

export function dispatchDiscoveryMessage(message, handlers, onUnknown = () => {}) {
  const messageType = getDiscoveryMessageType(message);

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
