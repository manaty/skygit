import { test, expect } from '@playwright/test';
import {
  applyLeaderConversationUpdate,
  notifyLeaderOfConversations,
  processLocalConversationUpdate,
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

test('processLocalConversationUpdate updates leader registry and notifies connected leaders', () => {
  const conversations = ['conversation-a'];
  const localInfo = { conversations: [], lastSeen: 0 };
  const peerRegistry = new Map([
    ['local-peer', localInfo]
  ]);
  const sent = [];
  const logs = [];

  expect(processLocalConversationUpdate({
    conversations,
    isCurrentLeader: true,
    peerRegistry,
    localPeerId: 'local-peer',
    leaderConnection: {
      open: true,
      send: (message) => sent.push(message)
    },
    createUpdateMessage: (value) => ({
      type: 'update_conversations',
      conversations: value
    }),
    log: (...args) => logs.push(args)
  })).toEqual({
    updatedLeaderRegistry: true,
    notifiedLeader: true
  });

  expect(localInfo.conversations).toBe(conversations);
  expect(sent).toEqual([{ type: 'update_conversations', conversations }]);
  expect(logs).toEqual([
    ['[Discovery] Leader updated own conversations:', conversations],
    ['[Discovery] Notified leader of conversation update:', conversations]
  ]);

  expect(processLocalConversationUpdate({
    conversations,
    isCurrentLeader: false,
    peerRegistry,
    localPeerId: 'missing-peer',
    leaderConnection: { open: false },
    createUpdateMessage: () => ({})
  })).toEqual({
    updatedLeaderRegistry: false,
    notifiedLeader: false
  });
});
