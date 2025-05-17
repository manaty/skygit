<script>
  import Layout from '../components/Layout.svelte';
  import { currentContent } from '../stores/routeStore.js';
  import { conversations } from '../stores/conversationStore.js';
  import MessageList from '../components/MessageList.svelte';
  import MessageInput from '../components/MessageInput.svelte';
import { onMount, onDestroy } from 'svelte';
import { peerConnections, onlinePeers, initializePeerManager, shutdownPeerManager, sendMessageToPeer } from '../services/repoPeerManager.js';
import { presencePolling, setPollingState } from '../stores/presenceControlStore.js';
import { deleteOwnPresenceComment } from '../services/repoPresence.js';
import { flushConversationCommitQueue } from '../services/conversationCommitQueue.js';
  import { settingsStore } from '../stores/settingsStore.js';
  import { get } from 'svelte/store';
  import { authStore } from '../stores/authStore.js';
  import { repoList, getRepoByFullName } from '../stores/repoStore.js';
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
      initializePeerManager({ _token: token, _repoFullName: repoFullName, _username: username, _sessionId: crypto.randomUUID() });
    }
  }

  function forceCommitConversation() {
    if (!selectedConversation) return;
    const key = `${selectedConversation.repo}::${selectedConversation.id}`;
    flushConversationCommitQueue([key]);
  }

  // Clean-up subscription when component is destroyed
  onDestroy(() => {
    unsubscribePolling();
  });

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

  peerConnections.subscribe(update => {
    // update is an object keyed by session_id -> { conn, status, username }
    onlineUsers = Object.entries(update)
      .filter(([_sid, info]) => info.status === 'connected')
      .map(([sid, info]) => ({ session_id: sid, username: info.username }));
  });

  let showDiscussionsDisabledAlert = false;
  let repoDiscussionsUrl = '';

  // Helper to refresh repo Discussions status from GitHub
  async function refreshDiscussionsStatus(repoFullName) {
    const token = localStorage.getItem('skygit_token');
    if (!token || !repoFullName) return null;
    try {
      const res = await fetch(`https://api.github.com/repos/${repoFullName}`, {
        headers: { Authorization: `token ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        // Update repo in store
        repoList.update(list => {
          return list.map(r =>
            r.full_name === repoFullName ? { ...r, has_discussions: data.has_discussions } : r
          );
        });
        return data.has_discussions;
      }
    } catch (e) {
      console.warn('Failed to refresh Discussions status', e);
    }
    return null;
  }

  currentContent.subscribe((value) => {
    console.log('[SkyGit][Presence] currentContent changed:', value);
    selectedConversation = value;
    showDiscussionsDisabledAlert = false;
    repoDiscussionsUrl = '';
    const token = localStorage.getItem('skygit_token');
    const auth = get(authStore);
    const username = auth?.user?.login || null;
    const repo = selectedConversation ? selectedConversation.repo : null;
    console.log('[SkyGit][Presence] authStore value:', auth);
    console.log('[SkyGit][Presence] onConversationSelect: token', token, 'username', username, 'repo', repo, 'selectedConversation', selectedConversation);

    // --- Fetch conversation messages from GitHub if not yet present ---
    (async () => {
      if (token && selectedConversation && (!selectedConversation.messages || !selectedConversation.messages.length)) {
        try {
          const headers = {
            Authorization: `token ${token}`,
            Accept: 'application/vnd.github+json'
          };
          // Determine path of conversation file
          const convoPath = selectedConversation.path || `.messages/conversation-${selectedConversation.id}.json`;
          const url = `https://api.github.com/repos/${selectedConversation.repo}/contents/${convoPath}`;
          const res = await fetch(url, { headers });
          if (res.ok) {
            const blob = await res.json();
            const decoded = JSON.parse(atob(blob.content));
            if (decoded && Array.isArray(decoded.messages)) {
              // Merge messages into store and selectedConversation reference
              selectedConversation = { ...selectedConversation, messages: decoded.messages };
              // Also update the conversation store so MessageList re-renders properly
              conversations.update(map => {
                const list = map[selectedConversation.repo] || [];
                const updated = list.map(c => (c.id === selectedConversation.id ? { ...selectedConversation } : c));
                return { ...map, [selectedConversation.repo]: updated };
              });
            }
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
        initializePeerManager({ _token: token, _repoFullName: repo, _username: username, _sessionId: crypto.randomUUID() });
      } else {
        shutdownPeerManager();
      }
    }
    if (selectedConversation && selectedConversation.repo) {
      const repo = getRepoByFullName(selectedConversation.repo);
      console.log('[SkyGit][DEBUG] Lookup repo:', selectedConversation.repo, 'Result:', repo, 'has_discussions:', repo?.has_discussions);
      if (repo && repo.has_discussions === false) {
        refreshDiscussionsStatus(selectedConversation.repo).then((isEnabled) => {
          if (isEnabled) {
            showDiscussionsDisabledAlert = false;
          } else {
            showDiscussionsDisabledAlert = true;
          }
        });
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
    // Fallback to any user-level Google Drive credential
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


  // Clean up presence comment on tab close
  function cleanupPresence() {
    const token = localStorage.getItem('skygit_token');
    const repo = selectedConversation ? selectedConversation.repo : null;
    if (token && repo) {
      deleteOwnPresenceComment(token, repo);
    }
  }

  window.addEventListener('beforeunload', cleanupPresence);
</script>
<Layout>
  {#if selectedConversation}
    {#if showDiscussionsDisabledAlert}
      <div class="flex flex-col items-center justify-center h-full">
        <div class="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-6 mb-6 rounded shadow max-w-xl w-full flex flex-col items-center">
          <strong class="mb-2 text-lg">Discussions are disabled for this repository.</strong>
          <div class="mb-2 text-center">
            You cannot send or view messages for this conversation until Discussions are re-enabled in your repository's GitHub settings.
          </div>
          <a href={repoDiscussionsUrl} target="_blank" class="underline text-blue-700 font-semibold mb-2">Open GitHub Settings</a>
          <div class="flex gap-2">
            <button class="px-3 py-1 bg-yellow-300 hover:bg-yellow-400 rounded font-bold" on:click={() => showDiscussionsDisabledAlert = false} aria-label="Dismiss notification">Dismiss</button>
            <button class="px-3 py-1 bg-blue-200 hover:bg-blue-300 rounded font-bold" on:click={async () => { await refreshDiscussionsStatus(selectedConversation.repo); }} aria-label="Refresh Discussions status">Refresh</button>
          </div>
        </div>
      </div>
    {:else}
      <div class="flex flex-col h-full">
        <div class="flex items-center justify-between px-4 py-2 border-b">
          <div>
            <h2 class="text-xl font-semibold">{selectedConversation.title}</h2>
            <button class="ml-4 text-xs px-2 py-1 rounded border bg-gray-100 hover:bg-gray-200"
              on:click={togglePresence}
              title={pollingActive ? 'Pause presence polling' : 'Start presence polling'}>
              {pollingActive ? '⏸ Pause Presence' : '▶ Start Presence'}
            </button>
            <button class="ml-2 text-xs px-2 py-1 rounded border bg-gray-100 hover:bg-gray-200"
              on:click={forceCommitConversation}
              title="Commit and push messages now">
              💾 Commit Now
            </button>
            <p class="text-sm text-gray-500">{selectedConversation.repo}</p>
          </div>
          <div class="text-sm text-gray-500">
            {selectedConversation.participants?.length ?? 0} participants
          </div>
          <div class="ml-4 flex flex-wrap gap-3 items-center">
            <!-- Participant status icons -->
            {#if selectedConversation.participants}
              {#each selectedConversation.participants as uname (uname)}
                {#if uname === get(authStore).user.login}
                  <!-- Self always grey -->
                  <span class="inline-flex items-center gap-1 text-xs text-gray-500">
                    <span class="w-3 h-3 rounded-full bg-gray-400"></span>
                    You
                  </span>
                {:else}
                  {#if $peerConnections[uname]}
                    {#if $peerConnections[uname].status === 'connected'}
                      <!-- Direct connected peer -->
                      <span class="inline-flex items-center gap-1 text-xs text-green-600">
                        <span class="w-3 h-3 rounded-full bg-green-500"></span>
                        {uname}
                      </span>
                    {:else}
                      <!-- Direct connecting (reconnecting) -->
                      <span class="inline-flex items-center gap-1 text-xs text-blue-600">
                        <span class="w-3 h-3 rounded-full bg-blue-500"></span>
                        {uname}
                      </span>
                    {/if}
                  {:else if $onlinePeers.find(p => p.username === uname)}
                    <!-- Indirect peer via leader -->
                    <span class="inline-flex items-center gap-1 text-xs text-yellow-600">
                      <span class="w-3 h-3 rounded-full bg-yellow-500"></span>
                      {uname}
                    </span>
                  {:else}
                    <!-- Offline participant -->
                    <span class="inline-flex items-center gap-1 text-xs text-gray-400">
                      <span class="w-3 h-3 rounded-full bg-gray-300"></span>
                      {uname}
                    </span>
                  {/if}
                {/if}
              {/each}
            {/if}
            {#if callActive}
              <button on:click={endCall} class="bg-red-500 text-white px-3 py-1 rounded text-xs">End Call</button>
            {/if}
          </div>
        </div>

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
    {/if}
  {:else}
    <p class="text-gray-400 italic text-center mt-20">
      Select a conversation from the sidebar to view it.
    </p>
  {/if}
</Layout>
