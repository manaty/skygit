import {
  answerIncomingPeerCall,
  bindActiveCallEvents,
  bindIncomingCallHandling,
  endPeerCall,
  startOutgoingPeerCall,
  togglePeerAudio,
  togglePeerScreenShare,
  togglePeerVideo
} from './peerCallSession.js';

export function createPeerCallController({
  getLocalPeer,
  getLocalUsername,
  getMediaDevices,
  getAlertUser,
  getStoreValue,
  stores,
  resetCallState,
  bindIncomingCalls = bindIncomingCallHandling,
  startOutgoingCall = startOutgoingPeerCall,
  answerIncomingCall = answerIncomingPeerCall,
  bindActiveCall = bindActiveCallEvents,
  endCallSession = endPeerCall,
  toggleAudioTrack = togglePeerAudio,
  toggleVideoTrack = togglePeerVideo,
  toggleScreenShareTrack = togglePeerScreenShare,
  log = () => {},
  warn = () => {},
  reportError = () => {}
}) {
  let currentCall = null;

  const setCurrentCall = call => {
    currentCall = call;
  };

  const initializeCallHandling = () => bindIncomingCalls(getLocalPeer(), {
    getCallStatus: () => getStoreValue(stores.callStatus),
    stores: {
      callStatus: stores.callStatus,
      remotePeerId: stores.remotePeerId
    },
    getCurrentCall: () => currentCall,
    setCurrentCall,
    endCall,
    log,
    warn,
    reportError
  });

  const setupCallEvents = call => bindActiveCall(call, {
    stores: {
      remoteStream: stores.remoteStream,
      callStatus: stores.callStatus,
      callStartTime: stores.callStartTime
    },
    endCall,
    log,
    reportError
  });

  const startCall = (peerId, video = true) => startOutgoingCall({
    localPeer: getLocalPeer(),
    peerId,
    video,
    mediaDevices: getMediaDevices(),
    localUsername: getLocalUsername(),
    stores: {
      localStream: stores.localStream,
      callStatus: stores.callStatus,
      remotePeerId: stores.remotePeerId,
      isVideoEnabled: stores.isVideoEnabled
    },
    setCurrentCall,
    setupCallEvents,
    alertUser: getAlertUser(),
    resetCallState,
    log,
    reportError
  });

  const answerCall = () => answerIncomingCall({
    currentCall,
    callStatus: getStoreValue(stores.callStatus),
    mediaDevices: getMediaDevices(),
    stores: {
      localStream: stores.localStream
    },
    setupCallEvents,
    endCall,
    alertUser: getAlertUser(),
    log,
    warn,
    reportError
  });

  function endCall() {
    return endCallSession({
      currentCall,
      setCurrentCall,
      localStream: getStoreValue(stores.localStream),
      remoteStream: getStoreValue(stores.remoteStream),
      resetCallState,
      log
    });
  }

  const toggleAudio = () => toggleAudioTrack(
    getStoreValue(stores.localStream),
    enabled => stores.isAudioEnabled.set(enabled)
  );

  const toggleVideo = () => toggleVideoTrack(
    getStoreValue(stores.localStream),
    enabled => stores.isVideoEnabled.set(enabled)
  );

  const toggleScreenShare = () => toggleScreenShareTrack({
    sharing: getStoreValue(stores.isScreenSharing),
    mediaDevices: getMediaDevices(),
    currentStream: getStoreValue(stores.localStream),
    currentCall,
    setScreenSharing: sharing => stores.isScreenSharing.set(sharing),
    toggleScreenShare,
    log,
    reportError
  });

  return {
    initializeCallHandling,
    startCall,
    answerCall,
    setupCallEvents,
    endCall,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
    getCurrentCall: () => currentCall
  };
}
