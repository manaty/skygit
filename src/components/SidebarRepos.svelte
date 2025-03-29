<script>
    export let search = "";

    import { repoList, filteredCount, selectedRepo } from "../stores/repoStore.js";
    import { syncState } from "../stores/syncStateStore.js";
    import {
        cancelDiscovery,
        discoverAllRepos,
    } from "../services/githubRepoDiscovery.js";
    import {
        deleteRepoFromGitHub,
        streamPersistedReposFromGitHub,
    } from "../services/githubApi.js";
    import { Trash2, Loader2 } from "lucide-svelte";

    let repos = [];
    let state;

    // Filter checkboxes
    let showPrivate = true;
    let showPublic = true;
    let showWithMessages = true;
    let showWithoutMessages = true;

    repoList.subscribe((value) => (repos = value));
    syncState.subscribe((s) => (state = s));

    function toggleStreamPause() {
        syncState.update((s) => ({ ...s, paused: !s.paused }));
    }

    function toggleDiscoveryPause() {
        if (state.paused) {
            syncState.update((s) => ({ ...s, paused: false }));
            const token = localStorage.getItem("skygit_token");
            if (token) discoverAllRepos(token);
        } else {
            cancelDiscovery();
            syncState.update((s) => ({ ...s, paused: true }));
        }
    }

    async function removeRepo(fullName) {
        const repo = repos.find((r) => r.full_name === fullName);
        if (!repo) return;

        // Update local store
        repoList.update((list) => list.filter((r) => r.full_name !== fullName));

        // Delete from GitHub
        try {
            const token = localStorage.getItem("skygit_token");
            await deleteRepoFromGitHub(token, repo);
            console.log(`[SkyGit] Deleted ${fullName} from GitHub`);
        } catch (e) {
            console.warn(
                `[SkyGit] Failed to delete ${fullName} from GitHub:`,
                e,
            );
        }
    }
    
    async function triggerSync() {
        const token = localStorage.getItem("skygit_token");
        if (token) {
            syncState.update((s) => ({
                ...s,
                phase: "streaming",
                paused: false,
                loadedCount: 0,
            }));
            await streamPersistedReposFromGitHub(token);
        }
    }

    async function triggerDiscovery() {
        const token = localStorage.getItem("skygit_token");
        if (token) {
            syncState.update((s) => ({
                ...s,
                phase: "discovery",
                paused: false,
            }));
            discoverAllRepos(token);
        }
    }


    function showRepo(repo) {
        selectedRepo.set(repo);
    }

    // filteredRepos logic
    $: filteredRepos = repos.filter((repo) => {
        const q = search.toLowerCase();

        const matchesSearch =
            repo.full_name.toLowerCase().includes(q) ||
            repo.name.toLowerCase().includes(q) ||
            repo.owner.toLowerCase().includes(q);

        const matchesPrivacy =
            (repo.private && showPrivate) || (!repo.private && showPublic);

        const matchesMessages =
            (repo.has_messages && showWithMessages) ||
            (!repo.has_messages && showWithoutMessages);

        return matchesSearch && matchesPrivacy && matchesMessages;
    });

    // ✅ Update badge count reactively
    $: filteredCount.set(filteredRepos.length);
</script>

<!-- STREAMING PHASE -->
{#if state.phase === "streaming"}
    <div class="flex items-center justify-between mb-3 text-sm text-gray-500">
        <div class="flex items-center gap-2">
            <Loader2 class="w-4 h-4 animate-spin text-blue-500" />
            <span>
                Syncing: {state.loadedCount}/{state.totalCount ?? "?"}
            </span>
        </div>
        <button
            on:click={toggleStreamPause}
            class="text-blue-600 text-xs underline"
        >
            {state.paused ? "Resume Syncing" : "Pause Syncing"}
        </button>
    </div>

    <!-- DISCOVERY PHASE -->
{:else if state.phase === "discovery"}
    <div class="flex justify-end mb-3">
        <Loader2 class="w-4 h-4 animate-spin text-blue-500" />
        <span>
            Discov.: {state.loadedCount}/{state.totalCount ?? "?"}
        </span>
        <button
            on:click={toggleDiscoveryPause}
            class="text-blue-600 text-xs underline"
        >
            {state.paused ? "Resume Discovery" : "Pause Discovery"}
        </button>
    </div>

    <!-- IDLE PHASE -->
    {:else if state.phase === "idle"}
    <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 mb-3">
      <div class="text-xs text-gray-400">✔️ Discovery complete</div>
      <div class="flex gap-2">
        <button
          on:click={triggerSync}
          class="text-blue-600 text-xs underline"
        >
          🔄 Sync
        </button>
        <button
          on:click={triggerDiscovery}
          class="text-blue-600 text-xs underline"
        >
          🔍 Discover
        </button>
      </div>
    </div>
{/if}

<!-- Filters -->
<div class="flex flex-wrap gap-3 text-xs text-gray-700 mb-3">
    <label
        ><input type="checkbox" bind:checked={showPrivate} /> 🔒 Private</label
    >
    <label><input type="checkbox" bind:checked={showPublic} /> 🌐 Public</label>
    <label
        ><input type="checkbox" bind:checked={showWithMessages} /> 💬 With Messages</label
    >
    <label
        ><input type="checkbox" bind:checked={showWithoutMessages} /> No Messages</label
    >
</div>

<!-- Repo List -->
{#if filteredRepos.length > 0}
    <ul class="space-y-2">
        {#each filteredRepos as repo (repo.full_name)}
            <li
                class="flex items-center justify-between bg-gray-100 px-3 py-2 rounded"
            >
                <div class="text-sm truncate">
                    <button   class="font-medium text-blue-700 hover:underline cursor-pointer"
                        on:click={() => showRepo(repo)}
                        >
                        {repo.full_name}
                </button>
                    <p class="text-xs text-gray-500">
                        {repo.private ? "🔒 Private" : "🌐 Public"}
                        {repo.has_messages
                            ? " | 💬 .messages"
                            : " | no messaging"}
                    </p>
                </div>
                <button
                    on:click={() => removeRepo(repo.full_name)}
                    aria-label="Remove repo"
                >
                    <Trash2 class="w-4 h-4 text-red-500 hover:text-red-700" />
                </button>
            </li>
        {/each}
    </ul>
{:else}
    <p class="text-sm text-gray-400 italic mt-2">
        No matching repositories found.
    </p>
{/if}
