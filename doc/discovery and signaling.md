# Discovery and Signaling in SkyGit

## Overview
SkyGit establishes a persistent peer-to-peer mesh using WebRTC data channels between all online users in a GitHub repository. All real-time communication—including chat, presence, and call signaling—flows over these channels. GitHub Discussions or a `.messages/presence.json` file is used only for initial peer discovery and connection bootstrapping.

## 1. Presence and Peer Discovery
- A single repo-wide Discussion (e.g., “SkyGit Presence: <repo>”) or `.messages/presence.json` file is used for presence.
- Each client posts a "heartbeat" (username, session ID, timestamp, signaling info) at regular intervals.
- Clients poll this channel/file to maintain a list of currently online peers.
- Example presence data:
```json
{
  "username": "octocat",
  "session_id": "uuid",
  "last_seen": "2025-04-16T00:00:00Z",
  "signaling_info": {
    "offer": "...",
    "ice_candidates": ["..."]
  }
}
```

## 2. Peer Connection Manager
- Each client maintains a map of active peer connections for every online user in the repo.
- For each peer, a persistent WebRTC data channel is established and kept alive.
- All real-time chat, presence, and call signaling flows over this channel.
- Initial signaling (SDP/ICE) is exchanged via the presence channel if no data channel exists.

## 3. Real-Time Messaging and Call Signaling
- All real-time messages (chat, presence, signaling) are sent over the data channel.
- Message envelope example:
```json
{
  "type": "chat" | "presence" | "signal" | "custom",
  "from": "octocat",
  "to": "otheruser" | null,
  "timestamp": "...",
  "payload": { ... }
}
```
- For calls, SDP/ICE is sent over the data channel. If the channel is not yet open, fallback to the presence channel for signaling.

## 4. UI/UX Implications
- Users see all online peers in the repo and can message or call them instantly.
- Connection status is shown for each peer.

## 5. Fallbacks and Error Handling
- If a data channel fails, the client attempts to reconnect and, if needed, uses the presence channel for initial signaling.
- If a peer misses heartbeats, they are considered offline.
- If GitHub API limits are hit, polling frequency is reduced and the user is notified.

## 6. Migration Plan
- Implement the presence channel and heartbeat logic.
- Build the peer connection manager.
- Refactor chat and signaling to use data channels.
- Update UI to show online users and connection status.
- Deprecate per-conversation signaling.

## 7. Leader Election and Commit Process
- A single leader is elected among online peers (lexicographically smallest username).
- **Leader responsibilities:**
  - Commits conversation messages to the repository.
  - Flushes all pending conversation commits every 10 minutes.
  - Immediately flushes queue when closing their browser or disconnecting.
  - On becoming leader, flushes and merges any local pending queue with what has already been committed.
- **Non-leaders:**
  - Maintain local state and transmit messages via WebRTC to the leader.
- This ensures no message is left uncommitted for more than 10 minutes, and pending messages are not lost if the leader exits unexpectedly.
