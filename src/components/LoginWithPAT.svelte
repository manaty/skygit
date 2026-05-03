<script>
  export let onSubmit;
  export let error = null;

  let token = "";
  let loading = false;

  import PatHelpModal from "./PatHelpModal.svelte";
  import HowItWorksModal from "./HowItWorksModal.svelte";
  import { HelpCircle, Info } from "lucide-svelte";

  let showHelp = false;
  let showHowItWorks = false;

  async function handleSubmit() {
    if (loading) return;
    loading = true;
    try {
      await onSubmit(token);
    } finally {
      loading = false;
    }
  }
</script>

<div class="space-y-4 max-w-md mx-auto mt-20 p-6 bg-white rounded shadow">
  <h2 class="text-xl font-semibold">Enter your GitHub Personal Access Token</h2>
  <p class="text-sm text-gray-600">
    Your token is stored in this browser and used directly with the GitHub API.
    Use the minimum scopes SkyGit needs.
  </p>

  <label class="block text-sm font-medium text-gray-700" for="github-token">
    GitHub Personal Access Token
  </label>
  <input
    id="github-token"
    bind:value={token}
    type="password"
    autocomplete="current-password"
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
    aria-busy={loading}
  >
    {#if loading}
      <span
        class="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"
      ></span>
      Authenticating…
    {:else}
      Authenticate
    {/if}
  </button>

  <p class="text-sm text-gray-500 flex flex-col gap-2">
    <span>
      Don’t have a token? <a
        class="text-blue-600 underline"
        target="_blank"
        href="https://github.com/settings/tokens/new?scopes=repo,read:user&description=SkyGit"
        >Generate one here</a
      >
    </span>

    <button
      class="text-gray-500 hover:text-gray-700 text-sm underline text-left flex items-center gap-1"
      on:click={() => (showHelp = true)}
    >
      <HelpCircle size={14} />
      How to create a token?
    </button>

    <button
      class="text-gray-500 hover:text-gray-700 text-sm underline text-left flex items-center gap-1"
      on:click={() => (showHowItWorks = true)}
    >
      <Info size={14} />
      How SkyGit works?
    </button>
  </p>
</div>

<PatHelpModal isOpen={showHelp} onClose={() => (showHelp = false)} />
<HowItWorksModal
  isOpen={showHowItWorks}
  onClose={() => (showHowItWorks = false)}
/>
