import { wordPronunciation } from './kana.js';
import { state, refreshData, onDataChange } from './state.js';
import { putOne, addOne } from './storage.js';
import { reviewWordIds } from './review.js';
import { $, normalize } from './ui.js';

const quiz = { queue: [], current: null, answered: false };

function renderStats() {
  const today = new Date().toLocaleDateString('sv-SE');
  const attempts = state.attempts.filter(item => new Date(item.createdAt).toLocaleDateString('sv-SE') === today);
  $('#todayCorrect').textContent = attempts.filter(item => item.correct).length;
  $('#todayTotal').textContent = `/ ${attempts.length} 정답`;
  $('#reviewSummary').textContent = `오늘 복습할 단어 ${reviewWordIds(state.words, state.attempts).size}개 · 오답 또는 복습 날짜가 된 단어`;
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
  const reviewIds = kind === 'review' ? reviewWordIds(state.words, state.attempts) : null;
  return state.words.filter(word => (selectedCategory === '전체' || word.category === selectedCategory)
    && (kind !== 'meaning' || word.meaning.trim())
    && (kind !== 'mistakes' || word.pending > 0)
    && (kind !== 'review' || reviewIds.has(word.id)));
}

function resetQuiz() {
  quiz.queue = [];
  quiz.current = null;
  nextQuestion();
}

function nextQuestion() {
  const pool = quizPool();
  const validIds = new Set(pool.map(word => word.id));
  quiz.queue = quiz.queue.filter(id => validIds.has(id));
  if (!pool.length) {
    quiz.current = null;
    $('#quizWord').textContent = '문제가 없어요';
    const kind = $('#studyKind').value;
    $('#quizPrompt').textContent = kind === 'review' ? '오늘 복습할 단어가 없어요. 일반 퀴즈로 새 단어를 학습해 보세요.'
      : kind === 'mistakes' ? '틀린 단어가 생기면 이곳에서 복습할 수 있어요.' : '내 단어에서 학습할 단어를 추가해 주세요.';
    $('#quizCategory').textContent = '—'; $('#queueCount').textContent = '대기 0';
    $('#quizAnswer').value = ''; $('#quizAnswer').disabled = true; $('#quizAnswer').hidden = false; $('#quizFeedback').textContent = '';
    return;
  }
  if (!quiz.queue.length) {
    quiz.queue = shuffled(pool).sort((a,b) => b.pending - a.pending).map(word => word.id);
  }
  const nextId = quiz.queue.shift();
  quiz.current = state.words.find(word => word.id === nextId);
  quiz.answered = false;
  const kind = $('#studyKind').value;
  $('#quizWord').textContent = quiz.current.expression;
  $('#quizCategory').textContent = quiz.current.category;
  $('#queueCount').textContent = `대기 ${quiz.queue.length}`;
  $('#quizPrompt').textContent = kind === 'meaning' ? '한국어 뜻을 입력하세요' : kind === 'card' ? '발음과 뜻을 떠올린 뒤 정답을 확인하세요' : '한글 발음을 입력하세요';
  $('#quizAnswer').value = '';
  $('#quizAnswer').disabled = kind === 'card';
  $('#quizAnswer').hidden = kind === 'card';
  $('#checkAnswer').textContent = kind === 'card' ? '정답 공개' : '정답 확인';
  $('#quizFeedback').textContent = ''; $('#quizFeedback').className = 'feedback';
}

function answerDetails(word) {
  return `읽기 ${word.reading} · 한국 발음 ${wordPronunciation(word)} · 뜻 ${word.meaning || '미등록'}`;
}

async function checkAnswer() {
  if (!quiz.current || quiz.answered) return;
  const kind = $('#studyKind').value;
  if (kind === 'card') {
    $('#quizFeedback').textContent = answerDetails(quiz.current);
    quiz.answered = true;
    return;
  }
  const answer = $('#quizAnswer').value.trim();
  if (!answer) return;
  const expected = kind === 'meaning' ? quiz.current.meaning : wordPronunciation(quiz.current);
  const correct = kind === 'meaning'
    ? expected.split(/[\/,|]/).some(item => normalize(item) === normalize(answer))
    : normalize(expected) === normalize(answer);
  quiz.current.correct += Number(correct);
  quiz.current.wrong += Number(!correct);
  quiz.current.pending = correct ? Math.max(0, quiz.current.pending - 1) : quiz.current.pending + 1;
  await Promise.all([
    putOne('words', quiz.current),
    addOne('attempts', { wordId: quiz.current.id, correct, mode: kind, createdAt: new Date().toISOString() })
  ]);
  quiz.answered = true;
  $('#quizFeedback').className = `feedback ${correct ? 'correct' : 'wrong'}`;
  $('#quizFeedback').textContent = `${correct ? '✓ 정답' : `✗ 정답은 ${expected}`} · ${answerDetails(quiz.current)}`;
  await refreshData();
}

async function skipQuestion() {
  if (quiz.current && !quiz.answered && $('#studyKind').value !== 'card') {
    quiz.current.wrong += 1; quiz.current.pending += 1;
    await Promise.all([
      putOne('words', quiz.current),
      addOne('attempts', { wordId: quiz.current.id, correct: false, mode: $('#studyKind').value, createdAt: new Date().toISOString() })
    ]);
    await refreshData();
  }
  nextQuestion();
}

export function initStudy() {
  onDataChange(renderStats);
  $('#studyCategory').addEventListener('change', resetQuiz);
  $('#studyKind').addEventListener('change', resetQuiz);
  $('#checkAnswer').addEventListener('click', checkAnswer);
  $('#skipWord').addEventListener('click', skipQuestion);
  $('#nextWord').addEventListener('click', nextQuestion);
  $('#quizAnswer').addEventListener('keydown', event => { if (event.key === 'Enter') checkAnswer(); });
}

export { resetQuiz };
