import { test, expect } from '@playwright/test';
import {
  buildOnlinePeerRows,
  canSendToConnection,
  getAllBroadcastTargets,
  getConversationBroadcastTargets,
  getNonParticipantPeers,
  isConversationParticipant,
  sendToBroadcastTargets,
  sendToPeerConnection
} from '../../../src/utils/peerBroadcast.js';

const openConn = { open: true };
const closedConn = { open: false };

test('buildOnlinePeerRows maps peer connections to UI rows', () => {
  expect(buildOnlinePeerRows({
    'peer-a': { username: 'alice' },
    'peer-b': { username: 'bob' }
  }, 1234)).toEqual([
    { session_id: 'peer-a', username: 'alice', last_seen: 1234 },
    { session_id: 'peer-b', username: 'bob', last_seen: 1234 }
  ]);
});

test('canSendToConnection requires connected status and an open connection', () => {
  expect(canSendToConnection({ conn: openConn, status: 'connected' })).toBe(true);
  expect(canSendToConnection({ conn: closedConn, status: 'connected' })).toBe(false);
  expect(canSendToConnection({ conn: openConn, status: 'connecting' })).toBe(false);
  expect(canSendToConnection(null)).toBe(false);
});

test('isConversationParticipant matches by peer id or username', () => {
  const participants = [
    { peerId: 'peer-a', username: 'alice' },
    { peerId: null, username: 'bob' }
  ];

  expect(isConversationParticipant('peer-a', 'someone', participants)).toBe(true);
  expect(isConversationParticipant('peer-b', 'bob', participants)).toBe(true);
  expect(isConversationParticipant('peer-c', 'carol', participants)).toBe(false);
});

test('getConversationBroadcastTargets returns only participant peer connections', () => {
  const connections = {
    'peer-a': { conn: openConn, status: 'connected', username: 'alice' },
    'peer-b': { conn: openConn, status: 'connected', username: 'bob' },
    'peer-c': { conn: openConn, status: 'connected', username: 'carol' }
  };

  expect(getConversationBroadcastTargets(connections, [
    { peerId: 'peer-a', username: 'alice' },
    { peerId: null, username: 'bob' }
  ])).toEqual([
    { peerId: 'peer-a', conn: openConn, status: 'connected', username: 'alice' },
    { peerId: 'peer-b', conn: openConn, status: 'connected', username: 'bob' }
  ]);
});

test('getAllBroadcastTargets includes every connection with its peer id', () => {
  expect(getAllBroadcastTargets({
    'peer-a': { conn: openConn, status: 'connected', username: 'alice' }
  })).toEqual([
    { peerId: 'peer-a', conn: openConn, status: 'connected', username: 'alice' }
  ]);
});

test('sendToPeerConnection sends only when the peer connection exists', () => {
  const sent = [];
  const connections = {
    'peer-a': { conn: { send: (message) => sent.push(message) } }
  };

  expect(sendToPeerConnection(connections, 'peer-a', { type: 'chat' })).toBe(true);
  expect(sendToPeerConnection(connections, 'peer-b', { type: 'chat' })).toBe(false);
  expect(sent).toEqual([{ type: 'chat' }]);
});

test('getNonParticipantPeers reports connected peers outside the participant list', () => {
  const connections = {
    'peer-a': { username: 'alice' },
    'peer-b': { username: 'bob' },
    'peer-c': { username: 'carol' }
  };

  expect(getNonParticipantPeers(connections, [
    { peerId: 'peer-a', username: 'alice' },
    { peerId: null, username: 'bob' }
  ])).toEqual([
    { peerId: 'peer-c', username: 'carol' }
  ]);
});

test('sendToBroadcastTargets sends to open connected targets and reports failures', () => {
  const sent = [];
  const errors = [];
  const targets = [
    { peerId: 'peer-a', status: 'connected', conn: { open: true, send: (message) => sent.push(['peer-a', message]) } },
    { peerId: 'peer-b', status: 'connecting', conn: { open: true, send: (message) => sent.push(['peer-b', message]) } },
    { peerId: 'peer-c', status: 'connected', conn: { open: false, send: (message) => sent.push(['peer-c', message]) } },
    {
      peerId: 'peer-d',
      status: 'connected',
      conn: {
        open: true,
        send: () => {
          throw new Error('send failed');
        }
      }
    }
  ];

  expect(sendToBroadcastTargets(targets, { type: 'typing' }, (error, peerId) => {
    errors.push([peerId, error.message]);
  })).toBe(1);
  expect(sent).toEqual([
    ['peer-a', { type: 'typing' }]
  ]);
  expect(errors).toEqual([
    ['peer-d', 'send failed']
  ]);
});
