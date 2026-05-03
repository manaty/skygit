// PeerJS-based peer discovery and messaging for SkyGit
// Replaces GitHub Discussion-based WebRTC signaling

import { Peer } from 'peerjs';
import { createPeerManagerRuntime } from './peerManagerRuntime.js';
import { createPeerManagerRuntimeDependencies } from './peerManagerRuntimeDependencies.js';
import { peerConnections, onlinePeers, typingUsers } from './peerManagerStores.js';

export { peerConnections, onlinePeers, typingUsers };

const peerStores = { peerConnections, onlinePeers, typingUsers };
const runtime = createPeerManagerRuntime(createPeerManagerRuntimeDependencies({
  PeerClass: Peer,
  peerStores
}));

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
