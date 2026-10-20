'use strict';

const KANA_ROWS = [
  ['아행', ['あ','い','う','え','お']], ['카행', ['か','き','く','け','こ']],
  ['사행', ['さ','し','す','せ','そ']], ['타행', ['た','ち','つ','て','と']],
  ['나행', ['な','に','ぬ','ね','の']], ['하행', ['は','ひ','ふ','へ','ほ']],
  ['마행', ['ま','み','む','め','も']], ['야행', ['や',null,'ゆ',null,'よ']],
  ['라행', ['ら','り','る','れ','ろ']], ['와행', ['わ',null,null,null,'を']],
  ['발음', ['ん',null,null,null,null]]
];

const SOUND = {
  'あ':'아','い':'이','う':'우','え':'에','お':'오','か':'카','き':'키','く':'쿠','け':'케','こ':'코',
  'さ':'사','し':'시','す':'스','せ':'세','そ':'소','た':'타','ち':'치','つ':'츠','て':'테','と':'토',
  'な':'나','に':'니','ぬ':'누','ね':'네','の':'노','は':'하','ひ':'히','ふ':'후','へ':'헤','ほ':'호',
  'ま':'마','み':'미','む':'무','め':'메','も':'모','や':'야','ゆ':'유','よ':'요','ら':'라','り':'리',
  'る':'루','れ':'레','ろ':'로','わ':'와','を':'오','ん':'ㄴ',
  'が':'가','ぎ':'기','ぐ':'구','げ':'게','ご':'고','ざ':'자','じ':'지','ず':'즈','ぜ':'제','ぞ':'조',
  'だ':'다','ぢ':'지','づ':'즈','で':'데','ど':'도','ば':'바','び':'비','ぶ':'부','べ':'베','ぼ':'보',
  'ぱ':'파','ぴ':'피','ぷ':'푸','ぺ':'페','ぽ':'포','ゔ':'부',
  'きゃ':'캬','きゅ':'큐','きょ':'쿄','しゃ':'샤','しゅ':'슈','しょ':'쇼','ちゃ':'챠','ちゅ':'츄','ちょ':'쵸',
  'にゃ':'냐','にゅ':'뉴','にょ':'뇨','ひゃ':'햐','ひゅ':'휴','ひょ':'효','みゃ':'먀','みゅ':'뮤','みょ':'묘',
  'りゃ':'랴','りゅ':'류','りょ':'료','ぎゃ':'갸','ぎゅ':'규','ぎょ':'교','じゃ':'쟈','じゅ':'쥬','じょ':'죠',
  'びゃ':'뱌','びゅ':'뷰','びょ':'뵤','ぴゃ':'퍄','ぴゅ':'퓨','ぴょ':'표',
  'てぃ':'티','でぃ':'디','ふぁ':'파','ふぃ':'피','ふぇ':'페','ふぉ':'포','しぇ':'셰','ちぇ':'체'
};

