export function isValidChatMessage(message) {
  return Boolean(message?.conversationId && message.content);
}

export function shouldIgnoreChatMessage(fromPeerId, localPeerId) {
  return fromPeerId === localPeerId;
}

export function createIncomingChatMessage(message, fromUsername, createId = () => crypto.randomUUID(), now = () => Date.now()) {
  return {
    id: message.id || createId(),
    sender: fromUsername,
    content: message.content,
    timestamp: message.timestamp || now(),
    hash: message.hash || null,
    in_response_to: message.in_response_to || null
  };
}
