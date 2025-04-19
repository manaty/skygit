// repoPeerManager.js
// Manages persistent WebRTC data channels to all online peers in a GitHub repo

import { pollPresence, postHeartbeat, markPeerForPendingRemoval, cleanupStalePeerPresence } from './repoPresence.js';
import { SkyGitWebRTC } from './webrtc.js';
import { writable } from 'svelte/store';
import { appendMessage } from '../stores/conversationStore.js';
import { queueConversationForCommit } from '../services/conversationCommitQueue.js';
import { authStore } from '../stores/authStore.js';
import { get } from 'svelte/store';

export const peerConnections = writable({}); // { username: { conn, status } }
export const onlinePeers = writable([]); // [{ username, session_id, last_seen, signaling_info }]

let localUsername = null;
let repoFullName = null;
let token = null;
let sessionId = null;
let heartbeatInterval = null;
let presencePollInterval = null;
let leaderCommitInterval = null;

// Track the current initialization context to avoid redundant mesh resets
let _currentInit = { token: null, repoFullName: null, username: null };
export function initializePeerManager({ _token, _repoFullName, _username, _sessionId }) {
  // Only initialize once per repo/token/user combination
  if (
    _currentInit.token === _token &&
    _currentInit.repoFullName === _repoFullName &&
    _currentInit.username === _username
  ) {
    return; // already initialized for this context
  }
  // Save new init context
  _currentInit = { token: _token, repoFullName: _repoFullName, username: _username };
  // Restart presence and clear existing peer connections
  stopPresence();
  peerConnections.set({});
  onlinePeers.set([]);
  console.log('[SkyGit][Presence] initializePeerManager:', { _token, _repoFullName, _username, _sessionId });
  token = _token;
  repoFullName = _repoFullName;
  localUsername = _username;
  sessionId = _sessionId;
  // Initial presence poll to determine peers and role
  pollPresence(token, repoFullName).then(peers => {
    console.log('[SkyGit][Presence] initial peers:', peers);
    const filteredPeers = peers.filter(p => p.username !== localUsername);
    onlinePeers.set(filteredPeers);
    handlePeerDiscovery(peers);
    maybeStartLeaderCommitInterval();
    maybeMergeQueueOnLeaderChange();
    if (isLeader(peers, localUsername)) {
      startLeaderPresence();
    } else {
      startNonLeaderPresenceMonitor();
    }
  }).catch(e => {
    console.error('[SkyGit][Presence] initial poll error', e);
  });
}

// Start leader presence: heartbeat and continuous presence polling
function startLeaderPresence() {
  console.log('[SkyGit][Presence] startLeaderPresence (leader) for repo:', repoFullName, 'as', localUsername, 'session', sessionId);
  // Post initial heartbeat
  postHeartbeat(token, repoFullName, localUsername, sessionId);
  heartbeatInterval = setInterval(() => {
    postHeartbeat(token, repoFullName, localUsername, sessionId);
  }, 30000); // every 30s

  presencePollInterval = setInterval(async () => {
    const peers = await pollPresence(token, repoFullName);
    console.log('[SkyGit][Presence] [Leader] polled peers:', peers);
    onlinePeers.set(peers.filter(p => p.username !== localUsername));
    handlePeerDiscovery(peers);
    maybeStartLeaderCommitInterval();
    maybeMergeQueueOnLeaderChange();
  }, 5000); // poll every 5s
}

// Start non-leader presence monitor: fallback polling until connected to leader
function startNonLeaderPresenceMonitor() {
  console.log('[SkyGit][Presence] startNonLeaderPresenceMonitor for repo:', repoFullName, 'as', localUsername, 'session', sessionId);
  // Define poll function
  const poll = async () => {
    const peers = await pollPresence(token, repoFullName);
    console.log('[SkyGit][Presence] [Non-Leader] polled peers:', peers);
    onlinePeers.set(peers.filter(p => p.username !== localUsername));
    handlePeerDiscovery(peers);
  };
  // Initial poll
  poll().catch(e => console.error('[SkyGit][Presence] non-leader initial poll error', e));
  // Poll periodically
  presencePollInterval = setInterval(() => {
    poll().catch(e => console.error('[SkyGit][Presence] non-leader poll error', e));
  }, 5000);
  // Monitor peerConnections to stop polling once connected to leader
  const unsub = peerConnections.subscribe(conns => {
    const isConnected = Object.values(conns).some(c => c.status === 'connected');
    if (isConnected && presencePollInterval) {
      console.log('[SkyGit][Presence] [Non-Leader] connected to leader, stopping presence polling');
      clearInterval(presencePollInterval);
      presencePollInterval = null;
      unsub();
    }
  });
}

