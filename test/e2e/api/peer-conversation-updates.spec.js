import { test, expect } from '@playwright/test';
import {
  applyLeaderConversationUpdate,
  notifyLeaderOfConversations,
  shouldNotifyLeaderOfConversations
} from '../../../src/utils/peerConversationUpdates.js';

test('applyLeaderConversationUpdate updates local registry conversations immutably by reference', () => {
  const conversations = ['conversation-a'];
  const localInfo = { conversations: [], lastSeen: 0 };
  const registry = new Map([
    ['local-peer', localInfo]
  ]);

  expect(applyLeaderConversationUpdate(registry, 'local-peer', conversations, 1234)).toBe(true);
  expect(localInfo).toEqual({
    conversations,
    lastSeen: 1234
  });
  expect(applyLeaderConversationUpdate(registry, 'missing-peer', conversations, 5678)).toBe(false);
});

test('leader conversation notification helpers require an open leader connection', () => {
  expect(shouldNotifyLeaderOfConversations({ open: true })).toBe(true);
  expect(shouldNotifyLeaderOfConversations({ open: false })).toBe(false);
  expect(shouldNotifyLeaderOfConversations(null)).toBe(false);
});

test('notifyLeaderOfConversations sends the provided protocol message', () => {
  const sent = [];
  const conversations = ['conversation-a'];
  const connection = {
    send: (message) => sent.push(message)
  };

  notifyLeaderOfConversations(connection, conversations, (value) => ({
    type: 'update_conversations',
    conversations: value
  }));

  expect(sent).toEqual([
    {
      type: 'update_conversations',
      conversations
    }
  ]);
});
