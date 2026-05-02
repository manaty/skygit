import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('SidebarChats keeps a single previousOrg state declaration', async () => {
  const source = await readFile('src/components/SidebarChats.svelte', 'utf8');
  const declarations = source.match(/\blet\s+previousOrg\s*=/g) || [];

  expect(declarations).toHaveLength(1);
});

test('touched modal components avoid self-closing non-void controls', async () => {
  const files = [
    'src/components/GoogleDriveSetupGuide.svelte',
    'src/components/SaveRecordingModal.svelte',
    'src/components/SidebarContacts.svelte',
    'src/components/SidebarNotifications.svelte'
  ];

  for (const file of files) {
    const source = await readFile(file, 'utf8');

    expect(source, `${file} should not self-close textarea elements`).not.toMatch(/<textarea\b[^>]*\/>/s);
    expect(source, `${file} should not self-close button elements`).not.toMatch(/<button\b[^>]*\/>/s);
  }
});

test('security documentation makes browser token storage explicit', async () => {
  const source = await readFile('SECURITY.md', 'utf8');

  expect(source).toContain('localStorage');
  expect(source).toContain('skygit_token');
  expect(source).toContain('minimum scopes');
});

test('LoginWithPAT treats the GitHub token as a labeled secret input', async () => {
  const source = await readFile('src/components/LoginWithPAT.svelte', 'utf8');

  expect(source).toContain('for="github-token"');
  expect(source).toContain('id="github-token"');
  expect(source).toContain('type="password"');
  expect(source).toContain('autocomplete="current-password"');
});

test('repoStore is not dynamically imported from touched modules', async () => {
  const files = [
    'src/routes/Repos.svelte',
    'src/services/githubApi.js'
  ];

  for (const file of files) {
    const source = await readFile(file, 'utf8');
    expect(source, `${file} should use static repoStore imports`).not.toContain("import('../stores/repoStore.js')");
    expect(source, `${file} should use static repoStore imports`).not.toContain('import("../stores/repoStore.js")');
  }
});

test('Chats delegates participants modal rendering to a component', async () => {
  const chatsSource = await readFile('src/routes/Chats.svelte', 'utf8');
  const modalSource = await readFile('src/components/ParticipantsModal.svelte', 'utf8');

  expect(chatsSource).toContain("import ParticipantsModal from '../components/ParticipantsModal.svelte'");
  expect(chatsSource).toContain('<ParticipantsModal');
  expect(chatsSource).not.toContain('Count user agents per user');
  expect(modalSource).toContain('aria-label="Close participants modal"');
  expect(modalSource).toContain("import { buildParticipantRows } from '../utils/participants.js'");
});

test('Chats delegates conversation header rendering to a component', async () => {
  const source = await readFile('src/routes/Chats.svelte', 'utf8');
  const headerSource = await readFile('src/components/ConversationHeader.svelte', 'utf8');

  expect(source).toContain("import ConversationHeader from '../components/ConversationHeader.svelte'");
  expect(source).toContain('<ConversationHeader');
  expect(source).not.toContain('connectedSessions = [');
  expect(headerSource).toContain('buildConnectedSessions');
  expect(headerSource).toContain('getConnectedParticipantSummary');
});

test('Chats keeps PeerJS imports consolidated', async () => {
  const source = await readFile('src/routes/Chats.svelte', 'utf8');
  const imports = source.match(/from '..\/services\/peerJsManager\.js'/g) || [];

  expect(imports).toHaveLength(1);
  expect(source).not.toContain('getLocalSessionId');
});

test('Chats delegates remote conversation merging to a utility', async () => {
  const source = await readFile('src/routes/Chats.svelte', 'utf8');
  const serviceSource = await readFile('src/services/conversationSyncService.js', 'utf8');

  expect(source).toContain('fetchAndMergeConversation({');
  expect(serviceSource).toContain("import { mergeRemoteConversation } from '../utils/conversationSync.js'");
  expect(serviceSource).toContain('mergeRemoteConversation(conversation, remoteConversation)');
  expect(source).not.toContain('const messageMap = new Map()');
});

test('Chats delegates GitHub sync timer to a controller service', async () => {
  const source = await readFile('src/routes/Chats.svelte', 'utf8');

  expect(source).toContain('createConversationSyncController');
  expect(source).toContain('fetchAndMergeConversation');
  expect(source).toContain('syncController.stop();\n        syncController.start();');
  expect(source).toContain('syncController.start();');
  expect(source).toContain('syncController.stop();');
  expect(source).not.toContain('let syncInterval');
  expect(source).not.toContain('setInterval(syncMessagesFromGitHub');
});

test('Chats delegates recording upload credential selection to a utility', async () => {
  const source = await readFile('src/routes/Chats.svelte', 'utf8');

  expect(source).toContain("import { getRecordingUploadCredentials } from '../utils/uploadCredentials.js'");
  expect(source).toContain('getRecordingUploadCredentials(');
  expect(source).not.toContain('window.selectedRepo');
  expect(source).not.toContain('getDriveCredential');
});