function stopPresence() {
  console.log('[SkyGit][Presence] stopPresence');
  clearInterval(heartbeatInterval);
  clearInterval(presencePollInterval);
}

async function handlePeerDiscovery(peers) {
  // Star topology: leader connects to all peers; non-leader only connects to leader
  peerConnections.update(existing => {
    const updated = { ...existing };
    const leader = getCurrentLeader(peers, localUsername);
    if (localUsername === leader) {
      // I am leader: ensure connections to all other peers
      for (const peer of peers) {
        if (peer.username === localUsername) continue;
        if (!updated[peer.username]) {
          updated[peer.username] = { status: 'connecting', conn: null };
          connectToPeer(peer, updated);
        }
      }
      // Remove connections to now-offline peers
      Object.keys(updated).forEach(username => {
        if (username === localUsername) return;
        if (!peers.some(p => p.username === username)) {
          if (updated[username].conn) updated[username].conn.stop();
          delete updated[username];
        }
      });
    } else {
      // I am non-leader: only connect to the leader
      const leaderPeer = peers.find(p => p.username === leader);
      // Drop any connections except to leader
      Object.keys(updated).forEach(username => {
        if (username !== leader) {
          if (updated[username].conn) updated[username].conn.stop();
          delete updated[username];
        }
      });
      // Connect to leader if present
      if (leaderPeer && !updated[leader]) {
        updated[leader] = { status: 'connecting', conn: null };
        connectToPeer(leaderPeer, updated);
      }
    }
    return updated;
  });

  // Distributed presence cleanup: mark and delete unreachable peers
  for (const peer of peers) {
    if (peer.username === localUsername) continue;
    // If the peer is in the list but we have no connection, try to mark for removal
    const conns = get(peerConnections);
    const isConnected = conns[peer.username] && conns[peer.username].status === 'connected';
    if (!isConnected) {
      // Mark the peer for pending removal by us
      markPeerForPendingRemoval(token, repoFullName, peer.username, peer.session_id, localUsername);
      // After 1 minute, try to clean up if still not updated
      setTimeout(() => {
        cleanupStalePeerPresence(token, repoFullName, peer.username, peer.session_id);
      }, 60000);
    }
  }
}

// --- Leader election ---
export function getCurrentLeader(peers, localUsername) {
  // Elect leader as the lexicographically smallest username among all online peers (including local user)
  const usernames = peers.map(p => p.username).concat(localUsername);
  return usernames.sort()[0];
}

export function isLeader(peers, localUsername) {
  return getCurrentLeader(peers, localUsername) === localUsername;
}

// --- Handler stubs ---
function handleChatMessage(msg, fromUsername) {
  // Expect msg: { type: 'chat', conversationId, content, timestamp }
  if (!msg || !msg.conversationId || !msg.content) return;
  // Use 'fromUsername' as sender
  appendMessage(msg.conversationId, repoFullName, {
    id: msg.id || crypto.randomUUID(),
    sender: fromUsername,
    content: msg.content,
    timestamp: msg.timestamp || Date.now()
  });

  // Only the leader queues for commit and rebroadcasts chat
  const peersList = get(onlinePeers);
  if (isLeader(peersList, localUsername)) {
    // Schedule GitHub commit
    queueConversationForCommit(repoFullName, msg.conversationId);
    // Relay chat message to other peers (star topology)
    peerConnections.update(conns => {
      Object.entries(conns).forEach(([username, { conn }]) => {
        if (username !== fromUsername && conn && conn.dataChannel) {
          conn.send({ type: 'chat', ...msg });
        }
      });
      return conns;
    });
  }
}

function handlePresenceMessage(msg, fromUsername) {
  // Expect msg: { type: 'presence', onlinePeers }
  // Update the onlinePeers Svelte store if provided
  if (msg && Array.isArray(msg.onlinePeers)) {
    onlinePeers.set(msg.onlinePeers);
  }
  // Optionally log for debug
  // console.log('Presence update from', fromUsername, msg);
}

function handleSignalMessage(msg, fromUsername) {
  // Expect msg: { type: 'signal', subtype, ... }
  // Route call signaling messages to the correct peer connection
  if (!msg || !msg.subtype) return;
  // Find the peer connection for fromUsername
  peerConnections.update(conns => {
    const peer = conns[fromUsername]?.conn;
    if (peer && typeof peer.handleSignal === 'function') {
      peer.handleSignal(msg);
    }
    return conns;
  });
}

// --- File sharing handler ---
function handleFileReceived(meta, blob, received, total) {
  // Progress indicator
  if (typeof window !== 'undefined' && window.skygitFileReceiveProgress) {
    window.skygitFileReceiveProgress(meta, received, total);
  }
  // Optionally: emit event, update UI, or save to downloads
  // For now, just log and trigger a download
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = meta.name;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 2000);
}

