<script>
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();
    
    export let loading = false;
    
    let title = '';
  
    function submit() {
      if (!title.trim()) {
        alert('Title is required.');
        return;
      }
      if (loading) return;
      dispatch('create', { title: title.trim() });
    }
  
    function cancel() {
      if (loading) return;
      dispatch('cancel');
    }
    
    function handleKeydown(event) {
      if (event.key === 'Enter' && !loading) {
        submit();
      }
    }
  </script>
  
  <div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div class="bg-white p-4 rounded shadow-md w-96">
      <h2 class="text-lg font-semibold mb-2">New Conversation</h2>
      <input
        bind:value={title}
        placeholder="Conversation title"
        class="w-full border px-3 py-2 rounded mb-4"
        disabled={loading}
        on:keydown={handleKeydown}
      />
      <div class="flex justify-end gap-2">
        <button 
          on:click={cancel} 
          class="bg-gray-200 px-3 py-1 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          Cancel
        </button>
        <button 
          on:click={submit} 
          class="bg-blue-600 text-white px-3 py-1 rounded disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          disabled={loading || !title.trim()}
        >
          {#if loading}
            <svg class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
              ></path>
            </svg>
            Creating...
          {:else}
            Create
          {/if}
        </button>
      </div>
    </div>
  </div>
  