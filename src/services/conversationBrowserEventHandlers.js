import {
  applyConversationFileReceiveProgress,
  applyConversationFileSendProgress
} from './conversationTransferProgressService.js';

export function createConversationBrowserEventHandlers({
  setRemoteRecording,
  setRemoteScreenShare,
  setRemoteMediaStatus,
  setReceiveState,
  clearReceiveState,
  setSendState,
  clearSendState,
  applyReceiveProgress = applyConversationFileReceiveProgress,
  applySendProgress = applyConversationFileSendProgress
}) {
  return {
    onRecordingStatus: status => {
      setRemoteRecording(!!status.recording);
    },
    onScreenShare: (active, meta) => {
      setRemoteScreenShare(active, meta || null);
    },
    onMediaStatus: status => {
      setRemoteMediaStatus(status);
    },
    onFileReceiveProgress: (meta, received, total) => {
      applyReceiveProgress({
        meta,
        received,
        total,
        setReceiveState,
        clearReceiveState
      });
    },
    onFileSendProgress: (_meta, sent, total) => {
      applySendProgress({
        sent,
        total,
        setSendState,
        clearSendState
      });
    }
  };
}
