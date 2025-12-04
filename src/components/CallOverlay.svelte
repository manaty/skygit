<script>
  import { onMount, onDestroy } from "svelte";
  import { get } from "svelte/store";
  import {
    callStatus,
    localStream,
    remoteStream,
    remotePeerId,
    isVideoEnabled,
    isAudioEnabled,
    isScreenSharing,
    isRecording,
    callStartTime,
  } from "../stores/callStore.js";
  import { authStore } from "../stores/authStore.js";
  import { selectedConversation } from "../stores/conversationStore.js";
  import {
    answerCall,
    endCall as peerEndCall,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
  } from "../services/peerJsManager.js";
  import { recorder } from "../services/recorderService.js";
  import {
    addCallToHistory,
    createCallRecord,
  } from "../services/callHistoryService.js";
  import SaveRecordingModal from "./SaveRecordingModal.svelte";
  import { fade, fly } from "svelte/transition";
  import {
    Phone,
    PhoneOff,
    Mic,
    MicOff,
    Video,
    VideoOff,
    Monitor,
    MonitorOff,
    Disc,
    Square,
  } from "lucide-svelte";

  let localVideoEl;
  let remoteVideoEl;

  let showSaveModal = false;
  let recordedBlob = null;
  let callDirection = "outgoing"; // Track if call was incoming or outgoing

  // Track call direction based on status changes
  $: if ($callStatus === "incoming") {
    callDirection = "incoming";
  } else if ($callStatus === "calling") {
    callDirection = "outgoing";
  }

  async function endCall() {
    // Log the call before ending
    const auth = get(authStore);
    const conversation = get(selectedConversation);
    const startTime = get(callStartTime);
    const peer = get(remotePeerId);
    const status = get(callStatus);

    if (auth?.token && auth?.user?.login && startTime && peer) {
      const endTime = Date.now();
      const durationSeconds = Math.floor((endTime - startTime) / 1000);

      // Only log if call was actually connected
      if (status === "connected" || durationSeconds > 0) {
        const callRecord = createCallRecord({
          remotePeer: peer,
          type: "video",
          direction: callDirection,
          startTime: new Date(startTime).toISOString(),
          endTime: new Date(endTime).toISOString(),
          duration: durationSeconds,
          repoContext: conversation?.repo || null,
        });

        // Log asynchronously, don't block the UI
        addCallToHistory(auth.token, auth.user.login, callRecord);
      }
    }

    // Now actually end the call
    peerEndCall();
  }

  async function toggleRecording() {
    if ($isRecording) {
      const blob = await recorder.stopRecording();
      recordedBlob = blob;
      showSaveModal = true;
      isRecording.set(false);
    } else {
      if ($remoteStream && $localStream) {
        recorder.startRecording($remoteStream, $localStream);
        isRecording.set(true);
      }
    }
  }
  let durationInterval;
  let duration = "00:00";

  $: if ($localStream && localVideoEl) {
    localVideoEl.srcObject = $localStream;
  }

  $: if ($remoteStream && remoteVideoEl) {
    remoteVideoEl.srcObject = $remoteStream;
  }

  $: if ($callStatus === "connected" && !durationInterval) {
    startTimer();
  } else if ($callStatus !== "connected" && durationInterval) {
    stopTimer();
  }

  function startTimer() {
    const start = $callStartTime || Date.now();
    durationInterval = setInterval(() => {
      const diff = Math.floor((Date.now() - start) / 1000);
      const mins = Math.floor(diff / 60)
        .toString()
        .padStart(2, "0");
      const secs = (diff % 60).toString().padStart(2, "0");
      duration = `${mins}:${secs}`;
    }, 1000);
  }

  function stopTimer() {
    clearInterval(durationInterval);
    durationInterval = null;
    duration = "00:00";
  }

  onDestroy(() => {
    stopTimer();
  });
</script>

