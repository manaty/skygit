<script>
    import { createEventDispatcher } from 'svelte';
    import { authStore } from '../stores/authStore.js';
    import { get } from 'svelte/store';
    import GoogleDriveSetupCloudConfigSteps from './GoogleDriveSetupCloudConfigSteps.svelte';
    import GoogleDriveSetupCredentialSteps from './GoogleDriveSetupCredentialSteps.svelte';
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

    function handleCredentialsChange(nextCredentials) {
        credentials = nextCredentials;
    }
</script>

{#if show}
<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <GoogleDriveSetupHeader onClose={handleClose} />
        
        <div class="p-6">
            <GoogleDriveSetupIntroSteps {currentStep} {copiedSteps} {copyToClipboard} />
            <GoogleDriveSetupCloudConfigSteps {currentStep} {currentAppUrl} {copiedSteps} {copyToClipboard} />
            <GoogleDriveSetupCredentialSteps
                {currentStep}
                {credentials}
                {copiedSteps}
                {authorizationUrl}
                {tokenExchangeScript}
                {setupComplete}
                suggestedFolderName={getSuggestedFolderName()}
                {copyToClipboard}
                onStepChange={goToStep}
                onCredentialsChange={handleCredentialsChange}
            />
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
