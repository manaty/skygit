<script>
  import { onMount } from "svelte";
  import { get } from "svelte/store";
  import {
    sortedContacts,
    loadContacts,
    updateContactsOnlineStatus,
  } from "../stores/contactsStore.js";
  import { authStore } from "../stores/authStore.js";
  import { repoList } from "../stores/repoStore.js";
  import { startCall } from "../services/peerJsManager.js";
  import {
    getSavedContacts,
    addContact,
    removeContact,
    toggleFavorite,
    searchGitHubUsers,
  } from "../services/contactsService.js";
  import {
    Phone,
    MessageSquare,
    Star,
    StarOff,
    UserPlus,
    UserMinus,
    Search,
    Users,
    X,
  } from "lucide-svelte";

  let currentOrgId = "";
  let savedContacts = { contacts: [], favorites: [] };
  let searchQuery = "";
  let searchResults = [];
  let searching = false;
  let showAddModal = false;

  onMount(async () => {
    // Load contacts for current organization
    const repos = get(repoList);
    if (repos.length > 0) {
      currentOrgId = repos[0].full_name.split("/")[0];
      loadContacts(currentOrgId);
    }

    // Load saved contacts from user's repo
    const auth = get(authStore);
    if (auth?.token && auth?.user?.login) {
      savedContacts = await getSavedContacts(auth.token, auth.user.login);
    }

    // Update online status periodically
    const interval = setInterval(updateContactsOnlineStatus, 5000);
    return () => clearInterval(interval);
  });

  // Merge online contacts with saved contacts
  $: mergedContacts = $sortedContacts.map((contact) => ({
    ...contact,
    isSaved: savedContacts.contacts.some(
      (c) => c.username === contact.username,
    ),
    isFavorite: savedContacts.favorites.includes(contact.username),
    nickname: savedContacts.contacts.find(
      (c) => c.username === contact.username,
    )?.nickname,
  }));

  // Group contacts
  $: favoriteContacts = mergedContacts.filter((c) => c.isFavorite);
  $: onlineContacts = mergedContacts.filter((c) => c.online && !c.isFavorite);
  $: offlineContacts = mergedContacts.filter((c) => !c.online && !c.isFavorite);

  function formatLastSeen(timestamp) {
    if (!timestamp) return "Never";
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  }

  async function handleCall(contact) {
    if (contact.online) {
      // Use the session_id for calling
      const sessionId = contact.session_id || `${contact.username}_default`;
      startCall(sessionId);
    }
  }

  async function handleToggleFavorite(contact) {
    const auth = get(authStore);
    if (auth?.token && auth?.user?.login) {
      await toggleFavorite(auth.token, auth.user.login, contact.username);
      savedContacts = await getSavedContacts(auth.token, auth.user.login);
    }
  }

  async function handleAddContact(username) {
    const auth = get(authStore);
    if (auth?.token && auth?.user?.login) {
      await addContact(auth.token, auth.user.login, username);
      savedContacts = await getSavedContacts(auth.token, auth.user.login);
      showAddModal = false;
      searchQuery = "";
      searchResults = [];
    }
  }

  async function handleRemoveContact(username) {
    const auth = get(authStore);
    if (auth?.token && auth?.user?.login) {
      await removeContact(auth.token, auth.user.login, username);
      savedContacts = await getSavedContacts(auth.token, auth.user.login);
    }
  }

  async function handleSearch() {
    if (searchQuery.length < 2) {
      searchResults = [];
      return;
    }

    searching = true;
    const auth = get(authStore);
    if (auth?.token) {
      searchResults = await searchGitHubUsers(auth.token, searchQuery);
    }
    searching = false;
  }

  // Debounce search
  let searchTimeout;
  $: {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(handleSearch, 300);
  }
</script>

