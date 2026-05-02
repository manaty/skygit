export const TYPING_CLEAR_DELAY_MS = 3000;

export function isValidTypingMessage(message) {
  return Boolean(message && typeof message.isTyping === 'boolean');
}

export function applyTypingStatus(users, fromPeerId, fromUsername, isTyping, now = Date.now()) {
  const updated = { ...users };

  if (isTyping) {
    updated[fromPeerId] = {
      isTyping: true,
      lastTypingTime: now,
      username: fromUsername
    };
  } else {
    delete updated[fromPeerId];
  }

  return updated;
}

export function clearExpiredTypingStatus(users, fromPeerId, now = Date.now(), maxAge = TYPING_CLEAR_DELAY_MS) {
  const updated = { ...users };
  const userTyping = updated[fromPeerId];

  if (userTyping && now - userTyping.lastTypingTime >= maxAge) {
    delete updated[fromPeerId];
  }

  return updated;
}

export function createTypingStatusMessage(isTyping, timestamp = Date.now()) {
  return {
    type: 'typing',
    isTyping,
    timestamp
  };
}

export function processIncomingTypingMessage({
  message,
  fromUsername,
  fromPeerId,
  updateTypingUsers,
  setTimeoutFn = setTimeout,
  now = Date.now,
  log = () => {},
  warn = () => {}
}) {
  if (!isValidTypingMessage(message)) {
    warn('[PeerJS] Invalid typing message format:', message);
    return 'invalid';
  }

  updateTypingUsers(users => applyTypingStatus(users, fromPeerId, fromUsername, message.isTyping, now()));

  if (message.isTyping) {
    setTimeoutFn(() => {
      updateTypingUsers(users => clearExpiredTypingStatus(users, fromPeerId));
    }, TYPING_CLEAR_DELAY_MS);
    log('[PeerJS] Scheduled typing status clear for:', fromPeerId);
    return 'typing';
  }

  return 'not_typing';
}
