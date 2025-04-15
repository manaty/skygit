// repoPeerManager.js
// Manages persistent WebRTC data channels to all online peers in a GitHub repo

import { pollPresence, postHeartbeat } from '../repoPresence.js';
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

export function initializePeerManager({ _token, _repoFullName, _username, _sessionId }) {
  token = _token;
  repoFullName = _repoFullName;
  localUsername = _username;
  sessionId = _sessionId;
  startPresence();
}

function startPresence() {
  // Post initial heartbeat and start intervals
  postHeartbeat(token, repoFullName, localUsername, sessionId);
  heartbeatInterval = setInterval(() => {
    postHeartbeat(token, repoFullName, localUsername, sessionId);
  }, 30000); // every 30s

  presencePollInterval = setInterval(async () => {
    const peers = await pollPresence(token, repoFullName);
    onlinePeers.set(peers.filter(p => p.username !== localUsername));
    handlePeerDiscovery(peers);
    maybeStartLeaderCommitInterval();
    maybeMergeQueueOnLeaderChange();
  }, 5000); // poll every 5s
}

function stopPresence() {
  clearInterval(heartbeatInterval);
  clearInterval(presencePollInterval);
}

async function handlePeerDiscovery(peers) {
  // Maintain one connection per peer
  peerConnections.update(existing => {
    const updated = { ...existing };
    for (const peer of peers) {
      if (peer.username === localUsername) continue;
      if (!updated[peer.username]) {
        updated[peer.username] = { status: 'connecting', conn: null };
        connectToPeer(peer, updated);
      }
    }
    // Remove connections to peers no longer online
    Object.keys(updated).forEach(username => {
      if (!peers.some(p => p.username === username)) {
        if (updated[username].conn) updated[username].conn.stop();
        delete updated[username];
      }
    });
    return updated;
  });
}

// --- Leader election ---
function getCurrentLeader(peers, localUsername) {
  // Elect leader as the lexicographically smallest username among all online peers (including local user)
  const usernames = peers.map(p => p.username).concat(localUsername);
  return usernames.sort()[0];
}

function isLeader(peers, localUsername) {
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

  // Only the leader queues for commit
  const peers = get(onlinePeers);
  if (isLeader(peers, localUsername)) {
    queueConversationForCommit(repoFullName, msg.conversationId);
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

async function connectToPeer(peer, updated) {
  // Use SkyGitWebRTC to establish a persistent data channel
  const conn = new SkyGitWebRTC({
    token,
    repoFullName,
    peerUsername: peer.username,
    isPersistent: true,
    onRemoteStream: () => {},
    onSignal: (signal) => {
      // Send signaling info via presence if needed
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
    }
  });
  // Set up signaling callback for presence-based signaling
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
