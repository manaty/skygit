import { test, expect } from '@playwright/test';
import { createPeerConnectionController } from '../../../src/utils/peerConnectionController.js';

test('createPeerConnectionController binds incoming and outgoing peer connections', () => {
  const calls = [];
  const controller = createPeerConnectionController({
    ...createBaseDependencies(calls),
    bindIncomingConnection: (connection, handlers) => {
      calls.push(['bindIncomingConnection', connection.peer]);
      handlers.addPeerConnection(connection, 'alice');
      handlers.handlePeerMessage({ type: 'chat' }, 'peer-a', 'alice');
      handlers.removePeerConnection('peer-a');
      return 'bound';
    },
    connectOutgoingPeer: (options) => {
      calls.push(['connectOutgoingPeer', options.targetPeerId, options.username, options.localPeer, options.localUsername]);
      options.addPeerConnection({ peer: options.targetPeerId }, options.username);
      return 'connecting';
    }
  });

  expect(controller.handleIncomingConnection({ peer: 'peer-a' })).toBe('bound');
  expect(controller.connectToPeer('peer-b', 'bob')).toBe('connecting');

  expect(calls).toContainEqual(['bindIncomingConnection', 'peer-a']);
  expect(calls).toContainEqual(['handlePeerMessage', { type: 'chat' }, 'peer-a', 'alice']);
  expect(calls).toContainEqual(['connectOutgoingPeer', 'peer-b', 'bob', 'local-peer', 'local-user']);
});

test('createPeerConnectionController updates online peers and starts sync on open connections', () => {
  const calls = [];
  const controller = createPeerConnectionController({
    ...createBaseDependencies(calls),
    buildOnlineRows: connections => Object.keys(connections).map(peerId => ({ peerId })),
    processOpenedConnection: ({ connection, username, updatePeerConnections, updateOnlinePeers, syncConversationsWithPeer }) => {
      calls.push(['processOpenedConnection', connection.peer, username]);
      updatePeerConnections(current => current);
      updateOnlinePeers();
      syncConversationsWithPeer(connection.peer);
      return 'opened';
    },
    sendSyncRequests: (...args) => calls.push(['sendSyncRequests', ...args])
  });

  expect(controller.addPeerConnection({ peer: 'peer-a' }, 'alice')).toBe('opened');

  expect(calls).toContainEqual(['processOpenedConnection', 'peer-a', 'alice']);
  expect(calls).toContainEqual(['updatePeerConnections', expect.any(Function)]);
  expect(calls).toContainEqual(['setOnlinePeers', [{ peerId: 'peer-a' }]]);
  expect(calls).toContainEqual([
    'sendSyncRequests',
    'peer-a',
    { 'manaty/skygit': [] },
    'manaty/skygit',
    expect.any(Function),
    expect.any(Function)
  ]);
});

test('createPeerConnectionController removes connections with discovery context', () => {
  const calls = [];
  const registry = new Map();
  const failedConnections = new Set(['peer-a']);
  const controller = createPeerConnectionController({
    ...createBaseDependencies(calls),
    getPeerRegistry: () => registry,
    getFailedConnections: () => failedConnections,
    processClosedConnection: (options) => {
      calls.push(['processClosedConnection', options]);
      options.updateOnlinePeers();
      return 'closed';
    }
  });

  expect(controller.removePeerConnection('peer-a')).toBe('closed');

  expect(calls).toEqual([
    ['log', '[PeerJS] Removing peer connection:', 'peer-a'],
    ['processClosedConnection', expect.objectContaining({
      peerId: 'peer-a',
      connections: { 'peer-a': { username: 'alice' } },
      peerRegistry: registry,
      isCurrentLeader: true,
      failedConnections
    })],
    ['setOnlinePeers', [expect.objectContaining({
      session_id: 'peer-a',
      username: 'alice'
    })]]
  ]);
});

function createBaseDependencies(calls) {
  return {
    getLocalPeer: () => 'local-peer',
    getLocalUsername: () => 'local-user',
    getRepoFullName: () => 'manaty/skygit',
    getSessionId: () => 'session-a',
    getConnections: () => ({ 'peer-a': { username: 'alice' } }),
    getConversations: () => ({ 'manaty/skygit': [] }),
    getPeerRegistry: () => new Map(),
    getCurrentDiscoveryLeader: () => true,
    getFailedConnections: () => new Set(),
    updatePeerConnections: (...args) => calls.push(['updatePeerConnections', ...args]),
    setOnlinePeers: (...args) => calls.push(['setOnlinePeers', ...args]),
    updateTypingUsers: (...args) => calls.push(['updateTypingUsers', ...args]),
    updateContact: (...args) => calls.push(['updateContact', ...args]),
    requestMessageSync: (...args) => calls.push(['requestMessageSync', ...args]),
    handlePeerMessage: (...args) => calls.push(['handlePeerMessage', ...args]),
    broadcastPeerListUpdate: (...args) => calls.push(['broadcastPeerListUpdate', ...args]),
    log: (...args) => calls.push(['log', ...args]),
    reportError: (...args) => calls.push(['reportError', ...args])
  };
}