async function connectToPeer(peer, updated) {
  // Use SkyGitWebRTC to establish a persistent data channel
  const conn = new SkyGitWebRTC({
    token,
    repoFullName,
    peerUsername: peer.username,
    isPersistent: true,
    onRemoteStream: () => {},
    onSignal: (signal) => {
      postHeartbeat(token, repoFullName, localUsername, sessionId, signal);
    },
    onDataChannelMessage: (msg) => {
      if (!msg || typeof msg !== 'object') return;
      switch (msg.type) {
        case 'chat':
          handleChatMessage(msg, peer.username);
          break;
        case 'presence':
          handlePresenceMessage(msg, peer.username);
          break;
        case 'signal':
          handleSignalMessage(msg, peer.username);
          break;
        default:
          console.log('Unknown message type:', msg);
          break;
      }
    },
    onFileReceived: (meta, blob) => {
      handleFileReceived(meta, blob, meta.totalChunks, meta.totalChunks);
    },
    onFileReceiveProgress: (meta, received, total) => {
      if (typeof window !== 'undefined' && window.skygitFileReceiveProgress) {
        window.skygitFileReceiveProgress(meta, received, total);
      }
    },
    onFileSendProgress: (meta, sent, total) => {
      if (typeof window !== 'undefined' && window.skygitFileSendProgress) {
        window.skygitFileSendProgress(meta, sent, total);
      }
    }
  });
  conn.onFileReceived = (meta, blob) => {
    handleFileReceived(meta, blob, meta.totalChunks, meta.totalChunks);
  };
  conn.onFileReceiveProgress = (meta, received, total) => {
    if (typeof window !== 'undefined' && window.skygitFileReceiveProgress) {
      window.skygitFileReceiveProgress(meta, received, total);
    }
  };
  conn.signalingCallback = (signal) => {
    postHeartbeat(token, repoFullName, localUsername, sessionId, signal);
  };
  await conn.start(true, peer.signaling_info && peer.signaling_info.offer ? peer.signaling_info : null);
  updated[peer.username] = { conn, status: 'connected' };
  peerConnections.set(updated);
}

function maybeStartLeaderCommitInterval() {
  const peers = get(onlinePeers);
  const amLeader = isLeader(peers, localUsername);
  if (amLeader) {
    if (!leaderCommitInterval) {
      leaderCommitInterval = setInterval(() => {
        const currentPeers = get(onlinePeers);
        if (isLeader(currentPeers, localUsername)) {
          import('../services/conversationCommitQueue.js').then(mod => {
            if (mod.flushConversationCommitQueue) {
              mod.flushConversationCommitQueue();
            }
          });
        }
      }, 10 * 60 * 1000); // every 10 min
      // Patch: flush on browser close if leader
      window.addEventListener('beforeunload', leaderBeforeUnloadHandler);
    }
  } else if (leaderCommitInterval) {
    clearInterval(leaderCommitInterval);
    leaderCommitInterval = null;
    window.removeEventListener('beforeunload', leaderBeforeUnloadHandler);
  }
}

function leaderBeforeUnloadHandler(e) {
  // Only flush if still leader at the time of unload
  const peers = get(onlinePeers);
  if (isLeader(peers, localUsername)) {
    import('../services/conversationCommitQueue.js').then(mod => {
      if (mod.flushConversationCommitQueue) {
        mod.flushConversationCommitQueue();
      }
    });
  }
}

// --- Merge local queue with committed conversations on new leader election ---
let lastLeaderStatus = false;
function maybeMergeQueueOnLeaderChange() {
  const peers = get(onlinePeers);
  const amLeader = isLeader(peers, localUsername);
  if (amLeader && !lastLeaderStatus) {
    // Just became leader: merge queue
    import('../services/conversationCommitQueue.js').then(mod => {
      if (mod.flushConversationCommitQueue) {
        mod.flushConversationCommitQueue(); // flushes all pending
      }
    });
  }
  lastLeaderStatus = amLeader;
}

export function sendMessageToPeer(username, message) {
  peerConnections.update(conns => {
    if (conns[username] && conns[username].conn && conns[username].conn.dataChannel) {
      conns[username].conn.send(message);
    }
    return conns;
  });
}

export function broadcastMessage(message) {
  peerConnections.update(conns => {
    Object.values(conns).forEach(({ conn }) => {
      if (conn && conn.dataChannel) {
        conn.send(message);
      }
    });
    return conns;
  });
}

export function shutdownPeerManager() {
  stopPresence();
  peerConnections.update(conns => {
    Object.values(conns).forEach(({ conn }) => conn && conn.stop && conn.stop());
    return {};
  });
}
