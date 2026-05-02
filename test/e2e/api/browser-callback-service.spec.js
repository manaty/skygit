import { test, expect } from '@playwright/test';
import { registerSkyGitBrowserCallbacks } from '../../../src/services/browserCallbackService.js';

test('registerSkyGitBrowserCallbacks installs callbacks on the provided window object', () => {
  const windowRef = {};
  const calls = [];

  registerSkyGitBrowserCallbacks({
    windowRef,
    onRecordingStatus: status => calls.push(['recording', status]),
    onScreenShare: (active, meta) => calls.push(['screen', active, meta]),
    onMediaStatus: status => calls.push(['media', status]),
    onFileReceiveProgress: (meta, received, total) => calls.push(['receive', meta, received, total]),
    onFileSendProgress: (meta, sent, total) => calls.push(['send', meta, sent, total])
  });

  windowRef.skygitOnRecordingStatus({ recording: true });
  windowRef.skygitOnScreenShare(true, { audio: true });
  windowRef.skygitOnMediaStatus({ micOn: false });
  windowRef.skygitFileReceiveProgress({ name: 'demo.webm' }, 5, 10);
  windowRef.skygitFileSendProgress({ name: 'demo.webm' }, 10, 10);

  expect(calls).toEqual([
    ['recording', { recording: true }],
    ['screen', true, { audio: true }],
    ['media', { micOn: false }],
    ['receive', { name: 'demo.webm' }, 5, 10],
    ['send', { name: 'demo.webm' }, 10, 10]
  ]);
});

test('registerSkyGitBrowserCallbacks removes only callbacks it installed', () => {
  const windowRef = {};
  const replacement = () => {};
  const unregister = registerSkyGitBrowserCallbacks({
    windowRef,
    onRecordingStatus: () => {},
    onScreenShare: () => {},
    onMediaStatus: () => {},
    onFileReceiveProgress: () => {},
    onFileSendProgress: () => {}
  });

  windowRef.skygitOnScreenShare = replacement;
  unregister();

  expect(windowRef.skygitOnRecordingStatus).toBeUndefined();
  expect(windowRef.skygitOnScreenShare).toBe(replacement);
  expect(windowRef.skygitOnMediaStatus).toBeUndefined();
  expect(windowRef.skygitFileReceiveProgress).toBeUndefined();
  expect(windowRef.skygitFileSendProgress).toBeUndefined();
});
