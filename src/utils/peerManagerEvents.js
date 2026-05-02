import { bindPeerEvents } from './peerConnectionEvents.js';

export function bindPeerManagerEvents(peer, {
  startPeerDiscovery,
  initializeCallHandling,
  handleIncomingConnection,
  log = () => {},
  reportError = () => {}
}) {
  return bindPeerEvents(peer, {
    open: (id) => {
      log('[PeerJS] Connected to PeerJS server with ID:', id);
      startPeerDiscovery();
      initializeCallHandling();
    },
    connection: (connection) => {
      log('[PeerJS] ✅ Incoming connection from:', connection.peer, 'metadata:', connection.metadata);
      handleIncomingConnection(connection);
    },
    error: (error) => {
      reportError('[PeerJS] Peer error:', error);
    },
    disconnected: () => {
      log('[PeerJS] Disconnected from PeerJS server');
    },
    close: () => {
      log('[PeerJS] Peer connection closed');
    }
  });
}
