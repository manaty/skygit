<script>
    export let search = "";

    import { repoList, filteredCount, selectedRepo } from "../stores/repoStore.js";
    import { currentContent } from "../stores/routeStore.js";
    import { syncState } from "../stores/syncStateStore.js";
    import {
        cancelDiscovery,
        discoverAllRepos,
        discoverOrganizations,
        discoverReposForOrg,
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

    async function discoverOrgs() {
        const token = localStorage.getItem("skygit_token");
        if (!token) return;
        await discoverOrganizations(token);
    }

    async function discoverOrgRepos(orgId) {
        const token = localStorage.getItem("skygit_token");
        if (!token) return;
        await discoverReposForOrg(token, orgId);
    }

    async function runFullDiscovery() {
        const token = localStorage.getItem("skygit_token");
        if (!token) return;
        await discoverAllRepos(token);
    }

    function cancelRepoScan() {
        cancelDiscovery();
    }

    function labelForOrg(id) {
        const match = state?.organizations?.find((org) => org.id === id);
        return match ? match.label : id;
    }

    function pauseSyncing() {
        syncState.update((s) => ({ ...s, paused: true }));
    }

    async function resumeSyncing() {
        const token = localStorage.getItem("skygit_token");
        if (!token) return;
        await streamPersistedReposFromGitHub(token);
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

<!-- Actions -->
<div class="mb-3 space-y-2">
    <div class="flex flex-col gap-2">
        <button
            class="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-2 rounded"
            on:click={triggerSync}
        >
            📦 Sync saved repos
        </button>
        <div class="flex flex-col sm:flex-row gap-2">
            <button
                class="bg-slate-200 hover:bg-slate-300 text-xs px-3 py-2 rounded text-slate-900"
                on:click={discoverOrgs}
            >
                🔍 Discover organizations
            </button>
            {#if state.organizations.length > 1}
            <button
                class="border border-slate-300 text-xs px-3 py-2 rounded text-slate-600 hover:bg-slate-100"
                on:click={runFullDiscovery}
            >
                ⏱ Scan all automatically
            </button>
            {/if}
        </div>
    </div>
    <p class="text-xs text-gray-500 leading-relaxed">
        Sync pulls the latest repository snapshots from your <code class="bg-gray-100 px-1 rounded">skygit-config</code> repo. Discovery scans GitHub organizations (including your personal account) for new repositories to mirror here.
    </p>
</div>

{#if state.phase === "streaming"}
    <div class="flex items-center justify-between mb-3 text-sm text-gray-500">
        <div class="flex items-center gap-2">
            <Loader2 class="w-4 h-4 animate-spin text-blue-500" />
            <span>
                Syncing saved repos: {state.loadedCount}/{state.totalCount ?? "?"}
            </span>
        </div>
        <button
            class="text-blue-600 text-xs underline"
            on:click={state.paused ? resumeSyncing : pauseSyncing}
        >
            {state.paused ? 'Resume sync' : 'Pause sync'}
        </button>
    </div>
{:else if state.phase === "discover-repos"}
    <div class="flex flex-col gap-2 mb-3 text-sm text-gray-500">
        <div class="flex items-center gap-2">
            <Loader2 class="w-4 h-4 animate-spin text-blue-500" />
            <span>
                Scanning {labelForOrg(state.currentOrg)}: {state.loadedCount}/{state.totalCount ?? "?"}
            </span>
        </div>
        <button
            class="self-start text-blue-600 text-xs underline"
            on:click={cancelRepoScan}
        >
            Cancel discovery
        </button>
    </div>
{:else if state.phase === "discover-orgs"}
    <div class="mb-3 text-xs text-gray-500">
        {#if state.organizations.length === 0}
            Looking up accessible organizations…
        {:else}
            Select an organization below to scan its repositories.
            {#if state.lastCompletedOrg}
                <span class="ml-1 text-green-600">✓ Last scanned: {state.lastCompletedOrg}</span>
            {/if}
        {/if}
    </div>
{:else}
    {#if state.lastCompletedOrg}
        <div class="mb-3 text-xs text-green-600">✓ Finished scanning {state.lastCompletedOrg}</div>
    {/if}
{/if}

{#if state.organizations.length > 0}
    <div class="mb-4 border border-gray-200 rounded-lg overflow-hidden">
        <div class="bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-600 uppercase tracking-wide">
            Discovery targets
        </div>
        <ul class="divide-y divide-gray-200">
            {#each state.organizations as org}
                <li class="px-3 py-2 text-sm text-gray-700">
                    <button
                        class="w-full flex items-center gap-2 text-blue-600 hover:text-blue-800 disabled:opacity-40"
                        on:click={() => {
                            discoverOrgRepos(org.id);
                            collapsedOrgs = new Set(Object.keys(groupedRepos));
                        }}
                        disabled={state.phase === 'discover-repos'}
                    >
                        {#if org.avatar_url}
                            <img src={org.avatar_url} alt={org.label} class="w-6 h-6 rounded-full" />
                        {/if}
                        <span class="truncate">{labelForOrg(org.id)}</span>
                    </button>
                    {#if state.phase === 'discover-repos' && state.currentOrg === org.id}
                        <p class="mt-1 text-xs text-gray-500">Scanning {state.loadedCount}/{state.totalCount ?? '?'}…</p>
                    {/if}
                </li>
            {/each}
        </ul>
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
                                class="flex items-center justify-between px-3 py-2 hover:bg-blue-50 border-t border-gray-100 {$selectedRepo?.full_name === repo.full_name ? 'bg-blue-100' : ''}"
                            >
                                <div class="text-sm truncate flex-1">
                                    <button
                                        class="font-medium hover:underline cursor-pointer {$selectedRepo?.full_name === repo.full_name ? 'text-blue-900 font-semibold' : 'text-blue-700'}"
                                        on:click={() => showRepo(repo)}
                                    >
                                        {repo.name}
                                    </button>
                                    <span class="text-xs text-gray-500 ml-1">
                                        {repo.private ? "🔒" : "🌐"}
                                        {repo.has_messages ? "💬" : ""}
                                        {#if repo.config?.storage_info?.url}
                                            {#if repo.config.binary_storage_type === "google_drive"}
                                                <span title="Google Drive storage configured">📁</span>
                                            {:else if repo.config.binary_storage_type === "s3"}
                                                <span title="S3 storage configured">🪣</span>
                                            {/if}
                                        {/if}
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
