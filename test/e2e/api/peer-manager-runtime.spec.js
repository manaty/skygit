import { test, expect } from '@playwright/test';
import { createPeerManagerRuntime } from '../../../src/services/peerManagerRuntime.js';

test('createPeerManagerRuntime initializes peer lifecycle and exposes public session state', () => {
  const calls = [];
  const runtime = createPeerManagerRuntime(createRuntimeDependencies(calls));

  const peer = runtime.initializePeerManager({
    _token: 'token',
    _repoFullName: 'manaty/skygit',
    _username: 'alice',
    _sessionId: 'session-a'
  });

  expect(peer.id).toBe(runtime.getLocalPeerId());
  expect(runtime.getLocalSessionId()).toBe('session-a');
  expect(calls).toContainEqual(['peer:on', 'open']);
  expect(calls).toContainEqual(['peer:on', 'connection']);

  runtime.initializeCallHandling();
  expect(calls).toContainEqual(['peer:on', 'call']);
});

test('createPeerManagerRuntime binds beforeunload cleanup through the runtime facade', () => {
  const calls = [];
  const runtime = createPeerManagerRuntime(createRuntimeDependencies(calls));
  const fakeWindow = createFakeWindow(calls);

  runtime.initializePeerManager({
    _token: 'token',
    _repoFullName: 'manaty/skygit',
    _username: 'alice',
    _sessionId: 'session-a'
  });

  const unbind = runtime.bindWindowUnload(fakeWindow);
  fakeWindow.emit('beforeunload');
  unbind();

  expect(calls).toContainEqual(['window:add', 'beforeunload']);
  expect(calls).toContainEqual(['window:remove', 'beforeunload']);
  expect(calls).toContainEqual(['peer:destroy']);
  expect(calls).toContainEqual(['peerConnections:set', {}]);
  expect(calls).toContainEqual(['onlinePeers:set', []]);
  expect(calls).toContainEqual(['typingUsers:set', {}]);
});

function createRuntimeDependencies(calls) {
  class FakePeer {
    constructor(id) {
      this.id = id;
      this.open = true;
      calls.push(['peer:new', id]);
    }

    on(event) {
      calls.push(['peer:on', event]);
    }

    destroy() {
      calls.push(['peer:destroy']);
    }
  }

  const peerConnections = createStore('peerConnections', {}, calls);
  const onlinePeers = createStore('onlinePeers', [], calls);
  const typingUsers = createStore('typingUsers', {}, calls);

  return {
    PeerClass: FakePeer,
    authStore: createStore('authStore', { token: 'token' }, calls),
    conversations: createStore('conversations', new Map(), calls),
    committedEvents: createStore('committedEvents', null, calls),
    appendMessage: (...args) => calls.push(['appendMessage', ...args]),
    appendMessages: (...args) => calls.push(['appendMessages', ...args]),
    markMessagesCommitted: (...args) => calls.push(['markMessagesCommitted', ...args]),
    queueConversationForCommit: (...args) => calls.push(['queueConversationForCommit', ...args]),
    flushConversationCommitQueue: () => calls.push(['flushConversationCommitQueue']),
    loadContacts: () => calls.push(['loadContacts']),
    updateContact: (...args) => calls.push(['updateContact', ...args]),
    setLastMessage: (...args) => calls.push(['setLastMessage', ...args]),
    peerStores: { peerConnections, onlinePeers, typingUsers },
    callStores: {
      callStatus: createStore('callStatus', 'idle', calls),
      localStream: createStore('localStream', null, calls),
      remoteStream: createStore('remoteStream', null, calls),
      remotePeerId: createStore('remotePeerId', null, calls),
      isVideoEnabled: createStore('isVideoEnabled', true, calls),
      isAudioEnabled: createStore('isAudioEnabled', true, calls),
      isScreenSharing: createStore('isScreenSharing', false, calls),
      callStartTime: createStore('callStartTime', null, calls)
    },
    resetCallState: () => calls.push(['resetCallState']),
    getStoreValue: store => store.value,
    getStorage: () => ({ getItem: () => null, setItem: () => {} }),
    getMediaDevices: () => ({ getUserMedia: () => Promise.resolve('stream') }),
    getAlertUser: () => () => {},
    log: (...args) => calls.push(['log', ...args]),
    warn: (...args) => calls.push(['warn', ...args]),
    reportError: (...args) => calls.push(['error', ...args])
  };
}

function createStore(name, initialValue, calls) {
  const store = {
    value: initialValue,
    set(nextValue) {
      store.value = nextValue;
      calls.push([`${name}:set`, nextValue]);
    },
    update(updater) {
      store.value = updater(store.value);
      calls.push([`${name}:update`, store.value]);
    },
    subscribe(callback) {
      calls.push([`${name}:subscribe`]);
      return () => calls.push([`${name}:unsubscribe`]);
    }
  };

  return store;
}

function createFakeWindow(calls) {
  const handlers = new Map();

  return {
    addEventListener(event, handler) {
      handlers.set(event, handler);
      calls.push(['window:add', event]);
    },
    removeEventListener(event) {
      handlers.delete(event);
      calls.push(['window:remove', event]);
    },
    emit(event) {
      handlers.get(event)?.();
    }
  };
}
