import { writable } from 'svelte/store';

const LOCAL_KEY = 'skygit_conversations';
const saved = JSON.parse(localStorage.getItem(LOCAL_KEY) || '{}');
export const conversations = writable(saved);
export const selectedConversation = writable(null);
export const filteredChatsCount = writable(0);
// Event bus for commit notifications: { repoName, convoId, messageIds }
export const committedEvents = writable(null);

conversations.subscribe((map) => {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(map));
});

export function setConversationsForRepo(repoFullName, list) {
  conversations.update((map) => ({
    ...map,
    [repoFullName]: list
  }));
}

export function addConversation(convoMeta, repo) {
  conversations.update((map) => {
    const list = map[repo.full_name] || [];
    return {
      ...map,
      [repo.full_name]: [...list, convoMeta]
    };
  });

  if (!repo.conversations) repo.conversations = [];
  if (!repo.conversations.includes(convoMeta.id)) {
    repo.conversations.push(convoMeta.id);
  }
}

export function appendMessage(convoId, repoName, message) {
  conversations.update((map) => {
    const list = map[repoName] || [];
    const updatedList = list.map((c) => {
      // Skip null/undefined items to prevent runtime errors
      if (!c || typeof c !== 'object') return c;
      if (c.id === convoId) {
        const existingMessages = c.messages || [];

        // Check for duplicate message by ID or by hash
        const isDuplicate = existingMessages.some(m =>
          (m.id && m.id === message.id) ||
          (m.hash && m.hash === message.hash) ||
          (m.timestamp === message.timestamp && m.sender === message.sender && m.content === message.content)
        );

        if (isDuplicate) {
          console.log('[ConversationStore] Skipping duplicate message:', message.id || message.hash);
          return c; // Return unchanged if duplicate
        }

        return {
          ...c,
          messages: [...existingMessages, { pending: true, ...message }],
          updatedAt: message.timestamp || Date.now()
        };
      }
      return c;
    });
    return { ...map, [repoName]: updatedList };
  });

  selectedConversation.update((current) => {
    if (current?.id === convoId && current?.repo === repoName) {
      const existingMessages = current.messages || [];

      // Check for duplicate in selected conversation
      const isDuplicate = existingMessages.some(m =>
        (m.id && m.id === message.id) ||
        (m.hash && m.hash === message.hash) ||
        (m.timestamp === message.timestamp && m.sender === message.sender && m.content === message.content)
      );

      if (isDuplicate) {
        return current; // Return unchanged if duplicate
      }

      return {
        ...current,
        messages: [...existingMessages, { pending: true, ...message }],
        updatedAt: message.timestamp || Date.now()
      };
    }
    return current;
  });

  // ✅ Optional: also update localStorage if you store conversations manually
}

// Batch append multiple messages with deduplication
export function appendMessages(convoId, repoName, messages) {
  if (!messages || messages.length === 0) return;

  conversations.update((map) => {
    const list = map[repoName] || [];
    const updatedList = list.map((c) => {
      // Skip null/undefined items to prevent runtime errors
      if (!c || typeof c !== 'object') return c;
      if (c.id === convoId) {
        const existingMessages = c.messages || [];

        // Create a Set of existing message identifiers for fast lookup
        const existingIds = new Set(existingMessages.map(m => m.id).filter(Boolean));
        const existingHashes = new Set(existingMessages.map(m => m.hash).filter(Boolean));
        const existingKeys = new Set(existingMessages.map(m =>
          `${m.timestamp}-${m.sender}-${m.content}`
        ));

        // Filter out duplicates
        const newMessages = messages.filter(message => {
          const isDuplicate =
            (message.id && existingIds.has(message.id)) ||
            (message.hash && existingHashes.has(message.hash)) ||
            existingKeys.has(`${message.timestamp}-${message.sender}-${message.content}`);

          if (isDuplicate) {
            console.log('[ConversationStore] Skipping duplicate in batch:', message.id || message.hash);
          }
          return !isDuplicate;
        });

        if (newMessages.length === 0) {
          return c; // No new messages to add
        }

        const taggedMessages = newMessages.map((msg) => ({ pending: msg.pending ?? false, ...msg }));
        // Combine and sort messages by timestamp
        const allMessages = [...existingMessages, ...taggedMessages].sort((a, b) =>
          (a.timestamp || 0) - (b.timestamp || 0)
        );

        return {
          ...c,
          messages: allMessages,
          updatedAt: Math.max(...newMessages.map(m => m.timestamp || Date.now()))
        };
      }
      return c;
    });
    return { ...map, [repoName]: updatedList };
  });

  selectedConversation.update((current) => {
    if (current?.id === convoId && current?.repo === repoName) {
      const existingMessages = current.messages || [];

      // Same deduplication logic for selected conversation
      const existingIds = new Set(existingMessages.map(m => m.id).filter(Boolean));
      const existingHashes = new Set(existingMessages.map(m => m.hash).filter(Boolean));
      const existingKeys = new Set(existingMessages.map(m =>
        `${m.timestamp}-${m.sender}-${m.content}`
      ));

      const newMessages = messages.filter(message => {
        const isDuplicate =
          (message.id && existingIds.has(message.id)) ||
          (message.hash && existingHashes.has(message.hash)) ||
          existingKeys.has(`${message.timestamp}-${message.sender}-${message.content}`);

        return !isDuplicate;
      });

      if (newMessages.length === 0) {
        return current;
      }

      const taggedMessages = newMessages.map((msg) => ({ pending: msg.pending ?? false, ...msg }));
      const allMessages = [...existingMessages, ...taggedMessages].sort((a, b) =>
        (a.timestamp || 0) - (b.timestamp || 0)
      );

      return {
        ...current,
        messages: allMessages,
        updatedAt: Math.max(...newMessages.map(m => m.timestamp || Date.now()))
      };
    }
    return current;
  });
}

export function markMessagesCommitted(convoId, repoName, messageIds) {
  if (!messageIds || messageIds.length === 0) return;
  const idSet = new Set(messageIds.filter(Boolean));

  conversations.update((map) => {
    const list = map[repoName] || [];
    const updatedList = list.map((c) => {
      if (!c || typeof c !== 'object' || c.id !== convoId) return c;
      const updatedMessages = (c.messages || []).map((msg) =>
        idSet.has(msg.id) ? { ...msg, pending: false } : msg
      );
      return { ...c, messages: updatedMessages };
    });
    return { ...map, [repoName]: updatedList };
  });

  selectedConversation.update((current) => {
    if (!current || current.id !== convoId || current.repo !== repoName) return current;
    const updatedMessages = (current.messages || []).map((msg) =>
      idSet.has(msg.id) ? { ...msg, pending: false } : msg
    );
    return { ...current, messages: updatedMessages };
  });
}