const SEED_WORDS = [
  ['あさ','あさ','아침'],['よる','よる','밤'],['そら','そら','하늘'],['あめ','あめ','비'],['みず','みず','물'],
  ['やま','やま','산'],['うみ','うみ','바다'],['ねこ','ねこ','고양이'],['いぬ','いぬ','개'],['くるま','くるま','자동차'],
  ['でんしゃ','でんしゃ','전철'],['えき','えき','역'],['きっぷ','きっぷ','표'],['おかね','おかね','돈'],
  ['たべもの','たべもの','음식'],['ありがとう','ありがとう','고마워요'],['こんにちは','こんにちは','안녕하세요'],
  ['すみません','すみません','실례합니다'],['おいしい','おいしい','맛있다'],['ください','ください','주세요'],
  ['カメラ','カメラ','카메라'],['ホテル','ホテル','호텔'],['バス','バス','버스'],['タクシー','タクシー','택시'],
  ['トイレ','トイレ','화장실'],['テレビ','テレビ','텔레비전'],['コーヒー','コーヒー','커피'],
  ['ジュース','ジュース','주스'],['ビール','ビール','맥주'],['パン','パン','빵'],['ラーメン','ラーメン','라멘'],
  ['コンビニ','コンビニ','편의점'],['スーパー','スーパー','슈퍼마켓'],['レストラン','レストラン','레스토랑'],
  ['エレベーター','エレベーター','엘리베이터'],['チケット','チケット','티켓'],['メニュー','メニュー','메뉴'],
  ['カード','カード','카드'],['アイス','アイス','아이스크림'],['パスポート','パスポート','여권'],
  ['バスのりば','バスのりば','버스 타는 곳'],['ホテルのへや','ホテルのへや','호텔 방'],
  ['コーヒーをのむ','コーヒーをのむ','커피를 마시다'],['パンをたべる','パンをたべる','빵을 먹다'],
  ['タクシーにのる','タクシーにのる','택시를 타다'],['コンビニにいく','コンビニにいく','편의점에 가다'],
  ['バスをまつ','バスをまつ','버스를 기다리다'],['カメラをかう','カメラをかう','카메라를 사다'],
  ['ラーメンがすき','ラーメンがすき','라멘을 좋아한다'],['カードではらう','カードではらう','카드로 결제하다'],
  ['ホテルにとまる','ホテルにとまる','호텔에 묵다'],['メニューをみる','メニューをみる','메뉴를 보다'],
  ['ジュースをかう','ジュースをかう','주스를 사다'],['トイレはどこ','トイレはどこ','화장실은 어디'],
  ['チケットをかう','チケットをかう','티켓을 사다']
];

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const state = { words: [], attempts: [], queue: [], current: null, answered: false, chart: 'hiragana', writingChar: '', strokes: [], activeStroke: null };
let db;
let deferredInstall;

function toKatakana(text) {
  return [...text].map(ch => ch >= 'ぁ' && ch <= 'ゖ' ? String.fromCharCode(ch.charCodeAt(0) + 96) : ch).join('');
}

function toHiragana(text) {
  return [...text].map(ch => ch >= 'ァ' && ch <= 'ヶ' ? String.fromCharCode(ch.charCodeAt(0) - 96) : ch).join('');
}

function category(text) {
  const compact = text.replace(/[\s　]/g, '');
  if (!/^[\u3040-\u309f\u30a0-\u30ffー]+$/.test(compact)) return null;
  if (/^[\u3040-\u309fー]+$/.test(compact)) return '히라가나';
  if (/^[\u30a0-\u30ffー]+$/.test(compact)) return '가타카나';
  return '혼합';
}

function addFinal(text, jong) {
  if (!text) return text;
  const last = text.charCodeAt(text.length - 1) - 0xac00;
  return last >= 0 && last < 11172 && last % 28 === 0
    ? text.slice(0, -1) + String.fromCharCode(text.charCodeAt(text.length - 1) + jong)
    : text;
}

function koreanReading(text) {
  const hira = toHiragana(text).replace(/\s/g, '');
  let result = '';
  for (let i = 0; i < hira.length;) {
    const ch = hira[i];
    if (ch === 'っ') {
      const next = hira[i + 1] || '';
      result = addFinal(result, 'かきくけこがぎぐげご'.includes(next) ? 1 : 'たちつてと'.includes(next) ? 17 : 'ぱぴぷぺぽばびぶべぼ'.includes(next) ? 7 : 19);
      i += 1; continue;
    }
    if (ch === 'ん') {
      const finished = addFinal(result, 4);
      result = finished === result ? result + 'ㄴ' : finished;
      i += 1; continue;
    }
    if (ch === 'ー') {
      const vowel = ['아','이','우','에','오'].find(sound => result.endsWith(sound));
      if (vowel) result += vowel;
      i += 1; continue;
    }
    const pair = hira.slice(i, i + 2);
    if (SOUND[pair]) { result += SOUND[pair]; i += 2; }
    else { result += SOUND[ch] || ch; i += 1; }
  }
  return result;
}

