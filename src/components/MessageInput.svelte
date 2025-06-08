<!-- ✅ src/components/MessageInput.svelte -->
<script>
    export let conversation;
    export let replyingTo = null; // Message being replied to
  
    import { appendMessage } from '../stores/conversationStore.js';
    import { queueConversationForCommit } from '../services/conversationCommitQueue.js';
    import { authStore } from '../stores/authStore.js';
import { onlinePeers, broadcastMessage, getLocalSessionId, broadcastTypingStatus } from '../services/peerJsManager.js';
    import { get } from 'svelte/store';
    import { computeMessageHash, getPreviousMessageHash } from '../utils/messageHash.js';

    let message = '';
    let typingTimeout = null;
    let isTyping = false;
  
    function handleTyping() {
      // Start typing if not already
      if (!isTyping) {
        isTyping = true;
        broadcastTypingStatus(true);
      }
      
      // Reset timeout
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
      
      // Stop typing after 2 seconds of inactivity
      typingTimeout = setTimeout(() => {
        isTyping = false;
        broadcastTypingStatus(false);
      }, 2000);
    }
  
    async function send() {
      if (!message.trim()) return;
  
      // Get the authenticated user's username
      const auth = get(authStore);
      const username = auth.user?.login;
      
      // Get previous message hash for the chain
      const previousHash = getPreviousMessageHash(conversation.messages || []);
      
      // Compute hash for this message
      const messageHash = await computeMessageHash(previousHash, username || 'Unknown', message.trim());
  
      const newMessage = {
        id: crypto.randomUUID(),
        sender: username || 'Unknown',
        content: message.trim(),
        timestamp: Date.now(),
        hash: messageHash,
        in_response_to: replyingTo?.hash || null // Include reply reference if replying
      };
  
      appendMessage(conversation.id, conversation.repo, newMessage);
      // Real-time relay: broadcast to all connected peers via PeerJS
      const chatMsg = {
        id: newMessage.id,
        conversationId: conversation.id,
        content: newMessage.content,
        timestamp: newMessage.timestamp,
        hash: newMessage.hash,
        in_response_to: newMessage.in_response_to
      };
      
      // Broadcast to conversation participants only
      broadcastMessage({ type: 'chat', ...chatMsg }, conversation.id);
      
      // Queue for GitHub commit
      queueConversationForCommit(conversation.repo, conversation.id);
  
      // Stop typing indicator when message is sent
      if (isTyping) {
        isTyping = false;
        broadcastTypingStatus(false);
        if (typingTimeout) {
          clearTimeout(typingTimeout);
        }
      }
  
      message = '';
      replyingTo = null; // Clear reply reference
    }
  </script>
  
  <div class="space-y-2">
    {#if replyingTo}
      <div class="bg-gray-100 px-3 py-2 rounded text-sm flex items-center justify-between">
        <div class="flex-1">
          <div class="text-xs text-gray-500 mb-1">Replying to {replyingTo.sender}</div>
          <div class="text-gray-700 truncate">{replyingTo.content}</div>
        </div>
        <button
          class="ml-2 text-gray-500 hover:text-gray-700"
          on:click={() => replyingTo = null}
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    {/if}
    
    <div class="flex items-center gap-2">
      <input
        type="text"
        bind:value={message}
        placeholder={replyingTo ? "Type your reply..." : "Type a message..."}
        class="flex-1 border rounded px-3 py-2 text-sm"
        on:keydown={(e) => e.key === 'Enter' && send()}
        on:input={handleTyping}
      />
      <button
        class="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded"
        on:click={send}
      >
        Send
      </button>
    </div>
  </div>
  