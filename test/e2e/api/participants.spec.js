import { test, expect } from '@playwright/test';
import { buildParticipantRows } from '../../../src/utils/participants.js';

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
