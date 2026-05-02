import {
  createOnlineContactUpdate,
  createPeerConnectionEntry,
  getConnectionUsername
} from './peerConnectionState.js';

export const OUTGOING_CONNECTION_RETRY_DELAY_MS = 60_000;
export const REMOVED_CONNECTION_RETRY_DELAY_MS = 5_000;

export function getLocalPeerConnectionReadiness(localPeer) {
  if (!localPeer) return 'missing';
  if (!localPeer.open) return 'closed';

  return 'ready';
}

export function hasPeerConnection(connections, peerId) {
  return Boolean(connections?.[peerId]);
}

export function addPeerConnectionToState(connections, peerId, entry) {
  connections[peerId] = entry;
  return connections;
}

export function getPeerConnectionUsername(connections, peerId) {
  return connections?.[peerId]?.username || null;
}

export function removePeerConnectionFromState(connections, peerId) {
  delete connections[peerId];
  return connections;
}

export function removePeerTypingUser(typingUsers, peerId) {
  delete typingUsers[peerId];
  return typingUsers;
}

export function markPeerConnectionFailed(
  failedConnections,
  peerId,
  delayMs,
  setTimeoutFn = setTimeout
) {
  failedConnections.add(peerId);
  return setTimeoutFn(() => {
    failedConnections.delete(peerId);
  }, delayMs);
}

export function processOpenedPeerConnection({
  connection,
  username = null,
  updatePeerConnections,
  updateContact,
  updateOnlinePeers,
  syncConversationsWithPeer,
  log = () => {}
}) {
  const peerId = connection.peer;
  const extractedUsername = getConnectionUsername(connection, username);

  log('[PeerJS] Adding peer connection:', peerId, 'username:', extractedUsername);

  updatePeerConnections(connections => (
    addPeerConnectionToState(connections, peerId, createPeerConnectionEntry(connection, extractedUsername))
  ));
  updateContact(extractedUsername, createOnlineContactUpdate(peerId));
  updateOnlinePeers();
  syncConversationsWithPeer(peerId);

  return {
    peerId,
    username: extractedUsername
  };
}

export function getConversationSyncRequests(repoConversations) {
  return (repoConversations || [])
    .filter((conversation) => conversation.messages?.length > 0)
    .map((conversation) => {
      const lastMessage = conversation.messages[conversation.messages.length - 1];
      return {
        conversationId: conversation.id,
        lastHash: lastMessage.hash
      };
    })
    .filter((request) => request.lastHash);
}

export function sendConversationSyncRequests(
  peerId,
  conversationsMap,
  repoFullName,
  requestMessageSync,
  log = () => {}
) {
  const repoConversations = conversationsMap?.[repoFullName] || [];
  const requests = getConversationSyncRequests(repoConversations);

  requests.forEach(({ conversationId, lastHash }) => {
    log('[PeerJS] Requesting sync for conversation:', conversationId, 'last hash:', lastHash);
    requestMessageSync(peerId, conversationId, lastHash);
  });

  return requests;
}
