<!-- ✅ src/components/MessageInput.svelte -->
<script>
    export let conversation;
  
    import { appendMessage } from '../stores/conversationStore.js';
    import { queueConversationForCommit } from '../services/conversationCommitQueue.js';
  
    let message = '';
    const isLeader = true; // ✅ assume solo participant for now
  
    function send() {
      if (!message.trim()) return;
  
      const newMessage = {
        id: crypto.randomUUID(), // optionally add an ID
        sender: 'You',
        content: message.trim(),
        timestamp: Date.now()
      };
  
      appendMessage(conversation.id, conversation.repo, newMessage);
  
      if (isLeader) {
        queueConversationForCommit(conversation.repo, conversation.id);
      }
  
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
  