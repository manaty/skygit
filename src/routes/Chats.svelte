<script>
  import Layout from '../components/Layout.svelte';
  import { currentContent, currentRoute } from '../stores/routeStore.js';
  import { conversations, selectedConversation as selectedConversationStore } from '../stores/conversationStore.js';
  import MessageList from '../components/MessageList.svelte';
  import MessageInput from '../components/MessageInput.svelte';
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
  let previewRef;

  // --- Upload destination selection ---
  let uploadDestination = null; // 'google_drive' | 's3'
  let showUploadDestinationModal = false;
  let resolveUploadDestinationChoice = null;

  let localVideoEl;
  let remoteVideoEl;
  let screenSharePreviewEl;

  $: if (localVideoEl && localStream) {
    localVideoEl.srcObject = localStream;
  }

  $: if (remoteVideoEl && remoteStream) {
    remoteVideoEl.srcObject = remoteStream;
  }

  $: if (screenSharePreviewEl && screenShareStream) {
    screenSharePreviewEl.srcObject = screenShareStream;
  }

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
      console.log('[SkyGit] Using session ID for toggle:', sessionId);
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
    console.log('[SkyGit][Presence] currentContent changed:', value);
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
    console.log('[SkyGit][Presence] authStore value:', auth);
    console.log('[SkyGit][Presence] onConversationSelect: token', token, 'username', username, 'repo', repo, 'selectedConversation', selectedConversation);

    // --- Fetch conversation messages from GitHub if not yet present ---
    (async () => {
      
      if (token && selectedConversation && selectedConversation.repo && selectedConversation.id && (!selectedConversation.messages || !selectedConversation.messages.length)) {
        try {
          const headers = {
            Authorization: `token ${token}`,
            Accept: 'application/vnd.github+json'
          };
          // Use the conversation file path directly
          const convoPath = selectedConversation.path;
          const url = `https://api.github.com/repos/${selectedConversation.repo}/contents/${convoPath}`;
          
          const res = await fetch(url, { headers });
          
          if (res.ok) {
            const blob = await res.json();
            const decoded = JSON.parse(atob(blob.content));
            
            if (decoded && Array.isArray(decoded.messages)) {
              // Create a new object to trigger reactivity and update the path to the correct one
              const updatedConversation = { 
                ...selectedConversation, 
                messages: decoded.messages,
                path: convoPath // Update to the path that actually worked
              };
              selectedConversation = updatedConversation;
              
              // Update the selectedConversation store
              selectedConversationStore.set(updatedConversation);
              
              // Update the conversations store
              conversations.update(map => {
                const list = map[updatedConversation.repo] || [];
                const updated = list.map(c => (c.id === updatedConversation.id ? updatedConversation : c));
                return { ...map, [updatedConversation.repo]: updated };
              });
            }
          } else if (res.status === 404) {
            console.warn('[SkyGit] Conversation file was deleted from GitHub');
            const removedConversation = selectedConversation;
            const conversationTitle = removedConversation?.title || 'Unknown';
            
            if (removedConversation) {
              // Remove from local storage since it no longer exists on GitHub
              conversations.update(map => {
                const list = map[removedConversation.repo] || [];
                const filtered = list.filter(c => c.id !== removedConversation.id);
                return { ...map, [removedConversation.repo]: filtered };
              });
            }
            
            // Clear the selected conversation
            selectedConversation = null;
            selectedConversationStore.set(null);
            
            // Navigate back to the conversations list
            currentRoute.set("chats");
            currentContent.set(null);
            
            // Also remove from skygit-config repository
            const token = get(authStore).token;
            if (token && removedConversation) {
              removeFromSkyGitConversations(token, removedConversation);
            }
            
            alert(`Conversation "${conversationTitle}" was deleted from the repository and has been removed from your local list.`);
          } else {
            console.warn('[SkyGit] Failed to load conversation, status:', res.status);
            // Initialize with empty messages for other errors
            const updatedConversation = { 
              ...selectedConversation, 
              messages: []
            };
            selectedConversation = updatedConversation;
            selectedConversationStore.set(updatedConversation);
          }
        } catch (err) {
          console.warn('[SkyGit] Failed to fetch conversation contents', err);
        }
      }
    })();
    if (token && username && repo) {
      // Check polling state for this repo
      const map = get(presencePolling);
      pollingActive = map[repo] !== false;
      if (pollingActive) {
        const sessionId = getOrCreateSessionId(repo);
        console.log('[SkyGit] Using session ID:', sessionId);
        console.log('[SkyGit] Session ID timestamp:', Date.now());
        console.log('[SkyGit] Session ID length:', sessionId.length);
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

  // Listen for remote peer recording status
  if (typeof window !== 'undefined') {
    window.skygitOnRecordingStatus = (status) => {
      remoteRecording = !!status.recording;
    };
  }

  // Listen for screen share signaling messages
  if (typeof window !== 'undefined') {
    window.skygitOnScreenShare = (active, meta) => {
      remoteScreenSharing = active;
      remoteScreenShareMeta = meta || null;
    };
  }

  // Listen for remote peer media status
  if (typeof window !== 'undefined') {
    window.skygitOnMediaStatus = (status) => {
      if (typeof status.micOn === 'boolean') remoteMicOn = status.micOn;
      if (typeof status.cameraOn === 'boolean') remoteCameraOn = status.cameraOn;
    };
  }

  if (typeof window !== 'undefined') {
    window.skygitFileReceiveProgress = (meta, received, total) => {
      fileReceiveName = meta.name;
      fileReceiveProgress = { received, total };
      fileReceivePercent = Math.round((received / total) * 100);
      if (received === total) {
        setTimeout(() => {
          fileReceiveProgress = null;
          fileReceiveName = '';
          fileReceivePercent = 0;
        }, 3000);
      }
    };

    window.skygitFileSendProgress = (meta, sent, total) => {
      fileSendPercent = Math.round((sent / total) * 100);
      if (sent === total) {
        setTimeout(() => {
          fileSending = false;
          fileSendPercent = 0;
          fileToSend = null;
        }, 2000);
      }
    };
  }

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
          <div class="flex flex-row justify-center items-center py-4 gap-4">
            <div>
              <div class="text-xs text-gray-400 mb-1">Local Video</div>
              <video bind:this={localVideoEl} autoplay playsinline muted width="200" height="150" style="background: #222;">
                <track kind="captions" />
              </video>
              <div class="flex flex-row gap-2 justify-center mt-1">
                <span class="text-xs">{#if micOn} 🎤 Mic On {:else} 🔇 Mic Off {/if}</span>
                <span class="text-xs">{#if cameraOn} 📷 Cam On {:else} 🚫📷 Cam Off {/if}</span>
              </div>
            </div>
            <div>
              <div class="text-xs text-gray-400 mb-1">Remote Video</div>
              <video bind:this={remoteVideoEl} autoplay playsinline width="200" height="150" style="background: #222;">
                <track kind="captions" />
              </video>
              <div class="flex flex-row gap-2 justify-center mt-1">
                <span class="text-xs">{#if remoteMicOn} 🎤 Mic On {:else} 🔇 Mic Off {/if}</span>
                <span class="text-xs">{#if remoteCameraOn} 📷 Cam On {:else} 🚫📷 Cam Off {/if}</span>
              </div>
            </div>
          </div>
          {#if remoteScreenSharing}
            <div class="flex flex-row justify-center items-center py-2">
              <span class="bg-yellow-300 text-black px-2 py-1 rounded font-bold text-xs">Remote is sharing their screen{#if remoteScreenShareMeta?.audio} (with audio){/if}!</span>
            </div>
          {/if}
          <div class="flex flex-row items-center gap-3 justify-center mt-2">
            <label class="bg-gray-100 border px-3 py-1 rounded cursor-pointer">
              📎 Share File
              <input type="file" style="display:none" on:change={handleFileInput} />
            </label>
            <button class="bg-blue-100 border px-3 py-1 rounded" on:click={screenSharing ? stopScreenShare : openShareTypeModal}>
              {#if screenSharing}
                🛑 Stop Sharing
              {:else}
                🖥️ Share Screen
              {/if}
            </button>
            {#if screenSharing}
              <button class="bg-yellow-100 border px-3 py-1 rounded" on:click={changeScreenSource}>
                🔄 Change Screen Source
              </button>
            {/if}
            <button class="bg-gray-200 border px-3 py-1 rounded flex items-center gap-1" on:click={toggleMic} title={micOn ? 'Mute Mic' : 'Unmute Mic'}>
              {#if micOn}
                <span>🎤</span>
              {:else}
                <span>🔇</span>
              {/if}
            </button>
            <button class="bg-gray-200 border px-3 py-1 rounded flex items-center gap-1" on:click={toggleCamera} title={cameraOn ? 'Turn Off Camera' : 'Turn On Camera'}>
              {#if cameraOn}
                <span>📷</span>
              {:else}
                <span>🚫📷</span>
              {/if}
            </button>
            <button class="bg-red-200 border px-3 py-1 rounded flex items-center gap-1 font-bold" on:click={recording ? stopRecording : startRecording} title={recording ? 'Stop Recording' : 'Start Recording'}>
              {#if recording}
                <span>⏹️ Stop Recording</span>
              {:else}
                <span>⏺️ Start Recording</span>
              {/if}
            </button>
          </div>
          {#if recording}
            <div class="fixed top-4 right-4 z-50 bg-red-600 text-white px-4 py-2 rounded shadow-lg flex items-center gap-2 animate-pulse">
              <span>⏺️ Recording...</span>
            </div>
          {/if}
          {#if remoteRecording}
            <div class="fixed top-16 right-4 z-50 bg-yellow-400 text-black px-4 py-2 rounded shadow-lg flex items-center gap-2">
              <span>⚠️ Peer is recording</span>
            </div>
          {/if}
        {/if}

        {#if screenSharing && screenShareStream}
          {#if previewVisible}
            <div bind:this={previewRef}
              class="fixed z-50 flex flex-col items-end cursor-move"
              style="left: {previewPos.x}px; top: {previewPos.y}px; min-width: 180px; min-height: 120px; user-select: none;"
              on:mousedown={onPreviewMouseDown}
              tabindex="-1"
              aria-hidden="true"
            >
              <div class="bg-white border shadow-lg rounded-lg p-2 flex flex-col items-center relative">
                <button class="absolute top-1 right-1 text-gray-400 hover:text-black text-lg font-bold px-1" style="z-index:2;" on:click|stopPropagation={closePreview} title="Close Preview">×</button>
                <div class="text-xs text-gray-500 mb-1">Screen Share Preview</div>
                <video bind:this={screenSharePreviewEl} autoplay muted playsinline width="160" height="100" style="border-radius: 0.5rem; background: #222;">
                  <track kind="captions" />
                </video>
              </div>
            </div>
          {:else}
            <button class="fixed bottom-6 right-6 z-50 bg-white border shadow rounded-full px-3 py-2 text-xs font-bold hover:bg-blue-100" on:click={reopenPreview}>
              Show Screen Preview
            </button>
          {/if}
        {/if}

        {#if showShareTypeModal}
          <div class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div class="bg-white rounded-lg shadow-lg p-6 min-w-[260px] flex flex-col gap-3">
              <div class="font-bold mb-2">Select what to share</div>
              <button class="bg-gray-200 rounded px-3 py-2 hover:bg-blue-100" on:click={() => selectShareType('screen')}>Entire Screen</button>
              <button class="bg-gray-200 rounded px-3 py-2 hover:bg-blue-100" on:click={() => selectShareType('window')}>Application Window</button>
              <button class="bg-gray-200 rounded px-3 py-2 hover:bg-blue-100" on:click={() => selectShareType('tab')}>Browser Tab</button>
              <button class="mt-2 text-sm text-gray-500 hover:text-black" on:click={closeShareTypeModal}>Cancel</button>
            </div>
          </div>
        {/if}

        {#if showUploadDestinationModal}
          <div class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div class="bg-white rounded-lg shadow-lg p-6 min-w-[260px] flex flex-col gap-3">
              <div class="font-bold mb-2">Choose upload destination</div>
              <button class="bg-blue-200 rounded px-3 py-2 hover:bg-blue-300" on:click={() => selectUploadDestination('google_drive')}>
                Google Drive
              </button>
              <button class="bg-yellow-200 rounded px-3 py-2 hover:bg-yellow-300" on:click={() => selectUploadDestination('s3')}>
                S3
              </button>
              <button class="mt-2 text-sm text-gray-500 hover:text-black" on:click={resetUploadDestination}>Cancel</button>
            </div>
          </div>
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
