<script>
  import Layout from '../components/Layout.svelte';
  import { currentContent, currentRoute } from '../stores/routeStore.js';
  import { conversations, selectedConversation as selectedConversationStore } from '../stores/conversationStore.js';
  import MessageList from '../components/MessageList.svelte';
  import MessageInput from '../components/MessageInput.svelte';
  import ConversationCallPanel from '../components/ConversationCallPanel.svelte';
  import ConversationHeader from '../components/ConversationHeader.svelte';
  import ParticipantsModal from '../components/ParticipantsModal.svelte';
  import { onDestroy } from 'svelte';
  import {
    getCurrentLeader,
    getLocalPeerId,
    initializePeerManager,
    onlinePeers,
    peerConnections,
    sendMessageToPeer,
    shutdownPeerManager,
    typingUsers,
    updateMyConversations
  } from '../services/peerJsManager.js';
  import { presencePolling, setPollingState } from '../stores/presenceControlStore.js';
  import { flushConversationCommitQueue } from '../services/conversationCommitQueue.js';
  import { removeFromSkyGitConversations } from '../services/conversationService.js';
  import { loadSelectedConversationContents } from '../services/conversationSelectionService.js';
  import { registerSkyGitBrowserCallbacks } from '../services/browserCallbackService.js';
  import {
    createConversationSyncController,
    fetchAndMergeConversation
  } from '../services/conversationSyncService.js';
  import { applySyncedConversationToStores } from '../services/conversationSyncStateService.js';
  import {
    uploadRecordingToGoogleDrive,
    uploadRecordingToS3
  } from '../services/recordingUploadService.js';
  import {
    applyConversationPresencePolling,
    getConversationPresenceContext,
    toggleConversationPresence
  } from '../services/conversationPresenceService.js';
  import { createConversationRecordingController } from '../services/conversationRecordingController.js';
  import { uploadAndShareConversationRecording } from '../services/conversationRecordingUploadService.js';
  import { settingsStore } from '../stores/settingsStore.js';
  import { get } from 'svelte/store';
  import { authStore } from '../stores/authStore.js';
  import { getOrCreateSessionId } from '../utils/sessionManager.js';
  import { chooseRecordingUploadDestination } from '../utils/uploadDestinationChoice.js';
  import {
    createUploadDestinationChoiceState,
    requestUploadDestinationChoice,
    resetUploadDestinationChoice,
    selectUploadDestinationChoice
  } from '../services/uploadDestinationChoiceStateService.js';
  import { getRecordingUploadCredentials } from '../utils/uploadCredentials.js';
  import { getRepoByFullName } from '../stores/repoStore.js';
  import {
    changeConversationScreenSource,
    startConversationScreenShare,
    stopConversationScreenShare
  } from '../utils/conversationScreenShare.js';
  import {
    sendConversationFile,
    sendConversationMediaStatus,
    sendConversationRecordingStatus
  } from '../utils/conversationPeerSignals.js';
  import {
    createPreviewDragState,
    movePreviewDrag,
    setPreviewVisibility,
    startPreviewDrag,
    stopPreviewDrag
  } from '../utils/conversationPreviewDrag.js';
  import {
    applyConversationFileReceiveProgress,
    applyConversationFileSendProgress
  } from '../services/conversationTransferProgressService.js';
  import {
    endConversationCallSession,
    startConversationCallSession
  } from '../services/conversationCallSessionService.js';
  import {
    toggleConversationCameraState,
    toggleConversationMicState
  } from '../services/conversationMediaStatusService.js';
  let selectedConversation = null;
  let callActive = false;
  let currentRepo = null;
  let localStream = null;
  let remoteStream = null;
  let currentCallPeer = null;
  let fileToSend = null;
  let showParticipantModal = false;
  let fileSending = false;
  let fileSendPercent = 0;
  let fileReceiveProgress = null;
  let fileReceiveName = '';
  let fileReceivePercent = 0;
  let screenSharing = false;
  let screenShareStream = null;
  let localCameraStream = null;
  let remoteScreenSharing = false;
  let remoteScreenShareMeta = null;
  let showShareTypeModal = false;
  let shareType = 'screen'; // 'screen', 'window', 'tab'
  let previewState = createPreviewDragState();
  $: previewVisible = previewState.visible;
  $: previewPos = previewState.position;
  let micOn = true;
  let cameraOn = true;
  let remoteMicOn = true;
  let remoteCameraOn = true;
  let recording = false;
  let remoteRecording = false;
  let replyingTo = null; // Track message being replied to

  let pollingActive = true;

  // subscribe to presencePolling store to update local flag per repo
  const unsubscribePolling = presencePolling.subscribe((map) => {
    if (selectedConversation && selectedConversation.repo) {
      pollingActive = map[selectedConversation.repo] !== false; // default true
    }
  });
  let uploadDestinationChoice = createUploadDestinationChoiceState();
  $: showUploadDestinationModal = uploadDestinationChoice.showModal;

  let unregisterBrowserCallbacks = () => {};

  function openShareTypeModal() {
    showShareTypeModal = true;
  }
  function closeShareTypeModal() {
    showShareTypeModal = false;
  }
  function selectShareType(type) {
    shareType = type;
    showShareTypeModal = false;
    startScreenShare(true, type);
  }

  function onPreviewMouseDown(e) {
    previewState = startPreviewDrag(previewState, e);
    document.addEventListener('mousemove', onPreviewMouseMove);
    document.addEventListener('mouseup', onPreviewMouseUp);
  }
  function onPreviewMouseMove(e) {
    previewState = movePreviewDrag(previewState, e);
  }
  function onPreviewMouseUp() {
    previewState = stopPreviewDrag(previewState);
    document.removeEventListener('mousemove', onPreviewMouseMove);
    document.removeEventListener('mouseup', onPreviewMouseUp);
  }

  function closePreview() {
    previewState = setPreviewVisibility(previewState, false);
  }
  function reopenPreview() {
    previewState = setPreviewVisibility(previewState, true);
  }

  function resetUploadDestination() {
    uploadDestinationChoice = resetUploadDestinationChoice(uploadDestinationChoice);
  }

  function selectUploadDestination(destination) {
    uploadDestinationChoice = selectUploadDestinationChoice(uploadDestinationChoice, destination);
  }

  function togglePresence() {
    const { repoFullName, token, username } = getConversationPresenceContext({
      conversation: selectedConversation,
      token: localStorage.getItem('skygit_token'),
      auth: get(authStore)
    });

    const result = toggleConversationPresence({
      repoFullName,
      token,
      username,
      pollingActive,
      setPollingState,
      getSessionId: getOrCreateSessionId,
      initializePeerManager,
      updateMyConversations,
      shutdownPeerManager
    });
    if (typeof result.pollingActive === 'boolean') {
      pollingActive = result.pollingActive;
    }
  }

  function forceCommitConversation() {
    if (!selectedConversation) return;
    const key = `${selectedConversation.repo}::${selectedConversation.id}`;
    flushConversationCommitQueue([key]);
  }

  async function chooseUploadDestinationIfNeeded() {
    const { availableDestinations } = getRecordingUploadCredentials(
      get(settingsStore).decrypted,
      currentRepo?.config
    );

    return chooseRecordingUploadDestination(availableDestinations, () => {
      return requestUploadDestinationChoice({
        state: uploadDestinationChoice,
        setState: value => {
          uploadDestinationChoice = value;
        }
      });
    });
  }

  const unsubscribeCurrentContent = currentContent.subscribe((value) => {
    selectedConversation = value;
    selectedConversationStore.set(value);
    
    // Update current repo
    if (value && value.repo) {
      currentRepo = getRepoByFullName(value.repo);
    } else {
      currentRepo = null;
    }
    
    const auth = get(authStore);
    const { repoFullName, token, username } = getConversationPresenceContext({
      conversation: selectedConversation,
      token: localStorage.getItem('skygit_token'),
      auth
    });

    loadSelectedConversationContents({
      conversation: selectedConversation,
      token,
      authToken: get(authStore).token,
      conversationsStore: conversations,
      selectedConversationStore,
      currentRouteStore: currentRoute,
      currentContentStore: currentContent,
      setSelectedConversation: value => {
        selectedConversation = value;
      },
      removeFromSkyGitConversations,
      alertUser: alert,
      warn: console.warn
    });
    const presenceResult = applyConversationPresencePolling({
      repoFullName,
      token,
      username,
      pollingMap: get(presencePolling),
      getSessionId: getOrCreateSessionId,
      initializePeerManager,
      updateMyConversations,
      shutdownPeerManager
    });
    if (typeof presenceResult.pollingActive === 'boolean') {
      pollingActive = presenceResult.pollingActive;
    }
  });

  function startCallWithUser(peer) {
    const result = startConversationCallSession({
      peer,
      conversationId: selectedConversation?.id,
      sendMessageToPeer
    });
    if (result.status === 'started') {
      callActive = result.callActive;
      currentCallPeer = result.currentCallPeer;
    }
  }

  function endCall() {
    const result = endConversationCallSession({
      currentCallPeer,
      conversationId: selectedConversation?.id,
      localStream,
      sendMessageToPeer
    });
    callActive = result.callActive;
    currentCallPeer = result.currentCallPeer;
    localStream = result.localStream;
    remoteStream = result.remoteStream;
  }

  function handleFileInput(event) {
    const file = event.target.files[0];
    if (!file || !callActive || !currentCallPeer) return;
    fileToSend = file;
    fileSending = true;
    sendConversationFile({
      updatePeerConnections: peerConnections.update,
      currentCallPeer,
      file
    });
  }

  async function startScreenShare(withAudio = true, type = 'screen') {
    try {
      screenShareStream = await startConversationScreenShare({
        mediaDevices: navigator.mediaDevices,
        withAudio,
        type,
        updatePeerConnections: peerConnections.update,
        currentCallPeer,
        onEnded: stopScreenShare
      });
      screenSharing = true;
      localStream = screenShareStream;
    } catch (err) {
      console.error('Screen share error:', err);
    }
  }

  function stopScreenShare() {
    localStream = stopConversationScreenShare({
      screenShareStream,
      localCameraStream,
      updatePeerConnections: peerConnections.update,
      currentCallPeer
    });
    screenShareStream = null;
    screenSharing = false;
  }

  async function changeScreenSource() {
    if (!screenSharing) return;
    try {
      const newStream = await changeConversationScreenSource({
        mediaDevices: navigator.mediaDevices,
        updatePeerConnections: peerConnections.update,
        currentCallPeer,
        previousStream: screenShareStream,
        onEnded: stopScreenShare
      });
      screenShareStream = newStream;
      localStream = newStream;
    } catch (err) {
      console.error('Change screen source error:', err);
    }
  }

  function toggleMic() {
    const nextState = toggleConversationMicState({
      micOn,
      cameraOn,
      localStream,
      sendStatus: sendMediaStatus
    });
    micOn = nextState.micOn;
  }
  function toggleCamera() {
    const nextState = toggleConversationCameraState({
      micOn,
      cameraOn,
      localStream,
      sendStatus: sendMediaStatus
    });
    cameraOn = nextState.cameraOn;
  }
  function sendMediaStatus(status = { micOn, cameraOn }) {
    sendConversationMediaStatus({
      updatePeerConnections: peerConnections.update,
      currentCallPeer,
      micOn: status.micOn,
      cameraOn: status.cameraOn
    });
  }

  function notifyRecordingStatus(status) {
    sendConversationRecordingStatus({
      updatePeerConnections: peerConnections.update,
      currentCallPeer,
      recording: status
    });
  }

  const recordingController = createConversationRecordingController({
    getLocalStream: () => localStream,
    uploadRecording: uploadAndShareRecording,
    notifyRecordingStatus,
    onRecordingChange: status => {
      recording = status;
    }
  });

  function startRecording() {
    recordingController.start();
  }
  function stopRecording() {
    recordingController.stop();
  }

  unregisterBrowserCallbacks = registerSkyGitBrowserCallbacks({
    onRecordingStatus: (status) => {
      remoteRecording = !!status.recording;
    },
    onScreenShare: (active, meta) => {
      remoteScreenSharing = active;
      remoteScreenShareMeta = meta || null;
    },
    onMediaStatus: (status) => {
      if (typeof status.micOn === 'boolean') remoteMicOn = status.micOn;
      if (typeof status.cameraOn === 'boolean') remoteCameraOn = status.cameraOn;
    },
    onFileReceiveProgress: (meta, received, total) => {
      applyConversationFileReceiveProgress({
        meta,
        received,
        total,
        setReceiveState: ({ name, progress, percent }) => {
          fileReceiveName = name;
          fileReceiveProgress = progress;
          fileReceivePercent = percent;
        },
        clearReceiveState: () => {
          fileReceiveProgress = null;
          fileReceiveName = '';
          fileReceivePercent = 0;
        }
      });
    },
    onFileSendProgress: (_meta, sent, total) => {
      applyConversationFileSendProgress({
        sent,
        total,
        setSendState: ({ percent }) => {
          fileSendPercent = percent;
        },
        clearSendState: () => {
          fileSending = false;
          fileSendPercent = 0;
          fileToSend = null;
        }
      });
    }
  });

  async function uploadAndShareRecording(blob) {
    await uploadAndShareConversationRecording({
      blob,
      decryptedSettings: get(settingsStore).decrypted,
      repoConfig: currentRepo?.config,
      chooseUploadDestination: chooseUploadDestinationIfNeeded,
      uploadToS3: uploadRecordingToS3,
      uploadToGoogleDrive: uploadRecordingToGoogleDrive,
      sendMessageToPeer,
      currentCallPeer,
      alertUser: alert
    });
  }

  async function syncMessagesFromGitHub() {
    const token = localStorage.getItem('skygit_token');

    try {
      const updatedConversation = await fetchAndMergeConversation({
        conversation: selectedConversation,
        token
      });

      applySyncedConversationToStores({
        updatedConversation,
        previousConversation: selectedConversation,
        conversationsStore: conversations,
        selectedConversationStore,
        setSelectedConversation: value => {
          selectedConversation = value;
        },
        log: console.log
      });
    } catch (err) {
      console.warn('[SkyGit] Failed to sync messages from GitHub:', err);
    }
  }

  const syncController = createConversationSyncController({
    sync: syncMessagesFromGitHub
  });
  let syncKey = null;

  $: {
    const nextSyncKey = selectedConversation && pollingActive
      ? `${selectedConversation.repo}::${selectedConversation.path}`
      : null;

    if (nextSyncKey !== syncKey) {
      syncKey = nextSyncKey;
      if (nextSyncKey) {
        syncController.stop();
        syncController.start();
      } else {
        syncController.stop();
      }
    }
  }

  // Clean up peer connections on tab close
  function cleanupPresence() {
    shutdownPeerManager();
    syncController.stop();
  }

  window.addEventListener('beforeunload', cleanupPresence);
  
  // Clean up on component destroy
  onDestroy(() => {
    unsubscribePolling();
    unsubscribeCurrentContent();
    window.removeEventListener('beforeunload', cleanupPresence);
    syncController.stop();
    unregisterBrowserCallbacks();
  });
