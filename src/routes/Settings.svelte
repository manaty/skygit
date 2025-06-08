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

    let secrets = {};
    let decrypted = {};
    let revealed = new Set();
    let repoExists = true;
    let creatingRepo = false;
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
    
    let showGoogleGuide = false;
    let googleStep = 1;
    let copiedSteps = {};
    
    // Helper function to copy text to clipboard
    async function copyToClipboard(text, stepId) {
        try {
            await navigator.clipboard.writeText(text);
            copiedSteps[stepId] = true;
            copiedSteps = copiedSteps; // Trigger reactivity
            setTimeout(() => {
                copiedSteps[stepId] = false;
                copiedSteps = copiedSteps;
            }, 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    }
    
    function startGoogleDriveSetup() {
        showGoogleGuide = true;
        googleStep = 1;
        newType = 'google_drive';
        newCredentials = {
            type: 'google_drive',
            client_id: '',
            client_secret: '',
            refresh_token: ''
        };
    }
    
    function nextGoogleStep() {
        googleStep = Math.min(googleStep + 1, 6);
    }
    
    function prevGoogleStep() {
        googleStep = Math.max(googleStep - 1, 1);
    }
    
    // Generate a suggested folder name
    function getSuggestedFolderName() {
        const auth = get(authStore);
        const username = auth?.user?.login || 'user';
        return `SkyGit-${username}`;
    }
    
    function closeGoogleGuide() {
        // Auto-fill OAuth Playground credentials if not already filled
        if (newType === 'google_drive' && newCredentials.refresh_token) {
            if (!newCredentials.client_id) {
                newCredentials.client_id = '407408718192.apps.googleusercontent.com';
            }
            if (!newCredentials.client_secret) {
                newCredentials.client_secret = 'ErZOZtVi6efIwCAboEEHvC1I';
            }
        }
        showGoogleGuide = false;
        googleStep = 1;
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
                        class="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded disabled:opacity-50"
                    >
                        {creatingRepo ? 'Creating...' : 'Create Repository'}
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
                <div class="space-y-4">
                    {#if !showGoogleGuide}
                        <div class="bg-blue-50 border border-blue-200 rounded p-4">
                            <h4 class="font-semibold text-blue-900 mb-2">🔗 Connect Google Drive</h4>
                            <p class="text-sm text-blue-800 mb-3">
                                Get your Google Drive credentials in just 5 minutes with our step-by-step guide.
                            </p>
                            <button
                                on:click={startGoogleDriveSetup}
                                class="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded flex items-center gap-2"
                            >
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                                Start Guided Setup
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
                    {:else}
                        <!-- Guided Setup Modal -->
                        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                            <div class="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                                <div class="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
                                    <h3 class="text-lg font-semibold">Google Drive Setup - Step {googleStep} of 6</h3>
                                    <button on:click={closeGoogleGuide} class="text-gray-500 hover:text-gray-700">
                                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                                
                                <div class="p-6">
                                    {#if googleStep === 1}
                                        <div class="space-y-4">
                                            <h4 class="text-xl font-semibold text-gray-800">Welcome! Let's connect your Google Drive</h4>
                                            <p class="text-gray-600">
                                                We'll use Google's OAuth Playground to safely generate credentials. This process is:
                                            </p>
                                            <ul class="space-y-2 text-sm">
                                                <li class="flex items-start gap-2">
                                                    <svg class="w-5 h-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    <span><strong>Safe:</strong> You're using Google's official tool</span>
                                                </li>
                                                <li class="flex items-start gap-2">
                                                    <svg class="w-5 h-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    <span><strong>Private:</strong> Credentials are stored encrypted in your GitHub</span>
                                                </li>
                                                <li class="flex items-start gap-2">
                                                    <svg class="w-5 h-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    <span><strong>Quick:</strong> Takes about 5 minutes</span>
                                                </li>
                                            </ul>
                                            <div class="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm">
                                                <p class="font-semibold text-yellow-800 mb-1">📋 You'll need:</p>
                                                <ul class="list-disc list-inside text-yellow-700">
                                                    <li>A Google account</li>
                                                    <li>To be signed in to Google</li>
                                                </ul>
                                            </div>
                                        </div>
                                    {/if}
                                    
                                    {#if googleStep === 2}
                                        <div class="space-y-4">
                                            <h4 class="text-xl font-semibold text-gray-800">Step 1: Open Google OAuth Playground</h4>
                                            <p class="text-gray-600">
                                                Click the button below to open Google's OAuth Playground in a new tab:
                                            </p>
                                            <a 
                                                href="https://developers.google.com/oauthplayground/" 
                                                target="_blank"
                                                class="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
                                            >
                                                Open OAuth Playground
                                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                </svg>
                                            </a>
                                            <div class="bg-gray-50 rounded-lg p-4">
                                                <p class="text-sm text-gray-700 mb-2">You'll see a page that looks like this:</p>
                                                <div class="border-2 border-gray-300 rounded p-2 bg-white">
                                                    <div class="text-xs text-gray-500 mb-2">OAuth 2.0 Playground</div>
                                                    <div class="flex gap-4">
                                                        <div class="w-1/3 bg-gray-100 rounded p-2 text-xs">Step 1: Select APIs</div>
                                                        <div class="w-1/3 bg-gray-100 rounded p-2 text-xs">Step 2: Configure</div>
                                                        <div class="w-1/3 bg-gray-100 rounded p-2 text-xs">Step 3: Get tokens</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    {/if}
                                    
                                    {#if googleStep === 3}
                                        <div class="space-y-4">
                                            <h4 class="text-xl font-semibold text-gray-800">Step 2: Select Google Drive API</h4>
                                            <p class="text-gray-600">In the OAuth Playground:</p>
                                            
                                            <ol class="space-y-4">
                                                <li class="flex gap-3">
                                                    <span class="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">1</span>
                                                    <div class="flex-1">
                                                        <p class="font-medium">Find "Drive API v3" in the list</p>
                                                        <p class="text-sm text-gray-600">Scroll down or use Ctrl+F to search for "Drive"</p>
                                                    </div>
                                                </li>
                                                
                                                <li class="flex gap-3">
                                                    <span class="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">2</span>
                                                    <div class="flex-1">
                                                        <p class="font-medium">Click to expand it</p>
                                                        <p class="text-sm text-gray-600">You'll see a list of permissions</p>
                                                    </div>
                                                </li>
                                                
                                                <li class="flex gap-3">
                                                    <span class="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">3</span>
                                                    <div class="flex-1">
                                                        <p class="font-medium">Check this exact permission:</p>
                                                        <div class="mt-2 bg-gray-100 rounded p-3 font-mono text-sm flex items-center justify-between">
                                                            <span>https://www.googleapis.com/auth/drive.file</span>
                                                            <button 
                                                                on:click={() => copyToClipboard('https://www.googleapis.com/auth/drive.file', 'scope')}
                                                                class="ml-2 text-blue-600 hover:text-blue-700"
                                                            >
                                                                {#if copiedSteps['scope']}
                                                                    ✓ Copied!
                                                                {:else}
                                                                    📋 Copy
                                                                {/if}
                                                            </button>
                                                        </div>
                                                        <p class="text-xs text-gray-600 mt-1">This gives access only to files created by SkyGit</p>
                                                    </div>
                                                </li>
                                                
                                                <li class="flex gap-3">
                                                    <span class="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">4</span>
                                                    <div class="flex-1">
                                                        <p class="font-medium">Click the blue "Authorize APIs" button</p>
                                                        <p class="text-sm text-gray-600">It's at the bottom of the permissions list</p>
                                                    </div>
                                                </li>
                                            </ol>
                                            
                                            <div class="bg-blue-50 border border-blue-200 rounded p-3 text-sm">
                                                <p class="text-blue-800">
                                                    <strong>Tip:</strong> Make sure you check only the "drive.file" permission, not "drive" (which gives full access).
                                                </p>
                                            </div>
                                        </div>
                                    {/if}
                                    
                                    {#if googleStep === 4}
                                        <div class="space-y-4">
                                            <h4 class="text-xl font-semibold text-gray-800">Step 3: Sign in and Get Tokens</h4>
                                            <p class="text-gray-600">After clicking "Authorize APIs":</p>
                                            
                                            <ol class="space-y-4">
                                                <li class="flex gap-3">
                                                    <span class="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">1</span>
                                                    <div class="flex-1">
                                                        <p class="font-medium">Sign in to your Google account</p>
                                                        <p class="text-sm text-gray-600">Choose the account you want to use with SkyGit</p>
                                                    </div>
                                                </li>
                                                
                                                <li class="flex gap-3">
                                                    <span class="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">2</span>
                                                    <div class="flex-1">
                                                        <p class="font-medium">Click "Continue" when Google asks for permissions</p>
                                                        <p class="text-sm text-gray-600">You may see a warning if this is your first time</p>
                                                    </div>
                                                </li>
                                                
                                                <li class="flex gap-3">
                                                    <span class="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">3</span>
                                                    <div class="flex-1">
                                                        <p class="font-medium">You'll be redirected back to OAuth Playground</p>
                                                        <p class="text-sm text-gray-600">You should now be on "Step 2"</p>
                                                    </div>
                                                </li>
                                                
                                                <li class="flex gap-3">
                                                    <span class="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">4</span>
                                                    <div class="flex-1">
                                                        <p class="font-medium">Click "Exchange authorization code for tokens"</p>
                                                        <p class="text-sm text-gray-600">This blue button generates your credentials</p>
                                                    </div>
                                                </li>
                                            </ol>
                                            
                                            <div class="bg-green-50 border border-green-200 rounded p-3 text-sm">
                                                <p class="text-green-800">
                                                    <strong>Success!</strong> You should now see your tokens in the right panel.
                                                </p>
                                            </div>
                                        </div>
                                    {/if}
                                    
                                    {#if googleStep === 5}
                                        <div class="space-y-4">
                                            <h4 class="text-xl font-semibold text-gray-800">Step 4: Copy Your Refresh Token</h4>
                                            <p class="text-gray-600">From the OAuth Playground, copy the refresh token:</p>
                                            
                                            <div class="space-y-4">
                                                <div class="bg-gray-50 rounded-lg p-4">
                                                    <label class="block text-sm font-medium text-gray-700 mb-2">
                                                        1. Refresh Token (from the response panel)
                                                    </label>
                                                    <p class="text-xs text-gray-600 mb-2">Look for "refresh_token" in the right panel (scroll down if needed)</p>
                                                    <input 
                                                        bind:value={newCredentials.refresh_token}
                                                        placeholder="e.g., 1//0gLKz..."
                                                        class="w-full border px-3 py-2 rounded text-sm"
                                                    />
                                                </div>
                                                
                                                <div class="bg-green-50 border border-green-200 rounded p-3 mt-4">
                                                    <p class="text-sm text-green-800">
                                                        <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                                                        </svg>
                                                        <strong>Good news!</strong> The Client ID and Secret will be filled automatically when you click "Finish Setup" below.
                                                    </p>
                                                    <p class="text-xs text-green-700 mt-1">
                                                        OAuth Playground uses Google's default credentials which we'll apply for you.
                                                    </p>
                                                </div>
                                                
                                                <div class="hidden">
                                                    <input bind:value={newCredentials.client_id} />
                                                    <input bind:value={newCredentials.client_secret} />
                                                </div>
                                            </div>
                                            
                                            {#if newCredentials.refresh_token}
                                                <div class="bg-green-50 border border-green-200 rounded p-3 text-sm">
                                                    <p class="text-green-800 font-medium">
                                                        ✅ Perfect! You've added the refresh token. Click "Finish Setup" to complete.
                                                    </p>
                                                </div>
                                            {:else}
                                                <div class="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm">
                                                    <p class="text-yellow-800">
                                                        Please paste the refresh token from OAuth Playground above.
                                                    </p>
                                                </div>
                                            {/if}
                                        </div>
                                    {/if}
                                    
                                    {#if googleStep === 6}
                                        <div class="space-y-4">
                                            <h4 class="text-xl font-semibold text-gray-800">Step 5: Set Your Google Drive Folder</h4>
                                            <p class="text-gray-600">Choose where SkyGit will store files in your Google Drive:</p>
                                            
                                            <div class="space-y-4">
                                                <div class="bg-blue-50 border border-blue-200 rounded p-4">
                                                    <h5 class="font-medium text-blue-900 mb-2">Option 1: Create a new folder (Recommended)</h5>
                                                    <ol class="space-y-2 text-sm text-blue-800">
                                                        <li class="flex items-start gap-2">
                                                            <span class="font-bold">1.</span>
                                                            <div>
                                                                <a href="https://drive.google.com" target="_blank" class="text-blue-600 underline">Open Google Drive</a> in a new tab
                                                            </div>
                                                        </li>
                                                        <li class="flex items-start gap-2">
                                                            <span class="font-bold">2.</span>
                                                            <div>
                                                                Click "New" → "New folder"
                                                            </div>
                                                        </li>
                                                        <li class="flex items-start gap-2">
                                                            <span class="font-bold">3.</span>
                                                            <div>
                                                                Name it: 
                                                                <code class="bg-white px-2 py-1 rounded font-mono text-xs">{getSuggestedFolderName()}</code>
                                                                <button 
                                                                    on:click={() => copyToClipboard(getSuggestedFolderName(), 'folderName')}
                                                                    class="ml-2 text-blue-600 hover:text-blue-700"
                                                                >
                                                                    {#if copiedSteps['folderName']}
                                                                        ✓ Copied
                                                                    {:else}
                                                                        📋 Copy
                                                                    {/if}
                                                                </button>
                                                            </div>
                                                        </li>
                                                        <li class="flex items-start gap-2">
                                                            <span class="font-bold">4.</span>
                                                            <div>
                                                                Open the folder and copy its URL from the address bar
                                                            </div>
                                                        </li>
                                                    </ol>
                                                </div>
                                                
                                                <div class="bg-gray-50 rounded p-4">
                                                    <h5 class="font-medium text-gray-700 mb-2">Option 2: Use an existing folder</h5>
                                                    <p class="text-sm text-gray-600">
                                                        Navigate to any folder in your Google Drive and copy its URL from the address bar.
                                                    </p>
                                                </div>
                                                
                                                <div class="mt-4">
                                                    <label class="block text-sm font-medium text-gray-700 mb-2">
                                                        Google Drive Folder URL:
                                                    </label>
                                                    <input 
                                                        bind:value={newUrl}
                                                        placeholder="https://drive.google.com/drive/folders/..."
                                                        class="w-full border px-3 py-2 rounded text-sm"
                                                    />
                                                    <p class="text-xs text-gray-500 mt-1">
                                                        Examples: 
                                                        <br />• https://drive.google.com/drive/folders/1abc...xyz
                                                        <br />• https://drive.google.com/drive/u/0/folders/1abc...xyz
                                                    </p>
                                                </div>
                                                
                                                {#if newUrl && newUrl.match(/drive\.google\.com\/drive\/(?:u\/\d+\/)?folders\//)}
                                                    <div class="bg-green-50 border border-green-200 rounded p-3 text-sm">
                                                        <p class="text-green-800 font-medium">
                                                            ✅ Great! Your folder URL is valid. Click "Finish Setup" to complete.
                                                        </p>
                                                    </div>
                                                {:else if newUrl}
                                                    <div class="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm">
                                                        <p class="text-yellow-800">
                                                            Please ensure the URL is from a Google Drive folder
                                                        </p>
                                                    </div>
                                                {:else}
                                                    <div class="bg-gray-50 border border-gray-200 rounded p-3 text-sm">
                                                        <p class="text-gray-600">
                                                            Paste your Google Drive folder URL above to continue.
                                                        </p>
                                                    </div>
                                                {/if}
                                            </div>
                                        </div>
                                    {/if}
                                </div>
                                
                                <div class="sticky bottom-0 bg-white border-t p-4 flex justify-between">
                                    <button
                                        on:click={prevGoogleStep}
                                        disabled={googleStep === 1}
                                        class="px-4 py-2 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        ← Previous
                                    </button>
                                    
                                    <div class="flex gap-2">
                                        {#each [1, 2, 3, 4, 5, 6] as step}
                                            <div 
                                                class="w-2 h-2 rounded-full {googleStep >= step ? 'bg-blue-600' : 'bg-gray-300'}"
                                            />
                                        {/each}
                                    </div>
                                    
                                    {#if googleStep < 6}
                                        <button
                                            on:click={nextGoogleStep}
                                            class="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                                        >
                                            Next →
                                        </button>
                                    {:else}
                                        <button
                                            on:click={closeGoogleGuide}
                                            disabled={!newCredentials.refresh_token || !newUrl || !newUrl.match(/drive\.google\.com\/drive\/(?:u\/\d+\/)?folders\//)}
                                            class="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Finish Setup
                                        </button>
                                    {/if}
                                </div>
                            </div>
                        </div>
                    {/if}
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
        {/if}
    </div>
</Layout>