test('Chats delegates upload destination choice without polling the modal', async () => {
  const source = await readFile('src/routes/Chats.svelte', 'utf8');

  expect(source).toContain("import { chooseRecordingUploadDestination } from '../utils/uploadDestinationChoice.js'");
  expect(source).toContain('chooseRecordingUploadDestination(availableDestinations');
  expect(source).toContain('resolveUploadDestinationChoice');
  expect(source).not.toContain('const interval = setInterval(() =>');
});

test('Chats cleans up store subscriptions and beforeunload listeners', async () => {
  const source = await readFile('src/routes/Chats.svelte', 'utf8');

  expect(source).toContain('const unsubscribePolling = presencePolling.subscribe');
  expect(source).toContain('const unsubscribePeerConnections = peerConnections.subscribe');
  expect(source).toContain('const unsubscribeCurrentContent = currentContent.subscribe');
  expect(source).toContain("window.addEventListener('beforeunload', cleanupPresence)");
  expect(source).toContain("window.removeEventListener('beforeunload', cleanupPresence)");
  expect(source).toContain('unsubscribePolling();');
  expect(source).toContain('unsubscribePeerConnections();');
  expect(source).toContain('unsubscribeCurrentContent();');
});

test('Chats delegates global browser callbacks to a cleanup-aware service', async () => {
  const source = await readFile('src/routes/Chats.svelte', 'utf8');
  const serviceSource = await readFile('src/services/browserCallbackService.js', 'utf8');

  expect(source).toContain("import { registerSkyGitBrowserCallbacks } from '../services/browserCallbackService.js'");
  expect(source).toContain('registerSkyGitBrowserCallbacks({');
  expect(source).toContain('unregisterBrowserCallbacks();');
  expect(source).not.toContain('window.skygitOnRecordingStatus =');
  expect(source).not.toContain('window.skygitFileSendProgress =');
  expect(serviceSource).toContain('delete windowRef[name]');
});

test('Chats delegates file transfer percentage calculation to a utility', async () => {
  const source = await readFile('src/routes/Chats.svelte', 'utf8');
  const utilitySource = await readFile('src/utils/transferProgress.js', 'utf8');

  expect(source).toContain("import { calculateTransferPercent } from '../utils/transferProgress.js'");
  expect(source).toContain('calculateTransferPercent(received, total)');
  expect(source).toContain('calculateTransferPercent(sent, total)');
  expect(source).not.toContain('Math.round((received / total) * 100)');
  expect(source).not.toContain('Math.round((sent / total) * 100)');
  expect(utilitySource).toContain('total <= 0');
});

test('Chats does not log auth tokens or session identifiers from presence setup', async () => {
  const source = await readFile('src/routes/Chats.svelte', 'utf8');

  expect(source).not.toContain('[SkyGit][Presence]');
  expect(source).not.toContain("console.log('[SkyGit] Using session ID");
  expect(source).not.toContain('Session ID timestamp');
  expect(source).not.toContain('Session ID length');
  expect(source).not.toContain('token\', token');
});

test('MessageInput delegates call peer filtering without debug logging', async () => {
  const source = await readFile('src/components/MessageInput.svelte', 'utf8');

  expect(source).toContain("import { getAvailableCallPeers } from \"../utils/callPeers.js\"");
  expect(source).toContain('getAvailableCallPeers($onlinePeers, localPeerId, conversation)');
  expect(source).not.toContain('[Call Debug]');
});

test('peerJsManager delegates discovery registry shaping to utilities', async () => {
  const source = await readFile('src/services/peerJsManager.js', 'utf8');
  const utilitySource = await readFile('src/utils/peerDiscovery.js', 'utf8');
  const lifecycleSource = await readFile('src/utils/peerConnectionLifecycle.js', 'utf8');
  const startupSource = await readFile('src/utils/peerDiscoveryStartup.js', 'utf8');
  const broadcastSource = await readFile('src/utils/peerLeaderBroadcast.js', 'utf8');

  expect(source).toContain("from '../utils/peerDiscovery.js'");
  expect(source).toContain('sendCompletePeerRegistry(conn, peerRegistry, getOrgId(repoFullName), console.log)');
  expect(source).toContain('sendDiscoveryPeerList(conn, peerRegistry, conversationFilter, console.log)');
  expect(source).toContain('broadcastDiscoveryPeerListUpdate(peerRegistry, sendPeerList)');
  expect(source).toContain('persistOrgPeerRegistryContacts(localStorage, orgId, peers, updateContact)');
  expect(source).toContain('buildLeaderId(orgId)');
  expect(source).toContain('initializePeerDiscoverySession({');
  expect(source).toContain('createDiscoveryBootstrap,');
  expect(source).toContain('getOrgId(repoFullName)');
  expect(utilitySource).toContain('export function generatePeerId');
  expect(utilitySource).toContain('export function createDiscoveryBootstrap');
  expect(utilitySource).toContain('export function createDiscoveryConnectionMetadata');
  expect(utilitySource).toContain('export function sendPeerRegistrySnapshot');
  expect(utilitySource).toContain('export function sendFilteredPeerListSnapshot');
  expect(utilitySource).toContain('export function persistOrgPeerRegistry');
  expect(utilitySource).toContain('export function persistOrgPeerRegistryContacts');
  expect(broadcastSource).toContain('export function sendCompletePeerRegistry');
  expect(broadcastSource).toContain('export function sendDiscoveryPeerList');
  expect(broadcastSource).toContain('export function broadcastDiscoveryPeerListUpdate');
  expect(startupSource).toContain('export async function initializePeerDiscoverySession');
  expect(startupSource).toContain('createDiscoveryBootstrap(auth, repoFullName)');
  expect(source).not.toContain('getStoredPeerContactUpdateEntries(orgPeers).forEach');
  expect(source).not.toContain("repoFullName.split('/')[0]");
  expect(source).not.toContain("`skygit_discovery_${orgId}`");
});

