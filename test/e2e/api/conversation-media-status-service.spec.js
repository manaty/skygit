import { test, expect } from '@playwright/test';
import {
  setStreamTracksEnabled,
  toggleConversationCameraState,
  toggleConversationMicState
} from '../../../src/services/conversationMediaStatusService.js';

function createStream() {
  return {
    audioTracks: [{ enabled: true }, { enabled: true }],
    videoTracks: [{ enabled: true }],
    getAudioTracks() {
      return this.audioTracks;
    },
    getVideoTracks() {
      return this.videoTracks;
    }
  };
}

test('conversation media status service enables and disables matching stream tracks', () => {
  const stream = createStream();

  expect(setStreamTracksEnabled(stream, 'audio', false)).toBe(2);
  expect(stream.audioTracks.map(track => track.enabled)).toEqual([false, false]);
  expect(stream.videoTracks.map(track => track.enabled)).toEqual([true]);

  expect(setStreamTracksEnabled(stream, 'video', false)).toBe(1);
  expect(stream.videoTracks.map(track => track.enabled)).toEqual([false]);
  expect(setStreamTracksEnabled(null, 'audio', true)).toBe(0);
});

test('conversation media status service toggles mic and sends the next status', () => {
  const stream = createStream();
  const calls = [];

  const result = toggleConversationMicState({
    micOn: true,
    cameraOn: true,
    localStream: stream,
    sendStatus: status => calls.push(status)
  });

  expect(result).toEqual({ micOn: false, cameraOn: true, updatedTracks: 2 });
  expect(stream.audioTracks.map(track => track.enabled)).toEqual([false, false]);
  expect(calls).toEqual([{ micOn: false, cameraOn: true }]);
});

test('conversation media status service toggles camera and sends the next status', () => {
  const stream = createStream();
  const calls = [];

  const result = toggleConversationCameraState({
    micOn: true,
    cameraOn: true,
    localStream: stream,
    sendStatus: status => calls.push(status)
  });

  expect(result).toEqual({ micOn: true, cameraOn: false, updatedTracks: 1 });
  expect(stream.videoTracks.map(track => track.enabled)).toEqual([false]);
  expect(calls).toEqual([{ micOn: true, cameraOn: false }]);
});
