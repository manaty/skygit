export function shouldRejectIncomingCall(callStatus) {
  return callStatus !== 'idle';
}

export function isAnswerAlreadyInProgress(callStatus) {
  return callStatus === 'connected' || callStatus === 'connecting';
}

export function createCallMetadata(username) {
  return {
    metadata: {
      username,
      type: 'call'
    }
  };
}

export function applyIncomingCallState({ callStatus, remotePeerId }, call) {
  callStatus.set('incoming');
  remotePeerId.set(call.peer);
}

export function applyOutgoingCallState({ localStream, callStatus, remotePeerId, isVideoEnabled }, stream, peerId, video) {
  localStream.set(stream);
  callStatus.set('calling');
  remotePeerId.set(peerId);
  isVideoEnabled.set(video);
}

export function applyAnsweredCallState({ localStream }, stream, call) {
  localStream.set(stream);
  call.answer(stream);
}

export function applyRemoteStreamState({ remoteStream, callStatus, callStartTime }, stream, now = Date.now()) {
  remoteStream.set(stream);
  callStatus.set('connected');
  callStartTime.set(now);
}

export function closeCallQuietly(call, onError = () => {}) {
  if (!call) return;

  try {
    call.close();
  } catch (error) {
    onError(error);
  }
}

export function closeCurrentCall(call) {
  if (!call) return null;

  call.off('close');
  call.off('error');
  call.close();

  return null;
}

export function toggleFirstAudioTrack(stream) {
  const audioTrack = stream?.getAudioTracks?.()[0];
  if (!audioTrack) return null;

  audioTrack.enabled = !audioTrack.enabled;
  return audioTrack.enabled;
}

export function toggleFirstVideoTrack(stream) {
  const videoTrack = stream?.getVideoTracks?.()[0];
  if (!videoTrack) return null;

  videoTrack.enabled = !videoTrack.enabled;
  return videoTrack.enabled;
}

export function createScreenShareEndedHandler(toggleScreenShare) {
  return () => {
    toggleScreenShare();
  };
}
