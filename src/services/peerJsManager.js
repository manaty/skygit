// PeerJS-based peer discovery and messaging for SkyGit
// Replaces GitHub Discussion-based WebRTC signaling

import { Peer } from 'peerjs';
import { writable } from 'svelte/store';
import { appendMessage, appendMessages, conversations } from '../stores/conversationStore.js';
import { queueConversationForCommit, flushConversationCommitQueue } from '../services/conversationCommitQueue.js';
import { authStore } from '../stores/authStore.js';
import { updateContact, setLastMessage, loadContacts } from '../stores/contactsStore.js';
import { get } from 'svelte/store';
import {
  buildLeaderId,
  createDiscoveryConnectionMetadata,
  createDiscoveryBootstrap,
  createHeartbeatMessage,
  createLeaderRegistryEntry,
  createLeadershipChangeMessage,
  generatePeerId,
  getOrgId,
  LEADERSHIP_RECONNECT_DELAY_MS,
  PEER_STALE_THRESHOLD_MS,
  persistOrgPeerRegistryContacts,
  processDiscoveredPeerConnections,
  removePeerFromRegistry,
  sendFilteredPeerListSnapshot,
  sendPeerRegistrySnapshot,
  sendRegisterWithLeader,
  registerPeerInRegistry,
  touchPeerRegistryHeartbeat,
  updatePeerRegistryConversations
} from '../utils/peerDiscovery.js';
import { connectPeerWithTimeout } from '../utils/peerConnection.js';
import { dispatchDiscoveryMessage } from '../utils/peerLeaderMessages.js';
import {
  getConnectedParticipants,
  findConversationParticipants,
  getParticipantFallbackOrgId,
  getStoredOrgParticipants
} from '../utils/peerParticipants.js';
import { dispatchPeerMessage, getPeerMessageType } from '../utils/peerMessages.js';
import {
  buildOnlinePeerRows,
  canSendToConnection,
  getAllBroadcastTargets,
  getConversationBroadcastTargets,
  getNonParticipantPeers,
  sendToBroadcastTargets,
  sendToPeerConnection
} from '../utils/peerBroadcast.js';
import {
  createIncomingChatMessage,
  isValidChatMessage,
  shouldIgnoreChatMessage
} from '../utils/peerChat.js';
import {
  applyTypingStatus,
  clearExpiredTypingStatus,
  createTypingStatusMessage,
  isValidTypingMessage,
  TYPING_CLEAR_DELAY_MS
} from '../utils/peerTyping.js';
import {
  createCallMediaConstraints,
  stopStreamTracks,
  switchCallToCamera,
  switchCallToScreenShare
} from '../utils/peerCallMedia.js';
import {
  applyAnsweredCallState,
  applyIncomingCallState,
  applyOutgoingCallState,
  applyRemoteStreamState,
  bindCallLifecycleEvents,
  closeCallQuietly,
  closeCurrentCall,
  createCallMetadata,
  createScreenShareEndedHandler,
  isAnswerAlreadyInProgress,
  shouldRejectIncomingCall,
  toggleFirstAudioTrack,
  toggleFirstVideoTrack
} from '../utils/peerCallLifecycle.js';
import {
  applyCommittedMessagesNotification,
  broadcastCommittedEvent,
  createCommittedMessagesMessage,
  createUpdateConversationsMessage,
  shouldBroadcastCommittedEvent
} from '../utils/peerCommitProtocol.js';
import {
  createOfflineContactUpdate,
  createOnlineContactUpdate,
  createPeerConnectionEntry,
  createPeerConnectionMetadata,
  getConnectionUsername
} from '../utils/peerConnectionState.js';
import { bindConnectionEvents, bindPeerDataConnection, bindPeerEvents } from '../utils/peerConnectionEvents.js';
import {
  clearTimer,
  closeConnection,
  closeOpenConnections,
  createPeerManagerSession,
  destroyPeer,
  isSameOpenPeerSession,
  resetPeerStores
} from '../utils/peerLifecycle.js';
import {
  closeRemovedPeerConnections,
  getLeaderHealthAction,
  isLeaderConnectionOpen,
  notifyLeadershipChange,
  pruneStalePeerRegistry,
  scheduleLeaderReconnect,
  sendLeaderHeartbeat,
  startLeaderHealthTimer,
  startLeaderMaintenanceTimer
} from '../utils/peerLeaderHealth.js';
import { claimPeerLeadershipSlot } from '../utils/peerLeadershipClaim.js';
import {
  addPeerConnectionToState,
  getConversationSyncRequests,
  getLocalPeerConnectionReadiness,
  getPeerConnectionUsername,
  hasPeerConnection,
  markPeerConnectionFailed,
  OUTGOING_CONNECTION_RETRY_DELAY_MS,
  REMOVED_CONNECTION_RETRY_DELAY_MS,
  removePeerConnectionFromState,
  removePeerTypingUser
} from '../utils/peerConnectionLifecycle.js';
import {
  getCurrentLeaderId,
  isLocalPeerLeader,
  shouldRunLeaderCommitInterval,
  startLeaderCommitTimer,
  stopLeaderCommitTimer
} from '../utils/peerCommitInterval.js';
import {
  applyLeaderConversationUpdate,
  notifyLeaderOfConversations,
  shouldNotifyLeaderOfConversations
} from '../utils/peerConversationUpdates.js';
import {
  createSyncRequest,
  createSyncRequestChain,
  createSyncChainRequestForNeed,
  createSyncResponseForChainRequest,
  createSyncResponseForRequest,
  findRepoConversation,
  getNormalizedSyncResponseMessages,
  getSyncResponseDeliveryType,
  isValidSyncChainRequestMessage,
  isValidSyncRequestMessage,
  isValidSyncResponseMessage
} from '../utils/peerSync.js';

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
  // Clean up discovery system
  healthCheckInterval = clearTimer(healthCheckInterval);

  // Clean up leadership
  leadershipPeer = destroyPeer(leadershipPeer);

  // Clean up leader connection
  connectedToLeader = closeConnection(connectedToLeader);

  // Reset discovery state
  isCurrentLeader = false;
  peerRegistry.clear();

  // Close all peer connections before destroying local peer
  const conns = get(peerConnections);
  closeOpenConnections(conns);

  localPeer = destroyPeer(localPeer);

  // Clear all stores
  resetPeerStores({ peerConnections, onlinePeers, typingUsers });
  failedConnections.clear();

  leaderCommitInterval = clearTimer(leaderCommitInterval);
}

