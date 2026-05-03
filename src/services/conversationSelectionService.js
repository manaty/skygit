export function shouldLoadConversationMessages(conversation, token) {
  return Boolean(
    token &&
    conversation?.repo &&
    conversation?.id &&
    (!conversation.messages || conversation.messages.length === 0)
  );
}

export function createConversationContentRequest(conversation, token) {
  const path = conversation.path;

  return {
    path,
    url: `https://api.github.com/repos/${conversation.repo}/contents/${path}`,
    options: {
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github+json'
      }
    }
  };
}

export async function fetchConversationMessages({
  conversation,
  token,
  fetchFn = fetch,
  decodeBase64 = atob
}) {
  const request = createConversationContentRequest(conversation, token);
  const response = await fetchFn(request.url, request.options);

  if (response.ok) {
    const blob = await response.json();
    const decoded = JSON.parse(decodeBase64(blob.content));
    return {
      status: 'loaded',
      messages: Array.isArray(decoded?.messages) ? decoded.messages : null,
      path: request.path
    };
  }

  if (response.status === 404) {
    return { status: 'deleted' };
  }

  return {
    status: 'error',
    httpStatus: response.status
  };
}

export function updateConversationInStore(conversationsStore, updatedConversation) {
  conversationsStore.update(map => {
    const list = map[updatedConversation.repo] || [];
    const updated = list.map(conversation =>
      conversation.id === updatedConversation.id ? updatedConversation : conversation
    );

    return { ...map, [updatedConversation.repo]: updated };
  });
}

export function removeConversationFromStore(conversationsStore, conversation) {
  conversationsStore.update(map => {
    const list = map[conversation.repo] || [];
    const filtered = list.filter(item => item.id !== conversation.id);

    return { ...map, [conversation.repo]: filtered };
  });
}

export async function loadSelectedConversationContents({
  conversation,
  token,
  authToken,
  conversationsStore,
  selectedConversationStore,
  currentRouteStore,
  currentContentStore,
  setSelectedConversation,
  removeFromSkyGitConversations,
  alertUser = alert,
  fetchMessages = fetchConversationMessages,
  warn = console.warn
}) {
  if (!shouldLoadConversationMessages(conversation, token)) {
    return { status: 'skipped', conversation };
  }

  try {
    const result = await fetchMessages({ conversation, token });

    if (result.status === 'loaded' && result.messages) {
      const updatedConversation = {
        ...conversation,
        messages: result.messages,
        path: result.path
      };

      setSelectedConversation(updatedConversation);
      selectedConversationStore.set(updatedConversation);
      updateConversationInStore(conversationsStore, updatedConversation);

      return { status: 'loaded', conversation: updatedConversation };
    }

    if (result.status === 'deleted') {
      warn('[SkyGit] Conversation file was deleted from GitHub');
      const conversationTitle = conversation?.title || 'Unknown';

      removeConversationFromStore(conversationsStore, conversation);
      setSelectedConversation(null);
      selectedConversationStore.set(null);
      currentRouteStore.set('chats');
      currentContentStore.set(null);

      if (authToken && conversation) {
        removeFromSkyGitConversations(authToken, conversation);
      }

      alertUser(`Conversation "${conversationTitle}" was deleted from the repository and has been removed from your local list.`);
      return { status: 'deleted', conversation: null };
    }

    warn('[SkyGit] Failed to load conversation, status:', result.httpStatus);
    const fallbackConversation = {
      ...conversation,
      messages: []
    };
    setSelectedConversation(fallbackConversation);
    selectedConversationStore.set(fallbackConversation);

    return { status: 'fallback', conversation: fallbackConversation };
  } catch (error) {
    warn('[SkyGit] Failed to fetch conversation contents', error);
    return { status: 'failed', conversation, error };
  }
}
