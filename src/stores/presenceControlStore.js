import { writable } from 'svelte/store';

// Map repoFullName -> boolean (true means polling active)
export const presencePolling = writable({});

export function setPollingState(repoFullName, active) {
  presencePolling.update((m) => ({ ...m, [repoFullName]: active }));
}

export function isPollingActive(map, repoFullName) {
  return !!map[repoFullName];
}
