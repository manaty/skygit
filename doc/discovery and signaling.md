# Discovery and Signaling in SkyGit

SkyGit uses PeerJS for WebRTC signaling and peer-to-peer connections, with GitHub files for peer discovery.

## PeerJS Architecture
- Uses PeerJS infrastructure for WebRTC signaling (no more GitHub Discussions needed)
- Automatic handling of SDP/ICE candidate exchange
- Built-in NAT traversal and connection establishment
- Simplified peer connection management

## Peer Discovery
- A GitHub file `.skygit/active-peers.json` is managed by `peerJsManager.js`
- Peers register themselves with heartbeats every 15 seconds:
  ```json
  {
    "peers": [
      {
        "peerId": "repo-owner-repo-name-username-session-uuid",
        "username": "github-username", 
        "lastSeen": 1716502339232
      }
    ],
    "lastUpdated": 1716502339232
  }
  ```
- Stale peer entries (>90 seconds old) are automatically cleaned up

## Peer Connection Management
- `peerJsManager.js` maintains a `peerConnections` store for active connections
- Each peer creates connections to all other discovered peers
- Direct data channels used for real-time messaging
- Failed connections are tracked and retry attempts are throttled

## Message Flow
- Chat messages broadcast directly to all connected peers via PeerJS data channels
- No hub-and-spoke topology - full mesh connectivity
- Messages committed to GitHub for persistence by any peer
- Automatic conflict resolution handles concurrent commits

## Connection Lifecycle
1. **Initialization**: Peer connects to PeerJS signaling server with unique ID
2. **Discovery**: Peer adds itself to `.skygit/active-peers.json` and discovers others
3. **Connection**: Direct WebRTC connections established to all discovered peers
4. **Messaging**: Real-time data flows over established data channels
5. **Heartbeat**: Periodic updates to discovery file maintain presence
6. **Cleanup**: Stale entries removed, failed connections retried with backoff

## Error Handling & Resilience
- Connection failures trigger automatic retry with exponential backoff
- Recently failed peers are temporarily skipped to avoid retry storms
- Stale peer discovery entries automatically expire and are cleaned up
- Network partitions heal automatically when connectivity is restored

## Benefits Over Previous Architecture
- **Simplified**: No complex GitHub Discussion-based signaling
- **Reliable**: Purpose-built PeerJS infrastructure vs. GitHub API rate limits
- **Real-time**: Instant connection establishment without API delays
- **Scalable**: Better handling of multiple simultaneous connections
- **Maintainable**: Fewer moving parts and edge cases to handle

## Migration from GitHub Discussions
- Legacy `githubSignaling.js` and `repoPeerManager.js` replaced by `peerJsManager.js`
- No more WebRTC offer/answer/ICE candidate management in application code
- Simplified connection state management and error handling
- Removed dependency on GitHub Discussions API for real-time signaling