test('peerJsManager delegates discovery connection timeouts to a utility', async () => {
  const source = await readFile('src/services/peerJsManager.js', 'utf8');
  const utilitySource = await readFile('src/utils/peerConnection.js', 'utf8');
  const startupSource = await readFile('src/utils/peerDiscoveryStartup.js', 'utf8');

  expect(source).toContain("import { connectPeerWithTimeout } from '../utils/peerConnection.js'");
  expect(source).toContain('return connectPeerWithTimeout(localPeer, peerId, createDiscoveryConnectionMetadata(localUsername), timeout);');
  expect(source).toContain('connectToDiscoveryLeader({');
  expect(startupSource).toContain('export async function connectToDiscoveryLeader');
  expect(startupSource).toContain('connectToPeer(leaderId, 3000)');
  expect(utilitySource).toContain('export function connectPeerWithTimeout');
  expect(utilitySource).toContain("reject(new Error('Connection timeout'))");
  expect(source).not.toContain("reject(new Error('Connection timeout'))");
});

test('peerJsManager delegates peer connection eligibility to discovery utilities', async () => {
  const source = await readFile('src/services/peerJsManager.js', 'utf8');
  const utilitySource = await readFile('src/utils/peerDiscovery.js', 'utf8');

  expect(source).toContain('processDiscoveredPeerConnections({');
  expect(source).toContain("processPeerConnectionStatuses(peers, 'discovered peer', true)");
  expect(utilitySource).toContain('export function getPeerConnectionStatus');
  expect(utilitySource).toContain('export function groupPeersByConnectionStatus');
  expect(utilitySource).toContain('export function getConnectablePeers');
  expect(utilitySource).toContain('export function processDiscoveredPeerConnections');
  expect(source).not.toContain('!conns[peer.peerId] && !failedConnections.has(peer.peerId)');
  expect(source).not.toContain('function connectAvailablePeers');
});

test('peerJsManager delegates conversation participant mapping to utilities', async () => {
  const source = await readFile('src/services/peerJsManager.js', 'utf8');
  const utilitySource = await readFile('src/utils/peerParticipants.js', 'utf8');

  expect(source).toContain("from '../utils/peerParticipants.js'");
  expect(source).toContain('resolveConversationParticipants({');
  expect(utilitySource).toContain('export function getConnectedParticipants');
  expect(utilitySource).toContain('export function findConversationParticipants');
  expect(utilitySource).toContain('export function resolveConversationParticipants');
  expect(source).not.toContain('findConversationParticipants(conversationsMap, repoFullName, conversationId, conns)');
  expect(source).not.toContain('getStoredOrgParticipants(localStorage, orgId)');
  expect(source).not.toContain("repoFullName?.split('/')[0]");
});

test('peerJsManager delegates peer message dispatch to utilities', async () => {
  const source = await readFile('src/services/peerJsManager.js', 'utf8');
  const utilitySource = await readFile('src/utils/peerMessages.js', 'utf8');
  const messageHandlerSource = source.slice(
    source.indexOf('function handlePeerMessage'),
    source.indexOf('// Handle chat messages')
  );

  expect(source).toContain("import { processPeerDataMessage } from '../utils/peerMessages.js'");
  expect(messageHandlerSource).toContain('processPeerDataMessage({');
  expect(messageHandlerSource).toContain('connections: get(peerConnections)');
  expect(messageHandlerSource).toContain('chat: handleChatMessage');
  expect(utilitySource).toContain('export function dispatchPeerMessage');
  expect(utilitySource).toContain('export function getPeerMessageSenderUsername');
  expect(utilitySource).toContain('export function processPeerDataMessage');
  expect(messageHandlerSource).not.toContain('getPeerMessageType(data)');
  expect(messageHandlerSource).not.toContain('dispatchPeerMessage(data');
  expect(messageHandlerSource).not.toContain('switch (data.type)');
});

