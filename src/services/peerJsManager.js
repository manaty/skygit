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
import { queueConversationForCommit, flushConversationCommitQueue } from './conversationCommitQueue.js';
import { authStore } from '../stores/authStore.js';
import { updateContact, setLastMessage, loadContacts } from '../stores/contactsStore.js';
import { createPeerManagerRuntime } from './peerManagerRuntime.js';
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

export const peerConnections = writable({});
export const onlinePeers = writable([]);
export const typingUsers = writable({});

const runtime = createPeerManagerRuntime({
  PeerClass: Peer,
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
  peerStores: { peerConnections, onlinePeers, typingUsers },
  callStores: {
    callStatus,
    localStream,
    remoteStream,
    remotePeerId,
    isVideoEnabled,
    isAudioEnabled,
    isScreenSharing,
    callStartTime
  },
  resetCallState
});

runtime.bindWindowUnload();

export function getLocalSessionId() {
  return runtime.getLocalSessionId();
}

export function getLocalPeerId() {
  return runtime.getLocalPeerId();
}

export function shutdownPeerManager() {
  return runtime.shutdownPeerManager();
}

export function initializePeerManager(options) {
  return runtime.initializePeerManager(options);
}

export function connectToPeer(targetPeerId, username) {
  return runtime.connectToPeer(targetPeerId, username);
}

export function sendMessageToPeer(peerId, message) {
  return runtime.sendMessageToPeer(peerId, message);
}

export function broadcastMessage(message, conversationId = null) {
  return runtime.broadcastMessage(message, conversationId);
}

export function broadcastToAllPeers(message) {
  return runtime.broadcastToAllPeers(message);
}

export function getCurrentLeader() {
  return runtime.getCurrentLeader();
}

export function isLeader() {
  return runtime.isLeader();
}

export function requestMessageSync(peerId, conversationId, lastHash) {
  return runtime.requestMessageSync(peerId, conversationId, lastHash);
}

export function requestSyncWithHashChain(peerId, conversationId, hashChain) {
  return runtime.requestSyncWithHashChain(peerId, conversationId, hashChain);
}

export function broadcastTypingStatus(isTyping) {
  return runtime.broadcastTypingStatus(isTyping);
}

export function updateMyConversations(conversations) {
  return runtime.updateMyConversations(conversations);
}

export function initializeCallHandling() {
  return runtime.initializeCallHandling();
}

export async function startCall(peerId, video = true) {
  return runtime.startCall(peerId, video);
}

export async function answerCall() {
  return runtime.answerCall();
}

export function endCall() {
  return runtime.endCall();
}

export function toggleAudio() {
  return runtime.toggleAudio();
}

export function toggleVideo() {
  return runtime.toggleVideo();
}

export async function toggleScreenShare() {
  return runtime.toggleScreenShare();
}
