import { writable } from 'svelte/store';

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
  }