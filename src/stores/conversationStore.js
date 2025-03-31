import { writable } from 'svelte/store';

const LOCAL_KEY = 'skygit_conversations';
const saved = JSON.parse(localStorage.getItem(LOCAL_KEY) || '{}');
export const conversations = writable(saved); 
export const selectedConversation = writable(null);

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
    const updated = list.map((c) => {
      if (c.id === convoId) {
        c.messages = c.messages || [];
        c.messages.push(message);
        c.updatedAt = message.timestamp || Date.now(); // ✅ update timestamp
      }
      return c;
    });

    return { ...map, [repoName]: updated };
  });

  selectedConversation.update((current) => {
    if (current?.id === convoId && current?.repo === repoName) {
      current.messages = current.messages || [];
      current.messages.push(message);
      current.updatedAt = message.timestamp || Date.now(); // ✅ update here too
    }
    return current;
  });
}

