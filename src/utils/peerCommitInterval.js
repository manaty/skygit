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
