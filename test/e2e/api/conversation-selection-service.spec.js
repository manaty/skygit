import { test, expect } from '@playwright/test';
import {
  createConversationContentRequest,
  fetchConversationMessages,
  loadSelectedConversationContents,
  shouldLoadConversationMessages
} from '../../../src/services/conversationSelectionService.js';

test('conversation selection helpers build GitHub content requests only when messages are missing', () => {
  const conversation = createConversation();

  expect(shouldLoadConversationMessages(conversation, 'token')).toBe(true);
  expect(shouldLoadConversationMessages({ ...conversation, messages: [{ id: 'm1' }] }, 'token')).toBe(false);
  expect(shouldLoadConversationMessages(conversation, null)).toBe(false);

  expect(createConversationContentRequest(conversation, 'token')).toEqual({
    path: 'chats/convo.json',
    url: 'https://api.github.com/repos/manaty/skygit/contents/chats/convo.json',
    options: {
      headers: {
        Authorization: 'token token',
        Accept: 'application/vnd.github+json'
      }
    }
  });
});

test('fetchConversationMessages decodes loaded content and reports deleted conversations', async () => {
  const conversation = createConversation();
  const loaded = await fetchConversationMessages({
    conversation,
    token: 'token',
    fetchFn: async () => ({
      ok: true,
      json: async () => ({ content: 'encoded' })
    }),
    decodeBase64: () => JSON.stringify({ messages: [{ id: 'm1' }] })
  });

  expect(loaded).toEqual({
    status: 'loaded',
    messages: [{ id: 'm1' }],
    path: 'chats/convo.json'
  });

  const deleted = await fetchConversationMessages({
    conversation,
    token: 'token',
    fetchFn: async () => ({ ok: false, status: 404 })
  });

  expect(deleted).toEqual({ status: 'deleted' });
});

test('loadSelectedConversationContents updates selected and conversation stores on success', async () => {
  const calls = [];
  const conversation = createConversation();
  const conversationsStore = createStore({ 'manaty/skygit': [conversation] }, calls, 'conversations');
  const selectedConversationStore = createStore(null, calls, 'selected');

  const result = await loadSelectedConversationContents({
    conversation,
    token: 'token',
    authToken: 'auth-token',
    conversationsStore,
    selectedConversationStore,
    currentRouteStore: createStore(null, calls, 'route'),
    currentContentStore: createStore(null, calls, 'content'),
    setSelectedConversation: value => calls.push(['setSelectedConversation', value]),
    removeFromSkyGitConversations: (...args) => calls.push(['removeFromConfig', ...args]),
    alertUser: message => calls.push(['alert', message]),
    fetchMessages: async () => ({
      status: 'loaded',
      messages: [{ id: 'm1' }],
      path: 'chats/convo.json'
    }),
    warn: (...args) => calls.push(['warn', ...args])
  });

  expect(result.status).toBe('loaded');
  expect(selectedConversationStore.value.messages).toEqual([{ id: 'm1' }]);
  expect(conversationsStore.value['manaty/skygit'][0].messages).toEqual([{ id: 'm1' }]);
  expect(calls).toContainEqual(['setSelectedConversation', expect.objectContaining({ messages: [{ id: 'm1' }] })]);
});

test('loadSelectedConversationContents removes deleted conversations and navigates back to chats', async () => {
  const calls = [];
  const conversation = createConversation();
  const conversationsStore = createStore({ 'manaty/skygit': [conversation] }, calls, 'conversations');
  const selectedConversationStore = createStore(conversation, calls, 'selected');
  const currentRouteStore = createStore('conversation', calls, 'route');
  const currentContentStore = createStore(conversation, calls, 'content');

  const result = await loadSelectedConversationContents({
    conversation,
    token: 'token',
    authToken: 'auth-token',
    conversationsStore,
    selectedConversationStore,
    currentRouteStore,
    currentContentStore,
    setSelectedConversation: value => calls.push(['setSelectedConversation', value]),
    removeFromSkyGitConversations: (...args) => calls.push(['removeFromConfig', ...args]),
    alertUser: message => calls.push(['alert', message]),
    fetchMessages: async () => ({ status: 'deleted' }),
    warn: (...args) => calls.push(['warn', ...args])
  });

  expect(result.status).toBe('deleted');
  expect(conversationsStore.value['manaty/skygit']).toEqual([]);
  expect(selectedConversationStore.value).toBeNull();
  expect(currentRouteStore.value).toBe('chats');
  expect(currentContentStore.value).toBeNull();
  expect(calls).toContainEqual(['removeFromConfig', 'auth-token', conversation]);
  expect(calls).toContainEqual(['alert', 'Conversation "General" was deleted from the repository and has been removed from your local list.']);
});

function createConversation() {
  return {
    id: 'general',
    title: 'General',
    repo: 'manaty/skygit',
    path: 'chats/convo.json',
    messages: []
  };
}

function createStore(initialValue, calls, name) {
  const store = {
    value: initialValue,
    set(nextValue) {
      store.value = nextValue;
      calls.push([`${name}:set`, nextValue]);
    },
    update(updater) {
      store.value = updater(store.value);
      calls.push([`${name}:update`, store.value]);
    }
  };

  return store;
}
