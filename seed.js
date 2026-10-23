const SEED_URL = new URL('./seed_words.json', import.meta.url);
let cachedWords;

async function loadSeedWords() {
  if (cachedWords) return cachedWords;
  const response = await fetch(SEED_URL);
  if (!response.ok) throw new Error('기본 단어를 불러올 수 없습니다');
  cachedWords = await response.json();
  return cachedWords;
}

export { loadSeedWords };