test('peerJsManager delegates sync protocol shaping to utilities', async () => {
  const source = await readFile('src/services/peerJsManager.js', 'utf8');
  const utilitySource = await readFile('src/utils/peerSync.js', 'utf8');

  expect(source).toContain("from '../utils/peerSync.js'");
  expect(source).toContain('createSyncRequest(conversationId, lastHash)');
  expect(source).toContain('createSyncRequestChain(conversationId, hashChain)');
  expect(source).toContain('createSyncChainRequestForNeed(message, get(conversations), repoFullName)');
  expect(source).toContain('isValidSyncRequestMessage(msg)');
  expect(source).toContain('isValidSyncChainRequestMessage(msg)');
  expect(source).toContain('processSyncResponseMessage({');
  expect(source).toContain('findRepoConversation(get(conversations), repoFullName, conversationId)');
  expect(source).toContain('createSyncResponseForRequest(msg, getSyncConversation(msg.conversationId))');
  expect(source).toContain('createSyncResponseForChainRequest(msg, getSyncConversation(msg.conversationId))');
  expect(source).toContain('deliverSyncResponse(fromPeerId, response, sendMessageToPeer');
  expect(utilitySource).toContain('export function createSyncResponseAfterHash');
  expect(utilitySource).toContain('export function createSyncResponseForRequest');
  expect(utilitySource).toContain('export function createSyncChainRequestForNeed');
  expect(utilitySource).toContain('export function getSyncResponseDeliveryType');
  expect(utilitySource).toContain('export function deliverSyncResponse');
  expect(utilitySource).toContain('export function normalizeSyncMessages');
  expect(utilitySource).toContain('export function processSyncResponseMessage');
  expect(source).not.toContain('isValidSyncResponseMessage(msg)');
  expect(source).not.toContain('getNormalizedSyncResponseMessages(msg)');
  expect(source).not.toContain('function sendSyncResponse');
  expect(source).not.toContain('getRecentHashes');
  expect(source).not.toContain('findCommonAncestor');
});

test('peerJsManager delegates broadcast target selection to utilities', async () => {
  const source = await readFile('src/services/peerJsManager.js', 'utf8');
  const utilitySource = await readFile('src/utils/peerBroadcast.js', 'utf8');

  expect(source).toContain("from '../utils/peerBroadcast.js'");
  expect(source).toContain('onlinePeers.set(buildOnlinePeerRows(conns))');
  expect(source).toContain('sendToPeerConnection(conns, peerId, message)');
  expect(source).toContain('broadcastToConversationParticipants({');
  expect(source).toContain('broadcastToAllConnections({');
  expect(utilitySource).toContain('export function getConversationBroadcastTargets');
  expect(utilitySource).toContain('export function sendToBroadcastTargets');
  expect(utilitySource).toContain('export function buildOnlinePeerRows');
  expect(utilitySource).toContain('export function broadcastToConversationParticipants');
  expect(utilitySource).toContain('export function broadcastToAllConnections');
  expect(source).not.toContain('getNonParticipantPeers(conns, participantPeers).forEach');
  expect(source).not.toContain('canSendToConnection({ conn, status })');
});

test('peerJsManager delegates chat and typing payload shaping to utilities', async () => {
  const source = await readFile('src/services/peerJsManager.js', 'utf8');
  const chatSource = await readFile('src/utils/peerChat.js', 'utf8');
  const typingSource = await readFile('src/utils/peerTyping.js', 'utf8');

  expect(source).toContain("from '../utils/peerChat.js'");
  expect(source).toContain("from '../utils/peerTyping.js'");
  expect(source).toContain('processIncomingPeerChatMessage({');
  expect(source).toContain('processIncomingTypingMessage({');
  expect(source).toContain('broadcastToAllPeers(createTypingStatusMessage(isTyping))');
  expect(chatSource).toContain('export function createIncomingChatMessage');
  expect(chatSource).toContain('export function processIncomingPeerChatMessage');
  expect(typingSource).toContain('export const TYPING_CLEAR_DELAY_MS');
  expect(typingSource).toContain('export function processIncomingTypingMessage');
  expect(source).not.toContain('isValidChatMessage(msg)');
  expect(source).not.toContain('createIncomingChatMessage(msg, fromUsername)');
  expect(source).not.toContain('applyTypingStatus(users, fromPeerId, fromUsername, msg.isTyping)');
  expect(source).not.toContain('clearExpiredTypingStatus(users, fromPeerId)');
});

test('peerJsManager delegates call media operations to utilities', async () => {
  const source = await readFile('src/services/peerJsManager.js', 'utf8');
  const utilitySource = await readFile('src/utils/peerCallMedia.js', 'utf8');

  expect(source).toContain("from '../utils/peerCallMedia.js'");
  expect(source).toContain('navigator.mediaDevices.getUserMedia(createCallMediaConstraints(video))');
  expect(source).toContain('navigator.mediaDevices.getUserMedia(createCallMediaConstraints(true))');
  expect(source).toContain('switchCallToCamera({');
  expect(source).toContain('switchCallToScreenShare({');
  expect(source).toContain('stopStreamTracks(lStream)');
  expect(utilitySource).toContain('export function stopStreamTracks');
  expect(utilitySource).toContain('export async function switchCallToCamera');
  expect(utilitySource).toContain('export async function switchCallToScreenShare');
});

