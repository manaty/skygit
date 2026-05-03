import { test, expect } from '@playwright/test';
import {
  createConversationMediaRecorder,
  createConversationRecordingController,
  createRecordingBlob
} from '../../../src/services/conversationRecordingController.js';

class FakeBlob {
  constructor(chunks, options) {
    this.chunks = chunks;
    this.options = options;
  }
}

class FakeMediaRecorder {
  constructor(stream, options) {
    this.stream = stream;
    this.options = options;
    this.started = false;
  }

  start() {
    this.started = true;
  }

  stop() {
    this.onstop();
  }
}

test('conversation recording helpers create browser recorder and blob objects', () => {
  const recorder = createConversationMediaRecorder({
    stream: 'stream-a',
    MediaRecorderCtor: FakeMediaRecorder,
    onDataAvailable: () => {},
    onStop: () => {}
  });
  const blob = createRecordingBlob(['chunk-a'], { BlobCtor: FakeBlob });

  expect(recorder.stream).toBe('stream-a');
  expect(recorder.options).toEqual({ mimeType: 'video/webm; codecs=vp9' });
  expect(blob.chunks).toEqual(['chunk-a']);
  expect(blob.options).toEqual({ type: 'video/webm' });
});

test('conversation recording controller records chunks, uploads on stop, and notifies peers', async () => {
  const calls = [];
  let recorder;

  const controller = createConversationRecordingController({
    getLocalStream: () => 'local-stream',
    uploadRecording: async blob => calls.push(['upload', blob]),
    notifyRecordingStatus: status => calls.push(['notify', status]),
    onRecordingChange: status => calls.push(['recording', status]),
    createBlob: chunks => ({ chunks }),
    createRecorder: options => {
      recorder = new FakeMediaRecorder(options.stream, {});
      recorder.ondataavailable = options.onDataAvailable;
      recorder.onstop = options.onStop;
      return recorder;
    }
  });

  expect(controller.start()).toBe(true);
  recorder.ondataavailable({ data: { size: 10, name: 'chunk-a' } });
  recorder.ondataavailable({ data: { size: 0, name: 'empty' } });
  expect(controller.stop()).toBe(true);

  await Promise.resolve();

  expect(controller.isRecording()).toBe(false);
  expect(calls).toEqual([
    ['recording', true],
    ['notify', true],
    ['recording', false],
    ['notify', false],
    ['upload', { chunks: [{ size: 10, name: 'chunk-a' }] }]
  ]);
});

test('conversation recording controller ignores missing streams and duplicate stops', () => {
  const calls = [];
  const controller = createConversationRecordingController({
    getLocalStream: () => null,
    uploadRecording: async () => calls.push('upload'),
    notifyRecordingStatus: status => calls.push(['notify', status])
  });

  expect(controller.start()).toBe(false);
  expect(controller.stop()).toBe(false);
  expect(calls).toEqual([]);
});
