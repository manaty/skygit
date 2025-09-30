<!-- ✅ src/components/MessageList.svelte -->
<script>
    import { selectedConversation as selectedConversationStore } from '../stores/conversationStore.js';
    import { authStore } from '../stores/authStore.js';
    import { get } from 'svelte/store';
    import { createEventDispatcher } from 'svelte';
    import { FileText, ExternalLink, Clock, Check } from 'lucide-svelte';
    
    export let conversation = null;
    
    const dispatch = createEventDispatcher();
  
    // Use prop first, fallback to store
    $: effectiveConversation = conversation || $selectedConversationStore;
    $: messages = effectiveConversation?.messages ?? [];
    
    // Sort messages in descending order (newest first)
    $: sortedMessages = [...messages].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    // Create a map of message hash to message for quick lookups
    $: messageMap = messages.reduce((map, msg) => {
      if (msg.hash) map[msg.hash] = msg;
      return map;
    }, {});
    
    // Get current user to display "You" when appropriate
    $: currentUsername = $authStore?.user?.login;
    
    function getDisplaySender(sender) {
        return sender === currentUsername ? 'You' : sender;
    }
    
    function handleReply(message) {
        dispatch('reply', message);
    }
    
    // Function to parse message content and extract file links
    function parseMessageContent(content) {
        // Check if message contains markdown file link pattern [📎 filename](url)
        const filePattern = /\[📎\s*([^\]]+)\]\(([^)]+)\)/g;
        const parts = [];
        let lastIndex = 0;
        let match;
        
        while ((match = filePattern.exec(content)) !== null) {
            // Add text before the link
            if (match.index > lastIndex) {
                parts.push({
                    type: 'text',
                    content: content.substring(lastIndex, match.index)
                });
            }
            
            // Add the file link
            parts.push({
                type: 'file',
                fileName: match[1],
                url: match[2]
            });
            
            lastIndex = match.index + match[0].length;
        }
        
        // Add remaining text
        if (lastIndex < content.length) {
            parts.push({
                type: 'text',
                content: content.substring(lastIndex)
            });
        }
        
        return parts.length > 0 ? parts : [{ type: 'text', content }];
    }
  
  </script>
  
  <div class="p-4 space-y-3">
    {#if sortedMessages.length > 0}
      {#each sortedMessages as msg, index (`${msg.id || msg.timestamp}-${msg.sender}-${index}`)}
        <div class="bg-blue-100 p-2 rounded shadow text-sm flex gap-3 group relative">
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
            <!-- Reply context if this is a reply -->
            {#if msg.in_response_to && messageMap[msg.in_response_to]}
              <div class="bg-blue-50 p-2 rounded mb-2 text-xs border-l-2 border-blue-300">
                <div class="font-semibold text-blue-700">{getDisplaySender(messageMap[msg.in_response_to].sender)}</div>
                <div class="text-gray-600 truncate">{messageMap[msg.in_response_to].content}</div>
              </div>
            {/if}
            
            <div class="font-semibold text-blue-800">{getDisplaySender(msg.sender)}</div>
            <div class="space-y-1">
              {#each parseMessageContent(msg.content) as part}
                {#if part.type === 'text'}
                  <span>{part.content}</span>
                {:else if part.type === 'file'}
                  <a 
                    href={part.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    class="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 text-blue-700 text-sm transition-colors"
                  >
                    <FileText class="w-4 h-4" />
                    <span class="max-w-[200px] truncate">{part.fileName}</span>
                    <ExternalLink class="w-3 h-3" />
                  </a>
                {/if}
              {/each}
            </div>
            <div class="flex items-center justify-between gap-3">
              <div class="flex items-center gap-2 text-xs text-gray-500">
                {#if msg.pending}
                  <span class="inline-flex items-center gap-1 text-orange-500" title="Pending sync">
                    <Clock class="w-3 h-3" />
                    Pending
                  </span>
                {:else}
                  <span class="inline-flex items-center gap-1 text-green-500" title="Synced">
                    <Check class="w-3 h-3" />
                    Synced
                  </span>
                {/if}
                <span class="text-gray-400">•</span>
                <span>{new Date(msg.timestamp).toLocaleString()}</span>
              </div>
              {#if msg.hash}
                <button
                  class="text-xs text-gray-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  on:click={() => handleReply(msg)}
                >
                  Reply
                </button>
              {/if}
            </div>
          </div>
        </div>
      {/each}
    {:else}
      <p class="text-center text-gray-400 italic mt-10">No messages yet.</p>
    {/if}
  </div>
  
