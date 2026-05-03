import { calculateTransferPercent } from '../utils/transferProgress.js';

export function createFileReceiveProgressState(meta, received, total, calculatePercent = calculateTransferPercent) {
  return {
    name: meta.name,
    progress: { received, total },
    percent: calculatePercent(received, total)
  };
}

export function createFileSendProgressState(sent, total, calculatePercent = calculateTransferPercent) {
  return {
    percent: calculatePercent(sent, total)
  };
}

export function isTransferComplete(done, total) {
  return done === total;
}

export function applyConversationFileReceiveProgress({
  meta,
  received,
  total,
  setReceiveState,
  clearReceiveState,
  schedule = globalThis.setTimeout,
  clearDelay = 3000,
  calculatePercent = calculateTransferPercent
}) {
  setReceiveState(createFileReceiveProgressState(meta, received, total, calculatePercent));

  if (isTransferComplete(received, total)) {
    schedule(clearReceiveState, clearDelay);
  }
}

export function applyConversationFileSendProgress({
  sent,
  total,
  setSendState,
  clearSendState,
  schedule = globalThis.setTimeout,
  clearDelay = 2000,
  calculatePercent = calculateTransferPercent
}) {
  setSendState(createFileSendProgressState(sent, total, calculatePercent));

  if (isTransferComplete(sent, total)) {
    schedule(clearSendState, clearDelay);
  }
}
