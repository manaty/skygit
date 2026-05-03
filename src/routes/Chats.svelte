<script>
  import Layout from '../components/Layout.svelte';
  import { currentContent, currentRoute } from '../stores/routeStore.js';
  import { conversations, selectedConversation as selectedConversationStore } from '../stores/conversationStore.js';
  import MessageList from '../components/MessageList.svelte';
  import MessageInput from '../components/MessageInput.svelte';
  import ConversationCallPanel from '../components/ConversationCallPanel.svelte';
  import ConversationHeader from '../components/ConversationHeader.svelte';
  import ParticipantsModal from '../components/ParticipantsModal.svelte';
  import { onMount, onDestroy } from 'svelte';
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
  import {
    uploadRecordingToGoogleDrive,
    uploadRecordingToS3
  } from '../services/recordingUploadService.js';
  import { settingsStore } from '../stores/settingsStore.js';
  import { get } from 'svelte/store';
  import { authStore } from '../stores/authStore.js';
  import { getOrCreateSessionId } from '../utils/sessionManager.js';
  import { chooseRecordingUploadDestination } from '../utils/uploadDestinationChoice.js';
  import { getRecordingUploadCredentials } from '../utils/uploadCredentials.js';
  import { getRepoByFullName } from '../stores/repoStore.js';
  import { calculateTransferPercent } from '../utils/transferProgress.js';
  let selectedConversation = null;
  let callActive = false;
  let currentRepo = null;
  let localStream = null;
  let remoteStream = null;
  let currentCallPeer = null;
  let onlineUsers = [];
  let fileToSend = null;
  let showParticipantModal = false;
  let fileSending = false;
  let fileSendProgress = 0;
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
  let previewVisible = true;
  let micOn = true;
  let cameraOn = true;
  let remoteMicOn = true;
  let remoteCameraOn = true;
  let recording = false;
  let remoteRecording = false;
  let replyingTo = null; // Track message being replied to

  // Presence polling control
  import { derived } from 'svelte/store';
  let pollingActive = true;

  // subscribe to presencePolling store to update local flag per repo
  const unsubscribePolling = presencePolling.subscribe((map) => {
    if (selectedConversation && selectedConversation.repo) {
      pollingActive = map[selectedConversation.repo] !== false; // default true
    }
  });
  let mediaRecorder = null;
  let recordedChunks = [];

  // --- Draggable preview state ---
  let previewPos = { x: 0, y: 0 };
  let previewDragging = false;
  let previewOffset = { x: 0, y: 0 };

  // --- Upload destination selection ---
  let uploadDestination = null; // 'google_drive' | 's3'
  let showUploadDestinationModal = false;
  let resolveUploadDestinationChoice = null;

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
    previewDragging = true;
    previewOffset = {
      x: e.clientX - previewPos.x,
      y: e.clientY - previewPos.y
    };
    document.addEventListener('mousemove', onPreviewMouseMove);
    document.addEventListener('mouseup', onPreviewMouseUp);
  }
  function onPreviewMouseMove(e) {
    if (!previewDragging) return;
    previewPos.x = e.clientX - previewOffset.x;
    previewPos.y = e.clientY - previewOffset.y;
  }
  function onPreviewMouseUp() {
    previewDragging = false;
    document.removeEventListener('mousemove', onPreviewMouseMove);
    document.removeEventListener('mouseup', onPreviewMouseUp);
  }

  function closePreview() {
    previewVisible = false;
  }
  function reopenPreview() {
    previewVisible = true;
  }

  function resetUploadDestination() {
    uploadDestination = null;
    showUploadDestinationModal = false;
    if (resolveUploadDestinationChoice) {
      resolveUploadDestinationChoice(null);
      resolveUploadDestinationChoice = null;
    }
  }

  function selectUploadDestination(destination) {
    uploadDestination = destination;
    showUploadDestinationModal = false;
    if (resolveUploadDestinationChoice) {
      resolveUploadDestinationChoice(destination);
      resolveUploadDestinationChoice = null;
    }
  }

  function togglePresence() {
    if (!selectedConversation) return;
    const repoFullName = selectedConversation.repo;
    const token = localStorage.getItem('skygit_token');
    const auth = get(authStore);
    const username = auth?.user?.login;

    if (!token || !username) return;

    if (pollingActive) {
      // Stop polling / tear down
      setPollingState(repoFullName, false);
      shutdownPeerManager();
    } else {
      // Start
      setPollingState(repoFullName, true);
      const sessionId = getOrCreateSessionId(repoFullName);
      initializePeerManager({ _token: token, _repoFullName: repoFullName, _username: username, _sessionId: sessionId });
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
      if (resolveUploadDestinationChoice) {
        resolveUploadDestinationChoice(null);
      }
      uploadDestination = null;
      showUploadDestinationModal = true;
      return new Promise(resolve => {
        resolveUploadDestinationChoice = resolve;
      });
    });
  }

  const unsubscribePeerConnections = peerConnections.subscribe(update => {
    // update is an object keyed by session_id -> { conn, status, username }
    onlineUsers = Object.entries(update)
      .filter(([_sid, info]) => info.status === 'connected')
      .map(([sid, info]) => ({ session_id: sid, username: info.username }));
  });


  const unsubscribeCurrentContent = currentContent.subscribe((value) => {
    selectedConversation = value;
    selectedConversationStore.set(value);
    
    // Update current repo
    if (value && value.repo) {
      currentRepo = getRepoByFullName(value.repo);
    } else {
      currentRepo = null;
    }
    
    const token = localStorage.getItem('skygit_token');
    const auth = get(authStore);
    const username = auth?.user?.login || null;
    const repo = selectedConversation ? selectedConversation.repo : null;

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
    if (token && username && repo) {
      // Check polling state for this repo
      const map = get(presencePolling);
      pollingActive = map[repo] !== false;
      if (pollingActive) {
        const sessionId = getOrCreateSessionId(repo);
        initializePeerManager({ _token: token, _repoFullName: repo, _username: username, _sessionId: sessionId });
        
        // Notify the discovery system about our current conversation
        setTimeout(() => {
          updateMyConversations([repo]);
        }, 2000); // Wait for peer manager to initialize
      } else {
        shutdownPeerManager();
      }
    }
  });

  // Initiate call with a given peer (identified by session_id)
  function startCallWithUser(peer) {
    // `peer` can be either session_id string or { session_id, username }
    const sid = typeof peer === 'string' ? peer : peer.session_id;
    callActive = true;
    currentCallPeer = sid;
    sendMessageToPeer(sid, { type: 'signal', subtype: 'call-offer', conversationId: selectedConversation.id });
  }

  function endCall() {
    callActive = false;
    currentCallPeer = null;
    if (localStream) {
      localStream.getTracks().forEach(t => t.stop());
      localStream = null;
    }
    remoteStream = null;
    // Optionally notify peer
    if (currentCallPeer) {
      sendMessageToPeer(currentCallPeer, { type: 'signal', subtype: 'call-end', conversationId: selectedConversation.id });
    }
  }

  function handleFileInput(event) {
    const file = event.target.files[0];
    if (!file || !callActive || !currentCallPeer) return;
    fileToSend = file;
    fileSending = true;
    fileSendProgress = 0;
    // Find the peer connection
    peerConnections.update(conns => {
      const peer = conns[currentCallPeer]?.conn;
      if (peer && typeof peer.sendFile === 'function') {
        peer.sendFile(file);
      }
      return conns;
    });
  }

  async function startScreenShare(withAudio = true, type = 'screen') {
    try {
      let displayMediaOptions = { video: true, audio: withAudio };
      // For Chrome, tab sharing can be requested with preferCurrentTab
      if (type === 'tab') {
        displayMediaOptions = {
          video: { displaySurface: 'browser', cursor: 'always' },
          audio: withAudio
        };
      } else if (type === 'window') {
        displayMediaOptions = {
          video: { displaySurface: 'window', cursor: 'always' },
          audio: withAudio
        };
      } else if (type === 'screen') {
        displayMediaOptions = {
          video: { displaySurface: 'monitor', cursor: 'always' },
          audio: withAudio
        };
      }
      screenShareStream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
      screenSharing = true;
      // Notify peer
      peerConnections.update(conns => {
        const peer = conns[currentCallPeer]?.conn;
        if (peer && peer.replaceVideoTrack) {
          peer.replaceVideoTrack(screenShareStream.getVideoTracks()[0]);
          if (peer.sendScreenShareSignal) {
            peer.sendScreenShareSignal(true, { audio: withAudio });
          }
        }
        return conns;
      });
      localStream = screenShareStream;
      screenShareStream.getVideoTracks()[0].onended = stopScreenShare;
    } catch (err) {
      console.error('Screen share error:', err);
    }
  }

  function stopScreenShare() {
    if (screenShareStream) {
      screenShareStream.getTracks().forEach(track => track.stop());
      screenShareStream = null;
    }
    screenSharing = false;
    // Notify peer
    peerConnections.update(conns => {
      const peer = conns[currentCallPeer]?.conn;
      if (peer && peer.replaceVideoTrack && localCameraStream) {
        peer.replaceVideoTrack(localCameraStream.getVideoTracks()[0]);
        if (peer.sendScreenShareSignal) {
          peer.sendScreenShareSignal(false);
        }
      }
      return conns;
    });
    localStream = localCameraStream;
  }

  async function changeScreenSource() {
    if (!screenSharing) return;
    try {
      const newStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      // Swap the new video track
      peerConnections.update(conns => {
        const peer = conns[currentCallPeer]?.conn;
        if (peer && peer.replaceVideoTrack) {
          peer.replaceVideoTrack(newStream.getVideoTracks()[0]);
        }
        return conns;
      });
      // Stop old tracks and update stream
      if (screenShareStream) screenShareStream.getTracks().forEach(track => track.stop());
      screenShareStream = newStream;
      localStream = newStream;
      newStream.getVideoTracks()[0].onended = stopScreenShare;
    } catch (err) {
      console.error('Change screen source error:', err);
    }
  }

  function toggleMic() {
    micOn = !micOn;
    if (localStream) {
      localStream.getAudioTracks().forEach(track => track.enabled = micOn);
    }
    sendMediaStatus();
  }
  function toggleCamera() {
    cameraOn = !cameraOn;
    if (localStream) {
      localStream.getVideoTracks().forEach(track => track.enabled = cameraOn);
    }
    sendMediaStatus();
  }
  function sendMediaStatus() {
    peerConnections.update(conns => {
      const peer = conns[currentCallPeer]?.conn;
      if (peer && peer.send) {
        peer.send({ type: 'media-status', micOn, cameraOn });
      }
      return conns;
    });
  }

  function notifyRecordingStatus(status) {
    peerConnections.update(conns => {
      const peer = conns[currentCallPeer]?.conn;
      if (peer && peer.send) {
        peer.send({ type: 'recording-status', recording: status });
      }
      return conns;
    });
  }

  function startRecording() {
    if (!localStream) return;
    recordedChunks = [];
    mediaRecorder = new MediaRecorder(localStream, { mimeType: 'video/webm; codecs=vp9' });
    mediaRecorder.ondataavailable = event => {
      if (event.data.size > 0) recordedChunks.push(event.data);
    };
    mediaRecorder.onstop = handleRecordingStop;
    mediaRecorder.start();
    recording = true;
    notifyRecordingStatus(true);
  }
  function stopRecording() {
    if (mediaRecorder && recording) {
      mediaRecorder.stop();
      recording = false;
      notifyRecordingStatus(false);
    }
  }
  async function handleRecordingStop() {
    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    // Next step: upload to Google Drive and share link
    await uploadAndShareRecording(blob);
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
      fileReceiveName = meta.name;
      fileReceiveProgress = { received, total };
      fileReceivePercent = calculateTransferPercent(received, total);
      if (received === total) {
        setTimeout(() => {
          fileReceiveProgress = null;
          fileReceiveName = '';
          fileReceivePercent = 0;
        }, 3000);
      }
    },
    onFileSendProgress: (_meta, sent, total) => {
      fileSendPercent = calculateTransferPercent(sent, total);
      if (sent === total) {
        setTimeout(() => {
          fileSending = false;
          fileSendPercent = 0;
          fileToSend = null;
        }, 2000);
      }
    }
  });

  async function uploadAndShareRecording(blob) {
    const { credentials } = getRecordingUploadCredentials(
      get(settingsStore).decrypted,
      currentRepo?.config
    );
    let destination = await chooseUploadDestinationIfNeeded();
    if (!destination) {
      alert('No upload destination (S3 or Google Drive) configured.');
      return;
    }
    const cred = credentials[destination];
    let link = null;
    try {
      if (destination === 's3') {
        link = await uploadRecordingToS3(blob, cred);
      } else if (destination === 'google_drive') {
        link = await uploadRecordingToGoogleDrive(blob, cred);
      }
    } catch (error) {
      alert(error.message);
      return;
    }
    if (link) {
      sendMessageToPeer(currentCallPeer, { type: 'chat', content: `📹 Recording: ${link}` });
      alert('Recording uploaded and link shared!');
    }
  }

  async function syncMessagesFromGitHub() {
    const token = localStorage.getItem('skygit_token');

    try {
      const updatedConversation = await fetchAndMergeConversation({
        conversation: selectedConversation,
        token
      });

      if (updatedConversation) {
        console.log(`[SkyGit] Synced ${updatedConversation.messages.length - (selectedConversation.messages || []).length} new messages from GitHub`);

        selectedConversation = updatedConversation;
        selectedConversationStore.set(updatedConversation);

        conversations.update(map => {
          const list = map[updatedConversation.repo] || [];
          const updated = list.map(c => (c.id === updatedConversation.id ? updatedConversation : c));
          return { ...map, [updatedConversation.repo]: updated };
        });
      }
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
    unsubscribePeerConnections();
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
