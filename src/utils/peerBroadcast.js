export function buildOnlinePeerRows(connections, now = Date.now()) {
  return Object.entries(connections).map(([peerId, { username }]) => ({
    session_id: peerId,
    username,
    last_seen: now
  }));
}

export function canSendToConnection(peerConnection) {
  return Boolean(
    peerConnection?.conn &&
    peerConnection.status === 'connected' &&
    peerConnection.conn.open
  );
}

export function isConversationParticipant(peerId, username, participants) {
  return participants.some(participant => (
    participant.peerId === peerId || participant.username === username
  ));
}

export function getConversationBroadcastTargets(connections, participants) {
  return Object.entries(connections)
    .filter(([peerId, { username }]) => isConversationParticipant(peerId, username, participants))
    .map(([peerId, peerConnection]) => ({
      peerId,
      ...peerConnection
    }));
}

export function getAllBroadcastTargets(connections) {
  return Object.entries(connections).map(([peerId, peerConnection]) => ({
    peerId,
    ...peerConnection
  }));
}
