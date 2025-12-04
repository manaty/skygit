<script>
    import { X, ExternalLink, Copy, Check } from "lucide-svelte";
    import { fade, scale } from "svelte/transition";

    export let isOpen = false;
    export let onClose;

    let copied = false;

    function copyScopes() {
        navigator.clipboard.writeText("repo,read:user");
        copied = true;
        setTimeout(() => (copied = false), 2000);
    }
</script>

{#if isOpen}
    <div
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        transition:fade
    >
        <!-- Backdrop -->
        <div
            class="absolute inset-0 bg-black/50 backdrop-blur-sm"
            on:click={onClose}
        ></div>

        <!-- Modal -->
        <div
            class="relative bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 overflow-y-auto max-h-[90vh]"
            in:scale={{ start: 0.95 }}
        >
            <button
                class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                on:click={onClose}
            >
                <X size={24} />
            </button>

            <h2 class="text-2xl font-bold mb-6 text-gray-800">
                How to create a GitHub Token
            </h2>

            <div class="space-y-6 text-gray-600">
                <!-- Step 1 -->
                <div class="flex gap-4">
                    <div
                        class="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold"
                    >
                        1
                    </div>
                    <div>
                        <p class="font-medium text-gray-800 mb-1">
                            Go to Developer Settings
                        </p>
                        <p class="text-sm">
                            Navigate to <a
                                href="https://github.com/settings/tokens"
                                target="_blank"
                                class="text-blue-600 hover:underline inline-flex items-center gap-1"
                            >
                                GitHub Settings <ExternalLink size={12} />
                            </a>
                            and select
                            <strong>Personal access tokens (Classic)</strong>.
                        </p>
                    </div>
                </div>

                <!-- Step 2 -->
                <div class="flex gap-4">
                    <div
                        class="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold"
                    >
                        2
                    </div>
                    <div>
                        <p class="font-medium text-gray-800 mb-1">
                            Generate New Token
                        </p>
                        <p class="text-sm">
                            Click <strong>Generate new token</strong> and select
                            <strong>Generate new token (classic)</strong>.
                        </p>
                    </div>
                </div>

                <!-- Step 3 -->
                <div class="flex gap-4">
                    <div
                        class="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold"
                    >
                        3
                    </div>
                    <div class="flex-1">
                        <p class="font-medium text-gray-800 mb-1">
                            Select Scopes
                        </p>
                        <p class="text-sm mb-2">
                            Give your token a name (e.g., "SkyGit") and check
                            the following permissions:
                        </p>

                        <div
                            class="bg-gray-100 p-3 rounded-lg border border-gray-200 text-sm font-mono flex items-center justify-between group"
                        >
                            <div class="space-y-1">
                                <div class="flex items-center gap-2">
                                    <span class="text-green-600">✓</span>
                                    <span>repo</span>
                                </div>
                                <div class="flex items-center gap-2">
                                    <span class="text-green-600">✓</span>
                                    <span>read:user</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Step 4 -->
                <div class="flex gap-4">
                    <div
                        class="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold"
                    >
                        4
                    </div>
                    <div>
                        <p class="font-medium text-gray-800 mb-1">
                            Copy & Paste
                        </p>
                        <p class="text-sm">
                            Scroll to the bottom, click <strong
                                >Generate token</strong
                            >, and copy the token (starts with
                            <code>ghp_</code>). Paste it into the login field.
                        </p>
                    </div>
                </div>
            </div>

            <div class="mt-8 pt-6 border-t flex justify-end">
                <button
                    class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    on:click={onClose}
                >
                    Got it
                </button>
            </div>
        </div>
    </div>
{/if}
