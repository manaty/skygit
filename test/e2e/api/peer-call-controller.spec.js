import { test, expect } from '@playwright/test';
import { createPeerCallController } from '../../../src/utils/peerCallController.js';

test('createPeerCallController initializes incoming call handling with current call accessors', () => {
  const calls = [];
  const controller = createPeerCallController({
    ...createBaseDependencies(calls),
    bindIncomingCalls: (localPeer, options) => {
      calls.push(['bindIncomingCalls', localPeer, options.getCallStatus(), options.getCurrentCall()]);
      options.setCurrentCall('incoming-call');
      return 'bound';
    }
  });

  expect(controller.initializeCallHandling()).toBe('bound');
  expect(controller.getCurrentCall()).toBe('incoming-call');
  expect(calls).toEqual([
    ['bindIncomingCalls', 'local-peer', 'idle', null]
  ]);
});

test('createPeerCallController starts answers and ends calls through injected session helpers', async () => {
  const calls = [];
  const controller = createPeerCallController({
    ...createBaseDependencies(calls),
    startOutgoingCall: ({ peerId, video, localPeer, localUsername, setCurrentCall, setupCallEvents }) => {
      const call = { peer: peerId };
      calls.push(['startOutgoingCall', peerId, video, localPeer, localUsername]);
      setCurrentCall(call);
      setupCallEvents(call);
      return call;
    },
    answerIncomingCall: ({ currentCall, callStatus, setupCallEvents }) => {
      calls.push(['answerIncomingCall', currentCall, callStatus]);
      setupCallEvents(currentCall);
      return 'answered';
    },
    bindActiveCall: (call) => {
      calls.push(['bindActiveCall', call]);
      return 'events-bound';
    },
    endCallSession: ({ currentCall, setCurrentCall, localStream, remoteStream }) => {
      calls.push(['endCallSession', currentCall, localStream, remoteStream]);
      setCurrentCall(null);
      return 'ended';
    }
  });

  expect(await controller.startCall('peer-a', false)).toEqual({ peer: 'peer-a' });
  expect(await controller.answerCall()).toBe('answered');
  expect(controller.endCall()).toBe('ended');
  expect(controller.getCurrentCall()).toBeNull();

  expect(calls).toEqual([
    ['startOutgoingCall', 'peer-a', false, 'local-peer', 'alice'],
    ['bindActiveCall', { peer: 'peer-a' }],
    ['answerIncomingCall', { peer: 'peer-a' }, 'idle'],
    ['bindActiveCall', { peer: 'peer-a' }],
    ['endCallSession', { peer: 'peer-a' }, 'local-stream', 'remote-stream']
  ]);
});

test('createPeerCallController toggles audio video and screen sharing with store values', async () => {
  const calls = [];
  const controller = createPeerCallController({
    ...createBaseDependencies(calls),
    toggleAudioTrack: (stream, setAudioEnabled) => {
      calls.push(['toggleAudioTrack', stream]);
      setAudioEnabled(false);
      return false;
    },
    toggleVideoTrack: (stream, setVideoEnabled) => {
      calls.push(['toggleVideoTrack', stream]);
      setVideoEnabled(true);
      return true;
    },
    toggleScreenShareTrack: ({ sharing, currentStream, setScreenSharing }) => {
      calls.push(['toggleScreenShareTrack', sharing, currentStream]);
      setScreenSharing(true);
      return 'screen';
    }
  });

  expect(controller.toggleAudio()).toBe(false);
  expect(controller.toggleVideo()).toBe(true);
  expect(await controller.toggleScreenShare()).toBe('screen');

  expect(calls).toEqual([
    ['toggleAudioTrack', 'local-stream'],
    ['set:isAudioEnabled', false],
    ['toggleVideoTrack', 'local-stream'],
    ['set:isVideoEnabled', true],
    ['toggleScreenShareTrack', false, 'local-stream'],
    ['set:isScreenSharing', true]
  ]);
});

function createBaseDependencies(calls = []) {
  const stores = {
    callStatus: createStore(calls, 'callStatus'),
    localStream: createStore(calls, 'localStream'),
    remoteStream: createStore(calls, 'remoteStream'),
    remotePeerId: createStore(calls, 'remotePeerId'),
    isVideoEnabled: createStore(calls, 'isVideoEnabled'),
    isAudioEnabled: createStore(calls, 'isAudioEnabled'),
    isScreenSharing: createStore(calls, 'isScreenSharing'),
    callStartTime: createStore(calls, 'callStartTime')
  };
  const values = new Map([
    [stores.callStatus, 'idle'],
    [stores.localStream, 'local-stream'],
    [stores.remoteStream, 'remote-stream'],
    [stores.isScreenSharing, false]
  ]);

  return {
    getLocalPeer: () => 'local-peer',
    getLocalUsername: () => 'alice',
    getMediaDevices: () => 'media-devices',
    getAlertUser: () => 'alert-user',
    getStoreValue: store => values.get(store),
    stores,
    resetCallState: () => calls.push(['resetCallState']),
    log: (...args) => calls.push(['log', ...args]),
    warn: (...args) => calls.push(['warn', ...args]),
    reportError: (...args) => calls.push(['reportError', ...args])
  };
}

function createStore(calls, name) {
  return {
    set: value => calls.push([`set:${name}`, value])
  };
}
