export function getConversationPeer(connections, currentCallPeer) {
  return connections?.[currentCallPeer]?.conn || null;
}

export function sendPeerPayload({
  updatePeerConnections,
  currentCallPeer,
  message
}) {
  let sent = false;

  updatePeerConnections(connections => {
    const peer = getConversationPeer(connections, currentCallPeer);
    if (peer?.send) {
      peer.send(message);
      sent = true;
    }

    return connections;
  });

  return sent;
}

export function sendConversationMediaStatus({
  updatePeerConnections,
  currentCallPeer,
  micOn,
  cameraOn
}) {
  return sendPeerPayload({
    updatePeerConnections,
    currentCallPeer,
    message: { type: 'media-status', micOn, cameraOn }
  });
}

export function sendConversationRecordingStatus({
  updatePeerConnections,
  currentCallPeer,
  recording
}) {
  return sendPeerPayload({
    updatePeerConnections,
    currentCallPeer,
    message: { type: 'recording-status', recording }
  });
}

export function sendConversationFile({
  updatePeerConnections,
  currentCallPeer,
  file
}) {
  let sent = false;

  updatePeerConnections(connections => {
    const peer = getConversationPeer(connections, currentCallPeer);
    if (peer?.sendFile) {
      peer.sendFile(file);
      sent = true;
    }

    return connections;
  });

  return sent;
}
