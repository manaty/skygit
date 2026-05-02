import { test, expect } from '@playwright/test';
import {
  findConversationParticipants,
  getConnectedParticipants,
  getConversationStoreParticipants,
  getParticipantFallbackOrgId,
  getStoredOrgParticipants
} from '../../../src/utils/peerParticipants.js';

test('getConnectedParticipants maps peer connections to participant rows', () => {
  expect(getConnectedParticipants({
    'peer-a': { username: 'alice', status: 'connected' },
    'peer-b': { username: 'bob', status: 'connecting' }
  })).toEqual([
    { peerId: 'peer-a', username: 'alice' },
    { peerId: 'peer-b', username: 'bob' }
  ]);
});

test('getConversationStoreParticipants links participants to connected peer ids', () => {
  const conversation = {
    participants: ['alice', 'bob']
  };
  const connections = {
    'peer-a': { username: 'alice' }
  };

  expect(getConversationStoreParticipants(conversation, connections)).toEqual([
    { peerId: 'peer-a', username: 'alice' },
    { peerId: null, username: 'bob' }
  ]);
});

test('getConversationStoreParticipants returns null when no participants exist', () => {
  expect(getConversationStoreParticipants({ id: 'conversation-a' }, {})).toBeNull();
  expect(getConversationStoreParticipants(null, {})).toBeNull();
});

test('findConversationParticipants locates repo conversations and maps participants', () => {
  const connections = {
    'peer-a': { username: 'alice' }
  };
  const conversationsMap = {
    'manaty/skygit': [
      { id: 'conversation-a', participants: ['alice', 'bob'] }
    ]
  };

  expect(findConversationParticipants(conversationsMap, 'manaty/skygit', 'conversation-a', connections)).toEqual([
    { peerId: 'peer-a', username: 'alice' },
    { peerId: null, username: 'bob' }
  ]);
  expect(findConversationParticipants(conversationsMap, 'manaty/skygit', 'missing', connections)).toBeNull();
});

test('getParticipantFallbackOrgId derives org ids only with a repo name', () => {
  expect(getParticipantFallbackOrgId('manaty/skygit', (repo) => repo.split('/')[0])).toBe('manaty');
  expect(getParticipantFallbackOrgId(null, () => 'unused')).toBeNull();
});

test('getStoredOrgParticipants reads persisted discovery peers', () => {
  const storage = {
    getItem(key) {
      expect(key).toBe('skygit_peers_manaty');
      return JSON.stringify([
        { peerId: 'peer-a', username: 'alice', online: true },
        { peerId: 'peer-b', username: 'bob', online: false }
      ]);
    }
  };

  expect(getStoredOrgParticipants(storage, 'manaty')).toEqual([
    { peerId: 'peer-a', username: 'alice' },
    { peerId: 'peer-b', username: 'bob' }
  ]);
});

test('getStoredOrgParticipants returns null without an org or stored peers', () => {
  const storage = {
    getItem() {
      return null;
    }
  };

  expect(getStoredOrgParticipants(storage, null)).toBeNull();
  expect(getStoredOrgParticipants(storage, 'manaty')).toBeNull();
});
