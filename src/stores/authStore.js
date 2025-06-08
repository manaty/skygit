import { writable } from 'svelte/store';
import { clearAllSessionIds } from '../utils/sessionManager.js';

export const authStore = writable({
  isLoggedIn: false,
  token: null,
  user: null
});

export function logoutUser() {
    authStore.set({
      isLoggedIn: false,
      token: null,
      user: null
    });
    localStorage.removeItem('skygit_token');
    
    // Clear all session IDs on logout
    clearAllSessionIds();
  }