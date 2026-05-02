export function createPeerConnectionMetadata(username, repoFullName, sessionId) {
  return {
    username,
    repo: repoFullName,
    sessionId
  };
}

export function getConnectionUsername(connection, fallbackUsername = null) {
  return fallbackUsername || connection.metadata?.username || 'Unknown';
}

export function createPeerConnectionEntry(connection, username) {
  return {
    conn: connection,
    status: 'connected',
    username
  };
}

export function createOnlineContactUpdate(peerId, now = Date.now()) {
  return {
    online: true,
    lastSeen: now,
    peerId
  };
}

export function createOfflineContactUpdate(now = Date.now()) {
  return {
    online: false,
    lastSeen: now
  };
}
