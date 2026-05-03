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
  generatePeerId,
  getOrgId
} from '../utils/peerDiscovery.js';
import {
  createPeerCallController
} from '../utils/peerCallController.js';
import { createPeerConnectionController } from '../utils/peerConnectionController.js';
import { createPeerConversationController } from '../utils/peerConversationController.js';
import { createPeerDiscoveryController } from '../utils/peerDiscoveryController.js';
import { createPeerMessageActionsController } from '../utils/peerMessageActionsController.js';
import { createPeerMessageController } from '../utils/peerMessageController.js';
import { createPeerManagerLifecycleController } from '../utils/peerManagerLifecycleController.js';

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

const discoveryController = createPeerDiscoveryController({
  PeerClass: Peer,
  getAuth: () => get(authStore),
  getLocalPeer: () => localPeer,
  getLocalPeerId: () => localPeer.id,
  getLocalUsername: () => localUsername,
  getRepoFullName: () => repoFullName,
  getConnections: () => get(peerConnections),
  getFailedConnections: () => failedConnections,
  getStorage: () => localStorage,
  loadContacts,
  updateContact,
  connectToPeer,
  log: console.log,
  warn: console.warn
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
  getCurrentDiscoveryLeader: discoveryController.isCurrentLeader,
  getPeerRegistry: discoveryController.getPeerRegistry,
  getLeaderConnection: discoveryController.getConnectedToLeader,
  flushCommitQueue: flushConversationCommitQueue,
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
  getPeerRegistry: discoveryController.getPeerRegistry,
  getCurrentDiscoveryLeader: discoveryController.isCurrentLeader,
  getFailedConnections: () => failedConnections,
  updatePeerConnections: peerConnections.update,
  setOnlinePeers: onlinePeers.set,
  updateTypingUsers: typingUsers.update,
  updateContact,
  requestMessageSync: messageActions.requestMessageSync,
  handlePeerMessage: messageController.handlePeerMessage,
  broadcastPeerListUpdate: discoveryController.broadcastPeerListUpdate,
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
  shutdownDiscovery: discoveryController.shutdownDiscovery,
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

async function initializeDiscoverySystem() {
  await discoveryController.initializeDiscoverySystem();
}

async function tryReconnectToLeader(orgId) {
  await discoveryController.reconnectToLeader(orgId);
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
    if (discoveryController.isCurrentLeader()) {
      discoveryController.stepDownFromLeadership();
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
