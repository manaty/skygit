import { writable } from 'svelte/store';

export const peerConnections = writable({});
export const onlinePeers = writable([]);
export const typingUsers = writable({});
