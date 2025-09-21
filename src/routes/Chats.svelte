<script>
  import Layout from '../components/Layout.svelte';
  import { currentContent, currentRoute } from '../stores/routeStore.js';
  import { conversations, selectedConversation as selectedConversationStore } from '../stores/conversationStore.js';
  import MessageList from '../components/MessageList.svelte';
  import MessageInput from '../components/MessageInput.svelte';
import { onMount, onDestroy } from 'svelte';
import { peerConnections, onlinePeers, initializePeerManager, shutdownPeerManager, sendMessageToPeer } from '../services/peerJsManager.js';
import { presencePolling, setPollingState } from '../stores/presenceControlStore.js';
// import { deleteOwnPresenceComment } from '../services/repoPresence.js'; // No longer needed with PeerJS
import { flushConversationCommitQueue } from '../services/conversationCommitQueue.js';
import { removeFromSkyGitConversations } from '../services/conversationService.js';
import { getCurrentLeader, isLeader, getLocalSessionId, getLocalPeerId, typingUsers, updateMyConversations } from '../services/peerJsManager.js';
  import { settingsStore } from '../stores/settingsStore.js';
  import { get } from 'svelte/store';
  import { authStore } from '../stores/authStore.js';
  import { getOrCreateSessionId } from '../utils/sessionManager.js';
  import { getRepoByFullName } from '../stores/repoStore.js';
  let selectedConversation = null;
  let callActive = false;
  let currentRepo = null;
  let isInitiator = false;
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


  currentContent.subscribe((value) => {
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
    if (cred.client_id) params.append('client_id', cred.client_id);
    if (cred.client_secret) params.append('client_secret', cred.client_secret);
    params.append('refresh_token', cred.refresh_token);
    params.append('grant_type', 'refresh_token');

    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      if (data?.error === 'invalid_grant') {
        throw new Error('Stored Google Drive refresh token is no longer valid. Please reconnect your Google Drive credential.');
      }
      throw new Error(`Failed to get Google access token: ${JSON.stringify(data)}`);
    }

    return data.access_token;
  }


  // Periodic sync to fetch new messages from GitHub
  let syncInterval = null;
  
  async function syncMessagesFromGitHub() {
    if (!selectedConversation || !selectedConversation.path || !selectedConversation.repo) return;
    
    const token = localStorage.getItem('skygit_token');
    if (!token) return;
    
    try {
      const headers = {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github+json'
      };
      
      const url = `https://api.github.com/repos/${selectedConversation.repo}/contents/${selectedConversation.path}`;
      const res = await fetch(url, { headers });
      
      if (res.ok) {
        const blob = await res.json();
        const remoteConversation = JSON.parse(atob(blob.content));
        
        if (remoteConversation && Array.isArray(remoteConversation.messages)) {
          // Merge remote messages with local messages
          const localMessages = selectedConversation.messages || [];
          const messageMap = new Map();
          
          // Add local messages first
          localMessages.forEach(msg => {
            if (msg.id) messageMap.set(msg.id, msg);
          });
          
          // Add remote messages (will update if they exist)
          remoteConversation.messages.forEach(msg => {
            if (msg.id) messageMap.set(msg.id, msg);
          });
          
          // Sort by timestamp
          const mergedMessages = Array.from(messageMap.values())
            .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
          
          // Only update if there are new messages
          if (mergedMessages.length > localMessages.length) {
            console.log(`[SkyGit] Synced ${mergedMessages.length - localMessages.length} new messages from GitHub`);
            
            // Update the conversation
            const updatedConversation = { 
              ...selectedConversation, 
              messages: mergedMessages,
              participants: Array.from(new Set([
                ...(selectedConversation.participants || []),
                ...(remoteConversation.participants || [])
              ]))
            };
            
            selectedConversation = updatedConversation;
            selectedConversationStore.set(updatedConversation);
            
            // Update the conversations store
            conversations.update(map => {
              const list = map[updatedConversation.repo] || [];
              const updated = list.map(c => (c.id === updatedConversation.id ? updatedConversation : c));
              return { ...map, [updatedConversation.repo]: updated };
            });
          }
        }
      }
    } catch (err) {
      console.warn('[SkyGit] Failed to sync messages from GitHub:', err);
    }
  }
  
  // Start sync when conversation is selected
  $: if (selectedConversation && pollingActive) {
    // Clear any existing interval
    if (syncInterval) clearInterval(syncInterval);
    
    // Sync every 10 seconds
    syncInterval = setInterval(syncMessagesFromGitHub, 10000);
    
    // Also sync immediately
    syncMessagesFromGitHub();
  } else {
    // Clear interval when no conversation selected or polling is off
    if (syncInterval) {
      clearInterval(syncInterval);
      syncInterval = null;
    }
  }

  // Clean up peer connections on tab close
  function cleanupPresence() {
    shutdownPeerManager();
    if (syncInterval) clearInterval(syncInterval);
  }

  window.addEventListener('beforeunload', cleanupPresence);
  
  // Clean up on component destroy
  onDestroy(() => {
    if (syncInterval) clearInterval(syncInterval);
  });
