export function getConversationPresenceContext({ conversation, token, auth }) {
  return {
    repoFullName: conversation?.repo || null,
    token,
    username: auth?.user?.login || null
  };
}

export function isPresencePollingActive(pollingMap, repoFullName) {
  return repoFullName ? pollingMap[repoFullName] !== false : true;
}

export function startConversationPresence({
  repoFullName,
  token,
  username,
  getSessionId,
  initializePeerManager,
  updateMyConversations,
  schedule = globalThis.setTimeout
}) {
  if (!repoFullName || !token || !username) {
    return { status: 'skipped' };
  }

  const sessionId = getSessionId(repoFullName);
  initializePeerManager({
    _token: token,
    _repoFullName: repoFullName,
    _username: username,
    _sessionId: sessionId
  });

  const timeoutId = schedule(() => {
    updateMyConversations([repoFullName]);
  }, 2000);

  return { status: 'started', sessionId, timeoutId };
}

export function applyConversationPresencePolling({
  repoFullName,
  token,
  username,
  pollingMap,
  getSessionId,
  initializePeerManager,
  updateMyConversations,
  shutdownPeerManager,
  schedule
}) {
  if (!repoFullName || !token || !username) {
    return { status: 'skipped', pollingActive: true };
  }

  const pollingActive = isPresencePollingActive(pollingMap, repoFullName);
  if (!pollingActive) {
    shutdownPeerManager();
    return { status: 'stopped', pollingActive };
  }

  return {
    ...startConversationPresence({
      repoFullName,
      token,
      username,
      getSessionId,
      initializePeerManager,
      updateMyConversations,
      schedule
    }),
    pollingActive
  };
}

export function toggleConversationPresence({
  repoFullName,
  token,
  username,
  pollingActive,
  setPollingState,
  getSessionId,
  initializePeerManager,
  updateMyConversations,
  shutdownPeerManager,
  schedule
}) {
  if (!repoFullName || !token || !username) {
    return { status: 'skipped' };
  }

  if (pollingActive) {
    setPollingState(repoFullName, false);
    shutdownPeerManager();
    return { status: 'stopped', pollingActive: false };
  }

  setPollingState(repoFullName, true);
  return {
    ...startConversationPresence({
      repoFullName,
      token,
      username,
      getSessionId,
      initializePeerManager,
      updateMyConversations,
      schedule
    }),
    pollingActive: true
  };
}
