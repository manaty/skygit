export function registerSkyGitBrowserCallbacks({
  windowRef = typeof window !== 'undefined' ? window : null,
  onRecordingStatus,
  onScreenShare,
  onMediaStatus,
  onFileReceiveProgress,
  onFileSendProgress
}) {
  if (!windowRef) return () => {};

  const callbacks = {
    skygitOnRecordingStatus: onRecordingStatus,
    skygitOnScreenShare: onScreenShare,
    skygitOnMediaStatus: onMediaStatus,
    skygitFileReceiveProgress: onFileReceiveProgress,
    skygitFileSendProgress: onFileSendProgress
  };

  for (const [name, callback] of Object.entries(callbacks)) {
    windowRef[name] = callback;
  }

  return () => {
    for (const [name, callback] of Object.entries(callbacks)) {
      if (windowRef[name] === callback) {
        delete windowRef[name];
      }
    }
  };
}