test('peerJsManager delegates call lifecycle decisions to utilities', async () => {
  const source = await readFile('src/services/peerJsManager.js', 'utf8');
  const utilitySource = await readFile('src/utils/peerCallLifecycle.js', 'utf8');
  const callSource = source.slice(
    source.indexOf('export function initializeCallHandling'),
    source.indexOf('export function toggleScreenShare')
  );

  expect(source).toContain("from '../utils/peerCallLifecycle.js'");
  expect(callSource).toContain('shouldRejectIncomingCall(get(callStatus))');
  expect(callSource).toContain('applyIncomingCallState({ callStatus, remotePeerId }, call)');
  expect(callSource).toContain('bindCallLifecycleEvents(call, {');
  expect(callSource).toContain('closeCallQuietly(currentCall');
  expect(callSource).toContain('applyOutgoingCallState({ localStream, callStatus, remotePeerId, isVideoEnabled }, stream, peerId, video)');
  expect(callSource).toContain('localPeer.call(peerId, stream, createCallMetadata(localUsername))');
  expect(callSource).toContain('isAnswerAlreadyInProgress(get(callStatus))');
  expect(callSource).toContain('applyAnsweredCallState({ localStream }, stream, currentCall)');
  expect(callSource).toContain('applyRemoteStreamState({ remoteStream, callStatus, callStartTime }, stream)');
  expect(callSource).toContain('currentCall = closeCurrentCall(currentCall)');
  expect(callSource).toContain('toggleFirstAudioTrack(stream)');
  expect(callSource).toContain('toggleFirstVideoTrack(stream)');
  expect(source).toContain('onScreenShareEnded: createScreenShareEndedHandler(toggleScreenShare)');
  expect(utilitySource).toContain('export function createCallMetadata');
  expect(utilitySource).toContain('export function bindCallLifecycleEvents');
  expect(callSource).not.toContain("metadata: {\n        username: localUsername");
  expect(callSource).not.toContain("callStatus.set('calling')");
});

test('peerJsManager delegates connection state shaping to utilities', async () => {
  const source = await readFile('src/services/peerJsManager.js', 'utf8');
  const utilitySource = await readFile('src/utils/peerConnectionState.js', 'utf8');
  const lifecycleSource = await readFile('src/utils/peerConnectionLifecycle.js', 'utf8');

  expect(source).toContain("from '../utils/peerConnectionState.js'");
  expect(source).toContain('createPeerConnectionMetadata(localUsername, repoFullName, sessionId)');
  expect(source).toContain('processOpenedPeerConnection({');
  expect(source).toContain('processClosedPeerConnection({');
  expect(utilitySource).toContain('export function createPeerConnectionEntry');
  expect(utilitySource).toContain('export function createOnlineContactUpdate');
  expect(utilitySource).toContain('export function createOfflineContactUpdate');
  expect(lifecycleSource).toContain('getConnectionUsername(connection, username)');
  expect(lifecycleSource).toContain('createPeerConnectionEntry(connection, extractedUsername)');
  expect(lifecycleSource).toContain('createOnlineContactUpdate(peerId)');
  expect(lifecycleSource).toContain('createOfflineContactUpdate()');
  expect(source).not.toContain('getConnectionUsername(conn, username)');
});

test('peerJsManager delegates peer connection lifecycle mutations to utilities', async () => {
  const source = await readFile('src/services/peerJsManager.js', 'utf8');
  const utilitySource = await readFile('src/utils/peerConnectionLifecycle.js', 'utf8');
  const connectSource = source.slice(
    source.indexOf('export function connectToPeer'),
    source.indexOf('// Add a peer connection to the store')
  );
  const removeSource = source.slice(
    source.indexOf('function removePeerConnection'),
    source.indexOf('// Update the online peers store')
  );

  expect(source).toContain("from '../utils/peerConnectionLifecycle.js'");
  expect(connectSource).toContain('const readiness = getLocalPeerConnectionReadiness(localPeer)');
  expect(connectSource).toContain('hasPeerConnection(conns, targetPeerId)');
  expect(connectSource).toContain('markPeerConnectionFailed(failedConnections, peerId, OUTGOING_CONNECTION_RETRY_DELAY_MS)');
  expect(source).toContain('processOpenedPeerConnection({');
  expect(source).toContain('sendConversationSyncRequests(peerId, get(conversations), repoFullName, requestMessageSync, console.log)');
  expect(removeSource).toContain('processClosedPeerConnection({');
  expect(utilitySource).toContain('export function getConversationSyncRequests');
  expect(utilitySource).toContain('export function sendConversationSyncRequests');
  expect(utilitySource).toContain('export function processOpenedPeerConnection');
  expect(utilitySource).toContain('export function processClosedPeerConnection');
  expect(source).not.toContain('addPeerConnectionToState(conns, peerId, createPeerConnectionEntry(conn, extractedUsername))');
  expect(removeSource).not.toContain('getPeerConnectionUsername(conns, peerId)');
  expect(removeSource).not.toContain('removePeerConnectionFromState(conns, peerId)');
  expect(removeSource).not.toContain('removePeerTypingUser(users, peerId)');
  expect(source).not.toContain('getConversationSyncRequests(repoConversations).forEach');
  expect(connectSource).not.toContain('setTimeout(() =>');
  expect(removeSource).not.toContain('setTimeout(() =>');
});

