import { openDatabase, seedDatabase, fillMissingPronunciations } from './storage.js';
import { refreshData } from './state.js';
import { initStudy, resetQuiz } from './study.js';
import { initChart } from './chart.js';
import { initWriting, resizeCanvas } from './writing.js';
import { initWords, renderWordList } from './words.js';
import { initBackup } from './backup.js';
import { $, $$, showToast } from './ui.js';

let deferredInstall;

function showView(target) {
  $$('.view').forEach(view => view.classList.toggle('active', view.dataset.view === target));
  $$('.bottom-nav button').forEach(button => button.classList.toggle('active', button.dataset.target === target));
  if (target === 'writing') requestAnimationFrame(resizeCanvas);
  if (target === 'words') renderWordList();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function bindEvents() {
  $$('.bottom-nav button').forEach(button => button.addEventListener('click', () => showView(button.dataset.target)));
  $('#installButton').addEventListener('click', async () => {
    if (deferredInstall) {
      deferredInstall.prompt();
      await deferredInstall.userChoice;
      deferredInstall = null;
      $('#installButton').hidden = true;
    } else showToast('iPad: Safari 공유 버튼 → 홈 화면에 추가를 선택하세요');
  });
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault(); deferredInstall = event; $('#installButton').hidden = false;
  });
  window.addEventListener('appinstalled', () => { $('#installButton').hidden = true; showToast('가나노트를 설치했어요'); });
  window.addEventListener('online', () => { $('#offlineBadge').textContent = '온라인'; });
  window.addEventListener('offline', () => { $('#offlineBadge').textContent = '오프라인 저장'; });
}

async function initialize() {
  bindEvents();
  initStudy();
  initChart();
  initWriting();
  initWords();
  initBackup();
  await openDatabase();
  await seedDatabase();
  await fillMissingPronunciations();
  await refreshData();
  resetQuiz();
  const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  if (!standalone && /iPad|iPhone|Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1) $('#installButton').hidden = false;
}

if ('serviceWorker' in navigator && !window.KanaNoteAndroid) window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js'));
initialize().catch(error => { console.error(error); showToast('앱 저장소를 열지 못했습니다'); });
