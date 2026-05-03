import { test, expect } from '@playwright/test';
import {
  getConversationPeer,
  sendConversationFile,
  sendConversationMediaStatus,
  sendConversationRecordingStatus,
  sendPeerPayload
} from '../../../src/utils/conversationPeerSignals.js';

test('conversation peer signal helpers find active peers and send generic payloads', () => {
  const sent = [];
  const peer = { send: message => sent.push(message) };
  const updatePeerConnections = updater => updater({ peerA: { conn: peer } });

  expect(getConversationPeer({ peerA: { conn: peer } }, 'peerA')).toBe(peer);
  expect(getConversationPeer({}, 'peerA')).toBeNull();
  expect(sendPeerPayload({
    updatePeerConnections,
    currentCallPeer: 'peerA',
    message: { type: 'signal' }
  })).toBe(true);
  expect(sendPeerPayload({
    updatePeerConnections,
    currentCallPeer: 'missing',
    message: { type: 'missing' }
  })).toBe(false);
  expect(sent).toEqual([{ type: 'signal' }]);
});

test('conversation peer signal helpers shape media and recording messages', () => {
  const sent = [];
  const updatePeerConnections = updater => updater({
    peerA: {
      conn: {
        send: message => sent.push(message)
      }
    }
  });

  expect(sendConversationMediaStatus({
    updatePeerConnections,
    currentCallPeer: 'peerA',
    micOn: true,
    cameraOn: false
  })).toBe(true);
  expect(sendConversationRecordingStatus({
    updatePeerConnections,
    currentCallPeer: 'peerA',
    recording: true
  })).toBe(true);

  expect(sent).toEqual([
    { type: 'media-status', micOn: true, cameraOn: false },
    { type: 'recording-status', recording: true }
  ]);
});

test('sendConversationFile sends only through peers with file transfer support', () => {
  const calls = [];
  const file = { name: 'demo.txt' };
  const updatePeerConnections = updater => updater({
    peerA: {
      conn: {
        sendFile: nextFile => calls.push(['sendFile', nextFile])
      }
    },
    peerB: {
      conn: {}
    }
  });

  expect(sendConversationFile({
    updatePeerConnections,
    currentCallPeer: 'peerA',
    file
  })).toBe(true);
  expect(sendConversationFile({
    updatePeerConnections,
    currentCallPeer: 'peerB',
    file
  })).toBe(false);
  expect(calls).toEqual([['sendFile', file]]);
});
