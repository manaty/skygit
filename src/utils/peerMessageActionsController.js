import {
  broadcastPeerMessage,
  broadcastPeerMessageToAll,
  broadcastPeerTypingStatus,
  requestPeerMessageSync,
  requestPeerSyncWithHashChain,
  sendPeerMessage
} from './peerMessageActions.js';
import { resolveConversationParticipants } from './peerParticipants.js';

export function createPeerMessageActionsController({
  getConnections,
  getConversations,
  getRepoFullName,
  getStorage,
  getOrgId,
  sendMessage = sendPeerMessage,
  broadcastMessageToParticipants = broadcastPeerMessage,
  broadcastMessageToAll = broadcastPeerMessageToAll,
  requestMessageSyncAction = requestPeerMessageSync,
  requestSyncWithHashChainAction = requestPeerSyncWithHashChain,
  broadcastTypingAction = broadcastPeerTypingStatus,
  resolveParticipants = resolveConversationParticipants,
  log = () => {},
  warn = () => {},
  error = () => {}
}) {
  const getConversationParticipants = conversationId => resolveParticipants({
    conversationId,
    connections: getConnections(),
    conversationsMap: getConversations(),
    repoFullName: getRepoFullName(),
    storage: getStorage(),
    getOrgId,
    log,
    warn,
    error
  });

  const sendMessageToPeer = (peerId, message) => sendMessage({
    peerId,
    message,
    connections: getConnections(),
    log,
    warn
  });

  const broadcastMessage = (message, conversationId = null) => broadcastMessageToParticipants({
    connections: getConnections(),
    participants: getConversationParticipants(conversationId),
    message,
    conversationId,
    log,
    warn,
    error
  });

  const broadcastToAllPeers = message => broadcastMessageToAll({
    connections: getConnections(),
    message,
    log,
    warn,
    error
  });

  const requestMessageSync = (peerId, conversationId, lastHash) => requestMessageSyncAction({
    peerId,
    conversationId,
    lastHash,
    sendMessageToPeer,
    log
  });

  const requestSyncWithHashChain = (peerId, conversationId, hashChain) => requestSyncWithHashChainAction({
    peerId,
    conversationId,
    hashChain,
    sendMessageToPeer,
    log
  });

  const broadcastTypingStatus = isTyping => broadcastTypingAction(isTyping, broadcastToAllPeers);

  return {
    getConversationParticipants,
    sendMessageToPeer,
    broadcastMessage,
    broadcastToAllPeers,
    requestMessageSync,
    requestSyncWithHashChain,
    broadcastTypingStatus
  };
}
