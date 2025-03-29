<script>
    import { authStore, logoutUser } from '../stores/authStore.js';
    import { onMount } from 'svelte';
    import Sidebar from '../components/Sidebar.svelte';
  
    let user = null;
  
    const unsubscribe = authStore.subscribe((auth) => {
      user = auth.user;
    });
  
    onMount(() => {
      return () => unsubscribe(); // cleanup on unmount
    });
  </script>
  
<style>
    .layout {
      display: flex;
      height: 100vh;
      overflow: hidden;
    }
  
    .main {
      flex-grow: 1;
      overflow-y: auto;
      padding: 24px;
    }
  </style>
  <div class="layout">
    <Sidebar />
  
  <!-- Right-hand side panel -->
  <div class="main">
    <h1 class="text-2xl font-bold mb-4">SkyGit Conversations</h1>
    <p class="text-gray-600">
      Select a repo to view or create conversations. This panel will show the list or message view.
    </p>
  </div>
</div>