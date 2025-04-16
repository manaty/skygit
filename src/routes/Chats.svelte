<script>
  import Layout from '../components/Layout.svelte';
  import { currentContent } from '../stores/routeStore.js';
  import { conversations } from '../stores/conversationStore.js';
  import MessageList from '../components/MessageList.svelte';
  import MessageInput from '../components/MessageInput.svelte';
  import { onMount } from 'svelte';
  import { peerConnections, initializePeerManager, sendMessageToPeer } from '../services/repoPeerManager.js';
  import { settingsStore } from '../stores/settingsStore.js';
  import { get } from 'svelte/store';

  let selectedConversation = null;
  let callActive = false;
  let isInitiator = false;
  let localStream = null;
  let remoteStream = null;
  let currentCallPeer = null;
  let onlineUsers = [];
  let fileToSend = null;
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
  }

  async function chooseUploadDestinationIfNeeded() {
    // Gather available destinations
    let repo = selectedConversation && selectedConversation.repo;
    let decrypted = get(settingsStore).decrypted;
    let repoS3 = null, repoDrive = null, userS3 = null, userDrive = null;
    if (repo && window.selectedRepo && window.selectedRepo.config) {
      const url = window.selectedRepo.config.storage_info && window.selectedRepo.config.storage_info.url;
      if (url && decrypted[url]) {
        if (decrypted[url].type === 's3') repoS3 = decrypted[url];
        if (decrypted[url].type === 'google_drive') repoDrive = decrypted[url];
      }
    }
    // User-level fallback
    for (const url in decrypted) {
      if (decrypted[url].type === 's3' && !repoS3) userS3 = decrypted[url];
      if (decrypted[url].type === 'google_drive' && !repoDrive) userDrive = decrypted[url];
    }
    const available = [];
    if (repoS3 || userS3) available.push('s3');
    if (repoDrive || userDrive) available.push('google_drive');
    if (available.length === 2) {
      showUploadDestinationModal = true;
      return new Promise(resolve => {
        const interval = setInterval(() => {
          if (uploadDestination) {
            showUploadDestinationModal = false;
            clearInterval(interval);
            resolve(uploadDestination);
          }
        }, 100);
      });
    } else if (available.length === 1) {
      return available[0];
    } else {
      return null;
    }
  }

  // Example: initialize peer manager on mount (replace with actual user/session/repo info)
  onMount(() => {
    const token = localStorage.getItem('skygit_token');
    const username = localStorage.getItem('skygit_username');
    const repo = selectedConversation ? selectedConversation.repo : null;
    if (token && username && repo) {
      initializePeerManager({ _token: token, _repoFullName: repo, _username: username, _sessionId: crypto.randomUUID() });
    }
    peerConnections.subscribe(update => {
      // update is an object: { username: { conn, status } }
      onlineUsers = Object.keys(update)
        .filter(username => update[username].status === 'connected')
        .map(username => ({ username }));
    });
  });

  currentContent.subscribe((value) => {
    selectedConversation = value;
  });

  function startCallWithUser(peerUsername) {
    callActive = true;
    currentCallPeer = peerUsername;
    // Send a call signaling message to the peer to initiate call (could be more sophisticated)
    sendMessageToPeer(peerUsername, { type: 'signal', subtype: 'call-offer', conversationId: selectedConversation.id });
    // The peer's repoPeerManager will handle the signaling and media setup
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

  // --- S3 Upload ---
  async function uploadToS3(blob, cred) {
    // Use AWS S3 REST API (v4 signature)
    // cred: { type, accessKeyId, secretAccessKey, region, bucket, (optional) endpoint }
    // For simplicity, require bucket and region in the credential
    const fileName = `skygit-recording-${Date.now()}.webm`;
    const bucket = cred.bucket;
    const region = cred.region;
    if (!bucket || !region) {
      alert('S3 credential missing bucket or region.');
      return null;
    }
    // Get pre-signed URL (for now, generate signature client-side)
    // NOTE: For production, signatures should be generated server-side!
    // Here, we use a minimal client-side implementation for demo purposes.
    // See: https://docs.aws.amazon.com/AmazonS3/latest/API/sig-v4-authenticating-requests.html
    // We'll use PUT Object API
    const endpoint = cred.endpoint || `https://${bucket}.s3.${region}.amazonaws.com/${fileName}`;
    // For demo: upload without signature if bucket is public-write (not recommended for prod)
    // Otherwise, you need to implement AWS Signature v4 signing here.
    // We'll try unsigned PUT first:
    const putRes = await fetch(endpoint, {
      method: 'PUT',
      headers: { 'Content-Type': 'video/webm' },
      body: blob
    });
    if (!putRes.ok) {
      alert('Failed to upload to S3. (If this is a private bucket, you must implement AWS Signature v4 client-side or use a backend proxy.)');
      return null;
    }
    // The public URL:
    const publicUrl = endpoint.split('?')[0];
    return publicUrl;
  }

  // --- Modified uploadAndShareRecording ---
  async function uploadAndShareRecording(blob) {
    let decrypted = get(settingsStore).decrypted;
    let repo = selectedConversation && selectedConversation.repo;
    // Find credentials
    let repoS3 = null, repoDrive = null, userS3 = null, userDrive = null;
    if (repo && window.selectedRepo && window.selectedRepo.config) {
      const url = window.selectedRepo.config.storage_info && window.selectedRepo.config.storage_info.url;
      if (url && decrypted[url]) {
        if (decrypted[url].type === 's3') repoS3 = decrypted[url];
        if (decrypted[url].type === 'google_drive') repoDrive = decrypted[url];
      }
    }
    for (const url in decrypted) {
      if (decrypted[url].type === 's3' && !repoS3) userS3 = decrypted[url];
      if (decrypted[url].type === 'google_drive' && !repoDrive) userDrive = decrypted[url];
    }
    let cred = null;
    let destination = await chooseUploadDestinationIfNeeded();
    if (!destination) {
      alert('No upload destination (S3 or Google Drive) configured.');
      return;
    }
    if (destination === 's3') cred = repoS3 || userS3;
    if (destination === 'google_drive') cred = repoDrive || userDrive;
    let link = null;
    if (destination === 's3') {
      link = await uploadToS3(blob, cred);
    } else if (destination === 'google_drive') {
      link = await uploadAndShareRecordingGoogleDrive(blob, cred);
    }
    if (link) {
      sendMessageToPeer(currentCallPeer, { type: 'chat', content: `📹 Recording: ${link}` });
      alert('Recording uploaded and link shared!');
    }
  }

  // --- Google Drive logic factored out ---
  async function uploadAndShareRecordingGoogleDrive(blob, cred) {
    let accessToken;
    try {
      accessToken = await getGoogleAccessToken(cred);
    } catch (e) {
      alert('Google Drive authentication failed: ' + e.message);
      return null;
    }
    const metadata = {
      name: `SkyGit Recording ${new Date().toISOString()}.webm`,
      mimeType: 'video/webm'
    };
    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', blob);
    const uploadRes = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + accessToken },
      body: form
    });
    if (!uploadRes.ok) {
      alert('Failed to upload to Google Drive');
      return null;
    }
    const fileData = await uploadRes.json();
    // Make file shareable
    await fetch(`https://www.googleapis.com/drive/v3/files/${fileData.id}/permissions`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + accessToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ role: 'reader', type: 'anyone' })
    });
    // Get shareable link
    const metaRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileData.id}?fields=webViewLink,webContentLink`, {
      headers: { Authorization: 'Bearer ' + accessToken }
    });
    const meta = await metaRes.json();
    return meta.webViewLink || meta.webContentLink;
  }

  async function getDriveCredential() {
    // Try repo-level first
    let repo = selectedConversation && selectedConversation.repo;
    let secrets = get(settingsStore).secrets;
    let decrypted = get(settingsStore).decrypted;
    let repoUrl = null;
    let cred = null;
    if (repo && window.selectedRepo && window.selectedRepo.config && window.selectedRepo.config.binary_storage_type === 'google_drive') {
      repoUrl = window.selectedRepo.config.storage_info && window.selectedRepo.config.storage_info.url;
      if (repoUrl && decrypted[repoUrl] && decrypted[repoUrl].type === 'google_drive') {
        cred = decrypted[repoUrl];
      }
    }
    // Fallback to any user-level Google Drive credential
    if (!cred) {
      for (const url in decrypted) {
        if (decrypted[url].type === 'google_drive') {
          cred = decrypted[url];
          break;
        }
      }
    }
    return cred;
  }

  async function getGoogleAccessToken(cred) {
    const params = new URLSearchParams();
    params.append('client_id', cred.client_id);
    params.append('client_secret', cred.client_secret);
    params.append('refresh_token', cred.refresh_token);
    params.append('grant_type', 'refresh_token');
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    });
    if (!res.ok) throw new Error('Failed to get Google access token');
    const data = await res.json();
    return data.access_token;
  }
</script>
<Layout>
  {#if selectedConversation}
    <div class="flex flex-col h-full">
      <div class="flex items-center justify-between px-4 py-2 border-b">
        <div>
          <h2 class="text-xl font-semibold">{selectedConversation.title}</h2>
          <p class="text-sm text-gray-500">{selectedConversation.repo}</p>
        </div>
        <div class="text-sm text-gray-500">
          {selectedConversation.participants?.length ?? 0} participants
        </div>
        <div class="ml-4">
          <!-- Example: List online users for call/chat -->
          {#each onlineUsers as user (user.username)}
            <button on:click={() => startCallWithUser(user.username)} class="bg-blue-500 text-white px-3 py-1 rounded mr-2">Call {user.username}</button>
          {/each}
          {#if callActive}
            <button on:click={endCall} class="bg-red-500 text-white px-3 py-1 rounded">End Call</button>
          {/if}
        </div>
      </div>

      {#if callActive}
        <div class="flex flex-row justify-center items-center py-4 gap-4">
          <div>
            <div class="text-xs text-gray-400 mb-1">Local Video</div>
            <video bind:this={el => localStream && (el.srcObject = localStream)} autoplay playsinline muted width="200" height="150" style="background: #222;" />
            <div class="flex flex-row gap-2 justify-center mt-1">
              <span class="text-xs">{micOn ? '🎤 Mic On' : '🔇 Mic Off'}</span>
              <span class="text-xs">{cameraOn ? '📷 Cam On' : '🚫📷 Cam Off'}</span>
            </div>
          </div>
          <div>
            <div class="text-xs text-gray-400 mb-1">Remote Video</div>
            <video bind:this={el => remoteStream && (el.srcObject = remoteStream)} autoplay playsinline width="200" height="150" style="background: #222;" />
            <div class="flex flex-row gap-2 justify-center mt-1">
              <span class="text-xs">{remoteMicOn ? '🎤 Mic On' : '🔇 Mic Off'}</span>
              <span class="text-xs">{remoteCameraOn ? '📷 Cam On' : '🚫📷 Cam Off'}</span>
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
            {#if screenSharing}🛑 Stop Sharing{else}🖥️ Share Screen{/if}
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
          >
            <div class="bg-white border shadow-lg rounded-lg p-2 flex flex-col items-center relative">
              <button class="absolute top-1 right-1 text-gray-400 hover:text-black text-lg font-bold px-1" style="z-index:2;" on:click|stopPropagation={closePreview} title="Close Preview">×</button>
              <div class="text-xs text-gray-500 mb-1">Screen Share Preview</div>
              <video bind:this={el => el && (el.srcObject = screenShareStream)} autoplay muted playsinline width="160" height="100" style="border-radius: 0.5rem; background: #222;" />
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
            <button class="bg-blue-200 rounded px-3 py-2 hover:bg-blue-300" on:click={() => { uploadDestination = 'google_drive'; }}>
              Google Drive
            </button>
            <button class="bg-yellow-200 rounded px-3 py-2 hover:bg-yellow-300" on:click={() => { uploadDestination = 's3'; }}>
              S3
            </button>
            <button class="mt-2 text-sm text-gray-500 hover:text-black" on:click={resetUploadDestination}>Cancel</button>
          </div>
        </div>
      {/if}

      <div class="flex-1 overflow-y-auto">
        <MessageList conversation={selectedConversation} />
      </div>

      <div class="border-t p-4">
        <MessageInput conversation={selectedConversation} />
      </div>
    </div>
  {:else}
    <p class="text-gray-400 italic text-center mt-20">
      Select a conversation from the sidebar to view it.
    </p>
  {/if}
</Layout>
