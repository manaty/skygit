import { test, expect } from '@playwright/test';
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
} from '../../../src/utils/peerCallLifecycle.js';

function store(name, updates) {
  return {
    set: (value) => updates.push([name, value])
  };
}

test('call lifecycle guards classify busy incoming and answered states', () => {
  expect(shouldRejectIncomingCall('idle')).toBe(false);
  expect(shouldRejectIncomingCall('incoming')).toBe(true);
  expect(isAnswerAlreadyInProgress('connected')).toBe(true);
  expect(isAnswerAlreadyInProgress('connecting')).toBe(true);
  expect(isAnswerAlreadyInProgress('incoming')).toBe(false);
});

test('createCallMetadata builds the PeerJS call metadata wrapper', () => {
  expect(createCallMetadata('alice')).toEqual({
    metadata: {
      username: 'alice',
      type: 'call'
    }
  });
});

test('call state helpers update stores for incoming, outgoing, answered and remote streams', () => {
  const updates = [];
  const stream = { id: 'local-stream' };
  const remote = { id: 'remote-stream' };
  const call = {
    peer: 'peer-a',
    answer: (answeredStream) => updates.push(['answer', answeredStream])
  };
  const stores = {
    callStatus: store('status', updates),
    remotePeerId: store('remotePeer', updates),
    localStream: store('localStream', updates),
    remoteStream: store('remoteStream', updates),
    isVideoEnabled: store('video', updates),
    callStartTime: store('startTime', updates)
  };

  applyIncomingCallState(stores, call);
  applyOutgoingCallState(stores, stream, 'peer-b', false);
  applyAnsweredCallState(stores, stream, call);
  applyRemoteStreamState(stores, remote, 1234);

  expect(updates).toEqual([
    ['status', 'incoming'],
    ['remotePeer', 'peer-a'],
    ['localStream', stream],
    ['status', 'calling'],
    ['remotePeer', 'peer-b'],
    ['video', false],
    ['localStream', stream],
    ['answer', stream],
    ['remoteStream', remote],
    ['status', 'connected'],
    ['startTime', 1234]
  ]);
});

test('bindCallLifecycleEvents attaches provided call event handlers', () => {
  const handlers = new Map();
  const call = {
    boundEvents: [],
    on(eventName, handler) {
      this.boundEvents.push(eventName);
      handlers.set(eventName, handler);
    }
  };
  const calls = [];

  const result = bindCallLifecycleEvents(call, {
    stream: (stream) => calls.push(['stream', stream.id]),
    close: () => calls.push(['close']),
    error: (error) => calls.push(['error', error.message]),
    missing: null
  });

  handlers.get('stream')({ id: 'remote-stream' });
  handlers.get('close')();
  handlers.get('error')(new Error('call failed'));

  expect(result).toBe(call);
  expect(call.boundEvents).toEqual(['stream', 'close', 'error']);
  expect(calls).toEqual([
    ['stream', 'remote-stream'],
    ['close'],
    ['error', 'call failed']
  ]);
});

test('close helpers close current and zombie calls safely', () => {
  const calls = [];
  const call = {
    off: (event) => calls.push(['off', event]),
    close: () => calls.push(['close'])
  };
  const failingCall = {
    close: () => {
      throw new Error('close failed');
    }
  };
  const errors = [];

  closeCallQuietly(call);
  closeCallQuietly(failingCall, (error) => errors.push(error.message));

  expect(closeCurrentCall(call)).toBeNull();
  expect(closeCurrentCall(null)).toBeNull();
  expect(errors).toEqual(['close failed']);
  expect(calls).toEqual([
    ['close'],
    ['off', 'close'],
    ['off', 'error'],
    ['close']
  ]);
});

test('track toggles update the first available audio and video tracks', () => {
  const audioTrack = { enabled: true };
  const videoTrack = { enabled: false };
  const stream = {
    getAudioTracks: () => [audioTrack],
    getVideoTracks: () => [videoTrack]
  };

  expect(toggleFirstAudioTrack(stream)).toBe(false);
  expect(audioTrack.enabled).toBe(false);
  expect(toggleFirstVideoTrack(stream)).toBe(true);
  expect(videoTrack.enabled).toBe(true);
  expect(toggleFirstAudioTrack(null)).toBeNull();
  expect(toggleFirstVideoTrack({ getVideoTracks: () => [] })).toBeNull();
});

test('createScreenShareEndedHandler delegates back to the provided toggle action', () => {
  const calls = [];
  const handler = createScreenShareEndedHandler(() => calls.push('toggle'));

  handler();

  expect(calls).toEqual(['toggle']);
});
