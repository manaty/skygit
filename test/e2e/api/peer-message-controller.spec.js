import { test, expect } from '@playwright/test';
import { createPeerMessageController } from '../../../src/utils/peerMessageController.js';

test('createPeerMessageController routes peer data through message handlers', () => {
  const calls = [];
  const logs = [];
  const controller = createPeerMessageController({
    ...createBaseDependencies(calls),
    processDataMessage: ({ data, handlers }) => {
      handlers.chat(data, 'alice', 'peer-a');
      return 'chat';
    },
    log: (...args) => logs.push(args)
  });

  expect(controller.handlePeerMessage({ type: 'chat', conversationId: 'c1', content: 'hello' }, 'peer-a')).toBe('chat');
  expect(calls).toEqual([
    ['appendMessage', 'c1', 'manaty/skygit', expect.objectContaining({
      sender: 'alice',
      content: 'hello'
    })],
    ['setLastMessage', 'alice', expect.objectContaining({
      sender: 'alice',
      content: 'hello'
    })],
    ['updateContact', 'alice', expect.objectContaining({ online: true })],
    ['queueConversationForCommit', 'manaty/skygit', 'c1']
  ]);
  expect(logs).toContainEqual([
    '[PeerJS] Received chat message from',
    'alice',
    '(',
    'peer-a',
    '):',
    { type: 'chat', conversationId: 'c1', content: 'hello' }
  ]);
});

test('createPeerMessageController handles sync requests with current conversations', () => {
  const calls = [];
  const controller = createPeerMessageController({
    ...createBaseDependencies(calls),
    getConversations: () => ({
      'manaty/skygit': [{
        id: 'c1',
        messages: [
          { id: 'm1', sender: 'alice', content: 'hello', hash: 'h1' },
          { id: 'm2', sender: 'bob', content: 'world', hash: 'h2' }
        ]
      }]
    })
  });

  expect(controller.handleSyncRequest({ conversationId: 'c1', lastHash: 'h1' }, 'peer-a')).toBe('messages');
  expect(calls).toEqual([
    ['sendMessageToPeer', 'peer-a', {
      type: 'sync_response',
      conversationId: 'c1',
      messages: [{ id: 'm2', sender: 'bob', content: 'world', hash: 'h2' }]
    }]
  ]);
});

test('createPeerMessageController applies typing and commit notifications', () => {
  const calls = [];
  const controller = createPeerMessageController(createBaseDependencies(calls));

  expect(controller.handleTypingMessage({ isTyping: true }, 'alice', 'peer-a')).toBe('typing');
  expect(controller.handleCommittedMessages({
    repoName: 'manaty/skygit',
    conversationId: 'c1',
    messageIds: ['m1']
  }, 'peer-a')).toBe(true);

  expect(calls).toContainEqual(['updateTypingUsers', expect.any(Function)]);
  expect(calls).toContainEqual(['markMessagesCommitted', 'c1', 'manaty/skygit', ['m1']]);
});

function createBaseDependencies(calls) {
  return {
    getConnections: () => ({
      'peer-a': { username: 'alice' }
    }),
    getConversations: () => ({}),
    getLocalPeerId: () => 'local',
    getRepoFullName: () => 'manaty/skygit',
    appendMessage: (...args) => calls.push(['appendMessage', ...args]),
    appendMessages: (...args) => calls.push(['appendMessages', ...args]),
    setLastMessage: (...args) => calls.push(['setLastMessage', ...args]),
    updateContact: (...args) => calls.push(['updateContact', ...args]),
    updateTypingUsers: (...args) => calls.push(['updateTypingUsers', ...args]),
    isLeader: () => true,
    getCurrentLeader: () => 'local',
    queueConversationForCommit: (...args) => calls.push(['queueConversationForCommit', ...args]),
    sendMessageToPeer: (...args) => calls.push(['sendMessageToPeer', ...args]),
    markMessagesCommitted: (...args) => calls.push(['markMessagesCommitted', ...args])
  };
}
