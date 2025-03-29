<script>
    import Layout from "../components/Layout.svelte";
    import { selectedRepo } from "../stores/repoStore.js";
  
    let repo;
    selectedRepo.subscribe((r) => (repo = r));
  </script>
  
  <Layout>
    {#if repo}
      <div class="p-6 space-y-4 bg-white shadow rounded max-w-3xl mx-auto mt-6">
        <h2 class="text-2xl font-semibold text-blue-700">
          {repo.full_name}
        </h2>
  
        <div class="text-sm text-gray-700 space-y-1">
          <div><strong>Name:</strong> {repo.name}</div>
          <div><strong>Owner:</strong> {repo.owner}</div>
          <div>
            <strong>GitHub:</strong>
            <a href={repo.url} target="_blank" rel="noopener noreferrer" class="text-blue-600 underline hover:text-blue-800">
              {repo.url}
            </a>
          </div>
          <div>
            <strong>Visibility:</strong>
            {repo.private ? '🔒 Private' : '🌐 Public'}
          </div>
          <div>
            <strong>Messaging:</strong>
            {repo.has_messages ? '💬 Available' : '🚫 Not enabled'}
          </div>
        </div>
      </div>
    {:else}
      <p class="text-gray-400 italic text-center mt-20">
        Select a repository from the sidebar to view its details.
      </p>
    {/if}
  </Layout>
  