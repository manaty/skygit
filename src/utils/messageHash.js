// Utility functions for message hash computation
// Uses Web Crypto API for SHA-256 hashing

/**
 * Computes a hash for a message using previous hash, author, and content
 * @param {string|null} previousHash - Hash of the previous message (null for first message)
 * @param {string} author - GitHub username of the message author
 * @param {string} content - Message content
 * @returns {Promise<string>} Hex string hash
 */
export async function computeMessageHash(previousHash, author, content) {
  // Concatenate the inputs
  const input = `${previousHash || 'genesis'}|${author}|${content}`;
  
  // Convert string to Uint8Array
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  
  // Generate SHA-256 hash
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  
  // Convert to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  // Return first 16 chars for brevity (still 64 bits of entropy)
  return hashHex.substring(0, 16);
}

/**
 * Finds the previous message hash in a conversation
 * @param {Array} messages - Array of messages in the conversation
 * @returns {string|null} Hash of the last message or null if empty
 */
export function getPreviousMessageHash(messages) {
  if (!messages || messages.length === 0) {
    return null;
  }
  
  const lastMessage = messages[messages.length - 1];
  return lastMessage.hash || null;
}

/**
 * Validates a message hash chain
 * @param {Array} messages - Array of messages with hashes
 * @returns {Promise<boolean>} True if chain is valid
 */
export async function validateHashChain(messages) {
  if (!messages || messages.length === 0) return true;
  
  let previousHash = null;
  
  for (const message of messages) {
    if (!message.hash) return false;
    
    const expectedHash = await computeMessageHash(
      previousHash,
      message.sender,
      message.content
    );
    
    if (message.hash !== expectedHash) {
      console.error('Hash mismatch for message:', message.id, 'expected:', expectedHash, 'got:', message.hash);
      return false;
    }
    
    previousHash = message.hash;
  }
  
  return true;
}

/**
 * Finds common ancestor between two hash chains
 * @param {Array<string>} localHashes - Local chain of hashes (newest first)
 * @param {Array<string>} remoteHashes - Remote chain of hashes (newest first)
 * @returns {string|null} Common ancestor hash or null
 */
export function findCommonAncestor(localHashes, remoteHashes) {
  const remoteSet = new Set(remoteHashes);
  
  for (const hash of localHashes) {
    if (remoteSet.has(hash)) {
      return hash;
    }
  }
  
  return null;
}

/**
 * Gets the last N message hashes from a conversation
 * @param {Array} messages - Array of messages
 * @param {number} count - Number of hashes to return (default 100)
 * @returns {Array<string>} Array of hashes, newest first
 */
export function getRecentHashes(messages, count = 100) {
  if (!messages || messages.length === 0) return [];
  
  return messages
    .slice(-count)
    .reverse()
    .map(m => m.hash)
    .filter(h => h);
}