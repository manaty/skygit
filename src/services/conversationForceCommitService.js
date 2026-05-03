export function createConversationCommitQueueKey(conversation) {
  if (!conversation?.repo || !conversation?.id) {
    return null;
  }

  return `${conversation.repo}::${conversation.id}`;
}

export function forceCommitSelectedConversation({
  conversation,
  flushQueue
}) {
  const key = createConversationCommitQueueKey(conversation);
  if (!key) {
    return { status: 'skipped' };
  }

  flushQueue([key]);
  return { status: 'queued', key };
}
