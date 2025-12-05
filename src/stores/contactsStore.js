import { writable, derived, get } from 'svelte/store';
import { peerConnections } from '../services/peerJsManager.js';

// Store for all known contacts (persisted)
export const contacts = writable({});

// Store for last messages per contact
export const lastMessages = writable({});

/**
 * Load contacts from localStorage for a specific organization
 */
export function loadContacts(orgId) {
  try {
    const key = `skygit_peers_${orgId}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      const peers = JSON.parse(stored);
      const contactMap = {};

      peers.forEach(peer => {
        contactMap[peer.username.toLowerCase()] = {
          peerId: peer.peerId,
          username: peer.username.toLowerCase(),
          conversations: peer.conversations || [],
          isLeader: peer.isLeader || false,
          lastSeen: peer.lastSeen,
          online: false // Will be updated from peerConnections
        };
      });

      contacts.set(contactMap);
      console.log('[Contacts] Loaded', peers.length, 'contacts for org:', orgId);
    }
  } catch (error) {
    console.error('[Contacts] Failed to load contacts:', error);
  }
}

/**
 * Update contact online status based on peer connections
 */
export function updateContactsOnlineStatus() {
  const conns = get(peerConnections);
  const currentContacts = get(contacts);

  const updated = { ...currentContacts };

  // Mark all as offline first
  Object.keys(updated).forEach(username => {
    updated[username].online = false;
  });

  // Mark connected peers as online
  Object.values(conns).forEach(({ username, status }) => {
    if (updated[username] && status === 'connected') {
      updated[username].online = true;
    }
  });

  contacts.set(updated);
}

/**
 * Add or update a contact
 */
export function updateContact(username, contactData) {
  const lowerUser = username.toLowerCase();
  contacts.update(contacts => ({
    ...contacts,
    [lowerUser]: {
      ...contacts[lowerUser],
      ...contactData,
      username: lowerUser // Ensure username is consistent
    }
  }));
}

/**
 * Store last message for a contact
 */
export function setLastMessage(username, message) {
  const lowerUser = username.toLowerCase();
  lastMessages.update(messages => ({
    ...messages,
    [lowerUser]: {
      content: message.content,
      timestamp: message.timestamp,
      sender: message.sender
    }
  }));
}

/**
 * Get derived store with contacts sorted by online status and last activity
 */
export const sortedContacts = derived(
  [contacts, lastMessages, peerConnections],
  ([$contacts, $lastMessages, $peerConnections]) => {
    const contactList = Object.values($contacts);

    // Update online status
    contactList.forEach(contact => {
      const conn = Object.values($peerConnections).find(c => c.username === contact.username);
      contact.online = conn?.status === 'connected';
      contact.userAgent = conn?.userAgent || 0;
    });

    // Sort: online first, then by last message time, then by username
    return contactList.sort((a, b) => {
      // Online status first
      if (a.online !== b.online) {
        return b.online - a.online;
      }

      // Then by last message time
      const aLastMsg = $lastMessages[a.username]?.timestamp || 0;
      const bLastMsg = $lastMessages[b.username]?.timestamp || 0;
      if (aLastMsg !== bLastMsg) {
        return bLastMsg - aLastMsg;
      }

      // Finally by username
      return a.username.localeCompare(b.username);
    });
  }
);