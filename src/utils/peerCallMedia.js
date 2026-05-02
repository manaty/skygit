export function createCallMediaConstraints(video = true) {
  return {
    video,
    audio: true
  };
}

export function createCameraVideoConstraints() {
  return {
    video: true,
    audio: false
  };
}

export function createScreenShareConstraints() {
  return {
    video: true,
    audio: false
  };
}

export function stopStreamTracks(stream) {
  if (!stream) return;

  stream.getTracks().forEach(track => {
    track.stop();
    track.enabled = false;
  });
}

export function replaceStreamVideoTrack(stream, newVideoTrack) {
  const oldVideoTrack = stream?.getVideoTracks?.()[0];
  if (oldVideoTrack) {
    oldVideoTrack.stop();
    stream.removeTrack(oldVideoTrack);
  }

  stream.addTrack(newVideoTrack);
}

export async function replaceCallVideoSender(call, newVideoTrack) {
  const senders = call?.peerConnection?.getSenders?.() || [];
  const videoSender = senders.find(sender => sender.track?.kind === 'video');

  if (videoSender) {
    await videoSender.replaceTrack(newVideoTrack);
    return true;
  }

  return false;
}
