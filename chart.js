import { KANA_ROWS, toKatakana, koreanReading } from './kana.js';
import { $, $$ } from './ui.js';

let chartMode = 'hiragana';

function renderKanaChart() {
  const chart = $('#kanaChart');
  const headers = ['', 'a', 'i', 'u', 'e', 'o'];
  chart.innerHTML = headers.map(text => `<div class="kana-cell header">${text}</div>`).join('');
  for (const [rowName, chars] of KANA_ROWS) {
    chart.insertAdjacentHTML('beforeend', `<div class="kana-cell header">${rowName}</div>`);
    for (const hira of chars) {
      const char = hira && chartMode === 'katakana' ? toKatakana(hira) : hira;
      chart.insertAdjacentHTML('beforeend', char
        ? `<div class="kana-cell"><span class="char">${char}</span><span class="sound">${koreanReading(char)}</span></div>`
        : '<div class="kana-cell empty">·</div>');
    }
  }
}

export function initChart() {
  $$('.segmented button').forEach(button => button.addEventListener('click', () => {
    chartMode = button.dataset.chart;
    $$('.segmented button').forEach(item => item.classList.toggle('active', item === button));
    renderKanaChart();
  }));
  renderKanaChart();
}
