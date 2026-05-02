import { test, expect } from '@playwright/test';
import {
  buildConnectedSessions,
  buildParticipantRows,
  getConnectedParticipantSummary
} from '../../../src/utils/participants.js';

test('buildParticipantRows merges local, connected, and known online peers', () => {
  const rows = buildParticipantRows({
    currentUsername: 'alice',
    currentLeader: 'peer-bob',
    localPeerId: 'peer-alice',
    peerConnections: {
      'peer-bob': { username: 'bob', status: 'connected' },
      'peer-carol': { username: 'carol', status: 'disconnected' },
      'peer-alice-alt': { username: 'alice', status: 'connected' }
    },
    onlinePeers: [
      { username: 'dana' }
    ]
  });

  expect(rows).toEqual([
    {
      username: 'alice',
      displayName: 'You',
      connected: true,
      leader: false,
      userAgentCount: 2
    },
    {
      username: 'bob',
      displayName: 'bob',
      connected: true,
      leader: true,
      userAgentCount: 1
    },
    {
      username: 'carol',
      displayName: 'carol',
      connected: false,
      leader: false,
      userAgentCount: 1
    },
    {
      username: 'dana',
      displayName: 'dana',
      connected: false,
      leader: false,
      userAgentCount: 0
    }
  ]);
});

test('buildConnectedSessions includes local session and connected remotes only', () => {
  const sessions = buildConnectedSessions({
    currentUsername: 'alice',
    localPeerId: 'peer-alice',
    peerConnections: {
      'peer-bob': { username: 'bob', status: 'connected' },
      'peer-carol': { username: 'carol', status: 'disconnected' }
    }
  });

  expect(sessions).toEqual([
    { username: 'alice', sessionId: 'peer-alice', isLocal: true },
    { username: 'bob', sessionId: 'peer-bob', isLocal: false }
  ]);
});

test('getConnectedParticipantSummary counts connected users and user agents', () => {
  const summary = getConnectedParticipantSummary({
    currentUsername: 'alice',
    peerConnections: {
      'peer-bob': { username: 'bob', status: 'connected' },
      'peer-alice-alt': { username: 'alice', status: 'connected' },
      'peer-carol': { username: 'carol', status: 'disconnected' }
    }
  });

  expect(summary).toEqual({
    connectedUserAgents: 3,
    connectedUsers: 2,
    allKnownUsers: 2
  });
});
