import {
  registerPeerInRegistry,
  touchPeerRegistryHeartbeat,
  updatePeerRegistryConversations
} from './peerDiscovery.js';

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

export function processLeaderPeerMessage({
  data,
  connection,
  peerRegistry,
  sendPeerRegistry,
  broadcastPeerListUpdate,
  log = () => {}
}) {
  return dispatchDiscoveryMessage(data, {
    register: (message) => {
      log('[Discovery] Registering peer:', connection.peer, 'username:', message.username);
      registerPeerInRegistry(peerRegistry, connection.peer, message, connection);
      sendPeerRegistry(connection);
      broadcastPeerListUpdate();
    },
    request_peers: () => {
      sendPeerRegistry(connection);
    },
    update_conversations: (message) => {
      updatePeerRegistryConversations(peerRegistry, connection.peer, message.conversations);
    },
    heartbeat: () => {
      touchPeerRegistryHeartbeat(peerRegistry, connection.peer);
    }
  }, (messageType) => {
    log('[Discovery] Unknown leader message type:', messageType);
  });
}
