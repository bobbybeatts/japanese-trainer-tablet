import { state, refreshData } from './state.js';
import { replaceBackup, fillMissingPronunciations } from './storage.js';
import { resetQuiz } from './study.js';
import { $, showToast } from './ui.js';

function exportData() {
  const payload = { app: 'kananote', version: 1, exportedAt: new Date().toISOString(), words: state.words, attempts: state.attempts };
  const blob = new Blob([JSON.stringify(payload,null,2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob); link.download = `kananote-backup-${new Date().toLocaleDateString('sv-SE')}.json`; link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000); showToast('백업 파일을 만들었어요');
}

async function importData(event) {
  const file = event.target.files[0];
  if (!file) return;
  try {
    const payload = JSON.parse(await file.text());
    if (payload.app !== 'kananote' || !Array.isArray(payload.words) || !Array.isArray(payload.attempts)) throw new Error('format');
    if (!confirm(`백업의 단어 ${payload.words.length}개와 학습 기록 ${payload.attempts.length}개로 현재 데이터를 교체할까요?`)) return;
    await replaceBackup(payload.words, payload.attempts);
    await fillMissingPronunciations();
    await refreshData(); resetQuiz(); showToast('백업을 복원했어요');
  } catch (_) {
    showToast('가나노트 백업 파일을 확인해 주세요');
  } finally { event.target.value = ''; }
}

export function initBackup() {
  $('#exportData').addEventListener('click', exportData);
  $('#importData').addEventListener('change', importData);
}
