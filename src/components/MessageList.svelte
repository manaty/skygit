<!-- ✅ src/components/MessageList.svelte -->
<script>
    import { selectedConversation as selectedConversationStore } from '../stores/conversationStore.js';
    
    export let conversation = null;
  
    // Use prop first, fallback to store
    $: effectiveConversation = conversation || $selectedConversationStore;
    $: messages = effectiveConversation?.messages ?? [];
  
    $: console.log('[MessageList] Conversation prop:', conversation);
    $: console.log('[MessageList] Store conversation:', $selectedConversationStore);
    $: console.log('[MessageList] Effective conversation:', effectiveConversation);
    $: console.log('[MessageList] Messages:', messages);
  </script>
  
  <div class="p-4 space-y-3">
    {#if messages.length > 0}
      {#each messages as msg (msg.id || msg.timestamp)}
        <div class="bg-blue-100 p-2 rounded shadow text-sm">
          <div class="font-semibold text-blue-800">{msg.sender}</div>
          <div>{msg.content}</div>
          <div class="text-xs text-gray-500">{new Date(msg.timestamp).toLocaleString()}</div>
        </div>
      {/each}
    {:else}
      <p class="text-center text-gray-400 italic mt-10">No messages yet.</p>
    {/if}
  </div>
  