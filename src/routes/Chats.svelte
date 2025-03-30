<script>
    import { conversations } from '../stores/conversationStore.js';
    import { repoList } from '../stores/repoStore.js';
    import Layout from "../components/Layout.svelte";
  </script>
<Layout>
  {#each $repoList as repo (repo.full_name)}
    {#if repo.has_messages}
      <h2>{repo.name}</h2>
      <ul>
        {#each $conversations[repo.full_name] || [] as convo}
          <li>{convo.name}</li>
        {/each}
      </ul>
    {/if}
  {/each}
</Layout>