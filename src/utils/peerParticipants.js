export function getConnectedParticipants(connections) {
  return Object.entries(connections).map(([peerId, { username }]) => ({
    peerId,
    username
  }));
}

export function getConversationStoreParticipants(conversation, connections) {
  if (!conversation?.participants) {
    return null;
  }

  return conversation.participants.map(username => {
    const connEntry = Object.entries(connections).find(([, { username: connUsername }]) => (
      connUsername === username
    ));

    return {
      peerId: connEntry ? connEntry[0] : null,
      username
    };
  });
}

export function getStoredOrgParticipants(storage, orgId) {
  if (!orgId) {
    return null;
  }

  const stored = storage.getItem(`skygit_peers_${orgId}`);
  if (!stored) {
    return null;
  }

  return JSON.parse(stored).map(peer => ({
    peerId: peer.peerId,
    username: peer.username
  }));
}

export function findConversationParticipants(conversationsMap, repoFullName, conversationId, connections) {
  const repoConversations = conversationsMap?.[repoFullName] || [];
  const conversation = repoConversations.find(item => item.id === conversationId);

  if (!conversation?.participants) {
    return null;
  }

  return getConversationStoreParticipants(conversation, connections);
}

export function getParticipantFallbackOrgId(repoFullName, getOrgId) {
  return repoFullName ? getOrgId(repoFullName) : null;
}

export function resolveConversationParticipants({
  conversationId,
  connections,
  conversationsMap,
  repoFullName,
  storage,
  getOrgId,
  log = () => {},
  warn = () => {},
  error = () => {}
}) {
  if (!conversationId) {
    warn('[PeerJS] No conversation ID provided, broadcasting to all peers');
    return getConnectedParticipants(connections);
  }

  try {
    const participantRows = findConversationParticipants(conversationsMap, repoFullName, conversationId, connections);

    if (participantRows) {
      log('[PeerJS] Found conversation participants:', participantRows);
      return participantRows;
    }
  } catch (participantsError) {
    error('[PeerJS] Failed to get conversation participants from store:', participantsError);
  }

  const orgId = getParticipantFallbackOrgId(repoFullName, getOrgId);
  if (orgId) {
    try {
      const storedParticipants = getStoredOrgParticipants(storage, orgId);
      if (storedParticipants) {
        log('[PeerJS] Using all org peers as participants:', storedParticipants.length);
        return storedParticipants;
      }
    } catch (storageError) {
      error('[PeerJS] Failed to get org peers:', storageError);
    }
  }

  log('[PeerJS] Using all connected peers as participants');
  return getConnectedParticipants(connections);
}
