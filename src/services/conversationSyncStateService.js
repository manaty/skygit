export function replaceConversationInRepoList(conversationList = [], updatedConversation) {
  return conversationList.map(conversation => (
    conversation.id === updatedConversation.id ? updatedConversation : conversation
  ));
}

export function countSyncedMessages(updatedConversation, previousConversation) {
  return (updatedConversation.messages || []).length - (previousConversation?.messages || []).length;
}

export function applySyncedConversationToStores({
  updatedConversation,
  previousConversation,
  conversationsStore,
  selectedConversationStore,
  setSelectedConversation,
  log = () => {}
}) {
  if (!updatedConversation) {
    return { status: 'skipped' };
  }

  const messageDelta = countSyncedMessages(updatedConversation, previousConversation);
  log(`[SkyGit] Synced ${messageDelta} new messages from GitHub`);

  setSelectedConversation(updatedConversation);
  selectedConversationStore.set(updatedConversation);
  conversationsStore.update(map => {
    const list = map[updatedConversation.repo] || [];
    return {
      ...map,
      [updatedConversation.repo]: replaceConversationInRepoList(list, updatedConversation)
    };
  });

  return { status: 'applied', messageDelta };
}
