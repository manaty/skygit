import { test, expect } from '@playwright/test';
import {
  createConversationFileSendState,
  getConversationInputFile,
  startConversationFileSend
} from '../../../src/services/conversationFileSendService.js';

test('conversation file send service reads the first input file and builds send state', () => {
  const file = { name: 'demo.txt' };

  expect(getConversationInputFile({ target: { files: [file] } })).toBe(file);
  expect(getConversationInputFile({ target: { files: [] } })).toBeNull();
  expect(getConversationInputFile(null)).toBeNull();
  expect(createConversationFileSendState(file)).toEqual({
    fileToSend: file,
    fileSending: true,
    fileSendPercent: 0
  });
});

test('conversation file send service starts transfers only during active peer calls', () => {
  const file = { name: 'demo.txt' };
  const calls = [];
  const result = startConversationFileSend({
    event: { target: { files: [file] } },
    callActive: true,
    currentCallPeer: 'peer-a',
    sendFile: sentFile => calls.push(sentFile)
  });

  expect(result).toEqual({
    status: 'started',
    fileToSend: file,
    fileSending: true,
    fileSendPercent: 0
  });
  expect(calls).toEqual([file]);
});

test('conversation file send service skips missing files and inactive calls', () => {
  const calls = [];

  expect(startConversationFileSend({
    event: { target: { files: [] } },
    callActive: true,
    currentCallPeer: 'peer-a',
    sendFile: file => calls.push(file)
  })).toEqual({ status: 'skipped' });
  expect(startConversationFileSend({
    event: { target: { files: [{ name: 'demo.txt' }] } },
    callActive: false,
    currentCallPeer: 'peer-a',
    sendFile: file => calls.push(file)
  })).toEqual({ status: 'skipped' });
  expect(startConversationFileSend({
    event: { target: { files: [{ name: 'demo.txt' }] } },
    callActive: true,
    currentCallPeer: null,
    sendFile: file => calls.push(file)
  })).toEqual({ status: 'skipped' });
  expect(calls).toEqual([]);
});
