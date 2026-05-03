export function createRecordingBlob(chunks, {
  BlobCtor = globalThis.Blob,
  type = 'video/webm'
} = {}) {
  return new BlobCtor(chunks, { type });
}

export function createConversationMediaRecorder({
  stream,
  MediaRecorderCtor = globalThis.MediaRecorder,
  mimeType = 'video/webm; codecs=vp9',
  onDataAvailable,
  onStop
}) {
  const recorder = new MediaRecorderCtor(stream, { mimeType });
  recorder.ondataavailable = onDataAvailable;
  recorder.onstop = onStop;
  return recorder;
}

export function createConversationRecordingController({
  getLocalStream,
  uploadRecording,
  notifyRecordingStatus = () => {},
  onRecordingChange = () => {},
  createRecorder = createConversationMediaRecorder,
  createBlob = createRecordingBlob
}) {
  let mediaRecorder = null;
  let recordedChunks = [];
  let recording = false;

  async function handleRecordingStop() {
    const blob = createBlob(recordedChunks);
    recordedChunks = [];
    await uploadRecording(blob);
  }

  function start() {
    const stream = getLocalStream();
    if (!stream) {
      return false;
    }

    recordedChunks = [];
    mediaRecorder = createRecorder({
      stream,
      onDataAvailable: event => {
        if (event.data?.size > 0) {
          recordedChunks.push(event.data);
        }
      },
      onStop: handleRecordingStop
    });

    mediaRecorder.start();
    recording = true;
    onRecordingChange(true);
    notifyRecordingStatus(true);
    return true;
  }

  function stop() {
    if (!mediaRecorder || !recording) {
      return false;
    }

    recording = false;
    onRecordingChange(false);
    notifyRecordingStatus(false);
    mediaRecorder.stop();
    return true;
  }

  return {
    start,
    stop,
    isRecording: () => recording
  };
}
