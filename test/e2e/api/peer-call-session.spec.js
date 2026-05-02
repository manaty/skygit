import { test, expect } from '@playwright/test';
import {
  answerIncomingPeerCall,
  bindActiveCallEvents,
  bindIncomingCallHandling,
  endPeerCall,
  handleIncomingPeerCall,
  startOutgoingPeerCall,
  togglePeerAudio,
  togglePeerScreenShare,
  togglePeerVideo
} from '../../../src/utils/peerCallSession.js';

function store(name, calls) {
  return {
    set: (value) => calls.push([name, value])
  };
}

function createCall(peer = 'peer-a') {
  const handlers = new Map();
  const calls = [];

  return {
    peer,
    calls,
    boundEvents: [],
    answer: (stream) => calls.push(['answer', stream]),
    close: () => calls.push(['close']),
    off: (eventName) => calls.push(['off', eventName]),
    on(eventName, handler) {
      this.boundEvents.push(eventName);
      handlers.set(eventName, handler);
    },
    emit(eventName, payload) {
      handlers.get(eventName)?.(payload);
    }
  };
}

test('bindIncomingCallHandling attaches PeerJS call events and accepts idle calls', async () => {
  const peerHandlers = new Map();
  const calls = [];
  const acceptedCall = createCall('peer-a');
  const peer = {
    boundEvents: [],
    on(eventName, handler) {
      this.boundEvents.push(eventName);
      peerHandlers.set(eventName, handler);
    }
  };

  bindIncomingCallHandling(peer, {
    getCallStatus: () => 'idle',
    stores: {
      callStatus: store('status', calls),
      remotePeerId: store('remotePeer', calls),
      remoteStream: store('remoteStream', calls),
      callStartTime: store('startTime', calls)
    },
    getCurrentCall: () => null,
    setCurrentCall: (call) => calls.push(['setCurrent', call]),
    endCall: () => calls.push(['end']),
    log: (...args) => calls.push(['log', ...args]),
    warn: (...args) => calls.push(['warn', ...args]),
    reportError: (...args) => calls.push(['error', ...args])
  });

  await peerHandlers.get('call')(acceptedCall);
  acceptedCall.emit('close');

  expect(peer.boundEvents).toEqual(['call']);
  expect(acceptedCall.boundEvents).toEqual(['stream', 'close', 'error']);
  expect(calls).toContainEqual(['status', 'incoming']);
  expect(calls).toContainEqual(['remotePeer', 'peer-a']);
  expect(calls).toContainEqual(['setCurrent', acceptedCall]);
  expect(calls).toContainEqual(['log', '[PeerJS] Call closed remotely']);
  expect(calls).toContainEqual(['end']);
});

test('handleIncomingPeerCall rejects busy calls and closes zombie calls', () => {
  const calls = [];
  const busyCall = createCall('busy-peer');
  const zombieCall = createCall('zombie-peer');
  const nextCall = createCall('next-peer');

  expect(handleIncomingPeerCall({
    call: busyCall,
    callStatus: 'connected',
    stores: {},
    currentCall: null,
    setCurrentCall: () => calls.push(['set']),
    endCall: () => {},
    log: (...args) => calls.push(['log', ...args])
  })).toBe('rejected');
  expect(busyCall.calls).toEqual([['close']]);

  expect(handleIncomingPeerCall({
    call: nextCall,
    callStatus: 'idle',
    stores: {
      callStatus: store('status', calls),
      remotePeerId: store('remotePeer', calls)
    },
    currentCall: zombieCall,
    setCurrentCall: (call) => calls.push(['set', call.peer]),
    endCall: () => {},
    log: (...args) => calls.push(['log', ...args]),
    warn: (...args) => calls.push(['warn', ...args])
  })).toBe('incoming');

  expect(zombieCall.calls).toEqual([['close']]);
  expect(calls).toContainEqual(['warn', '[PeerJS] Closing zombie call before accepting new one']);
  expect(calls).toContainEqual(['set', 'next-peer']);
});

test('startOutgoingPeerCall creates calls and resets state on media failure', async () => {
  const calls = [];
  const stream = { id: 'local-stream' };
  const createdCall = createCall('peer-b');
  const localPeer = {
    call: (peerId, localStream, metadata) => {
      calls.push(['call', peerId, localStream, metadata]);
      return createdCall;
    }
  };

  await expect(startOutgoingPeerCall({
    localPeer,
    peerId: 'peer-b',
    video: false,
    mediaDevices: {
      getUserMedia: async (constraints) => {
        calls.push(['media', constraints]);
        return stream;
      }
    },
    localUsername: 'alice',
    stores: {
      localStream: store('localStream', calls),
      callStatus: store('status', calls),
      remotePeerId: store('remotePeer', calls),
      isVideoEnabled: store('video', calls)
    },
    setCurrentCall: (call) => calls.push(['setCurrent', call]),
    setupCallEvents: (call) => calls.push(['setup', call]),
    log: (...args) => calls.push(['log', ...args])
  })).resolves.toBe(createdCall);

  expect(calls).toContainEqual(['media', { video: false, audio: true }]);
  expect(calls).toContainEqual(['status', 'calling']);
  expect(calls).toContainEqual(['video', false]);
  expect(calls).toContainEqual(['setCurrent', createdCall]);

  await expect(startOutgoingPeerCall({
    localPeer,
    peerId: 'peer-c',
    mediaDevices: { getUserMedia: async () => { throw new Error('denied'); } },
    localUsername: 'alice',
    stores: {},
    setCurrentCall: () => {},
    setupCallEvents: () => {},
    alertUser: (message) => calls.push(['alert', message]),
    resetCallState: () => calls.push(['reset']),
    reportError: (...args) => calls.push(['error', ...args])
  })).resolves.toBeNull();

  expect(calls).toContainEqual(['reset']);
  expect(calls.some(call => call[0] === 'alert' && call[1].includes('camera/microphone'))).toBe(true);
});