function normalize(value) {
  return value.toLowerCase().replace(/[\s\-ー]/g, '');
}

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('kananote', 1);
    request.onupgradeneeded = () => {
      const next = request.result;
      const words = next.createObjectStore('words', { keyPath: 'id', autoIncrement: true });
      words.createIndex('expressionReading', ['expression', 'reading'], { unique: true });
      next.createObjectStore('attempts', { keyPath: 'id', autoIncrement: true });
    };
    request.onsuccess = () => resolve(request.result);
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
  if ((await getAll('words')).length) return;
  for (const [expression, reading, meaning] of SEED_WORDS) {
    await addOne('words', { expression, reading, meaning, category: category(expression), source: 'built-in', correct: 0, wrong: 0, pending: 0, createdAt: new Date().toISOString() });
  }
}

async function refreshData() {
  [state.words, state.attempts] = await Promise.all([getAll('words'), getAll('attempts')]);
  renderStats();
  renderWordList();
}

function renderStats() {
  const today = new Date().toLocaleDateString('sv-SE');
  const attempts = state.attempts.filter(item => new Date(item.createdAt).toLocaleDateString('sv-SE') === today);
  $('#todayCorrect').textContent = attempts.filter(item => item.correct).length;
  $('#todayTotal').textContent = `/ ${attempts.length} 정답`;
  $('#wordTotal').textContent = state.words.length;
}

function shuffled(values) {
  const output = [...values];
  for (let i = output.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [output[i], output[j]] = [output[j], output[i]];
  }
  return output;
}

function quizPool() {
  const selectedCategory = $('#studyCategory').value;
  const kind = $('#studyKind').value;
  return state.words.filter(word => (selectedCategory === '전체' || word.category === selectedCategory)
    && (kind !== 'meaning' || word.meaning.trim())
    && (kind !== 'mistakes' || word.pending > 0));
}

function resetQuiz() {
  state.queue = [];
  state.current = null;
  nextQuestion();
}

function nextQuestion() {
  const pool = quizPool();
  const validIds = new Set(pool.map(word => word.id));
  state.queue = state.queue.filter(id => validIds.has(id));
  if (!pool.length) {
    state.current = null;
    $('#quizWord').textContent = '문제가 없어요';
    $('#quizPrompt').textContent = $('#studyKind').value === 'mistakes' ? '틀린 단어가 생기면 이곳에서 복습할 수 있어요.' : '내 단어에서 학습할 단어를 추가해 주세요.';
    $('#quizCategory').textContent = '—'; $('#queueCount').textContent = '대기 0';
    $('#quizAnswer').value = ''; $('#quizAnswer').disabled = true; $('#quizFeedback').textContent = '';
    return;
  }
  if (!state.queue.length) {
    state.queue = shuffled(pool).sort((a,b) => b.pending - a.pending).map(word => word.id);
  }
  state.current = state.words.find(word => word.id === state.queue.shift());
  state.answered = false;
  const kind = $('#studyKind').value;
  $('#quizWord').textContent = state.current.expression;
  $('#quizCategory').textContent = state.current.category;
  $('#queueCount').textContent = `대기 ${state.queue.length}`;
  $('#quizPrompt').textContent = kind === 'meaning' ? '한국어 뜻을 입력하세요' : kind === 'card' ? '발음과 뜻을 떠올린 뒤 정답을 확인하세요' : '한글 발음을 입력하세요';
  $('#quizAnswer').value = '';
  $('#quizAnswer').disabled = kind === 'card';
  $('#quizAnswer').hidden = kind === 'card';
  $('#checkAnswer').textContent = kind === 'card' ? '정답 공개' : '정답 확인';
  $('#quizFeedback').textContent = ''; $('#quizFeedback').className = 'feedback';
}

function answerDetails(word) {
  return `읽기 ${word.reading} · 발음 ${koreanReading(word.reading)} · 뜻 ${word.meaning || '미등록'}`;
}

