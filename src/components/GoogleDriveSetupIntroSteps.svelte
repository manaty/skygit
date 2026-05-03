<script>
    export let currentStep = 1;
    export let copiedSteps = {};
    export let copyToClipboard = () => {};
</script>

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
