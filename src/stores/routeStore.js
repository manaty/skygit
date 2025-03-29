// src/stores/routeStore.js
import { writable } from "svelte/store";

export const currentRoute = writable("home"); // or 'login', 'settings', etc.
export const currentContent = writable(null); // e.g., selected repo or conversation