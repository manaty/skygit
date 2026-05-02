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

  expect(source).toContain("from '../utils/peerDiscovery.js'");
  expect(source).toContain('buildPeerRegistryList(peerRegistry)');
  expect(source).toContain('buildFilteredPeerList(peerRegistry, conversationFilter)');
  expect(source).toContain('toStoredOrgPeers(peers)');
  expect(source).toContain('buildLeaderId(orgId)');
  expect(source).toContain('getOrgId(repoFullName)');
  expect(utilitySource).toContain('export function generatePeerId');
  expect(source).not.toContain("repoFullName.split('/')[0]");
  expect(source).not.toContain("`skygit_discovery_${orgId}`");
});

test('peerJsManager delegates discovery connection timeouts to a utility', async () => {
  const source = await readFile('src/services/peerJsManager.js', 'utf8');
  const utilitySource = await readFile('src/utils/peerConnection.js', 'utf8');

  expect(source).toContain("import { connectPeerWithTimeout } from '../utils/peerConnection.js'");
  expect(source).toContain('return connectPeerWithTimeout(localPeer, peerId, { username: localUsername, type: \'discovery\' }, timeout);');
  expect(utilitySource).toContain('export function connectPeerWithTimeout');
  expect(utilitySource).toContain("reject(new Error('Connection timeout'))");
  expect(source).not.toContain("reject(new Error('Connection timeout'))");
});

test('peerJsManager delegates peer connection eligibility to discovery utilities', async () => {
  const source = await readFile('src/services/peerJsManager.js', 'utf8');
  const utilitySource = await readFile('src/utils/peerDiscovery.js', 'utf8');

  expect(source).toContain('getPeerConnectionStatus(peer, localPeer.id, conns, failedConnections)');
  expect(utilitySource).toContain('export function getPeerConnectionStatus');
  expect(utilitySource).toContain('export function getConnectablePeers');
  expect(source).not.toContain('!conns[peer.peerId] && !failedConnections.has(peer.peerId)');
});

test('peerJsManager delegates conversation participant mapping to utilities', async () => {
  const source = await readFile('src/services/peerJsManager.js', 'utf8');
  const utilitySource = await readFile('src/utils/peerParticipants.js', 'utf8');

  expect(source).toContain("from '../utils/peerParticipants.js'");
  expect(source).toContain('getConversationStoreParticipants(conversation, conns)');
  expect(source).toContain('getStoredOrgParticipants(localStorage, orgId)');
  expect(source).toContain('getConnectedParticipants(conns)');
  expect(utilitySource).toContain('export function getConnectedParticipants');
  expect(source).not.toContain("repoFullName?.split('/')[0]");
});

test('peerJsManager delegates peer message dispatch to utilities', async () => {
  const source = await readFile('src/services/peerJsManager.js', 'utf8');
  const utilitySource = await readFile('src/utils/peerMessages.js', 'utf8');
  const messageHandlerSource = source.slice(
    source.indexOf('function handlePeerMessage'),
    source.indexOf('// Handle chat messages')
  );

  expect(source).toContain("import { dispatchPeerMessage, getPeerMessageType } from '../utils/peerMessages.js'");
  expect(messageHandlerSource).toContain('dispatchPeerMessage(data, {');
  expect(messageHandlerSource).toContain('chat: (message) => handleChatMessage(message, username, fromPeerId)');
  expect(utilitySource).toContain('export function dispatchPeerMessage');
  expect(messageHandlerSource).not.toContain('switch (data.type)');
});

test('peerJsManager delegates sync protocol shaping to utilities', async () => {
  const source = await readFile('src/services/peerJsManager.js', 'utf8');
  const utilitySource = await readFile('src/utils/peerSync.js', 'utf8');

  expect(source).toContain("from '../utils/peerSync.js'");
  expect(source).toContain('createSyncRequest(conversationId, lastHash)');
  expect(source).toContain('createSyncRequestChain(conversationId, hashChain)');
  expect(source).toContain('createSyncResponseAfterHash(conversation, msg.conversationId, msg.lastHash)');
  expect(source).toContain('createSyncResponseFromHashChain(conversation, msg.conversationId, msg.hashChain)');
  expect(source).toContain('normalizeSyncMessages(msg.messages)');
  expect(utilitySource).toContain('export function createSyncResponseAfterHash');
  expect(utilitySource).toContain('export function normalizeSyncMessages');
  expect(source).not.toContain('findCommonAncestor');
});

