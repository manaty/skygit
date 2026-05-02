export function isSameOpenPeerSession(peer, currentRepo, currentSessionId, nextRepo, nextSessionId) {
  return Boolean(peer?.open && currentRepo === nextRepo && currentSessionId === nextSessionId);
}

export function normalizePeerUsername(username) {
  return String(username || '').toLowerCase();
}

export function createPeerJsOptions() {
  return {
    debug: 2,
    config: {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }
      ]
    }
  };
}

export function clearTimer(timer, clearIntervalFn = clearInterval) {
  if (timer) {
    clearIntervalFn(timer);
  }

  return null;
}

export function closeOpenConnections(connections, onClosing = () => {}) {
  Object.entries(connections || {}).forEach(([peerId, entry]) => {
    const conn = entry?.conn;
    onClosing(peerId, conn);

    if (conn?.open) {
      conn.close();
    }
  });
}

export function closeConnection(connection) {
  if (connection) {
    connection.close();
  }

  return null;
}

export function destroyPeer(peer) {
  if (peer) {
    peer.destroy();
  }

  return null;
}

export function resetPeerStores({ peerConnections, onlinePeers, typingUsers }) {
  peerConnections.set({});
  onlinePeers.set([]);
  typingUsers.set({});
}