async function checkAnswer() {
  if (!state.current || state.answered) return;
  const kind = $('#studyKind').value;
  if (kind === 'card') {
    $('#quizFeedback').textContent = answerDetails(state.current);
    state.answered = true;
    return;
  }
  const answer = $('#quizAnswer').value.trim();
  if (!answer) return;
  const expected = kind === 'meaning' ? state.current.meaning : koreanReading(state.current.reading);
  const correct = kind === 'meaning'
    ? expected.split(/[\/,|]/).some(item => normalize(item) === normalize(answer))
    : normalize(expected) === normalize(answer);
  state.current.correct += Number(correct);
  state.current.wrong += Number(!correct);
  state.current.pending = correct ? Math.max(0, state.current.pending - 1) : state.current.pending + 1;
  await Promise.all([
    putOne('words', state.current),
    addOne('attempts', { wordId: state.current.id, correct, mode: kind, createdAt: new Date().toISOString() })
  ]);
  state.answered = true;
  $('#quizFeedback').className = `feedback ${correct ? 'correct' : 'wrong'}`;
  $('#quizFeedback').textContent = `${correct ? '✓ 정답' : `✗ 정답은 ${expected}`} · ${answerDetails(state.current)}`;
  await refreshData();
}

async function skipQuestion() {
  if (state.current && !state.answered && $('#studyKind').value !== 'card') {
    state.current.wrong += 1; state.current.pending += 1;
    await Promise.all([
      putOne('words', state.current),
      addOne('attempts', { wordId: state.current.id, correct: false, mode: $('#studyKind').value, createdAt: new Date().toISOString() })
    ]);
    await refreshData();
  }
  nextQuestion();
}

function renderKanaChart() {
  const chart = $('#kanaChart');
  const headers = ['', 'a', 'i', 'u', 'e', 'o'];
  chart.innerHTML = headers.map(text => `<div class="kana-cell header">${text}</div>`).join('');
  for (const [rowName, chars] of KANA_ROWS) {
    chart.insertAdjacentHTML('beforeend', `<div class="kana-cell header">${rowName}</div>`);
    for (const hira of chars) {
      const char = hira && state.chart === 'katakana' ? toKatakana(hira) : hira;
      chart.insertAdjacentHTML('beforeend', char
        ? `<div class="kana-cell"><span class="char">${char}</span><span class="sound">${koreanReading(char)}</span></div>`
        : '<div class="kana-cell empty">·</div>');
    }
  }
}

function writingCandidates() {
  const hira = KANA_ROWS.flatMap(([, chars]) => chars.filter(Boolean));
  const mode = $('#writingMode').value;
  return mode === '히라가나' ? hira : mode === '가타카나' ? hira.map(toKatakana) : [...hira, ...hira.map(toKatakana)];
}

function nextKana() {
  const candidates = writingCandidates().filter(char => char !== state.writingChar);
  state.writingChar = candidates[Math.floor(Math.random() * candidates.length)];
  state.strokes = []; state.activeStroke = null;
  $('#writingChar').textContent = state.writingChar;
  $('#writingSound').textContent = koreanReading(state.writingChar);
  drawCanvas();
}

function canvasPoint(event) {
  const rect = $('#writingCanvas').getBoundingClientRect();
  return { x: event.clientX - rect.left, y: event.clientY - rect.top, pressure: event.pressure || .5 };
}

function resizeCanvas() {
  const canvas = $('#writingCanvas');
  const rect = canvas.getBoundingClientRect();
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const width = Math.max(1, Math.round(rect.width * ratio));
  const height = Math.max(1, Math.round(rect.height * ratio));
  if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
  drawCanvas();
}

