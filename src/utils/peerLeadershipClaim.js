export const LEADERSHIP_CLAIM_TIMEOUT_MS = 5000;

export function createLeadershipPeerOptions() {
  return {
    debug: 0
  };
}

export function getLeadershipClaimErrorResult(error) {
  return error?.type === 'unavailable-id' ? 'taken' : 'error';
}

export function claimPeerLeadershipSlot({
  PeerClass,
  leaderId,
  onLeadershipPeer,
  onLeadershipSetup,
  timeoutMs = LEADERSHIP_CLAIM_TIMEOUT_MS,
  setTimeoutFn = setTimeout,
  clearTimeoutFn = clearTimeout
}) {
  return new Promise((resolve, reject) => {
    const leader = new PeerClass(leaderId, createLeadershipPeerOptions());
    let resolved = false;

    const settle = (callback) => {
      if (resolved) return;

      resolved = true;
      clearTimeoutFn(claimTimeout);
      callback();
    };

    const claimTimeout = setTimeoutFn(() => {
      settle(() => {
        leader.destroy();
        reject(new Error('Leadership claim timeout'));
      });
    }, timeoutMs);

    leader.on('open', (id) => {
      if (id !== leaderId) return;

      settle(() => {
        onLeadershipPeer(leader);
        onLeadershipSetup();
        resolve(true);
      });
    });

    leader.on('error', (error) => {
      settle(() => {
        if (getLeadershipClaimErrorResult(error) === 'taken') {
          resolve(false);
          return;
        }

        reject(error);
      });
    });
  });
}
