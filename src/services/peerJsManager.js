// PeerJS-based peer discovery and messaging for SkyGit
// Replaces GitHub Discussion-based WebRTC signaling

import { Peer } from 'peerjs';
import { writable } from 'svelte/store';
import { appendMessage, appendMessages, conversations } from '../stores/conversationStore.js';
import { queueConversationForCommit, flushConversationCommitQueue } from '../services/conversationCommitQueue.js';
import { authStore } from '../stores/authStore.js';
import { updateContact, setLastMessage, loadContacts } from '../stores/contactsStore.js';
import { get } from 'svelte/store';
import { getRecentHashes, findCommonAncestor } from '../utils/messageHash.js';

// Map peerId -> { conn, status, username }
export const peerConnections = writable({});
// Array of connected peers for UI
export const onlinePeers = writable([]);
// Map sessionId -> { isTyping: boolean, lastTypingTime: timestamp, username: string }
export const typingUsers = writable({});

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

// Expose getter for local peer ID
export function getLocalPeerId() {
  return localPeer?.id;
}

// Shutdown and cleanup
export function shutdownPeerManager() {
  console.log('[PeerJS] Shutting down peer manager');

  // Clean up discovery system
  if (healthCheckInterval) {
    clearInterval(healthCheckInterval);
    healthCheckInterval = null;
  }

  // Clean up leadership
  if (leadershipPeer) {
    leadershipPeer.destroy();
    leadershipPeer = null;
  }

  // Clean up leader connection
  if (connectedToLeader) {
    connectedToLeader.close();
    connectedToLeader = null;
  }

  // Reset discovery state
  isCurrentLeader = false;
  peerRegistry.clear();

  // Close all peer connections before destroying local peer
  const conns = get(peerConnections);
  Object.entries(conns).forEach(([peerId, { conn }]) => {
    console.log('[PeerJS] Closing connection to:', peerId);
    if (conn && conn.open) {
      conn.close();
    }
  });

  if (localPeer) {
    localPeer.destroy();
    localPeer = null;
  }

  // Clear all stores
  peerConnections.set({});
  onlinePeers.set([]);
  typingUsers.set({});
  failedConnections.clear();

  if (leaderCommitInterval) {
    clearInterval(leaderCommitInterval);
    leaderCommitInterval = null;
  }

  console.log('[PeerJS] Shutdown complete');
}

// Initialize PeerJS connection
export function initializePeerManager({ _token, _repoFullName, _username, _sessionId }) {
  console.log('[PeerJS] Initializing peer manager:', { _repoFullName, _username, _sessionId });

  // Check if we're already connected to this repo with the same session
  if (localPeer && repoFullName === _repoFullName && sessionId === _sessionId && localPeer.open) {
    console.log('[PeerJS] Already connected to this repo with same session, skipping initialization');
    return;
  }

  // Clean up existing connection if switching repos or sessions
  if (localPeer) {
    console.log('[PeerJS] Switching from', repoFullName, 'to', _repoFullName, 'or session changed');
    shutdownPeerManager();
  }

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
    initializeCallHandling();
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
  console.log('[PeerJS] Peer manager initialized for repo:', repoFullName);
  console.log('[PeerJS] Peer ID:', localPeer.id);

  // Start the refined discovery leadership system
  initializeDiscoverySystem();
}

// Discovery Leadership System
// Leadership state
let isCurrentLeader = false;
let leadershipPeer = null;
let connectedToLeader = null;
let peerRegistry = new Map();
let healthCheckInterval = null;

async function initializeDiscoverySystem() {
  const auth = get(authStore);
  if (!auth?.user?.login) {
    console.log('[Discovery] No GitHub auth available');
    return;
  }

  // Create single leader ID based on organization
  const orgId = repoFullName.split('/')[0]; // Extract org/owner from repo
  const leaderId = `skygit_discovery_${orgId}`;
  console.log('[Discovery] Initializing for org:', orgId, 'Leader ID:', leaderId);

  // Load existing contacts for this organization
  loadContacts(orgId);

  // First, try to connect to existing leader
  const connected = await tryConnectToLeader(leaderId);
  console.log('[Discovery] Connection attempt result:', connected);

  if (!connected) {
    console.log('[Discovery] No leader found, attempting to become leader');
    // No leader found, attempt to become one
    await attemptLeadership(leaderId, orgId);
  }

  // Start periodic health checks regardless of role
  console.log('[Discovery] Starting health check system');
  startHealthCheckSystem(orgId);
}

async function tryConnectToLeader(leaderId) {
  console.log('[Discovery] Attempting to connect to leader:', leaderId);

  try {
    const conn = await connectToPeerWithTimeout(leaderId, 3000);

    if (conn) {
      console.log('[Discovery] ✅ Connected to leader');
      connectedToLeader = conn;
      setupLeaderConnection(conn);
      return true;
    }
  } catch (error) {
    console.log('[Discovery] Leader unavailable:', error.message);
  }

  return false;
}

function connectToPeerWithTimeout(peerId, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const conn = localPeer.connect(peerId, {
      metadata: { username: localUsername, type: 'discovery' }
    });

    let resolved = false;

    const timer = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        conn.close();
        reject(new Error('Connection timeout'));
      }
    }, timeout);

    conn.on('open', () => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timer);
        resolve(conn);
      }
    });

    conn.on('error', (err) => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timer);
        reject(err);
      }
    });
  });
}