test('peerJsManager delegates broadcast target selection to utilities', async () => {
  const source = await readFile('src/services/peerJsManager.js', 'utf8');
  const utilitySource = await readFile('src/utils/peerBroadcast.js', 'utf8');

  expect(source).toContain("from '../utils/peerBroadcast.js'");
  expect(source).toContain('onlinePeers.set(buildOnlinePeerRows(conns))');
  expect(source).toContain('getConversationBroadcastTargets(conns, participantPeers)');
  expect(source).toContain('getAllBroadcastTargets(conns).forEach');
  expect(source).toContain('canSendToConnection({ conn, status })');
  expect(utilitySource).toContain('export function getConversationBroadcastTargets');
  expect(utilitySource).toContain('export function buildOnlinePeerRows');
});

test('peerJsManager delegates chat and typing payload shaping to utilities', async () => {
  const source = await readFile('src/services/peerJsManager.js', 'utf8');
  const chatSource = await readFile('src/utils/peerChat.js', 'utf8');
  const typingSource = await readFile('src/utils/peerTyping.js', 'utf8');

  expect(source).toContain("from '../utils/peerChat.js'");
  expect(source).toContain("from '../utils/peerTyping.js'");
  expect(source).toContain('isValidChatMessage(msg)');
  expect(source).toContain('createIncomingChatMessage(msg, fromUsername)');
  expect(source).toContain('applyTypingStatus(users, fromPeerId, fromUsername, msg.isTyping)');
  expect(source).toContain('clearExpiredTypingStatus(users, fromPeerId)');
  expect(source).toContain('broadcastToAllPeers(createTypingStatusMessage(isTyping))');
  expect(chatSource).toContain('export function createIncomingChatMessage');
  expect(typingSource).toContain('export const TYPING_CLEAR_DELAY_MS');
});

test('peerJsManager delegates call media operations to utilities', async () => {
  const source = await readFile('src/services/peerJsManager.js', 'utf8');
  const utilitySource = await readFile('src/utils/peerCallMedia.js', 'utf8');

  expect(source).toContain("from '../utils/peerCallMedia.js'");
  expect(source).toContain('navigator.mediaDevices.getUserMedia(createCallMediaConstraints(video))');
  expect(source).toContain('navigator.mediaDevices.getUserMedia(createCallMediaConstraints(true))');
  expect(source).toContain('navigator.mediaDevices.getUserMedia(createCameraVideoConstraints())');
  expect(source).toContain('navigator.mediaDevices.getDisplayMedia(createScreenShareConstraints())');
  expect(source).toContain('replaceStreamVideoTrack(currentStream, newVideoTrack)');
  expect(source).toContain('replaceCallVideoSender(currentCall, screenTrack)');
  expect(source).toContain('stopStreamTracks(lStream)');
  expect(utilitySource).toContain('export function stopStreamTracks');
});

test('peerJsManager delegates connection state shaping to utilities', async () => {
  const source = await readFile('src/services/peerJsManager.js', 'utf8');
  const utilitySource = await readFile('src/utils/peerConnectionState.js', 'utf8');

  expect(source).toContain("from '../utils/peerConnectionState.js'");
  expect(source).toContain('createPeerConnectionMetadata(localUsername, repoFullName, sessionId)');
  expect(source).toContain('getConnectionUsername(conn, username)');
  expect(source).toContain('createPeerConnectionEntry(conn, extractedUsername)');
  expect(source).toContain('createOnlineContactUpdate(peerId)');
  expect(source).toContain('createOfflineContactUpdate()');
  expect(utilitySource).toContain('export function createPeerConnectionEntry');
  expect(utilitySource).toContain('export function createOnlineContactUpdate');
});
