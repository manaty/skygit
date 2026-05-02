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

export function broadcastToConversationParticipants({
  connections,
  participants,
  message,
  conversationId,
  log = () => {},
  warn = () => {},
  error = () => {}
}) {
  log('[PeerJS] Conversation participants:', participants);
  log('[PeerJS] Available connections:', Object.keys(connections));

  if (participants.length === 0) {
    warn('[PeerJS] No participants found for conversation:', conversationId);
    return 0;
  }

  const participantTargets = getConversationBroadcastTargets(connections, participants);

  getNonParticipantPeers(connections, participants).forEach(({ peerId, username }) => {
    log('[PeerJS] Skipping non-participant:', peerId, username);
  });

  participantTargets.forEach(({ peerId, conn, status }) => {
    log('[PeerJS] Attempting to send to participant:', peerId, 'status:', status, 'connection open:', conn?.open);
    if (!canSendToConnection({ conn, status })) {
      warn('[PeerJS] ⚠️ Skipping participant (not connected):', peerId, 'status:', status);
    }
  });

  const sentCount = sendToBroadcastTargets(participantTargets, message, (sendError, peerId) => {
    error('[PeerJS] ❌ Failed to send message to:', peerId, sendError);
  });

  log('[PeerJS] Message broadcast completed. Sent to', sentCount, 'participants');
  return sentCount;
}

export function broadcastToAllConnections({
  connections,
  message,
  log = () => {},
  warn = () => {},
  error = () => {}
}) {
  const peerCount = Object.keys(connections).length;

  if (peerCount === 0) {
    warn('[PeerJS] No peer connections available for broadcasting!');
    return 0;
  }

  const sentCount = sendToBroadcastTargets(getAllBroadcastTargets(connections), message, (sendError, peerId) => {
    error('[PeerJS] ❌ Failed to send message to:', peerId, sendError);
  });

  log('[PeerJS] Broadcast completed. Sent to', sentCount, 'peers');
  return sentCount;
}
