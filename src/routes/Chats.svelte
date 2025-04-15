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
        <div class="flex flex-row items-center gap-3 justify-center mt-2">
          <label class="bg-gray-100 border px-3 py-1 rounded cursor-pointer">
            📎 Share File
            <input type="file" style="display:none" on:change={handleFileInput} />
          </label>
          {#if fileSending}
            <span class="text-xs text-blue-600">Sending: {fileToSend.name} ({fileSendPercent}%)</span>
          {/if}
          {#if fileReceiveProgress}
            <span class="text-xs text-green-700">Receiving: {fileReceiveName} ({fileReceivePercent}%)</span>
          {/if}
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
