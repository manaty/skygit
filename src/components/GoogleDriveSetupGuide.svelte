<script>
    import { createEventDispatcher } from 'svelte';
    import { authStore } from '../stores/authStore.js';
    import { get } from 'svelte/store';
    import GoogleDriveSetupCloudConfigSteps from './GoogleDriveSetupCloudConfigSteps.svelte';
    import GoogleDriveSetupHeader from './GoogleDriveSetupHeader.svelte';
    import GoogleDriveSetupIntroSteps from './GoogleDriveSetupIntroSteps.svelte';
    import GoogleDriveSetupNavigation from './GoogleDriveSetupNavigation.svelte';
    import {
        GOOGLE_DRIVE_SETUP_STEPS,
        buildGoogleDriveAuthorizationUrl,
        buildGoogleDriveTokenExchangeScript,
        createInitialGoogleDriveCredentials,
        getAppBaseUrl,
        getSuggestedGoogleDriveFolderName,
        isGoogleDriveSetupComplete
    } from '../services/googleDriveSetupGuideService.js';
    
    export let show = false;
    
    const dispatch = createEventDispatcher();
    
    let currentStep = GOOGLE_DRIVE_SETUP_STEPS[0];
    let copiedSteps = {};
    let credentials = createInitialGoogleDriveCredentials();
    $: currentAppUrl = getCurrentAppUrl();
    $: authorizationUrl = buildGoogleDriveAuthorizationUrl({
        clientId: credentials.client_id,
        redirectUri: currentAppUrl
    });
    $: tokenExchangeScript = buildGoogleDriveTokenExchangeScript({
        clientId: credentials.client_id,
        clientSecret: credentials.client_secret
    });
    $: setupComplete = isGoogleDriveSetupComplete(credentials);
    
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
        return getSuggestedGoogleDriveFolderName(auth);
    }
    
    function getCurrentAppUrl() {
        return getAppBaseUrl(window.location);
    }
    
    function handleComplete() {
        dispatch('complete', credentials);
    }
    
    function handleClose() {
        dispatch('close');
    }

    function goToPreviousStep() {
        currentStep = Math.max(GOOGLE_DRIVE_SETUP_STEPS[0], currentStep - 1);
    }

    function goToNextStep() {
        currentStep = Math.min(GOOGLE_DRIVE_SETUP_STEPS[GOOGLE_DRIVE_SETUP_STEPS.length - 1], currentStep + 1);
    }

    function goToStep(step) {
        currentStep = step;
    }
</script>

{#if show}
<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <GoogleDriveSetupHeader onClose={handleClose} />
        
        <div class="p-6">
            <GoogleDriveSetupIntroSteps {currentStep} {copiedSteps} {copyToClipboard} />
            <GoogleDriveSetupCloudConfigSteps {currentStep} {currentAppUrl} {copiedSteps} {copyToClipboard} />
            
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
                            <label for="google-client-id" class="block text-sm font-medium text-gray-700 mb-1">Client ID</label>
                            <input 
                                id="google-client-id"
                                type="text"
                                bind:value={credentials.client_id}
                                placeholder="Paste your Client ID here"
                                class="w-full border px-3 py-2 rounded"
                            />
                        </div>
                        
                        <div>
                            <label for="google-client-secret" class="block text-sm font-medium text-gray-700 mb-1">Client Secret</label>
                            <input 
                                id="google-client-secret"
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
                                    {authorizationUrl}
                                </div>
                                <button 
                                    on:click={() => copyToClipboard(authorizationUrl, 'authUrl1')}
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
                            <label for="google-authorization-code" class="block text-sm font-medium text-gray-700 mb-1">Authorization Code</label>
                            <textarea 
                                id="google-authorization-code"
                                placeholder="Paste the code from the URL here"
                                class="w-full border px-3 py-2 rounded font-mono text-sm"
                                rows="3"
                            ></textarea>
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
                            <li>1. Go to <a href={GOOGLE_OAUTH_PLAYGROUND_URL} target="_blank" class="underline">OAuth Playground</a></li>
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
                        <pre class="bg-white p-3 rounded text-xs overflow-x-auto"><code>{tokenExchangeScript}</code></pre>
                        <button 
                            on:click={() => copyToClipboard(tokenExchangeScript, 'pythonScript')}
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
                        <label for="google-refresh-token" class="block text-sm font-medium text-gray-700 mb-1">Refresh Token</label>
                        <input 
                            id="google-refresh-token"
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
                        <label for="google-drive-folder-url" class="block text-sm font-medium text-gray-700 mb-1">Google Drive Folder URL</label>
                        <input 
                            id="google-drive-folder-url"
                            type="text"
                            bind:value={credentials.folder_url}
                            placeholder="https://drive.google.com/drive/folders/..."
                            class="w-full border px-3 py-2 rounded"
                        />
                    </div>
                    
                    {#if setupComplete}
                        <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                            <p class="text-green-800 font-medium">
                                ✅ Great! You have all the required credentials.
                            </p>
                        </div>
                    {/if}
                </div>
            {/if}
        </div>
        
        <GoogleDriveSetupNavigation
            {currentStep}
            {setupComplete}
            onPrevious={goToPreviousStep}
            onNext={goToNextStep}
            onStepChange={goToStep}
            onComplete={handleComplete}
        />
    </div>
</div>
{/if}