{#if $callStatus !== "idle"}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
    transition:fade
  >
    <!-- Incoming Call -->
    {#if $callStatus === "incoming"}
      <div
        class="bg-gray-800 p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-6 border border-gray-700"
        in:fly={{ y: 20 }}
      >
        <div
          class="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center animate-pulse"
        >
          <Phone size={48} class="text-white" />
        </div>
        <div class="text-center">
          <h3 class="text-2xl font-bold text-white">Incoming Call</h3>
          <p class="text-gray-400 mt-2">{$remotePeerId || "Unknown Caller"}</p>
        </div>
        <div class="flex gap-4 mt-4">
          <button
            class="p-4 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors"
            on:click={endCall}
            title="Decline"
          >
            <PhoneOff size={32} />
          </button>
          <button
            class="p-4 rounded-full bg-green-500 hover:bg-green-600 text-white transition-colors animate-bounce"
            on:click={answerCall}
            title="Answer"
          >
            <Phone size={32} />
          </button>
        </div>
      </div>

      <!-- Active Call / Calling -->
    {:else}
      <div
        class="relative w-full h-full max-w-6xl max-h-[90vh] flex flex-col p-4"
      >
        <!-- Remote Video (Main) -->
        <div
          class="flex-1 relative bg-gray-900 rounded-2xl overflow-hidden shadow-2xl border border-gray-800"
        >
          {#if $callStatus === "calling"}
            <div
              class="absolute inset-0 flex items-center justify-center flex-col gap-4"
            >
              <div
                class="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center animate-pulse"
              >
                <Phone size={40} class="text-gray-400" />
              </div>
              <p class="text-xl text-gray-300">Calling {$remotePeerId}...</p>
            </div>
          {/if}

          <video
            bind:this={remoteVideoEl}
            autoplay
            playsinline
            class="w-full h-full object-cover"
          ></video>

          <!-- Local Video (PIP) -->
          <div
            class="absolute bottom-4 right-4 w-48 h-36 bg-black rounded-xl overflow-hidden shadow-lg border border-gray-700"
          >
            <video
              bind:this={localVideoEl}
              autoplay
              playsinline
              muted
              class="w-full h-full object-cover transform scale-x-[-1]"
            ></video>
            {#if !$isVideoEnabled}
              <div
                class="absolute inset-0 flex items-center justify-center bg-gray-800"
              >
                <VideoOff size={24} class="text-gray-500" />
              </div>
            {/if}
          </div>

          <!-- Call Info -->
          <div
            class="absolute top-4 left-4 bg-black/50 backdrop-blur px-4 py-2 rounded-lg text-white"
          >
            <p class="font-medium">{$remotePeerId}</p>
            <p class="text-sm text-gray-300">{duration}</p>
          </div>
        </div>

        <!-- Controls -->
        <div class="h-20 flex items-center justify-center gap-6 mt-4">
          <button
            class="p-4 rounded-full {$isAudioEnabled
              ? 'bg-gray-700 hover:bg-gray-600'
              : 'bg-red-500 hover:bg-red-600'} text-white transition-colors"
            on:click={toggleAudio}
          >
            {#if $isAudioEnabled}
              <Mic size={24} />
            {:else}
              <MicOff size={24} />
            {/if}
          </button>

          <button
            class="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors shadow-lg scale-110"
            on:click={endCall}
          >
            <PhoneOff size={32} />
          </button>

          <button
            class="p-4 rounded-full {$isVideoEnabled
              ? 'bg-gray-700 hover:bg-gray-600'
              : 'bg-red-500 hover:bg-red-600'} text-white transition-colors"
            on:click={toggleVideo}
          >
            {#if $isVideoEnabled}
              <Video size={24} />
            {:else}
              <VideoOff size={24} />
            {/if}
          </button>

          <button
            class="p-4 rounded-full {$isScreenSharing
              ? 'bg-blue-500 hover:bg-blue-600'
              : 'bg-gray-700 hover:bg-gray-600'} text-white transition-colors"
            on:click={toggleScreenShare}
            title={$isScreenSharing ? "Stop sharing" : "Share screen"}
          >
            {#if $isScreenSharing}
              <MonitorOff size={24} />
            {:else}
              <Monitor size={24} />
            {/if}
          </button>

          <button
            class="p-4 rounded-full {$isRecording
              ? 'bg-red-500 hover:bg-red-600 animate-pulse'
              : 'bg-gray-700 hover:bg-gray-600'} text-white transition-colors"
            on:click={toggleRecording}
            title={$isRecording ? "Stop recording" : "Record call"}
          >
            {#if $isRecording}
              <Square size={24} />
            {:else}
              <Disc size={24} />
            {/if}
          </button>
        </div>
      </div>
    {/if}
  </div>

  <SaveRecordingModal
    isOpen={showSaveModal}
    blob={recordedBlob}
    onClose={() => {
      showSaveModal = false;
      recordedBlob = null;
    }}
  />
{/if}
