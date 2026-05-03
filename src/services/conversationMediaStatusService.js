export function setStreamTracksEnabled(stream, kind, enabled) {
  const getTracks = kind === 'audio' ? stream?.getAudioTracks : stream?.getVideoTracks;
  if (!getTracks) {
    return 0;
  }

  const tracks = getTracks.call(stream);
  tracks.forEach(track => {
    track.enabled = enabled;
  });
  return tracks.length;
}

export function toggleConversationMicState({
  micOn,
  cameraOn,
  localStream,
  sendStatus
}) {
  const nextMicOn = !micOn;
  const updatedTracks = setStreamTracksEnabled(localStream, 'audio', nextMicOn);
  sendStatus({ micOn: nextMicOn, cameraOn });

  return {
    micOn: nextMicOn,
    cameraOn,
    updatedTracks
  };
}

export function toggleConversationCameraState({
  micOn,
  cameraOn,
  localStream,
  sendStatus
}) {
  const nextCameraOn = !cameraOn;
  const updatedTracks = setStreamTracksEnabled(localStream, 'video', nextCameraOn);
  sendStatus({ micOn, cameraOn: nextCameraOn });

  return {
    micOn,
    cameraOn: nextCameraOn,
    updatedTracks
  };
}
