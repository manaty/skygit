<script>
    import { createEventDispatcher } from 'svelte';
    import { authStore } from '../stores/authStore.js';
    import { get } from 'svelte/store';
    
    export let show = false;
    
    const dispatch = createEventDispatcher();
    
    let currentStep = 1;
    let copiedSteps = {};
    let credentials = {
        client_id: '',
        client_secret: '',
        refresh_token: '',
        folder_url: ''
    };
    
    async function copyToClipboard(text, stepId) {
        try {
            await navigator.clipboard.writeText(text);
            copiedSteps[stepId] = true;
            copiedSteps = copiedSteps;
            setTimeout(() => {
                copiedSteps[stepId] = false;
                copiedSteps = copiedSteps;
            }, 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    }
    
    function getSuggestedFolderName() {
        const auth = get(authStore);
        const username = auth?.user?.login || 'user';
        return `SkyGit-${username}`;
    }
    
    function getCurrentAppUrl() {
        // Get the current app's base URL
        const { protocol, hostname, port } = window.location;
        return `${protocol}//${hostname}${port ? ':' + port : ''}`;
    }
    
    function handleComplete() {
        dispatch('complete', credentials);
    }
    
    function handleClose() {
        dispatch('close');
    }
</script>

{#if show}
<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div class="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
            <h3 class="text-lg font-semibold">Google Drive Setup - Create Your Own App</h3>
            <button on:click={handleClose} class="text-gray-500 hover:text-gray-700">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
        
        <div class="p-6">
            {#if currentStep === 1}
                <div class="space-y-4">
                    <h4 class="text-xl font-semibold">Welcome! Let's set up Google Drive</h4>
                    <p class="text-gray-600">
                        We'll guide you through creating your own Google Cloud project to enable file uploads and storage. It's free and takes about 10 minutes.
                    </p>
                    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h5 class="font-semibold text-blue-900 mb-2">What you'll get:</h5>
                        <ul class="list-disc list-inside text-sm text-blue-800 space-y-1">
                            <li>Your own Google Drive integration</li>
                            <li>Full control over permissions</li>
                            <li>No daily limits or restrictions</li>
                            <li>Works permanently (no token expiration)</li>
                        </ul>
                    </div>
                    <div class="bg-green-50 border border-green-200 rounded-lg p-3 mt-4">
                        <p class="text-sm text-green-800">
                            <strong>✓ Free to use:</strong> Google Cloud offers a generous free tier that's more than enough for personal use.
                        </p>
                    </div>
                </div>
            {/if}
            
            {#if currentStep === 2}
                <div class="space-y-4">
                    <h4 class="text-xl font-semibold">Step 1: Create a Google Cloud Project</h4>
                    <ol class="space-y-4">
                        <li class="flex gap-3">
                            <span class="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">1</span>
                            <div class="flex-1">
                                <p class="font-medium">Go to Google Cloud Console</p>
                                <a 
                                    href="https://console.cloud.google.com/projectcreate" 
                                    target="_blank"
                                    class="inline-flex items-center gap-2 mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
                                >
                                    Open Cloud Console
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                </a>
                            </div>
                        </li>
                        
                        <li class="flex gap-3">
                            <span class="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">2</span>
                            <div class="flex-1">
                                <p class="font-medium">Create a new project</p>
                                <p class="text-sm text-gray-600 mt-1">Project name suggestion:</p>
                                <div class="flex items-center gap-2 mt-2">
                                    <code class="bg-gray-100 px-3 py-1 rounded">SkyGit-Drive</code>
                                    <button 
                                        on:click={() => copyToClipboard('SkyGit-Drive', 'projectName')}
                                        class="text-blue-600 hover:text-blue-700 text-sm"
                                    >
                                        {#if copiedSteps['projectName']}
                                            ✓ Copied!
                                        {:else}
                                            📋 Copy
                                        {/if}
                                    </button>
                                </div>
                            </div>
                        </li>
                        
                        <li class="flex gap-3">
                            <span class="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">3</span>
                            <div class="flex-1">
                                <p class="font-medium">Click "CREATE" and wait for the project to be created</p>
                                <p class="text-sm text-gray-600 mt-1">This usually takes 10-30 seconds</p>
                            </div>
                        </li>
                    </ol>
                </div>
            {/if}
            
            {#if currentStep === 3}
                <div class="space-y-4">
                    <h4 class="text-xl font-semibold">Step 2: Enable Google Drive API</h4>
                    <ol class="space-y-4">
                        <li class="flex gap-3">
                            <span class="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">1</span>
                            <div class="flex-1">
                                <p class="font-medium">Open the API Library</p>
                                <a 
                                    href="https://console.cloud.google.com/apis/library/drive.googleapis.com" 
                                    target="_blank"
                                    class="inline-flex items-center gap-2 mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
                                >
                                    Open Drive API Page
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                </a>
                            </div>
                        </li>
                        
                        <li class="flex gap-3">
                            <span class="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">2</span>
                            <div class="flex-1">
                                <p class="font-medium">Click the blue "ENABLE" button</p>
                                <p class="text-sm text-gray-600 mt-1">If it says "MANAGE" instead, the API is already enabled!</p>
                            </div>
                        </li>
                    </ol>
                </div>
            {/if}
            
            {#if currentStep === 4}
                <div class="space-y-4">
                    <h4 class="text-xl font-semibold">Step 3: Configure OAuth Consent Screen</h4>
                    <div class="bg-blue-50 border border-blue-200 rounded p-3 mb-4">
                        <p class="text-sm text-blue-800">
                            <strong>Navigation help:</strong> In Google Cloud Console, look for the hamburger menu (☰) in the top-left corner. 
                            Click it, then find "APIs & Services" → "OAuth consent screen"
                        </p>
                    </div>
                    <ol class="space-y-4">
                        <li class="flex gap-3">
                            <span class="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">1</span>
                            <div class="flex-1">
                                <p class="font-medium">Go to OAuth consent screen</p>
                                <a 
                                    href="https://console.cloud.google.com/apis/credentials/consent" 
                                    target="_blank"
                                    class="inline-flex items-center gap-2 mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
                                >
                                    Open OAuth Consent Screen
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                </a>
                            </div>
                        </li>
                        
                        <li class="flex gap-3">
                            <span class="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">2</span>
                            <div class="flex-1">
                                <p class="font-medium">Configure the OAuth consent screen</p>
                                <div class="bg-yellow-50 border border-yellow-200 rounded p-3 mt-2 text-sm">
                                    <p class="font-semibold text-yellow-800 mb-1">If you don't see the "External" option:</p>
                                    <ul class="text-yellow-700 space-y-1">
                                        <li>• You may already have configured it - click "EDIT APP" instead</li>
                                        <li>• Or select "External" if this is your first time</li>
                                        <li>• If you only see "Internal", you're using a workspace account - select it and continue</li>
                                    </ul>
                                </div>
                            </div>
                        </li>
                        
                        <li class="flex gap-3">
                            <span class="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">3</span>
                            <div class="flex-1">
                                <p class="font-medium">Fill in the required fields:</p>
                                <ul class="text-sm text-gray-600 mt-1 space-y-1">
                                    <li>• App name: <code class="bg-gray-100 px-1">SkyGit Drive</code></li>
                                    <li>• User support email: Your email</li>
                                    <li>• Developer contact: Your email</li>
                                </ul>
                                <p class="text-sm text-gray-500 mt-2">Click "SAVE AND CONTINUE" through all steps</p>
                            </div>
                        </li>
                    </ol>
                </div>
            {/if}
            
            {#if currentStep === 5}
                <div class="space-y-4">
                    <h4 class="text-xl font-semibold">Step 4: Create OAuth Client ID</h4>
                    <ol class="space-y-4">
                        <li class="flex gap-3">
                            <span class="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">1</span>
                            <div class="flex-1">
                                <p class="font-medium">Go to Credentials page</p>
                                <a 
                                    href="https://console.cloud.google.com/apis/credentials" 
                                    target="_blank"
                                    class="inline-flex items-center gap-2 mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
                                >
                                    Open Credentials
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                </a>
                            </div>
                        </li>
                        
                        <li class="flex gap-3">
                            <span class="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">2</span>
                            <div class="flex-1">
                                <p class="font-medium">Click "+ CREATE CREDENTIALS" → "OAuth client ID"</p>
                            </div>
                        </li>
                        
                        <li class="flex gap-3">
                            <span class="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">3</span>
                            <div class="flex-1">
                                <p class="font-medium">Configure the client:</p>
                                <ul class="text-sm text-gray-600 mt-1 space-y-1">
                                    <li>• Application type: <strong>Web application</strong></li>
                                    <li>• Name: <code class="bg-gray-100 px-1">SkyGit Web Client</code></li>
                                </ul>
                            </div>
                        </li>
                        
                        <li class="flex gap-3">
                            <span class="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">4</span>
                            <div class="flex-1">
                                <p class="font-medium">Add these Authorized redirect URIs:</p>
                                <div class="space-y-2 mt-2">
                                    <div class="bg-green-50 border border-green-200 rounded p-2 text-xs">
                                        <p class="font-semibold text-green-800">✓ Add these two essential URIs:</p>
                                    </div>
                                    
                                    <!-- OAuth Playground URI -->
                                    <div class="flex items-center gap-2">
                                        <code class="bg-gray-100 px-3 py-1 rounded text-sm">https://developers.google.com/oauthplayground</code>
                                        <button 
                                            on:click={() => copyToClipboard('https://developers.google.com/oauthplayground', 'redirectUri1')}
                                            class="text-blue-600 hover:text-blue-700 text-sm"
                                        >
                                            {#if copiedSteps['redirectUri1']}
                                                ✓ Copied!
                                            {:else}
                                                📋 Copy
                                            {/if}
                                        </button>
                                        <span class="text-xs text-gray-600">(for easy setup)</span>
                                    </div>
                                    
                                    <!-- Current app URL -->
                                    <div class="flex items-center gap-2">
                                        <code class="bg-gray-100 px-3 py-1 rounded text-sm">{getCurrentAppUrl()}</code>
                                        <button 
                                            on:click={() => copyToClipboard(getCurrentAppUrl(), 'redirectUri2')}
                                            class="text-blue-600 hover:text-blue-700 text-sm"
                                        >
                                            {#if copiedSteps['redirectUri2']}
                                                ✓ Copied!
                                            {:else}
                                                📋 Copy
                                            {/if}
                                        </button>
                                        <span class="text-xs text-gray-600">(current app)</span>
                                    </div>
                                    
                                    <p class="text-xs text-gray-600 mt-2">Click "+ ADD URI" after adding each one, then click "SAVE" at the bottom</p>
                                    
                                    <div class="bg-blue-50 border border-blue-200 rounded p-2 text-xs mt-3">
                                        <p class="text-blue-800">
                                            <strong>Note:</strong> We're detecting your app is running at <code>{getCurrentAppUrl()}</code>. 
                                            If you deploy to a different URL later, you'll need to add that URL too.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </li>
                        
                        <li class="flex gap-3">
                            <span class="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">5</span>
                            <div class="flex-1">
                                <p class="font-medium">Click "CREATE"</p>
                                <p class="text-sm text-gray-600 mt-1">A popup will show your credentials - keep it open!</p>
                            </div>
                        </li>
                    </ol>
                </div>
            {/if}
            
            {#if currentStep === 6}
                <div class="space-y-4">
                    <h4 class="text-xl font-semibold">Step 5: Get Your Refresh Token</h4>
                    <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                        <p class="text-sm text-yellow-800">
                            Copy your Client ID and Client Secret from the popup window first!
                        </p>
                    </div>
                    
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Client ID</label>
                            <input 
                                type="text"
                                bind:value={credentials.client_id}
                                placeholder="Paste your Client ID here"
                                class="w-full border px-3 py-2 rounded"
                            />
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Client Secret</label>
                            <input 
                                type="text"
                                bind:value={credentials.client_secret}
                                placeholder="Paste your Client Secret here"
                                class="w-full border px-3 py-2 rounded"
                            />
                        </div>
                    </div>
                    
                    {#if credentials.client_id && credentials.client_secret}
                        <div class="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <p class="font-medium text-blue-900 mb-2">Now let's get your refresh token:</p>
                            
                            <div class="bg-green-50 border border-green-200 rounded p-3 mb-3">
                                <p class="text-sm text-green-800 font-semibold mb-1">💡 Recommended: Skip to Step 7</p>
                                <p class="text-xs text-green-700">
                                    The OAuth Playground method (Step 7) is easier and more reliable. 
                                    <button 
                                        on:click={() => currentStep = 7}
                                        class="underline font-semibold"
                                    >
                                        Jump to Step 7 →
                                    </button>
                                </p>
                            </div>
                            
                            <div class="bg-yellow-50 border border-yellow-200 rounded p-3 mb-3">
                                <p class="text-sm text-yellow-800 font-semibold mb-1">⚠️ Manual method requires patience</p>
                                <p class="text-xs text-yellow-700">New OAuth clients can take 15-30 minutes to activate. The method below may fail with "unauthorized_client" if your client is too new.</p>
                            </div>
                            
                            <ol class="space-y-2 text-sm text-blue-800">
                                <li>1. Copy the authorization URL below</li>
                                <li>2. Paste it in a new browser tab</li>
                                <li>3. Sign in and grant permissions</li>
                                <li>4. You'll be redirected back to this app</li>
                                <li>5. Copy the code from the URL (after "code=" and before "&scope=")</li>
                            </ol>
                            
                            <div class="mt-3 space-y-2">
                                <p class="text-sm font-semibold text-gray-700">Authorization URL for your current app:</p>
                                <div class="p-3 bg-gray-100 rounded font-mono text-xs break-all">
                                    {`https://accounts.google.com/o/oauth2/v2/auth?client_id=${credentials.client_id}&redirect_uri=${encodeURIComponent(getCurrentAppUrl())}&response_type=code&scope=https://www.googleapis.com/auth/drive.file&access_type=offline&prompt=consent`}
                                </div>
                                <button 
                                    on:click={() => copyToClipboard(`https://accounts.google.com/o/oauth2/v2/auth?client_id=${credentials.client_id}&redirect_uri=${encodeURIComponent(getCurrentAppUrl())}&response_type=code&scope=https://www.googleapis.com/auth/drive.file&access_type=offline&prompt=consent`, 'authUrl1')}
                                    class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                                >
                                    {#if copiedSteps['authUrl1']}
                                        ✓ Copied!
                                    {:else}
                                        📋 Copy URL
                                    {/if}
                                </button>
                            </div>
                            
                            <div class="mt-4 bg-red-50 border border-red-200 rounded p-3">
                                <p class="text-sm font-semibold text-red-800 mb-1">Getting "unauthorized_client" error?</p>
                                <ol class="text-xs text-red-700 space-y-1">
                                    <li>1. <strong>Wait 15-30 minutes</strong> - Google needs time to activate new OAuth clients</li>
                                    <li>2. Double-check your Client ID is correct (copy it again from Google Console)</li>
                                    <li>3. Make sure OAuth consent screen is configured and published</li>
                                    <li>4. Try using the OAuth Playground method instead (see Step 7)</li>
                                </ol>
                            </div>
                            
                            <div class="mt-3 bg-yellow-50 border border-yellow-200 rounded p-3">
                                <p class="text-sm font-semibold text-yellow-800 mb-1">⏰ Timing is important!</p>
                                <p class="text-xs text-yellow-700">
                                    New OAuth clients can take 5-30 minutes to become active. If you just created your client, 
                                    take a break and try again later. The OAuth Playground method (Step 7) often works faster.
                                </p>
                            </div>
                        </div>
                        
                        <div class="mt-4">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Authorization Code</label>
                            <textarea 
                                placeholder="Paste the code from the URL here"
                                class="w-full border px-3 py-2 rounded font-mono text-sm"
                                rows="3"
                            />
                            <div class="bg-gray-50 border border-gray-200 rounded p-3 mt-2 text-xs">
                                <p class="font-semibold text-gray-700 mb-1">Example URL after authorization:</p>
                                <code class="text-gray-600">http://localhost/?code=<span class="text-blue-600 font-bold">4/0AY0e-g7...</span>&scope=https://www.googleapis.com/auth/drive.file</code>
                                <p class="mt-2 text-gray-700">Copy only the blue part (the code between "code=" and "&scope=")</p>
                            </div>
                        </div>
                    {:else}
                        <p class="text-sm text-gray-600">
                            Please enter your Client ID and Client Secret above to continue.
                        </p>
                    {/if}
                </div>
            {/if}
            
            {#if currentStep === 7}
                <div class="space-y-4">
                    <h4 class="text-xl font-semibold">Alternative Method: Use OAuth Playground with Your Credentials</h4>
                    <div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                        <p class="text-green-800 font-semibold mb-2">Easier Option: Use Google's OAuth Playground</p>
                        <ol class="text-sm text-green-700 space-y-2">
                            <li>1. Go to <a href="https://developers.google.com/oauthplayground" target="_blank" class="underline">OAuth Playground</a></li>
                            <li>2. Click the gear icon (⚙️) in the top right</li>
                            <li>3. Check "Use your own OAuth credentials"</li>
                            <li>4. Enter your Client ID and Client Secret</li>
                            <li>5. In the left panel, find "Drive API v3" and select: <code class="bg-green-100 px-1">https://www.googleapis.com/auth/drive.file</code></li>
                            <li>6. Click "Authorize APIs" and sign in</li>
                            <li>7. Click "Exchange authorization code for tokens"</li>
                            <li>8. Copy the "Refresh token" from the response</li>
                        </ol>
                        <div class="mt-3 p-2 bg-yellow-100 rounded">
                            <p class="text-xs text-yellow-800">
                                <strong>Note:</strong> You must add <code>https://developers.google.com/oauthplayground</code> as an authorized redirect URI in your OAuth client settings first!
                            </p>
                        </div>
                    </div>
                    
                    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p class="text-blue-800 mb-3">
                            Since we can't exchange the authorization code in the browser, you'll need to use a desktop tool or script.
                        </p>
                        <p class="font-medium text-blue-900 mb-2">Option 1: Python Script</p>
                        <pre class="bg-white p-3 rounded text-xs overflow-x-auto"><code>{`import requests

CLIENT_ID = "${credentials.client_id || 'YOUR_CLIENT_ID'}"
CLIENT_SECRET = "${credentials.client_secret || 'YOUR_CLIENT_SECRET'}"
AUTH_CODE = "YOUR_AUTH_CODE"

response = requests.post('https://oauth2.googleapis.com/token', data={
    'code': AUTH_CODE,
    'client_id': CLIENT_ID,
    'client_secret': CLIENT_SECRET,
    'redirect_uri': 'http://localhost',
    'grant_type': 'authorization_code'
})

print(response.json())`}</code></pre>
                        <button 
                            on:click={() => copyToClipboard(`import requests\n\nCLIENT_ID = "${credentials.client_id || 'YOUR_CLIENT_ID'}"\nCLIENT_SECRET = "${credentials.client_secret || 'YOUR_CLIENT_SECRET'}"\nAUTH_CODE = "YOUR_AUTH_CODE"\n\nresponse = requests.post('https://oauth2.googleapis.com/token', data={\n    'code': AUTH_CODE,\n    'client_id': CLIENT_ID,\n    'client_secret': CLIENT_SECRET,\n    'redirect_uri': 'http://localhost',\n    'grant_type': 'authorization_code'\n})\n\nprint(response.json())`, 'pythonScript')}
                            class="mt-2 text-blue-600 hover:text-blue-700 text-sm"
                        >
                            {#if copiedSteps['pythonScript']}
                                ✓ Copied!
                            {:else}
                                📋 Copy Script
                            {/if}
                        </button>
                        
                        <p class="text-sm text-blue-800 mt-4">
                            Run this script with your authorization code to get the refresh token.
                        </p>
                    </div>
                    
                    <div class="mt-6">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Refresh Token</label>
                        <input 
                            type="text"
                            bind:value={credentials.refresh_token}
                            placeholder="Paste your refresh token here"
                            class="w-full border px-3 py-2 rounded"
                        />
                    </div>
                </div>
            {/if}
            
            {#if currentStep === 8}
                <div class="space-y-4">
                    <h4 class="text-xl font-semibold">Step 6: Create Google Drive Folder</h4>
                    <p class="text-gray-600">Finally, let's create a folder for SkyGit files:</p>
                    
                    <ol class="space-y-3">
                        <li class="flex gap-3">
                            <span class="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">1</span>
                            <div>
                                <a href="https://drive.google.com" target="_blank" class="text-blue-600 underline">Open Google Drive</a>
                            </div>
                        </li>
                        <li class="flex gap-3">
                            <span class="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">2</span>
                            <div>Create a new folder named: <code class="bg-gray-100 px-2 py-1 rounded">{getSuggestedFolderName()}</code></div>
                        </li>
                        <li class="flex gap-3">
                            <span class="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">3</span>
                            <div>Open the folder and copy its URL</div>
                        </li>
                    </ol>
                    
                    <div class="mt-4">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Google Drive Folder URL</label>
                        <input 
                            type="text"
                            bind:value={credentials.folder_url}
                            placeholder="https://drive.google.com/drive/folders/..."
                            class="w-full border px-3 py-2 rounded"
                        />
                    </div>
                    
                    {#if credentials.client_id && credentials.client_secret && credentials.refresh_token && credentials.folder_url}
                        <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                            <p class="text-green-800 font-medium">
                                ✅ Great! You have all the required credentials.
                            </p>
                        </div>
                    {/if}
                </div>
            {/if}
        </div>
        
        <div class="sticky bottom-0 bg-white border-t p-4 flex justify-between">
            <button
                on:click={() => currentStep = Math.max(1, currentStep - 1)}
                disabled={currentStep === 1}
                class="px-4 py-2 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                ← Previous
            </button>
            
            <div class="flex gap-2">
                {#each [1, 2, 3, 4, 5, 6, 7, 8] as step}
                    <button
                        on:click={() => currentStep = step}
                        class="w-2 h-2 rounded-full {currentStep >= step ? 'bg-blue-600' : 'bg-gray-300'}"
                    />
                {/each}
            </div>
            
            {#if currentStep < 8}
                <button
                    on:click={() => currentStep = Math.min(8, currentStep + 1)}
                    class="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Next →
                </button>
            {:else}
                <button
                    on:click={handleComplete}
                    disabled={!credentials.client_id || !credentials.client_secret || !credentials.refresh_token || !credentials.folder_url}
                    class="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Complete Setup
                </button>
            {/if}
        </div>
    </div>
</div>
{/if}