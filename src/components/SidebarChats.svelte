<script>
import {
    conversations,
    selectedConversation,
} from "../stores/conversationStore.js";
import { presencePolling } from "../stores/presenceControlStore.js";
    import { currentContent, currentRoute } from "../stores/routeStore.js";

    let convoMap = {};
    let pollingMap = {};
    conversations.subscribe((value) => (convoMap = value));
    presencePolling.subscribe((m) => (pollingMap = m));

    function openConversation(convo) {
        currentContent.set(convo);
        selectedConversation.set(convo);
        currentRoute.set("chats");
    }

    // Flatten all conversations and sort by updatedAt (newest first)
    $: allConversations = Object.values(convoMap)
        .flat()
        .sort((a, b) => {
            const aTime = new Date(a.updatedAt || a.createdAt || 0).getTime();
            const bTime = new Date(b.updatedAt || b.createdAt || 0).getTime();
            return bTime - aTime;
        });
</script>

<!-- Chat List -->
<div class="flex flex-col gap-1 mt-2">
    {#each allConversations as convo (convo.id)}
        {#key `${convo.id}-${pollingMap[convo.repo]}`}
        <button
            class="px-3 py-2 hover:bg-blue-50 rounded cursor-pointer text-left flex gap-2 items-start"
            on:click={() => openConversation(convo)}
        >
            {#if pollingMap[convo.repo] === false}
                <!-- Presence paused -->
                <span title="Presence paused" class="mt-0.5">⏸️</span>
            {:else}
                <span title="Presence active" class="mt-0.5">▶️</span>
            {/if}
            <div class="flex-1">
                <p class="text-sm font-medium truncate">
                    {convo.title || `Conversation ${convo.id.slice(0, 6)}`}
                </p>
            <p class="text-xs text-gray-500 truncate">{convo.repo}</p>

            {#if convo.messages && convo.messages.length > 0}
                <p class="text-xs text-gray-400 italic truncate mt-1">
                    {convo.messages.at(-1).content}
                </p>
            {:else}
                <p class="text-xs text-gray-300 italic mt-1">
                    No messages yet.
                </p>
            {/if}
            </div>
        </button>
        {/key}
    {/each}

    {#if allConversations.length === 0}
        <p class="text-xs text-gray-400 italic px-3 py-4">
            No conversations yet.
        </p>
    {/if}
</div>
