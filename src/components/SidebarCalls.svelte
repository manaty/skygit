<script>
    import { onMount } from "svelte";
    import { authStore } from "../stores/authStore.js";
    import { getCallHistory } from "../services/callHistoryService.js";
    import {
        Phone,
        PhoneIncoming,
        PhoneOutgoing,
        PhoneMissed,
        Video,
        Clock,
        User,
    } from "lucide-svelte";

    let calls = [];
    let loading = true;
    let error = null;

    onMount(async () => {
        await fetchCallHistory();
    });

    async function fetchCallHistory() {
        loading = true;
        error = null;

        const auth = $authStore;
        if (!auth?.token || !auth?.user?.login) {
            loading = false;
            return;
        }

        try {
            calls = await getCallHistory(auth.token, auth.user.login);
        } catch (err) {
            console.error("[SidebarCalls] Failed to fetch call history:", err);
            error = "Failed to load call history";
        } finally {
            loading = false;
        }
    }

    function formatDuration(seconds) {
        if (!seconds || seconds === 0) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;

        // Less than 24 hours
        if (diff < 86400000) {
            return date.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            });
        }
        // Less than 7 days
        if (diff < 604800000) {
            return date.toLocaleDateString([], {
                weekday: "short",
                hour: "2-digit",
                minute: "2-digit",
            });
        }
        // Older
        return date.toLocaleDateString([], {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    }

    function getDirectionIcon(direction) {
        switch (direction) {
            case "incoming":
                return PhoneIncoming;
            case "outgoing":
                return PhoneOutgoing;
            case "missed":
                return PhoneMissed;
            default:
                return Phone;
        }
    }

    function getDirectionColor(direction) {
        switch (direction) {
            case "incoming":
                return "text-green-600";
            case "outgoing":
                return "text-blue-600";
            case "missed":
                return "text-red-600";
            default:
                return "text-gray-600";
        }
    }
</script>

<div class="p-4">
    <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Phone size={20} class="text-blue-600" />
            Call History
        </h2>
        <button
            class="text-sm text-blue-600 hover:text-blue-800"
            on:click={fetchCallHistory}
        >
            Refresh
        </button>
    </div>

    {#if loading}
        <div class="flex items-center justify-center py-8">
            <div
                class="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full"
            ></div>
        </div>
    {:else if error}
        <div class="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
            {error}
        </div>
    {:else if calls.length === 0}
        <div class="text-center py-8 text-gray-500">
            <Phone size={48} class="mx-auto mb-3 opacity-30" />
            <p class="text-sm">No calls yet</p>
            <p class="text-xs mt-1">Your call history will appear here</p>
        </div>
    {:else}
        <div class="space-y-2">
            {#each calls as call (call.id)}
                <div
                    class="bg-white border rounded-lg p-3 hover:bg-gray-50 transition-colors"
                >
                    <div class="flex items-start gap-3">
                        <!-- Direction Icon -->
                        <div class="flex-shrink-0 mt-1">
                            <svelte:component
                                this={getDirectionIcon(call.direction)}
                                size={18}
                                class={getDirectionColor(call.direction)}
                            />
                        </div>

                        <!-- Call Info -->
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-2">
                                <span
                                    class="font-medium text-gray-800 truncate"
                                >
                                    {call.remotePeer}
                                </span>
                                {#if call.type === "video"}
                                    <Video size={14} class="text-gray-400" />
                                {/if}
                            </div>

                            <div
                                class="flex items-center gap-2 text-xs text-gray-500 mt-1"
                            >
                                <span>{formatDate(call.startTime)}</span>
                                {#if call.duration > 0}
                                    <span>•</span>
                                    <span class="flex items-center gap-1">
                                        <Clock size={10} />
                                        {formatDuration(call.duration)}
                                    </span>
                                {/if}
                            </div>

                            {#if call.repoContext}
                                <div
                                    class="text-xs text-gray-400 mt-1 truncate"
                                >
                                    {call.repoContext}
                                </div>
                            {/if}
                        </div>

                        <!-- Recording Link -->
                        {#if call.recordingUrl}
                            <a
                                href={call.recordingUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                class="text-xs text-blue-600 hover:underline"
                            >
                                Recording
                            </a>
                        {/if}
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</div>
