import { writable } from 'svelte/store';

const initialState = {
  phase: 'idle', // 'streaming' | 'discover-orgs' | 'discover-repos' | 'idle'
  paused: true,
  loadedCount: 0,
  totalCount: null,
  organizations: [],
  currentOrg: null,
  userLogin: null,
  lastCompletedOrg: null
};

export const syncState = writable(initialState);
