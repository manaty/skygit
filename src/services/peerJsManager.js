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
  connectToReceivedOrgPeers,
  storeDiscoveredPeerRegistry,
  updateKnownPeerConnections
} from '../utils/peerLeaderResponses.js';
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
  applyCommittedMessagesNotification,
  broadcastCommittedEvent,
  createCommittedMessagesMessage,
  createUpdateConversationsMessage,
  shouldBroadcastCommittedEvent
} from '../utils/peerCommitProtocol.js';
import { bindLeaderConnectionEvents } from '../utils/peerConnectionEvents.js';
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
  checkDiscoveryLeaderHealth,
  handleLeaderHealthTick,
  performLeaderRegistryMaintenance,
  reconnectToDiscoveryLeader,
  scheduleLeaderReconnect,
  stepDownFromDiscoveryLeadership,
  startLeaderHealthTimer,
  startLeaderMaintenanceTimer
} from '../utils/peerLeaderHealth.js';
import { claimPeerLeadershipSlot } from '../utils/peerLeadershipClaim.js';
import {
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
    handleLeaderHealthTick({
      isCurrentLeader,
      connectedToLeader,
      checkLeaderHealth: () => checkLeaderHealth(orgId),
      reconnectToLeader: () => tryReconnectToLeader(orgId)
    });
  });
}

function checkLeaderHealth(orgId) {
  checkDiscoveryLeaderHealth({
    connectedToLeader,
    heartbeatMessage: createHeartbeatMessage(),
    reconnectToLeader: () => tryReconnectToLeader(orgId),
    setConnectedToLeader: (connection) => {
      connectedToLeader = connection;
    },
    log: console.log,
    warn: console.warn
  });
}

async function tryReconnectToLeader(orgId) {
  await reconnectToDiscoveryLeader({
    orgId,
    buildLeaderId,
    connectToLeader: tryConnectToLeader,
    attemptLeadership,
    log: console.log
  });
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
  return storeDiscoveredPeerRegistry({
    storage: localStorage,
    orgId,
    peers,
    updateContact,
    log: console.log
  });
}

function connectToOrgPeers(peers) {
  return connectToReceivedOrgPeers({
    peers,
    localPeerId: localPeer.id,
    connections: get(peerConnections),
    failedConnections,
    connectToPeer,
    log: console.log
  });
}

function updateKnownPeers(peers) {
  return updateKnownPeerConnections({
    peers,
    localPeerId: localPeer.id,
    connections: get(peerConnections),
    failedConnections,
    connectToPeer,
    log: console.log
  });
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
