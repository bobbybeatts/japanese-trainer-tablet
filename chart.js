import { KANA_SETS, toKatakana, toHiragana, koreanReading, wordPronunciation } from './kana.js';
import { state } from './state.js';
import { createWritingSurface } from './writing.js';
import { $, $$ } from './ui.js';

let chartMode = 'hiragana';
let chartSet = 'basic';
let modalWriting;

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}

function renderKanaChart() {
  const chart = $('#kanaChart');
  const headers = ['', 'a', 'i', 'u', 'e', 'o'];
  const { rows, label } = KANA_SETS[chartSet];
  $('#kanaSetLabel').textContent = label;
  chart.innerHTML = headers.map(text => `<div class="kana-cell header">${text}</div>`).join('');
  for (const [rowName, chars] of rows) {
    chart.insertAdjacentHTML('beforeend', `<div class="kana-cell header">${rowName}</div>`);
    for (const hira of chars) {
      const char = hira && chartMode === 'katakana' ? toKatakana(hira) : hira;
      chart.insertAdjacentHTML('beforeend', char
        ? `<button class="kana-cell kana-button" type="button" data-kana="${char}" aria-label="${char}, ${koreanReading(char)}. 눌러서 따라쓰기"><span class="char">${char}</span><span class="sound">${koreanReading(char)}</span></button>`
        : '<div class="kana-cell empty">·</div>');
    }
  }
}

function renderWordExamples(char) {
  const target = $('#kanaWordExamples');
  const normalized = toHiragana(char);
  const words = state.words.filter(word => {
    const reading = toHiragana(word.reading || '');
    const expression = toHiragana(word.expression || '');
    return reading.includes(normalized) || expression.includes(normalized);
  }).slice(0, 8);
  target.innerHTML = words.length ? words.map(word => `<li class="kana-word-example"><strong>${escapeHtml(word.expression)}</strong><span class="kana-word-reading">${escapeHtml(word.reading)} · ${escapeHtml(wordPronunciation(word))}</span><span class="kana-word-meaning">${escapeHtml(word.meaning)}</span></li>`).join('')
    : '<li class="kana-word-empty">아직 이 글자가 포함된 단어가 없습니다.</li>';
}

function openKanaDialog(char) {
  modalWriting.setCharacter(char);
  renderWordExamples(char);
  const dialog = $('#kanaDialog');
  if (typeof dialog.showModal === 'function') dialog.showModal();
  else dialog.setAttribute('open', '');
  queueMicrotask(() => modalWriting.resize());
}

export function initChart() {
  $$('#scriptSegmented button').forEach(button => button.addEventListener('click', () => {
    chartMode = button.dataset.chart;
    $$('#scriptSegmented button').forEach(item => item.classList.toggle('active', item === button));
    renderKanaChart();
  }));
  $$('#kanaSetSegmented button').forEach(button => button.addEventListener('click', () => {
    chartSet = button.dataset.kanaSet;
    $$('#kanaSetSegmented button').forEach(item => item.classList.toggle('active', item === button));
    renderKanaChart();
  }));
  $('#kanaChart').addEventListener('click', event => {
    const button = event.target.closest('button[data-kana]');
    if (button) openKanaDialog(button.dataset.kana);
  });

  modalWriting = createWritingSurface({
    canvas: $('#kanaDialogCanvas'),
    charElement: $('#kanaDialogCharacter'),
    soundElement: $('#kanaDialogSound'),
    shouldShowGuide: () => true,
    strokeWidth: () => 7
  });
  $('#closeKanaDialog').addEventListener('click', () => $('#kanaDialog').close());
  $('#clearKanaDialog').addEventListener('click', () => modalWriting.clear());
  $('#undoKanaDialog').addEventListener('click', () => modalWriting.undo());
  renderKanaChart();
}
