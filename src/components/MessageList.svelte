<!-- ✅ src/components/MessageList.svelte -->
<script>
    export let conversation;
  
    // This would typically come from a store or be fetched per conversation
    let messages = conversation?.messages ?? [];
  </script>
  
  <div class="p-4 space-y-3">
    {#each messages as msg (msg.timestamp)}
      <div class="bg-blue-100 p-2 rounded shadow text-sm">
        <div class="font-semibold text-blue-800">{msg.sender}</div>
        <div>{msg.content}</div>
        <div class="text-xs text-gray-500">{new Date(msg.timestamp).toLocaleString()}</div>
      </div>
    {/each}
  
    {#if messages.length === 0}
      <p class="text-center text-gray-400 italic mt-10">No messages yet.</p>
    {/if}
  </div>
  