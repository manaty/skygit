<script>
  import { onMount } from "svelte";
  import Layout from "../components/Layout.svelte";
  import NewConversationModal from "../components/NewConversationModal.svelte";
  import { selectedRepo, repoList } from "../stores/repoStore.js";
  import { createConversation } from "../services/conversationService.js";
  import { selectedConversation } from "../stores/conversationStore.js";
  import { currentContent } from "../stores/routeStore.js";
  import {
    activateMessagingForRepo,
    updateRepoMessagingConfig,
    storeEncryptedCredentials,
    getSecretsMap
  } from "../services/githubApi.js";
  import { decryptJSON } from "../services/encryption.js";
  import { searchQuery } from "../stores/searchStore.js";
  import { currentRoute } from "../stores/routeStore.js";
  import { getRepositoryFiles } from "../services/fileUploadService.js";
  import { FileText, ExternalLink, Calendar } from "lucide-svelte";
  
  let credentials = [];
  let repo;
  let activating = false;
  let showModal = false;
  let creatingConversation = false;
  let activeTab = 'details'; // 'details' or 'files'
  let repoFiles = [];
  let loadingFiles = false;

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
    
    creatingConversation = true;
    try {
      await createConversation(token, repo, title);
      showModal = false;
    } catch (error) {
      console.error("Failed to create conversation:", error);
      alert("Failed to create conversation. Please try again.");
    } finally {
      creatingConversation = false;
    }
  }

  function handleCancel() {
    showModal = false;
  }
  
  function viewConversations() {
    if (!repo) return;
    // Set the search query to the repo's full name
    searchQuery.set(repo.full_name);
    // Clear the selected conversation
    selectedConversation.set(null);
    currentContent.set(null);
    // Switch to the chats tab
    currentRoute.set("chats");
  }
  
  async function loadFiles() {
    if (!repo || loadingFiles) return;
    
    loadingFiles = true;
    const token = localStorage.getItem("skygit_token");
    
    try {
      repoFiles = await getRepositoryFiles(token, repo);
    } catch (error) {
      console.error("Failed to load files:", error);
      repoFiles = [];
    } finally {
      loadingFiles = false;
    }
  }
  
  // Load files when switching to files tab
  $: if (activeTab === 'files' && repo && repoFiles.length === 0) {
    loadFiles();
  }
  
  // Reload files when repo changes
  $: if (repo) {
    repoFiles = [];
    if (activeTab === 'files') {
      loadFiles();
    }
  }
  
  function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  }

</script>

<Layout>
  {#if repo}
    <div class="p-6 space-y-4 bg-white shadow rounded max-w-3xl mx-auto mt-6">
      <h2 class="text-2xl font-semibold text-blue-700">{repo.full_name}</h2>
      
      {#if repo.has_messages}
        <!-- Tab navigation -->
        <div class="flex border-b">
          <button
            class="px-4 py-2 text-sm font-medium {activeTab === 'details' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}"
            on:click={() => activeTab = 'details'}
          >
            Repository Details
          </button>
          <button
            class="px-4 py-2 text-sm font-medium {activeTab === 'files' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}"
            on:click={() => activeTab = 'files'}
          >
            Files ({repoFiles.length})
          </button>
        </div>
      {/if}

      {#if !repo.has_messages || activeTab === 'details'}
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
          {#if repo.has_messages}
            <button 
              class="ml-2 text-xs text-blue-600 underline hover:text-blue-800"
              on:click={viewConversations}
            >
              View conversations
            </button>
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

      {#if repo.has_messages && repo.config}
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
          <NewConversationModal 
            loading={creatingConversation}
            on:create={handleCreate} 
            on:cancel={handleCancel} 
          />
        {/if}
      {/if}
      {/if}
      
      {#if repo.has_messages && activeTab === 'files'}
        <div class="space-y-4">
          {#if loadingFiles}
            <div class="flex items-center justify-center py-8">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          {:else if repoFiles.length === 0}
            <p class="text-gray-400 italic text-center py-8">
              No files have been uploaded to this repository yet.
            </p>
          {:else}
            <div class="space-y-2">
              {#each repoFiles as file}
                <div class="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                  <div class="flex items-start justify-between">
                    <div class="flex items-start gap-3">
                      <FileText class="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <a 
                          href={file.fileUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          class="font-medium text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                        >
                          {file.fileName}
                          <ExternalLink class="w-3 h-3" />
                        </a>
                        <div class="flex items-center gap-4 text-sm text-gray-500 mt-1">
                          <span>{formatFileSize(file.fileSize)}</span>
                          <span class="flex items-center gap-1">
                            <Calendar class="w-3 h-3" />
                            {new Date(file.uploadedAt).toLocaleDateString()}
                          </span>
                          {#if file.mimeType}
                            <span>{file.mimeType}</span>
                          {/if}
                        </div>
                      </div>
                    </div>
                    <span class="text-xs text-gray-400">
                      {file.storageType === 'google_drive' ? '📁' : '🪣'}
                    </span>
                  </div>
                </div>
              {/each}
            </div>
          {/if}
          
          <div class="mt-4 text-center">
            <button
              on:click={loadFiles}
              disabled={loadingFiles}
              class="text-sm text-blue-600 hover:text-blue-800 underline disabled:opacity-50"
            >
              Refresh Files
            </button>
          </div>
        </div>
      {/if}
    </div>
  {:else}
    <p class="text-gray-400 italic text-center mt-20">
      Select a repository from the sidebar to view its details.
    </p>
  {/if}
</Layout>
