import { stopStreamTracks } from './peerCallMedia.js';

export function createDisplayMediaOptions(withAudio = true, type = 'screen') {
  const surfaces = {
    tab: 'browser',
    window: 'window',
    screen: 'monitor'
  };

  return {
    video: {
      displaySurface: surfaces[type] || surfaces.screen,
      cursor: 'always'
    },
    audio: withAudio
  };
}

export function getCurrentCallPeer(connections, currentCallPeer) {
  return connections?.[currentCallPeer]?.conn || null;
}

export function replacePeerVideoTrack(peer, stream) {
  const videoTrack = stream?.getVideoTracks?.()[0];
  if (peer?.replaceVideoTrack && videoTrack) {
    peer.replaceVideoTrack(videoTrack);
    return videoTrack;
  }

  return null;
}

export function sendScreenShareSignal(peer, active, meta) {
  if (peer?.sendScreenShareSignal) {
    peer.sendScreenShareSignal(active, meta);
    return true;
  }

  return false;
}

export async function startConversationScreenShare({
  mediaDevices,
  withAudio = true,
  type = 'screen',
  updatePeerConnections,
  currentCallPeer,
  onEnded
}) {
  const stream = await mediaDevices.getDisplayMedia(createDisplayMediaOptions(withAudio, type));
  const videoTrack = stream.getVideoTracks()[0];

  if (videoTrack) {
    videoTrack.onended = onEnded;
  }

  updatePeerConnections(connections => {
    const peer = getCurrentCallPeer(connections, currentCallPeer);
    replacePeerVideoTrack(peer, stream);
    sendScreenShareSignal(peer, true, { audio: withAudio });
    return connections;
  });

  return stream;
}

export function stopConversationScreenShare({
  screenShareStream,
  localCameraStream,
  updatePeerConnections,
  currentCallPeer
}) {
  stopStreamTracks(screenShareStream);

  updatePeerConnections(connections => {
    const peer = getCurrentCallPeer(connections, currentCallPeer);
    replacePeerVideoTrack(peer, localCameraStream);
    sendScreenShareSignal(peer, false);
    return connections;
  });

  return localCameraStream;
}

export async function changeConversationScreenSource({
  mediaDevices,
  updatePeerConnections,
  currentCallPeer,
  previousStream,
  onEnded
}) {
  const stream = await mediaDevices.getDisplayMedia(createDisplayMediaOptions(true, 'screen'));
  const videoTrack = stream.getVideoTracks()[0];

  if (videoTrack) {
    videoTrack.onended = onEnded;
  }

  updatePeerConnections(connections => {
    replacePeerVideoTrack(getCurrentCallPeer(connections, currentCallPeer), stream);
    return connections;
  });

  stopStreamTracks(previousStream);
  return stream;
}
