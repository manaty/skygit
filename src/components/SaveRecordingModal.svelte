<script>
    import { createEventDispatcher } from "svelte";
    import { fade, scale } from "svelte/transition";
    import {
        Upload,
        Download,
        X,
        FileVideo,
        Check,
        AlertCircle,
    } from "lucide-svelte";
    import { authStore } from "../stores/authStore.js";
    import { selectedConversation } from "../stores/conversationStore.js";
    import { getRepoByFullName } from "../stores/repoStore.js";
    import { uploadFile } from "../services/fileUploadService.js";
    import { recorder } from "../services/recorderService.js";

    export let isOpen = false;
    export let blob = null;
    export let onClose;

    let uploading = false;
    let uploadSuccess = false;
    let error = null;
    let fileName = `recording-${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.webm`;

    // Get current repo config
    $: repo = $selectedConversation
        ? getRepoByFullName($selectedConversation.repo)
        : null;
    $: storageType = repo?.config?.binary_storage_type;
    $: hasCloudStorage = storageType === "s3" || storageType === "google_drive";

    let storageUrl = "";
    $: if (repo?.config?.storage_info?.url) {
        storageUrl = repo.config.storage_info.url;
    }

    async function handleDownload() {
        recorder.downloadRecording(blob, fileName);
        onClose();
    }

    async function handleUpload() {
        if (!blob || !repo) return;
        uploading = true;
        error = null;

        try {
            const file = new File([blob], fileName, { type: "video/webm" });
            const token = $authStore.token;

            // Upload
            const result = await uploadFile(file, repo, token, storageUrl);

            uploadSuccess = true;
            setTimeout(() => {
                onClose();
                uploadSuccess = false; // reset for next time
            }, 2000);
        } catch (err) {
            console.error("Upload failed:", err);
            error = err.message;
        } finally {
            uploading = false;
        }
    }
</script>

{#if isOpen}
    <div
        class="fixed inset-0 z-[60] flex items-center justify-center p-4"
        transition:fade
    >
        <div
            class="absolute inset-0 bg-black/60 backdrop-blur-sm"
            on:click={onClose}
        ></div>

        <div
            class="relative bg-white rounded-xl shadow-2xl max-w-md w-full p-6 overflow-hidden"
            in:scale={{ start: 0.95 }}
        >
            <button
                class="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                on:click={onClose}
            >
                <X size={24} />
            </button>

            <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
                <FileVideo class="text-blue-600" />
                Save Recording
            </h2>

            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1"
                        >Filename</label
                    >
                    <input
                        type="text"
                        bind:value={fileName}
                        class="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>

                {#if hasCloudStorage}
                    <div
                        class="bg-blue-50 p-3 rounded-lg border border-blue-100"
                    >
                        <p class="text-sm text-blue-800 font-medium mb-2">
                            Cloud Storage Detected
                        </p>
                        <div class="text-xs text-blue-600 mb-2">
                            Repository is linked to <strong class="uppercase"
                                >{storageType.replace("_", " ")}</strong
                            >.
                        </div>

                        <label
                            class="block text-xs font-medium text-blue-800 mb-1"
                            >Destination Location</label
                        >
                        <input
                            type="text"
                            bind:value={storageUrl}
                            class="w-full border border-blue-200 rounded px-2 py-1 text-xs bg-white text-gray-700 focus:ring-1 focus:ring-blue-500 outline-none"
                        />
                        <p class="text-[10px] text-blue-500 mt-1">
                            {#if storageType === "google_drive"}
                                Paste a Google Drive Folder URL to save
                                elsewhere.
                            {:else}
                                Edit the S3 URL (s3://bucket/prefix) to change
                                folder.
                            {/if}
                        </p>
                    </div>
                {:else}
                    <div
                        class="bg-gray-50 p-3 rounded-lg border border-gray-200"
                    >
                        <p class="text-sm text-gray-600">
                            No cloud storage configured for this repository. You
                            can only download the file locally.
                        </p>
                    </div>
                {/if}

                {#if error}
                    <div
                        class="bg-red-50 p-3 rounded-lg border border-red-100 flex items-start gap-2 text-red-700 text-sm"
                    >
                        <AlertCircle size={16} class="mt-0.5 shrink-0" />
                        <span>{error}</span>
                    </div>
                {/if}

                <div class="grid grid-cols-2 gap-3 mt-6">
                    <button
                        class="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition-colors"
                        on:click={handleDownload}
                    >
                        <Download size={18} />
                        Download
                    </button>

                    <button
                        class="flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors text-white
                {hasCloudStorage
                            ? 'bg-blue-600 hover:bg-blue-700'
                            : 'bg-gray-300 cursor-not-allowed'}"
                        disabled={!hasCloudStorage ||
                            uploading ||
                            uploadSuccess}
                        on:click={handleUpload}
                    >
                        {#if uploading}
                            <span
                                class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"
                            ></span>
                            Uploading...
                        {:else if uploadSuccess}
                            <Check size={18} />
                            Saved!
                        {:else}
                            <Upload size={18} />
                            Save to Cloud
                        {/if}
                    </button>
                </div>
            </div>
        </div>
    </div>
{/if}
