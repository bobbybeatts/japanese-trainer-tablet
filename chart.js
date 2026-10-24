import { KANA_SETS, toKatakana, toHiragana, koreanReading, wordPronunciation } from './kana.js?v=16';
import { state } from './state.js';
import { createWritingSurface } from './writing.js?v=16';
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
  const source = state.words;
  const matches = [];
  let cursor = 0;
  target.innerHTML = '<li class="kana-word-empty">단어를 불러오는 중…</li>';
  const scan = () => {
    while (cursor < source.length && matches.length < 6) {
      const word = source[cursor++];
      const reading = toHiragana(word.reading || '');
      const expression = toHiragana(word.expression || '');
      if (reading.includes(normalized) || expression.includes(normalized)) matches.push(word);
    }
    if (cursor < source.length && matches.length < 6) {
      setTimeout(scan, 0);
      return;
    }

    target.innerHTML = matches.length ? matches.map(word => `
    <li class="kana-word-example">
      <strong>${escapeHtml(word.expression)}</strong>
      <span class="kana-word-reading">${escapeHtml(word.reading)} · ${escapeHtml(wordPronunciation(word))}</span>
      <span class="kana-word-meaning">${escapeHtml(word.meaning)}</span>
    </li>`).join('') : '<li class="kana-word-empty">아직 이 글자가 포함된 단어가 없습니다.</li>';
  };

  setTimeout(scan, 0);
}

function openKanaDialog(char) {
  $('#kanaDialogCharacter').textContent = char;
  $('#kanaDialogSound').textContent = koreanReading(char);
  const dialog = $('#kanaDialog');
  document.documentElement?.classList.add('kana-modal-open');
  if (typeof dialog.showModal === 'function') dialog.showModal();
  else dialog.setAttribute('open', '');
  const afterPaint = typeof requestAnimationFrame === 'function' ? requestAnimationFrame : callback => callback();
  afterPaint(() => {
    if (!dialog.open) return;
    modalWriting.setCharacter(char, { redraw: false });
    modalWriting.resize();
    renderWordExamples(char);
  });
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

  const modalCanvas = $('#kanaDialogCanvas');
  modalWriting = createWritingSurface({
    canvas: modalCanvas,
    charElement: $('#kanaDialogCharacter'),
    soundElement: $('#kanaDialogSound'),
    shouldShowGuide: () => true,
    strokeWidth: () => 7,
    observeResize: false
  });
  globalThis.window?.addEventListener('resize', () => { if ($('#kanaDialog').open) modalWriting.resize(); });
  const dialog = $('#kanaDialog');
  dialog.addEventListener('close', () => document.documentElement?.classList.remove('kana-modal-open'));
  $('#closeKanaDialog').addEventListener('click', () => dialog.close());
  $('#clearKanaDialog').addEventListener('click', () => modalWriting.clear());
  $('#undoKanaDialog').addEventListener('click', () => modalWriting.undo());
  renderKanaChart();
}
