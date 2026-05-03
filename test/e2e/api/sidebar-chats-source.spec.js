import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

async function readPeerManagerSource() {
  const [facadeSource, runtimeSource] = await Promise.all([
    readFile('src/services/peerJsManager.js', 'utf8'),
    readFile('src/services/peerManagerRuntime.js', 'utf8')
  ]);

  return `${facadeSource}\n${runtimeSource}`;
}

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

test('GoogleDriveSetupGuide delegates setup helper logic to a service', async () => {
  const source = await readFile('src/components/GoogleDriveSetupGuide.svelte', 'utf8');
  const serviceSource = await readFile('src/services/googleDriveSetupGuideService.js', 'utf8');

  expect(source).toContain("from '../services/googleDriveSetupGuideService.js'");
  expect(source).toContain('buildGoogleDriveAuthorizationUrl({');
  expect(source).toContain('buildGoogleDriveTokenExchangeScript({');
  expect(source).toContain('setupComplete = isGoogleDriveSetupComplete(credentials)');
  expect(serviceSource).toContain('export function buildGoogleDriveAuthorizationUrl');
  expect(serviceSource).toContain('export function isGoogleDriveSetupComplete');
  expect(source).not.toContain('scope=https://www.googleapis.com/auth/drive.file&access_type=offline');
  expect(source).not.toContain('CLIENT_ID = "${credentials.client_id');
});

