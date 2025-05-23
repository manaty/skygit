<!-- ✅ src/components/MessageInput.svelte -->
<script>
    export let conversation;
  
    import { appendMessage } from '../stores/conversationStore.js';
    import { queueConversationForCommit } from '../services/conversationCommitQueue.js';
    import { authStore } from '../stores/authStore.js';
import { onlinePeers, getCurrentLeader, sendMessageToPeer, broadcastMessage, getLocalSessionId } from '../services/repoPeerManager.js';
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
      // Real-time relay: star topology via leader
      const peersList = get(onlinePeers);
      const localSid = getLocalSessionId();
      const leader = getCurrentLeader(peersList, localSid);
      const chatMsg = {
        id: newMessage.id,
        conversationId: conversation.id,
        content: newMessage.content,
        timestamp: newMessage.timestamp
      };
      if (localSid === leader) {
        // Leader broadcasts to other peers
        broadcastMessage({ type: 'chat', ...chatMsg });
        // Commit to GitHub
        queueConversationForCommit(conversation.repo, conversation.id);
      } else {
        // Non-leader sends only to leader
        sendMessageToPeer(leader, { type: 'chat', ...chatMsg });
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
  