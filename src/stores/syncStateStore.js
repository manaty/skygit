import { writable } from 'svelte/store';

export const syncState = writable({
    phase: 'streaming', // 'streaming' | 'discovery' | 'idle'
    paused: false,
    loadedCount: 0,
    totalCount: null
  });