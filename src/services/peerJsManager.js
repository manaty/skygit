// PeerJS-based peer discovery and messaging for SkyGit
// Replaces GitHub Discussion-based WebRTC signaling

import { Peer } from 'peerjs';
import { writable } from 'svelte/store';
import {
  appendMessage,
  appendMessages,
  committedEvents,
  conversations,
  markMessagesCommitted
} from '../stores/conversationStore.js';
import { queueConversationForCommit, flushConversationCommitQueue } from '../services/conversationCommitQueue.js';
import { authStore } from '../stores/authStore.js';
import { updateContact, setLastMessage, loadContacts } from '../stores/contactsStore.js';
import { get } from 'svelte/store';
import {
  buildLeaderId,
  createHeartbeatMessage,
  createLeadershipChangeMessage,
  generatePeerId,
  getOrgId,
  LEADERSHIP_RECONNECT_DELAY_MS,
  PEER_STALE_THRESHOLD_MS
} from '../utils/peerDiscovery.js';
import {
  createDiscoverySessionOrchestrator
} from '../utils/peerDiscoveryStartup.js';
import { createDiscoveryLeaderRoleController } from '../utils/peerLeaderRole.js';
import {
  createLeaderConnectionController
} from '../utils/peerLeaderResponses.js';
import {
  buildOnlinePeerRows
} from '../utils/peerBroadcast.js';
import {
  createPeerCallController
} from '../utils/peerCallController.js';
import { createPeerConversationController } from '../utils/peerConversationController.js';
import { createPeerMessageActionsController } from '../utils/peerMessageActionsController.js';
import { createPeerMessageController } from '../utils/peerMessageController.js';
import { bindPeerManagerEvents } from '../utils/peerManagerEvents.js';
import {
  bindIncomingPeerDataConnection,
  connectToOutgoingPeer
} from '../utils/peerDataConnections.js';
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
  createLeaderHealthController,
  scheduleLeaderReconnect
} from '../utils/peerLeaderHealth.js';
import {
  processClosedPeerConnection,
  processOpenedPeerConnection,
  sendConversationSyncRequests
} from '../utils/peerConnectionLifecycle.js';

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

  conversationController.stopLeaderCommitInterval();
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

  bindPeerManagerEvents(localPeer, {
    startPeerDiscovery,
    initializeCallHandling,
    handleIncomingConnection,
    log: console.log,
    reportError: console.error
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
let leaderHealth = null;

const leaderRole = createDiscoveryLeaderRoleController({
  getLeadershipPeer: () => leadershipPeer,
  getLocalPeerId: () => localPeer.id,
  getLocalUsername: () => localUsername,
  getRepoFullName: () => repoFullName,
  peerRegistry,
  getOrgId,
  staleThresholdMs: PEER_STALE_THRESHOLD_MS,
  log: console.log,
  warn: console.warn
});

const leaderConnection = createLeaderConnectionController({
  getRepoFullName: () => repoFullName,
  getLocalUsername: () => localUsername,
  getLocalPeerId: () => localPeer.id,
  getConnections: () => get(peerConnections),
  getFailedConnections: () => failedConnections,
  getStorage: () => localStorage,
  getOrgId,
  updateContact,
  connectToPeer,
  reconnectToLeader: tryReconnectToLeader,
  setConnectedToLeader: (connection) => {
    connectedToLeader = connection;
  },
  reconnectDelayMs: LEADERSHIP_RECONNECT_DELAY_MS,
  scheduleReconnect: scheduleLeaderReconnect,
  log: console.log,
  warn: console.warn
});

const discoverySession = createDiscoverySessionOrchestrator({
  getAuth: () => get(authStore),
  getRepoFullName: () => repoFullName,
  getLocalPeer: () => localPeer,
  getLocalUsername: () => localUsername,
  PeerClass: Peer,
  loadContacts,
  setupLeaderConnection: leaderConnection.setupLeaderConnection,
  setupLeadershipRole: leaderRole.setupLeadershipRole,
  startHealthCheckSystem: (orgId) => leaderHealth.startHealthCheckSystem(orgId),
  setConnectedToLeader: (connection) => {
    connectedToLeader = connection;
  },
  setLeadershipPeer: (leader) => {
    leadershipPeer = leader;
  },
  setCurrentLeader: (isLeader) => {
    isCurrentLeader = isLeader;
  },
  log: console.log
});

const messageActions = createPeerMessageActionsController({
  getConnections: () => get(peerConnections),
  getConversations: () => get(conversations),
  getRepoFullName: () => repoFullName,
  getStorage: () => localStorage,
  getOrgId,
  log: console.log,
  warn: console.warn,
  error: console.error
});

const conversationController = createPeerConversationController({
  getLocalPeerId: () => localPeer?.id,
  getConnections: () => get(peerConnections),
  getCurrentDiscoveryLeader: () => isCurrentLeader,
  getPeerRegistry: () => peerRegistry,
  getLeaderConnection: () => connectedToLeader,
  flushCommitQueue: flushConversationCommitQueue,
  clearTimer,
  committedEvents,
  broadcastToAllPeers: messageActions.broadcastToAllPeers,
  log: console.log
});

const callController = createPeerCallController({
  getLocalPeer: () => localPeer,
  getLocalUsername: () => localUsername,
  getMediaDevices: () => navigator.mediaDevices,
  getAlertUser: () => alert,
  getStoreValue: get,
  stores: {
    callStatus,
    localStream,
    remoteStream,
    remotePeerId,
    isVideoEnabled,
    isAudioEnabled,
    isScreenSharing,
    callStartTime
  },
  resetCallState,
  log: console.log,
  warn: console.warn,
  reportError: console.error
});

const messageController = createPeerMessageController({
  getConnections: () => get(peerConnections),
  getConversations: () => get(conversations),
  getLocalPeerId: () => localPeer?.id,
  getRepoFullName: () => repoFullName,
  appendMessage,
  appendMessages,
  setLastMessage,
  updateContact,
  updateTypingUsers: typingUsers.update,
  isLeader: conversationController.isLeader,
  getCurrentLeader: conversationController.getCurrentLeader,
  queueConversationForCommit,
  sendMessageToPeer: messageActions.sendMessageToPeer,
  markMessagesCommitted,
  log: console.log,
  warn: console.warn
});

leaderHealth = createLeaderHealthController({
  getCurrentLeader: () => isCurrentLeader,
  getConnectedToLeader: () => connectedToLeader,
  getPeerRegistry: () => peerRegistry,
  getLeadershipPeer: () => leadershipPeer,
  getHealthCheckInterval: () => healthCheckInterval,
  setHealthCheckInterval: (interval) => {
    healthCheckInterval = interval;
  },
  buildLeaderId,
  createHeartbeatMessage,
  createLeadershipChangeMessage,
  destroyPeer,
  setConnectedToLeader: (connection) => {
    connectedToLeader = connection;
  },
  setLeadershipPeer: (peer) => {
    leadershipPeer = peer;
  },
  setCurrentLeader: (isLeader) => {
    isCurrentLeader = isLeader;
  },
  connectToLeader: discoverySession.connectToLeader,
  attemptLeadership: discoverySession.attemptLeadership,
  clearTimer,
  log: console.log,
  warn: console.warn
});

async function initializeDiscoverySystem() {
  await discoverySession.initialize();
}

async function tryReconnectToLeader(orgId) {
  await leaderHealth.reconnectToLeader(orgId);
}

// Handle incoming peer connections
function handleIncomingConnection(conn) {
  return bindIncomingPeerDataConnection(conn, {
    addPeerConnection,
    handlePeerMessage,
    removePeerConnection,
    log: console.log,
    reportError: console.error
  });
}

// Connect to a specific peer
export function connectToPeer(targetPeerId, username) {
  return connectToOutgoingPeer({
    localPeer,
    targetPeerId,
    username,
    connections: get(peerConnections),
    localUsername,
    repoFullName,
    sessionId,
    addPeerConnection,
    handlePeerMessage,
    removePeerConnection,
    failedConnections,
    log: console.log,
    reportError: console.error
  });
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
    broadcastPeerListUpdate: leaderRole.broadcastPeerListUpdate,
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
  return messageController.handlePeerMessage(data, fromPeerId, fromUsername);
}

// Send message to specific peer
export function sendMessageToPeer(peerId, message) {
  return messageActions.sendMessageToPeer(peerId, message);
}

// Broadcast message to conversation participants only
export function broadcastMessage(message, conversationId = null) {
  return messageActions.broadcastMessage(message, conversationId);
}

// Broadcast to all connected peers (for non-conversation messages like typing)
export function broadcastToAllPeers(message) {
  return messageActions.broadcastToAllPeers(message);
}

// Simple leader election (lexicographically smallest peer ID)
export function getCurrentLeader() {
  return conversationController.getCurrentLeader();
}

export function isLeader() {
  return conversationController.isLeader();
}

// Update leader status when peers change
conversationController.subscribePeerConnectionChanges(peerConnections);

// Hash-based message sync protocol
export function requestMessageSync(peerId, conversationId, lastHash) {
  return messageActions.requestMessageSync(peerId, conversationId, lastHash);
}

// Request sync with hash chain for reconciliation
export function requestSyncWithHashChain(peerId, conversationId, hashChain) {
  return messageActions.requestSyncWithHashChain(peerId, conversationId, hashChain);
}

// Broadcast typing status to all peers
export function broadcastTypingStatus(isTyping) {
  return messageActions.broadcastTypingStatus(isTyping);
}

// Update our conversation list (for leaders and regular peers)
export function updateMyConversations(conversations) {
  return conversationController.updateMyConversations(conversations);
}

conversationController.subscribeCommittedMessages();

// Graceful shutdown on window unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    if (isCurrentLeader) {
      leaderHealth.stepDownFromLeadership();
    }
    shutdownPeerManager();
  });
}

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

// Initialize call handling
export function initializeCallHandling() {
  return callController.initializeCallHandling();
}

export async function startCall(peerId, video = true) {
  return callController.startCall(peerId, video);
}

export async function answerCall() {
  return callController.answerCall();
}

export function endCall() {
  return callController.endCall();
}

export function toggleAudio() {
  return callController.toggleAudio();
}

export function toggleVideo() {
  return callController.toggleVideo();
}

export async function toggleScreenShare() {
  return callController.toggleScreenShare();
}
