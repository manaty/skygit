import {
  broadcastToAllConnections,
  broadcastToConversationParticipants,
  sendToPeerConnection
} from './peerBroadcast.js';
import {
  createSyncRequest,
  createSyncRequestChain
} from './peerSync.js';
import { createTypingStatusMessage } from './peerTyping.js';

export function sendPeerMessage({
  peerId,
  message,
  connections,
  log = () => {},
  warn = () => {}
}) {
  log('[PeerJS] Sending message to peer:', peerId, message);

  if (sendToPeerConnection(connections, peerId, message)) {
    log('[PeerJS] Message sent successfully');
    return true;
  }

  warn('[PeerJS] No connection found for peer:', peerId);
  return false;
}

export function broadcastPeerMessage({
  message,
  conversationId = null,
  connections,
  participants,
  log = () => {},
  warn = () => {},
  error = () => {}
}) {
  log('[PeerJS] Broadcasting message:', message, 'to conversation:', conversationId);

  return broadcastToConversationParticipants({
    connections,
    participants,
    message,
    conversationId,
    log,
    warn,
    error
  });
}

export function broadcastPeerMessageToAll({
  message,
  connections,
  log = () => {},
  warn = () => {},
  error = () => {}
}) {
  log('[PeerJS] Broadcasting to all connected peers:', message);

  return broadcastToAllConnections({
    connections,
    message,
    log,
    warn,
    error
  });
}

export function requestPeerMessageSync({
  peerId,
  conversationId,
  lastHash,
  sendMessageToPeer,
  log = () => {}
}) {
  log('[PeerJS] Requesting message sync from peer:', peerId, 'conversation:', conversationId, 'lastHash:', lastHash);

  const request = createSyncRequest(conversationId, lastHash);
  sendMessageToPeer(peerId, request);
  return request;
}

export function requestPeerSyncWithHashChain({
  peerId,
  conversationId,
  hashChain,
  sendMessageToPeer,
  log = () => {}
}) {
  log('[PeerJS] Requesting sync with hash chain from peer:', peerId, 'chain length:', hashChain.length);

  const request = createSyncRequestChain(conversationId, hashChain);
  sendMessageToPeer(peerId, request);
  return request;
}

export function broadcastPeerTypingStatus(isTyping, broadcastToAllPeers) {
  const message = createTypingStatusMessage(isTyping);
  broadcastToAllPeers(message);
  return message;
}
