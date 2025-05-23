<!-- ✅ src/components/MessageList.svelte -->
<script>
    import { selectedConversation as selectedConversationStore } from '../stores/conversationStore.js';
    import { authStore } from '../stores/authStore.js';
    import { get } from 'svelte/store';
    
    export let conversation = null;
  
    // Use prop first, fallback to store
    $: effectiveConversation = conversation || $selectedConversationStore;
    $: messages = effectiveConversation?.messages ?? [];
    
    // Get current user to display "You" when appropriate
    $: currentUsername = $authStore?.user?.login;
    
    function getDisplaySender(sender) {
        return sender === currentUsername ? 'You' : sender;
    }
  
  </script>
  
  <div class="p-4 space-y-3">
    {#if messages.length > 0}
      {#each messages as msg (msg.id || msg.timestamp)}
        <div class="bg-blue-100 p-2 rounded shadow text-sm">
          <div class="font-semibold text-blue-800">{getDisplaySender(msg.sender)}</div>
          <div>{msg.content}</div>
          <div class="text-xs text-gray-500">{new Date(msg.timestamp).toLocaleString()}</div>
        </div>
      {/each}
    {:else}
      <p class="text-center text-gray-400 italic mt-10">No messages yet.</p>
    {/if}
  </div>
  