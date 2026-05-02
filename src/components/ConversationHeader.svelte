<script>
  import {
    buildConnectedSessions,
    getConnectedParticipantSummary
  } from '../utils/participants.js';

  export let conversation;
  export let currentUsername;
  export let localPeerId = null;
  export let currentLeader = null;
  export let peerConnections = {};
  export let typingUsers = {};
  export let pollingActive = true;
  export let callActive = false;
  export let onTogglePresence;
  export let onForceCommit;
  export let onShowParticipants;
  export let onEndCall;

  $: connectedSessions = buildConnectedSessions({
    currentUsername,
    localPeerId,
    peerConnections
  });

  $: participantSummary = getConnectedParticipantSummary({
    currentUsername,
    peerConnections
  });
</script>

<div class="flex items-center justify-between px-4 py-2 border-b">
  <div>
    <h2 class="text-xl font-semibold">{conversation.title}</h2>
    <button
      class="ml-4 text-xs px-2 py-1 rounded border bg-gray-100 hover:bg-gray-200"
      on:click={onTogglePresence}
      title={pollingActive ? 'Pause presence polling' : 'Start presence polling'}
    >
      {pollingActive ? '⏸ Pause Presence' : '▶ Start Presence'}
    </button>
    <button
      class="ml-2 text-xs px-2 py-1 rounded border bg-gray-100 hover:bg-gray-200"
      on:click={onForceCommit}
      title="Commit and push messages now"
    >
      💾 Commit Now
    </button>
    <p class="text-sm text-gray-500">{conversation.repo}</p>
  </div>

  <div class="text-sm text-gray-500">
    <button
      class="hover:text-blue-600 cursor-pointer underline"
      on:click={onShowParticipants}
    >
      participants {participantSummary.connectedUsers}/{participantSummary.allKnownUsers} • ua: {participantSummary.connectedUserAgents}
    </button>
  </div>

  <div class="ml-4 flex items-center gap-3">
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
              <svg class="absolute -top-1 -right-1 w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 3a2 2 0 00-2 2v1h4V5a2 2 0 00-2-2zM3 8v6a2 2 0 002 2h10a2 2 0 002-2V8H3z"/>
                <path d="M1 6h18l-2 6H3L1 6z"/>
              </svg>
            {/if}
            {#if !session.isLocal && typingUsers[session.sessionId]?.isTyping}
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

    {#if callActive}
      <button on:click={onEndCall} class="bg-red-500 text-white px-3 py-1 rounded text-xs">End Call</button>
    {/if}
  </div>
</div>
