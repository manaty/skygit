<script>
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();
    let title = '';
  
    function submit() {
      if (!title.trim()) {
        alert('Title is required.');
        return;
      }
      dispatch('create', { title: title.trim() });
      title = '';
    }
  
    function cancel() {
      dispatch('cancel');
    }
  </script>
  
  <div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div class="bg-white p-4 rounded shadow-md w-96">
      <h2 class="text-lg font-semibold mb-2">New Conversation</h2>
      <input
        bind:value={title}
        placeholder="Conversation title"
        class="w-full border px-3 py-2 rounded mb-4"
      />
      <div class="flex justify-end gap-2">
        <button on:click={cancel} class="bg-gray-200 px-3 py-1 rounded">Cancel</button>
        <button on:click={submit} class="bg-blue-600 text-white px-3 py-1 rounded">Create</button>
      </div>
    </div>
  </div>
  