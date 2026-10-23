import { KANA_ROWS, toKatakana, koreanReading } from './kana.js';
import { $ } from './ui.js';

const writing = { writingChar: '', strokes: [], activeStroke: null };

function writingCandidates() {
  const hira = KANA_ROWS.flatMap(([, chars]) => chars.filter(Boolean));
  const mode = $('#writingMode').value;
  return mode === '히라가나' ? hira : mode === '가타카나' ? hira.map(toKatakana) : [...hira, ...hira.map(toKatakana)];
}

function nextKana() {
  const candidates = writingCandidates().filter(char => char !== writing.writingChar);
  writing.writingChar = candidates[Math.floor(Math.random() * candidates.length)];
  writing.strokes = []; writing.activeStroke = null;
  $('#writingChar').textContent = writing.writingChar;
  $('#writingSound').textContent = koreanReading(writing.writingChar);
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
  if ($('#showGuide').checked && writing.writingChar) {
    context.fillStyle = '#ece8df';
    context.textAlign = 'center'; context.textBaseline = 'middle';
    context.font = `700 ${Math.max(100, Math.min(width*.52,height*.7))}px "Hiragino Kaku Gothic ProN", sans-serif`;
    context.fillText(writing.writingChar,width/2,height/2);
  }
  context.strokeStyle = '#17231f'; context.lineCap = 'round'; context.lineJoin = 'round';
  for (const stroke of writing.strokes) drawStroke(context, stroke);
  if (writing.activeStroke) drawStroke(context, writing.activeStroke);
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
  writing.activeStroke = { width: Number($('#penWidth').value), points: [canvasPoint(event)] };
  drawCanvas();
}

function moveDrawing(event) {
  if (!writing.activeStroke) return;
  event.preventDefault(); writing.activeStroke.points.push(canvasPoint(event)); drawCanvas();
}

function endDrawing(event) {
  if (!writing.activeStroke) return;
  event.preventDefault(); writing.strokes.push(writing.activeStroke); writing.activeStroke = null; drawCanvas();
}

export function initWriting() {
  $('#writingMode').addEventListener('change', nextKana);
  $('#showGuide').addEventListener('change', drawCanvas);
  $('#clearCanvas').addEventListener('click', () => { writing.strokes = []; drawCanvas(); });
  $('#undoStroke').addEventListener('click', () => { writing.strokes.pop(); drawCanvas(); });
  $('#nextKana').addEventListener('click', nextKana);
  const canvas = $('#writingCanvas');
  canvas.addEventListener('pointerdown', startDrawing);
  canvas.addEventListener('pointermove', moveDrawing);
  canvas.addEventListener('pointerup', endDrawing);
  canvas.addEventListener('pointercancel', endDrawing);
  new ResizeObserver(resizeCanvas).observe(canvas);
  nextKana();
}

export { resizeCanvas };
