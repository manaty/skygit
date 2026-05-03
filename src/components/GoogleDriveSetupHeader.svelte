<script>
    export let onClose = () => {};
</script>

<div class="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
    <h3 class="text-lg font-semibold">Google Drive Setup - Create Your Own App</h3>
    <button
        type="button"
        on:click={onClose}
        class="text-gray-500 hover:text-gray-700"
        aria-label="Close Google Drive setup guide"
    >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
    </button>
</div>