</script>
<Layout>
  {#if selectedConversation}
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
            {#if true}
            {@const connectedUserAgents = Object.entries($peerConnections).filter(([peerId, conn]) => conn.status === 'connected').length + 1}
            {@const connectedUsers = new Set([
              get(authStore).user.login,
              ...Object.values($peerConnections)
                .filter(conn => conn.status === 'connected')
                .map(conn => conn.username)
            ]).size}
            {@const allKnownUsers = connectedUsers}
            <button 
              class="hover:text-blue-600 cursor-pointer underline"
              on:click={() => showParticipantModal = true}
            >
              participants {connectedUsers}/{allKnownUsers} • ua: {connectedUserAgents}
            </button>
            {/if}
          </div>
          <div class="ml-4 flex items-center gap-3">
            <!-- Overlapping avatars for connected participants only -->
            {#if true}
            {@const connectedSessions = [
              { username: get(authStore).user.login, sessionId: getLocalPeerId(), isLocal: true },
              ...Object.entries($peerConnections)
                .filter(([peerId, conn]) => conn.status === 'connected')
                .map(([peerId, conn]) => ({ username: conn.username, sessionId: peerId, isLocal: false }))
            ]}
            {@const currentLeader = getCurrentLeader()}
            
            {#if connectedSessions.length > 0}
              <div class="flex items-center" style="width: {Math.min(connectedSessions.length * 16 + 16, 80)}px;">
                {#each connectedSessions as session, index (session.sessionId)}
                  <div 
                    class="relative"
                    style="margin-left: {index > 0 ? '-8px' : '0'}; z-index: {connectedSessions.length - index};"
                  >
                    <img 
                      src="https://github.com/{session.username}.png" 
                      alt="{session.username}" 
                      class="w-6 h-6 rounded-full border-2 border-white"
                      title="{session.isLocal ? 'You' : session.username} {session.isLocal ? '' : `(${session.sessionId.slice(-4)})`}"
                    />
                    {#if currentLeader && currentLeader === session.sessionId}
                      <!-- Crown icon for leader -->
                      <svg class="absolute -top-1 -right-1 w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M5 3a2 2 0 00-2 2v1h4V5a2 2 0 00-2-2zM3 8v6a2 2 0 002 2h10a2 2 0 002-2V8H3z"/>
                        <path d="M1 6h18l-2 6H3L1 6z"/>
                      </svg>
                    {/if}
                    {#if !session.isLocal && $typingUsers[session.sessionId]?.isTyping}
                      <!-- Typing indicator (only for remote sessions) -->
                      <div class="absolute -top-1 -left-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center animate-pulse">
                        <div class="flex gap-0.5">
                          <div class="w-1 h-1 bg-white rounded-full animate-bounce" style="animation-delay: 0ms;"></div>
                          <div class="w-1 h-1 bg-white rounded-full animate-bounce" style="animation-delay: 150ms;"></div>
                          <div class="w-1 h-1 bg-white rounded-full animate-bounce" style="animation-delay: 300ms;"></div>
                        </div>
                      </div>
                    {/if}
                  </div>
                {/each}
              </div>
            {/if}
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
<div class="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50" on:click={() => showParticipantModal = false}>
  <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4" on:click|stopPropagation>
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-lg font-semibold">Participants</h3>
      <button class="text-gray-400 hover:text-gray-600" on:click={() => showParticipantModal = false}>
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>
    
    <div class="space-y-2">
      {#if true}
      {@const currentUsername = get(authStore).user.login}
      {@const currentLeader = getCurrentLeader()}
      {@const allUsers = new Set([
        currentUsername,
        ...Object.values($peerConnections).map(conn => conn.username),
        ...$onlinePeers.map(p => p.username)
      ])}
      {@const userAgentCounts = {}}
      
      <!-- Count user agents per user -->
      {#each Object.values($peerConnections) as conn}
        {#if userAgentCounts[conn.username]}
          {userAgentCounts[conn.username] = userAgentCounts[conn.username] + 1}
        {:else}
          {userAgentCounts[conn.username] = 1}
        {/if}
      {/each}
      {userAgentCounts[currentUsername] = (userAgentCounts[currentUsername] || 0) + 1}
      
      {#each Array.from(allUsers) as username}
        {@const isConnected = username === currentUsername || Object.values($peerConnections).some(conn => conn.username === username && conn.status === 'connected')}
        {@const isCurrentLeader = currentLeader && (
          (username === currentUsername && currentLeader === getLocalPeerId()) ||
          Object.entries($peerConnections).some(([peerId, conn]) => 
            conn.username === username && currentLeader === peerId
          )
        )}
        {@const uaCount = userAgentCounts[username] || 0}
        
        <div class="flex items-center gap-3 p-2 rounded {isConnected ? 'bg-green-50' : 'bg-gray-50'}">
          <div class="flex items-center gap-3">
            <!-- Avatar -->
            <div class="relative">
              <img 
                src="https://github.com/{username}.png" 
                alt="{username}" 
                class="w-8 h-8 rounded-full {isConnected ? '' : 'grayscale opacity-60'}"
              />
              {#if isCurrentLeader}
                <!-- Crown icon for leader -->
                <svg class="absolute -top-1 -right-1 w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 3a2 2 0 00-2 2v1h4V5a2 2 0 00-2-2zM3 8v6a2 2 0 002 2h10a2 2 0 002-2V8H3z"/>
                  <path d="M1 6h18l-2 6H3L1 6z"/>
                </svg>
              {/if}
              {#if isConnected}
                <!-- Online indicator -->
                <div class="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-white"></div>
              {/if}
            </div>
            
            <!-- Username -->
            <span class="font-medium {isConnected ? 'text-green-800' : 'text-gray-600'}">
              {username === currentUsername ? 'You' : username}
              {#if uaCount > 1}
                <span class="text-xs text-gray-500">({uaCount})</span>
              {/if}
            </span>
          </div>
          
          <div class="ml-auto text-xs text-gray-500">
            {#if isConnected}
              Online
            {:else}
              Offline
            {/if}
          </div>
        </div>
      {/each}
      {/if}
    </div>
  </div>
</div>
{/if}
