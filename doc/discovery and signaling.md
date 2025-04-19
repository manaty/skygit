# Discovery and Signaling in SkyGit

SkyGit uses GitHub Discussions for presence heartbeats and fallback call signaling, combined with WebRTC data channels for real-time messaging.

## Presence Channel
- A GitHub Discussion titled **SkyGit Presence Channel** is managed by `repoPresence.js`.
- Clients post/update a comment with a JSON body:
  ```json
  {
    "username": "<user>",
    "session_id": "<uuid>",
    "last_seen": "<ISO timestamp>",
    "signaling_info": {...}  
  }
  ```
- Heartbeats are sent every 30 seconds; presence is polled every 5 seconds via `pollPresence()`.

## Peer Discovery & Mesh Management
- `repoPeerManager.js` listens to `onlinePeers` and maintains a `peerConnections` store.
- For each peer, it creates a `SkyGitWebRTC` connection (`webrtc.js`).
- All chat, presence, and signaling messages traverse these persistent data channels.

## Call Signaling
- A dedicated Discussion **SkyGit Signaling: <conversationId>** (via `githubSignaling.js`) carries initial SDP/ICE.
- Signaling messages are base64‑encoded in comment bodies; `postSignal()` and `pollSignals()` handle them.
- Once signaling is complete, call media flows over the WebRTC channel.

## Cleanup & Error Handling
- Presence comments support a `pendingRemovalBy` flag; stale sessions (>1 min) are cleaned via `cleanupStalePeerPresence()`.
- Failed data channels invoke reconnection logic and eventual cleanup via `repoPeerManager.js`.

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
