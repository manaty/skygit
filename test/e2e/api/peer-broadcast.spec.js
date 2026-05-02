import { test, expect } from '@playwright/test';
import {
  buildOnlinePeerRows,
  canSendToConnection,
  getAllBroadcastTargets,
  getConversationBroadcastTargets,
  isConversationParticipant
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
