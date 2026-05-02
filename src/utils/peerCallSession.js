import { bindPeerEvents } from './peerConnectionEvents.js';
import {
  applyAnsweredCallState,
  applyIncomingCallState,
  applyOutgoingCallState,
  applyRemoteStreamState,
  bindCallLifecycleEvents,
  closeCallQuietly,
  closeCurrentCall,
  createCallMetadata,
  createScreenShareEndedHandler,
  isAnswerAlreadyInProgress,
  shouldRejectIncomingCall,
  toggleFirstAudioTrack,
  toggleFirstVideoTrack
} from './peerCallLifecycle.js';
import {
  createCallMediaConstraints,
  stopStreamTracks,
  switchCallToCamera,
  switchCallToScreenShare
} from './peerCallMedia.js';

export function bindIncomingCallHandling(localPeer, {
  getCallStatus,
  stores,
  getCurrentCall,
  setCurrentCall,
  endCall,
  log = () => {},
  warn = () => {},
  reportError = () => {}
}) {
  if (!localPeer) return null;

  return bindPeerEvents(localPeer, {
    call: async (call) => {
      handleIncomingPeerCall({
        call,
        callStatus: getCallStatus(),
        stores,
        currentCall: getCurrentCall(),
        setCurrentCall,
        endCall,
        log,
        warn,
        reportError
      });
    }
  });
}

export function handleIncomingPeerCall({
  call,
  callStatus,
  stores,
  currentCall,
  setCurrentCall,
  endCall,
  log = () => {},
  warn = () => {},
  reportError = () => {}
}) {
  log('[PeerJS] Incoming call from:', call.peer);

  if (shouldRejectIncomingCall(callStatus)) {
    log('[PeerJS] Already in a call, rejecting incoming call');
    call.close();
    return 'rejected';
  }

  applyIncomingCallState(stores, call);

  if (currentCall) {
    warn('[PeerJS] Closing zombie call before accepting new one');
    closeCallQuietly(currentCall, (error) => warn('Failed to close zombie call:', error));
  }

  setCurrentCall(call);
  bindActiveCallEvents(call, {
    stores,
    endCall,
    closeLog: '[PeerJS] Call closed remotely',
    log,
    reportError
  });

  return 'incoming';
}

export async function startOutgoingPeerCall({
  localPeer,
  peerId,
  video = true,
  mediaDevices,
  localUsername,
  stores,
  setCurrentCall,
  setupCallEvents,
  alertUser = () => {},
  resetCallState,
  log = () => {},
  reportError = () => {}
}) {
  log('[PeerJS] Starting call to:', peerId, 'video:', video);

  try {
    const stream = await mediaDevices.getUserMedia(createCallMediaConstraints(video));

    applyOutgoingCallState(stores, stream, peerId, video);

    const call = localPeer.call(peerId, stream, createCallMetadata(localUsername));
    setCurrentCall(call);
    setupCallEvents(call);

    return call;
  } catch (error) {
    reportError('[PeerJS] Failed to get local stream:', error);
    alertUser('Could not access camera/microphone. Please check permissions.');
    resetCallState();
    return null;
  }
}

export async function answerIncomingPeerCall({
  currentCall,
  callStatus,
  mediaDevices,
  stores,
  setupCallEvents,
  endCall,
  alertUser = () => {},
  log = () => {},
  warn = () => {},
  reportError = () => {}
}) {
  log('[PeerJS] Answering call');

  if (!currentCall) return 'missing';

  if (isAnswerAlreadyInProgress(callStatus)) {
    warn('[PeerJS] Already connected or connecting, ignoring answerCall');
    return 'already_answered';
  }

  try {
    const stream = await mediaDevices.getUserMedia(createCallMediaConstraints(true));

    applyAnsweredCallState(stores, stream, currentCall);
    setupCallEvents(currentCall);

    return 'answered';
  } catch (error) {
    reportError('[PeerJS] Failed to get local stream for answer:', error);
    alertUser('Could not access camera/microphone. Please check permissions.');
    endCall();
    return 'failed';
  }
}

export function bindActiveCallEvents(call, {
  stores,
  endCall,
  closeLog = '[PeerJS] Call closed',
  log = () => {},
  reportError = () => {}
}) {
  return bindCallLifecycleEvents(call, {
    stream: (stream) => {
      log('[PeerJS] Received remote stream');
      applyRemoteStreamState(stores, stream);
    },
    close: () => {
      log(closeLog);
      endCall();
    },
    error: (error) => {
      reportError('[PeerJS] Call error:', error);
      endCall();
    }
  });
}

export function endPeerCall({
  currentCall,
  setCurrentCall,
  localStream,
  remoteStream,
  resetCallState,
  log = () => {}
}) {
  log('[PeerJS] Ending call');

  if (currentCall) {
    setCurrentCall(closeCurrentCall(currentCall));
  }

  stopStreamTracks(localStream);
  stopStreamTracks(remoteStream);
  resetCallState();
}

export function togglePeerAudio(stream, setAudioEnabled) {
  const enabled = toggleFirstAudioTrack(stream);
  if (enabled !== null) {
    setAudioEnabled(enabled);
  }

  return enabled;
}

export function togglePeerVideo(stream, setVideoEnabled) {
  const enabled = toggleFirstVideoTrack(stream);
  if (enabled !== null) {
    setVideoEnabled(enabled);
  }

  return enabled;
}

export async function togglePeerScreenShare({
  sharing,
  mediaDevices,
  currentStream,
  currentCall,
  setScreenSharing,
  toggleScreenShare,
  log = () => {},
  reportError = () => {}
}) {
  if (sharing) {
    try {
      await switchCallToCamera({
        mediaDevices,
        currentStream,
        currentCall
      });

      setScreenSharing(false);
      log('[PeerJS] Switched back to camera');
      return 'camera';
    } catch (error) {
      reportError('[PeerJS] Failed to switch back to camera:', error);
      return 'camera_failed';
    }
  }

  try {
    await switchCallToScreenShare({
      mediaDevices,
      currentStream,
      currentCall,
      onScreenShareEnded: createScreenShareEndedHandler(toggleScreenShare)
    });

    setScreenSharing(true);
    log('[PeerJS] Started screen sharing');
    return 'screen';
  } catch (error) {
    reportError('[PeerJS] Failed to start screen sharing:', error);
    return 'screen_failed';
  }
}
