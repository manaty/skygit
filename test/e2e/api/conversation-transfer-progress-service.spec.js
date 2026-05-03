import { test, expect } from '@playwright/test';
import {
  applyConversationFileReceiveProgress,
  applyConversationFileSendProgress,
  createFileReceiveProgressState,
  createFileSendProgressState,
  isTransferComplete
} from '../../../src/services/conversationTransferProgressService.js';

test('conversation transfer progress service creates receive and send progress state', () => {
  const calculatePercent = (done, total) => Math.floor((done / total) * 100);

  expect(createFileReceiveProgressState(
    { name: 'archive.zip' },
    25,
    100,
    calculatePercent
  )).toEqual({
    name: 'archive.zip',
    progress: { received: 25, total: 100 },
    percent: 25
  });
  expect(createFileSendProgressState(40, 80, calculatePercent)).toEqual({ percent: 50 });
  expect(isTransferComplete(80, 80)).toBe(true);
  expect(isTransferComplete(40, 80)).toBe(false);
});

test('conversation transfer progress service schedules receive state cleanup on completion', () => {
  const calls = [];

  applyConversationFileReceiveProgress({
    meta: { name: 'video.webm' },
    received: 100,
    total: 100,
    setReceiveState: state => calls.push(['receive', state]),
    clearReceiveState: () => calls.push(['clearReceive']),
    schedule: (callback, delay) => {
      calls.push(['schedule', delay]);
      callback();
    },
    calculatePercent: () => 100
  });

  expect(calls).toEqual([
    ['receive', {
      name: 'video.webm',
      progress: { received: 100, total: 100 },
      percent: 100
    }],
    ['schedule', 3000],
    ['clearReceive']
  ]);
});

test('conversation transfer progress service schedules send state cleanup on completion', () => {
  const calls = [];

  applyConversationFileSendProgress({
    sent: 10,
    total: 10,
    setSendState: state => calls.push(['send', state]),
    clearSendState: () => calls.push(['clearSend']),
    schedule: (callback, delay) => {
      calls.push(['schedule', delay]);
      callback();
    },
    calculatePercent: () => 100
  });

  expect(calls).toEqual([
    ['send', { percent: 100 }],
    ['schedule', 2000],
    ['clearSend']
  ]);
});
