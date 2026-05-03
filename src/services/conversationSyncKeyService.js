export function getConversationSyncKey(conversation, pollingActive) {
  if (!conversation || !pollingActive) {
    return null;
  }

  return `${conversation.repo}::${conversation.path}`;
}

export function applyConversationSyncKeyChange({
  currentKey,
  nextKey,
  syncController
}) {
  if (nextKey === currentKey) {
    return currentKey;
  }

  syncController.stop();
  if (nextKey) {
    syncController.start();
  }

  return nextKey;
}
