<script>
  import { buildParticipantRows } from '../utils/participants.js';

  export let currentUsername;
  export let currentLeader = null;
  export let localPeerId = null;
  export let peerConnections = {};
  export let onlinePeers = [];
  export let onClose;

  $: participantRows = buildParticipantRows({
    currentUsername,
    currentLeader,
    localPeerId,
    peerConnections,
    onlinePeers
  });
</script>

<div class="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
  <button
    type="button"
    class="absolute inset-0 cursor-default"
    aria-label="Dismiss participants modal"
    on:click={onClose}
  ></button>
  <div class="relative bg-white rounded-lg p-6 max-w-md w-full mx-4">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-lg font-semibold">Participants</h3>
      <button
        type="button"
        class="text-gray-400 hover:text-gray-600"
        aria-label="Close participants modal"
        on:click={onClose}
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>

    <div class="space-y-2">
      {#each participantRows as participant (participant.username)}
        <div class="flex items-center gap-3 p-2 rounded {participant.connected ? 'bg-green-50' : 'bg-gray-50'}">
          <div class="flex items-center gap-3">
            <div class="relative">
              <img
                src="https://github.com/{participant.username}.png"
                alt="{participant.username}"
                class="w-8 h-8 rounded-full {participant.connected ? '' : 'grayscale opacity-60'}"
              />
              {#if participant.leader}
                <svg class="absolute -top-1 -right-1 w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 3a2 2 0 00-2 2v1h4V5a2 2 0 00-2-2zM3 8v6a2 2 0 002 2h10a2 2 0 002-2V8H3z"/>
                  <path d="M1 6h18l-2 6H3L1 6z"/>
                </svg>
              {/if}
              {#if participant.connected}
                <div class="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-white"></div>
              {/if}
            </div>

            <span class="font-medium {participant.connected ? 'text-green-800' : 'text-gray-600'}">
              {participant.displayName}
              {#if participant.userAgentCount > 1}
                <span class="text-xs text-gray-500">({participant.userAgentCount})</span>
              {/if}
            </span>
          </div>

          <div class="ml-auto text-xs text-gray-500">
            {participant.connected ? 'Online' : 'Offline'}
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>
