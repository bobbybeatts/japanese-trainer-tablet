import { category, koreanReading } from './kana.js';
import { loadSeedWords } from './seed.js';

let db;
const SEED_MARKER = 'kananote-seed-507';

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('kananote', 1);
    request.onupgradeneeded = () => {
      const next = request.result;
      const words = next.createObjectStore('words', { keyPath: 'id', autoIncrement: true });
      words.createIndex('expressionReading', ['expression', 'reading'], { unique: true });
      next.createObjectStore('attempts', { keyPath: 'id', autoIncrement: true });
    };
    request.onsuccess = () => { db = request.result; resolve(db); };
    request.onerror = () => reject(request.error);
  });
}

function storeRequest(storeName, mode, action) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, mode);
    const request = action(transaction.objectStore(storeName));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

const getAll = store => storeRequest(store, 'readonly', objectStore => objectStore.getAll());
const putOne = (store, value) => storeRequest(store, 'readwrite', objectStore => objectStore.put(value));
const addOne = (store, value) => storeRequest(store, 'readwrite', objectStore => objectStore.add(value));
const deleteOne = (store, key) => storeRequest(store, 'readwrite', objectStore => objectStore.delete(key));
const clearStore = store => storeRequest(store, 'readwrite', objectStore => objectStore.clear());

async function seedDatabase() {
  const existing = await getAll('words');
  let seeded = false;
  try { seeded = localStorage.getItem(SEED_MARKER) === 'done'; } catch (_) { /* 저장소가 제한된 브라우저 */ }
  if (existing.length && seeded) return;
  const words = await loadSeedWords();
  const known = new Set(existing.map(word => `${word.expression}\u0000${word.reading}`));
  let previousCount = 55;
  try {
    if (localStorage.getItem('kananote-seed-120') === 'done') previousCount = 120;
  } catch (_) { /* 저장소가 제한된 브라우저 */ }
  const additions = existing.length ? words.slice(previousCount) : words;
  for (const [expression, reading, meaning] of additions) {
    if (known.has(`${expression}\u0000${reading}`)) continue;
    await addOne('words', { expression, reading, meaning, pronunciation: koreanReading(reading), category: category(expression), source: 'built-in', correct: 0, wrong: 0, pending: 0, createdAt: new Date().toISOString() });
  }
  try { localStorage.setItem(SEED_MARKER, 'done'); } catch (_) { /* 저장소가 제한된 브라우저 */ }
}

async function fillMissingPronunciations() {
  for (const word of await getAll('words')) {
    if (typeof word.pronunciation === 'string' && word.pronunciation.trim()) continue;
    await putOne('words', { ...word, pronunciation: koreanReading(word.reading) });
  }
}

function replaceBackup(words, attempts) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['words', 'attempts'], 'readwrite');
    transaction.oncomplete = () => resolve();
    transaction.onabort = () => reject(transaction.error || new Error('복원이 취소되었습니다'));
    transaction.onerror = () => reject(transaction.error || new Error('복원에 실패했습니다'));
    const wordStore = transaction.objectStore('words');
    const attemptStore = transaction.objectStore('attempts');
    try {
      wordStore.clear();
      attemptStore.clear();
      for (const word of words) wordStore.put(word);
      for (const attempt of attempts) attemptStore.put(attempt);
    } catch (error) {
      transaction.abort();
      reject(error);
    }
  });
}

export { openDatabase, seedDatabase, fillMissingPronunciations, replaceBackup, getAll, putOne, addOne, deleteOne, clearStore };
