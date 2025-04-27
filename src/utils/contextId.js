// Returns a stable identifier for this browser/storage context.

const KEY = 'skygit_context_id';

export function getContextId() {
  if (typeof window === 'undefined') return 'server';
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(KEY, id);
  }
  return id;
}