test('answerIncomingPeerCall handles missing, duplicate, success and failure paths', async () => {
  const calls = [];
  const currentCall = createCall('peer-a');
  const stream = { id: 'answer-stream' };

  await expect(answerIncomingPeerCall({
    currentCall: null,
    callStatus: 'incoming',
    mediaDevices: {},
    stores: {},
    setupCallEvents: () => {},
    endCall: () => {},
    log: (...args) => calls.push(['log', ...args])
  })).resolves.toBe('missing');

  await expect(answerIncomingPeerCall({
    currentCall,
    callStatus: 'connected',
    mediaDevices: {},
    stores: {},
    setupCallEvents: () => {},
    endCall: () => {},
    warn: (...args) => calls.push(['warn', ...args])
  })).resolves.toBe('already_answered');

  await expect(answerIncomingPeerCall({
    currentCall,
    callStatus: 'incoming',
    mediaDevices: { getUserMedia: async () => stream },
    stores: { localStream: store('localStream', calls) },
    setupCallEvents: (call) => calls.push(['setup', call.peer]),
    endCall: () => calls.push(['end'])
  })).resolves.toBe('answered');

  expect(currentCall.calls).toContainEqual(['answer', stream]);
  expect(calls).toContainEqual(['setup', 'peer-a']);

  await expect(answerIncomingPeerCall({
    currentCall,
    callStatus: 'incoming',
    mediaDevices: { getUserMedia: async () => { throw new Error('denied'); } },
    stores: {},
    setupCallEvents: () => {},
    endCall: () => calls.push(['end']),
    alertUser: (message) => calls.push(['alert', message]),
    reportError: (...args) => calls.push(['error', ...args])
  })).resolves.toBe('failed');

  expect(calls).toContainEqual(['end']);
});

test('call event, end, audio and video helpers delegate state changes', () => {
  const calls = [];
  const call = createCall('peer-a');
  const localTrack = { enabled: true, stop: () => calls.push(['stop', 'local']) };
  const remoteTrack = { enabled: true, stop: () => calls.push(['stop', 'remote']) };
  const audioTrack = { enabled: true };
  const videoTrack = { enabled: false };

  bindActiveCallEvents(call, {
    stores: {
      remoteStream: store('remoteStream', calls),
      callStatus: store('status', calls),
      callStartTime: store('startTime', calls)
    },
    endCall: () => calls.push(['end']),
    log: (...args) => calls.push(['log', ...args]),
    reportError: (...args) => calls.push(['error', ...args])
  });

  const error = new Error('call failed');
  call.emit('stream', { id: 'remote-stream' });
  call.emit('error', error);

  endPeerCall({
    currentCall: call,
    setCurrentCall: (nextCall) => calls.push(['setCurrent', nextCall]),
    localStream: { getTracks: () => [localTrack] },
    remoteStream: { getTracks: () => [remoteTrack] },
    resetCallState: () => calls.push(['reset'])
  });

  expect(togglePeerAudio({ getAudioTracks: () => [audioTrack] }, (enabled) => calls.push(['audio', enabled]))).toBe(false);
  expect(togglePeerVideo({ getVideoTracks: () => [videoTrack] }, (enabled) => calls.push(['video', enabled]))).toBe(true);

  expect(calls).toContainEqual(['remoteStream', { id: 'remote-stream' }]);
  expect(calls).toContainEqual(['error', '[PeerJS] Call error:', error]);
  expect(calls).toContainEqual(['setCurrent', null]);
  expect(calls).toContainEqual(['stop', 'local']);
  expect(calls).toContainEqual(['stop', 'remote']);
  expect(calls).toContainEqual(['reset']);
  expect(calls).toContainEqual(['audio', false]);
  expect(calls).toContainEqual(['video', true]);
});

test('togglePeerScreenShare switches between camera and screen states', async () => {
  const calls = [];
  const currentCall = {
    peerConnection: {
      getSenders: () => [
        { track: { kind: 'video' }, replaceTrack: async (track) => calls.push(['replace', track.kind]) }
      ]
    }
  };
  const currentStream = {
    getVideoTracks: () => [{ stop: () => calls.push(['stop-old']) }],
    removeTrack: () => calls.push(['remove']),
    addTrack: (track) => calls.push(['add', track.kind])
  };

  await expect(togglePeerScreenShare({
    sharing: false,
    mediaDevices: {
      getDisplayMedia: async () => ({ getVideoTracks: () => [{ kind: 'video', onended: null }] })
    },
    currentStream,
    currentCall,
    setScreenSharing: (sharing) => calls.push(['sharing', sharing]),
    toggleScreenShare: () => calls.push(['toggle']),
    log: (...args) => calls.push(['log', ...args])
  })).resolves.toBe('screen');

  await expect(togglePeerScreenShare({
    sharing: true,
    mediaDevices: {
      getUserMedia: async () => ({ getVideoTracks: () => [{ kind: 'video' }] })
    },
    currentStream,
    currentCall,
    setScreenSharing: (sharing) => calls.push(['sharing', sharing]),
    toggleScreenShare: () => calls.push(['toggle']),
    log: (...args) => calls.push(['log', ...args])
  })).resolves.toBe('camera');

  expect(calls).toContainEqual(['sharing', true]);
  expect(calls).toContainEqual(['sharing', false]);
  expect(calls).toContainEqual(['log', '[PeerJS] Started screen sharing']);
  expect(calls).toContainEqual(['log', '[PeerJS] Switched back to camera']);
});
