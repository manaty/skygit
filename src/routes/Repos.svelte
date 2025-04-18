<script>
  import { onMount } from "svelte";
  import Layout from "../components/Layout.svelte";
  import NewConversationModal from "../components/NewConversationModal.svelte";
  import { selectedRepo, repoList } from "../stores/repoStore.js";
  import { createConversation } from "../services/conversationService.js";
  import {
    activateMessagingForRepo,
    updateRepoMessagingConfig,
    storeEncryptedCredentials,
    getSecretsMap
  } from "../services/githubApi.js";
  import { decryptJSON } from "../services/encryption.js";
  import { tick } from "svelte";

  let credentials = [];
  let repo;
  let activating = false;
  let showModal = false;
  let refreshMsg = '';
  let refreshMsgTimeout;

  selectedRepo.subscribe((r) => (repo = r));

  onMount(async () => {
    const token = localStorage.getItem("skygit_token");
    if (!token) return;

    try {
      const { secrets } = await getSecretsMap(token);
      const urls = Object.keys(secrets);
      const list = [];

      for (const url of urls) {
        try {
          const decrypted = await decryptJSON(token, secrets[url]);
          list.push({ url, ...decrypted });
        } catch (e) {
          console.warn("Failed to decrypt", url, e);
        }
      }

      credentials = list;
    } catch (e) {
      console.warn("Could not load secrets", e);
    }
  });

  async function activateMessaging() {
    const token = localStorage.getItem("skygit_token");
    if (!repo || !token) return;

    activating = true;

    try {
      await activateMessagingForRepo(token, repo);
      repo.has_messages = true;

      import("../stores/repoStore.js").then(({ selectedRepo }) => {
        selectedRepo.set({ ...repo });
      });
    } catch (e) {
      alert("Failed to activate messaging.");
      console.warn(e);
    } finally {
      activating = false;
    }
  }

  async function saveConfig() {
    const token = localStorage.getItem("skygit_token");
    if (!token || !repo) return;

    try {
      await updateRepoMessagingConfig(token, repo);
      alert("✅ Messaging config updated.");
      try {
        await storeEncryptedCredentials(token, repo);
      } catch (e) {
        alert("❌ Failed to store credential.");
        console.warn(e);
      }
    } catch (e) {
      alert("❌ Failed to update config.");
      console.warn(e);
    }
  }

  async function handleCreate(event) {
    const title = event.detail.title;
    const token = localStorage.getItem("skygit_token");
    console.log("[SkyGit] 🧪 handleCreate() called with title:", title);
    await createConversation(token, repo, title);
    showModal = false;
  }

  function handleCancel() {
    showModal = false;
  }

  // Helper: open GitHub repo settings Discussions page
  function openDiscussionsSettings() {
    if (!repo) return;
    const url = `https://github.com/${repo.full_name}/settings/discussions`; // direct link to Discussions settings
    window.open(url, '_blank');
  }

  // Helper: refresh repo state (re-fetch from GitHub)
  async function refreshRepo() {
    const token = localStorage.getItem("skygit_token");
    if (!token || !repo) return;
    const res = await fetch(`https://api.github.com/repos/${repo.full_name}`, {
      headers: { Authorization: `token ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      const wasDisabled = !repo.has_discussions;
      // Update discussion flag locally
      repo.has_discussions = data.has_discussions;
      // Update stores: selectedRepo and repoList
      selectedRepo.set({ ...repo });
      repoList.update(list =>
        list.map(r =>
          r.full_name === repo.full_name ? { ...repo } : r
        )
      );
      await tick();
      if (wasDisabled && repo.has_discussions) {
        refreshMsg = '✅ Discussions enabled! You can now use messaging.';
      } else if (!repo.has_discussions) {
        refreshMsg = '❌ Discussions are still disabled.';
      } else {
        refreshMsg = '';
      }
      clearTimeout(refreshMsgTimeout);
      refreshMsgTimeout = setTimeout(() => { refreshMsg = ''; }, 4000);
    }
  }
</script>

<Layout>
  {#if repo}
    <div class="p-6 space-y-4 bg-white shadow rounded max-w-3xl mx-auto mt-6">
      <h2 class="text-2xl font-semibold text-blue-700">{repo.full_name}</h2>

      <div class="text-sm text-gray-700 space-y-1">
        <div><strong>Name:</strong> {repo.name}</div>
        <div><strong>Owner:</strong> {repo.owner}</div>
        <div><strong>GitHub:</strong>
          <a
            href={repo.url}
            target="_blank"
            class="text-blue-600 underline hover:text-blue-800"
          >
            {repo.url}
          </a>
        </div>
        <div>
          <strong>Visibility:</strong>
          {repo.private ? "🔒 Private" : "🌐 Public"}
        </div>
        <div>
          <strong>Messaging:</strong>
          {repo.has_messages ? "💬 Available" : "🚫 Not enabled"}
        </div>
        <div>
          <strong>Discussions:</strong>
          {#if repo.has_discussions}
            <span class="text-green-700 font-semibold">✅ Enabled</span>
          {:else}
            <span class="text-red-600 font-semibold">Disabled</span>
            <button class="ml-2 text-xs text-blue-600 underline" on:click={openDiscussionsSettings}>
              Enable Discussions
            </button>
            <button class="ml-2 text-xs text-gray-500 underline" on:click={refreshRepo}>
              Refresh
            </button>
            {#if refreshMsg}
              <span class="ml-2 text-xs font-semibold" class:text-green-700={refreshMsg.startsWith('✅')} class:text-red-600={refreshMsg.startsWith('❌')}>
                {refreshMsg}
              </span>
            {/if}
            <div class="text-xs text-gray-500 mt-2">To enable messaging, activate Discussions in your GitHub repo settings. After enabling, click Refresh.</div>
          {/if}
        </div>
      </div>

      {#if !repo.has_messages}
        <button
          class="mt-4 bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded flex items-center gap-2"
          on:click={activateMessaging}
          disabled={activating}
        >
          {#if activating}
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
            Activating...
          {:else}
            💬 Activate Messaging
          {/if}
        </button>
      {/if}

      {#if !repo.has_discussions}
        <div class="mt-6 text-center">
          <button class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm opacity-50 cursor-not-allowed" disabled>
            💬 New Conversation (Enable Discussions first)
          </button>
        </div>
      {:else if repo.has_messages && repo.config}
        <div class="mt-6 border-t pt-4 space-y-3">
          <h3 class="text-lg font-semibold text-gray-800">🛠️ Messaging Config</h3>

          <div class="grid gap-2 text-sm text-gray-700">
            <label>
              Commit frequency (min):
              <input
                type="number"
                bind:value={repo.config.commit_frequency_min}
                class="w-full border px-2 py-1 rounded"
              />
            </label>

            <label>
              Binary storage type:
              <select
                bind:value={repo.config.binary_storage_type}
                class="w-full border px-2 py-1 rounded"
              >
                <option value="gitfs">gitfs</option>
                <option value="s3">s3</option>
                <option value="google_drive">google_drive</option>
              </select>
            </label>

            <label>
              Storage URL:
              <select
                bind:value={repo.config.storage_info.url}
                class="w-full border px-2 py-1 rounded"
              >
                <option disabled value="">— Select a credential —</option>
                {#each credentials.filter((c) => c.type === repo.config.binary_storage_type) as cred}
                  <option value={cred.url}>{cred.url}</option>
                {/each}
              </select>
            </label>
          </div>

          <button
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
            on:click={saveConfig}
          >
            💾 Save Configuration
          </button>
        </div>

        <button
          on:click={() => (showModal = true)}
          class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
        >
          💬 New Conversation
        </button>

        {#if showModal}
          <NewConversationModal on:create={handleCreate} on:cancel={handleCancel} />
        {/if}
      {/if}
    </div>
  {:else}
    <p class="text-gray-400 italic text-center mt-20">
      Select a repository from the sidebar to view its details.
    </p>
  {/if}
</Layout>
