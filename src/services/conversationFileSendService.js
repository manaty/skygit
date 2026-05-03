export function getConversationInputFile(event) {
  return event?.target?.files?.[0] || null;
}

export function createConversationFileSendState(file) {
  return {
    fileToSend: file,
    fileSending: true,
    fileSendPercent: 0
  };
}

export function startConversationFileSend({
  event,
  callActive,
  currentCallPeer,
  sendFile
}) {
  const file = getConversationInputFile(event);
  if (!file || !callActive || !currentCallPeer) {
    return { status: 'skipped' };
  }

  sendFile(file);

  return {
    status: 'started',
    ...createConversationFileSendState(file)
  };
}
