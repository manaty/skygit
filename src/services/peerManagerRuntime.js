import { get } from 'svelte/store';
import {
  generatePeerId,
  getOrgId
} from '../utils/peerDiscovery.js';
import { createPeerCallController } from '../utils/peerCallController.js';
import { createPeerConnectionController } from '../utils/peerConnectionController.js';
import { createPeerConversationController } from '../utils/peerConversationController.js';
import { createPeerDiscoveryController } from '../utils/peerDiscoveryController.js';
import { createPeerMessageActionsController } from '../utils/peerMessageActionsController.js';
import { createPeerMessageController } from '../utils/peerMessageController.js';
import { createPeerManagerLifecycleController } from '../utils/peerManagerLifecycleController.js';

export function createPeerManagerRuntime({
  PeerClass,
  authStore,
  conversations,
  committedEvents,
  appendMessage,
  appendMessages,
  markMessagesCommitted,
  queueConversationForCommit,
  flushConversationCommitQueue,
  loadContacts,
  updateContact,
  setLastMessage,
  peerStores,
  callStores,
  resetCallState,
  getStoreValue = get,
  getStorage = () => localStorage,
  getMediaDevices = () => navigator.mediaDevices,
  getAlertUser = () => alert,
  log = console.log,
  warn = console.warn,
  reportError = console.error
}) {
  const { peerConnections, onlinePeers, typingUsers } = peerStores;
  let localPeer = null;
  let localUsername = null;
  let repoFullName = null;
  let sessionId = null;
  let failedConnections = new Set();
  let connectionController = null;

  const getConnections = () => getStoreValue(peerConnections);
  const getConversations = () => getStoreValue(conversations);

  function startPeerDiscovery() {
    log('[PeerJS] Peer manager initialized for repo:', repoFullName);
    log('[PeerJS] Peer ID:', localPeer.id);
    initializeDiscoverySystem();
  }

  const discoveryController = createPeerDiscoveryController({
    PeerClass,
    getAuth: () => getStoreValue(authStore),
    getLocalPeer: () => localPeer,
    getLocalPeerId: () => localPeer.id,
    getLocalUsername: () => localUsername,
    getRepoFullName: () => repoFullName,
    getConnections,
    getFailedConnections: () => failedConnections,
    getStorage,
    loadContacts,
    updateContact,
    connectToPeer,
    log,
    warn
  });

  const messageActions = createPeerMessageActionsController({
    getConnections,
    getConversations,
    getRepoFullName: () => repoFullName,
    getStorage,
    getOrgId,
    log,
    warn,
    error: reportError
  });

  const conversationController = createPeerConversationController({
    getLocalPeerId: () => localPeer?.id,
    getConnections,
    getCurrentDiscoveryLeader: discoveryController.isCurrentLeader,
    getPeerRegistry: discoveryController.getPeerRegistry,
    getLeaderConnection: discoveryController.getConnectedToLeader,
    flushCommitQueue: flushConversationCommitQueue,
    committedEvents,
    broadcastToAllPeers: messageActions.broadcastToAllPeers,
    log
  });

  const callController = createPeerCallController({
    getLocalPeer: () => localPeer,
    getLocalUsername: () => localUsername,
    getMediaDevices,
    getAlertUser,
    getStoreValue,
    stores: callStores,
    resetCallState,
    log,
    warn,
    reportError
  });

  const messageController = createPeerMessageController({
    getConnections,
    getConversations,
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
    log,
    warn
  });

  connectionController = createPeerConnectionController({
    getLocalPeer: () => localPeer,
    getLocalUsername: () => localUsername,
    getRepoFullName: () => repoFullName,
    getSessionId: () => sessionId,
    getConnections,
    getConversations,
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
    log,
    reportError
  });

  const lifecycleController = createPeerManagerLifecycleController({
    PeerClass,
    generatePeerId,
    getLocalPeer: () => localPeer,
    setLocalPeer: peer => {
      localPeer = peer;
    },
    getLocalUsername: () => localUsername,
    setLocalUsername: username => {
      localUsername = username;
    },
    getRepoFullName: () => repoFullName,
    setRepoFullName: repoName => {
      repoFullName = repoName;
    },
    getSessionId: () => sessionId,
    setSessionId: nextSessionId => {
      sessionId = nextSessionId;
    },
    shutdownDiscovery: discoveryController.shutdownDiscovery,
    getPeerConnections: getConnections,
    peerStores,
    getFailedConnections: () => failedConnections,
    stopLeaderCommitInterval: conversationController.stopLeaderCommitInterval,
    startPeerDiscovery,
    initializeCallHandling,
    handleIncomingConnection,
    log,
    reportError
  });

  async function initializeDiscoverySystem() {
    await discoveryController.initializeDiscoverySystem();
  }

  async function tryReconnectToLeader(orgId) {
    await discoveryController.reconnectToLeader(orgId);
  }

  function getLocalSessionId() {
    return lifecycleController.getLocalSessionId();
  }

  function getLocalPeerId() {
    return lifecycleController.getLocalPeerId();
  }

  function shutdownPeerManager() {
    return lifecycleController.shutdownPeerManager();
  }

  function initializePeerManager(options) {
    return lifecycleController.initializePeerManager(options);
  }

  function handleIncomingConnection(conn) {
    return connectionController.handleIncomingConnection(conn);
  }

  function connectToPeer(targetPeerId, username) {
    return connectionController.connectToPeer(targetPeerId, username);
  }

  function handlePeerMessage(data, fromPeerId, fromUsername = null) {
    return messageController.handlePeerMessage(data, fromPeerId, fromUsername);
  }

  function sendMessageToPeer(peerId, message) {
    return messageActions.sendMessageToPeer(peerId, message);
  }

  function broadcastMessage(message, conversationId = null) {
    return messageActions.broadcastMessage(message, conversationId);
  }

  function broadcastToAllPeers(message) {
    return messageActions.broadcastToAllPeers(message);
  }

  function getCurrentLeader() {
    return conversationController.getCurrentLeader();
  }

  function isLeader() {
    return conversationController.isLeader();
  }

  conversationController.subscribePeerConnectionChanges(peerConnections);

  function requestMessageSync(peerId, conversationId, lastHash) {
    return messageActions.requestMessageSync(peerId, conversationId, lastHash);
  }

  function requestSyncWithHashChain(peerId, conversationId, hashChain) {
    return messageActions.requestSyncWithHashChain(peerId, conversationId, hashChain);
  }

  function broadcastTypingStatus(isTyping) {
    return messageActions.broadcastTypingStatus(isTyping);
  }

  function updateMyConversations(conversations) {
    return conversationController.updateMyConversations(conversations);
  }

  conversationController.subscribeCommittedMessages();

  function bindWindowUnload(targetWindow = typeof window !== 'undefined' ? window : null) {
    if (!targetWindow) {
      return () => {};
    }

    const handleBeforeUnload = () => {
      if (discoveryController.isCurrentLeader()) {
        discoveryController.stepDownFromLeadership();
      }
      shutdownPeerManager();
    };

    targetWindow.addEventListener('beforeunload', handleBeforeUnload);
    return () => targetWindow.removeEventListener('beforeunload', handleBeforeUnload);
  }

  function initializeCallHandling() {
    return callController.initializeCallHandling();
  }

  async function startCall(peerId, video = true) {
    return callController.startCall(peerId, video);
  }

  async function answerCall() {
    return callController.answerCall();
  }

  function endCall() {
    return callController.endCall();
  }

  function toggleAudio() {
    return callController.toggleAudio();
  }

  function toggleVideo() {
    return callController.toggleVideo();
  }

  async function toggleScreenShare() {
    return callController.toggleScreenShare();
  }

  return {
    getLocalSessionId,
    getLocalPeerId,
    shutdownPeerManager,
    initializePeerManager,
    connectToPeer,
    handlePeerMessage,
    sendMessageToPeer,
    broadcastMessage,
    broadcastToAllPeers,
    getCurrentLeader,
    isLeader,
    requestMessageSync,
    requestSyncWithHashChain,
    broadcastTypingStatus,
    updateMyConversations,
    tryReconnectToLeader,
    bindWindowUnload,
    initializeCallHandling,
    startCall,
    answerCall,
    endCall,
    toggleAudio,
    toggleVideo,
    toggleScreenShare
  };
}