async function attemptLeadership(leaderId, orgId) {
  console.log('[Discovery] Attempting to claim leadership:', leaderId);

  try {
    const success = await claimLeadershipSlot(leaderId, orgId);
    if (success) {
      console.log('[Discovery] 👑 Became leader');
      isCurrentLeader = true;
    } else {
      console.log('[Discovery] Leadership already taken, operating as regular peer');
    }
  } catch (error) {
    console.log('[Discovery] Failed to claim leadership:', error.message);
  }
}

function claimLeadershipSlot(leaderId, orgId) {
  return new Promise((resolve, reject) => {
    // Try to create peer with specific leader ID
    const leader = new Peer(leaderId, {
      debug: 0 // Reduce PeerJS debug noise
    });

    let resolved = false;

    // Timeout for leadership claim
    const claimTimeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        leader.destroy();
        reject(new Error('Leadership claim timeout'));
      }
    }, 5000);

    leader.on('open', (id) => {
      if (!resolved && id === leaderId) {
        resolved = true;
        clearTimeout(claimTimeout);

        // Successfully claimed leadership
        leadershipPeer = leader;
        setupLeadershipRole(orgId);
        resolve(true);
      }
    });

    leader.on('error', (err) => {
      if (!resolved) {
        resolved = true;
        clearTimeout(claimTimeout);

        if (err.type === 'unavailable-id') {
          // Leadership is already taken
          resolve(false);
        } else {
          reject(err);
        }
      }
    });
  });
}

function setupLeadershipRole(orgId) {
  console.log('[Discovery] Setting up leadership responsibilities');

  // Register ourselves in the peer registry as the leader
  peerRegistry.set(localPeer.id, {
    username: localUsername,
    conversations: [repoFullName],
    lastSeen: Date.now(),
    connection: null, // Leaders don't have a connection to themselves
    isLeader: true
  });

  console.log('[Discovery] Leader registered self in peer registry');

  // Handle incoming connections from peers seeking discovery
  leadershipPeer.on('connection', (conn) => {
    console.log('[Discovery] New peer connected to leader:', conn.peer);
    setupPeerConnection(conn);
  });

  // Start leader maintenance tasks
  startLeaderMaintenanceTasks();
}

function setupPeerConnection(conn) {
  conn.on('open', () => {
    console.log('[Discovery] Peer connection opened:', conn.peer);
  });

  conn.on('data', (data) => {
    handleLeaderMessage(data, conn);
  });

  conn.on('close', () => {
    console.log('[Discovery] Peer disconnected:', conn.peer);
    // Remove from registry
    peerRegistry.delete(conn.peer);
    broadcastPeerListUpdate();
  });

  conn.on('error', (err) => {
    console.warn('[Discovery] Peer connection error:', err);
    peerRegistry.delete(conn.peer);
  });
}

function handleLeaderMessage(data, conn) {
  switch (data.type) {
    case 'register':
      console.log('[Discovery] Registering peer:', conn.peer, 'username:', data.username);
      peerRegistry.set(conn.peer, {
        username: data.username,
        conversations: data.conversations || [],
        lastSeen: Date.now(),
        connection: conn,
        isLeader: false
      });

      // Send complete peer registry to new peer
      sendPeerRegistry(conn);

      // Notify all other peers about the new peer
      broadcastPeerListUpdate();
      break;

    case 'request_peers':
      sendPeerRegistry(conn);
      break;

    case 'update_conversations':
      const peerInfo = peerRegistry.get(conn.peer);
      if (peerInfo) {
        peerInfo.conversations = data.conversations;
        peerInfo.lastSeen = Date.now();
      }
      break;

    case 'heartbeat':
      const peer = peerRegistry.get(conn.peer);
      if (peer) {
        peer.lastSeen = Date.now();
      }
      break;

  }
}

function sendPeerRegistry(conn) {
  const peerList = Array.from(peerRegistry.entries())
    .map(([peerId, info]) => ({
      peerId,
      username: info.username,
      conversations: info.conversations,
      isLeader: info.isLeader || false,
      lastSeen: info.lastSeen
    }));

  console.log(`[Discovery] Sending complete peer registry to ${conn.peer}:`, peerList);

  conn.send({
    type: 'peer_registry',
    peers: peerList,
    orgId: repoFullName.split('/')[0]
  });
}

function sendPeerList(conn, conversationFilter) {
  const filteredPeers = Array.from(peerRegistry.entries())
    .filter(([peerId, info]) => {
      if (conversationFilter) {
        return info.conversations.some(conv => conv === conversationFilter);
      }
      return true;
    })
    .map(([peerId, info]) => ({
      peerId,
      username: info.username,
      conversations: info.conversations,
      isLeader: info.isLeader || false
    }));

  console.log(`[Discovery] Sending peer list to ${conn.peer}:`, filteredPeers);

  conn.send({
    type: 'peer_list',
    peers: filteredPeers
  });
}

function broadcastPeerListUpdate() {
  for (const [peerId, info] of peerRegistry.entries()) {
    if (info.connection && info.connection.open) {
      sendPeerList(info.connection);
    }
  }
}

