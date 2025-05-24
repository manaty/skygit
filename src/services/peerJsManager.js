// PeerJS-based peer discovery and messaging for SkyGit
// Replaces GitHub Discussion-based WebRTC signaling

import { Peer } from 'peerjs';
import { writable } from 'svelte/store';
import { appendMessage } from '../stores/conversationStore.js';
import { queueConversationForCommit, flushConversationCommitQueue } from '../services/conversationCommitQueue.js';
import { authStore } from '../stores/authStore.js';
import { get } from 'svelte/store';

// Map peerId -> { conn, status, username }
export const peerConnections = writable({});
// Array of connected peers for UI
export const onlinePeers = writable([]);

let localPeer = null;
let localUsername = null;
let repoFullName = null;
let sessionId = null;
let leaderCommitInterval = null;
let failedConnections = new Set(); // Track failed connection attempts

// Generate a deterministic peer ID based on repo and username
function generatePeerId(repoFullName, username, sessionId) {
  // Use repo + username + session for unique peer ID
  const base = `${repoFullName.replace('/', '-')}-${username}-${sessionId}`;
  return base.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase();
}

// Expose getter for current session id
export function getLocalSessionId() {
  return sessionId;
}

// Shutdown and cleanup
export function shutdownPeerManager() {
  console.log('[PeerJS] Shutting down peer manager');
  
  if (localPeer) {
    localPeer.destroy();
    localPeer = null;
  }
  
  peerConnections.set({});
  onlinePeers.set([]);
  failedConnections.clear();
  
  if (leaderCommitInterval) {
    clearInterval(leaderCommitInterval);
    leaderCommitInterval = null;
  }
}

// Initialize PeerJS connection
export function initializePeerManager({ _token, _repoFullName, _username, _sessionId }) {
  console.log('[PeerJS] Initializing peer manager:', { _repoFullName, _username, _sessionId });
  
  // Clean up existing connection
  shutdownPeerManager();
  
  localUsername = _username;
  repoFullName = _repoFullName;
  sessionId = _sessionId;
  
  const peerId = generatePeerId(repoFullName, localUsername, sessionId);
  console.log('[PeerJS] Generated peer ID:', peerId);
  
  // Create PeerJS instance
  localPeer = new Peer(peerId, {
    debug: 2,
    config: {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }
      ]
    }
  });
  
  localPeer.on('open', (id) => {
    console.log('[PeerJS] Connected to PeerJS server with ID:', id);
    startPeerDiscovery();
  });
  
  localPeer.on('connection', (conn) => {
    console.log('[PeerJS] ✅ Incoming connection from:', conn.peer, 'metadata:', conn.metadata);
    handleIncomingConnection(conn);
  });
  
  localPeer.on('error', (err) => {
    console.error('[PeerJS] Peer error:', err);
  });
  
  localPeer.on('disconnected', () => {
    console.log('[PeerJS] Disconnected from PeerJS server');
  });
  
  localPeer.on('close', () => {
    console.log('[PeerJS] Peer connection closed');
  });
}

// Discover and connect to other peers in the repo
function startPeerDiscovery() {
  console.log('[PeerJS] Starting peer discovery for repo:', repoFullName);
  
  // Use GitHub repo as a simple discovery mechanism
  // Store and retrieve active peer IDs from a special file
  setTimeout(() => {
    discoverRepoUsers();
  }, 1000);
  
  // Periodically refresh peer discovery
  setInterval(() => {
    discoverRepoUsers();
  }, 15000); // every 15 seconds
}

