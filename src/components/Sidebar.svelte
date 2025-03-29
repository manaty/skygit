<script>
  import { authStore, logoutUser } from "../stores/authStore.js";
  import { filteredCount } from "../stores/repoStore.js";
  import { currentRoute } from "../stores/routeStore.js";
  import { MessageCircle, Folder, Phone, Users, Bell } from "lucide-svelte";

  import SidebarChats from "./SidebarChats.svelte";
  import SidebarRepos from "./SidebarRepos.svelte";
  import SidebarCalls from "./SidebarCalls.svelte";
  import SidebarContacts from "./SidebarContacts.svelte";
  import SidebarNotifications from "./SidebarNotifications.svelte";

  import { clickOutside } from "../utils/clickOutside.js";

  let user = null;
  let menuOpen = false;
  let searchQuery = "";

  function goToSettings() {
    currentRoute.set("settings");
  }

  function setActiveTab(tabId){
    currentRoute.set(tabId);
  }

  authStore.subscribe((auth) => {
    user = auth.user;
  });

  const tabs = [
    { id: "chats", icon: MessageCircle, label: "Chats" },
    { id: "repos", icon: Folder, label: "Repos" },
    { id: "calls", icon: Phone, label: "Calls" },
    { id: "contacts", icon: Users, label: "Contacts" },
    { id: "notifications", icon: Bell, label: "Notifs" },
  ];

  function toggleMenu() {
    menuOpen = !menuOpen;
  }

  function closeMenu() {
    menuOpen = false;
  }
</script>

<!-- Sidebar container -->
<div class="p-4 relative h-full overflow-y-auto">
  <!-- User Info -->
  <div class="flex items-center justify-between mb-4 relative">
    <div class="flex items-center gap-3">
      <img class="w-10 h-10 rounded-full" src={user?.avatar_url} alt="avatar" />
      <div>
        <p class="font-semibold">{user?.name || user?.login}</p>
        <p class="text-xs text-gray-500">@{user?.login}</p>
      </div>
    </div>
    <button
      class="text-gray-500 hover:text-gray-700 text-lg font-bold"
      on:click={toggleMenu}
      aria-label="Open menu"
    >
      ⋯
    </button>

    {#if menuOpen}
      <div
        class="absolute top-12 right-0 w-40 bg-white border border-gray-200 rounded shadow-md text-sm z-50"
        use:clickOutside={closeMenu}
      >
        <button
          class="block w-full text-left px-4 py-2 hover:bg-gray-100"
          on:click={goToSettings}>Settings</button
        >
        <button class="block w-full text-left px-4 py-2 hover:bg-gray-100"
          >Help</button
        >
        <hr />
        <button
          on:click={logoutUser}
          class="block w-full text-left px-4 py-2 hover:bg-gray-100"
          >Log out</button
        >
      </div>
    {/if}
  </div>

  <!-- Search -->
  <div class="relative mb-4">
    <input
      type="text"
      bind:value={searchQuery}
      placeholder=""
      class="w-full pl-10 pr-3 py-2 rounded bg-gray-100 text-sm border border-gray-300 focus:outline-none"
    />
    <svg
      class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      width="18"
      height="18"
    >
      <path
        d="M10 2a8 8 0 015.29 13.71l4.5 4.5a1 1 0 01-1.42 1.42l-4.5-4.5A8 8 0 1110 2zm0 2a6 6 0 100 12A6 6 0 0010 4z"
      />
    </svg>
  </div>

  <!-- Tab Icons -->
  <div class="flex justify-around mb-4 text-xs text-center">
    {#each tabs as { id, icon: Icon, label }}
      <button
        type="button"
        on:click={()=>setActiveTab(id)}
        class="relative flex flex-col items-center text-xs focus:outline-none"
        class:text-blue-600={$currentRoute === id}
      >
        <div
          class={`w-10 h-10 rounded-full flex items-center justify-center ${
            $currentRoute === id
              ? "bg-blue-100 text-blue-600"
              : "bg-gray-100 text-gray-500 hover:text-blue-600"
          }`}
        >
          <Icon class="w-5 h-5" />
        </div>

        {#if id === "repos" && searchQuery.trim() !== ""}
          <div
            class="absolute top-0 right-1 -mt-1 -mr-1 bg-blue-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-semibold shadow"
          >
            {$filteredCount}
          </div>
        {/if}

        {label}
      </button>
    {/each}
  </div>

  <!-- Panel Content -->
  <div>
    {#if $currentRoute === "chats"}
      <SidebarChats />
    {:else if $currentRoute === "repos"}
      <SidebarRepos search={searchQuery} />
    {:else if $currentRoute === "calls"}
      <SidebarCalls />
    {:else if $currentRoute === "contacts"}
      <SidebarContacts />
    {:else if $currentRoute === "notifications"}
      <SidebarNotifications />
    {/if}
  </div>
</div>