<div class="p-4">
  <!-- Header -->
  <div class="flex items-center justify-between mb-4">
    <h2 class="text-lg font-semibold text-gray-800 flex items-center gap-2">
      <Users size={20} class="text-blue-600" />
      Contacts
    </h2>
    <button
      class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
      on:click={() => (showAddModal = true)}
      title="Add contact"
    >
      <UserPlus size={20} />
    </button>
  </div>

  <!-- Contact Groups -->
  <div class="space-y-4">
    <!-- Favorites -->
    {#if favoriteContacts.length > 0}
      <div>
        <h3
          class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1"
        >
          <Star size={12} class="text-yellow-500" />
          Favorites
        </h3>
        <div class="space-y-1">
          {#each favoriteContacts as contact (contact.username)}
            {@const ContactCard = true}
            <div
              class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer border border-transparent hover:border-gray-200 group"
            >
              <div class="relative flex-shrink-0">
                <img
                  src="https://github.com/{contact.username}.png"
                  alt={contact.username}
                  class="w-10 h-10 rounded-full"
                />
                {#if contact.online}
                  <div
                    class="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"
                  ></div>
                {/if}
              </div>

              <div class="flex-1 min-w-0">
                <div class="font-medium text-gray-900 truncate">
                  {contact.nickname || contact.username}
                </div>
                <div class="text-xs text-gray-500">
                  {#if contact.online}
                    <span class="text-green-600">Online</span>
                  {:else}
                    {formatLastSeen(contact.lastSeen)}
                  {/if}
                </div>
              </div>

              <!-- Actions (shown on hover) -->
              <div class="hidden group-hover:flex items-center gap-1">
                <button
                  class="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                  on:click|stopPropagation={() => handleCall(contact)}
                  disabled={!contact.online}
                  title="Call"
                >
                  <Phone size={16} />
                </button>
                <button
                  class="p-1.5 text-yellow-400 hover:text-yellow-600 hover:bg-yellow-50 rounded"
                  on:click|stopPropagation={() => handleToggleFavorite(contact)}
                  title="Remove from favorites"
                >
                  <Star size={16} fill="currentColor" />
                </button>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}

    <!-- Online -->
    {#if onlineContacts.length > 0}
      <div>
        <h3
          class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2"
        >
          Online ({onlineContacts.length})
        </h3>
        <div class="space-y-1">
          {#each onlineContacts as contact (contact.username)}
            <div
              class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer border border-transparent hover:border-gray-200 group"
            >
              <div class="relative flex-shrink-0">
                <img
                  src="https://github.com/{contact.username}.png"
                  alt={contact.username}
                  class="w-10 h-10 rounded-full"
                />
                <div
                  class="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"
                ></div>
              </div>

              <div class="flex-1 min-w-0">
                <div class="font-medium text-gray-900 truncate">
                  {contact.username}
                </div>
                <div class="text-xs text-green-600">Online</div>
              </div>

              <div class="hidden group-hover:flex items-center gap-1">
                <button
                  class="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                  on:click|stopPropagation={() => handleCall(contact)}
                  title="Call"
                >
                  <Phone size={16} />
                </button>
                <button
                  class="p-1.5 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded"
                  on:click|stopPropagation={() => handleToggleFavorite(contact)}
                  title="Add to favorites"
                >
                  <Star size={16} />
                </button>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}

    <!-- Offline -->
    {#if offlineContacts.length > 0}
      <div>
        <h3
          class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2"
        >
          Offline ({offlineContacts.length})
        </h3>
        <div class="space-y-1">
          {#each offlineContacts as contact (contact.username)}
            <div
              class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer border border-transparent hover:border-gray-200 group opacity-60"
            >
              <div class="relative flex-shrink-0">
                <img
                  src="https://github.com/{contact.username}.png"
                  alt={contact.username}
                  class="w-10 h-10 rounded-full grayscale"
                />
                <div
                  class="absolute -bottom-1 -right-1 w-3 h-3 bg-gray-400 rounded-full border-2 border-white"
                ></div>
              </div>

              <div class="flex-1 min-w-0">
                <div class="font-medium text-gray-900 truncate">
                  {contact.username}
                </div>
                <div class="text-xs text-gray-500">
                  {formatLastSeen(contact.lastSeen)}
                </div>
              </div>

              <div class="hidden group-hover:flex items-center gap-1">
                <button
                  class="p-1.5 text-gray-300 cursor-not-allowed rounded"
                  disabled
                  title="User is offline"
                >
                  <Phone size={16} />
                </button>
                <button
                  class="p-1.5 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded"
                  on:click|stopPropagation={() => handleToggleFavorite(contact)}
                  title="Add to favorites"
                >
                  {#if contact.isFavorite}
                    <Star
                      size={16}
                      fill="currentColor"
                      class="text-yellow-400"
                    />
                  {:else}
                    <Star size={16} />
                  {/if}
                </button>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}

    <!-- Empty State -->
    {#if mergedContacts.length === 0}
      <div class="text-center py-8">
        <Users size={48} class="mx-auto mb-3 text-gray-300" />
        <p class="text-sm text-gray-500">No contacts found</p>
        <p class="text-xs text-gray-400 mt-1">
          Connect to peers to see contacts
        </p>
        <button
          class="mt-4 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          on:click={() => (showAddModal = true)}
        >
          <UserPlus size={16} class="inline mr-1" />
          Add Contact
        </button>
      </div>
    {/if}
  </div>
</div>

<!-- Add Contact Modal -->
{#if showAddModal}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div
      class="absolute inset-0 bg-black/50 backdrop-blur-sm"
      on:click={() => (showAddModal = false)}
    ></div>

    <div class="relative bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
      <button
        class="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        on:click={() => (showAddModal = false)}
      >
        <X size={24} />
      </button>

      <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
        <UserPlus class="text-blue-600" />
        Add Contact
      </h2>

      <!-- Search Input -->
      <div class="relative mb-4">
        <Search
          size={18}
          class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          placeholder="Search GitHub users..."
          bind:value={searchQuery}
          class="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      <!-- Search Results -->
      <div class="max-h-64 overflow-y-auto">
        {#if searching}
          <div class="flex items-center justify-center py-4">
            <div
              class="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full"
            ></div>
          </div>
        {:else if searchResults.length > 0}
          <div class="space-y-2">
            {#each searchResults as user (user.username)}
              <div
                class="flex items-center gap-3 p-2 rounded-lg border hover:border-blue-300"
              >
                <img
                  src={user.avatarUrl}
                  alt={user.username}
                  class="w-10 h-10 rounded-full"
                />
                <div class="flex-1">
                  <div class="font-medium">{user.username}</div>
                </div>
                <button
                  class="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                  on:click={() => handleAddContact(user.username)}
                >
                  Add
                </button>
              </div>
            {/each}
          </div>
        {:else if searchQuery.length >= 2}
          <p class="text-center text-gray-500 py-4">No users found</p>
        {:else}
          <p class="text-center text-gray-400 py-4 text-sm">
            Type at least 2 characters to search
          </p>
        {/if}
      </div>
    </div>
  </div>
{/if}
