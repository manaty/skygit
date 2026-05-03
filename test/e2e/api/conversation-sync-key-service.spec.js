import { test, expect } from '@playwright/test';
import {
  applyConversationSyncKeyChange,
  getConversationSyncKey
} from '../../../src/services/conversationSyncKeyService.js';

test('conversation sync key service derives keys only when polling is active', () => {
  const conversation = {
    repo: 'manaty/skygit',
    path: '.skygit/conversations/a.json'
  };

  expect(getConversationSyncKey(conversation, true)).toBe('manaty/skygit::.skygit/conversations/a.json');
  expect(getConversationSyncKey(conversation, false)).toBeNull();
  expect(getConversationSyncKey(null, true)).toBeNull();
});

test('conversation sync key service restarts sync when a key appears or changes', () => {
  const calls = [];
  const controller = {
    stop: () => calls.push('stop'),
    start: () => calls.push('start')
  };

  expect(applyConversationSyncKeyChange({
    currentKey: null,
    nextKey: 'repo::path-a',
    syncController: controller
  })).toBe('repo::path-a');
  expect(applyConversationSyncKeyChange({
    currentKey: 'repo::path-a',
    nextKey: 'repo::path-b',
    syncController: controller
  })).toBe('repo::path-b');
  expect(calls).toEqual(['stop', 'start', 'stop', 'start']);
});

test('conversation sync key service stops sync when the key disappears and ignores unchanged keys', () => {
  const calls = [];
  const controller = {
    stop: () => calls.push('stop'),
    start: () => calls.push('start')
  };

  expect(applyConversationSyncKeyChange({
    currentKey: 'repo::path-a',
    nextKey: null,
    syncController: controller
  })).toBeNull();
  expect(applyConversationSyncKeyChange({
    currentKey: null,
    nextKey: null,
    syncController: controller
  })).toBeNull();
  expect(calls).toEqual(['stop']);
});
