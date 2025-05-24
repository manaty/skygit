<script>
  import { onMount } from 'svelte';
  import { sortedContacts, loadContacts, updateContactsOnlineStatus } from '../stores/contactsStore.js';
  import { authStore } from '../stores/authStore.js';
  import { repoList } from '../stores/repoStore.js';
  import { get } from 'svelte/store';

  let currentOrgId = '';

  onMount(() => {
    // Load contacts for current organization
    const repos = get(repoList);
    if (repos.length > 0) {
      currentOrgId = repos[0].full_name.split('/')[0];
      loadContacts(currentOrgId);
    }

    // Update online status periodically
    const interval = setInterval(updateContactsOnlineStatus, 5000);
    return () => clearInterval(interval);
  });

  function formatLastSeen(timestamp) {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  }

  function getConversationCount(contact) {
    return contact.conversations?.length || 0;
  }
</script>

<div class="space-y-2">
  {#each $sortedContacts as contact (contact.username)}
    <div class="flex items-center gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer border border-transparent hover:border-gray-200">
      <!-- Avatar with online indicator -->
      <div class="relative flex-shrink-0">
        <img 
          src="https://github.com/{contact.username}.png" 
          alt="{contact.username}" 
          class="w-10 h-10 rounded-full {contact.online ? '' : 'grayscale opacity-60'}"
        />
        
        <!-- Online indicator -->
        {#if contact.online}
          <div class="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
        {:else}
          <div class="absolute -bottom-1 -right-1 w-3 h-3 bg-gray-400 rounded-full border-2 border-white"></div>
        {/if}
        
        <!-- Leader crown -->
        {#if contact.isLeader}
          <div class="absolute -top-1 -right-1 w-4 h-4 text-yellow-500">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
          </div>
        {/if}
      </div>

      <!-- Contact info -->
      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between">
          <div class="font-medium text-gray-900 truncate">
            {contact.username}
          </div>
          <div class="text-xs text-gray-500 flex items-center gap-1">
            {#if contact.online}
              <span class="text-green-600">online</span>
            {:else}
              <span>{formatLastSeen(contact.lastSeen)}</span>
            {/if}
          </div>
        </div>
        
        <div class="flex items-center justify-between text-sm text-gray-500">
          <div class="truncate">
            {getConversationCount(contact)} conversations
            {#if contact.userAgent > 0}
              • {contact.userAgent} UA
            {/if}
          </div>
        </div>
      </div>
    </div>
  {:else}
    <div class="text-center py-8">
      <div class="text-gray-400 mb-2">
        <svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
        </svg>
      </div>
      <p class="text-sm text-gray-500">No contacts found</p>
      <p class="text-xs text-gray-400 mt-1">Connect to peers to see contacts</p>
    </div>
  {/each}
</div>