test('peerJsManager delegates peer lifecycle cleanup to utilities', async () => {
  const source = await readFile('src/services/peerJsManager.js', 'utf8');
  const utilitySource = await readFile('src/utils/peerLifecycle.js', 'utf8');
  const shutdownSource = source.slice(
    source.indexOf('export function shutdownPeerManager'),
    source.indexOf('// Initialize PeerJS connection')
  );

  expect(source).toContain("from '../utils/peerLifecycle.js'");
  expect(source).toContain('isSameOpenPeerSession(localPeer, repoFullName, sessionId, _repoFullName, _sessionId)');
  expect(source).toContain('createPeerManagerSession(_repoFullName, _username, _sessionId, generatePeerId)');
  expect(source).toContain('localUsername = nextSession.username');
  expect(source).toContain('new Peer(nextSession.peerId, nextSession.peerOptions)');
  expect(shutdownSource).toContain('healthCheckInterval = clearTimer(healthCheckInterval)');
  expect(shutdownSource).toContain('leadershipPeer = destroyPeer(leadershipPeer)');
  expect(shutdownSource).toContain('connectedToLeader = closeConnection(connectedToLeader)');
  expect(shutdownSource).toContain('closeOpenConnections(conns)');
  expect(shutdownSource).toContain('resetPeerStores({ peerConnections, onlinePeers, typingUsers })');
  expect(utilitySource).toContain('export function resetPeerStores');
  expect(utilitySource).toContain('export function createPeerManagerSession');
  expect(shutdownSource).not.toContain('peerConnections.set({})');
  expect(shutdownSource).not.toContain('onlinePeers.set([])');
  expect(shutdownSource).not.toContain('typingUsers.set({})');
});

test('peerJsManager delegates discovery protocol messages to utilities', async () => {
  const source = await readFile('src/services/peerJsManager.js', 'utf8');
  const utilitySource = await readFile('src/utils/peerDiscovery.js', 'utf8');
  const lifecycleSource = await readFile('src/utils/peerConnectionLifecycle.js', 'utf8');
  const roleSource = await readFile('src/utils/peerLeaderRole.js', 'utf8');
  const messageSource = await readFile('src/utils/peerLeaderMessages.js', 'utf8');

  expect(source).toContain('setupDiscoveryLeadershipRole({');
  expect(source).toContain('processLeaderPeerMessage({');
  expect(messageSource).toContain('registerPeerInRegistry(peerRegistry, connection.peer, message, connection)');
  expect(messageSource).toContain('updatePeerRegistryConversations(peerRegistry, connection.peer, message.conversations)');
  expect(messageSource).toContain('touchPeerRegistryHeartbeat(peerRegistry, connection.peer)');
  expect(source).toContain('bindDiscoveryPeerConnection({');
  expect(roleSource).toContain('createLeaderRegistryEntry(localUsername, repoFullName)');
  expect(roleSource).toContain('removePeerFromRegistry(peerRegistry, connection.peer)');
  expect(source).toContain('processClosedPeerConnection({');
  expect(lifecycleSource).toContain('removeDisconnectedPeerFromLeaderRegistry(peerRegistry, peerId, isCurrentLeader, broadcastPeerListUpdate, log)');
  expect(source).toContain('sendCompletePeerRegistry(conn, peerRegistry, getOrgId(repoFullName), console.log)');
  expect(source).toContain('sendDiscoveryPeerList(conn, peerRegistry, conversationFilter, console.log)');
  expect(source).toContain('sendRegisterWithLeader(conn, localUsername, repoFullName)');
  expect(source).toContain('createHeartbeatMessage()');
  expect(source).toContain('createLeadershipChangeMessage()');
  expect(source).toContain('persistOrgPeerRegistryContacts(localStorage, orgId, peers, updateContact)');
  expect(utilitySource).toContain('export function createLeaderRegistryEntry');
  expect(utilitySource).toContain('export function registerPeerInRegistry');
  expect(utilitySource).toContain('export function updatePeerRegistryConversations');
  expect(utilitySource).toContain('export function touchPeerRegistryHeartbeat');
  expect(utilitySource).toContain('export function removePeerFromRegistry');
  expect(utilitySource).toContain('export function removeDisconnectedPeerFromLeaderRegistry');
  expect(utilitySource).toContain('export function sendRegisterWithLeader');
  expect(utilitySource).toContain('export function createStoredPeerContactUpdate');
  expect(utilitySource).toContain('export function persistOrgPeerRegistryContacts');
  expect(utilitySource).toContain('LEADER_HEALTH_CHECK_INTERVAL_MS');
  expect(source).not.toContain('peerRegistry.delete(peerId)');
});

