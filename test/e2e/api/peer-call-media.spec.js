import { test, expect } from '@playwright/test';
import {
  createCallMediaConstraints,
  createCameraVideoConstraints,
  createScreenShareConstraints,
  replaceCallVideoSender,
  replaceStreamVideoTrack,
  stopStreamTracks
} from '../../../src/utils/peerCallMedia.js';

test('media constraint helpers build expected browser constraints', () => {
  expect(createCallMediaConstraints(false)).toEqual({ video: false, audio: true });
  expect(createCallMediaConstraints(true)).toEqual({ video: true, audio: true });
  expect(createCameraVideoConstraints()).toEqual({ video: true, audio: false });
  expect(createScreenShareConstraints()).toEqual({ video: true, audio: false });
});

test('stopStreamTracks stops and disables every stream track', () => {
  const stopped = [];
  const tracks = [
    { enabled: true, stop: () => stopped.push('audio') },
    { enabled: true, stop: () => stopped.push('video') }
  ];

  stopStreamTracks({ getTracks: () => tracks });

  expect(stopped).toEqual(['audio', 'video']);
  expect(tracks.map(track => track.enabled)).toEqual([false, false]);
  expect(stopStreamTracks(null)).toBeUndefined();
});

test('replaceStreamVideoTrack removes the old video track before adding the new one', () => {
  const calls = [];
  const oldTrack = { stop: () => calls.push('stop-old') };
  const newTrack = { kind: 'video' };
  const stream = {
    getVideoTracks: () => [oldTrack],
    removeTrack: (track) => calls.push(['remove', track]),
    addTrack: (track) => calls.push(['add', track])
  };

  replaceStreamVideoTrack(stream, newTrack);

  expect(calls).toEqual([
    'stop-old',
    ['remove', oldTrack],
    ['add', newTrack]
  ]);
});

test('replaceCallVideoSender replaces the active video sender track', async () => {
  const newTrack = { kind: 'video' };
  const replaced = [];
  const call = {
    peerConnection: {
      getSenders: () => [
        { track: { kind: 'audio' }, replaceTrack: async () => replaced.push('audio') },
        { track: { kind: 'video' }, replaceTrack: async (track) => replaced.push(track) }
      ]
    }
  };

  await expect(replaceCallVideoSender(call, newTrack)).resolves.toBe(true);
  expect(replaced).toEqual([newTrack]);
  await expect(replaceCallVideoSender({}, newTrack)).resolves.toBe(false);
});
