import { writable } from 'svelte/store';

export const settingsStore = writable({
  config: null,
  secrets: {},
  decrypted: {},
  encryptedSecrets: {},
  secretsSha: null,
  cleanupMode: false
});
