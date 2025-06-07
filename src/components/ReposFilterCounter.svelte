<script>
    import { searchQuery } from "../stores/searchStore.js";
    import { repoList, filteredCount } from "../stores/repoStore.js";
    import { currentRoute } from "../stores/routeStore.js";
    
    // Filter repos based on search query (same logic as in SidebarRepos)
    $: filteredRepos = $repoList.filter((repo) => {
        if (!$searchQuery || $searchQuery.trim() === "") return true;
        
        const q = $searchQuery.toLowerCase();
        return (
            repo.full_name.toLowerCase().includes(q) ||
            repo.name.toLowerCase().includes(q) ||
            repo.owner.toLowerCase().includes(q)
        );
    });
    
    // Update filtered count only when NOT on repos tab
    // (When on repos tab, SidebarRepos handles the count with additional filters)
    $: if ($currentRoute !== "repos") {
        filteredCount.set(filteredRepos.length);
    }
</script>