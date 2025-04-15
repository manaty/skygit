<script>
  import Layout from '../components/Layout.svelte';
  import { currentContent } from '../stores/routeStore.js';
  import { conversations } from '../stores/conversationStore.js';
  import MessageList from '../components/MessageList.svelte';
  import MessageInput from '../components/MessageInput.svelte';
  import { onMount } from 'svelte';
  import { SkyGitWebRTC } from '../services/webrtc.js';

  let selectedConversation = null;
  let callActive = false;
  let isInitiator = false;
  let localStream = null;
  let remoteStream = null;
  let webrtc = null;

  currentContent.subscribe((value) => {
    selectedConversation = value;
  });

  async function startCall(initiate) {
    isInitiator = initiate;
    callActive = true;
    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    webrtc = new SkyGitWebRTC({
      token: localStorage.getItem('skygit_token'),
      repoFullName: selectedConversation.repo,
      conversationId: selectedConversation.id,
      onRemoteStream: (stream) => { remoteStream = stream; },
    });
    localStream.getTracks().forEach(track => webrtc.peerConnection.addTrack(track, localStream));
    await webrtc.start(isInitiator);
  }

  function endCall() {
    callActive = false;
    if (webrtc) webrtc.stop();
    webrtc = null;
    if (localStream) {
      localStream.getTracks().forEach(t => t.stop());
      localStream = null;
    }
    remoteStream = null;
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
          {#if !callActive}
            <button on:click={() => startCall(true)} class="bg-blue-500 text-white px-3 py-1 rounded mr-2">Start Call</button>
            <button on:click={() => startCall(false)} class="bg-gray-500 text-white px-3 py-1 rounded">Join Call</button>
          {:else}
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
