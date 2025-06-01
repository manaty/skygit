import { writable } from 'svelte/store';

export const settingsStore = writable({
  config: null,
  secrets: {},
  secretsSha: null,
  cleanupMode: false
});