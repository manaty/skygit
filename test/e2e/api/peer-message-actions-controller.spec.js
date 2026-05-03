import { test, expect } from '@playwright/test';
import { createPeerMessageActionsController } from '../../../src/utils/peerMessageActionsController.js';

test('createPeerMessageActionsController sends and broadcasts with live connections', () => {
  const calls = [];
  const controller = createPeerMessageActionsController({
    ...createBaseDependencies(calls),
    resolveParticipants: () => [{ peerId: 'peer-a', username: 'alice' }],
    sendMessage: ({ peerId, message, connections }) => {
      calls.push(['sendMessage', peerId, message, connections]);
      return true;
    },
    broadcastMessageToParticipants: ({ message, conversationId, connections, participants }) => {
      calls.push(['broadcastParticipants', message, conversationId, connections, participants]);
      return { sent: 1 };
    },
    broadcastMessageToAll: ({ message, connections }) => {
      calls.push(['broadcastAll', message, connections]);
      return { sent: 2 };
    }
  });

  expect(controller.sendMessageToPeer('peer-a', { type: 'chat' })).toBe(true);
  expect(controller.broadcastMessage({ type: 'chat' }, 'c1')).toEqual({ sent: 1 });
  expect(controller.broadcastToAllPeers({ type: 'typing' })).toEqual({ sent: 2 });

  expect(calls).toEqual([
    ['sendMessage', 'peer-a', { type: 'chat' }, { 'peer-a': { username: 'alice' } }],
    ['broadcastParticipants', { type: 'chat' }, 'c1', { 'peer-a': { username: 'alice' } }, [{ peerId: 'peer-a', username: 'alice' }]],
    ['broadcastAll', { type: 'typing' }, { 'peer-a': { username: 'alice' } }]
  ]);
});

test('createPeerMessageActionsController resolves participants from current repo state', () => {
  const calls = [];
  const controller = createPeerMessageActionsController({
    ...createBaseDependencies(calls),
    resolveParticipants: (options) => {
      calls.push(['resolveParticipants', options]);
      return [{ peerId: 'peer-a', username: 'alice' }];
    }
  });

  expect(controller.getConversationParticipants('c1')).toEqual([{ peerId: 'peer-a', username: 'alice' }]);
  expect(calls[0]).toEqual([
    'resolveParticipants',
    expect.objectContaining({
      conversationId: 'c1',
      connections: { 'peer-a': { username: 'alice' } },
      conversationsMap: { 'manaty/skygit': [] },
      repoFullName: 'manaty/skygit'
    })
  ]);
});

test('createPeerMessageActionsController builds sync and typing actions', () => {
  const calls = [];
  const controller = createPeerMessageActionsController({
    ...createBaseDependencies(calls),
    requestMessageSyncAction: ({ peerId, conversationId, lastHash, sendMessageToPeer }) => {
      calls.push(['requestMessageSync', peerId, conversationId, lastHash]);
      sendMessageToPeer(peerId, { type: 'sync_request' });
      return { type: 'sync_request' };
    },
    requestSyncWithHashChainAction: ({ peerId, conversationId, hashChain, sendMessageToPeer }) => {
      calls.push(['requestSyncWithHashChain', peerId, conversationId, hashChain]);
      sendMessageToPeer(peerId, { type: 'sync_request_chain' });
      return { type: 'sync_request_chain' };
    },
    broadcastTypingAction: (isTyping, broadcastToAllPeers) => {
      calls.push(['broadcastTypingAction', isTyping]);
      broadcastToAllPeers({ type: 'typing', isTyping });
      return { type: 'typing', isTyping };
    },
    sendMessage: ({ peerId, message }) => {
      calls.push(['sendMessage', peerId, message]);
      return true;
    },
    broadcastMessageToAll: ({ message }) => {
      calls.push(['broadcastAll', message]);
      return true;
    }
  });

  expect(controller.requestMessageSync('peer-a', 'c1', 'h1')).toEqual({ type: 'sync_request' });
  expect(controller.requestSyncWithHashChain('peer-b', 'c2', ['h2'])).toEqual({ type: 'sync_request_chain' });
  expect(controller.broadcastTypingStatus(true)).toEqual({ type: 'typing', isTyping: true });

  expect(calls).toEqual([
    ['requestMessageSync', 'peer-a', 'c1', 'h1'],
    ['sendMessage', 'peer-a', { type: 'sync_request' }],
    ['requestSyncWithHashChain', 'peer-b', 'c2', ['h2']],
    ['sendMessage', 'peer-b', { type: 'sync_request_chain' }],
    ['broadcastTypingAction', true],
    ['broadcastAll', { type: 'typing', isTyping: true }]
  ]);
});

function createBaseDependencies(calls) {
  return {
    getConnections: () => ({ 'peer-a': { username: 'alice' } }),
    getConversations: () => ({ 'manaty/skygit': [] }),
    getRepoFullName: () => 'manaty/skygit',
    getStorage: () => ({
      getItem: () => null
    }),
    getOrgId: repoName => repoName.split('/')[0],
    log: (...args) => calls.push(['log', ...args]),
    warn: (...args) => calls.push(['warn', ...args]),
    error: (...args) => calls.push(['error', ...args])
  };
}