function startLeaderMaintenanceTasks() {
  // Perform maintenance every 30 seconds
  setInterval(() => {
    performLeaderMaintenance();
  }, 30000);
}

function performLeaderMaintenance() {
  const now = Date.now();
  const STALE_THRESHOLD = 60000; // 1 minute

  console.log('[Discovery] Performing leader maintenance, current peers:', peerRegistry.size);

  // Remove stale peers
  for (const [peerId, info] of peerRegistry.entries()) {
    if (peerId !== localPeer.id && now - info.lastSeen > STALE_THRESHOLD) {
      console.log('[Discovery] Removing stale peer:', peerId);
      peerRegistry.delete(peerId);
      if (info.connection && info.connection.open) {
        info.connection.close();
      }
    }
  }
}

function stepDownFromLeadership() {
  console.log('[Discovery] Stepping down from leadership');

  // Notify all connected peers about leadership change
  for (const [peerId, info] of peerRegistry.entries()) {
    if (info.connection && info.connection.open) {
      info.connection.send({
        type: 'leadership_change',
        message: 'Leader stepping down, reconnect to discovery system'
      });
    }
  }

  // Cleanup leadership state
  if (leadershipPeer) {
    leadershipPeer.destroy();
    leadershipPeer = null;
  }

  isCurrentLeader = false;
  peerRegistry.clear();
}

function startHealthCheckSystem(orgId) {
  // Clear any existing interval
  if (healthCheckInterval) {
    clearInterval(healthCheckInterval);
  }

  // Check health every 10 seconds
  healthCheckInterval = setInterval(() => {
    if (isCurrentLeader) {
      // I am a leader - maintenance is handled separately
      return;
    } else if (connectedToLeader) {
      // I am connected to a leader - check if it's still alive
      checkLeaderHealth(orgId);
    } else {
      // Not connected to anyone - try to reconnect
      tryReconnectToLeader(orgId);
    }
  }, 10000);
}

function checkLeaderHealth(orgId) {
  if (!connectedToLeader || connectedToLeader.open === false) {
    console.log('[Discovery] Leader connection lost, attempting reconnection');
    connectedToLeader = null;
    tryReconnectToLeader(orgId);
    return;
  }

  // Send heartbeat to leader
  try {
    connectedToLeader.send({
      type: 'heartbeat',
      timestamp: Date.now()
    });
  } catch (error) {
    console.warn('[Discovery] Failed to send heartbeat to leader:', error);
    connectedToLeader = null;
    tryReconnectToLeader(orgId);
  }
}

async function tryReconnectToLeader(orgId) {
  const leaderId = `skygit_discovery_${orgId}`;
  const connected = await tryConnectToLeader(leaderId);

  if (!connected) {
    console.log('[Discovery] No leader available, attempting to become leader');
    await attemptLeadership(leaderId, orgId);
  }
}

function setupLeaderConnection(conn) {
  console.log('[Discovery] Setting up connection to leader');

  conn.on('data', (data) => {
    handleLeaderResponse(data);
  });

  conn.on('close', () => {
    console.log('[Discovery] Leader connection closed');
    connectedToLeader = null;
  });

  conn.on('error', (err) => {
    console.warn('[Discovery] Leader connection error:', err);
    connectedToLeader = null;
  });

  // Register with leader
  registerWithLeader(conn);
}

function registerWithLeader(conn) {
  conn.send({
    type: 'register',
    username: localUsername,
    conversations: [repoFullName], // Register for this repo's conversations
    timestamp: Date.now()
  });
}

function handleLeaderResponse(data) {
  switch (data.type) {
    case 'peer_registry':
      console.log('[Discovery] Received peer registry:', data.peers, 'for org:', data.orgId);
      updateKnownPeers(data.peers);
      storePeerRegistry(data.peers, data.orgId);
      connectToOrgPeers(data.peers);
      break;

    case 'peer_list':
      console.log('[Discovery] Received peer list:', data.peers);
      updateKnownPeers(data.peers);
      break;

    case 'leadership_change':
      console.log('[Discovery] Leadership change detected, reconnecting');
      connectedToLeader = null;
      const orgId = repoFullName.split('/')[0];
      setTimeout(() => tryReconnectToLeader(orgId), 1000);
      break;
  }
}

function storePeerRegistry(peers, orgId) {
  const orgPeers = peers.map(peer => ({
    peerId: peer.peerId,
    username: peer.username,
    conversations: peer.conversations,
    isLeader: peer.isLeader,
    lastSeen: peer.lastSeen,
    online: true // Assume online since received from leader
  }));

  // Store in localStorage
  const key = `skygit_peers_${orgId}`;
  localStorage.setItem(key, JSON.stringify(orgPeers));
  console.log('[Discovery] Stored', orgPeers.length, 'peers for org:', orgId);

  // Update contacts store with new peer registry
  orgPeers.forEach(peer => {
    updateContact(peer.username, {
      peerId: peer.peerId,
      username: peer.username,
      conversations: peer.conversations,
      isLeader: peer.isLeader,
      lastSeen: peer.lastSeen,
      online: false // Will be updated when actual connections are made
    });
  });
}

