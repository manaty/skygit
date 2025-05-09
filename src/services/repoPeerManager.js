// repoPeerManager.js
// Manages persistent WebRTC data channels to all online peers in a GitHub repo

import { pollPresence, postHeartbeat, markPeerForPendingRemoval, cleanupStalePeerPresence } from './repoPresence.js';
import { SkyGitWebRTC } from './webrtc.js';
import { writable } from 'svelte/store';
import { appendMessage } from '../stores/conversationStore.js';
import { queueConversationForCommit } from '../services/conversationCommitQueue.js';
import { authStore } from '../stores/authStore.js';
import { get } from 'svelte/store';

// Map session_id -> { conn, status, username }
export const peerConnections = writable({});
// Array of peer presence objects for UI (excluding local session)
export const onlinePeers = writable([]);

let localUsername = null;
let repoFullName = null;
let token = null;
let sessionId = null;

// Expose getter for current session id so that UI components can use it
export function getLocalSessionId() {
  return sessionId;
}
let heartbeatInterval = null;
let presencePollInterval = null;
let leaderCommitInterval = null;

// Expose a way for UI to stop presence polling and tear down connections
export function shutdownPeerManager() {
  stopPresence();
  peerConnections.set({});
  onlinePeers.set([]);
  clearInterval(leaderCommitInterval);
  leaderCommitInterval = null;
  _currentInit = { token: null, repoFullName: null, username: null };
}

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
    if (isLeader(peers, sessionId)) {
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
    onlinePeers.set(peers.filter(p => p.session_id !== sessionId));
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
    onlinePeers.set(peers.filter(p => p.session_id !== sessionId));
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
    const leader = getCurrentLeader(peers, sessionId);
    if (sessionId === leader) {
      // I am leader: ensure connections to all other peers
      for (const peer of peers) {
        if (peer.session_id === sessionId) continue;
        if (!updated[peer.session_id]) {
          updated[peer.session_id] = { status: 'connecting', conn: null, username: peer.username };
          connectToPeer(peer, updated);
        }
      }
      // Remove connections to now-offline peers
      Object.keys(updated).forEach(sid => {
        if (sid === sessionId) return;
        if (!peers.some(p => p.session_id === sid)) {
          if (updated[sid].conn) updated[sid].conn.stop();
          delete updated[sid];
        }
      });
    } else {
      // I am non-leader: only connect to the leader
      const leaderPeer = peers.find(p => p.session_id === leader);
      // Drop any connections except to leader
      Object.keys(updated).forEach(sid => {
        if (sid !== leader) {
          if (updated[sid].conn) updated[sid].conn.stop();
          delete updated[sid];
        }
      });
      // Connect to leader if present
      if (leaderPeer && !updated[leader]) {
        updated[leader] = { status: 'connecting', conn: null, username: leaderPeer.username };
        connectToPeer(leaderPeer, updated);
      }
    }
    return updated;
  });

  // Distributed presence cleanup: mark and delete unreachable peers
  for (const peer of peers) {
    if (peer.session_id === sessionId) continue;
    // If the peer is in the list but we have no connection, try to mark for removal
    const conns = get(peerConnections);
    const isConnected = conns[peer.session_id] && conns[peer.session_id].status === 'connected';
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
export function getCurrentLeader(peers, localSessionId) {
  // Elect leader as the lexicographically smallest session_id among all peers (includes local session)
  const ids = peers.map(p => p.session_id).concat(localSessionId);
  return ids.sort()[0];
}

export function isLeader(peers, localSessionId) {
  return getCurrentLeader(peers, localSessionId) === localSessionId;
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
      Object.values(conns).forEach(({ conn, username }) => {
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
    const found = Object.values(conns).find(c => c.username === fromUsername);
    const peer = found?.conn;
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
  updated[peer.session_id] = { conn, status: 'connected', username: peer.username };
  peerConnections.set(updated);
}

function maybeStartLeaderCommitInterval() {
  const peers = get(onlinePeers);
  const amLeader = isLeader(peers, sessionId);
  if (amLeader) {
    if (!leaderCommitInterval) {
      leaderCommitInterval = setInterval(() => {
        const currentPeers = get(onlinePeers);
        if (isLeader(currentPeers, sessionId)) {
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
  if (isLeader(peers, sessionId)) {
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
  const amLeader = isLeader(peers, sessionId);
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

export function sendMessageToPeer(peerSessionId, message) {
  peerConnections.update(conns => {
    if (conns[peerSessionId] && conns[peerSessionId].conn && conns[peerSessionId].conn.dataChannel) {
      conns[peerSessionId].conn.send(message);
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


