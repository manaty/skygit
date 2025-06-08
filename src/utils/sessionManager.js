// Session management utilities for SkyGit
// Manages persistent session IDs per repository

/**
 * Get or create a session ID for a specific repository
 * Session IDs are persisted in sessionStorage and survive page reloads
 * but are cleared when the browser tab is closed
 * 
 * @param {string} repoFullName - Full repository name (e.g., "owner/repo")
 * @returns {string} Session ID for the repository
 */
export function getOrCreateSessionId(repoFullName) {
  const storageKey = `skygit_session_${repoFullName}`;
  
  // Try to get existing session ID
  let sessionId = sessionStorage.getItem(storageKey);
  
  if (!sessionId) {
    // Generate new session ID
    sessionId = crypto.randomUUID();
    sessionStorage.setItem(storageKey, sessionId);
    console.log('[SessionManager] Created new session ID for repo:', repoFullName, 'ID:', sessionId);
  } else {
    console.log('[SessionManager] Using existing session ID for repo:', repoFullName, 'ID:', sessionId);
  }
  
  return sessionId;
}

/**
 * Clear session ID for a specific repository
 * Used when explicitly disconnecting from a repository
 * 
 * @param {string} repoFullName - Full repository name
 */
export function clearSessionId(repoFullName) {
  const storageKey = `skygit_session_${repoFullName}`;
  sessionStorage.removeItem(storageKey);
  console.log('[SessionManager] Cleared session ID for repo:', repoFullName);
}

/**
 * Clear all session IDs
 * Used when logging out or resetting the application
 */
export function clearAllSessionIds() {
  const keys = Object.keys(sessionStorage);
  keys.forEach(key => {
    if (key.startsWith('skygit_session_')) {
      sessionStorage.removeItem(key);
    }
  });
  console.log('[SessionManager] Cleared all session IDs');
}

/**
 * Get session metadata
 * Returns information about all active sessions
 * 
 * @returns {Array} Array of session info objects
 */
export function getSessionMetadata() {
  const sessions = [];
  const keys = Object.keys(sessionStorage);
  
  keys.forEach(key => {
    if (key.startsWith('skygit_session_')) {
      const repoFullName = key.replace('skygit_session_', '');
      const sessionId = sessionStorage.getItem(key);
      sessions.push({
        repository: repoFullName,
        sessionId: sessionId
      });
    }
  });
  
  return sessions;
}