test('GoogleDriveSetupGuide delegates modal header and navigation controls', async () => {
  const source = await readFile('src/components/GoogleDriveSetupGuide.svelte', 'utf8');
  const headerSource = await readFile('src/components/GoogleDriveSetupHeader.svelte', 'utf8');
  const navigationSource = await readFile('src/components/GoogleDriveSetupNavigation.svelte', 'utf8');

  expect(source).toContain("import GoogleDriveSetupHeader from './GoogleDriveSetupHeader.svelte'");
  expect(source).toContain("import GoogleDriveSetupNavigation from './GoogleDriveSetupNavigation.svelte'");
  expect(source).toContain('<GoogleDriveSetupHeader onClose={handleClose} />');
  expect(source).toContain('<GoogleDriveSetupNavigation');
  expect(headerSource).toContain('aria-label="Close Google Drive setup guide"');
  expect(navigationSource).toContain('GOOGLE_DRIVE_SETUP_STEPS');
  expect(navigationSource).toContain('Complete Setup');
  expect(source).not.toContain('aria-label="Go to Google Drive setup step {step}"');
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

test('Chats delegates active call rendering to a component', async () => {
  const source = await readFile('src/routes/Chats.svelte', 'utf8');
  const callPanelSource = await readFile('src/components/ConversationCallPanel.svelte', 'utf8');

  expect(source).toContain("import ConversationCallPanel from '../components/ConversationCallPanel.svelte'");
  expect(source).toContain('<ConversationCallPanel');
  expect(source).toContain('onToggleRecording={recording ? stopRecording : startRecording}');
  expect(callPanelSource).toContain('export let localStream = null');
  expect(callPanelSource).toContain('bind:this={localVideoEl}');
  expect(callPanelSource).toContain('bind:this={remoteVideoEl}');
  expect(callPanelSource).toContain('bind:this={screenSharePreviewEl}');
  expect(callPanelSource).toContain('on:change={onFileInput}');
  expect(callPanelSource).toContain("on:click={() => onSelectShareType('screen')}");
  expect(callPanelSource).toContain("on:click={() => onSelectUploadDestination('google_drive')}");
  expect(source).not.toContain('let localVideoEl');
  expect(source).not.toContain('let remoteVideoEl');
  expect(source).not.toContain('let screenSharePreviewEl');
  expect(source).not.toContain('Screen Share Preview');
  expect(source).not.toContain('Choose upload destination');
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

test('Chats delegates selected conversation content loading to a service', async () => {
  const source = await readFile('src/routes/Chats.svelte', 'utf8');
  const serviceSource = await readFile('src/services/conversationSelectionService.js', 'utf8');

  expect(source).toContain("import { loadSelectedConversationContents } from '../services/conversationSelectionService.js'");
  expect(source).toContain('loadSelectedConversationContents({');
  expect(source).toContain('setSelectedConversation: value => {');
  expect(serviceSource).toContain('export function shouldLoadConversationMessages');
  expect(serviceSource).toContain('export function createConversationContentRequest');
  expect(serviceSource).toContain('export async function fetchConversationMessages');
  expect(serviceSource).toContain('export async function loadSelectedConversationContents');
  expect(serviceSource).toContain('removeConversationFromStore(conversationsStore, conversation)');
  expect(source).not.toContain('https://api.github.com/repos/${selectedConversation.repo}/contents');
  expect(source).not.toContain('JSON.parse(atob(blob.content))');
  expect(source).not.toContain('Conversation file was deleted from GitHub');
});

test('Chats delegates route conversation selection state to a service', async () => {
  const source = await readFile('src/routes/Chats.svelte', 'utf8');
  const serviceSource = await readFile('src/services/conversationRouteSelectionService.js', 'utf8');

  expect(source).toContain("import { applyConversationRouteSelection } from '../services/conversationRouteSelectionService.js'");
  expect(source).toContain('const selection = applyConversationRouteSelection({');
  expect(source).toContain('selectedConversation = selection.selectedConversation');
  expect(source).toContain('currentRepo = selection.currentRepo');
  expect(serviceSource).toContain('export function getConversationRouteRepo');
  expect(serviceSource).toContain('selectedConversationStore.set(conversation)');
  expect(source).not.toContain('selectedConversationStore.set(value);');
  expect(source).not.toContain('currentRepo = getRepoByFullName(value.repo)');
});

test('Chats delegates GitHub sync timer to a controller service', async () => {
  const source = await readFile('src/routes/Chats.svelte', 'utf8');
  const keySource = await readFile('src/services/conversationSyncKeyService.js', 'utf8');

  expect(source).toContain('createConversationSyncController');
  expect(source).toContain('fetchAndMergeConversation');
  expect(source).toContain("from '../services/conversationSyncKeyService.js'");
  expect(source).toContain('syncKey = applyConversationSyncKeyChange({');
  expect(source).toContain('nextKey: getConversationSyncKey(selectedConversation, pollingActive)');
  expect(keySource).toContain('export function getConversationSyncKey');
  expect(keySource).toContain('export function applyConversationSyncKeyChange');
  expect(keySource).toContain('syncController.stop();');
  expect(keySource).toContain('syncController.start();');
  expect(source).not.toContain('let syncInterval');
  expect(source).not.toContain('setInterval(syncMessagesFromGitHub');
  expect(source).not.toContain('const nextSyncKey = selectedConversation');
});

test('Chats delegates synced conversation store updates to a service', async () => {
  const source = await readFile('src/routes/Chats.svelte', 'utf8');
  const serviceSource = await readFile('src/services/conversationSyncStateService.js', 'utf8');

  expect(source).toContain("import { applySyncedConversationToStores } from '../services/conversationSyncStateService.js'");
  expect(source).toContain('applySyncedConversationToStores({');
  expect(source).toContain('previousConversation: selectedConversation');
  expect(serviceSource).toContain('export function replaceConversationInRepoList');
  expect(serviceSource).toContain('selectedConversationStore.set(updatedConversation)');
  expect(serviceSource).toContain('conversationsStore.update(map =>');
  expect(source).not.toContain('const updated = list.map');
  expect(source).not.toContain('updatedConversation.messages.length - (selectedConversation.messages || []).length');
});

test('Chats delegates recording upload credential selection to a utility', async () => {
  const source = await readFile('src/routes/Chats.svelte', 'utf8');

  expect(source).toContain("import { getRecordingUploadCredentials } from '../utils/uploadCredentials.js'");
  expect(source).toContain('getRecordingUploadCredentials(');
  expect(source).not.toContain('window.selectedRepo');
  expect(source).not.toContain('getDriveCredential');
});

test('Chats delegates recording upload and share flow to a service', async () => {
  const source = await readFile('src/routes/Chats.svelte', 'utf8');
  const serviceSource = await readFile('src/services/conversationRecordingUploadService.js', 'utf8');

  expect(source).toContain("import { uploadAndShareConversationRecording } from '../services/conversationRecordingUploadService.js'");
  expect(source).toContain('uploadAndShareConversationRecording({');
  expect(source).toContain('chooseUploadDestination: chooseUploadDestinationIfNeeded');
  expect(source).toContain('uploadToS3: uploadRecordingToS3');
  expect(source).toContain('uploadToGoogleDrive: uploadRecordingToGoogleDrive');
  expect(serviceSource).toContain('export function createRecordingMessage');
  expect(serviceSource).toContain('export async function uploadRecordingToDestination');
  expect(serviceSource).toContain('export async function uploadAndShareConversationRecording');
  expect(serviceSource).toContain('getRecordingUploadCredentials');
  expect(serviceSource).toContain('sendMessageToPeer(currentCallPeer, createMessage(link))');
  expect(source).not.toContain("sendMessageToPeer(currentCallPeer, { type: 'chat', content: `");
  expect(source).not.toContain("if (destination === 's3')");
  expect(source).not.toContain("if (destination === 'google_drive')");
});

test('Chats delegates MediaRecorder lifecycle to a recording controller service', async () => {
  const source = await readFile('src/routes/Chats.svelte', 'utf8');
  const serviceSource = await readFile('src/services/conversationRecordingController.js', 'utf8');

  expect(source).toContain("import { createConversationRecordingController } from '../services/conversationRecordingController.js'");
  expect(source).toContain('const recordingController = createConversationRecordingController({');
  expect(source).toContain('getLocalStream: () => localStream');
  expect(source).toContain('uploadRecording: uploadAndShareRecording');
  expect(source).toContain('recordingController.start();');
  expect(source).toContain('recordingController.stop();');
  expect(serviceSource).toContain('export function createConversationMediaRecorder');
  expect(serviceSource).toContain('export function createConversationRecordingController');
  expect(source).not.toContain('new MediaRecorder');
  expect(source).not.toContain('recordedChunks');
  expect(source).not.toContain('handleRecordingStop');
});

test('Chats delegates upload destination choice without polling the modal', async () => {
  const source = await readFile('src/routes/Chats.svelte', 'utf8');
  const serviceSource = await readFile('src/services/uploadDestinationChoiceStateService.js', 'utf8');

  expect(source).toContain("import { chooseRecordingUploadDestination } from '../utils/uploadDestinationChoice.js'");
  expect(source).toContain("from '../services/uploadDestinationChoiceStateService.js'");
  expect(source).toContain('chooseRecordingUploadDestination(availableDestinations');
  expect(source).toContain('uploadDestinationChoice = createUploadDestinationChoiceState()');
  expect(source).toContain('requestUploadDestinationChoice({');
  expect(source).toContain('uploadDestinationChoice = resetUploadDestinationChoice(uploadDestinationChoice)');
  expect(source).toContain('uploadDestinationChoice = selectUploadDestinationChoice(uploadDestinationChoice, destination)');
  expect(serviceSource).toContain('export function requestUploadDestinationChoice');
  expect(serviceSource).toContain('state.resolveChoice(null)');
  expect(source).not.toContain('const interval = setInterval(() =>');
  expect(source).not.toContain('resolveUploadDestinationChoice');
});

test('Chats delegates share type modal state to a service', async () => {
  const source = await readFile('src/routes/Chats.svelte', 'utf8');
  const serviceSource = await readFile('src/services/conversationShareTypeStateService.js', 'utf8');

  expect(source).toContain("from '../services/conversationShareTypeStateService.js'");
  expect(source).toContain('shareTypeState = createConversationShareTypeState()');
  expect(source).toContain('shareTypeState = openConversationShareTypeModal(shareTypeState)');
  expect(source).toContain('shareTypeState = closeConversationShareTypeModal(shareTypeState)');
  expect(source).toContain('shareTypeState = selectConversationShareType(shareTypeState, type)');
  expect(serviceSource).toContain('export function createConversationShareTypeState');
  expect(serviceSource).toContain('export function selectConversationShareType');
  expect(source).not.toContain("let shareType = 'screen'");
});

test('Chats cleans up store subscriptions and beforeunload listeners', async () => {
  const source = await readFile('src/routes/Chats.svelte', 'utf8');

  expect(source).toContain('const unsubscribePolling = presencePolling.subscribe');
  expect(source).toContain('const unsubscribeCurrentContent = currentContent.subscribe');
  expect(source).toContain("window.addEventListener('beforeunload', cleanupPresence)");
  expect(source).toContain("window.removeEventListener('beforeunload', cleanupPresence)");
  expect(source).toContain('unsubscribePolling();');
  expect(source).toContain('unsubscribeCurrentContent();');
  expect(source).not.toContain('const unsubscribePeerConnections = peerConnections.subscribe');
  expect(source).not.toContain('unsubscribePeerConnections();');
});

test('Chats avoids unused route-local state after conversation refactors', async () => {
  const source = await readFile('src/routes/Chats.svelte', 'utf8');

  expect(source).not.toContain('onMount');
  expect(source).not.toContain('derived');
  expect(source).not.toContain('let onlineUsers');
  expect(source).not.toContain('let fileSendProgress');
});

test('Chats delegates conversation presence polling and toggles to a service', async () => {
  const source = await readFile('src/routes/Chats.svelte', 'utf8');
  const serviceSource = await readFile('src/services/conversationPresenceService.js', 'utf8');

  expect(source).toContain("from '../services/conversationPresenceService.js'");
  expect(source).toContain('getConversationPresenceContext({');
  expect(source).toContain('toggleConversationPresence({');
  expect(source).toContain('applyConversationPresencePolling({');
  expect(source).toContain('getSessionId: getOrCreateSessionId');
  expect(serviceSource).toContain('export function startConversationPresence');
  expect(serviceSource).toContain('updateMyConversations([repoFullName])');
  expect(serviceSource).toContain('setPollingState(repoFullName, false)');
  expect(source).not.toContain("initializePeerManager({ _token:");
  expect(source).not.toContain('setTimeout(() => {\n          updateMyConversations');
});

test('Chats delegates force commit queue keys to a service', async () => {
  const source = await readFile('src/routes/Chats.svelte', 'utf8');
  const serviceSource = await readFile('src/services/conversationForceCommitService.js', 'utf8');

  expect(source).toContain("import { forceCommitSelectedConversation } from '../services/conversationForceCommitService.js'");
  expect(source).toContain('forceCommitSelectedConversation({');
  expect(source).toContain('flushQueue: flushConversationCommitQueue');
  expect(serviceSource).toContain('export function createConversationCommitQueueKey');
  expect(serviceSource).toContain('`${conversation.repo}::${conversation.id}`');
  expect(source).not.toContain('`${selectedConversation.repo}::${selectedConversation.id}`');
});

test('Chats delegates global browser callbacks to a cleanup-aware service', async () => {
  const source = await readFile('src/routes/Chats.svelte', 'utf8');
  const serviceSource = await readFile('src/services/browserCallbackService.js', 'utf8');
  const handlerSource = await readFile('src/services/conversationBrowserEventHandlers.js', 'utf8');

  expect(source).toContain("import { registerSkyGitBrowserCallbacks } from '../services/browserCallbackService.js'");
  expect(source).toContain("import { createConversationBrowserEventHandlers } from '../services/conversationBrowserEventHandlers.js'");
  expect(source).toContain('registerSkyGitBrowserCallbacks(createConversationBrowserEventHandlers({');
  expect(source).toContain('unregisterBrowserCallbacks();');
  expect(source).not.toContain('window.skygitOnRecordingStatus =');
  expect(source).not.toContain('window.skygitFileSendProgress =');
  expect(serviceSource).toContain('delete windowRef[name]');
  expect(handlerSource).toContain('export function createConversationBrowserEventHandlers');
  expect(handlerSource).toContain('applyConversationFileReceiveProgress');
  expect(handlerSource).toContain('applyConversationFileSendProgress');
});

test('Chats delegates file transfer percentage calculation to a utility', async () => {
  const source = await readFile('src/routes/Chats.svelte', 'utf8');
  const utilitySource = await readFile('src/utils/transferProgress.js', 'utf8');
  const serviceSource = await readFile('src/services/conversationTransferProgressService.js', 'utf8');

  expect(source).toContain("from '../services/conversationBrowserEventHandlers.js'");
  expect(serviceSource).toContain("import { calculateTransferPercent } from '../utils/transferProgress.js'");
  expect(serviceSource).toContain('calculatePercent = calculateTransferPercent');
  expect(serviceSource).toContain('calculatePercent(received, total)');
  expect(serviceSource).toContain('calculatePercent(sent, total)');
  expect(serviceSource).toContain('schedule(clearReceiveState, clearDelay)');
  expect(serviceSource).toContain('schedule(clearSendState, clearDelay)');
  expect(source).not.toContain('applyConversationFileReceiveProgress({');
  expect(source).not.toContain('applyConversationFileSendProgress({');
  expect(source).not.toContain('Math.round((received / total) * 100)');
  expect(source).not.toContain('Math.round((sent / total) * 100)');
  expect(source).not.toContain('received === total');
  expect(source).not.toContain('sent === total');
  expect(utilitySource).toContain('total <= 0');
});

test('Chats delegates conversation screen sharing operations to a utility', async () => {
  const source = await readFile('src/routes/Chats.svelte', 'utf8');
  const utilitySource = await readFile('src/utils/conversationScreenShare.js', 'utf8');

  expect(source).toContain("from '../utils/conversationScreenShare.js'");
  expect(source).toContain('startConversationScreenShare({');
  expect(source).toContain('stopConversationScreenShare({');
  expect(source).toContain('changeConversationScreenSource({');
  expect(utilitySource).toContain("import { stopStreamTracks } from './peerCallMedia.js'");
  expect(utilitySource).toContain('export function createDisplayMediaOptions');
  expect(utilitySource).toContain('export async function startConversationScreenShare');
  expect(utilitySource).toContain('export function stopConversationScreenShare');
  expect(utilitySource).toContain('export async function changeConversationScreenSource');
  expect(utilitySource).toContain('sendScreenShareSignal(peer, true, { audio: withAudio })');
  expect(source).not.toContain("displaySurface: 'browser'");
  expect(source).not.toContain("displaySurface: 'window'");
  expect(source).not.toContain("displaySurface: 'monitor'");
  expect(source).not.toContain('peer.replaceVideoTrack(screenShareStream.getVideoTracks()[0])');
});

test('Chats delegates peer call signals and file transfer dispatch to utilities', async () => {
  const source = await readFile('src/routes/Chats.svelte', 'utf8');
  const utilitySource = await readFile('src/utils/conversationPeerSignals.js', 'utf8');

  expect(source).toContain("from '../utils/conversationPeerSignals.js'");
  expect(source).toContain('sendConversationFile({');
  expect(source).toContain('sendConversationMediaStatus({');
  expect(source).toContain('sendConversationRecordingStatus({');
  expect(utilitySource).toContain('export function sendPeerPayload');
  expect(utilitySource).toContain("message: { type: 'media-status', micOn, cameraOn }");
  expect(utilitySource).toContain("message: { type: 'recording-status', recording }");
  expect(utilitySource).toContain('peer.sendFile(file)');
  expect(source).not.toContain('peer.send({ type:');
  expect(source).not.toContain('peer.sendFile(file)');
});

test('Chats delegates file input send guards to a service', async () => {
  const source = await readFile('src/routes/Chats.svelte', 'utf8');
  const serviceSource = await readFile('src/services/conversationFileSendService.js', 'utf8');

  expect(source).toContain("import { startConversationFileSend } from '../services/conversationFileSendService.js'");
  expect(source).toContain('startConversationFileSend({');
  expect(source).toContain('sendFile: file => sendConversationFile({');
  expect(source).toContain("if (result.status !== 'started') return;");
  expect(serviceSource).toContain('export function getConversationInputFile');
  expect(serviceSource).toContain('!file || !callActive || !currentCallPeer');
  expect(source).not.toContain('event.target.files[0]');
  expect(source).not.toContain('if (!file || !callActive || !currentCallPeer) return;');
});

test('Chats delegates local media status toggles to a service', async () => {
  const source = await readFile('src/routes/Chats.svelte', 'utf8');
  const serviceSource = await readFile('src/services/conversationMediaStatusService.js', 'utf8');

  expect(source).toContain("from '../services/conversationMediaStatusService.js'");
  expect(source).toContain('toggleConversationMicState({');
  expect(source).toContain('toggleConversationCameraState({');
  expect(source).toContain('sendStatus: sendMediaStatus');
  expect(source).toContain('function sendMediaStatus(status = { micOn, cameraOn })');
  expect(serviceSource).toContain('export function setStreamTracksEnabled');
  expect(serviceSource).toContain("setStreamTracksEnabled(localStream, 'audio', nextMicOn)");
  expect(serviceSource).toContain("setStreamTracksEnabled(localStream, 'video', nextCameraOn)");
  expect(source).not.toContain('getAudioTracks().forEach');
  expect(source).not.toContain('getVideoTracks().forEach');
});

test('Chats delegates conversation call start and end sessions to a service', async () => {
  const source = await readFile('src/routes/Chats.svelte', 'utf8');
  const serviceSource = await readFile('src/services/conversationCallSessionService.js', 'utf8');

  expect(source).toContain("from '../services/conversationCallSessionService.js'");
  expect(source).toContain('startConversationCallSession({');
  expect(source).toContain('endConversationCallSession({');
  expect(source).toContain('conversationId: selectedConversation?.id');
  expect(serviceSource).toContain("createConversationCallSignal('call-offer', conversationId)");
  expect(serviceSource).toContain("createConversationCallSignal('call-end', conversationId)");
  expect(serviceSource).toContain('sendMessageToPeer(currentCallPeer');
  expect(source).not.toContain("subtype: 'call-offer'");
  expect(source).not.toContain("subtype: 'call-end'");
  expect(source).not.toContain('localStream.getTracks().forEach');
});

test('Chats delegates preview drag state transitions to a utility', async () => {
  const source = await readFile('src/routes/Chats.svelte', 'utf8');
  const utilitySource = await readFile('src/utils/conversationPreviewDrag.js', 'utf8');

  expect(source).toContain("from '../utils/conversationPreviewDrag.js'");
  expect(source).toContain('previewState = startPreviewDrag(previewState, e)');
  expect(source).toContain('previewState = movePreviewDrag(previewState, e)');
  expect(source).toContain('previewState = stopPreviewDrag(previewState)');
  expect(source).toContain('previewState = setPreviewVisibility(previewState, false)');
  expect(utilitySource).toContain('export function createPreviewDragState');
  expect(utilitySource).toContain('export function startPreviewDrag');
  expect(source).not.toContain('let previewDragging');
  expect(source).not.toContain('let previewOffset');
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
  const source = await readPeerManagerSource();
  const controllerSource = await readFile('src/utils/peerDiscoveryController.js', 'utf8');
  const utilitySource = await readFile('src/utils/peerDiscovery.js', 'utf8');
  const lifecycleSource = await readFile('src/utils/peerConnectionLifecycle.js', 'utf8');
  const startupSource = await readFile('src/utils/peerDiscoveryStartup.js', 'utf8');
  const broadcastSource = await readFile('src/utils/peerLeaderBroadcast.js', 'utf8');
  const responseSource = await readFile('src/utils/peerLeaderResponses.js', 'utf8');
  const roleSource = await readFile('src/utils/peerLeaderRole.js', 'utf8');

  expect(source).toContain("from '../utils/peerDiscovery.js'");
  expect(source).toContain("import { createPeerDiscoveryController } from '../utils/peerDiscoveryController.js'");
  expect(controllerSource).toContain("import { createDiscoveryLeaderRoleController } from './peerLeaderRole.js'");
  expect(controllerSource).toContain('createLeaderRole({');
  expect(roleSource).toContain('sendRegistry(');
  expect(roleSource).toContain('sendPeerListSnapshot(');
  expect(roleSource).toContain('broadcastPeerList(peerRegistry, sendPeerList)');
  expect(controllerSource).toContain("import { createLeaderConnectionController } from './peerLeaderResponses.js'");
  expect(controllerSource).toContain('createLeaderConnection({');
  expect(responseSource).toContain('storeDiscoveredPeerRegistry({');
  expect(responseSource).toContain('connectToReceivedOrgPeers({');
  expect(responseSource).toContain('updateKnownPeerConnections({');
  expect(controllerSource).toContain('buildLeaderId,');
  expect(controllerSource).toContain('createDiscoverySession({');
  expect(source).toContain('await discoveryController.initializeDiscoverySystem()');
  expect(responseSource).toContain('getOrgId(getRepoFullName())');
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
  expect(responseSource).toContain('export function storeDiscoveredPeerRegistry');
  expect(responseSource).toContain('export function connectToReceivedOrgPeers');
  expect(responseSource).toContain('export function updateKnownPeerConnections');
  expect(responseSource).toContain('export function createLeaderConnectionController');
  expect(responseSource).toContain('persistOrgPeerRegistryContacts(storage, orgId, peers, updateContact)');
  expect(startupSource).toContain('export async function initializePeerDiscoverySession');
  expect(startupSource).toContain('export function createDiscoverySessionOrchestrator');
  expect(startupSource).toContain('createDiscoveryBootstrap(auth, repoFullName)');
  expect(source).not.toContain('getStoredPeerContactUpdateEntries(orgPeers).forEach');
  expect(source).not.toContain('persistOrgPeerRegistryContacts(localStorage, orgId, peers, updateContact)');
  expect(source).not.toContain("repoFullName.split('/')[0]");
  expect(source).not.toContain("`skygit_discovery_${orgId}`");
});

test('peerJsManager delegates discovery connection timeouts to a utility', async () => {
  const source = await readPeerManagerSource();
  const controllerSource = await readFile('src/utils/peerDiscoveryController.js', 'utf8');
  const utilitySource = await readFile('src/utils/peerConnection.js', 'utf8');
  const startupSource = await readFile('src/utils/peerDiscoveryStartup.js', 'utf8');

  expect(source).toContain('createPeerDiscoveryController({');
  expect(controllerSource).toContain('createDiscoverySession({');
  expect(startupSource).toContain("import { connectPeerWithTimeout } from './peerConnection.js'");
  expect(startupSource).toContain('buildConnectionMetadata(getLocalUsername())');
  expect(startupSource).toContain('connectToDiscoveryLeader({');
  expect(startupSource).toContain('export async function connectToDiscoveryLeader');
  expect(startupSource).toContain('connectPeer = connectPeerWithTimeout');
  expect(startupSource).toContain('connectToPeer(leaderId, 3000)');
  expect(utilitySource).toContain('export function connectPeerWithTimeout');
  expect(utilitySource).toContain("reject(new Error('Connection timeout'))");
  expect(source).not.toContain("import { connectPeerWithTimeout } from '../utils/peerConnection.js'");
  expect(source).not.toContain("reject(new Error('Connection timeout'))");
});

test('peerJsManager delegates peer connection eligibility to discovery utilities', async () => {
  const source = await readPeerManagerSource();
  const controllerSource = await readFile('src/utils/peerDiscoveryController.js', 'utf8');
  const utilitySource = await readFile('src/utils/peerDiscovery.js', 'utf8');
  const responseSource = await readFile('src/utils/peerLeaderResponses.js', 'utf8');

  expect(source).toContain('createPeerDiscoveryController({');
  expect(controllerSource).toContain('createLeaderConnection({');
  expect(responseSource).toContain('connectToReceivedOrgPeers({');
  expect(responseSource).toContain('updateKnownPeerConnections({');
  expect(responseSource).toContain('processDiscoveredPeerConnections({');
  expect(responseSource).toContain("sourceLabel: 'discovered peer'");
  expect(utilitySource).toContain('export function getPeerConnectionStatus');
  expect(utilitySource).toContain('export function groupPeersByConnectionStatus');
  expect(utilitySource).toContain('export function getConnectablePeers');
  expect(utilitySource).toContain('export function processDiscoveredPeerConnections');
  expect(source).not.toContain('processDiscoveredPeerConnections({');
  expect(source).not.toContain("processPeerConnectionStatuses(peers, 'discovered peer', true)");
  expect(source).not.toContain('!conns[peer.peerId] && !failedConnections.has(peer.peerId)');
  expect(source).not.toContain('function connectAvailablePeers');
});

test('peerJsManager delegates conversation participant mapping to utilities', async () => {
  const source = await readPeerManagerSource();
  const actionControllerSource = await readFile('src/utils/peerMessageActionsController.js', 'utf8');
  const utilitySource = await readFile('src/utils/peerParticipants.js', 'utf8');

  expect(source).toContain("import { createPeerMessageActionsController } from '../utils/peerMessageActionsController.js'");
  expect(actionControllerSource).toContain("import { resolveConversationParticipants } from './peerParticipants.js'");
  expect(actionControllerSource).toContain('resolveParticipants({');
  expect(utilitySource).toContain('export function getConnectedParticipants');
  expect(utilitySource).toContain('export function findConversationParticipants');
  expect(utilitySource).toContain('export function resolveConversationParticipants');
  expect(source).not.toContain("from '../utils/peerParticipants.js'");
  expect(source).not.toContain('findConversationParticipants(conversationsMap, repoFullName, conversationId, conns)');
  expect(source).not.toContain('getStoredOrgParticipants(localStorage, orgId)');
  expect(source).not.toContain("repoFullName?.split('/')[0]");
});

test('peerJsManager delegates peer message dispatch to utilities', async () => {
  const source = await readPeerManagerSource();
  const controllerSource = await readFile('src/utils/peerMessageController.js', 'utf8');
  const utilitySource = await readFile('src/utils/peerMessages.js', 'utf8');
  const messageHandlerSource = source.slice(source.indexOf('function handlePeerMessage'), source.indexOf('// Send message to specific peer'));

  expect(source).toContain("import { createPeerMessageController } from '../utils/peerMessageController.js'");
  expect(controllerSource).toContain("import { processPeerDataMessage } from './peerMessages.js'");
  expect(controllerSource).toContain('processDataMessage({');
  expect(controllerSource).toContain('connections: getConnections()');
  expect(controllerSource).toContain('chat: handleChatMessage');
  expect(messageHandlerSource).toContain('return messageController.handlePeerMessage(data, fromPeerId, fromUsername)');
  expect(utilitySource).toContain('export function dispatchPeerMessage');
  expect(utilitySource).toContain('export function getPeerMessageSenderUsername');
  expect(utilitySource).toContain('export function processPeerDataMessage');
  expect(source).not.toContain("import { processPeerDataMessage } from '../utils/peerMessages.js'");
  expect(messageHandlerSource).not.toContain('getPeerMessageType(data)');
  expect(messageHandlerSource).not.toContain('dispatchPeerMessage(data');
  expect(messageHandlerSource).not.toContain('switch (data.type)');
});

test('peerJsManager delegates sync protocol shaping to utilities', async () => {
  const source = await readPeerManagerSource();
  const controllerSource = await readFile('src/utils/peerMessageController.js', 'utf8');
  const actionControllerSource = await readFile('src/utils/peerMessageActionsController.js', 'utf8');
  const utilitySource = await readFile('src/utils/peerSync.js', 'utf8');
  const actionSource = await readFile('src/utils/peerMessageActions.js', 'utf8');

  expect(source).toContain("import { createPeerMessageController } from '../utils/peerMessageController.js'");
  expect(source).toContain("import { createPeerMessageActionsController } from '../utils/peerMessageActionsController.js'");
  expect(controllerSource).toContain("from './peerSync.js'");
  expect(actionControllerSource).toContain("from './peerMessageActions.js'");
  expect(actionControllerSource).toContain('requestMessageSyncAction({');
  expect(actionControllerSource).toContain('requestSyncWithHashChainAction({');
  expect(controllerSource).toContain('processSyncNeedsChain({');
  expect(controllerSource).toContain('processSyncRequest({');
  expect(controllerSource).toContain('processSyncChainRequest({');
  expect(controllerSource).toContain('processSyncResponse({');
  expect(utilitySource).toContain('export function createSyncResponseAfterHash');
  expect(utilitySource).toContain('export function createSyncResponseForRequest');
  expect(utilitySource).toContain('export function createSyncChainRequestForNeed');
  expect(utilitySource).toContain('export function getSyncResponseDeliveryType');
  expect(utilitySource).toContain('export function deliverSyncResponse');
  expect(utilitySource).toContain('export function processSyncNeedsChainMessage');
  expect(utilitySource).toContain('export function processSyncRequestMessage');
  expect(utilitySource).toContain('export function processSyncChainRequestMessage');
  expect(utilitySource).toContain('findRepoConversation(conversationsMap, repoFullName, message.conversationId)');
  expect(utilitySource).toContain('createSyncResponseForRequest(message, conversation)');
  expect(utilitySource).toContain('createSyncResponseForChainRequest(message, conversation)');
  expect(utilitySource).toContain('export function normalizeSyncMessages');
  expect(utilitySource).toContain('export function processSyncResponseMessage');
  expect(actionSource).toContain('createSyncRequest(conversationId, lastHash)');
  expect(actionSource).toContain('createSyncRequestChain(conversationId, hashChain)');
  expect(actionSource).toContain('export function requestPeerMessageSync');
  expect(actionSource).toContain('export function requestPeerSyncWithHashChain');
  expect(source).not.toContain("from '../utils/peerSync.js'");
  expect(source).not.toContain("from '../utils/peerMessageActions.js'");
  expect(source).not.toContain('createSyncRequest(conversationId, lastHash)');
  expect(source).not.toContain('createSyncRequestChain(conversationId, hashChain)');
  expect(source).not.toContain('createSyncChainRequestForNeed(message, get(conversations), repoFullName)');
  expect(source).not.toContain('isValidSyncRequestMessage(msg)');
  expect(source).not.toContain('isValidSyncChainRequestMessage(msg)');
  expect(source).not.toContain('isValidSyncResponseMessage(msg)');
  expect(source).not.toContain('getNormalizedSyncResponseMessages(msg)');
  expect(source).not.toContain('findRepoConversation(get(conversations), repoFullName, conversationId)');
  expect(source).not.toContain('deliverSyncResponse(fromPeerId, response, sendMessageToPeer');
  expect(source).not.toContain('function sendSyncResponse');
  expect(source).not.toContain('getRecentHashes');
  expect(source).not.toContain('findCommonAncestor');
});

test('peerJsManager delegates broadcast target selection to utilities', async () => {
  const source = await readPeerManagerSource();
  const actionControllerSource = await readFile('src/utils/peerMessageActionsController.js', 'utf8');
  const connectionControllerSource = await readFile('src/utils/peerConnectionController.js', 'utf8');
  const utilitySource = await readFile('src/utils/peerBroadcast.js', 'utf8');
  const actionSource = await readFile('src/utils/peerMessageActions.js', 'utf8');

  expect(source).toContain("import { createPeerMessageActionsController } from '../utils/peerMessageActionsController.js'");
  expect(source).toContain("import { createPeerConnectionController } from '../utils/peerConnectionController.js'");
  expect(actionControllerSource).toContain("from './peerMessageActions.js'");
  expect(connectionControllerSource).toContain("import { buildOnlinePeerRows } from './peerBroadcast.js'");
  expect(connectionControllerSource).toContain('setOnlinePeers(buildOnlineRows(getConnections()))');
  expect(actionControllerSource).toContain('sendMessage({');
  expect(actionControllerSource).toContain('broadcastMessageToParticipants({');
  expect(actionControllerSource).toContain('broadcastMessageToAll({');
  expect(actionSource).toContain('sendToPeerConnection(connections, peerId, message)');
  expect(actionSource).toContain('broadcastToConversationParticipants({');
  expect(actionSource).toContain('broadcastToAllConnections({');
  expect(utilitySource).toContain('export function getConversationBroadcastTargets');
  expect(utilitySource).toContain('export function sendToBroadcastTargets');
  expect(utilitySource).toContain('export function buildOnlinePeerRows');
  expect(utilitySource).toContain('export function broadcastToConversationParticipants');
  expect(utilitySource).toContain('export function broadcastToAllConnections');
  expect(source).not.toContain("from '../utils/peerBroadcast.js'");
  expect(source).not.toContain("from '../utils/peerMessageActions.js'");
  expect(source).not.toContain('getNonParticipantPeers(conns, participantPeers).forEach');
  expect(source).not.toContain('canSendToConnection({ conn, status })');
});

test('peerJsManager delegates chat and typing payload shaping to utilities', async () => {
  const source = await readPeerManagerSource();
  const controllerSource = await readFile('src/utils/peerMessageController.js', 'utf8');
  const actionControllerSource = await readFile('src/utils/peerMessageActionsController.js', 'utf8');
  const chatSource = await readFile('src/utils/peerChat.js', 'utf8');
  const typingSource = await readFile('src/utils/peerTyping.js', 'utf8');
  const actionSource = await readFile('src/utils/peerMessageActions.js', 'utf8');

  expect(source).toContain("import { createPeerMessageController } from '../utils/peerMessageController.js'");
  expect(controllerSource).toContain("from './peerChat.js'");
  expect(controllerSource).toContain("from './peerTyping.js'");
  expect(actionControllerSource).toContain("from './peerMessageActions.js'");
  expect(controllerSource).toContain('processChatMessage({');
  expect(controllerSource).toContain('processTypingMessage({');
  expect(actionControllerSource).toContain('broadcastTypingAction(isTyping, broadcastToAllPeers)');
  expect(actionSource).toContain('broadcastToAllPeers(message)');
  expect(chatSource).toContain('export function createIncomingChatMessage');
  expect(typingSource).toContain('export function createTypingStatusMessage');
  expect(chatSource).toContain('export function processIncomingPeerChatMessage');
  expect(typingSource).toContain('export const TYPING_CLEAR_DELAY_MS');
  expect(typingSource).toContain('export function processIncomingTypingMessage');
  expect(source).not.toContain('isValidChatMessage(msg)');
  expect(source).not.toContain('createIncomingChatMessage(msg, fromUsername)');
  expect(source).not.toContain('applyTypingStatus(users, fromPeerId, fromUsername, msg.isTyping)');
  expect(source).not.toContain('clearExpiredTypingStatus(users, fromPeerId)');
});

test('peerJsManager delegates call media operations to utilities', async () => {
  const source = await readPeerManagerSource();
  const controllerSource = await readFile('src/utils/peerCallController.js', 'utf8');
  const utilitySource = await readFile('src/utils/peerCallMedia.js', 'utf8');
  const sessionSource = await readFile('src/utils/peerCallSession.js', 'utf8');

  expect(source).toContain("from '../utils/peerCallController.js'");
  expect(controllerSource).toContain("from './peerCallSession.js'");
  expect(sessionSource).toContain("from './peerCallMedia.js'");
  expect(sessionSource).toContain('mediaDevices.getUserMedia(createCallMediaConstraints(video))');
  expect(sessionSource).toContain('mediaDevices.getUserMedia(createCallMediaConstraints(true))');
  expect(sessionSource).toContain('switchCallToCamera({');
  expect(sessionSource).toContain('switchCallToScreenShare({');
  expect(sessionSource).toContain('stopStreamTracks(localStream)');
  expect(utilitySource).toContain('export function stopStreamTracks');
  expect(utilitySource).toContain('export async function switchCallToCamera');
  expect(utilitySource).toContain('export async function switchCallToScreenShare');
  expect(source).not.toContain("from '../utils/peerCallSession.js'");
  expect(source).not.toContain("from '../utils/peerCallMedia.js'");
});

test('peerJsManager delegates call lifecycle decisions to utilities', async () => {
  const source = await readPeerManagerSource();
  const controllerSource = await readFile('src/utils/peerCallController.js', 'utf8');
  const utilitySource = await readFile('src/utils/peerCallLifecycle.js', 'utf8');
  const sessionSource = await readFile('src/utils/peerCallSession.js', 'utf8');
  const callSource = source.slice(
    source.indexOf('export function initializeCallHandling'),
    source.indexOf('export function toggleScreenShare')
  );

  expect(source).toContain("from '../utils/peerCallController.js'");
  expect(controllerSource).toContain('bindIncomingCalls(getLocalPeer(), {');
  expect(controllerSource).toContain('startOutgoingCall({');
  expect(controllerSource).toContain('answerIncomingCall({');
  expect(controllerSource).toContain('bindActiveCall(call, {');
  expect(controllerSource).toContain('endCallSession({');
  expect(controllerSource).toContain('toggleAudioTrack(');
  expect(controllerSource).toContain('toggleVideoTrack(');
  expect(controllerSource).toContain('toggleScreenShareTrack({');
  expect(callSource).toContain('return callController.initializeCallHandling()');
  expect(callSource).toContain('return callController.startCall(peerId, video)');
  expect(callSource).toContain('return callController.answerCall()');
  expect(sessionSource).toContain("from './peerCallLifecycle.js'");
  expect(sessionSource).toContain('shouldRejectIncomingCall(callStatus)');
  expect(sessionSource).toContain('applyIncomingCallState(stores, call)');
  expect(sessionSource).toContain('bindCallLifecycleEvents(call, {');
  expect(sessionSource).toContain('closeCallQuietly(currentCall');
  expect(sessionSource).toContain('applyOutgoingCallState(stores, stream, peerId, video)');
  expect(sessionSource).toContain('localPeer.call(peerId, stream, createCallMetadata(localUsername))');
  expect(sessionSource).toContain('isAnswerAlreadyInProgress(callStatus)');
  expect(sessionSource).toContain('applyAnsweredCallState(stores, stream, currentCall)');
  expect(sessionSource).toContain('applyRemoteStreamState(stores, stream)');
  expect(sessionSource).toContain('setCurrentCall(closeCurrentCall(currentCall))');
  expect(sessionSource).toContain('toggleFirstAudioTrack(stream)');
  expect(sessionSource).toContain('toggleFirstVideoTrack(stream)');
  expect(sessionSource).toContain('onScreenShareEnded: createScreenShareEndedHandler(toggleScreenShare)');
  expect(utilitySource).toContain('export function createCallMetadata');
  expect(utilitySource).toContain('export function bindCallLifecycleEvents');
  expect(source).not.toContain("from '../utils/peerCallSession.js'");
  expect(source).not.toContain("from '../utils/peerCallLifecycle.js'");
  expect(callSource).not.toContain("metadata: {\n        username: localUsername");
  expect(callSource).not.toContain("callStatus.set('calling')");
});

test('peerJsManager delegates connection state shaping to utilities', async () => {
  const source = await readPeerManagerSource();
  const controllerSource = await readFile('src/utils/peerConnectionController.js', 'utf8');
  const utilitySource = await readFile('src/utils/peerConnectionState.js', 'utf8');
  const lifecycleSource = await readFile('src/utils/peerConnectionLifecycle.js', 'utf8');
  const dataConnectionSource = await readFile('src/utils/peerDataConnections.js', 'utf8');

  expect(dataConnectionSource).toContain("from './peerConnectionState.js'");
  expect(dataConnectionSource).toContain('createPeerConnectionMetadata(localUsername, repoFullName, sessionId)');
  expect(source).toContain("import { createPeerConnectionController } from '../utils/peerConnectionController.js'");
  expect(controllerSource).toContain('processOpenedConnection({');
  expect(controllerSource).toContain('processClosedConnection({');
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
  const source = await readPeerManagerSource();
  const controllerSource = await readFile('src/utils/peerConnectionController.js', 'utf8');
  const utilitySource = await readFile('src/utils/peerConnectionLifecycle.js', 'utf8');
  const dataConnectionSource = await readFile('src/utils/peerDataConnections.js', 'utf8');
  const connectSource = source.slice(
    source.indexOf('export function connectToPeer'),
    source.indexOf('// Handle messages from peers')
  );

  expect(source).toContain("import { createPeerConnectionController } from '../utils/peerConnectionController.js'");
  expect(controllerSource).toContain("from './peerConnectionLifecycle.js'");
  expect(controllerSource).toContain("from './peerDataConnections.js'");
  expect(connectSource).toContain('return connectionController.connectToPeer(targetPeerId, username)');
  expect(controllerSource).toContain('connectOutgoingPeer({');
  expect(dataConnectionSource).toContain('const readiness = getLocalPeerConnectionReadiness(localPeer)');
  expect(dataConnectionSource).toContain('hasPeerConnection(connections, targetPeerId)');
  expect(dataConnectionSource).toContain('markPeerConnectionFailed(failedConnections, targetPeerId, retryDelayMs, failedConnectionScheduler)');
  expect(controllerSource).toContain('processOpenedConnection({');
  expect(controllerSource).toContain('sendSyncRequests(peerId, getConversations(), getRepoFullName(), requestMessageSync, log)');
  expect(controllerSource).toContain('processClosedConnection({');
  expect(utilitySource).toContain('export function getConversationSyncRequests');
  expect(utilitySource).toContain('export function sendConversationSyncRequests');
  expect(utilitySource).toContain('export function processOpenedPeerConnection');
  expect(utilitySource).toContain('export function processClosedPeerConnection');
  expect(source).not.toContain("from '../utils/peerConnectionLifecycle.js'");
  expect(source).not.toContain('addPeerConnectionToState(conns, peerId, createPeerConnectionEntry(conn, extractedUsername))');
  expect(source).not.toContain('getPeerConnectionUsername(conns, peerId)');
  expect(source).not.toContain('removePeerConnectionFromState(conns, peerId)');
  expect(source).not.toContain('removePeerTypingUser(users, peerId)');
  expect(source).not.toContain('getConversationSyncRequests(repoConversations).forEach');
  expect(connectSource).not.toContain('setTimeout(() =>');
  expect(source).not.toContain('setTimeout(() =>');
});

test('peerJsManager delegates peer lifecycle cleanup to utilities', async () => {
  const source = await readPeerManagerSource();
  const lifecycleControllerSource = await readFile('src/utils/peerManagerLifecycleController.js', 'utf8');
  const discoveryControllerSource = await readFile('src/utils/peerDiscoveryController.js', 'utf8');
  const utilitySource = await readFile('src/utils/peerLifecycle.js', 'utf8');
  const shutdownSource = source.slice(
    source.indexOf('export function shutdownPeerManager'),
    source.indexOf('export function initializePeerManager')
  );

  expect(source).toContain("import { createPeerManagerLifecycleController } from '../utils/peerManagerLifecycleController.js'");
  expect(source).toContain('return lifecycleController.shutdownPeerManager()');
  expect(lifecycleControllerSource).toContain("from './peerLifecycle.js'");
  expect(lifecycleControllerSource).toContain('isSameSession(getLocalPeer(), getRepoFullName(), getSessionId(), _repoFullName, _sessionId)');
  expect(lifecycleControllerSource).toContain('createSession(_repoFullName, _username, _sessionId, generatePeerId)');
  expect(lifecycleControllerSource).toContain('setLocalUsername(nextSession.username)');
  expect(lifecycleControllerSource).toContain('new PeerClass(nextSession.peerId, nextSession.peerOptions)');
  expect(lifecycleControllerSource).toContain('closeOpenPeerConnections(getPeerConnections())');
  expect(lifecycleControllerSource).toContain('resetStores(peerStores)');
  expect(discoveryControllerSource).toContain('healthCheckInterval = clearTimerFn(healthCheckInterval)');
  expect(discoveryControllerSource).toContain('leadershipPeer = destroyPeerFn(leadershipPeer)');
  expect(discoveryControllerSource).toContain('connectedToLeader = closeConnectionFn(connectedToLeader)');
  expect(utilitySource).toContain('export function resetPeerStores');
  expect(utilitySource).toContain('export function createPeerManagerSession');
  expect(source).not.toContain("from '../utils/peerLifecycle.js'");
  expect(shutdownSource).not.toContain('peerConnections.set({})');
  expect(shutdownSource).not.toContain('onlinePeers.set([])');
  expect(shutdownSource).not.toContain('typingUsers.set({})');
});

test('peerJsManager delegates discovery protocol messages to utilities', async () => {
  const source = await readPeerManagerSource();
  const discoveryControllerSource = await readFile('src/utils/peerDiscoveryController.js', 'utf8');
  const utilitySource = await readFile('src/utils/peerDiscovery.js', 'utf8');
  const connectionControllerSource = await readFile('src/utils/peerConnectionController.js', 'utf8');
  const lifecycleSource = await readFile('src/utils/peerConnectionLifecycle.js', 'utf8');
  const roleSource = await readFile('src/utils/peerLeaderRole.js', 'utf8');
  const messageSource = await readFile('src/utils/peerLeaderMessages.js', 'utf8');
  const responseSource = await readFile('src/utils/peerLeaderResponses.js', 'utf8');
  const healthSource = await readFile('src/utils/peerLeaderHealth.js', 'utf8');

  expect(source).toContain('createPeerDiscoveryController({');
  expect(discoveryControllerSource).toContain('createLeaderRole({');
  expect(discoveryControllerSource).toContain('setupLeadershipRole: leaderRole.setupLeadershipRole');
  expect(discoveryControllerSource).toContain('setupLeaderConnection: leaderConnection.setupLeaderConnection');
  expect(roleSource).toContain('export function createDiscoveryLeaderRoleController');
  expect(roleSource).toContain('setupLeadershipRole({');
  expect(roleSource).toContain('processLeaderMessage({');
  expect(messageSource).toContain('registerPeerInRegistry(peerRegistry, connection.peer, message, connection)');
  expect(messageSource).toContain('updatePeerRegistryConversations(peerRegistry, connection.peer, message.conversations)');
  expect(messageSource).toContain('touchPeerRegistryHeartbeat(peerRegistry, connection.peer)');
  expect(roleSource).toContain('bindPeerConnection({');
  expect(roleSource).toContain('createLeaderRegistryEntry(localUsername, repoFullName)');
  expect(roleSource).toContain('removePeerFromRegistry(peerRegistry, connection.peer)');
  expect(connectionControllerSource).toContain('processClosedConnection({');
  expect(lifecycleSource).toContain('removeDisconnectedPeerFromLeaderRegistry(peerRegistry, peerId, isCurrentLeader, broadcastPeerListUpdate, log)');
  expect(roleSource).toContain('sendRegistry(');
  expect(roleSource).toContain('sendPeerListSnapshot(');
  expect(responseSource).toContain('sendRegister(connection, getLocalUsername(), getRepoFullName())');
  expect(discoveryControllerSource).toContain('createHeartbeatMessage,');
  expect(discoveryControllerSource).toContain('createLeadershipChangeMessage,');
  expect(healthSource).toContain('heartbeatMessage: createHeartbeatMessage()');
  expect(healthSource).toContain('leadershipChangeMessage: createLeadershipChangeMessage()');
  expect(responseSource).toContain('storeDiscoveredPeerRegistry({');
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
  expect(source).not.toContain('processLeaderPeerMessage({');
  expect(source).not.toContain('bindDiscoveryPeerConnection({');
  expect(source).not.toContain('sendRegisterWithLeader(conn, localUsername, repoFullName)');
});

test('peerJsManager delegates leader health maintenance to utilities', async () => {
  const source = await readPeerManagerSource();
  const discoveryControllerSource = await readFile('src/utils/peerDiscoveryController.js', 'utf8');
  const utilitySource = await readFile('src/utils/peerLeaderHealth.js', 'utf8');
  const roleSource = await readFile('src/utils/peerLeaderRole.js', 'utf8');

  expect(source).toContain("import { createPeerDiscoveryController } from '../utils/peerDiscoveryController.js'");
  expect(discoveryControllerSource).toContain("from './peerLeaderHealth.js'");
  expect(discoveryControllerSource).toContain('staleThresholdMs: PEER_STALE_THRESHOLD_MS');
  expect(roleSource).toContain('startMaintenanceTimer = startLeaderMaintenanceTimer');
  expect(roleSource).toContain('performMaintenance = performLeaderRegistryMaintenance');
  expect(discoveryControllerSource).toContain('createLeaderHealth({');
  expect(discoveryControllerSource).toContain('startHealthCheckSystem: orgId => leaderHealth.startHealthCheckSystem(orgId)');
  expect(discoveryControllerSource).toContain('leaderHealth.stepDownFromLeadership()');
  expect(discoveryControllerSource).toContain('healthCheckInterval = clearTimerFn(healthCheckInterval)');
  expect(utilitySource).toContain('startHealthTimer = startLeaderHealthTimer');
  expect(utilitySource).toContain('handleHealthTick = handleLeaderHealthTick');
  expect(utilitySource).toContain('checkLeaderHealth = checkDiscoveryLeaderHealth');
  expect(utilitySource).toContain('reconnectLeader = reconnectToDiscoveryLeader');
  expect(utilitySource).toContain('stepDownLeadership = stepDownFromDiscoveryLeadership');
  expect(discoveryControllerSource).toContain('scheduleReconnect: scheduleLeaderReconnect');
  expect(utilitySource).toContain('export function pruneStalePeerRegistry');
  expect(utilitySource).toContain('export function performLeaderRegistryMaintenance');
  expect(utilitySource).toContain('export function createLeaderHealthController');
  expect(utilitySource).toContain('export function stepDownFromDiscoveryLeadership');
  expect(utilitySource).toContain('export function getLeaderHealthAction');
  expect(utilitySource).toContain('export function handleLeaderHealthTick');
  expect(utilitySource).toContain('export function checkDiscoveryLeaderHealth');
  expect(utilitySource).toContain('export async function reconnectToDiscoveryLeader');
  expect(source).not.toContain('stepDownFromDiscoveryLeadership({');
  expect(source).not.toContain('healthCheckInterval = startLeaderHealthTimer(() =>');
  expect(source).not.toContain('handleLeaderHealthTick({');
  expect(source).not.toContain('checkDiscoveryLeaderHealth({');
  expect(source).not.toContain('reconnectToDiscoveryLeader({');
  expect(source).not.toContain('startLeaderMaintenanceTimer(performLeaderMaintenance)');
  expect(source).not.toContain('performLeaderRegistryMaintenance({');
  expect(source).not.toContain('pruneStalePeerRegistry(peerRegistry, localPeer.id, now, PEER_STALE_THRESHOLD_MS)');
  expect(source).not.toContain('notifyLeadershipChange(peerRegistry, createLeadershipChangeMessage())');
  expect(source).not.toContain('const action = getLeaderHealthAction(isCurrentLeader, connectedToLeader)');
  expect(source).not.toContain('sendLeaderHeartbeat(connectedToLeader, createHeartbeatMessage())');
  expect(source).not.toContain('setInterval(() => {\n    performLeaderMaintenance();');
});

test('peerJsManager delegates leadership claiming to a utility', async () => {
  const source = await readPeerManagerSource();
  const discoveryControllerSource = await readFile('src/utils/peerDiscoveryController.js', 'utf8');
  const utilitySource = await readFile('src/utils/peerLeadershipClaim.js', 'utf8');
  const startupSource = await readFile('src/utils/peerDiscoveryStartup.js', 'utf8');

  expect(startupSource).toContain("import { claimPeerLeadershipSlot } from './peerLeadershipClaim.js'");
  expect(source).toContain("import { createPeerDiscoveryController } from '../utils/peerDiscoveryController.js'");
  expect(discoveryControllerSource).toContain("from './peerDiscoveryStartup.js'");
  expect(discoveryControllerSource).toContain('createDiscoverySession({');
  expect(source).toContain('PeerClass: Peer');
  expect(startupSource).toContain('attemptDiscoveryLeadership({');
  expect(startupSource).toContain('const claimLeadershipSlot = (leaderId, orgId) => claimLeadership({');
  expect(startupSource).toContain('onLeadershipPeer: setLeadershipPeer');
  expect(startupSource).toContain('onLeadershipSetup: () => setupLeadershipRole(orgId)');
  expect(utilitySource).toContain('export function claimPeerLeadershipSlot');
  expect(utilitySource).toContain("reject(new Error('Leadership claim timeout'))");
  expect(source).not.toContain("import { claimPeerLeadershipSlot } from '../utils/peerLeadershipClaim.js'");
  expect(source).not.toContain('function claimLeadershipSlot');
  expect(source).not.toContain("err.type === 'unavailable-id'");
});

test('peerJsManager delegates discovery message dispatch to utilities', async () => {
  const source = await readPeerManagerSource();
  const discoveryControllerSource = await readFile('src/utils/peerDiscoveryController.js', 'utf8');
  const utilitySource = await readFile('src/utils/peerLeaderMessages.js', 'utf8');
  const roleSource = await readFile('src/utils/peerLeaderRole.js', 'utf8');
  const responseSource = await readFile('src/utils/peerLeaderResponses.js', 'utf8');

  expect(source).toContain('createPeerDiscoveryController');
  expect(discoveryControllerSource).toContain('createLeaderConnectionController');
  expect(discoveryControllerSource).toContain("from './peerLeaderResponses.js'");
  expect(roleSource).toContain("import { processLeaderPeerMessage } from './peerLeaderMessages.js'");
  expect(roleSource).toContain('processLeaderMessage({');
  expect(roleSource).toContain('sendPeerRegistry,');
  expect(responseSource).toContain("import { handleLeaderDiscoveryResponse } from './peerLeaderMessages.js'");
  expect(responseSource).toContain('handleLeaderResponse(data, {');
  expect(responseSource).toContain('onLeadershipChange: () =>');
  expect(utilitySource).toContain('export function dispatchDiscoveryMessage');
  expect(utilitySource).toContain('export function handleLeaderDiscoveryResponse');
  expect(utilitySource).toContain('export function processLeaderPeerMessage');
  expect(source).not.toContain("import { handleLeaderDiscoveryResponse } from '../utils/peerLeaderMessages.js'");
  expect(source).not.toContain("import { handleLeaderDiscoveryResponse, processLeaderPeerMessage } from '../utils/peerLeaderMessages.js'");
  expect(source).not.toContain('function handleLeaderMessage');
  expect(source).not.toContain('function handleLeaderResponse');
  expect(roleSource).not.toContain('switch (data.type)');
  expect(roleSource).not.toContain('register: (message) =>');
  expect(responseSource).not.toContain('switch (data.type)');
  expect(responseSource).not.toContain('peer_registry: (message) =>');
});

test('peerJsManager delegates PeerJS connection event binding to a utility', async () => {
  const source = await readPeerManagerSource();
  const connectionControllerSource = await readFile('src/utils/peerConnectionController.js', 'utf8');
  const lifecycleControllerSource = await readFile('src/utils/peerManagerLifecycleController.js', 'utf8');
  const discoveryControllerSource = await readFile('src/utils/peerDiscoveryController.js', 'utf8');
  const utilitySource = await readFile('src/utils/peerConnectionEvents.js', 'utf8');
  const dataConnectionSource = await readFile('src/utils/peerDataConnections.js', 'utf8');
  const managerEventSource = await readFile('src/utils/peerManagerEvents.js', 'utf8');
  const roleSource = await readFile('src/utils/peerLeaderRole.js', 'utf8');
  const responseSource = await readFile('src/utils/peerLeaderResponses.js', 'utf8');

  expect(responseSource).toContain("import { bindLeaderConnectionEvents } from './peerConnectionEvents.js'");
  expect(source).toContain("import { createPeerConnectionController } from '../utils/peerConnectionController.js'");
  expect(connectionControllerSource).toContain("from './peerDataConnections.js'");
  expect(source).toContain("import { createPeerManagerLifecycleController } from '../utils/peerManagerLifecycleController.js'");
  expect(lifecycleControllerSource).toContain("import { bindPeerManagerEvents } from './peerManagerEvents.js'");
  expect(discoveryControllerSource).toContain("import { createDiscoveryLeaderRoleController } from './peerLeaderRole.js'");
  expect(lifecycleControllerSource).toContain('bindManagerEvents(peer, {');
  expect(responseSource).toContain('bindLeaderConnection(connection, {');
  expect(roleSource).toContain('bindPeerConnection({');
  expect(connectionControllerSource).toContain('bindIncomingConnection(connection, {');
  expect(connectionControllerSource).toContain('connectOutgoingPeer({');
  expect(managerEventSource).toContain('bindPeerEvents(peer, {');
  expect(roleSource).toContain('bindConnectionEvents(connection, {');
  expect(roleSource).toContain('bindPeerEvents(leadershipPeer, {');
  expect(utilitySource).toContain('export function bindConnectionEvents');
  expect(utilitySource).toContain('export function bindLeaderConnectionEvents');
  expect(utilitySource).toContain('export function bindPeerDataConnection');
  expect(utilitySource).toContain('export function bindPeerEvents');
  expect(utilitySource).toContain("connection.on('open', handlers.open)");
  expect(dataConnectionSource).toContain('export function bindIncomingPeerDataConnection');
  expect(dataConnectionSource).toContain('export function bindOutgoingPeerDataConnection');
  expect(dataConnectionSource).toContain('export function connectToOutgoingPeer');
  expect(dataConnectionSource).toContain('bindPeerDataConnection(connection, {');
  expect(dataConnectionSource).toContain('data: (data, targetPeerId, peerUsername) =>');
  expect(managerEventSource).toContain('export function bindPeerManagerEvents');
  expect(managerEventSource).toContain('bindPeerEvents(peer, {');
  expect(source).not.toContain("import { bindLeaderConnectionEvents } from '../utils/peerConnectionEvents.js'");
  expect(managerEventSource).toContain('handleIncomingConnection(connection)');
  expect(source).not.toContain("connection.on('data',");
  expect(source).not.toContain('bindPeerDataConnection(conn, {');
});

test('peerJsManager delegates commit protocol payloads to utilities', async () => {
  const source = await readPeerManagerSource();
  const messageControllerSource = await readFile('src/utils/peerMessageController.js', 'utf8');
  const conversationControllerSource = await readFile('src/utils/peerConversationController.js', 'utf8');
  const utilitySource = await readFile('src/utils/peerCommitProtocol.js', 'utf8');

  expect(source).toContain("import { createPeerConversationController } from '../utils/peerConversationController.js'");
  expect(source).toContain("import { createPeerMessageController } from '../utils/peerMessageController.js'");
  expect(conversationControllerSource).toContain("from './peerCommitProtocol.js'");
  expect(conversationControllerSource).toContain('createUpdateMessage = createUpdateConversationsMessage');
  expect(conversationControllerSource).toContain('subscribeCommittedBroadcasts({');
  expect(messageControllerSource).toContain('processCommittedMessages({');
  expect(utilitySource).toContain('export function createCommittedMessagesMessage');
  expect(utilitySource).toContain('export function applyCommittedMessagesNotification');
  expect(utilitySource).toContain('export function subscribeCommittedMessageBroadcasts');
  expect(utilitySource).toContain('export function processCommittedMessagesMessage');
  expect(utilitySource).toContain('broadcastCommittedEvent(event, broadcastToAllPeers, createCommittedMessagesMessage)');
  expect(utilitySource).toContain('applyCommittedMessagesNotification(message, markMessagesCommitted)');
  expect(source).not.toContain('shouldBroadcastCommittedEvent(event)');
  expect(source).not.toContain('broadcastCommittedEvent(event, broadcastToAllPeers, createCommittedMessagesMessage)');
  expect(source).not.toContain('applyCommittedMessagesNotification(msg, markMessagesCommitted)');
  expect(source).not.toContain('Add to handlePeerMessage switch');
  expect(source).not.toContain("case 'messages_committed':");
});

test('peerJsManager delegates leader commit interval control to utilities', async () => {
  const source = await readPeerManagerSource();
  const runtimeSource = await readFile('src/services/peerManagerRuntime.js', 'utf8');
  const controllerSource = await readFile('src/utils/peerConversationController.js', 'utf8');
  const utilitySource = await readFile('src/utils/peerCommitInterval.js', 'utf8');
  const intervalSource = runtimeSource.slice(
    runtimeSource.indexOf('function getCurrentLeader'),
    runtimeSource.indexOf('function requestMessageSync')
  );

  expect(source).toContain("import { createPeerConversationController } from '../utils/peerConversationController.js'");
  expect(controllerSource).toContain("from './peerCommitInterval.js'");
  expect(intervalSource).toContain('return conversationController.getCurrentLeader()');
  expect(intervalSource).toContain('return conversationController.isLeader()');
  expect(intervalSource).toContain('conversationController.subscribePeerConnectionChanges(peerConnections)');
  expect(controllerSource).toContain('leaderCommitInterval = refreshCommitInterval({');
  expect(controllerSource).toContain('flushCommitQueue');
  expect(controllerSource).toContain('isStillLeader: isLeader');
  expect(utilitySource).toContain('export const LEADER_COMMIT_INTERVAL_MS');
  expect(utilitySource).toContain('export function refreshLeaderCommitInterval');
  expect(utilitySource).toContain('shouldRunLeaderCommitInterval(localPeerId, connections)');
  expect(utilitySource).toContain('return startTimer(flushCommitQueue, isStillLeader)');
  expect(utilitySource).toContain('return stopTimer(currentInterval)');
  expect(intervalSource).not.toContain('10 * 60 * 1000');
  expect(intervalSource).not.toContain('shouldRunLeaderCommitInterval(localPeer?.id, conns)');
  expect(intervalSource).not.toContain('startLeaderCommitTimer(flushConversationCommitQueue, isLeader)');
  expect(intervalSource).not.toContain('clearInterval(leaderCommitInterval)');
});

test('peerJsManager delegates conversation update notifications to utilities', async () => {
  const source = await readPeerManagerSource();
  const runtimeSource = await readFile('src/services/peerManagerRuntime.js', 'utf8');
  const controllerSource = await readFile('src/utils/peerConversationController.js', 'utf8');
  const utilitySource = await readFile('src/utils/peerConversationUpdates.js', 'utf8');
  const updateSource = runtimeSource.slice(
    runtimeSource.indexOf('function updateMyConversations'),
    runtimeSource.indexOf('conversationController.subscribeCommittedMessages')
  );

  expect(source).toContain("import { createPeerConversationController } from '../utils/peerConversationController.js'");
  expect(controllerSource).toContain("import { processLocalConversationUpdate } from './peerConversationUpdates.js'");
  expect(updateSource).toContain('return conversationController.updateMyConversations(conversations)');
  expect(controllerSource).toContain('processConversationUpdate({');
  expect(controllerSource).toContain('leaderConnection: getLeaderConnection()');
  expect(controllerSource).toContain('createUpdateMessage');
  expect(utilitySource).toContain('export function applyLeaderConversationUpdate');
  expect(utilitySource).toContain('export function processLocalConversationUpdate');
  expect(utilitySource).toContain('applyLeaderConversationUpdate(peerRegistry, localPeerId, conversations)');
  expect(utilitySource).toContain('shouldNotifyLeaderOfConversations(leaderConnection)');
  expect(utilitySource).toContain('notifyLeaderOfConversations(leaderConnection, conversations, createUpdateMessage)');
  expect(updateSource).not.toContain('applyLeaderConversationUpdate(peerRegistry, localPeer.id, conversations)');
  expect(updateSource).not.toContain('shouldNotifyLeaderOfConversations(connectedToLeader)');
  expect(updateSource).not.toContain('myInfo.conversations = conversations');
  expect(updateSource).not.toContain('connectedToLeader.send(createUpdateConversationsMessage(conversations))');
});
