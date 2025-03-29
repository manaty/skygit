<script>
    export let onApprove;
    export let onReject;
    let loading = false;
  
    async function handleApprove() {
      if (loading) return;
      loading = true;
      await onApprove();
      loading = false;
    }
  </script>
  
  <div class="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow space-y-4">
    <h2 class="text-xl font-bold">Repository Creation</h2>
    <p>
      SkyGit needs to create a private GitHub repository in your account called
      <strong><code>skygit-config</code></strong>.
    </p>
    <p>This repository will store your conversation metadata and settings.</p>
    <div class="flex space-x-4 mt-6">
      <button
        on:click={handleApprove}
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center disabled:opacity-50"
        disabled={loading}
      >
        {#if loading}
          <span class="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
          Creating...
        {:else}
          I Accept
        {/if}
      </button>
  
      <button
        on:click={onReject}
        class="bg-gray-400 text-white px-4 py-2 rounded"
        disabled={loading}
      >
        Cancel
      </button>
    </div>
  </div>
  