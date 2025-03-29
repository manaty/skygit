<script>
    export let onSubmit;
    export let error = null;
  
    let token = '';
    let loading = false;
  
    async function handleSubmit() {
      if (loading) return;
      loading = true;
      await onSubmit(token);
      loading = false;
    }
  </script>
  
  <div class="space-y-4 max-w-md mx-auto mt-20 p-6 bg-white rounded shadow">
    <h2 class="text-xl font-semibold">Enter your GitHub Personal Access Token</h2>
  
    <input
      bind:value={token}
      type="text"
      placeholder="ghp_..."
      class="w-full border p-2 rounded"
      disabled={loading}
    />
  
    {#if error}
      <p class="text-red-500 text-sm">{error}</p>
    {/if}
  
    <button
      on:click={handleSubmit}
      class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full flex items-center justify-center disabled:opacity-50"
      disabled={loading}
    >
      {#if loading}
        <span class="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
        Authenticating…
      {:else}
        Authenticate
      {/if}
    </button>
  
    <p class="text-sm text-gray-500">
      Don’t have a token? <a
        class="text-blue-600 underline"
        target="_blank"
        href="https://github.com/settings/tokens/new?scopes=repo,read:user&description=SkyGit"
      >Generate one here</a>
    </p>
  </div>
  