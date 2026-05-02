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
  createLeadershipChangeMessage,
  generatePeerId,
  getOrgId,
  LEADERSHIP_RECONNECT_DELAY_MS,
  PEER_STALE_THRESHOLD_MS,
  persistOrgPeerRegistryContacts,
  processDiscoveredPeerConnections,
  removeDisconnectedPeerFromLeaderRegistry,
  sendRegisterWithLeader
} from '../utils/peerDiscovery.js';
import {
  attemptDiscoveryLeadership,
  connectToDiscoveryLeader,
  initializePeerDiscoverySession
} from '../utils/peerDiscoveryStartup.js';
import { connectPeerWithTimeout } from '../utils/peerConnection.js';
import { handleLeaderDiscoveryResponse, processLeaderPeerMessage } from '../utils/peerLeaderMessages.js';
import { bindDiscoveryPeerConnection, setupDiscoveryLeadershipRole } from '../utils/peerLeaderRole.js';
import {
  broadcastDiscoveryPeerListUpdate,
  sendCompletePeerRegistry,
  sendDiscoveryPeerList
} from '../utils/peerLeaderBroadcast.js';
import {
  resolveConversationParticipants
} from '../utils/peerParticipants.js';
import { processPeerDataMessage } from '../utils/peerMessages.js';
import {
  buildOnlinePeerRows,
  broadcastToAllConnections,
  broadcastToConversationParticipants,
  sendToPeerConnection
} from '../utils/peerBroadcast.js';
import {
  processIncomingPeerChatMessage
} from '../utils/peerChat.js';
import {
  createTypingStatusMessage,
  processIncomingTypingMessage
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
  createPeerConnectionMetadata
} from '../utils/peerConnectionState.js';
import { bindLeaderConnectionEvents, bindPeerDataConnection, bindPeerEvents } from '../utils/peerConnectionEvents.js';
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
  getLeaderHealthAction,
  isLeaderConnectionOpen,
  performLeaderRegistryMaintenance,
  scheduleLeaderReconnect,
  sendLeaderHeartbeat,
  stepDownFromDiscoveryLeadership,
  startLeaderHealthTimer,
  startLeaderMaintenanceTimer
} from '../utils/peerLeaderHealth.js';
import { claimPeerLeadershipSlot } from '../utils/peerLeadershipClaim.js';
import {
  addPeerConnectionToState,
  getLocalPeerConnectionReadiness,
  hasPeerConnection,
  markPeerConnectionFailed,
  OUTGOING_CONNECTION_RETRY_DELAY_MS,
  processClosedPeerConnection,
  processOpenedPeerConnection,
  sendConversationSyncRequests
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
  deliverSyncResponse,
  findRepoConversation,
  isValidSyncChainRequestMessage,
  isValidSyncRequestMessage,
  processSyncResponseMessage
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
  await initializePeerDiscoverySession({
    auth: get(authStore),
    repoFullName,
    createDiscoveryBootstrap,
    loadContacts,
    connectToLeader: tryConnectToLeader,
    attemptLeadership,
    startHealthCheckSystem,
    log: console.log
  });
}

async function tryConnectToLeader(leaderId) {
  return connectToDiscoveryLeader({
    leaderId,
    connectToPeer: connectToPeerWithTimeout,
    setupLeaderConnection,
    setConnectedToLeader: (connection) => {
      connectedToLeader = connection;
    },
    log: console.log
  });
}

function connectToPeerWithTimeout(peerId, timeout = 5000) {
  return connectPeerWithTimeout(localPeer, peerId, createDiscoveryConnectionMetadata(localUsername), timeout);
}

async function attemptLeadership(leaderId, orgId) {
  await attemptDiscoveryLeadership({
    leaderId,
    orgId,
    claimLeadershipSlot,
    setCurrentLeader: (isLeader) => {
      isCurrentLeader = isLeader;
    },
    log: console.log
  });
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
  setupDiscoveryLeadershipRole({
    leadershipPeer,
    localPeerId: localPeer.id,
    localUsername,
    repoFullName,
    peerRegistry,
    setupPeerConnection,
    startLeaderMaintenanceTasks,
    log: console.log
  });
}

function setupPeerConnection(conn) {
  bindDiscoveryPeerConnection({
    connection: conn,
    peerRegistry,
    handleLeaderMessage,
    broadcastPeerListUpdate,
    log: console.log,
    warn: console.warn
  });
}

function handleLeaderMessage(data, conn) {
  processLeaderPeerMessage({
    data,
    connection: conn,
    peerRegistry,
    sendPeerRegistry,
    broadcastPeerListUpdate,
    log: console.log
  });
}

function sendPeerRegistry(conn) {
  return sendCompletePeerRegistry(conn, peerRegistry, getOrgId(repoFullName), console.log);
}

function sendPeerList(conn, conversationFilter) {
  return sendDiscoveryPeerList(conn, peerRegistry, conversationFilter, console.log);
}

function broadcastPeerListUpdate() {
  return broadcastDiscoveryPeerListUpdate(peerRegistry, sendPeerList);
}

function startLeaderMaintenanceTasks() {
  startLeaderMaintenanceTimer(performLeaderMaintenance);
}

function performLeaderMaintenance() {
  performLeaderRegistryMaintenance({
    peerRegistry,
    localPeerId: localPeer.id,
    staleThresholdMs: PEER_STALE_THRESHOLD_MS,
    log: console.log
  });
}

