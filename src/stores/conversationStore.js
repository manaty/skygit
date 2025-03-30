import { writable } from 'svelte/store';

export const conversations = writable({}); // keyed by repo.full_name
export const selectedConversation = writable(null);

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
