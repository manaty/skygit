export function getConversationCallPeerId(peer) {
  return typeof peer === 'string' ? peer : peer?.session_id;
}

export function createConversationCallSignal(subtype, conversationId) {
  return {
    type: 'signal',
    subtype,
    conversationId
  };
}

export function stopConversationLocalStream(stream) {
  if (!stream) {
    return false;
  }

  stream.getTracks().forEach(track => track.stop());
  return true;
}

export function startConversationCallSession({
  peer,
  conversationId,
  sendMessageToPeer
}) {
  const peerId = getConversationCallPeerId(peer);
  if (!peerId || !conversationId) {
    return { status: 'skipped' };
  }

  sendMessageToPeer(peerId, createConversationCallSignal('call-offer', conversationId));

  return {
    status: 'started',
    callActive: true,
    currentCallPeer: peerId
  };
}

export function endConversationCallSession({
  currentCallPeer,
  conversationId,
  localStream,
  sendMessageToPeer,
  stopLocalStream = stopConversationLocalStream
}) {
  const stoppedLocalStream = stopLocalStream(localStream);
  const shouldNotifyPeer = !!currentCallPeer && !!conversationId;

  if (shouldNotifyPeer) {
    sendMessageToPeer(currentCallPeer, createConversationCallSignal('call-end', conversationId));
  }

  return {
    status: 'ended',
    callActive: false,
    currentCallPeer: null,
    localStream: null,
    remoteStream: null,
    notifiedPeer: shouldNotifyPeer,
    stoppedLocalStream
  };
}
