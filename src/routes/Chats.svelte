<script>
  import Layout from '../components/Layout.svelte';
  import { currentContent } from '../stores/routeStore.js';
  import { conversations } from '../stores/conversationStore.js';
  import MessageList from '../components/MessageList.svelte';
  import MessageInput from '../components/MessageInput.svelte';
  import { onMount } from 'svelte';
  import { peerConnections, initializePeerManager, sendMessageToPeer } from '../services/repoPeerManager.js';

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

  // --- Draggable preview state ---
  let previewPos = { x: 0, y: 0 };
  let previewDragging = false;
  let previewOffset = { x: 0, y: 0 };
  let previewRef;

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

  // Listen for screen share signaling messages
  if (typeof window !== 'undefined') {
    window.skygitOnScreenShare = (active, meta) => {
      remoteScreenSharing = active;
      remoteScreenShareMeta = meta || null;
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
          </div>
          <div>
            <div class="text-xs text-gray-400 mb-1">Remote Video</div>
            <video bind:this={el => remoteStream && (el.srcObject = remoteStream)} autoplay playsinline width="200" height="150" style="background: #222;" />
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
        </div>
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
