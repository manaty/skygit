<script>
  import Layout from '../components/Layout.svelte';
  import { currentContent } from '../stores/routeStore.js';
  import { conversations } from '../stores/conversationStore.js';
  import MessageList from '../components/MessageList.svelte';
  import MessageInput from '../components/MessageInput.svelte';
  import { onMount } from 'svelte';

  let selectedConversation = null;

  currentContent.subscribe((value) => {
    selectedConversation = value;
  });
</script>

<Layout>
  {#if selectedConversation}
    <div class="flex flex-col h-full">
      <div class="flex items-center justify-between px-4 py-2 border-b">
        <div>
          <h2 class="text-xl font-semibold">{selectedConversation.title}</h2>
          <p class="text-sm text-gray-500">{selectedConversation.repo}</p>
        </div>
        <div class="text-sm text-gray-500">
          <!-- Placeholder for contact count -->
          {selectedConversation.participants?.length ?? 0} participants
        </div>
      </div>

      <div class="flex-1 overflow-y-auto">
        <MessageList conversation={selectedConversation} />
      </div>

      <div class="border-t p-4">
        <MessageInput conversation={selectedConversation} />
      </div>
    </div>
  {:else}
    <p class="text-gray-400 italic text-center mt-20">
      Select a conversation from the sidebar to view it.
    </p>
  {/if}
</Layout>
