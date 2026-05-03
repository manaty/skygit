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
  createPeerCallController
} from '../utils/peerCallController.js';
import { createPeerConnectionController } from '../utils/peerConnectionController.js';
import { createPeerConversationController } from '../utils/peerConversationController.js';
import { createPeerMessageActionsController } from '../utils/peerMessageActionsController.js';
import { createPeerMessageController } from '../utils/peerMessageController.js';
import { createPeerManagerLifecycleController } from '../utils/peerManagerLifecycleController.js';
import { clearTimer, destroyPeer } from '../utils/peerLifecycle.js';
import {
  createLeaderHealthController,
  scheduleLeaderReconnect
} from '../utils/peerLeaderHealth.js';

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

const connectionController = createPeerConnectionController({
  getLocalPeer: () => localPeer,
  getLocalUsername: () => localUsername,
  getRepoFullName: () => repoFullName,
  getSessionId: () => sessionId,
  getConnections: () => get(peerConnections),
  getConversations: () => get(conversations),
  getPeerRegistry: () => peerRegistry,
  getCurrentDiscoveryLeader: () => isCurrentLeader,
  getFailedConnections: () => failedConnections,
  updatePeerConnections: peerConnections.update,
  setOnlinePeers: onlinePeers.set,
  updateTypingUsers: typingUsers.update,
  updateContact,
  requestMessageSync: messageActions.requestMessageSync,
  handlePeerMessage: messageController.handlePeerMessage,
  broadcastPeerListUpdate: leaderRole.broadcastPeerListUpdate,
  log: console.log,
  reportError: console.error
});

const lifecycleController = createPeerManagerLifecycleController({
  PeerClass: Peer,
  generatePeerId,
  getLocalPeer: () => localPeer,
  setLocalPeer: (peer) => {
    localPeer = peer;
  },
  getLocalUsername: () => localUsername,
  setLocalUsername: (username) => {
    localUsername = username;
  },
  getRepoFullName: () => repoFullName,
  setRepoFullName: (repoName) => {
    repoFullName = repoName;
  },
  getSessionId: () => sessionId,
  setSessionId: (nextSessionId) => {
    sessionId = nextSessionId;
  },
  getHealthCheckInterval: () => healthCheckInterval,
  setHealthCheckInterval: (interval) => {
    healthCheckInterval = interval;
  },
  getLeadershipPeer: () => leadershipPeer,
  setLeadershipPeer: (peer) => {
    leadershipPeer = peer;
  },
  getConnectedToLeader: () => connectedToLeader,
  setConnectedToLeader: (connection) => {
    connectedToLeader = connection;
  },
  setCurrentLeader: (isLeader) => {
    isCurrentLeader = isLeader;
  },
  getPeerRegistry: () => peerRegistry,
  getPeerConnections: () => get(peerConnections),
  peerStores: { peerConnections, onlinePeers, typingUsers },
  getFailedConnections: () => failedConnections,
  stopLeaderCommitInterval: conversationController.stopLeaderCommitInterval,
  startPeerDiscovery,
  initializeCallHandling,
  handleIncomingConnection,
  log: console.log,
  reportError: console.error
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

export function getLocalSessionId() {
  return lifecycleController.getLocalSessionId();
}

export function getLocalPeerId() {
  return lifecycleController.getLocalPeerId();
}

export function shutdownPeerManager() {
  return lifecycleController.shutdownPeerManager();
}

export function initializePeerManager(options) {
  return lifecycleController.initializePeerManager(options);
}

// Handle incoming peer connections
function handleIncomingConnection(conn) {
  return connectionController.handleIncomingConnection(conn);
}

// Connect to a specific peer
export function connectToPeer(targetPeerId, username) {
  return connectionController.connectToPeer(targetPeerId, username);
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
