export function getConversationRouteRepo(conversation, getRepoByFullName) {
  return conversation?.repo ? getRepoByFullName(conversation.repo) : null;
}

export function applyConversationRouteSelection({
  conversation,
  selectedConversationStore,
  getRepoByFullName
}) {
  selectedConversationStore.set(conversation);

  return {
    selectedConversation: conversation,
    currentRepo: getConversationRouteRepo(conversation, getRepoByFullName)
  };
}
