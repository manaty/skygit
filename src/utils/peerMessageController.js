import { processIncomingPeerChatMessage } from './peerChat.js';
import { processCommittedMessagesMessage } from './peerCommitProtocol.js';
import { processPeerDataMessage } from './peerMessages.js';
import {
  processSyncChainRequestMessage,
  processSyncNeedsChainMessage,
  processSyncRequestMessage,
  processSyncResponseMessage
} from './peerSync.js';
import { processIncomingTypingMessage } from './peerTyping.js';

export function createPeerMessageController({
  getConnections,
  getConversations,
  getLocalPeerId,
  getRepoFullName,
  appendMessage,
  appendMessages,
  setLastMessage,
  updateContact,
  updateTypingUsers,
  isLeader,
  getCurrentLeader,
  queueConversationForCommit,
  sendMessageToPeer,
  markMessagesCommitted,
  processDataMessage = processPeerDataMessage,
  processChatMessage = processIncomingPeerChatMessage,
  processTypingMessage = processIncomingTypingMessage,
  processSyncNeedsChain = processSyncNeedsChainMessage,
  processSyncRequest = processSyncRequestMessage,
  processSyncChainRequest = processSyncChainRequestMessage,
  processSyncResponse = processSyncResponseMessage,
  processCommittedMessages = processCommittedMessagesMessage,
  log = () => {},
  warn = () => {}
}) {
  const handleSyncNeedsChain = (message, fromPeerId) => processSyncNeedsChain({
    message,
    fromPeerId,
    conversationsMap: getConversations(),
    repoFullName: getRepoFullName(),
    sendMessageToPeer
  });

  const handleChatMessage = (message, fromUsername, fromPeerId) => {
    log('[PeerJS] Received chat message from', fromUsername, '(', fromPeerId, '):', message);

    return processChatMessage({
      message,
      fromUsername,
      fromPeerId,
      localPeerId: getLocalPeerId(),
      repoFullName: getRepoFullName(),
      appendMessage,
      setLastMessage,
      updateContact,
      isLeader,
      getCurrentLeader,
      queueConversationForCommit,
      log,
      warn
    });
  };

  const handlePresenceMessage = (message, fromUsername) => {
    log('[PeerJS] Received presence message from', fromUsername, ':', message);
  };

  const handleTypingMessage = (message, fromUsername, fromPeerId) => {
    log('[PeerJS] Received typing message from', fromUsername, '(', fromPeerId, '):', message);

    return processTypingMessage({
      message,
      fromUsername,
      fromPeerId,
      updateTypingUsers,
      log,
      warn
    });
  };

  const handleSyncRequest = (message, fromPeerId) => processSyncRequest({
    message,
    fromPeerId,
    conversationsMap: getConversations(),
    repoFullName: getRepoFullName(),
    sendMessageToPeer,
    log,
    warn
  });

  const handleSyncRequestWithChain = (message, fromPeerId) => processSyncChainRequest({
    message,
    fromPeerId,
    conversationsMap: getConversations(),
    repoFullName: getRepoFullName(),
    sendMessageToPeer,
    log,
    warn
  });

  const handleSyncResponse = (message, fromPeerId) => {
    log('[PeerJS] Received sync response from', fromPeerId, 'with', message.messages?.length || 0, 'messages');

    return processSyncResponse({
      message,
      repoFullName: getRepoFullName(),
      appendMessages,
      isLeader,
      queueConversationForCommit,
      log,
      warn
    });
  };

  const handleCommittedMessages = (message, fromPeerId) => processCommittedMessages({
    message,
    fromPeerId,
    markMessagesCommitted,
    log
  });

  const handlePeerMessage = (data, fromPeerId, fromUsername = null) => processDataMessage({
    data,
    fromPeerId,
    fromUsername,
    connections: getConnections(),
    handlers: {
      chat: handleChatMessage,
      presence: handlePresenceMessage,
      typing: handleTypingMessage,
      syncRequest: handleSyncRequest,
      syncRequestChain: handleSyncRequestWithChain,
      syncResponse: handleSyncResponse,
      syncNeedsChain: handleSyncNeedsChain,
      messagesCommitted: handleCommittedMessages
    },
    log,
    warn
  });

  return {
    handlePeerMessage,
    handleChatMessage,
    handlePresenceMessage,
    handleTypingMessage,
    handleSyncNeedsChain,
    handleSyncRequest,
    handleSyncRequestWithChain,
    handleSyncResponse,
    handleCommittedMessages
  };
}