test('peerJsManager delegates leader health maintenance to utilities', async () => {
  const source = await readFile('src/services/peerJsManager.js', 'utf8');
  const utilitySource = await readFile('src/utils/peerLeaderHealth.js', 'utf8');

  expect(source).toContain("from '../utils/peerLeaderHealth.js'");
  expect(source).toContain('startLeaderMaintenanceTimer(performLeaderMaintenance)');
  expect(source).toContain('performLeaderRegistryMaintenance({');
  expect(source).toContain('stepDownFromDiscoveryLeadership({');
  expect(source).toContain('healthCheckInterval = startLeaderHealthTimer(() =>');
  expect(source).toContain('healthCheckInterval = clearTimer(healthCheckInterval)');
  expect(source).toContain('const action = getLeaderHealthAction(isCurrentLeader, connectedToLeader)');
  expect(source).toContain('!isLeaderConnectionOpen(connectedToLeader)');
  expect(source).toContain('sendLeaderHeartbeat(connectedToLeader, createHeartbeatMessage())');
  expect(source).toContain('scheduleLeaderReconnect(() => tryReconnectToLeader(orgId), LEADERSHIP_RECONNECT_DELAY_MS)');
  expect(utilitySource).toContain('export function pruneStalePeerRegistry');
  expect(utilitySource).toContain('export function performLeaderRegistryMaintenance');
  expect(utilitySource).toContain('export function stepDownFromDiscoveryLeadership');
  expect(utilitySource).toContain('export function getLeaderHealthAction');
  expect(source).not.toContain('pruneStalePeerRegistry(peerRegistry, localPeer.id, now, PEER_STALE_THRESHOLD_MS)');
  expect(source).not.toContain('notifyLeadershipChange(peerRegistry, createLeadershipChangeMessage())');
  expect(source).not.toContain('setInterval(() => {\n    performLeaderMaintenance();');
});

test('peerJsManager delegates leadership claiming to a utility', async () => {
  const source = await readFile('src/services/peerJsManager.js', 'utf8');
  const utilitySource = await readFile('src/utils/peerLeadershipClaim.js', 'utf8');
  const claimSource = source.slice(
    source.indexOf('function claimLeadershipSlot'),
    source.indexOf('function setupLeadershipRole')
  );

  expect(source).toContain("import { claimPeerLeadershipSlot } from '../utils/peerLeadershipClaim.js'");
  expect(source).toContain("from '../utils/peerDiscoveryStartup.js'");
  expect(source).toContain('attemptDiscoveryLeadership({');
  expect(claimSource).toContain('return claimPeerLeadershipSlot({');
  expect(claimSource).toContain('PeerClass: Peer');
  expect(claimSource).toContain('onLeadershipPeer: (leader) =>');
  expect(claimSource).toContain('onLeadershipSetup: () => setupLeadershipRole(orgId)');
  expect(utilitySource).toContain('export function claimPeerLeadershipSlot');
  expect(utilitySource).toContain("reject(new Error('Leadership claim timeout'))");
  expect(claimSource).not.toContain('new Promise');
  expect(claimSource).not.toContain("err.type === 'unavailable-id'");
});

test('peerJsManager delegates discovery message dispatch to utilities', async () => {
  const source = await readFile('src/services/peerJsManager.js', 'utf8');
  const utilitySource = await readFile('src/utils/peerLeaderMessages.js', 'utf8');
  const leaderMessageSource = source.slice(
    source.indexOf('function handleLeaderMessage'),
    source.indexOf('function sendPeerRegistry')
  );
  const leaderResponseSource = source.slice(
    source.indexOf('function handleLeaderResponse'),
    source.indexOf('function storePeerRegistry')
  );

  expect(source).toContain("import { handleLeaderDiscoveryResponse, processLeaderPeerMessage } from '../utils/peerLeaderMessages.js'");
  expect(leaderMessageSource).toContain('processLeaderPeerMessage({');
  expect(leaderMessageSource).toContain('sendPeerRegistry,');
  expect(leaderResponseSource).toContain('handleLeaderDiscoveryResponse(data, {');
  expect(leaderResponseSource).toContain('onLeadershipChange: () =>');
  expect(utilitySource).toContain('export function dispatchDiscoveryMessage');
  expect(utilitySource).toContain('export function handleLeaderDiscoveryResponse');
  expect(utilitySource).toContain('export function processLeaderPeerMessage');
  expect(leaderMessageSource).not.toContain('switch (data.type)');
  expect(leaderMessageSource).not.toContain('register: (message) =>');
  expect(leaderResponseSource).not.toContain('switch (data.type)');
  expect(leaderResponseSource).not.toContain('peer_registry: (message) =>');
});

