<script>
    export let search = "";
    
import {
        conversations,
        selectedConversation,
    } from "../stores/conversationStore.js";
    import { presencePolling } from "../stores/presenceControlStore.js";
    import { currentContent, currentRoute } from "../stores/routeStore.js";
    import { get } from "svelte/store";

    let convoMap = {};
    let pollingMap = {};
    let previousSearch = "";
    let selectedOrg = "all";
    let selectedRepo = "all";
    let previousOrg = "all";

    conversations.subscribe((value) => (convoMap = value));
    presencePolling.subscribe((m) => (pollingMap = m));

    function openConversation(convo) {
        currentContent.set(convo);
        selectedConversation.set(convo);
        currentRoute.set("chats");
    }

    const orgFromRepo = (repo) => (repo?.includes("/") ? repo.split("/")[0] : repo || "");

    // Flatten all conversations and sort by updatedAt (newest first)
    $: allConversations = Object.values(convoMap)
        .flat()
        .sort((a, b) => {
            const aTime = new Date(a.updatedAt || a.createdAt || 0).getTime();
            const bTime = new Date(b.updatedAt || b.createdAt || 0).getTime();
            return bTime - aTime;
        });

    // Available organizations and repos for filtering
    $: orgOptions = [
        "all",
        ...Array.from(
            new Set(
                allConversations
                    .map((convo) => orgFromRepo(convo.repo))
                    .filter((org) => org && org.trim() !== "")
            )
        )
    ];

    $: repoOptions = [
        "all",
        ...Array.from(
            new Set(
                allConversations
                    .filter((convo) => selectedOrg === "all" || orgFromRepo(convo.repo) === selectedOrg)
                    .map((convo) => convo.repo)
                    .filter((repo) => repo && repo.trim() !== "")
            )
        )
    ];

    // Keep selected repo valid when org selection changes
    $: {
        if (selectedOrg !== previousOrg) {
            selectedRepo = "all";
            previousOrg = selectedOrg;
        }

        if (!repoOptions.includes(selectedRepo)) {
            selectedRepo = "all";
        }
    }

    // Apply organization/repository filters
    $: scopedConversations = allConversations.filter((convo) => {
        const org = orgFromRepo(convo.repo);
        if (selectedOrg !== "all" && org !== selectedOrg) return false;
        if (selectedRepo !== "all" && convo.repo !== selectedRepo) return false;
        return true;
    });

    // Filter conversations based on search query
    $: filteredConversations = scopedConversations.filter((convo) => {
        if (!search || search.trim() === "") return true;
        
        const query = search.toLowerCase();
        const title = (convo.title || `Conversation ${convo.id.slice(0, 6)}`).toLowerCase();
        const repo = convo.repo.toLowerCase();
        const fullName = `${repo}/${title}`;
        
        return title.includes(query) || repo.includes(query) || fullName.includes(query);
    });

    // Clear selection if it no longer matches active filters
    $: {
        const currentSelection = get(selectedConversation);
        if (currentSelection && !filteredConversations.some((c) => c.id === currentSelection.id)) {
            selectedConversation.set(null);
            const currentContentValue = get(currentContent);
            if (currentContentValue && currentContentValue.id === currentSelection.id) {
                currentContent.set(null);
            }
        }
    }

    // Handle selection based on search results
    $: {
        // When search changes
        if (search !== previousSearch) {
            if (previousSearch === "" && search.trim() !== "") {
                // When starting a new search, clear selection first
                selectedConversation.set(null);
                currentContent.set(null);
            }
            
            // After filtering is done, if there's only one result, auto-select it
            if (search.trim() !== "" && filteredConversations.length === 1) {
                // Small delay to ensure UI updates properly
                setTimeout(() => {
                    const onlyConvo = filteredConversations[0];
                    selectedConversation.set(onlyConvo);
                    currentContent.set(onlyConvo);
                }, 50);
            }
            
            previousSearch = search;
        }
    }
</script>

<!-- Filters -->
<div class="mt-2 space-y-2">
    <div class="px-3 flex flex-col gap-2">
        <label class="text-xs text-gray-500">
            Organization
            <select
                bind:value={selectedOrg}
                class="mt-1 w-full border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
            >
                {#each orgOptions as org}
                    <option value={org}>{org === "all" ? "All organizations" : org}</option>
                {/each}
            </select>
        </label>
        <label class="text-xs text-gray-500">
            Repository
            <select
                bind:value={selectedRepo}
                class="mt-1 w-full border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
            >
                {#each repoOptions as repo}
                    <option value={repo}>{repo === "all" ? "All repositories" : repo}</option>
                {/each}
            </select>
        </label>
    </div>

    <!-- Chat List -->
    <div class="flex flex-col gap-1">
    {#each filteredConversations as convo (convo.id)}
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

    {#if filteredConversations.length === 0}
        <p class="text-xs text-gray-400 italic px-3 py-4">
            {#if allConversations.length === 0}
                No conversations yet.
            {:else}
                No conversations match "{search}".
            {/if}
        </p>
    {/if}
    </div>
</div>
