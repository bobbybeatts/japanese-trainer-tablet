import { category, koreanReading, wordPronunciation } from './kana.js';
import { state, refreshData, onDataChange } from './state.js';
import { addOne, deleteOne, putOne } from './storage.js';
import { resetQuiz } from './study.js';
import { $, normalize, showToast } from './ui.js';

async function addWord(event) {
  event.preventDefault();
  const expression = $('#newExpression').value.trim();
  const reading = $('#newReading').value.trim();
  const pronunciation = $('#newPronunciation').value.trim() || koreanReading(reading);
  const meaning = $('#newMeaning').value.trim();
  const wordCategory = category(expression);
  if (!wordCategory || !category(reading)) {
    $('#addWordMessage').textContent = '일본어 표기와 읽기는 가나 문자로 입력해 주세요.'; return;
  }
  if (state.words.some(word => word.expression === expression && word.reading === reading)) {
    $('#addWordMessage').textContent = '이미 저장된 단어입니다.'; return;
  }
  await addOne('words', { expression, reading, pronunciation, meaning, category: wordCategory, source: 'user', correct: 0, wrong: 0, pending: 0, createdAt: new Date().toISOString() });
  event.target.reset(); $('#newPronunciation').dataset.edited = ''; $('#addWordMessage').textContent = '새 단어를 태블릿에 저장했습니다.';
  await refreshData(); resetQuiz(); showToast('단어를 저장했어요');
}

function renderWordList() {
  const query = normalize($('#wordSearch')?.value || '');
  const words = [...state.words].reverse().filter(word => !query || normalize(`${word.expression}${word.reading}${wordPronunciation(word)}${word.meaning}`).includes(query));
  $('#wordList').innerHTML = words.length ? words.map(word => `
    <article class="word-item">
      <div class="jp">${escapeHtml(word.expression)}</div>
      <div class="details"><div class="reading">${escapeHtml(word.reading)} · ${escapeHtml(word.category)}</div><div class="pronunciation">한국 발음 ${escapeHtml(wordPronunciation(word))}</div><div class="meaning">${escapeHtml(word.meaning || '뜻 미등록')}</div></div>
      <button class="edit-pronunciation" data-pronunciation="${escapeHtml(word.id)}" type="button" aria-label="${escapeHtml(word.expression)} 한국 발음 수정">수정</button>
      <button class="delete-word" data-delete="${escapeHtml(word.id)}" type="button" aria-label="${escapeHtml(word.expression)} 삭제">×</button>
    </article>`).join('') : '<div class="empty-state">조건에 맞는 단어가 없습니다.</div>';
}

function escapeHtml(text) {
  const entities = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return String(text).replace(/[&<>"']/g, char => entities[char]);
}

async function deleteWord(id) {
  const word = state.words.find(item => item.id === id);
  if (!word || !confirm(`“${word.expression}” 단어를 삭제할까요?`)) return;
  await deleteOne('words', id); await refreshData(); resetQuiz(); showToast('단어를 삭제했어요');
}

async function editPronunciation(id) {
  const word = state.words.find(item => item.id === id);
  if (!word) return;
  const input = prompt(`“${word.expression}”의 한국 발음을 입력하세요. 비우면 자동 발음으로 복원합니다.`,
    wordPronunciation(word));
  if (input === null) return;
  await putOne('words', { ...word, pronunciation: input.trim() || koreanReading(word.reading) });
  await refreshData(); resetQuiz(); showToast('한국 발음을 저장했어요');
}

export function initWords() {
  onDataChange(() => {
    $('#wordTotal').textContent = state.words.length;
    if ($('#wordsView').classList.contains('active')) renderWordList();
  });
  $('#addWordForm').addEventListener('submit', addWord);
  $('#newReading').addEventListener('input', event => {
    const field = $('#newPronunciation');
    if (!field.dataset.edited) field.value = koreanReading(event.target.value.trim());
  });
  $('#newPronunciation').addEventListener('input', event => { event.target.dataset.edited = 'yes'; });
  $('#wordSearch').addEventListener('input', renderWordList);
  $('#wordList').addEventListener('click', async event => {
    const id = Number(event.target.dataset.delete);
    if (id) return deleteWord(id);
    const pronunciationId = Number(event.target.dataset.pronunciation);
    if (pronunciationId) return editPronunciation(pronunciationId);
  });
}

export { renderWordList };