</script>
<Layout>
  {#if selectedConversation}
      <div class="flex flex-col h-full">
        <ConversationHeader
          conversation={selectedConversation}
          currentUsername={get(authStore).user.login}
          localPeerId={getLocalPeerId()}
          currentLeader={getCurrentLeader()}
          peerConnections={$peerConnections}
          typingUsers={$typingUsers}
          pollingActive={pollingActive}
          callActive={callActive}
          onTogglePresence={togglePresence}
          onForceCommit={forceCommitConversation}
          onShowParticipants={() => showParticipantModal = true}
          onEndCall={endCall}
        />

        {#if callActive}
          <ConversationCallPanel
            {localStream}
            {remoteStream}
            {micOn}
            {cameraOn}
            {remoteMicOn}
            {remoteCameraOn}
            {remoteScreenSharing}
            {remoteScreenShareMeta}
            {screenSharing}
            {screenShareStream}
            {previewVisible}
            {previewPos}
            {recording}
            {remoteRecording}
            {showShareTypeModal}
            {showUploadDestinationModal}
            onFileInput={handleFileInput}
            onOpenShareTypeModal={openShareTypeModal}
            onCloseShareTypeModal={closeShareTypeModal}
            onSelectShareType={selectShareType}
            onStopScreenShare={stopScreenShare}
            onChangeScreenSource={changeScreenSource}
            onToggleMic={toggleMic}
            onToggleCamera={toggleCamera}
            onToggleRecording={recording ? stopRecording : startRecording}
            onPreviewMouseDown={onPreviewMouseDown}
            onClosePreview={closePreview}
            onReopenPreview={reopenPreview}
            onSelectUploadDestination={selectUploadDestination}
            onResetUploadDestination={resetUploadDestination}
          />
        {/if}

        <div class="flex-1 overflow-y-auto">
          <MessageList 
            conversation={$selectedConversationStore || selectedConversation} 
            on:reply={(e) => replyingTo = e.detail}
          />
        </div>

        <div class="border-t p-4">
          <MessageInput 
            conversation={$selectedConversationStore || selectedConversation} 
            bind:replyingTo={replyingTo}
            repo={currentRepo}
          />
        </div>
      </div>
  {:else}
    <p class="text-gray-400 italic text-center mt-20">
      Select a conversation from the sidebar to view it.
    </p>
  {/if}
</Layout>

<!-- Participant Modal -->
{#if showParticipantModal}
  <ParticipantsModal
    currentUsername={get(authStore).user.login}
    currentLeader={getCurrentLeader()}
    localPeerId={getLocalPeerId()}
    peerConnections={$peerConnections}
    onlinePeers={$onlinePeers}
    onClose={() => showParticipantModal = false}
  />
{/if}