function stepDownFromLeadership() {
  stepDownFromDiscoveryLeadership({
    peerRegistry,
    leadershipPeer,
    leadershipChangeMessage: createLeadershipChangeMessage(),
    destroyPeer,
    setLeadershipPeer: (peer) => {
      leadershipPeer = peer;
    },
    setCurrentLeader: (isLeader) => {
      isCurrentLeader = isLeader;
    },
    log: console.log
  });
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
  bindLeaderConnectionEvents(conn, {
    data: handleLeaderResponse,
    disconnected: () => {
      connectedToLeader = null;
    },
    register: registerWithLeader,
    log: console.log,
    warn: console.warn
  });
}

function registerWithLeader(conn) {
  sendRegisterWithLeader(conn, localUsername, repoFullName);
}

function handleLeaderResponse(data) {
  handleLeaderDiscoveryResponse(data, {
    updateKnownPeers,
    storePeerRegistry,
    connectToOrgPeers,
    onLeadershipChange: () => {
      connectedToLeader = null;
      const orgId = getOrgId(repoFullName);
      scheduleLeaderReconnect(() => tryReconnectToLeader(orgId), LEADERSHIP_RECONNECT_DELAY_MS);
    },
    log: console.log
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
  processOpenedPeerConnection({
    connection: conn,
    username,
    updatePeerConnections: peerConnections.update,
    updateContact,
    updateOnlinePeers,
    syncConversationsWithPeer,
    log: console.log
  });
}

// Sync conversation state when a new peer connects
function syncConversationsWithPeer(peerId) {
  console.log('[PeerJS] Starting conversation sync with peer:', peerId);
  sendConversationSyncRequests(peerId, get(conversations), repoFullName, requestMessageSync, console.log);
}

// Remove a peer connection from the store
function removePeerConnection(peerId) {
  console.log('[PeerJS] Removing peer connection:', peerId);

  processClosedPeerConnection({
    peerId,
    connections: get(peerConnections),
    updatePeerConnections: peerConnections.update,
    updateTypingUsers: typingUsers.update,
    updateContact,
    updateOnlinePeers,
    peerRegistry,
    isCurrentLeader,
    broadcastPeerListUpdate,
    failedConnections,
    log: console.log
  });
}

// Update the online peers store for UI
function updateOnlinePeers() {
  const conns = get(peerConnections);
  onlinePeers.set(buildOnlinePeerRows(conns));
}

// Handle messages from peers
function handlePeerMessage(data, fromPeerId, fromUsername = null) {
  processPeerDataMessage({
    data,
    fromPeerId,
    fromUsername,
    connections: get(peerConnections),
    handlers: {
      chat: handleChatMessage,
      presence: handlePresenceMessage,
      typing: handleTypingMessage,
      syncRequest: handleSyncRequest,
      syncRequestChain: handleSyncRequestWithChain,
      syncResponse: handleSyncResponse,
      syncNeedsChain: handleSyncNeedsChain,
      messagesCommitted: handleCommittedMessages
    },
    log: console.log,
    warn: console.warn
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
  processIncomingPeerChatMessage({
    message: msg,
    fromUsername,
    fromPeerId,
    localPeerId: localPeer.id,
    repoFullName,
    appendMessage,
    setLastMessage,
    updateContact,
    isLeader,
    getCurrentLeader,
    queueConversationForCommit,
    log: console.log,
    warn: console.warn
  });
}

// Handle presence messages
function handlePresenceMessage(msg, fromUsername) {
  console.log('[PeerJS] Received presence message from', fromUsername, ':', msg);
  // Update UI or peer list as needed
}

// Handle typing messages
function handleTypingMessage(msg, fromUsername, fromPeerId) {
  console.log('[PeerJS] Received typing message from', fromUsername, '(', fromPeerId, '):', msg);
  processIncomingTypingMessage({
    message: msg,
    fromUsername,
    fromPeerId,
    updateTypingUsers: typingUsers.update,
    log: console.log,
    warn: console.warn
  });
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
  broadcastToConversationParticipants({
    connections: conns,
    participants: participantPeers,
    message,
    conversationId,
    log: console.log,
    warn: console.warn,
    error: console.error
  });
}

// Broadcast to all connected peers (for non-conversation messages like typing)
export function broadcastToAllPeers(message) {
  console.log('[PeerJS] Broadcasting to all connected peers:', message);

  const conns = get(peerConnections);
  broadcastToAllConnections({
    connections: conns,
    message,
    log: console.log,
    warn: console.warn,
    error: console.error
  });
}

// Get participants for a specific conversation
function getConversationParticipants(conversationId) {
  const conns = get(peerConnections);
  return resolveConversationParticipants({
    conversationId,
    connections: conns,
    conversationsMap: get(conversations),
    repoFullName,
    storage: localStorage,
    getOrgId,
    log: console.log,
    warn: console.warn,
    error: console.error
  });
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
  deliverSyncResponse(fromPeerId, response, sendMessageToPeer, {
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
  deliverSyncResponse(fromPeerId, response, sendMessageToPeer, {
    conversation_not_found: () => console.warn('[PeerJS] Conversation not found:', msg.conversationId),
    full_sync: () => console.warn('[PeerJS] No common ancestor found with peer'),
    messages: () => console.log('[PeerJS] Found common ancestor:', response.commonAncestor, 'sending', response.messages.length, 'messages')
  });
}

function getSyncConversation(conversationId) {
  return findRepoConversation(get(conversations), repoFullName, conversationId);
}

// Handle sync response
function handleSyncResponse(msg, fromPeerId) {
  console.log('[PeerJS] Received sync response from', fromPeerId, 'with', msg.messages?.length || 0, 'messages');
  processSyncResponseMessage({
    message: msg,
    repoFullName,
    appendMessages,
    isLeader,
    queueConversationForCommit,
    log: console.log,
    warn: console.warn
  });
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
