import { getAll } from './storage.js';

export const state = { words: [], attempts: [] };
const listeners = new Set();

export function onDataChange(listener) { listeners.add(listener); }

export async function refreshData() {
  [state.words, state.attempts] = await Promise.all([getAll('words'), getAll('attempts')]);
  for (const listener of listeners) listener();
}
