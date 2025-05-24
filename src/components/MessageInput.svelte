<!-- ✅ src/components/MessageInput.svelte -->
<script>
    export let conversation;
  
    import { appendMessage } from '../stores/conversationStore.js';
    import { queueConversationForCommit } from '../services/conversationCommitQueue.js';
    import { authStore } from '../stores/authStore.js';
import { onlinePeers, broadcastMessage, getLocalSessionId } from '../services/peerJsManager.js';
    import { get } from 'svelte/store';

    let message = '';
  
    function send() {
      if (!message.trim()) return;
  
      // Get the authenticated user's username
      const auth = get(authStore);
      const username = auth.user?.login;
  
      const newMessage = {
        id: crypto.randomUUID(), // optionally add an ID
        sender: username || 'Unknown',
        content: message.trim(),
        timestamp: Date.now()
      };
  
      appendMessage(conversation.id, conversation.repo, newMessage);
      // Real-time relay: broadcast to all connected peers via PeerJS
      const chatMsg = {
        id: newMessage.id,
        conversationId: conversation.id,
        content: newMessage.content,
        timestamp: newMessage.timestamp
      };
      
      // Broadcast to all connected peers
      broadcastMessage({ type: 'chat', ...chatMsg });
      
      // Queue for GitHub commit
      queueConversationForCommit(conversation.repo, conversation.id);
  
      message = '';
    }
  </script>
  
  <div class="flex items-center gap-2">
    <input
      type="text"
      bind:value={message}
      placeholder="Type a message..."
      class="flex-1 border rounded px-3 py-2 text-sm"
      on:keydown={(e) => e.key === 'Enter' && send()}
    />
    <button
      class="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded"
      on:click={send}
    >
      Send
    </button>
  </div>
  