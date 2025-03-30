<script>
  import { onMount } from "svelte";
  import { v4 as uuidv4 } from "uuid";
  import Layout from "../components/Layout.svelte";
  import { selectedRepo } from "../stores/repoStore.js";
  import { discoverConversations } from "../services/conversationService";
  import {
    activateMessagingForRepo,
    updateRepoMessagingConfig,
    storeEncryptedCredentials,
    getSecretsMap,
    getGitHubUsername,
  } from "../services/githubApi.js";
  import { decryptJSON } from "../services/encryption.js";

  let credentials = [];
  let repo;
  let activating = false;

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

      // Refresh store
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

  async function createConversation() {
    const title = prompt("Enter a title for the new conversation:");
    if (!title || !title.trim()) {
      alert("Conversation title is required.");
      return;
    }

    const token = localStorage.getItem("skygit_token");
    const username = await getGitHubUsername(token);
    const id = uuidv4();
    const filename = `.messages/conversation-${id}.json`;
    const content = {
      id,
      title: title.trim(),
      createdAt: new Date().toISOString(),
      participants: [],
      messages: [],
    };

    const base64 = btoa(JSON.stringify(content));
    await fetch(
      `https://api.github.com/repos/${repo.full_name}/contents/${filename}`,
      {
        method: "PUT",
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github+json",
        },
        body: JSON.stringify({
          message: `Create new conversation ${id}`,
          content: base64,
        }),
      },
    );

    // ✅ Refresh conversation list in store
    await discoverConversations(token, repo);
  }
</script>

<Layout>
  {#if repo}
    <div class="p-6 space-y-4 bg-white shadow rounded max-w-3xl mx-auto mt-6">
      <h2 class="text-2xl font-semibold text-blue-700">{repo.full_name}</h2>

      <div class="text-sm text-gray-700 space-y-1">
        <div><strong>Name:</strong> {repo.name}</div>
        <div><strong>Owner:</strong> {repo.owner}</div>
        <div>
          <strong>GitHub:</strong>
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
      {#if repo.has_messages && repo.config}
        <div class="mt-6 border-t pt-4 space-y-3">
          <h3 class="text-lg font-semibold text-gray-800">
            🛠️ Messaging Config
          </h3>

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

        <button on:click={createConversation} class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
          >💬  New Conversation</button
        >
      {/if}
    </div>
  {:else}
    <p class="text-gray-400 italic text-center mt-20">
      Select a repository from the sidebar to view its details.
    </p>
  {/if}
</Layout>
