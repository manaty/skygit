<script>
    import { onMount } from "svelte";
    import { getSecretsMap, saveSecretsMap } from "../services/githubApi.js";
    import { decryptJSON, encryptJSON } from "../services/encryption.js";
    import Layout from "../components/Layout.svelte";
    import { settingsStore } from "../stores/settingsStore.js";
    import { get } from "svelte/store";
    import { initiateGoogleAuth } from "../services/googleOAuth.js";
    import { authStore } from "../stores/authStore.js";
    import { createSkyGitRepo, checkSkyGitRepoExists, getGitHubUsername } from "../services/githubApi.js";
    import GoogleDriveSetupGuide from "../components/GoogleDriveSetupGuide.svelte";
    import { Loader2 } from "lucide-svelte";

    let secrets = {};
    let decrypted = {};
    let revealed = new Set();
    let repoExists = true;
    let creatingRepo = false;
    let credentialBusy = {};
    let addingCredential = false;
    let credentialStatus = "";
    let credentialError = "";
    let editing = null;

    let newUrl = "";
    let newType = "s3";
    let newCredentials = {
        type: "s3",
        accessKeyId: "",
        secretAccessKey: "",
        region: ""
    };

    let editCredentials = {};

    let sha = null;
    let cleanupMode = false;

    const token = localStorage.getItem("skygit_token");

    onMount(async () => {
        cleanupMode = get(settingsStore).cleanupMode || false;
        if (!token) return;
        
        // Check if skygit-config repo exists
        try {
            const username = await getGitHubUsername(token);
            console.log('[Settings] Checking repo for user:', username);
            repoExists = await checkSkyGitRepoExists(token, username);
            if (!repoExists) {
                console.warn('[Settings] skygit-config repository not found');
                console.log('[Settings] Checking repo at:', `https://github.com/${username}/skygit-config`);
                return;
            }
            console.log('[Settings] Repository exists, loading secrets...');
        } catch (error) {
            console.error('[Settings] Error checking repo:', error);
            repoExists = false;
            return;
        }
        
        const result = await getSecretsMap(token);
        secrets = result.secrets;
        sha = result.sha;
    });
    
    async function createRepo() {
        creatingRepo = true;
        credentialStatus = "";
        credentialError = "";
        try {
            await createSkyGitRepo(token);
            repoExists = true;
            // Reload secrets after creating repo
            const result = await getSecretsMap(token);
            secrets = result.secrets;
            sha = result.sha;
        } catch (error) {
            console.error('Failed to create skygit-config repo:', error);
            alert('Failed to create repository: ' + error.message);
        } finally {
            creatingRepo = false;
        }
    }

    function getCredentialBusy(url) {
        return credentialBusy[url] || "";
    }

    function setCredentialBusy(url, state) {
        credentialBusy = { ...credentialBusy, [url]: state };
        if (!state) {
            delete credentialBusy[url];
            credentialBusy = { ...credentialBusy };
        }
    }

    async function reveal(url) {
        if (getCredentialBusy(url)) return;
        setCredentialBusy(url, "reveal");
        credentialStatus = "";
        credentialError = "";
        try {
            if (!decrypted[url]) {
                decrypted[url] = await decryptJSON(token, secrets[url]);
            }
            revealed = new Set(revealed).add(url);
        } catch (e) {
            credentialError = "Failed to decrypt credential.";
        } finally {
            setCredentialBusy(url, "");
        }
    }

    function hide(url) {
        revealed = new Set([...revealed].filter(item => item !== url));
        if (editing === url) editing = null;
    }

    function startEdit(url) {
        if (!revealed.has(url)) {
            revealed = new Set(revealed).add(url);
        }
        editing = url;
        editCredentials = { ...decrypted[url] };
    }

    async function saveEdit(url) {
        if (getCredentialBusy(url)) return;
        setCredentialBusy(url, "save");
        credentialStatus = "";
        credentialError = "";
        try {
            const encrypted = await encryptJSON(token, editCredentials);
            secrets[url] = encrypted;
            secrets = { ...secrets }; // trigger reactivity
            decrypted[url] = editCredentials;
            decrypted = { ...decrypted };
            revealed = new Set(revealed).add(url);
            const savedSha = await saveSecretsMap(token, secrets, sha);
            sha = savedSha ?? sha;
            settingsStore.update((s) => ({
                ...s,
                encryptedSecrets: { ...secrets },
                decrypted: { ...decrypted },
                secrets: { ...decrypted },
                secretsSha: sha
            }));
            editing = null;
            credentialStatus = "Credential saved.";
        } catch (error) {
            console.warn("Failed to save credential:", error);
            credentialError = "Failed to save credential.";
        } finally {
            setCredentialBusy(url, "");
        }
    }

    async function deleteCredential(url) {
        if (!confirm(`Are you sure you want to delete the credential for:\n${url}?`)) return;
        if (getCredentialBusy(url)) return;
        setCredentialBusy(url, "delete");
        credentialStatus = "";
        credentialError = "";
        try {
            delete secrets[url];
            secrets = { ...secrets }; // trigger reactivity
            delete decrypted[url];
            decrypted = { ...decrypted };
            revealed = new Set([...revealed].filter(item => item !== url));
            if (editing === url) editing = null;
            const savedSha = await saveSecretsMap(token, secrets, sha);
            sha = savedSha ?? sha;
            settingsStore.update((s) => ({
                ...s,
                encryptedSecrets: { ...secrets },
                decrypted: { ...decrypted },
                secrets: { ...decrypted },
                secretsSha: sha
            }));
            credentialStatus = "Credential deleted.";
        } catch (error) {
            console.warn("Failed to delete credential:", error);
            credentialError = "Failed to delete credential.";
        } finally {
            setCredentialBusy(url, "");
        }
    }

    async function addCredential() {
        if (!newUrl || !newType || addingCredential) return;

        const template =
            newType === "s3"
                ? {
                      type: "s3",
                      accessKeyId: newCredentials.accessKeyId || "",
                      secretAccessKey: newCredentials.secretAccessKey || "",
                      region: newCredentials.region || ""
                  }
                : {
                      type: "google_drive",
                      client_id: newCredentials.client_id || "",
                      client_secret: newCredentials.client_secret || "",
                      refresh_token: newCredentials.refresh_token || ""
                  };

        addingCredential = true;
        credentialStatus = "";
        credentialError = "";
        try {
            const encrypted = await encryptJSON(token, template);
            secrets[newUrl] = encrypted;
            secrets = { ...secrets }; // trigger reactivity
            decrypted[newUrl] = template;
            decrypted = { ...decrypted };
            revealed = new Set(revealed).add(newUrl);
            newUrl = "";
            newType = "s3";
            newCredentials = {
                type: "s3",
                accessKeyId: "",
                secretAccessKey: "",
                region: ""
            };
            const savedSha = await saveSecretsMap(token, secrets, sha);
            sha = savedSha ?? sha;
            settingsStore.update((s) => ({
                ...s,
                encryptedSecrets: { ...secrets },
                decrypted: { ...decrypted },
                secrets: { ...decrypted },
                secretsSha: sha
            }));
            credentialStatus = "Credential added.";
        } catch (error) {
            console.warn("Failed to add credential:", error);
            credentialError = "Failed to add credential.";
        } finally {
            addingCredential = false;
        }
    }

    function saveCleanupMode() {
        settingsStore.update(s => ({ ...s, cleanupMode }));
        localStorage.setItem('skygit_cleanup_mode', cleanupMode ? 'true' : 'false');
    }
    
    let showGoogleGuide = false;
    
    function handleGoogleSetupComplete(event) {
        const creds = event.detail;
        newUrl = creds.folder_url;
        newType = 'google_drive';
        newCredentials = {
            type: 'google_drive',
            client_id: creds.client_id,
            client_secret: creds.client_secret,
            refresh_token: creds.refresh_token
        };
        showGoogleGuide = false;
    }