// Initialize PeerJS connection
export function initializePeerManager({ _token, _repoFullName, _username, _sessionId }) {
  console.log('[PeerJS] Initializing peer manager:', { _repoFullName, _username, _sessionId });

  // Check if we're already connected to this repo with the same session
  if (isSameOpenPeerSession(localPeer, repoFullName, sessionId, _repoFullName, _sessionId)) {
    console.log('[PeerJS] Already connected to this repo with same session, skipping initialization');
    return;
  }

  // Clean up existing connection if switching repos or sessions
  if (localPeer) {
    console.log('[PeerJS] Switching from', repoFullName, 'to', _repoFullName, 'or session changed');
    shutdownPeerManager();
  }

  const nextSession = createPeerManagerSession(_repoFullName, _username, _sessionId, generatePeerId);
  localUsername = nextSession.username;
  repoFullName = nextSession.repoFullName;
  sessionId = nextSession.sessionId;

  console.log('[PeerJS] Generated peer ID:', nextSession.peerId);

  // Create PeerJS instance
  localPeer = new Peer(nextSession.peerId, nextSession.peerOptions);

  bindPeerEvents(localPeer, {
    open: (id) => {
      console.log('[PeerJS] Connected to PeerJS server with ID:', id);
      startPeerDiscovery();
      initializeCallHandling();
    },
    connection: (conn) => {
      console.log('[PeerJS] ✅ Incoming connection from:', conn.peer, 'metadata:', conn.metadata);
      handleIncomingConnection(conn);
    },
    error: (err) => {
      console.error('[PeerJS] Peer error:', err);
    },
    disconnected: () => {
      console.log('[PeerJS] Disconnected from PeerJS server');
    },
    close: () => {
      console.log('[PeerJS] Peer connection closed');
    }
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
  const discovery = createDiscoveryBootstrap(get(authStore), repoFullName);
  if (!discovery) {
    console.log('[Discovery] No GitHub auth available');
    return;
  }

  // Create single leader ID based on organization
  const { orgId, leaderId } = discovery;
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
  return connectPeerWithTimeout(localPeer, peerId, createDiscoveryConnectionMetadata(localUsername), timeout);
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
  return claimPeerLeadershipSlot({
    PeerClass: Peer,
    leaderId,
    onLeadershipPeer: (leader) => {
      leadershipPeer = leader;
    },
    onLeadershipSetup: () => setupLeadershipRole(orgId)
  });
}

function setupLeadershipRole(orgId) {
  console.log('[Discovery] Setting up leadership responsibilities');

  // Register ourselves in the peer registry as the leader
  peerRegistry.set(localPeer.id, createLeaderRegistryEntry(localUsername, repoFullName));

  console.log('[Discovery] Leader registered self in peer registry');

  // Handle incoming connections from peers seeking discovery
  bindPeerEvents(leadershipPeer, {
    connection: (conn) => {
      console.log('[Discovery] New peer connected to leader:', conn.peer);
      setupPeerConnection(conn);
    }
  });

  // Start leader maintenance tasks
  startLeaderMaintenanceTasks();
}

function setupPeerConnection(conn) {
  bindConnectionEvents(conn, {
    open: () => {
      console.log('[Discovery] Peer connection opened:', conn.peer);
    },
    data: (data) => {
      handleLeaderMessage(data, conn);
    },
    close: () => {
      console.log('[Discovery] Peer disconnected:', conn.peer);
      // Remove from registry
      removePeerFromRegistry(peerRegistry, conn.peer);
      broadcastPeerListUpdate();
    },
    error: (err) => {
      console.warn('[Discovery] Peer connection error:', err);
      removePeerFromRegistry(peerRegistry, conn.peer);
    }
  });
}

function handleLeaderMessage(data, conn) {
  dispatchDiscoveryMessage(data, {
    register: (message) => {
      console.log('[Discovery] Registering peer:', conn.peer, 'username:', message.username);
      registerPeerInRegistry(peerRegistry, conn.peer, message, conn);

      // Send complete peer registry to new peer
      sendPeerRegistry(conn);

      // Notify all other peers about the new peer
      broadcastPeerListUpdate();
    },
    request_peers: () => {
      sendPeerRegistry(conn);
    },
    update_conversations: (message) => {
      updatePeerRegistryConversations(peerRegistry, conn.peer, message.conversations);
    },
    heartbeat: () => {
      touchPeerRegistryHeartbeat(peerRegistry, conn.peer);
    }
  }, (messageType) => {
    console.log('[Discovery] Unknown leader message type:', messageType);
  });
}

function sendPeerRegistry(conn) {
  const peerList = sendPeerRegistrySnapshot(conn, peerRegistry, getOrgId(repoFullName));

  console.log(`[Discovery] Sending complete peer registry to ${conn.peer}:`, peerList);
}

function sendPeerList(conn, conversationFilter) {
  const filteredPeers = sendFilteredPeerListSnapshot(conn, peerRegistry, conversationFilter);

  console.log(`[Discovery] Sending peer list to ${conn.peer}:`, filteredPeers);
}

function broadcastPeerListUpdate() {
  for (const [peerId, info] of peerRegistry.entries()) {
    if (info.connection && info.connection.open) {
      sendPeerList(info.connection);
    }
  }
}

function startLeaderMaintenanceTasks() {
  startLeaderMaintenanceTimer(performLeaderMaintenance);
}

function performLeaderMaintenance() {
  const now = Date.now();

  console.log('[Discovery] Performing leader maintenance, current peers:', peerRegistry.size);

  // Remove stale peers
  const removedPeers = pruneStalePeerRegistry(peerRegistry, localPeer.id, now, PEER_STALE_THRESHOLD_MS);
  removedPeers.forEach(({ peerId }) => console.log('[Discovery] Removing stale peer:', peerId));
  closeRemovedPeerConnections(removedPeers);
}

function stepDownFromLeadership() {
  console.log('[Discovery] Stepping down from leadership');

  // Notify all connected peers about leadership change
  notifyLeadershipChange(peerRegistry, createLeadershipChangeMessage());

  // Cleanup leadership state
  leadershipPeer = destroyPeer(leadershipPeer);

  isCurrentLeader = false;
  peerRegistry.clear();
}

function startHealthCheckSystem(orgId) {
  // Clear any existing interval
  healthCheckInterval = clearTimer(healthCheckInterval);

  healthCheckInterval = startLeaderHealthTimer(() => {
    const action = getLeaderHealthAction(isCurrentLeader, connectedToLeader);
    if (action === 'skip') return;
    if (action === 'heartbeat') {
      checkLeaderHealth(orgId);
      return;
    }

    tryReconnectToLeader(orgId);
  });
}

function checkLeaderHealth(orgId) {
  if (!isLeaderConnectionOpen(connectedToLeader)) {
    console.log('[Discovery] Leader connection lost, attempting reconnection');
    connectedToLeader = null;
    tryReconnectToLeader(orgId);
    return;
  }

  // Send heartbeat to leader
  try {
    sendLeaderHeartbeat(connectedToLeader, createHeartbeatMessage());
  } catch (error) {
    console.warn('[Discovery] Failed to send heartbeat to leader:', error);
    connectedToLeader = null;
    tryReconnectToLeader(orgId);
  }
}

async function tryReconnectToLeader(orgId) {
  const leaderId = buildLeaderId(orgId);
  const connected = await tryConnectToLeader(leaderId);

  if (!connected) {
    console.log('[Discovery] No leader available, attempting to become leader');
    await attemptLeadership(leaderId, orgId);
  }
}

function setupLeaderConnection(conn) {
  console.log('[Discovery] Setting up connection to leader');

  bindConnectionEvents(conn, {
    data: (data) => {
      handleLeaderResponse(data);
    },
    close: () => {
      console.log('[Discovery] Leader connection closed');
      connectedToLeader = null;
    },
    error: (err) => {
      console.warn('[Discovery] Leader connection error:', err);
      connectedToLeader = null;
    }
  });

  // Register with leader
  registerWithLeader(conn);
}

function registerWithLeader(conn) {
  sendRegisterWithLeader(conn, localUsername, repoFullName);
}

function handleLeaderResponse(data) {
  dispatchDiscoveryMessage(data, {
    peer_registry: (message) => {
      console.log('[Discovery] Received peer registry:', message.peers, 'for org:', message.orgId);
      updateKnownPeers(message.peers);
      storePeerRegistry(message.peers, message.orgId);
      connectToOrgPeers(message.peers);
    },
    peer_list: (message) => {
      console.log('[Discovery] Received peer list:', message.peers);
      updateKnownPeers(message.peers);
    },
    leadership_change: () => {
      console.log('[Discovery] Leadership change detected, reconnecting');
      connectedToLeader = null;
      const orgId = getOrgId(repoFullName);
      scheduleLeaderReconnect(() => tryReconnectToLeader(orgId), LEADERSHIP_RECONNECT_DELAY_MS);
    }
  }, (messageType) => {
    console.log('[Discovery] Unknown leader response type:', messageType);
  });
}

function storePeerRegistry(peers, orgId) {
  const orgPeers = persistOrgPeerRegistryContacts(localStorage, orgId, peers, updateContact);
  console.log('[Discovery] Stored', orgPeers.length, 'peers for org:', orgId);
}

function connectToOrgPeers(peers) {
  console.log('[Discovery] Connecting to all org peers:', peers.length);
  processPeerConnectionStatuses(peers, 'org peer');
}

function updateKnownPeers(peers) {
  console.log('[Discovery] Processing peer list, found', peers.length, 'peers');

  peers.forEach(peer => {
    console.log('[Discovery] Processing peer:', peer.peerId, 'username:', peer.username, 'isLeader:', peer.isLeader);
  });

  processPeerConnectionStatuses(peers, 'discovered peer', true);
}

function processPeerConnectionStatuses(peers, sourceLabel, includeSelfLog = false) {
  return processDiscoveredPeerConnections({
    peers,
    localPeerId: localPeer.id,
    connections: get(peerConnections),
    failedConnections,
    sourceLabel,
    connectToPeer,
    log: console.log,
    includeSelfLog
  });
}

// Handle incoming peer connections
function handleIncomingConnection(conn) {
  console.log('[PeerJS] Setting up incoming connection from:', conn.peer);
  console.log('[PeerJS] Connection metadata:', conn.metadata);

  const username = (conn.metadata?.username || 'Unknown').toLowerCase();

  bindPeerDataConnection(conn, {
    username,
    open: (peerId, peerUsername) => {
      console.log('[PeerJS] ✅ Incoming connection opened from:', peerId, 'username:', peerUsername);
      addPeerConnection(conn, peerUsername);
    },
    data: (data, peerId, peerUsername) => {
      console.log('[PeerJS] Received data from:', peerId, data);
      handlePeerMessage(data, peerId, peerUsername);
    },
    close: (peerId) => {
      console.log('[PeerJS] Incoming connection closed from:', peerId);
      removePeerConnection(peerId);
    },
    error: (err, peerId) => {
      console.error('[PeerJS] ❌ Incoming connection error from:', peerId, err);
      removePeerConnection(peerId);
    }
  });
}

// Connect to a specific peer
export function connectToPeer(targetPeerId, username) {
  console.log('[PeerJS] Connecting to peer:', targetPeerId, 'username:', username);
  console.log('[PeerJS] Local peer ID:', localPeer?.id, 'Local peer open:', localPeer?.open);

  const readiness = getLocalPeerConnectionReadiness(localPeer);
  if (readiness === 'missing') {
    console.error('[PeerJS] Local peer not initialized');
    return;
  }

  if (readiness === 'closed') {
    console.error('[PeerJS] Local peer not connected to signaling server yet');
    return;
  }

  // Check if we already have a connection to this peer
  const conns = get(peerConnections);
  if (hasPeerConnection(conns, targetPeerId)) {
    console.log('[PeerJS] Already have connection to:', targetPeerId);
    return;
  }

  console.log('[PeerJS] Initiating connection to:', targetPeerId);
  const conn = localPeer.connect(targetPeerId, {
    metadata: createPeerConnectionMetadata(localUsername, repoFullName, sessionId)
  });

  console.log('[PeerJS] Connection object created:', conn);

  bindPeerDataConnection(conn, {
    peerId: targetPeerId,
    username,
    open: (peerId, peerUsername) => {
      console.log('[PeerJS] ✅ Outgoing connection opened to:', peerId);
      addPeerConnection(conn, peerUsername);
    },
    data: (data, peerId, peerUsername) => {
      console.log('[PeerJS] Received data from:', peerId, data);
      handlePeerMessage(data, peerId, peerUsername);
    },
    close: (peerId) => {
      console.log('[PeerJS] Outgoing connection closed to:', peerId);
      removePeerConnection(peerId);
    },
    error: (err, peerId) => {
      console.error('[PeerJS] ❌ Outgoing connection error to:', peerId, err);
      removePeerConnection(peerId);

      // Mark this peer as failed so we don't keep retrying immediately
      markPeerConnectionFailed(failedConnections, peerId, OUTGOING_CONNECTION_RETRY_DELAY_MS);
    }
  });

  return conn;
}

// Add a peer connection to the store
function addPeerConnection(conn, username = null) {
  const peerId = conn.peer;
  const extractedUsername = getConnectionUsername(conn, username);

  console.log('[PeerJS] Adding peer connection:', peerId, 'username:', extractedUsername);

  peerConnections.update(conns => {
    return addPeerConnectionToState(conns, peerId, createPeerConnectionEntry(conn, extractedUsername));
  });

  // Update contact online status
  updateContact(extractedUsername, createOnlineContactUpdate(peerId));

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
  getConversationSyncRequests(repoConversations).forEach(({ conversationId, lastHash }) => {
    console.log('[PeerJS] Requesting sync for conversation:', conversationId, 'last hash:', lastHash);
    requestMessageSync(peerId, conversationId, lastHash);
  });
}

// Remove a peer connection from the store
function removePeerConnection(peerId) {
  console.log('[PeerJS] Removing peer connection:', peerId);

  // Get username before removing connection
  const conns = get(peerConnections);
  const username = getPeerConnectionUsername(conns, peerId);

  // Remove from peerConnections
  peerConnections.update(conns => {
    return removePeerConnectionFromState(conns, peerId);
  });

  // Remove from typingUsers
  typingUsers.update(users => {
    return removePeerTypingUser(users, peerId);
  });

  // Update contact offline status
  if (username) {
    updateContact(username, createOfflineContactUpdate());
  }

  // If we're the leader, remove from peer registry
  if (isCurrentLeader && peerRegistry.has(peerId)) {
    console.log('[Discovery] Removing disconnected peer from registry:', peerId);
    peerRegistry.delete(peerId);
    broadcastPeerListUpdate();
  }

  // Add to failed connections temporarily to prevent immediate reconnection
  markPeerConnectionFailed(failedConnections, peerId, REMOVED_CONNECTION_RETRY_DELAY_MS);

  updateOnlinePeers();
}

// Update the online peers store for UI
function updateOnlinePeers() {
  const conns = get(peerConnections);
  onlinePeers.set(buildOnlinePeerRows(conns));
}

// Handle messages from peers
function handlePeerMessage(data, fromPeerId, fromUsername = null) {
  const username = fromUsername || get(peerConnections)[fromPeerId]?.username || 'Unknown';

  console.log('[PeerJS] Handling message from:', username, data);

  if (!getPeerMessageType(data)) {
    console.warn('[PeerJS] Invalid message format:', data);
    return;
  }

  dispatchPeerMessage(data, {
    chat: (message) => handleChatMessage(message, username, fromPeerId),
    presence: (message) => handlePresenceMessage(message, username),
    typing: (message) => handleTypingMessage(message, username, fromPeerId),
    sync_request: (message) => handleSyncRequest(message, fromPeerId),
    sync_request_chain: (message) => handleSyncRequestWithChain(message, fromPeerId),
    sync_response: (message) => handleSyncResponse(message, fromPeerId),
    sync_needs_chain: (message) => handleSyncNeedsChain(message, fromPeerId),
    messages_committed: (message) => handleCommittedMessages(message, fromPeerId)
  }, (messageType) => {
    console.log('[PeerJS] Unknown message type:', messageType);
  });
}

function handleSyncNeedsChain(message, fromPeerId) {
  const request = createSyncChainRequestForNeed(message, get(conversations), repoFullName);
  if (request) {
    sendMessageToPeer(fromPeerId, request);
  }
}

// Handle chat messages
function handleChatMessage(msg, fromUsername, fromPeerId) {
  console.log('[PeerJS] Received chat message from', fromUsername, '(', fromPeerId, '):', msg);

  if (!isValidChatMessage(msg)) {
    console.warn('[PeerJS] Invalid chat message format:', msg);
    return;
  }

  // Don't add messages from the exact same peer ID (prevents duplicates from same session)
  if (shouldIgnoreChatMessage(fromPeerId, localPeer.id)) {
    console.log('[PeerJS] Ignoring message from same session');
    return;
  }

  const messageData = createIncomingChatMessage(msg, fromUsername);

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

  if (!isValidTypingMessage(msg)) {
    console.warn('[PeerJS] Invalid typing message format:', msg);
    return;
  }

  // Update typing users store by session ID
  typingUsers.update(users => {
    return applyTypingStatus(users, fromPeerId, fromUsername, msg.isTyping);
  });

  // Auto-clear typing status after 3 seconds
  if (msg.isTyping) {
    setTimeout(() => {
      typingUsers.update(users => {
        return clearExpiredTypingStatus(users, fromPeerId);
      });
    }, TYPING_CLEAR_DELAY_MS);
  }
}

// Send message to specific peer
export function sendMessageToPeer(peerId, message) {
  console.log('[PeerJS] Sending message to peer:', peerId, message);

  const conns = get(peerConnections);

  if (sendToPeerConnection(conns, peerId, message)) {
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

  const participantTargets = getConversationBroadcastTargets(conns, participantPeers);

  getNonParticipantPeers(conns, participantPeers).forEach(({ peerId, username }) => {
    console.log('[PeerJS] Skipping non-participant:', peerId, username);
  });

  participantTargets.forEach(({ peerId, conn, status, username }) => {
    console.log('[PeerJS] Attempting to send to participant:', peerId, 'status:', status, 'connection open:', conn?.open);
    if (!canSendToConnection({ conn, status })) {
      console.warn('[PeerJS] ⚠️ Skipping participant (not connected):', peerId, 'status:', status);
    }
  });

  const sentCount = sendToBroadcastTargets(participantTargets, message, (err, peerId) => {
    console.error('[PeerJS] ❌ Failed to send message to:', peerId, err);
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

  const sentCount = sendToBroadcastTargets(getAllBroadcastTargets(conns), message, (err, peerId) => {
    console.error('[PeerJS] ❌ Failed to send message to:', peerId, err);
  });
  console.log('[PeerJS] Broadcast completed. Sent to', sentCount, 'peers');
}

// Get participants for a specific conversation
function getConversationParticipants(conversationId) {
  const conns = get(peerConnections);

  if (!conversationId) {
    console.warn('[PeerJS] No conversation ID provided, broadcasting to all peers');
    // Return all connected peers if no conversation specified
    return getConnectedParticipants(conns);
  }

  // Try to get participants from conversation store
  try {
    const conversationsMap = get(conversations);
    const participantRows = findConversationParticipants(conversationsMap, repoFullName, conversationId, conns);

    if (participantRows) {
      console.log('[PeerJS] Found conversation participants:', participantRows);
      return participantRows;
    }
  } catch (error) {
    console.error('[PeerJS] Failed to get conversation participants from store:', error);
  }

  // Fallback: get all org peers and assume they're all participants
  const orgId = getParticipantFallbackOrgId(repoFullName, getOrgId);
  if (orgId) {
    try {
      const storedParticipants = getStoredOrgParticipants(localStorage, orgId);
      if (storedParticipants) {
        console.log('[PeerJS] Using all org peers as participants:', storedParticipants.length);
        return storedParticipants;
      }
    } catch (error) {
      console.error('[PeerJS] Failed to get org peers:', error);
    }
  }

  // Final fallback: return all connected peers
  console.log('[PeerJS] Using all connected peers as participants');
  return getConnectedParticipants(conns);
}

// Simple leader election (lexicographically smallest peer ID)
export function getCurrentLeader() {
  const conns = get(peerConnections);
  return getCurrentLeaderId(localPeer?.id, conns);
}

export function isLeader() {
  return isLocalPeerLeader(localPeer?.id, get(peerConnections));
}

// Start leader commit interval if we're the leader AND have peers
function maybeStartLeaderCommitInterval() {
  const conns = get(peerConnections);

  if (shouldRunLeaderCommitInterval(localPeer?.id, conns)) {
    if (!leaderCommitInterval) {
      console.log('[PeerJS] Starting leader commit interval');
      leaderCommitInterval = startLeaderCommitTimer(flushConversationCommitQueue, isLeader);
    }
  } else if (leaderCommitInterval) {
    console.log('[PeerJS] Stopping leader commit interval - no peers or not leader');
    leaderCommitInterval = stopLeaderCommitTimer(leaderCommitInterval);
  }
}

// Update leader status when peers change
peerConnections.subscribe(() => {
  maybeStartLeaderCommitInterval();
});

// Hash-based message sync protocol
export function requestMessageSync(peerId, conversationId, lastHash) {
  console.log('[PeerJS] Requesting message sync from peer:', peerId, 'conversation:', conversationId, 'lastHash:', lastHash);

  sendMessageToPeer(peerId, createSyncRequest(conversationId, lastHash));
}

// Request sync with hash chain for reconciliation
export function requestSyncWithHashChain(peerId, conversationId, hashChain) {
  console.log('[PeerJS] Requesting sync with hash chain from peer:', peerId, 'chain length:', hashChain.length);

  sendMessageToPeer(peerId, createSyncRequestChain(conversationId, hashChain));
}

// Handle sync request from peer
function handleSyncRequest(msg, fromPeerId) {
  console.log('[PeerJS] Received sync request from', fromPeerId, 'for conversation:', msg.conversationId);

  if (!isValidSyncRequestMessage(msg)) {
    console.warn('[PeerJS] Invalid sync request format:', msg);
    return;
  }

  const response = createSyncResponseForRequest(msg, getSyncConversation(msg.conversationId));
  sendSyncResponse(fromPeerId, response, {
    conversation_not_found: () => console.warn('[PeerJS] Conversation not found:', msg.conversationId),
    sync_needs_chain: () => console.warn('[PeerJS] Hash not found in conversation:', msg.lastHash),
    messages: () => console.log('[PeerJS] Sending', response.messages.length, 'messages after hash:', msg.lastHash)
  });
}

// Handle sync request with hash chain
function handleSyncRequestWithChain(msg, fromPeerId) {
  console.log('[PeerJS] Received sync request with hash chain from', fromPeerId);

  if (!isValidSyncChainRequestMessage(msg)) {
    console.warn('[PeerJS] Invalid sync chain request format:', msg);
    return;
  }

  const response = createSyncResponseForChainRequest(msg, getSyncConversation(msg.conversationId));
  sendSyncResponse(fromPeerId, response, {
    conversation_not_found: () => console.warn('[PeerJS] Conversation not found:', msg.conversationId),
    full_sync: () => console.warn('[PeerJS] No common ancestor found with peer'),
    messages: () => console.log('[PeerJS] Found common ancestor:', response.commonAncestor, 'sending', response.messages.length, 'messages')
  });
}

function getSyncConversation(conversationId) {
  return findRepoConversation(get(conversations), repoFullName, conversationId);
}

function sendSyncResponse(peerId, response, deliveryHandlers) {
  const deliveryType = getSyncResponseDeliveryType(response);
  deliveryHandlers[deliveryType]?.();
  sendMessageToPeer(peerId, response);
}

// Handle sync response
function handleSyncResponse(msg, fromPeerId) {
  console.log('[PeerJS] Received sync response from', fromPeerId, 'with', msg.messages?.length || 0, 'messages');

  if (!isValidSyncResponseMessage(msg)) {
    console.warn('[PeerJS] Invalid sync response format:', msg);
    return;
  }

  // Filter and format received messages
  const validMessages = getNormalizedSyncResponseMessages(msg);

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
  // Use broadcastToAllPeers for typing status (not conversation-specific)
  broadcastToAllPeers(createTypingStatusMessage(isTyping));
}

// Update our conversation list (for leaders and regular peers)
export function updateMyConversations(conversations) {
  // If we're a leader, update our own registry
  if (isCurrentLeader && applyLeaderConversationUpdate(peerRegistry, localPeer.id, conversations)) {
    console.log('[Discovery] Leader updated own conversations:', conversations);
  }

  // If we're connected to a leader, notify them
  if (shouldNotifyLeaderOfConversations(connectedToLeader)) {
    notifyLeaderOfConversations(connectedToLeader, conversations, createUpdateConversationsMessage);
    console.log('[Discovery] Notified leader of conversation update:', conversations);
  }
}

// Subscribe to committed events and broadcast to peers
import { committedEvents, markMessagesCommitted } from '../stores/conversationStore.js';

committedEvents.subscribe(event => {
  if (!shouldBroadcastCommittedEvent(event)) return;

  console.log('[PeerJS] Broadcasting committed messages:', event);

  // Broadcast to all peers (or just participants if we want to be specific, but all is safer for now)
  broadcastCommittedEvent(event, broadcastToAllPeers, createCommittedMessagesMessage);
});

// Handle committed messages notification
function handleCommittedMessages(msg, fromPeerId) {
  console.log('[PeerJS] Received committed messages notification from:', fromPeerId, msg);

  applyCommittedMessagesNotification(msg, markMessagesCommitted);
}

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

  bindPeerEvents(localPeer, {
    call: async (call) => {
      console.log('[PeerJS] Incoming call from:', call.peer);

      // Auto-reject if already in a call
      if (shouldRejectIncomingCall(get(callStatus))) {
        console.log('[PeerJS] Already in a call, rejecting incoming call');
        call.close();
        return;
      }

      applyIncomingCallState({ callStatus, remotePeerId }, call);

      // Safety check: if we have a zombie call object, close it
      if (currentCall) {
        console.warn('[PeerJS] Closing zombie call before accepting new one');
        closeCallQuietly(currentCall, (error) => console.warn('Failed to close zombie call:', error));
      }
      currentCall = call;

      // Handle call close/error events
      bindCallLifecycleEvents(call, {
        close: () => {
          console.log('[PeerJS] Call closed remotely');
          endCall();
        },
        error: (err) => {
          console.error('[PeerJS] Call error:', err);
          endCall();
        }
      });
    }
  });
}

export async function startCall(peerId, video = true) {
  console.log('[PeerJS] Starting call to:', peerId, 'video:', video);

  try {
    const stream = await navigator.mediaDevices.getUserMedia(createCallMediaConstraints(video));

    applyOutgoingCallState({ localStream, callStatus, remotePeerId, isVideoEnabled }, stream, peerId, video);

    const call = localPeer.call(peerId, stream, createCallMetadata(localUsername));

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
  if (isAnswerAlreadyInProgress(get(callStatus))) {
    console.warn('[PeerJS] Already connected or connecting, ignoring answerCall');
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia(createCallMediaConstraints(true));

    applyAnsweredCallState({ localStream }, stream, currentCall);
    setupCallEvents(currentCall);

  } catch (err) {
    console.error('[PeerJS] Failed to get local stream for answer:', err);
    alert('Could not access camera/microphone. Please check permissions.');
    endCall();
  }
}

function setupCallEvents(call) {
  bindCallLifecycleEvents(call, {
    stream: (stream) => {
      console.log('[PeerJS] Received remote stream');
      applyRemoteStreamState({ remoteStream, callStatus, callStartTime }, stream);
    },
    close: () => {
      console.log('[PeerJS] Call closed');
      endCall();
    },
    error: (err) => {
      console.error('[PeerJS] Call error:', err);
      endCall();
    }
  });
}

export function endCall() {
  console.log('[PeerJS] Ending call');

  if (currentCall) {
    // Remove listeners to prevent loops
    currentCall = closeCurrentCall(currentCall);
  }

  const lStream = get(localStream);
  stopStreamTracks(lStream);

  const rStream = get(remoteStream);
  stopStreamTracks(rStream);

  resetCallState();
}

export function toggleAudio() {
  const stream = get(localStream);
  const enabled = toggleFirstAudioTrack(stream);
  if (enabled !== null) {
    isAudioEnabled.set(enabled);
  }
}

export function toggleVideo() {
  const stream = get(localStream);
  const enabled = toggleFirstVideoTrack(stream);
  if (enabled !== null) {
    isVideoEnabled.set(enabled);
  }
}

export async function toggleScreenShare() {
  const currentStream = get(localStream);
  const sharing = get(isScreenSharing);

  if (sharing) {
    // Stop screen sharing, switch back to camera
    try {
      await switchCallToCamera({
        mediaDevices: navigator.mediaDevices,
        currentStream,
        currentCall
      });

      isScreenSharing.set(false);
      console.log('[PeerJS] Switched back to camera');
    } catch (err) {
      console.error('[PeerJS] Failed to switch back to camera:', err);
    }
  } else {
    // Start screen sharing
    try {
      await switchCallToScreenShare({
        mediaDevices: navigator.mediaDevices,
        currentStream,
        currentCall,
        onScreenShareEnded: createScreenShareEndedHandler(toggleScreenShare)
      });

      isScreenSharing.set(true);
      console.log('[PeerJS] Started screen sharing');
    } catch (err) {
      console.error('[PeerJS] Failed to start screen sharing:', err);
      // User cancelled or error - don't change state
    }
  }
}
