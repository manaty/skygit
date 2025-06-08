// Migration utilities for adding hashes to existing messages
import { computeMessageHash } from './messageHash.js';

/**
 * Adds missing hashes to messages in a conversation
 * @param {Object} conversation - Conversation object with messages
 * @returns {Promise<Object>} Updated conversation with hashes
 */
export async function addHashesToConversation(conversation) {
  if (!conversation || !conversation.messages || conversation.messages.length === 0) {
    return conversation;
  }
  
  // Check if migration is needed
  const needsMigration = conversation.messages.some(msg => !msg.hash);
  if (!needsMigration) {
    return conversation;
  }
  
  console.log('[Migration] Adding hashes to conversation:', conversation.id);
  
  // Create a copy to avoid mutating the original
  const updatedConversation = {
    ...conversation,
    messages: [...conversation.messages]
  };
  
  let previousHash = null;
  
  // Process messages in chronological order
  for (let i = 0; i < updatedConversation.messages.length; i++) {
    const message = updatedConversation.messages[i];
    
    if (!message.hash) {
      // Compute hash for this message
      const hash = await computeMessageHash(
        previousHash,
        message.sender,
        message.content
      );
      
      // Update the message with the computed hash
      updatedConversation.messages[i] = {
        ...message,
        hash: hash
      };
      
      previousHash = hash;
    } else {
      // Use existing hash as previous for next message
      previousHash = message.hash;
    }
  }
  
  console.log('[Migration] Completed adding hashes to conversation:', conversation.id);
  return updatedConversation;
}

/**
 * Checks if a conversation needs hash migration
 * @param {Object} conversation - Conversation object
 * @returns {boolean} True if migration is needed
 */
export function needsHashMigration(conversation) {
  if (!conversation || !conversation.messages) {
    return false;
  }
  
  return conversation.messages.some(msg => !msg.hash);
}