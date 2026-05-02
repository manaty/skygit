import { mergeRemoteConversation } from '../utils/conversationSync.js';

export async function fetchAndMergeConversation({
  conversation,
  token,
  fetchImpl = fetch
}) {
  if (!conversation?.path || !conversation?.repo || !token) return null;

  const res = await fetchImpl(`https://api.github.com/repos/${conversation.repo}/contents/${conversation.path}`, {
    headers: {
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github+json'
    }
  });

  if (!res.ok) return null;

  const blob = await res.json();
  const remoteConversation = JSON.parse(atob(blob.content));

  return mergeRemoteConversation(conversation, remoteConversation);
}

export function createConversationSyncController({
  sync,
  intervalMs = 10000,
  setTimer = setInterval,
  clearTimer = clearInterval
}) {
  let timer = null;

  function stop() {
    if (timer) {
      clearTimer(timer);
      timer = null;
    }
  }

  function start() {
    if (timer) return;

    timer = setTimer(sync, intervalMs);
    sync();
  }

  return {
    start,
    stop,
    isRunning: () => Boolean(timer)
  };
}
