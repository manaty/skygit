import { test, expect } from '@playwright/test';
import {
  createConversationCallSignal,
  endConversationCallSession,
  getConversationCallPeerId,
  startConversationCallSession,
  stopConversationLocalStream
} from '../../../src/services/conversationCallSessionService.js';

test('conversation call session service normalizes peer ids and creates signal payloads', () => {
  expect(getConversationCallPeerId('peer-a')).toBe('peer-a');
  expect(getConversationCallPeerId({ session_id: 'peer-b' })).toBe('peer-b');
  expect(createConversationCallSignal('call-offer', 'conversation-a')).toEqual({
    type: 'signal',
    subtype: 'call-offer',
    conversationId: 'conversation-a'
  });
});

test('conversation call session service starts calls and sends offers', () => {
  const calls = [];
  const result = startConversationCallSession({
    peer: { session_id: 'peer-a' },
    conversationId: 'conversation-a',
    sendMessageToPeer: (...args) => calls.push(args)
  });

  expect(result).toEqual({
    status: 'started',
    callActive: true,
    currentCallPeer: 'peer-a'
  });
  expect(calls).toEqual([
    ['peer-a', {
      type: 'signal',
      subtype: 'call-offer',
      conversationId: 'conversation-a'
    }]
  ]);
});

test('conversation call session service ends calls after notifying the active peer', () => {
  const calls = [];
  const result = endConversationCallSession({
    currentCallPeer: 'peer-a',
    conversationId: 'conversation-a',
    localStream: 'stream-a',
    sendMessageToPeer: (...args) => calls.push(['send', ...args]),
    stopLocalStream: stream => {
      calls.push(['stop', stream]);
      return true;
    }
  });

  expect(result).toEqual({
    status: 'ended',
    callActive: false,
    currentCallPeer: null,
    localStream: null,
    remoteStream: null,
    notifiedPeer: true,
    stoppedLocalStream: true
  });
  expect(calls).toEqual([
    ['stop', 'stream-a'],
    ['send', 'peer-a', {
      type: 'signal',
      subtype: 'call-end',
      conversationId: 'conversation-a'
    }]
  ]);
});

test('conversation call session service stops every local stream track', () => {
  const calls = [];
  const stream = {
    getTracks: () => [
      { stop: () => calls.push('audio') },
      { stop: () => calls.push('video') }
    ]
  };

  expect(stopConversationLocalStream(stream)).toBe(true);
  expect(stopConversationLocalStream(null)).toBe(false);
  expect(calls).toEqual(['audio', 'video']);
});
