import { writable } from 'svelte/store';

const LOCAL_KEY = 'skygit_conversations';
const saved = JSON.parse(localStorage.getItem(LOCAL_KEY) || '{}');
export const conversations = writable(saved); 
export const selectedConversation = writable(null);
export const filteredChatsCount = writable(0);

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
        return {
          ...c,
          messages: [...(c.messages || []), message],
          updatedAt: message.timestamp || Date.now()
        };
      }
      return c;
    });
    return { ...map, [repoName]: updatedList };
  });

  selectedConversation.update((current) => {
    if (current?.id === convoId && current?.repo === repoName) {
      return {
        ...current,
        messages: [...(current.messages || []), message],
        updatedAt: message.timestamp || Date.now()
      };
    }
    return current;
  });

  // ✅ Optional: also update localStorage if you store conversations manually
}

