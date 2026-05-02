export function getAvailableCallPeers(onlinePeers, localPeerId, conversation) {
  return onlinePeers.filter(peer => {
    if (peer.session_id === localPeerId) return false;

    if (conversation?.participants?.length > 0) {
      return conversation.participants.includes(peer.username);
    }

    return true;
  });
}
