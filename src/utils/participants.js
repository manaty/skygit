export function buildParticipantRows({
  currentUsername,
  currentLeader = null,
  localPeerId = null,
  peerConnections = {},
  onlinePeers = []
}) {
  const userAgentCounts = Object.values(peerConnections).reduce((counts, conn) => {
    counts[conn.username] = (counts[conn.username] || 0) + 1;
    return counts;
  }, {});

  if (currentUsername) {
    userAgentCounts[currentUsername] = (userAgentCounts[currentUsername] || 0) + 1;
  }

  const usernames = Array.from(new Set([
    currentUsername,
    ...Object.values(peerConnections).map((conn) => conn.username),
    ...onlinePeers.map((peer) => peer.username)
  ].filter(Boolean)));

  return usernames.map((username) => {
    const connected = username === currentUsername ||
      Object.values(peerConnections).some((conn) =>
        conn.username === username && conn.status === 'connected'
      );

    const leader = Boolean(currentLeader && (
      (username === currentUsername && currentLeader === localPeerId) ||
      Object.entries(peerConnections).some(([peerId, conn]) =>
        conn.username === username && currentLeader === peerId
      )
    ));

    return {
      username,
      displayName: username === currentUsername ? 'You' : username,
      connected,
      leader,
      userAgentCount: userAgentCounts[username] || 0
    };
  });
}
