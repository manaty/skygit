<script>
    import { searchQuery } from "../stores/searchStore.js";
    import { conversations, filteredChatsCount } from "../stores/conversationStore.js";
    
    // Use store auto-subscriptions with $
    // Flatten all conversations
    $: allConversations = Object.values($conversations).flat();
    
    // Filter conversations based on search query
    $: filteredConversations = allConversations.filter((convo) => {
        if (!$searchQuery || $searchQuery.trim() === "") return true;
        
        const query = $searchQuery.toLowerCase();
        const title = (convo.title || `Conversation ${convo.id.slice(0, 6)}`).toLowerCase();
        const repo = convo.repo.toLowerCase();
        const fullName = `${repo}/${title}`;
        
        return title.includes(query) || repo.includes(query) || fullName.includes(query);
    });
    
    // Update filtered count
    $: filteredChatsCount.set(filteredConversations.length);
</script>