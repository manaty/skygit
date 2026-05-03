import { test, expect } from '@playwright/test';
import {
  changeConversationScreenSource,
  createDisplayMediaOptions,
  getCurrentCallPeer,
  replacePeerVideoTrack,
  sendScreenShareSignal,
  startConversationScreenShare,
  stopConversationScreenShare
} from '../../../src/utils/conversationScreenShare.js';

test('conversation screen share helpers build display media options and find the active peer', () => {
  expect(createDisplayMediaOptions(true, 'tab')).toEqual({
    video: { displaySurface: 'browser', cursor: 'always' },
    audio: true
  });
  expect(createDisplayMediaOptions(false, 'window')).toEqual({
    video: { displaySurface: 'window', cursor: 'always' },
    audio: false
  });
  expect(createDisplayMediaOptions(true, 'unknown')).toEqual({
    video: { displaySurface: 'monitor', cursor: 'always' },
    audio: true
  });

  expect(getCurrentCallPeer({ peerA: { conn: 'connection' } }, 'peerA')).toBe('connection');
  expect(getCurrentCallPeer({}, 'peerA')).toBeNull();
});

test('conversation screen share peer helpers replace tracks and send signals only when supported', () => {
  const calls = [];
  const track = { kind: 'video' };
  const stream = { getVideoTracks: () => [track] };
  const peer = {
    replaceVideoTrack: nextTrack => calls.push(['replace', nextTrack]),
    sendScreenShareSignal: (...args) => calls.push(['signal', ...args])
  };

  expect(replacePeerVideoTrack(peer, stream)).toBe(track);
  expect(sendScreenShareSignal(peer, true, { audio: true })).toBe(true);
  expect(replacePeerVideoTrack({}, stream)).toBeNull();
  expect(sendScreenShareSignal({}, false)).toBe(false);
  expect(calls).toEqual([
    ['replace', track],
    ['signal', true, { audio: true }]
  ]);
});

test('startConversationScreenShare requests media, replaces the peer track, signals and wires ended handling', async () => {
  const calls = [];
  const track = { kind: 'video', onended: null };
  const stream = { getVideoTracks: () => [track] };
  const onEnded = () => calls.push(['ended']);
  const peer = {
    replaceVideoTrack: nextTrack => calls.push(['replace', nextTrack]),
    sendScreenShareSignal: (...args) => calls.push(['signal', ...args])
  };

  const result = await startConversationScreenShare({
    mediaDevices: {
      getDisplayMedia: async options => {
        calls.push(['media', options]);
        return stream;
      }
    },
    withAudio: false,
    type: 'window',
    updatePeerConnections: updater => updater({ peerA: { conn: peer } }),
    currentCallPeer: 'peerA',
    onEnded
  });

  expect(result).toBe(stream);
  expect(track.onended).toBe(onEnded);
  expect(calls).toEqual([
    ['media', { video: { displaySurface: 'window', cursor: 'always' }, audio: false }],
    ['replace', track],
    ['signal', true, { audio: false }]
  ]);
});

test('stop and change conversation screen share restore camera and clean up old streams', async () => {
  const calls = [];
  const oldTrack = { enabled: true, stop: () => calls.push(['stop', 'old']) };
  const newTrack = { kind: 'video', onended: null };
  const cameraTrack = { kind: 'video' };
  const peer = {
    replaceVideoTrack: track => calls.push(['replace', track]),
    sendScreenShareSignal: (...args) => calls.push(['signal', ...args])
  };

  const restored = stopConversationScreenShare({
    screenShareStream: { getTracks: () => [oldTrack] },
    localCameraStream: { getVideoTracks: () => [cameraTrack] },
    updatePeerConnections: updater => updater({ peerA: { conn: peer } }),
    currentCallPeer: 'peerA'
  });

  expect(restored.getVideoTracks()).toEqual([cameraTrack]);
  expect(oldTrack.enabled).toBe(false);

  const changed = await changeConversationScreenSource({
    mediaDevices: {
      getDisplayMedia: async options => {
        calls.push(['media', options]);
        return { getVideoTracks: () => [newTrack] };
      }
    },
    updatePeerConnections: updater => updater({ peerA: { conn: peer } }),
    currentCallPeer: 'peerA',
    previousStream: { getTracks: () => [{ enabled: true, stop: () => calls.push(['stop', 'previous']) }] },
    onEnded: () => {}
  });

  expect(changed.getVideoTracks()).toEqual([newTrack]);
  expect(newTrack.onended).toEqual(expect.any(Function));
  expect(calls).toEqual([
    ['stop', 'old'],
    ['replace', cameraTrack],
    ['signal', false, undefined],
    ['media', { video: { displaySurface: 'monitor', cursor: 'always' }, audio: true }],
    ['replace', newTrack],
    ['stop', 'previous']
  ]);
});