function connectToOrgPeers(peers) {
  console.log('[Discovery] Connecting to all org peers:', peers.length);

  for (const peer of peers) {
    if (peer.peerId !== localPeer.id) {
      const conns = get(peerConnections);
      if (!conns[peer.peerId] && !failedConnections.has(peer.peerId)) {
        console.log('[Discovery] 🔄 Connecting to org peer:', peer.peerId, 'username:', peer.username);
        connectToPeer(peer.peerId, peer.username);
      } else if (conns[peer.peerId]) {
        console.log('[Discovery] Already connected to peer:', peer.peerId);
      } else {
        console.log('[Discovery] Skipping failed peer:', peer.peerId);
      }
    }
  }
}

function updateKnownPeers(peers) {
  console.log('[Discovery] Processing peer list, found', peers.length, 'peers');

  // Connect to peers that are in the same conversations
  for (const peer of peers) {
    console.log('[Discovery] Processing peer:', peer.peerId, 'username:', peer.username, 'isLeader:', peer.isLeader);

    if (peer.peerId !== localPeer.id) {
      const conns = get(peerConnections);
      if (!conns[peer.peerId] && !failedConnections.has(peer.peerId)) {
        console.log('[Discovery] 🔄 Connecting to discovered peer:', peer.peerId, 'username:', peer.username);
        connectToPeer(peer.peerId, peer.username);
      } else if (conns[peer.peerId]) {
        console.log('[Discovery] Already connected to peer:', peer.peerId);
      } else {
        console.log('[Discovery] Skipping failed peer:', peer.peerId);
      }
    } else {
      console.log('[Discovery] Skipping self:', peer.peerId);
    }
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

  // Update contact online status
  updateContact(extractedUsername, {
    online: true,
    lastSeen: Date.now(),
    peerId: peerId
  });

  // Update online peers for UI
  updateOnlinePeers();

  // Sync conversation state with new peer
  syncConversationsWithPeer(peerId);
}

// Sync conversation state when a new peer connects
function syncConversationsWithPeer(peerId) {
  console.log('[PeerJS] Starting conversation sync with peer:', peerId);

  // Get all conversations we're part of
  const conversationsMap = get(conversations);
  const repoConversations = conversationsMap[repoFullName] || [];

  // Sync each conversation
  repoConversations.forEach(conversation => {
    if (conversation.messages && conversation.messages.length > 0) {
      // Get the last message hash we have
      const lastMessage = conversation.messages[conversation.messages.length - 1];
      if (lastMessage.hash) {
        console.log('[PeerJS] Requesting sync for conversation:', conversation.id, 'last hash:', lastMessage.hash);
        requestMessageSync(peerId, conversation.id, lastMessage.hash);
      }
    }
  });
}

// Remove a peer connection from the store
function removePeerConnection(peerId) {
  console.log('[PeerJS] Removing peer connection:', peerId);

  // Get username before removing connection
  const conns = get(peerConnections);
  const username = conns[peerId]?.username;

  // Remove from peerConnections
  peerConnections.update(conns => {
    delete conns[peerId];
    return conns;
  });

  // Remove from typingUsers
  typingUsers.update(users => {
    delete users[peerId];
    return users;
  });

  // Update contact offline status
  if (username) {
    updateContact(username, {
      online: false,
      lastSeen: Date.now()
    });
  }

  // If we're the leader, remove from peer registry
  if (isCurrentLeader && peerRegistry.has(peerId)) {
    console.log('[Discovery] Removing disconnected peer from registry:', peerId);
    peerRegistry.delete(peerId);
    broadcastPeerListUpdate();
  }

  // Add to failed connections temporarily to prevent immediate reconnection
  failedConnections.add(peerId);
  setTimeout(() => {
    failedConnections.delete(peerId);
  }, 5000); // Wait 5 seconds before allowing reconnection

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
      handleChatMessage(data, username, fromPeerId);
      break;
    case 'presence':
      handlePresenceMessage(data, username);
      break;
    case 'typing':
      handleTypingMessage(data, username, fromPeerId);
      break;
    case 'sync_request':
      handleSyncRequest(data, fromPeerId);
      break;
    case 'sync_request_chain':
      handleSyncRequestWithChain(data, fromPeerId);
      break;
    case 'sync_response':
      handleSyncResponse(data, fromPeerId);
      break;
    case 'sync_needs_chain':
      // Handle request for hash chain
      if (data.conversationId) {
        const conversationsMap = get(conversations);
        const repoConversations = conversationsMap[repoFullName] || [];
        const conversation = repoConversations.find(c => c.id === data.conversationId);
        if (conversation && conversation.messages) {
          const hashChain = getRecentHashes(conversation.messages, 100);
          requestSyncWithHashChain(fromPeerId, data.conversationId, hashChain);
        }
      }
      break;
    case 'messages_committed':
      handleCommittedMessages(data, fromPeerId);
      break;
    default:
      console.log('[PeerJS] Unknown message type:', data.type);
      break;
  }
}