test('peerJsManager delegates PeerJS connection event binding to a utility', async () => {
  const source = await readFile('src/services/peerJsManager.js', 'utf8');
  const utilitySource = await readFile('src/utils/peerConnectionEvents.js', 'utf8');
  const roleSource = await readFile('src/utils/peerLeaderRole.js', 'utf8');

  expect(source).toContain("import { bindLeaderConnectionEvents, bindPeerDataConnection, bindPeerEvents } from '../utils/peerConnectionEvents.js'");
  expect(source).toContain("import { bindDiscoveryPeerConnection, setupDiscoveryLeadershipRole } from '../utils/peerLeaderRole.js'");
  expect(source).toContain('bindLeaderConnectionEvents(conn, {');
  expect(source).toContain('bindDiscoveryPeerConnection({');
  expect(source).toContain('bindPeerDataConnection(conn, {');
  expect(source).toContain('bindPeerEvents(localPeer, {');
  expect(roleSource).toContain('bindConnectionEvents(connection, {');
  expect(roleSource).toContain('bindPeerEvents(leadershipPeer, {');
  expect(source).toContain('data: (data, peerId, peerUsername) =>');
  expect(utilitySource).toContain('export function bindConnectionEvents');
  expect(utilitySource).toContain('export function bindLeaderConnectionEvents');
  expect(utilitySource).toContain('export function bindPeerDataConnection');
  expect(utilitySource).toContain('export function bindPeerEvents');
  expect(utilitySource).toContain("connection.on('open', handlers.open)");
  expect(source).not.toContain("connection.on('data',");
});

test('peerJsManager delegates commit protocol payloads to utilities', async () => {
  const source = await readFile('src/services/peerJsManager.js', 'utf8');
  const utilitySource = await readFile('src/utils/peerCommitProtocol.js', 'utf8');

  expect(source).toContain("from '../utils/peerCommitProtocol.js'");
  expect(source).toContain('notifyLeaderOfConversations(connectedToLeader, conversations, createUpdateConversationsMessage)');
  expect(source).toContain('shouldBroadcastCommittedEvent(event)');
  expect(source).toContain('broadcastCommittedEvent(event, broadcastToAllPeers, createCommittedMessagesMessage)');
  expect(source).toContain('applyCommittedMessagesNotification(msg, markMessagesCommitted)');
  expect(utilitySource).toContain('export function createCommittedMessagesMessage');
  expect(utilitySource).toContain('export function applyCommittedMessagesNotification');
  expect(source).not.toContain('Add to handlePeerMessage switch');
  expect(source).not.toContain("case 'messages_committed':");
});

test('peerJsManager delegates leader commit interval control to utilities', async () => {
  const source = await readFile('src/services/peerJsManager.js', 'utf8');
  const utilitySource = await readFile('src/utils/peerCommitInterval.js', 'utf8');
  const intervalSource = source.slice(
    source.indexOf('// Simple leader election'),
    source.indexOf('// Hash-based message sync protocol')
  );

  expect(source).toContain("from '../utils/peerCommitInterval.js'");
  expect(intervalSource).toContain('return getCurrentLeaderId(localPeer?.id, conns)');
  expect(intervalSource).toContain('return isLocalPeerLeader(localPeer?.id, get(peerConnections))');
  expect(intervalSource).toContain('shouldRunLeaderCommitInterval(localPeer?.id, conns)');
  expect(intervalSource).toContain('leaderCommitInterval = startLeaderCommitTimer(flushConversationCommitQueue, isLeader)');
  expect(intervalSource).toContain('leaderCommitInterval = stopLeaderCommitTimer(leaderCommitInterval)');
  expect(utilitySource).toContain('export const LEADER_COMMIT_INTERVAL_MS');
  expect(intervalSource).not.toContain('10 * 60 * 1000');
  expect(intervalSource).not.toContain('clearInterval(leaderCommitInterval)');
});

test('peerJsManager delegates conversation update notifications to utilities', async () => {
  const source = await readFile('src/services/peerJsManager.js', 'utf8');
  const utilitySource = await readFile('src/utils/peerConversationUpdates.js', 'utf8');
  const updateSource = source.slice(
    source.indexOf('export function updateMyConversations'),
    source.indexOf('// Subscribe to committed events')
  );

  expect(source).toContain("from '../utils/peerConversationUpdates.js'");
  expect(updateSource).toContain('applyLeaderConversationUpdate(peerRegistry, localPeer.id, conversations)');
  expect(updateSource).toContain('shouldNotifyLeaderOfConversations(connectedToLeader)');
  expect(updateSource).toContain('notifyLeaderOfConversations(connectedToLeader, conversations, createUpdateConversationsMessage)');
  expect(utilitySource).toContain('export function applyLeaderConversationUpdate');
  expect(updateSource).not.toContain('myInfo.conversations = conversations');
  expect(updateSource).not.toContain('connectedToLeader.send(createUpdateConversationsMessage(conversations))');
});
