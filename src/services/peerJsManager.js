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
  resolveConversationParticipants
} from '../utils/peerParticipants.js';
import { processPeerDataMessage } from '../utils/peerMessages.js';
import {
  buildOnlinePeerRows
} from '../utils/peerBroadcast.js';
import {
  processIncomingPeerChatMessage
} from '../utils/peerChat.js';
import { processIncomingTypingMessage } from '../utils/peerTyping.js';
import {
  broadcastPeerMessage,
  broadcastPeerMessageToAll,
  broadcastPeerTypingStatus,
  requestPeerMessageSync,
  requestPeerSyncWithHashChain,
  sendPeerMessage
} from '../utils/peerMessageActions.js';
import {
  answerIncomingPeerCall,
  bindActiveCallEvents,
  bindIncomingCallHandling,
  endPeerCall,
  startOutgoingPeerCall,
  togglePeerAudio,
  togglePeerScreenShare,
  togglePeerVideo
} from '../utils/peerCallSession.js';
import {
  createUpdateConversationsMessage,
  processCommittedMessagesMessage,
  subscribeCommittedMessageBroadcasts
} from '../utils/peerCommitProtocol.js';
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
import {
  getCurrentLeaderId,
  isLocalPeerLeader,
  refreshLeaderCommitInterval
} from '../utils/peerCommitInterval.js';
import {
  processLocalConversationUpdate
} from '../utils/peerConversationUpdates.js';
import {
  processSyncChainRequestMessage,
  processSyncNeedsChainMessage,
  processSyncRequestMessage,
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
  processSyncNeedsChainMessage({
    message,
    fromPeerId,
    conversationsMap: get(conversations),
    repoFullName,
    sendMessageToPeer
  });
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
  return sendPeerMessage({
    peerId,
    message,
    connections: get(peerConnections),
    log: console.log,
    warn: console.warn
  });
}

// Broadcast message to conversation participants only
export function broadcastMessage(message, conversationId = null) {
  return broadcastPeerMessage({
    connections: get(peerConnections),
    participants: getConversationParticipants(conversationId),
    message,
    conversationId,
    log: console.log,
    warn: console.warn,
    error: console.error
  });
}

// Broadcast to all connected peers (for non-conversation messages like typing)
export function broadcastToAllPeers(message) {
  return broadcastPeerMessageToAll({
    connections: get(peerConnections),
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
  leaderCommitInterval = refreshLeaderCommitInterval({
    localPeerId: localPeer?.id,
    connections: get(peerConnections),
    currentInterval: leaderCommitInterval,
    flushCommitQueue: flushConversationCommitQueue,
    isStillLeader: isLeader,
    log: console.log
  });
}

// Update leader status when peers change
peerConnections.subscribe(() => {
  maybeStartLeaderCommitInterval();
});

// Hash-based message sync protocol
export function requestMessageSync(peerId, conversationId, lastHash) {
  return requestPeerMessageSync({
    peerId,
    conversationId,
    lastHash,
    sendMessageToPeer,
    log: console.log
  });
}

// Request sync with hash chain for reconciliation
export function requestSyncWithHashChain(peerId, conversationId, hashChain) {
  return requestPeerSyncWithHashChain({
    peerId,
    conversationId,
    hashChain,
    sendMessageToPeer,
    log: console.log
  });
}

// Handle sync request from peer
function handleSyncRequest(msg, fromPeerId) {
  processSyncRequestMessage({
    message: msg,
    fromPeerId,
    conversationsMap: get(conversations),
    repoFullName,
    sendMessageToPeer,
    log: console.log,
    warn: console.warn
  });
}

// Handle sync request with hash chain
function handleSyncRequestWithChain(msg, fromPeerId) {
  processSyncChainRequestMessage({
    message: msg,
    fromPeerId,
    conversationsMap: get(conversations),
    repoFullName,
    sendMessageToPeer,
    log: console.log,
    warn: console.warn
  });
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
  return broadcastPeerTypingStatus(isTyping, broadcastToAllPeers);
}

// Update our conversation list (for leaders and regular peers)
export function updateMyConversations(conversations) {
  return processLocalConversationUpdate({
    conversations,
    isCurrentLeader,
    peerRegistry,
    localPeerId: localPeer.id,
    leaderConnection: connectedToLeader,
    createUpdateMessage: createUpdateConversationsMessage,
    log: console.log
  });
}

// Subscribe to committed events and broadcast to peers
import { committedEvents, markMessagesCommitted } from '../stores/conversationStore.js';

subscribeCommittedMessageBroadcasts({
  committedEvents,
  broadcastToAllPeers,
  log: console.log
});

// Handle committed messages notification
function handleCommittedMessages(msg, fromPeerId) {
  return processCommittedMessagesMessage({
    message: msg,
    fromPeerId,
    markMessagesCommitted,
    log: console.log
  });
}

// Graceful shutdown on window unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    if (isCurrentLeader) {
      leaderHealth.stepDownFromLeadership();
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
  return bindIncomingCallHandling(localPeer, {
    getCallStatus: () => get(callStatus),
    stores: { callStatus, remotePeerId },
    getCurrentCall: () => currentCall,
    setCurrentCall: (call) => {
      currentCall = call;
    },
    endCall,
    log: console.log,
    warn: console.warn,
    reportError: console.error
  });
}

export async function startCall(peerId, video = true) {
  return startOutgoingPeerCall({
    localPeer,
    peerId,
    video,
    mediaDevices: navigator.mediaDevices,
    localUsername,
    stores: { localStream, callStatus, remotePeerId, isVideoEnabled },
    setCurrentCall: (call) => {
      currentCall = call;
    },
    setupCallEvents,
    alertUser: alert,
    resetCallState,
    log: console.log,
    reportError: console.error
  });
}

export async function answerCall() {
  return answerIncomingPeerCall({
    currentCall,
    callStatus: get(callStatus),
    mediaDevices: navigator.mediaDevices,
    stores: { localStream },
    setupCallEvents,
    endCall,
    alertUser: alert,
    log: console.log,
    warn: console.warn,
    reportError: console.error
  });
}

function setupCallEvents(call) {
  return bindActiveCallEvents(call, {
    stores: { remoteStream, callStatus, callStartTime },
    endCall,
    log: console.log,
    reportError: console.error
  });
}

export function endCall() {
  endPeerCall({
    currentCall,
    setCurrentCall: (call) => {
      currentCall = call;
    },
    localStream: get(localStream),
    remoteStream: get(remoteStream),
    resetCallState,
    log: console.log
  });
}

export function toggleAudio() {
  return togglePeerAudio(get(localStream), (enabled) => isAudioEnabled.set(enabled));
}

export function toggleVideo() {
  return togglePeerVideo(get(localStream), (enabled) => isVideoEnabled.set(enabled));
}

export async function toggleScreenShare() {
  return togglePeerScreenShare({
    sharing: get(isScreenSharing),
    mediaDevices: navigator.mediaDevices,
    currentStream: get(localStream),
    currentCall,
    setScreenSharing: (sharing) => isScreenSharing.set(sharing),
    toggleScreenShare,
    log: console.log,
    reportError: console.error
  });
}
