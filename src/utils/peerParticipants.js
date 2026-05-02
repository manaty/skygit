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