// Handle chat messages
function handleChatMessage(msg, fromUsername, fromPeerId) {
  console.log('[PeerJS] Received chat message from', fromUsername, '(', fromPeerId, '):', msg);

  if (!msg || !msg.conversationId || !msg.content) {
    console.warn('[PeerJS] Invalid chat message format:', msg);
    return;
  }

  // Don't add messages from the exact same peer ID (prevents duplicates from same session)
  if (fromPeerId === localPeer.id) {
    console.log('[PeerJS] Ignoring message from same session');
    return;
  }

  const messageData = {
    id: msg.id || crypto.randomUUID(),
    sender: fromUsername,
    content: msg.content,
    timestamp: msg.timestamp || Date.now(),
    hash: msg.hash || null,
    in_response_to: msg.in_response_to || null
  };

  // Add message to conversation store
  appendMessage(msg.conversationId, repoFullName, messageData);

  // Update contact's last message
  setLastMessage(fromUsername, messageData);

  // Update contact online status
  updateContact(fromUsername, {
    online: true,
    lastSeen: Date.now()
  });

  // Only queue for commit if we're the conversation leader
  if (isLeader()) {
    console.log('[PeerJS] Queueing message for commit (I am leader)');
    queueConversationForCommit(repoFullName, msg.conversationId);
  } else {
    console.log('[PeerJS] Skipping commit queue (not leader), current leader:', getCurrentLeader());
  }
}

// Handle presence messages
function handlePresenceMessage(msg, fromUsername) {
  console.log('[PeerJS] Received presence message from', fromUsername, ':', msg);
  // Update UI or peer list as needed
}