// Use GitHub repo for peer discovery
async function discoverRepoUsers() {
  console.log('[PeerJS] Discovering potential peers for repo:', repoFullName);
  
  try {
    const auth = get(authStore);
    const token = localStorage.getItem('skygit_token');
    
    if (!token || !auth?.user?.login) {
      console.log('[PeerJS] No authentication available for discovery');
      return;
    }
    
    // Try to get the current peer list from a special file in the repo
    const peerListPath = '.skygit/active-peers.json';
    const url = `https://api.github.com/repos/${repoFullName}/contents/${peerListPath}`;
    
    let currentPeers = [];
    let fileSha = null;
    
    // Try to fetch existing peer list
    try {
      const res = await fetch(url, {
        headers: { Authorization: `token ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        const content = JSON.parse(atob(data.content));
        currentPeers = content.peers || [];
        fileSha = data.sha;
        console.log('[PeerJS] Found existing peers:', currentPeers);
      }
    } catch (e) {
      console.log('[PeerJS] No existing peer list found, will create new one');
    }
    
    // Add ourselves to the list if not already present
    const ourPeerId = localPeer?.id;
    if (ourPeerId && !currentPeers.find(p => p.peerId === ourPeerId)) {
      currentPeers.push({
        peerId: ourPeerId,
        username: auth.user.login,
        lastSeen: Date.now()
      });
    }
    
    // Remove stale peers (older than 90 seconds to account for timing differences)
    const now = Date.now();
    currentPeers = currentPeers.filter(p => now - p.lastSeen < 90 * 1000);
    
    // Update our timestamp if we're in the list
    const ourEntry = currentPeers.find(p => p.peerId === ourPeerId);
    if (ourEntry) {
      ourEntry.lastSeen = now;
    }
    
    // Try to connect to other peers
    console.log('[PeerJS] Our peer ID:', ourPeerId, 'Our username:', auth.user.login);
    console.log('[PeerJS] All discovered peers:', currentPeers);
    
    for (const peer of currentPeers) {
      console.log('[PeerJS] Evaluating peer:', peer.peerId, 'username:', peer.username);
      // Only skip if it's our exact peer ID (same browser session)
      if (peer.peerId !== ourPeerId) {
        const conns = get(peerConnections);
        console.log('[PeerJS] Current connections:', Object.keys(conns));
        
        if (failedConnections.has(peer.peerId)) {
          console.log('[PeerJS] Skipping recently failed peer:', peer.peerId);
        } else if (!conns[peer.peerId]) {
          console.log('[PeerJS] 🔄 Attempting to connect to:', peer.peerId, 'username:', peer.username);
          connectToPeer(peer.peerId, peer.username);
        } else {
          console.log('[PeerJS] Already connected to:', peer.peerId);
        }
      } else {
        console.log('[PeerJS] Skipping self (same peer ID):', peer.peerId);
      }
    }
    
    // Update the peer list file
    const updatedContent = {
      peers: currentPeers,
      lastUpdated: now
    };
    
    const putUrl = fileSha ? url : url;
    const putBody = {
      message: `Update active peers for SkyGit`,
      content: btoa(JSON.stringify(updatedContent, null, 2)),
      ...(fileSha && { sha: fileSha })
    };
    
    await fetch(putUrl, {
      method: 'PUT',
      headers: {
        Authorization: `token ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(putBody)
    });
    
    console.log('[PeerJS] Updated peer list with', currentPeers.length, 'active peers');
    
  } catch (error) {
    console.error('[PeerJS] Error during peer discovery:', error);
  }
}

// Handle incoming peer connections
function handleIncomingConnection(conn) {
  console.log('[PeerJS] Setting up incoming connection from:', conn.peer);
  console.log('[PeerJS] Connection metadata:', conn.metadata);
  
  const username = conn.metadata?.username || 'Unknown';
  
  conn.on('open', () => {
    console.log('[PeerJS] ✅ Incoming connection opened from:', conn.peer, 'username:', username);
    addPeerConnection(conn, username);
  });
  
  conn.on('data', (data) => {
    console.log('[PeerJS] Received data from:', conn.peer, data);
    handlePeerMessage(data, conn.peer, username);
  });
  
  conn.on('close', () => {
    console.log('[PeerJS] Incoming connection closed from:', conn.peer);
    removePeerConnection(conn.peer);
  });
  
  conn.on('error', (err) => {
    console.error('[PeerJS] ❌ Incoming connection error from:', conn.peer, err);
    removePeerConnection(conn.peer);
  });
}

// Connect to a specific peer
export function connectToPeer(targetPeerId, username) {
  console.log('[PeerJS] Connecting to peer:', targetPeerId, 'username:', username);
  console.log('[PeerJS] Local peer ID:', localPeer?.id, 'Local peer open:', localPeer?.open);
  
  if (!localPeer) {
    console.error('[PeerJS] Local peer not initialized');
    return;
  }
  
  if (!localPeer.open) {
    console.error('[PeerJS] Local peer not connected to signaling server yet');
    return;
  }
  
  // Check if we already have a connection to this peer
  const conns = get(peerConnections);
  if (conns[targetPeerId]) {
    console.log('[PeerJS] Already have connection to:', targetPeerId);
    return;
  }
  
  console.log('[PeerJS] Initiating connection to:', targetPeerId);
  const conn = localPeer.connect(targetPeerId, {
    metadata: {
      username: localUsername,
      repo: repoFullName,
      sessionId: sessionId
    }
  });
  
  console.log('[PeerJS] Connection object created:', conn);
  
  conn.on('open', () => {
    console.log('[PeerJS] ✅ Outgoing connection opened to:', targetPeerId);
    addPeerConnection(conn, username);
  });
  
  conn.on('data', (data) => {
    console.log('[PeerJS] Received data from:', targetPeerId, data);
    handlePeerMessage(data, targetPeerId, username);
  });
  
  conn.on('close', () => {
    console.log('[PeerJS] Outgoing connection closed to:', targetPeerId);
    removePeerConnection(targetPeerId);
  });
  
  conn.on('error', (err) => {
    console.error('[PeerJS] ❌ Outgoing connection error to:', targetPeerId, err);
    removePeerConnection(targetPeerId);
    
    // Mark this peer as failed so we don't keep retrying immediately
    failedConnections.add(targetPeerId);
    setTimeout(() => {
      failedConnections.delete(targetPeerId);
    }, 60000); // Don't retry for 60 seconds
  });
  
  return conn;
}

// Add a peer connection to the store
function addPeerConnection(conn, username = null) {
  const peerId = conn.peer;
  const extractedUsername = username || conn.metadata?.username || 'Unknown';
  
  console.log('[PeerJS] Adding peer connection:', peerId, 'username:', extractedUsername);
  
  peerConnections.update(conns => {
    conns[peerId] = {
      conn: conn,
      status: 'connected',
      username: extractedUsername
    };
    return conns;
  });
  
  // Update online peers for UI
  updateOnlinePeers();
}

// Remove a peer connection from the store
function removePeerConnection(peerId) {
  console.log('[PeerJS] Removing peer connection:', peerId);
  
  peerConnections.update(conns => {
    delete conns[peerId];
    return conns;
  });
  
  updateOnlinePeers();
}

// Update the online peers store for UI
function updateOnlinePeers() {
  const conns = get(peerConnections);
  const peers = Object.entries(conns).map(([peerId, { username }]) => ({
    session_id: peerId,
    username: username,
    last_seen: Date.now()
  }));
  
  onlinePeers.set(peers);
}

// Handle messages from peers
function handlePeerMessage(data, fromPeerId, fromUsername = null) {
  const username = fromUsername || get(peerConnections)[fromPeerId]?.username || 'Unknown';
  
  console.log('[PeerJS] Handling message from:', username, data);
  
  if (!data || typeof data !== 'object') {
    console.warn('[PeerJS] Invalid message format:', data);
    return;
  }
  
  switch (data.type) {
    case 'chat':
      handleChatMessage(data, username);
      break;
    case 'presence':
      handlePresenceMessage(data, username);
      break;
    default:
      console.log('[PeerJS] Unknown message type:', data.type);
      break;
  }
}

// Handle chat messages
function handleChatMessage(msg, fromUsername) {
  console.log('[PeerJS] Received chat message from', fromUsername, ':', msg);
  
  if (!msg || !msg.conversationId || !msg.content) {
    console.warn('[PeerJS] Invalid chat message format:', msg);
    return;
  }
  
  // Add message to conversation store
  appendMessage(msg.conversationId, repoFullName, {
    id: msg.id || crypto.randomUUID(),
    sender: fromUsername,
    content: msg.content,
    timestamp: msg.timestamp || Date.now()
  });
  
  // Queue for commit (simplified - in practice you'd want leader election)
  queueConversationForCommit(repoFullName, msg.conversationId);
}

// Handle presence messages
function handlePresenceMessage(msg, fromUsername) {
  console.log('[PeerJS] Received presence message from', fromUsername, ':', msg);
  // Update UI or peer list as needed
}

// Send message to specific peer
export function sendMessageToPeer(peerId, message) {
  console.log('[PeerJS] Sending message to peer:', peerId, message);
  
  const conns = get(peerConnections);
  const peerConn = conns[peerId];
  
  if (peerConn && peerConn.conn) {
    peerConn.conn.send(message);
    console.log('[PeerJS] Message sent successfully');
  } else {
    console.warn('[PeerJS] No connection found for peer:', peerId);
  }
}

// Broadcast message to all connected peers
export function broadcastMessage(message) {
  console.log('[PeerJS] Broadcasting message to all peers:', message);
  
  const conns = get(peerConnections);
  const peerCount = Object.keys(conns).length;
  
  console.log('[PeerJS] Broadcasting to', peerCount, 'connections');
  
  Object.entries(conns).forEach(([peerId, { conn }]) => {
    if (conn) {
      try {
        conn.send(message);
        console.log('[PeerJS] Message sent to:', peerId);
      } catch (err) {
        console.error('[PeerJS] Failed to send message to:', peerId, err);
      }
    }
  });
}

// Simple leader election (lexicographically smallest peer ID)
export function getCurrentLeader() {
  const conns = get(peerConnections);
  const allPeerIds = [localPeer?.id, ...Object.keys(conns)].filter(Boolean);
  return allPeerIds.sort()[0];
}

export function isLeader() {
  return getCurrentLeader() === localPeer?.id;
}

// Start leader commit interval if we're the leader
function maybeStartLeaderCommitInterval() {
  if (isLeader()) {
    if (!leaderCommitInterval) {
      console.log('[PeerJS] Starting leader commit interval');
      leaderCommitInterval = setInterval(() => {
        if (isLeader()) {
          flushConversationCommitQueue();
        }
      }, 10 * 60 * 1000); // every 10 minutes
    }
  } else if (leaderCommitInterval) {
    console.log('[PeerJS] Stopping leader commit interval');
    clearInterval(leaderCommitInterval);
    leaderCommitInterval = null;
  }
}

// Update leader status when peers change
peerConnections.subscribe(() => {
  maybeStartLeaderCommitInterval();
});