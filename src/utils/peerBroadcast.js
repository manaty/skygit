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

export function sendToPeerConnection(connections, peerId, message) {
  const peerConnection = connections?.[peerId];
  if (!peerConnection?.conn) return false;

  peerConnection.conn.send(message);
  return true;
}

export function getNonParticipantPeers(connections, participants) {
  return Object.entries(connections)
    .filter(([peerId, { username }]) => !isConversationParticipant(peerId, username, participants))
    .map(([peerId, { username }]) => ({ peerId, username }));
}

export function sendToBroadcastTargets(targets, message, onError = () => {}) {
  let sentCount = 0;

  targets.forEach(({ peerId, conn, status }) => {
    if (!canSendToConnection({ conn, status })) return;

    try {
      conn.send(message);
      sentCount += 1;
    } catch (error) {
      onError(error, peerId);
    }
  });

  return sentCount;
}
