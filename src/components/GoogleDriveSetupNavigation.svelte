<script>
    import { GOOGLE_DRIVE_SETUP_STEPS } from '../services/googleDriveSetupGuideService.js';

    export let currentStep = GOOGLE_DRIVE_SETUP_STEPS[0];
    export let setupComplete = false;
    export let onPrevious = () => {};
    export let onNext = () => {};
    export let onStepChange = () => {};
    export let onComplete = () => {};
</script>

<div class="sticky bottom-0 bg-white border-t p-4 flex justify-between">
    <button
        on:click={onPrevious}
        disabled={currentStep === GOOGLE_DRIVE_SETUP_STEPS[0]}
        class="px-4 py-2 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
    >
        ← Previous
    </button>
    
    <div class="flex gap-2">
        {#each GOOGLE_DRIVE_SETUP_STEPS as step}
            <button
                type="button"
                on:click={() => onStepChange(step)}
                class="w-2 h-2 rounded-full {currentStep >= step ? 'bg-blue-600' : 'bg-gray-300'}"
                aria-label="Go to Google Drive setup step {step}"
            ></button>
        {/each}
    </div>
    
    {#if currentStep < GOOGLE_DRIVE_SETUP_STEPS[GOOGLE_DRIVE_SETUP_STEPS.length - 1]}
        <button
            on:click={onNext}
            class="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
        >
            Next →
        </button>
    {:else}
        <button
            on:click={onComplete}
            disabled={!setupComplete}
            class="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            Complete Setup
        </button>
    {/if}
</div>
