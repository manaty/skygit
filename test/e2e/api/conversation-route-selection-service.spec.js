import { test, expect } from '@playwright/test';
import {
  applyConversationRouteSelection,
  getConversationRouteRepo
} from '../../../src/services/conversationRouteSelectionService.js';

test('conversation route selection service resolves repos from selected conversations', () => {
  const repos = {
    'manaty/skygit': { full_name: 'manaty/skygit' }
  };

  expect(getConversationRouteRepo(
    { repo: 'manaty/skygit' },
    name => repos[name]
  )).toBe(repos['manaty/skygit']);
  expect(getConversationRouteRepo(null, () => null)).toBeNull();
  expect(getConversationRouteRepo({}, () => null)).toBeNull();
});

test('conversation route selection service updates selected conversation store and current repo', () => {
  const calls = [];
  const conversation = {
    repo: 'manaty/skygit',
    id: 'conversation-a'
  };

  const result = applyConversationRouteSelection({
    conversation,
    selectedConversationStore: {
      set: value => calls.push(['set', value])
    },
    getRepoByFullName: repo => ({ full_name: repo })
  });

  expect(result).toEqual({
    selectedConversation: conversation,
    currentRepo: { full_name: 'manaty/skygit' }
  });
  expect(calls).toEqual([['set', conversation]]);
});
