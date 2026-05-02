import { test, expect } from '@playwright/test';
import {
  createCommittedMessagesMessage,
  createUpdateConversationsMessage,
  isValidCommittedMessagesMessage
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