function drawCanvas() {
  const canvas = $('#writingCanvas');
  const context = canvas.getContext('2d');
  const ratio = canvas.width / Math.max(canvas.getBoundingClientRect().width, 1);
  const width = canvas.width / ratio; const height = canvas.height / ratio;
  context.setTransform(ratio,0,0,ratio,0,0);
  context.clearRect(0,0,width,height);
  context.strokeStyle = '#ddd8cf'; context.lineWidth = 1; context.setLineDash([7,7]);
  context.beginPath(); context.moveTo(width/2,18); context.lineTo(width/2,height-18); context.moveTo(18,height/2); context.lineTo(width-18,height/2); context.stroke();
  context.setLineDash([]);
  if ($('#showGuide').checked && state.writingChar) {
    context.fillStyle = '#ece8df';
    context.textAlign = 'center'; context.textBaseline = 'middle';
    context.font = `700 ${Math.max(100, Math.min(width*.52,height*.7))}px "Hiragino Kaku Gothic ProN", sans-serif`;
    context.fillText(state.writingChar,width/2,height/2);
  }
  context.strokeStyle = '#17231f'; context.lineCap = 'round'; context.lineJoin = 'round';
  for (const stroke of state.strokes) drawStroke(context, stroke);
  if (state.activeStroke) drawStroke(context, state.activeStroke);
}

function drawStroke(context, stroke) {
  if (!stroke.points.length) return;
  context.lineWidth = stroke.width;
  context.beginPath(); context.moveTo(stroke.points[0].x,stroke.points[0].y);
  for (let i=1; i<stroke.points.length; i++) {
    const point = stroke.points[i]; const before = stroke.points[i-1];
    context.quadraticCurveTo(before.x,before.y,(before.x+point.x)/2,(before.y+point.y)/2);
  }
  if (stroke.points.length === 1) context.lineTo(stroke.points[0].x+.1,stroke.points[0].y+.1);
  context.stroke();
}

function startDrawing(event) {
  event.preventDefault();
  $('#writingCanvas').setPointerCapture(event.pointerId);
  state.activeStroke = { width: Number($('#penWidth').value), points: [canvasPoint(event)] };
  drawCanvas();
}

function moveDrawing(event) {
  if (!state.activeStroke) return;
  event.preventDefault(); state.activeStroke.points.push(canvasPoint(event)); drawCanvas();
}

function endDrawing(event) {
  if (!state.activeStroke) return;
  event.preventDefault(); state.strokes.push(state.activeStroke); state.activeStroke = null; drawCanvas();
}

async function addWord(event) {
  event.preventDefault();
  const expression = $('#newExpression').value.trim();
  const reading = $('#newReading').value.trim();
  const meaning = $('#newMeaning').value.trim();
  const wordCategory = category(expression);
  if (!wordCategory || !category(reading)) {
    $('#addWordMessage').textContent = '일본어 표기와 읽기는 가나 문자로 입력해 주세요.'; return;
  }
  if (state.words.some(word => word.expression === expression && word.reading === reading)) {
    $('#addWordMessage').textContent = '이미 저장된 단어입니다.'; return;
  }
  await addOne('words', { expression, reading, meaning, category: wordCategory, source: 'user', correct: 0, wrong: 0, pending: 0, createdAt: new Date().toISOString() });
  event.target.reset(); $('#addWordMessage').textContent = '새 단어를 태블릿에 저장했습니다.';
  await refreshData(); resetQuiz(); showToast('단어를 저장했어요');
}

function renderWordList() {
  const query = normalize($('#wordSearch')?.value || '');
  const words = [...state.words].reverse().filter(word => !query || normalize(`${word.expression}${word.reading}${word.meaning}`).includes(query));
  $('#wordList').innerHTML = words.length ? words.map(word => `
    <article class="word-item">
      <div class="jp">${escapeHtml(word.expression)}</div>
      <div class="details"><div class="reading">${escapeHtml(word.reading)} · ${word.category}</div><div class="meaning">${escapeHtml(word.meaning || '뜻 미등록')}</div></div>
      <button class="delete-word" data-delete="${word.id}" type="button" aria-label="${escapeHtml(word.expression)} 삭제">×</button>
    </article>`).join('') : '<div class="empty-state">조건에 맞는 단어가 없습니다.</div>';
}

function escapeHtml(text) {
  const element = document.createElement('span'); element.textContent = text; return element.innerHTML;
}

