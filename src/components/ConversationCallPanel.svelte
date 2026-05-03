<script>
  export let localStream = null;
  export let remoteStream = null;
  export let micOn = true;
  export let cameraOn = true;
  export let remoteMicOn = true;
  export let remoteCameraOn = true;
  export let remoteScreenSharing = false;
  export let remoteScreenShareMeta = null;
  export let screenSharing = false;
  export let screenShareStream = null;
  export let previewVisible = true;
  export let previewPos = { x: 0, y: 0 };
  export let recording = false;
  export let remoteRecording = false;
  export let showShareTypeModal = false;
  export let showUploadDestinationModal = false;
  export let onFileInput = () => {};
  export let onOpenShareTypeModal = () => {};
  export let onCloseShareTypeModal = () => {};
  export let onSelectShareType = () => {};
  export let onStopScreenShare = () => {};
  export let onChangeScreenSource = () => {};
  export let onToggleMic = () => {};
  export let onToggleCamera = () => {};
  export let onToggleRecording = () => {};
  export let onPreviewMouseDown = () => {};
  export let onClosePreview = () => {};
  export let onReopenPreview = () => {};
  export let onSelectUploadDestination = () => {};
  export let onResetUploadDestination = () => {};

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
</script>

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
    <input type="file" style="display:none" on:change={onFileInput} />
  </label>
  <button class="bg-blue-100 border px-3 py-1 rounded" on:click={screenSharing ? onStopScreenShare : onOpenShareTypeModal}>
    {#if screenSharing}
      🛑 Stop Sharing
    {:else}
      🖥️ Share Screen
    {/if}
  </button>
  {#if screenSharing}
    <button class="bg-yellow-100 border px-3 py-1 rounded" on:click={onChangeScreenSource}>
      🔄 Change Screen Source
    </button>
  {/if}
  <button class="bg-gray-200 border px-3 py-1 rounded flex items-center gap-1" on:click={onToggleMic} title={micOn ? 'Mute Mic' : 'Unmute Mic'}>
    {#if micOn}
      <span>🎤</span>
    {:else}
      <span>🔇</span>
    {/if}
  </button>
  <button class="bg-gray-200 border px-3 py-1 rounded flex items-center gap-1" on:click={onToggleCamera} title={cameraOn ? 'Turn Off Camera' : 'Turn On Camera'}>
    {#if cameraOn}
      <span>📷</span>
    {:else}
      <span>🚫📷</span>
    {/if}
  </button>
  <button class="bg-red-200 border px-3 py-1 rounded flex items-center gap-1 font-bold" on:click={onToggleRecording} title={recording ? 'Stop Recording' : 'Start Recording'}>
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

{#if screenSharing && screenShareStream}
  {#if previewVisible}
    <div
      class="fixed z-50 flex flex-col items-end cursor-move"
      style="left: {previewPos.x}px; top: {previewPos.y}px; min-width: 180px; min-height: 120px; user-select: none;"
      on:mousedown={onPreviewMouseDown}
      tabindex="-1"
      aria-hidden="true"
    >
      <div class="bg-white border shadow-lg rounded-lg p-2 flex flex-col items-center relative">
        <button class="absolute top-1 right-1 text-gray-400 hover:text-black text-lg font-bold px-1" style="z-index:2;" on:click|stopPropagation={onClosePreview} title="Close Preview">×</button>
        <div class="text-xs text-gray-500 mb-1">Screen Share Preview</div>
        <video bind:this={screenSharePreviewEl} autoplay muted playsinline width="160" height="100" style="border-radius: 0.5rem; background: #222;">
          <track kind="captions" />
        </video>
      </div>
    </div>
  {:else}
    <button class="fixed bottom-6 right-6 z-50 bg-white border shadow rounded-full px-3 py-2 text-xs font-bold hover:bg-blue-100" on:click={onReopenPreview}>
      Show Screen Preview
    </button>
  {/if}
{/if}

{#if showShareTypeModal}
  <div class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-lg p-6 min-w-[260px] flex flex-col gap-3">
      <div class="font-bold mb-2">Select what to share</div>
      <button class="bg-gray-200 rounded px-3 py-2 hover:bg-blue-100" on:click={() => onSelectShareType('screen')}>Entire Screen</button>
      <button class="bg-gray-200 rounded px-3 py-2 hover:bg-blue-100" on:click={() => onSelectShareType('window')}>Application Window</button>
      <button class="bg-gray-200 rounded px-3 py-2 hover:bg-blue-100" on:click={() => onSelectShareType('tab')}>Browser Tab</button>
      <button class="mt-2 text-sm text-gray-500 hover:text-black" on:click={onCloseShareTypeModal}>Cancel</button>
    </div>
  </div>
{/if}

{#if showUploadDestinationModal}
  <div class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-lg p-6 min-w-[260px] flex flex-col gap-3">
      <div class="font-bold mb-2">Choose upload destination</div>
      <button class="bg-blue-200 rounded px-3 py-2 hover:bg-blue-300" on:click={() => onSelectUploadDestination('google_drive')}>
        Google Drive
      </button>
      <button class="bg-yellow-200 rounded px-3 py-2 hover:bg-yellow-300" on:click={() => onSelectUploadDestination('s3')}>
        S3
      </button>
      <button class="mt-2 text-sm text-gray-500 hover:text-black" on:click={onResetUploadDestination}>Cancel</button>
    </div>
  </div>
{/if}
