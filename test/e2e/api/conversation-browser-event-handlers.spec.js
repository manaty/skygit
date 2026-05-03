import { test, expect } from '@playwright/test';
import { createConversationBrowserEventHandlers } from '../../../src/services/conversationBrowserEventHandlers.js';

function createHandlers(calls) {
  return createConversationBrowserEventHandlers({
    setRemoteRecording: recording => calls.push(['recording', recording]),
    setRemoteScreenShare: (active, meta) => calls.push(['screen', active, meta]),
    setRemoteMediaStatus: status => calls.push(['media', status]),
    setReceiveState: state => calls.push(['receive', state]),
    clearReceiveState: () => calls.push(['clearReceive']),
    setSendState: state => calls.push(['send', state]),
    clearSendState: () => calls.push(['clearSend']),
    applyReceiveProgress: options => {
      calls.push(['applyReceive', options.meta, options.received, options.total]);
      options.setReceiveState({ name: options.meta.name, percent: 50 });
      options.clearReceiveState();
    },
    applySendProgress: options => {
      calls.push(['applySend', options.sent, options.total]);
      options.setSendState({ percent: 100 });
      options.clearSendState();
    }
  });
}

test('conversation browser event handlers update remote recording, screen and media state', () => {
  const calls = [];
  const handlers = createHandlers(calls);

  handlers.onRecordingStatus({ recording: 1 });
  handlers.onScreenShare(true, { source: 'screen' });
  handlers.onScreenShare(false);
  handlers.onMediaStatus({ micOn: false, cameraOn: true });

  expect(calls).toEqual([
    ['recording', true],
    ['screen', true, { source: 'screen' }],
    ['screen', false, null],
    ['media', { micOn: false, cameraOn: true }]
  ]);
});

test('conversation browser event handlers delegate transfer progress updates', () => {
  const calls = [];
  const handlers = createHandlers(calls);

  handlers.onFileReceiveProgress({ name: 'demo.txt' }, 5, 10);
  handlers.onFileSendProgress({}, 10, 10);

  expect(calls).toEqual([
    ['applyReceive', { name: 'demo.txt' }, 5, 10],
    ['receive', { name: 'demo.txt', percent: 50 }],
    ['clearReceive'],
    ['applySend', 10, 10],
    ['send', { percent: 100 }],
    ['clearSend']
  ]);
});
