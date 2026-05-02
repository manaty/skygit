import { test, expect } from '@playwright/test';
import {
  applyCommittedMessagesNotification,
  broadcastCommittedEvent,
  createCommittedMessagesMessage,
  createUpdateConversationsMessage,
  isValidCommittedMessagesMessage,
  shouldBroadcastCommittedEvent
} from '../../../src/utils/peerCommitProtocol.js';

test('createUpdateConversationsMessage builds discovery conversation updates', () => {
  expect(createUpdateConversationsMessage(['manaty/skygit'])).toEqual({
    type: 'update_conversations',
    conversations: ['manaty/skygit']
  });
});

test('createCommittedMessagesMessage builds peer commit notifications', () => {
  expect(createCommittedMessagesMessage({
    repoName: 'manaty/skygit',
    convoId: 'conversation-a',
    messageIds: ['m1', 'm2']
  }, 1234)).toEqual({
    type: 'messages_committed',
    repoName: 'manaty/skygit',
    conversationId: 'conversation-a',
    messageIds: ['m1', 'm2'],
    timestamp: 1234
  });
});

test('isValidCommittedMessagesMessage requires commit notification fields', () => {
  expect(isValidCommittedMessagesMessage({
    repoName: 'manaty/skygit',
    conversationId: 'conversation-a',
    messageIds: []
  })).toBe(true);
  expect(isValidCommittedMessagesMessage({
    repoName: 'manaty/skygit',
    conversationId: 'conversation-a'
  })).toBe(false);
  expect(isValidCommittedMessagesMessage(null)).toBe(false);
});

test('committed event helpers broadcast only real commit events', () => {
  const sent = [];
  const event = {
    repoName: 'manaty/skygit',
    convoId: 'conversation-a',
    messageIds: ['m1']
  };

  expect(shouldBroadcastCommittedEvent(event)).toBe(true);
  expect(shouldBroadcastCommittedEvent(null)).toBe(false);

  broadcastCommittedEvent(event, (message) => sent.push(message), (value) => ({
    type: 'messages_committed',
    value
  }));

  expect(sent).toEqual([
    {
      type: 'messages_committed',
      value: event
    }
  ]);
});

test('applyCommittedMessagesNotification marks valid committed message payloads', () => {
  const marked = [];

  expect(applyCommittedMessagesNotification({
    repoName: 'manaty/skygit',
    conversationId: 'conversation-a',
    messageIds: ['m1']
  }, (...args) => marked.push(args))).toBe(true);

  expect(applyCommittedMessagesNotification({
    conversationId: 'conversation-a',
    messageIds: ['m1']
  }, (...args) => marked.push(args))).toBe(false);

  expect(marked).toEqual([
    ['conversation-a', 'manaty/skygit', ['m1']]
  ]);
});
