export const LEADER_COMMIT_INTERVAL_MS = 10 * 60 * 1000;

export function getCurrentLeaderId(localPeerId, connections) {
  return [localPeerId, ...Object.keys(connections || {})]
    .filter(Boolean)
    .sort()[0];
}

export function isLocalPeerLeader(localPeerId, connections) {
  return getCurrentLeaderId(localPeerId, connections) === localPeerId;
}

export function shouldRunLeaderCommitInterval(localPeerId, connections) {
  return isLocalPeerLeader(localPeerId, connections) && Object.keys(connections || {}).length > 0;
}

export function startLeaderCommitTimer(flushCommitQueue, isStillLeader, setIntervalFn = setInterval) {
  return setIntervalFn(() => {
    if (isStillLeader()) {
      flushCommitQueue();
    }
  }, LEADER_COMMIT_INTERVAL_MS);
}

export function stopLeaderCommitTimer(timer, clearIntervalFn = clearInterval) {
  if (timer) {
    clearIntervalFn(timer);
  }

  return null;
}

export function refreshLeaderCommitInterval({
  localPeerId,
  connections,
  currentInterval,
  flushCommitQueue,
  isStillLeader,
  startTimer = startLeaderCommitTimer,
  stopTimer = stopLeaderCommitTimer,
  log = () => {}
}) {
  if (shouldRunLeaderCommitInterval(localPeerId, connections)) {
    if (!currentInterval) {
      log('[PeerJS] Starting leader commit interval');
      return startTimer(flushCommitQueue, isStillLeader);
    }

    return currentInterval;
  }

  if (currentInterval) {
    log('[PeerJS] Stopping leader commit interval - no peers or not leader');
    return stopTimer(currentInterval);
  }

  return currentInterval;
}
