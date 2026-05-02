import { test, expect } from '@playwright/test';
import { bindConnectionEvents } from '../../../src/utils/peerConnectionEvents.js';

function createConnection() {
  const handlers = new Map();

  return {
    boundEvents: [],
    on(eventName, handler) {
      this.boundEvents.push(eventName);
      handlers.set(eventName, handler);
    },
    emit(eventName, payload) {
      handlers.get(eventName)?.(payload);
    }
  };
}

test('bindConnectionEvents attaches provided PeerJS connection handlers', () => {
  const connection = createConnection();
  const calls = [];

  const result = bindConnectionEvents(connection, {
    open: () => calls.push('open'),
    data: (payload) => calls.push(['data', payload]),
    close: () => calls.push('close'),
    error: (error) => calls.push(['error', error.message])
  });

  const error = new Error('boom');
  connection.emit('open');
  connection.emit('data', { type: 'heartbeat' });
  connection.emit('close');
  connection.emit('error', error);

  expect(result).toBe(connection);
  expect(connection.boundEvents).toEqual(['open', 'data', 'close', 'error']);
  expect(calls).toEqual([
    'open',
    ['data', { type: 'heartbeat' }],
    'close',
    ['error', 'boom']
  ]);
});

test('bindConnectionEvents skips missing handlers', () => {
  const connection = createConnection();

  bindConnectionEvents(connection, {
    data: () => {}
  });

  expect(connection.boundEvents).toEqual(['data']);
});
