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

export function handleLeaderDiscoveryResponse(data, handlers = {}) {
  const log = handlers.log || (() => {});

  return dispatchDiscoveryMessage(data, {
    peer_registry: (message) => {
      log('[Discovery] Received peer registry:', message.peers, 'for org:', message.orgId);
      handlers.updateKnownPeers?.(message.peers);
      handlers.storePeerRegistry?.(message.peers, message.orgId);
      handlers.connectToOrgPeers?.(message.peers);
    },
    peer_list: (message) => {
      log('[Discovery] Received peer list:', message.peers);
      handlers.updateKnownPeers?.(message.peers);
    },
    leadership_change: () => {
      log('[Discovery] Leadership change detected, reconnecting');
      handlers.onLeadershipChange?.();
    }
  }, (messageType) => {
    log('[Discovery] Unknown leader response type:', messageType);
  });
}
