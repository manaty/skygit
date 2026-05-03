<script>
    import { GOOGLE_OAUTH_PLAYGROUND_URL } from '../services/googleDriveSetupGuideService.js';

    export let currentStep = 1;
    export let currentAppUrl = '';
    export let copiedSteps = {};
    export let copyToClipboard = () => {};
</script>

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
                        
                        <div class="flex items-center gap-2">
                            <code class="bg-gray-100 px-3 py-1 rounded text-sm">{GOOGLE_OAUTH_PLAYGROUND_URL}</code>
                            <button 
                                on:click={() => copyToClipboard(GOOGLE_OAUTH_PLAYGROUND_URL, 'redirectUri1')}
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
                        
                        <div class="flex items-center gap-2">
                            <code class="bg-gray-100 px-3 py-1 rounded text-sm">{currentAppUrl}</code>
                            <button 
                                on:click={() => copyToClipboard(currentAppUrl, 'redirectUri2')}
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
                                <strong>Note:</strong> We're detecting your app is running at <code>{currentAppUrl}</code>. 
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
