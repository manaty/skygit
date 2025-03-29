<script>
    import { repoList } from '../stores/repoStore.js';
    import { syncState } from '../stores/syncStateStore.js';
    import { cancelDiscovery, discoverAllRepos } from '../services/githubRepoDiscovery.js';
    import { Trash2, Loader2 } from 'lucide-svelte';
  
    let repos = [];
    let state;
  
    repoList.subscribe((value) => (repos = value));
    syncState.subscribe((s) => (state = s));
  
    function toggleStreamPause() {
      syncState.update((s) => ({ ...s, paused: !s.paused }));
    }
  
    function toggleDiscoveryPause() {
      if (state.paused) {
        syncState.update((s) => ({ ...s, paused: false }));
        const token = localStorage.getItem('skygit_token');
        if (token) discoverAllRepos(token);
      } else {
        cancelDiscovery();
        syncState.update((s) => ({ ...s, paused: true }));
      }
    }
  
    function removeRepo(fullName) {
      repoList.update((list) => list.filter((r) => r.full_name !== fullName));
    }
  </script>
  
  <!-- STREAMING PHASE -->
  {#if state.phase === 'streaming'}
    <div class="flex items-center justify-between mb-3 text-sm text-gray-500">
      <div class="flex items-center gap-2">
        <Loader2 class="w-4 h-4 animate-spin text-blue-500" />
        <span>
          Streaming: {state.loadedCount}/{state.totalCount ?? '?'}
        </span>
      </div>
      <button on:click={toggleStreamPause} class="text-blue-600 text-xs underline">
        {state.paused ? 'Resume Streaming' : 'Pause Streaming'}
      </button>
    </div>
  
  <!-- DISCOVERY PHASE -->
  {:else if state.phase === 'discovery'}
    <div class="flex justify-end mb-3">
      <button on:click={toggleDiscoveryPause} class="text-blue-600 text-xs underline">
        {state.paused ? 'Resume Discovery' : 'Pause Discovery'}
      </button>
    </div>
  
  <!-- IDLE PHASE -->
  {:else if state.phase === 'idle'}
    <div class="text-xs text-gray-400 mb-2">✔️ Discovery complete</div>
  {/if}
  
  <!-- REPO LIST -->
  <ul class="space-y-2">
    {#each repos as repo (repo.full_name)}
      <li class="flex items-center justify-between bg-gray-100 px-3 py-2 rounded">
        <div class="text-sm truncate">
          <p class="font-medium text-blue-700 hover:underline">
            <a href={repo.url} target="_blank">{repo.full_name}</a>
          </p>
          <p class="text-xs text-gray-500">
            {repo.private ? '🔒 Private' : '🌐 Public'}
            {repo.has_messages ? ' | 💬 .messages' : ' | no messaging'}
          </p>
        </div>
        <button on:click={() => removeRepo(repo.full_name)} aria-label="Remove repo">
          <Trash2 class="w-4 h-4 text-red-500 hover:text-red-700" />
        </button>
      </li>
    {/each}
  </ul>
  