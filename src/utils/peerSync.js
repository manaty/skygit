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
