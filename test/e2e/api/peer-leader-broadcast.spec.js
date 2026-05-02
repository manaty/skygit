import { test, expect } from '@playwright/test';
import {
  broadcastDiscoveryPeerListUpdate,
  sendCompletePeerRegistry,
  sendDiscoveryPeerList
} from '../../../src/utils/peerLeaderBroadcast.js';

test('sendCompletePeerRegistry sends all registry peers with the organization id', () => {
  const sent = [];
  const logs = [];
  const connection = {
    peer: 'peer-a',
    send: (message) => sent.push(message)
  };
  const registry = new Map([
    ['peer-a', {
      username: 'alice',
      conversations: ['manaty/skygit'],
      isLeader: false,
      lastSeen: 10
    }]
  ]);

  const peerList = sendCompletePeerRegistry(connection, registry, 'manaty', (...args) => logs.push(args));

  expect(peerList).toEqual([{
    peerId: 'peer-a',
    username: 'alice',
    conversations: ['manaty/skygit'],
    isLeader: false,
    lastSeen: 10
  }]);
  expect(sent).toEqual([{
    type: 'peer_registry',
    peers: peerList,
    orgId: 'manaty'
  }]);
  expect(logs).toEqual([
    ['[Discovery] Sending complete peer registry to peer-a:', peerList]
  ]);
});

test('sendDiscoveryPeerList filters peers by conversation when requested', () => {
  const sent = [];
  const connection = {
    peer: 'peer-a',
    send: (message) => sent.push(message)
  };
  const registry = new Map([
    ['peer-a', {
      username: 'alice',
      conversations: ['manaty/skygit'],
      isLeader: false
    }],
    ['peer-b', {
      username: 'bob',
      conversations: ['other/repo'],
      isLeader: false
    }]
  ]);

  const peerList = sendDiscoveryPeerList(connection, registry, 'manaty/skygit');

  expect(peerList).toEqual([{
    peerId: 'peer-a',
    username: 'alice',
    conversations: ['manaty/skygit'],
    isLeader: false
  }]);
  expect(sent).toEqual([{
    type: 'peer_list',
    peers: peerList
  }]);
});

test('broadcastDiscoveryPeerListUpdate notifies only open registered connections', () => {
  const calls = [];
  const openConnection = { peer: 'peer-a', open: true };
  const closedConnection = { peer: 'peer-b', open: false };
  const registry = new Map([
    ['peer-a', { connection: openConnection }],
    ['peer-b', { connection: closedConnection }],
    ['peer-c', { connection: null }]
  ]);

  const notifiedPeers = broadcastDiscoveryPeerListUpdate(registry, (connection) => {
    calls.push(connection.peer);
  });

  expect(notifiedPeers).toEqual(['peer-a']);
  expect(calls).toEqual(['peer-a']);
});
