import { findCommonAncestor, getRecentHashes } from './messageHash.js';

export const HASH_CHAIN_LIMIT = 100;

export function createSyncRequest(conversationId, lastHash, timestamp = Date.now()) {
  return {
    type: 'sync_request',
    conversationId,
    lastHash,
    timestamp
  };
}

export function createSyncRequestChain(conversationId, hashChain, timestamp = Date.now()) {
  return {
    type: 'sync_request_chain',
    conversationId,
    hashChain,
    timestamp
  };
}

export function createSyncChainRequestForNeed(message, conversationsMap, repoFullName, timestamp = Date.now()) {
  if (!message?.conversationId) return null;

  const conversation = findRepoConversation(conversationsMap, repoFullName, message.conversationId);
  if (!conversation?.messages) return null;

  return createSyncRequestChain(
    message.conversationId,
    getRecentHashes(conversation.messages, HASH_CHAIN_LIMIT),
    timestamp
  );
}

export function findRepoConversation(conversationsMap, repoFullName, conversationId) {
  const repoConversations = conversationsMap?.[repoFullName] || [];
  return repoConversations.find(conversation => conversation.id === conversationId);
}

export function isValidSyncRequestMessage(message) {
  return Boolean(message?.conversationId && message?.lastHash);
}

export function isValidSyncChainRequestMessage(message) {
  return Boolean(message?.conversationId && Array.isArray(message?.hashChain));
}

export function isValidSyncResponseMessage(message) {
  return Boolean(message?.conversationId && message?.messages);
}

export function createConversationNotFoundSyncResponse(conversationId) {
  return {
    type: 'sync_response',
    conversationId,
    messages: [],
    error: 'Conversation not found'
  };
}

export function createSyncNeedsChainResponse(conversationId) {
  return {
    type: 'sync_needs_chain',
    conversationId,
    error: 'Hash not found, please send hash chain'
  };
}

export function createSyncResponseAfterHash(conversation, conversationId, lastHash) {
  if (!conversation?.messages) {
    return createConversationNotFoundSyncResponse(conversationId);
  }

  const lastHashIndex = conversation.messages.findIndex(message => message.hash === lastHash);
  if (lastHashIndex === -1) {
    return createSyncNeedsChainResponse(conversationId);
  }

  return {
    type: 'sync_response',
    conversationId,
    messages: conversation.messages.slice(lastHashIndex + 1)
  };
}

export function createSyncResponseForRequest(message, conversation) {
  return createSyncResponseAfterHash(conversation, message.conversationId, message.lastHash);
}

export function createSyncResponseFromHashChain(conversation, conversationId, hashChain) {
  if (!conversation?.messages) {
    return createConversationNotFoundSyncResponse(conversationId);
  }

  const ourHashes = getRecentHashes(conversation.messages, HASH_CHAIN_LIMIT);
  const commonHash = findCommonAncestor(hashChain, ourHashes);

  if (!commonHash) {
    return {
      type: 'sync_response',
      conversationId,
      messages: conversation.messages,
      fullSync: true
    };
  }

  const commonIndex = conversation.messages.findIndex(message => message.hash === commonHash);

  return {
    type: 'sync_response',
    conversationId,
    messages: conversation.messages.slice(commonIndex + 1),
    commonAncestor: commonHash
  };
}

export function createSyncResponseForChainRequest(message, conversation) {
  return createSyncResponseFromHashChain(conversation, message.conversationId, message.hashChain);
}

export function normalizeSyncMessages(messages, createId = () => crypto.randomUUID(), now = () => Date.now()) {
  return messages
    .filter(message => message.content && message.sender)
    .map(message => ({
      id: message.id || createId(),
      sender: message.sender,
      content: message.content,
      timestamp: message.timestamp || now(),
      hash: message.hash || null,
      in_response_to: message.in_response_to || null
    }));
}

export function getNormalizedSyncResponseMessages(message) {
  if (!isValidSyncResponseMessage(message)) return null;

  return normalizeSyncMessages(message.messages);
}

export function getSyncResponseDeliveryType(response) {
  if (response?.error === 'Conversation not found') {
    return 'conversation_not_found';
  }

  if (response?.type === 'sync_needs_chain') {
    return 'sync_needs_chain';
  }

  if (response?.fullSync) {
    return 'full_sync';
  }

  return 'messages';
}

export function deliverSyncResponse(peerId, response, sendMessageToPeer, deliveryHandlers = {}) {
  const deliveryType = getSyncResponseDeliveryType(response);
  deliveryHandlers[deliveryType]?.(response);
  sendMessageToPeer(peerId, response);
  return deliveryType;
}

export function processSyncResponseMessage({
  message,
  repoFullName,
  appendMessages,
  isLeader,
  queueConversationForCommit,
  log = () => {},
  warn = () => {}
}) {
  if (!isValidSyncResponseMessage(message)) {
    warn('[PeerJS] Invalid sync response format:', message);
    return 'invalid';
  }

  const validMessages = getNormalizedSyncResponseMessages(message);

  if (validMessages.length === 0) {
    return 'empty';
  }

  appendMessages(message.conversationId, repoFullName, validMessages);

  if (isLeader()) {
    log('[PeerJS] Queueing synced messages for commit (I am leader)');
    queueConversationForCommit(repoFullName, message.conversationId);
    return 'queued';
  }

  return 'appended';
}