</script>

<Layout>
    <div class="p-6 max-w-4xl mx-auto space-y-6">
        <h2 class="text-2xl font-semibold text-gray-800">
            🔐 Credential Manager
        </h2>
        
        {#if !repoExists}
            <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 class="text-lg font-semibold text-yellow-800 mb-2">
                    ⚠️ Configuration Repository Issue
                </h3>
                <p class="text-yellow-700 mb-3">
                    The <code class="bg-yellow-100 px-1 rounded">skygit-config</code> repository is required to store your credentials securely.
                </p>
                <div class="space-y-3">
                    <button
                        on:click={createRepo}
                        disabled={creatingRepo}
                        aria-busy={creatingRepo}
                        class="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded disabled:opacity-50"
                    >
                        {#if creatingRepo}
                            <span class="inline-flex items-center gap-2">
                                <Loader2 class="w-4 h-4 animate-spin" />
                                Creating...
                            </span>
                        {:else}
                            Create Repository
                        {/if}
                    </button>
                    
                    <div class="text-sm text-yellow-700">
                        <p class="font-semibold mb-1">If you see "repository already exists" error:</p>
                        <ol class="list-decimal list-inside space-y-1 ml-2">
                            <li>Check if the repo exists at: <a href="https://github.com/{$authStore?.user?.login || 'YOUR_USERNAME'}/skygit-config" target="_blank" class="underline">github.com/{$authStore?.user?.login || 'YOUR_USERNAME'}/skygit-config</a></li>
                            <li>If it exists but you can't access it, check your PAT has "repo" scope</li>
                            <li>If you deleted it recently, wait a few minutes or rename it first</li>
                            <li>Try visiting the repo directly and delete it if needed</li>
                        </ol>
                    </div>
                </div>
            </div>
        {:else}

        <table class="w-full text-sm border rounded overflow-hidden shadow">
            <thead class="bg-gray-100 text-left">
                <tr>
                    <th class="p-2">URL</th>
                    <th class="p-2">Encrypted Preview</th>
                    <th class="p-2">Type</th>
                    <th class="p-2">Actions</th>
                </tr>
            </thead>
            <tbody>
                {#each Object.entries(secrets) as [url, value]}
                    <tr class="border-t">
                        <td class="p-2 align-top">{url}</td>
                        <td class="p-2 font-mono text-xs text-gray-500">
                            {value.slice(0, 20)}...
                        </td>
                        <td class="p-2 text-xs text-gray-700">
                            {#if decrypted[url]}
                                {decrypted[url].type === "s3" ? "S3" : "Google Drive"}
                            {:else}
                                ?
                            {/if}
                        </td>
                        <td class="p-2 space-x-3 text-sm">
                            {#if revealed.has(url)}
                                <button on:click={() => hide(url)} title="Hide" disabled={!!getCredentialBusy(url)}>🙈</button>
                                {#if editing === url}
                                    <button
                                        on:click={() => saveEdit(url)}
                                        title="Save"
                                        disabled={!!getCredentialBusy(url)}
                                        aria-busy={getCredentialBusy(url) === "save"}
                                    >
                                        {#if getCredentialBusy(url) === "save"}
                                            <Loader2 class="inline w-4 h-4 animate-spin" />
                                        {:else}
                                            💾
                                        {/if}
                                    </button>
                                {:else}
                                    <button on:click={() => startEdit(url)} title="Edit" disabled={!!getCredentialBusy(url)}>✏️</button>
                                {/if}
                            {:else}
                                <button
                                    on:click={() => reveal(url)}
                                    title="Reveal"
                                    disabled={!!getCredentialBusy(url)}
                                    aria-busy={getCredentialBusy(url) === "reveal"}
                                >
                                    {#if getCredentialBusy(url) === "reveal"}
                                        <Loader2 class="inline w-4 h-4 animate-spin" />
                                    {:else}
                                        👁️
                                    {/if}
                                </button>
                            {/if}
                            <button
                                on:click={() => deleteCredential(url)}
                                title="Delete"
                                disabled={!!getCredentialBusy(url)}
                                aria-busy={getCredentialBusy(url) === "delete"}
                            >
                                {#if getCredentialBusy(url) === "delete"}
                                    <Loader2 class="inline w-4 h-4 animate-spin" />
                                {:else}
                                    🗑️
                                {/if}
                            </button>
                        </td>
                    </tr>

                    {#if revealed.has(url)}
                        <tr class="bg-gray-50 text-xs">
                            <td colspan="4" class="p-3">
                                {#if editing === url}
                                    <label class="block mb-2">
                                        <span class="font-semibold">Type</span>
                                        <select disabled class="w-full border px-2 py-1 rounded text-xs bg-gray-100 text-gray-500">
                                            <option>{editCredentials.type}</option>
                                        </select>
                                    </label>
                                    {#each Object.entries(editCredentials) as [key, val]}
                                        {#if key !== "type"}
                                            <label class="block mb-2">
                                                <span class="font-semibold">{key}</span>
                                                <input
                                                    bind:value={editCredentials[key]}
                                                    class="w-full border px-2 py-1 rounded text-xs"
                                                />
                                            </label>
                                        {/if}
                                    {/each}
                                {:else}
                                    <pre class="text-xs text-gray-700 bg-white border rounded p-2">
{JSON.stringify(decrypted[url], null, 2)}
                                    </pre>
                                {/if}
                            </td>
                        </tr>
                    {/if}
                {/each}
            </tbody>
        </table>
        {#if credentialStatus}
            <p class="text-sm text-green-600" aria-live="polite">{credentialStatus}</p>
        {/if}
        {#if credentialError}
            <p class="text-sm text-red-600" aria-live="polite">{credentialError}</p>
        {/if}

        <div class="border-t pt-4 space-y-2">
            <h3 class="text-lg font-semibold text-gray-700">➕ Add Credential</h3>

            <div class="grid md:grid-cols-2 gap-4">
                <label>
                    URL:
                    <input
                        bind:value={newUrl}
                        placeholder="https://my-storage.com/path"
                        class="w-full border px-2 py-1 rounded text-sm"
                    />
                </label>
                <label>
                    Type:
                    <select
                        bind:value={newType}
                        class="w-full border px-2 py-1 rounded text-sm"
                    >
                        <option value="s3">S3</option>
                        <option value="google_drive">Google Drive</option>
                    </select>
                </label>
            </div>

            {#if newType === "s3"}
                <div class="grid md:grid-cols-3 gap-4">
                    <label>
                        Access Key ID:
                        <input bind:value={newCredentials.accessKeyId} class="w-full border px-2 py-1 rounded text-sm" />
                    </label>
                    <label>
                        Secret Access Key:
                        <input bind:value={newCredentials.secretAccessKey} class="w-full border px-2 py-1 rounded text-sm" />
                    </label>
                    <label>
                        Region:
                        <input bind:value={newCredentials.region} class="w-full border px-2 py-1 rounded text-sm" />
                    </label>
                </div>
            {:else if newType === "google_drive"}
                <div class="space-y-4">
                    <div class="bg-blue-50 border border-blue-200 rounded p-4">
                        <h4 class="font-semibold text-blue-900 mb-2">🔗 Connect Google Drive</h4>
                        <p class="text-sm text-blue-800 mb-3">
                            Set up your own Google Drive integration for file uploads and storage.
                        </p>
                        <button
                            on:click={() => showGoogleGuide = true}
                            class="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded flex items-center gap-2"
                        >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                            Set Up Google Drive
                        </button>
                    </div>
                    
                    <div class="text-sm text-gray-600">
                        <p class="mb-2">Or enter credentials manually if you already have them:</p>
                        <div class="grid md:grid-cols-3 gap-4">
                            <label>
                                Client ID:
                                <input bind:value={newCredentials.client_id} placeholder="e.g., 123456789.apps.googleusercontent.com" class="w-full border px-2 py-1 rounded text-sm" />
                            </label>
                            <label>
                                Client Secret:
                                <input bind:value={newCredentials.client_secret} placeholder="e.g., GOCSPX-..." class="w-full border px-2 py-1 rounded text-sm" />
                            </label>
                            <label>
                                Refresh Token:
                                <input bind:value={newCredentials.refresh_token} placeholder="e.g., 1//0g..." class="w-full border px-2 py-1 rounded text-sm" />
                            </label>
                        </div>
                    </div>
                </div>
            {/if}

            <button
                on:click={addCredential}
                disabled={addingCredential || !newUrl.trim()}
                aria-busy={addingCredential}
                class="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded inline-flex items-center justify-center min-w-[140px] disabled:opacity-50"
            >
                {#if addingCredential}
                    <Loader2 class="w-4 h-4 mr-2 animate-spin" />
                    Adding...
                {:else}
                    💾 Add Credential
                {/if}
            </button>
        </div>
        <div class="border-t pt-4 space-y-2">
            <h3 class="text-lg font-semibold text-gray-700">App Settings</h3>
            <label class="flex items-center space-x-2">
                <input type="checkbox" bind:checked={cleanupMode} on:change={saveCleanupMode} />
                <span>Cleanup mode (delete old presence channels)</span>
            </label>
        </div>
        {/if}
    </div>
</Layout>

<GoogleDriveSetupGuide 
    show={showGoogleGuide}
    on:complete={handleGoogleSetupComplete}
    on:close={() => showGoogleGuide = false}
/>
