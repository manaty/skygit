<script>
    import { onMount } from "svelte";
    import { getSecretsMap, saveSecretsMap } from "../services/githubApi.js";
    import { decryptJSON, encryptJSON } from "../services/encryption.js";
    import Layout from "../components/Layout.svelte";
    import { settingsStore } from "../stores/settingsStore.js";
    import { get } from "svelte/store";

    let secrets = {};
    let decrypted = {};
    let revealed = new Set();
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
        const result = await getSecretsMap(token);
        secrets = result.secrets;
        sha = result.sha;
    });

    async function reveal(url) {
        try {
            if (!decrypted[url]) {
                decrypted[url] = await decryptJSON(token, secrets[url]);
            }
            revealed = new Set(revealed).add(url);
        } catch (e) {
            alert("❌ Failed to decrypt.");
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
        const encrypted = await encryptJSON(token, editCredentials);
        secrets[url] = encrypted;
        secrets = { ...secrets }; // trigger reactivity
        decrypted[url] = editCredentials;
        decrypted = { ...decrypted };
        revealed = new Set(revealed).add(url);
        editing = null;
        await saveSecretsMap(token, secrets, sha);
    }

    async function deleteCredential(url) {
        if (!confirm(`Are you sure you want to delete the credential for:\n${url}?`)) return;
        delete secrets[url];
        secrets = { ...secrets }; // trigger reactivity
        delete decrypted[url];
        decrypted = { ...decrypted };
        revealed = new Set([...revealed].filter(item => item !== url));
        if (editing === url) editing = null;
        await saveSecretsMap(token, secrets, sha);
    }

    async function addCredential() {
        if (!newUrl || !newType) return;

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
        await saveSecretsMap(token, secrets, sha);
    }

    function saveCleanupMode() {
        settingsStore.update(s => ({ ...s, cleanupMode }));
        localStorage.setItem('skygit_cleanup_mode', cleanupMode ? 'true' : 'false');
    }
</script>

<Layout>
    <div class="p-6 max-w-4xl mx-auto space-y-6">
        <h2 class="text-2xl font-semibold text-gray-800">
            🔐 Credential Manager
        </h2>

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
                                <button on:click={() => hide(url)} title="Hide">🙈</button>
                                {#if editing === url}
                                    <button on:click={() => saveEdit(url)} title="Save">💾</button>
                                {:else}
                                    <button on:click={() => startEdit(url)} title="Edit">✏️</button>
                                {/if}
                            {:else}
                                <button on:click={() => reveal(url)} title="Reveal">👁️</button>
                            {/if}
                            <button on:click={() => deleteCredential(url)} title="Delete">🗑️</button>
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
                <div class="grid md:grid-cols-3 gap-4">
                    <label>
                        Client ID:
                        <input bind:value={newCredentials.client_id} class="w-full border px-2 py-1 rounded text-sm" />
                    </label>
                    <label>
                        Client Secret:
                        <input bind:value={newCredentials.client_secret} class="w-full border px-2 py-1 rounded text-sm" />
                    </label>
                    <label>
                        Refresh Token:
                        <input bind:value={newCredentials.refresh_token} class="w-full border px-2 py-1 rounded text-sm" />
                    </label>
                </div>
            {/if}

            <button
                on:click={addCredential}
                class="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded"
            >
                💾 Add Credential
            </button>
        </div>
        <div class="border-t pt-4 space-y-2">
            <h3 class="text-lg font-semibold text-gray-700">App Settings</h3>
            <label class="flex items-center space-x-2">
                <input type="checkbox" bind:checked={cleanupMode} on:change={saveCleanupMode} />
                <span>Cleanup mode (delete old presence channels)</span>
            </label>
        </div>
    </div>
</Layout>
