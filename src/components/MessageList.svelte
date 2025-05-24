<!-- ✅ src/components/MessageList.svelte -->
<script>
    import { selectedConversation as selectedConversationStore } from '../stores/conversationStore.js';
    import { authStore } from '../stores/authStore.js';
    import { get } from 'svelte/store';
    
    export let conversation = null;
  
    // Use prop first, fallback to store
    $: effectiveConversation = conversation || $selectedConversationStore;
    $: messages = effectiveConversation?.messages ?? [];
    
    // Sort messages in descending order (newest first)
    $: sortedMessages = [...messages].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    // Get current user to display "You" when appropriate
    $: currentUsername = $authStore?.user?.login;
    
    function getDisplaySender(sender) {
        return sender === currentUsername ? 'You' : sender;
    }
  
  </script>
  
  <div class="p-4 space-y-3">
    {#if sortedMessages.length > 0}
      {#each sortedMessages as msg, index (`${msg.id || msg.timestamp}-${msg.sender}-${index}`)}
        <div class="bg-blue-100 p-2 rounded shadow text-sm flex gap-3">
          <!-- Avatar -->
          <div class="flex-shrink-0">
            <img 
              src="https://github.com/{msg.sender}.png" 
              alt="{msg.sender}" 
              class="w-8 h-8 rounded-full"
            />
          </div>
          
          <!-- Message content -->
          <div class="flex-1">
            <div class="font-semibold text-blue-800">{getDisplaySender(msg.sender)}</div>
            <div>{msg.content}</div>
            <div class="text-xs text-gray-500">{new Date(msg.timestamp).toLocaleString()}</div>
          </div>
        </div>
      {/each}
    {:else}
      <p class="text-center text-gray-400 italic mt-10">No messages yet.</p>
    {/if}
  </div>
  