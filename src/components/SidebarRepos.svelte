<script>
    export let search = "";

    import { repoList, filteredCount, selectedRepo } from "../stores/repoStore.js";
    import { currentContent } from "../stores/routeStore.js";
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
    let container;

    // Filter checkboxes
    let showPrivate = true;
    let showPublic = true;
    let showWithMessages = true;
    let showWithoutMessages = true;
    
    // Organization filter
    let selectedOrg = "all";
    let collapsedOrgs = new Set();

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
        currentContent.set(repo);
    }
    
    function toggleOrgCollapse(org) {
        if (collapsedOrgs.has(org)) {
            collapsedOrgs.delete(org);
        } else {
            collapsedOrgs.add(org);
        }
        collapsedOrgs = collapsedOrgs; // Trigger reactivity
    }
    
    function toggleAllOrgs() {
        const orgs = Object.keys(groupedRepos);
        // If any org is expanded, collapse all. Otherwise, expand all.
        const hasExpanded = orgs.some(org => !collapsedOrgs.has(org));
        
        if (hasExpanded) {
            // Collapse all
            orgs.forEach(org => collapsedOrgs.add(org));
        } else {
            // Expand all
            collapsedOrgs.clear();
        }
        collapsedOrgs = collapsedOrgs; // Trigger reactivity
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
            
        const matchesOrg = selectedOrg === "all" || repo.owner === selectedOrg;

        return matchesSearch && matchesPrivacy && matchesMessages && matchesOrg;
    });

    // ✅ Update badge count reactively
    $: filteredCount.set(filteredRepos.length);
    
    // Get unique organizations from all repos
    $: organizations = [...new Set(repos.map(r => r.owner))].sort();
    
    // Group filtered repos by organization
    $: groupedRepos = filteredRepos.reduce((groups, repo) => {
        const org = repo.owner;
        if (!groups[org]) {
            groups[org] = [];
        }
        groups[org].push(repo);
        return groups;
    }, {});
    
    // Get organization repo counts (for display during discovery)
    $: orgCounts = repos.reduce((counts, repo) => {
        counts[repo.owner] = (counts[repo.owner] || 0) + 1;
        return counts;
    }, {});
    
    // Check if all orgs are collapsed
    $: allCollapsed = Object.keys(groupedRepos).length > 0 && 
                      Object.keys(groupedRepos).every(org => collapsedOrgs.has(org));

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

<!-- Organization Filter Dropdown -->
{#if organizations.length > 1}
<div class="mb-3 flex gap-2">
    <button
        on:click={toggleAllOrgs}
        class="p-1.5 border border-gray-300 rounded hover:bg-gray-50 flex items-center justify-center"
        title={allCollapsed ? "Expand all organizations" : "Collapse all organizations"}
    >
        {#if allCollapsed}
            <!-- Expand icon -->
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
        {:else}
            <!-- Collapse icon -->
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
            </svg>
        {/if}
    </button>
    
    <select 
        bind:value={selectedOrg}
        class="flex-1 text-sm border border-gray-300 rounded px-2 py-1 bg-white"
    >
        <option value="all">All organizations ({repos.length})</option>
        {#each organizations as org}
            <option value={org}>{org} ({orgCounts[org] || 0})</option>
        {/each}
    </select>
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

<!-- Repo List Grouped by Organization -->
{#if filteredRepos.length > 0}
    <div class="space-y-2">
        {#each Object.entries(groupedRepos).sort((a, b) => a[0].localeCompare(b[0])) as [org, orgRepos]}
            <div class="border border-gray-200 rounded-lg overflow-hidden">
                <!-- Organization Header -->
                <button
                    class="w-full px-3 py-2 bg-gray-50 hover:bg-gray-100 flex items-center justify-between text-left transition-colors"
                    on:click={() => toggleOrgCollapse(org)}
                >
                    <div class="flex items-center gap-2">
                        <svg 
                            class="w-4 h-4 text-gray-500 transition-transform {collapsedOrgs.has(org) ? '' : 'rotate-90'}"
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                        </svg>
                        <span class="font-medium text-sm">{org}</span>
                        <span class="text-xs text-gray-500">({orgRepos.length} of {orgCounts[org] || 0})</span>
                    </div>
                </button>
                
                <!-- Repository List -->
                {#if !collapsedOrgs.has(org)}
                    <div class="bg-white">
                        {#each orgRepos as repo (repo.full_name)}
                            <div
                                class="flex items-center justify-between px-3 py-2 hover:bg-blue-50 border-t border-gray-100"
                            >
                                <div class="text-sm truncate flex-1">
                                    <button
                                        class="font-medium text-blue-700 hover:underline cursor-pointer"
                                        on:click={() => showRepo(repo)}
                                    >
                                        {repo.name}
                                    </button>
                                    <span class="text-xs text-gray-500 ml-1">
                                        {repo.private ? "🔒" : "🌐"}
                                        {repo.has_messages ? "💬" : ""}
                                    </span>
                                </div>
                                <button
                                    on:click={() => removeRepo(repo.full_name)}
                                    aria-label="Remove repo"
                                    class="opacity-0 hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 class="w-4 h-4 text-red-500 hover:text-red-700" />
                                </button>
                            </div>
                        {/each}
                    </div>
                {/if}
            </div>
        {/each}
    </div>
{:else}
    <p class="text-sm text-gray-400 italic mt-2">
        No matching repositories found.
    </p>
{/if}

