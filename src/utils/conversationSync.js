export function mergeRemoteConversation(localConversation, remoteConversation) {
  if (!remoteConversation || !Array.isArray(remoteConversation.messages)) {
    return null;
  }

  const localMessages = localConversation.messages || [];
  const messageMap = new Map();

  localMessages.forEach((message) => {
    if (message.id) messageMap.set(message.id, message);
  });

  remoteConversation.messages.forEach((message) => {
    if (message.id) messageMap.set(message.id, message);
  });

  const mergedMessages = Array.from(messageMap.values())
    .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

  if (mergedMessages.length <= localMessages.length) {
    return null;
  }

  return {
    ...localConversation,
    messages: mergedMessages,
    participants: Array.from(new Set([
      ...(localConversation.participants || []),
      ...(remoteConversation.participants || [])
    ]))
  };
}
