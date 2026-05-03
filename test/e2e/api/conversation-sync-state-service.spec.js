import { test, expect } from '@playwright/test';
import {
  applySyncedConversationToStores,
  countSyncedMessages,
  replaceConversationInRepoList
} from '../../../src/services/conversationSyncStateService.js';

function createStore(value, calls, label) {
  return {
    value,
    set(next) {
      calls.push([label, 'set', next]);
      this.value = next;
    },
    update(updater) {
      const next = updater(this.value);
      calls.push([label, 'update', next]);
      this.value = next;
    }
  };
}

test('conversation sync state service replaces synced conversation in repo lists', () => {
  const original = [
    { id: 'a', messages: [] },
    { id: 'b', messages: [] }
  ];
  const updated = { id: 'b', messages: [{ content: 'hello' }] };

  expect(replaceConversationInRepoList(original, updated)).toEqual([
    { id: 'a', messages: [] },
    updated
  ]);
  expect(countSyncedMessages(updated, { id: 'b', messages: [] })).toBe(1);
});

test('conversation sync state service applies synced conversations to selected and repo stores', () => {
  const calls = [];
  const previousConversation = {
    id: 'conversation-a',
    repo: 'manaty/skygit',
    messages: [{ content: 'old' }]
  };
  const updatedConversation = {
    ...previousConversation,
    messages: [{ content: 'old' }, { content: 'new' }]
  };
  const selectedConversationStore = createStore(previousConversation, calls, 'selected');
  const conversationsStore = createStore({
    'manaty/skygit': [
      previousConversation,
      { id: 'conversation-b', repo: 'manaty/skygit', messages: [] }
    ]
  }, calls, 'conversations');

  const result = applySyncedConversationToStores({
    updatedConversation,
    previousConversation,
    conversationsStore,
    selectedConversationStore,
    setSelectedConversation: value => calls.push(['local', value]),
    log: message => calls.push(['log', message])
  });

  expect(result).toEqual({ status: 'applied', messageDelta: 1 });
  expect(calls[0]).toEqual(['log', '[SkyGit] Synced 1 new messages from GitHub']);
  expect(calls[1]).toEqual(['local', updatedConversation]);
  expect(selectedConversationStore.value).toBe(updatedConversation);
  expect(conversationsStore.value['manaty/skygit'][0]).toBe(updatedConversation);
  expect(conversationsStore.value['manaty/skygit'][1].id).toBe('conversation-b');
});

test('conversation sync state service skips empty sync results', () => {
  const calls = [];

  expect(applySyncedConversationToStores({
    updatedConversation: null,
    previousConversation: null,
    conversationsStore: createStore({}, calls, 'conversations'),
    selectedConversationStore: createStore(null, calls, 'selected'),
    setSelectedConversation: value => calls.push(['local', value]),
    log: message => calls.push(['log', message])
  })).toEqual({ status: 'skipped' });
  expect(calls).toEqual([]);
});