// Handle typing messages
function handleTypingMessage(msg, fromUsername, fromPeerId) {
  console.log('[PeerJS] Received typing message from', fromUsername, '(', fromPeerId, '):', msg);

  if (!msg || typeof msg.isTyping !== 'boolean') {
    console.warn('[PeerJS] Invalid typing message format:', msg);
    return;
  }

  // Update typing users store by session ID
  typingUsers.update(users => {
    const updated = { ...users };
    if (msg.isTyping) {
      updated[fromPeerId] = {
        isTyping: true,
        lastTypingTime: Date.now(),
        username: fromUsername
      };
    } else {
      delete updated[fromPeerId];
    }
    return updated;
  });

  // Auto-clear typing status after 3 seconds
  if (msg.isTyping) {
    setTimeout(() => {
      typingUsers.update(users => {
        const updated = { ...users };
        const userTyping = updated[fromPeerId];
        if (userTyping && Date.now() - userTyping.lastTypingTime >= 3000) {
          delete updated[fromPeerId];
        }
        return updated;
      });
    }, 3000);
  }
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

// Broadcast message to conversation participants only
export function broadcastMessage(message, conversationId = null) {
  console.log('[PeerJS] Broadcasting message:', message, 'to conversation:', conversationId);

  const conns = get(peerConnections);
  const participantPeers = getConversationParticipants(conversationId);

  console.log('[PeerJS] Conversation participants:', participantPeers);
  console.log('[PeerJS] Available connections:', Object.keys(conns));

  if (participantPeers.length === 0) {
    console.warn('[PeerJS] No participants found for conversation:', conversationId);
    return;
  }

  let sentCount = 0;
  Object.entries(conns).forEach(([peerId, { conn, status, username }]) => {
    // Only send to peers participating in this conversation
    const isParticipant = participantPeers.some(p =>
      p.peerId === peerId || p.username === username
    );

    if (!isParticipant) {
      console.log('[PeerJS] Skipping non-participant:', peerId, username);
      return;
    }

    console.log('[PeerJS] Attempting to send to participant:', peerId, 'status:', status, 'connection open:', conn?.open);

    if (conn && status === 'connected' && conn.open) {
      try {
        conn.send(message);
        console.log('[PeerJS] ✅ Message sent to participant:', peerId, username);
        sentCount++;
      } catch (err) {
        console.error('[PeerJS] ❌ Failed to send message to:', peerId, err);
      }
    } else {
      console.warn('[PeerJS] ⚠️ Skipping participant (not connected):', peerId, 'status:', status);
    }
  });

  console.log('[PeerJS] Message broadcast completed. Sent to', sentCount, 'participants');
}

// Broadcast to all connected peers (for non-conversation messages like typing)
export function broadcastToAllPeers(message) {
  console.log('[PeerJS] Broadcasting to all connected peers:', message);

  const conns = get(peerConnections);
  const peerCount = Object.keys(conns).length;

  if (peerCount === 0) {
    console.warn('[PeerJS] No peer connections available for broadcasting!');
    return;
  }

  Object.entries(conns).forEach(([peerId, { conn, status }]) => {
    if (conn && status === 'connected' && conn.open) {
      try {
        conn.send(message);
        console.log('[PeerJS] ✅ Message sent to:', peerId);
      } catch (err) {
        console.error('[PeerJS] ❌ Failed to send message to:', peerId, err);
      }
    }
  });
}

// Get participants for a specific conversation
function getConversationParticipants(conversationId) {
  if (!conversationId) {
    console.warn('[PeerJS] No conversation ID provided, broadcasting to all peers');
    // Return all connected peers if no conversation specified
    const conns = get(peerConnections);
    return Object.entries(conns).map(([peerId, { username }]) => ({
      peerId,
      username
    }));
  }

  // Try to get participants from conversation store
  try {
    const conversationsMap = get(conversations);
    const repoConversations = conversationsMap[repoFullName] || [];
    const conversation = repoConversations.find(c => c.id === conversationId);

    if (conversation && conversation.participants) {
      console.log('[PeerJS] Found conversation participants:', conversation.participants);

      // Match participants with connected peers
      const conns = get(peerConnections);
      const participantPeers = [];

      conversation.participants.forEach(username => {
        // Find connected peer with this username
        const connEntry = Object.entries(conns).find(([peerId, { username: connUsername }]) =>
          connUsername === username
        );

        if (connEntry) {
          participantPeers.push({
            peerId: connEntry[0],
            username: username
          });
        } else {
          // Include participant even if not currently connected
          participantPeers.push({
            peerId: null,
            username: username
          });
        }
      });

      return participantPeers;
    }
  } catch (error) {
    console.error('[PeerJS] Failed to get conversation participants from store:', error);
  }

  // Fallback: get all org peers and assume they're all participants
  const orgId = repoFullName?.split('/')[0];
  if (orgId) {
    try {
      const key = `skygit_peers_${orgId}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        const peers = JSON.parse(stored);
        console.log('[PeerJS] Using all org peers as participants:', peers.length);
        return peers.map(peer => ({
          peerId: peer.peerId,
          username: peer.username
        }));
      }
    } catch (error) {
      console.error('[PeerJS] Failed to get org peers:', error);
    }
  }

  // Final fallback: return all connected peers
  console.log('[PeerJS] Using all connected peers as participants');
  const conns = get(peerConnections);
  return Object.entries(conns).map(([peerId, { username }]) => ({
    peerId,
    username
  }));
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

// Start leader commit interval if we're the leader AND have peers
function maybeStartLeaderCommitInterval() {
  const conns = get(peerConnections);
  const hasPeers = Object.keys(conns).length > 0;

  if (isLeader() && hasPeers) {
    if (!leaderCommitInterval) {
      console.log('[PeerJS] Starting leader commit interval');
      leaderCommitInterval = setInterval(() => {
        if (isLeader()) {
          flushConversationCommitQueue();
        }
      }, 10 * 60 * 1000); // every 10 minutes
    }
  } else if (leaderCommitInterval) {
    console.log('[PeerJS] Stopping leader commit interval - no peers or not leader');
    clearInterval(leaderCommitInterval);
    leaderCommitInterval = null;
  }
}

// Update leader status when peers change
peerConnections.subscribe(() => {
  maybeStartLeaderCommitInterval();
});

// Hash-based message sync protocol
export function requestMessageSync(peerId, conversationId, lastHash) {
  console.log('[PeerJS] Requesting message sync from peer:', peerId, 'conversation:', conversationId, 'lastHash:', lastHash);

  const message = {
    type: 'sync_request',
    conversationId: conversationId,
    lastHash: lastHash,
    timestamp: Date.now()
  };

  sendMessageToPeer(peerId, message);
}

// Request sync with hash chain for reconciliation
export function requestSyncWithHashChain(peerId, conversationId, hashChain) {
  console.log('[PeerJS] Requesting sync with hash chain from peer:', peerId, 'chain length:', hashChain.length);

  const message = {
    type: 'sync_request_chain',
    conversationId: conversationId,
    hashChain: hashChain, // Array of last 100 hashes, newest first
    timestamp: Date.now()
  };

  sendMessageToPeer(peerId, message);
}

// Handle sync request from peer
function handleSyncRequest(msg, fromPeerId) {
  console.log('[PeerJS] Received sync request from', fromPeerId, 'for conversation:', msg.conversationId);

  if (!msg.conversationId || !msg.lastHash) {
    console.warn('[PeerJS] Invalid sync request format:', msg);
    return;
  }

  // Get conversation messages
  const conversationsMap = get(conversations);
  const repoConversations = conversationsMap[repoFullName] || [];
  const conversation = repoConversations.find(c => c.id === msg.conversationId);

  if (!conversation || !conversation.messages) {
    console.warn('[PeerJS] Conversation not found:', msg.conversationId);
    sendMessageToPeer(fromPeerId, {
      type: 'sync_response',
      conversationId: msg.conversationId,
      messages: [],
      error: 'Conversation not found'
    });
    return;
  }

  // Find the index of the message with the requested hash
  const lastHashIndex = conversation.messages.findIndex(m => m.hash === msg.lastHash);

  if (lastHashIndex === -1) {
    console.warn('[PeerJS] Hash not found in conversation:', msg.lastHash);
    // Request hash chain for reconciliation
    sendMessageToPeer(fromPeerId, {
      type: 'sync_needs_chain',
      conversationId: msg.conversationId,
      error: 'Hash not found, please send hash chain'
    });
    return;
  }

  // Send all messages after the requested hash
  const messagesToSend = conversation.messages.slice(lastHashIndex + 1);
  console.log('[PeerJS] Sending', messagesToSend.length, 'messages after hash:', msg.lastHash);

  sendMessageToPeer(fromPeerId, {
    type: 'sync_response',
    conversationId: msg.conversationId,
    messages: messagesToSend
  });
}

// Handle sync request with hash chain
function handleSyncRequestWithChain(msg, fromPeerId) {
  console.log('[PeerJS] Received sync request with hash chain from', fromPeerId);

  if (!msg.conversationId || !msg.hashChain || !Array.isArray(msg.hashChain)) {
    console.warn('[PeerJS] Invalid sync chain request format:', msg);
    return;
  }

  // Get conversation messages
  const conversationsMap = get(conversations);
  const repoConversations = conversationsMap[repoFullName] || [];
  const conversation = repoConversations.find(c => c.id === msg.conversationId);

  if (!conversation || !conversation.messages) {
    console.warn('[PeerJS] Conversation not found:', msg.conversationId);
    sendMessageToPeer(fromPeerId, {
      type: 'sync_response',
      conversationId: msg.conversationId,
      messages: [],
      error: 'Conversation not found'
    });
    return;
  }

  // Get our hash chain
  const ourHashes = getRecentHashes(conversation.messages, 100);

  // Find common ancestor
  const commonHash = findCommonAncestor(msg.hashChain, ourHashes);

  if (!commonHash) {
    console.warn('[PeerJS] No common ancestor found with peer');
    // Send all our messages
    sendMessageToPeer(fromPeerId, {
      type: 'sync_response',
      conversationId: msg.conversationId,
      messages: conversation.messages,
      fullSync: true
    });
    return;
  }

  // Find messages after common ancestor
  const commonIndex = conversation.messages.findIndex(m => m.hash === commonHash);
  const messagesToSend = conversation.messages.slice(commonIndex + 1);

  console.log('[PeerJS] Found common ancestor:', commonHash, 'sending', messagesToSend.length, 'messages');

  sendMessageToPeer(fromPeerId, {
    type: 'sync_response',
    conversationId: msg.conversationId,
    messages: messagesToSend,
    commonAncestor: commonHash
  });
}

// Handle sync response
function handleSyncResponse(msg, fromPeerId) {
  console.log('[PeerJS] Received sync response from', fromPeerId, 'with', msg.messages?.length || 0, 'messages');

  if (!msg.conversationId || !msg.messages) {
    console.warn('[PeerJS] Invalid sync response format:', msg);
    return;
  }

  // Filter and format received messages
  const validMessages = msg.messages
    .filter(message => message.content && message.sender)
    .map(message => ({
      id: message.id || crypto.randomUUID(),
      sender: message.sender,
      content: message.content,
      timestamp: message.timestamp || Date.now(),
      hash: message.hash || null,
      in_response_to: message.in_response_to || null
    }));

  if (validMessages.length > 0) {
    // Use batch append to handle deduplication efficiently
    appendMessages(msg.conversationId, repoFullName, validMessages);

    // Queue for commit if we're the leader
    if (isLeader()) {
      console.log('[PeerJS] Queueing synced messages for commit (I am leader)');
      queueConversationForCommit(repoFullName, msg.conversationId);
    }
  }
}

// Broadcast typing status to all peers
export function broadcastTypingStatus(isTyping) {
  const message = {
    type: 'typing',
    isTyping: isTyping,
    timestamp: Date.now()
  };

  // Use broadcastToAllPeers for typing status (not conversation-specific)
  broadcastToAllPeers(message);
}

// Update our conversation list (for leaders and regular peers)
export function updateMyConversations(conversations) {
  // If we're a leader, update our own registry
  if (isCurrentLeader && peerRegistry.has(localPeer.id)) {
    const myInfo = peerRegistry.get(localPeer.id);
    myInfo.conversations = conversations;
    myInfo.lastSeen = Date.now();
    console.log('[Discovery] Leader updated own conversations:', conversations);
  }

  // If we're connected to a leader, notify them
  if (connectedToLeader && connectedToLeader.open) {
    connectedToLeader.send({
      type: 'update_conversations',
      conversations: conversations
    });
    console.log('[Discovery] Notified leader of conversation update:', conversations);
  }
}

// Subscribe to committed events and broadcast to peers
import { committedEvents, markMessagesCommitted } from '../stores/conversationStore.js';

committedEvents.subscribe(event => {
  if (!event) return;

  console.log('[PeerJS] Broadcasting committed messages:', event);

  // Broadcast to all peers (or just participants if we want to be specific, but all is safer for now)
  broadcastToAllPeers({
    type: 'messages_committed',
    repoName: event.repoName,
    conversationId: event.convoId,
    messageIds: event.messageIds,
    timestamp: Date.now()
  });
});

// Handle committed messages notification
function handleCommittedMessages(msg, fromPeerId) {
  console.log('[PeerJS] Received committed messages notification from:', fromPeerId, msg);

  if (msg.repoName && msg.conversationId && msg.messageIds) {
    markMessagesCommitted(msg.conversationId, msg.repoName, msg.messageIds);
  }
}

// Add to handlePeerMessage switch
/* 
    case 'messages_committed':
      handleCommittedMessages(data, fromPeerId);
      break;
*/

// Graceful shutdown on window unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    if (isCurrentLeader) {
      stepDownFromLeadership();
    }
    shutdownPeerManager();
  });
}

// Audio/Video Call Logic
import {
  callStatus,
  localStream,
  remoteStream,
  remotePeerId,
  isVideoEnabled,
  isAudioEnabled,
  isScreenSharing,
  callStartTime,
  resetCallState
} from '../stores/callStore.js';

let currentCall = null;

// Initialize call handling
export function initializeCallHandling() {
  if (!localPeer) return;

  localPeer.on('call', async (call) => {
    console.log('[PeerJS] Incoming call from:', call.peer);

    // Auto-reject if already in a call
    if (get(callStatus) !== 'idle') {
      console.log('[PeerJS] Already in a call, rejecting incoming call');
      call.close();
      return;
    }

    callStatus.set('incoming');
    remotePeerId.set(call.peer);

    // Safety check: if we have a zombie call object, close it
    if (currentCall) {
      console.warn('[PeerJS] Closing zombie call before accepting new one');
      try { currentCall.close(); } catch (e) { console.warn('Failed to close zombie call:', e); }
    }
    currentCall = call;

    // Handle call close/error events
    call.on('close', () => {
      console.log('[PeerJS] Call closed remotely');
      endCall();
    });

    call.on('error', (err) => {
      console.error('[PeerJS] Call error:', err);
      endCall();
    });
  });
}

export async function startCall(peerId, video = true) {
  console.log('[PeerJS] Starting call to:', peerId, 'video:', video);

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: video,
      audio: true
    });

    localStream.set(stream);
    callStatus.set('calling');
    remotePeerId.set(peerId);
    isVideoEnabled.set(video);

    const call = localPeer.call(peerId, stream, {
      metadata: {
        username: localUsername,
        type: 'call'
      }
    });

    currentCall = call;
    setupCallEvents(call);

  } catch (err) {
    console.error('[PeerJS] Failed to get local stream:', err);
    alert('Could not access camera/microphone. Please check permissions.');
    resetCallState();
  }
}

export async function answerCall() {
  console.log('[PeerJS] Answering call');

  if (!currentCall) return;

  // Prevent double-answering
  if (get(callStatus) === 'connected' || get(callStatus) === 'connecting') {
    console.warn('[PeerJS] Already connected or connecting, ignoring answerCall');
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });

    localStream.set(stream);
    currentCall.answer(stream);
    setupCallEvents(currentCall);

  } catch (err) {
    console.error('[PeerJS] Failed to get local stream for answer:', err);
    alert('Could not access camera/microphone. Please check permissions.');
    endCall();
  }
}

function setupCallEvents(call) {
  call.on('stream', (stream) => {
    console.log('[PeerJS] Received remote stream');
    remoteStream.set(stream);
    callStatus.set('connected');
    callStartTime.set(Date.now());
  });

  call.on('close', () => {
    console.log('[PeerJS] Call closed');
    endCall();
  });

  call.on('error', (err) => {
    console.error('[PeerJS] Call error:', err);
    endCall();
  });
}

export function endCall() {
  console.log('[PeerJS] Ending call');

  if (currentCall) {
    // Remove listeners to prevent loops
    currentCall.off('close');
    currentCall.off('error');
    currentCall.close();
    currentCall = null;
  }

  const lStream = get(localStream);
  if (lStream) {
    lStream.getTracks().forEach(track => {
      track.stop();
      track.enabled = false;
    });
  }

  const rStream = get(remoteStream);
  if (rStream) {
    rStream.getTracks().forEach(track => {
      track.stop();
      track.enabled = false;
    });
  }

  resetCallState();
}

export function toggleAudio() {
  const stream = get(localStream);
  if (stream) {
    const audioTrack = stream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      isAudioEnabled.set(audioTrack.enabled);
    }
  }
}

export function toggleVideo() {
  const stream = get(localStream);
  if (stream) {
    const videoTrack = stream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      isVideoEnabled.set(videoTrack.enabled);
    }
  }
}

export async function toggleScreenShare() {
  const currentStream = get(localStream);
  const sharing = get(isScreenSharing);

  if (sharing) {
    // Stop screen sharing, switch back to camera
    try {
      const cameraStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
      });
      const newVideoTrack = cameraStream.getVideoTracks()[0];

      // Replace video track in the current stream
      const oldVideoTrack = currentStream.getVideoTracks()[0];
      if (oldVideoTrack) {
        oldVideoTrack.stop();
        currentStream.removeTrack(oldVideoTrack);
      }
      currentStream.addTrack(newVideoTrack);

      // Update the peer connection
      if (currentCall && currentCall.peerConnection) {
        const senders = currentCall.peerConnection.getSenders();
        const videoSender = senders.find(s => s.track?.kind === 'video');
        if (videoSender) {
          await videoSender.replaceTrack(newVideoTrack);
        }
      }

      isScreenSharing.set(false);
      console.log('[PeerJS] Switched back to camera');
    } catch (err) {
      console.error('[PeerJS] Failed to switch back to camera:', err);
    }
  } else {
    // Start screen sharing
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false
      });
      const screenTrack = screenStream.getVideoTracks()[0];

      // Handle user stopping screen share via browser UI
      screenTrack.onended = () => {
        toggleScreenShare(); // Switch back to camera
      };

      // Replace video track in the current stream
      const oldVideoTrack = currentStream.getVideoTracks()[0];
      if (oldVideoTrack) {
        oldVideoTrack.stop();
        currentStream.removeTrack(oldVideoTrack);
      }
      currentStream.addTrack(screenTrack);

      // Update the peer connection
      if (currentCall && currentCall.peerConnection) {
        const senders = currentCall.peerConnection.getSenders();
        const videoSender = senders.find(s => s.track?.kind === 'video');
        if (videoSender) {
          await videoSender.replaceTrack(screenTrack);
        }
      }

      isScreenSharing.set(true);
      console.log('[PeerJS] Started screen sharing');
    } catch (err) {
      console.error('[PeerJS] Failed to start screen sharing:', err);
      // User cancelled or error - don't change state
    }
  }
}