async function deleteWord(id) {
  const word = state.words.find(item => item.id === id);
  if (!word || !confirm(`“${word.expression}” 단어를 삭제할까요?`)) return;
  await deleteOne('words', id); await refreshData(); resetQuiz(); showToast('단어를 삭제했어요');
}

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
    await clearStore('words'); await clearStore('attempts');
    for (const word of payload.words) await putOne('words', word);
    for (const attempt of payload.attempts) await putOne('attempts', attempt);
    await refreshData(); resetQuiz(); showToast('백업을 복원했어요');
  } catch (_) {
    showToast('가나노트 백업 파일을 확인해 주세요');
  } finally { event.target.value = ''; }
}

function showView(target) {
  $$('.view').forEach(view => view.classList.toggle('active', view.dataset.view === target));
  $$('.bottom-nav button').forEach(button => button.classList.toggle('active', button.dataset.target === target));
  if (target === 'writing') requestAnimationFrame(resizeCanvas);
  if (target === 'words') renderWordList();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

let toastTimer;
function showToast(message) {
  const toast = $('#toast'); toast.textContent = message; toast.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
}

function bindEvents() {
  $$('.bottom-nav button').forEach(button => button.addEventListener('click', () => showView(button.dataset.target)));
  $('#studyCategory').addEventListener('change', resetQuiz); $('#studyKind').addEventListener('change', resetQuiz);
  $('#checkAnswer').addEventListener('click', checkAnswer); $('#skipWord').addEventListener('click', skipQuestion); $('#nextWord').addEventListener('click', nextQuestion);
  $('#quizAnswer').addEventListener('keydown', event => { if (event.key === 'Enter') checkAnswer(); });
  $$('.segmented button').forEach(button => button.addEventListener('click', () => {
    state.chart = button.dataset.chart; $$('.segmented button').forEach(item => item.classList.toggle('active', item === button)); renderKanaChart();
  }));
  $('#writingMode').addEventListener('change', nextKana); $('#showGuide').addEventListener('change', drawCanvas);
  $('#clearCanvas').addEventListener('click', () => { state.strokes = []; drawCanvas(); });
  $('#undoStroke').addEventListener('click', () => { state.strokes.pop(); drawCanvas(); });
  $('#nextKana').addEventListener('click', nextKana);
  const canvas = $('#writingCanvas');
  canvas.addEventListener('pointerdown', startDrawing); canvas.addEventListener('pointermove', moveDrawing);
  canvas.addEventListener('pointerup', endDrawing); canvas.addEventListener('pointercancel', endDrawing);
  new ResizeObserver(resizeCanvas).observe(canvas);
  $('#addWordForm').addEventListener('submit', addWord); $('#wordSearch').addEventListener('input', renderWordList);
  $('#wordList').addEventListener('click', event => { const id = Number(event.target.dataset.delete); if (id) deleteWord(id); });
  $('#exportData').addEventListener('click', exportData); $('#importData').addEventListener('change', importData);
  $('#installButton').addEventListener('click', async () => {
    if (deferredInstall) { deferredInstall.prompt(); await deferredInstall.userChoice; deferredInstall = null; $('#installButton').hidden = true; }
    else showToast('iPad: Safari 공유 버튼 → 홈 화면에 추가를 선택하세요');
  });
}

async function initialize() {
  bindEvents(); renderKanaChart(); nextKana();
  db = await openDatabase(); await seedDatabase(); await refreshData(); resetQuiz();
  const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  if (!standalone && /iPad|iPhone|Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1) $('#installButton').hidden = false;
}

window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault(); deferredInstall = event; $('#installButton').hidden = false;
});
window.addEventListener('appinstalled', () => { $('#installButton').hidden = true; showToast('가나노트를 설치했어요'); });
window.addEventListener('online', () => { $('#offlineBadge').textContent = '온라인'; });
window.addEventListener('offline', () => { $('#offlineBadge').textContent = '오프라인 저장'; });

if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js'));
initialize().catch(error => { console.error(error); showToast('앱 저장소를 열지 못했습니다'); });

