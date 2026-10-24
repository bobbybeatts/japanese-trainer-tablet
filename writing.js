import { KANA_ROWS, toKatakana, koreanReading } from './kana.js';
import { $ } from './ui.js';

function createWritingSurface({ canvas, charElement, soundElement, shouldShowGuide, strokeWidth }) {
  const writing = { character: '', strokes: [], activeStroke: null };
  function setCharacter(character) {
    writing.character = character; writing.strokes = []; writing.activeStroke = null;
    charElement.textContent = character; soundElement.textContent = koreanReading(character); drawCanvas();
  }
  function canvasPoint(event) {
    const rect = canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top, pressure: event.pressure || .5 };
  }
  function resize() {
    const rect = canvas.getBoundingClientRect();
    const ratio = Math.min(globalThis.window?.devicePixelRatio || 1, 2);
    const width = Math.max(1, Math.round(rect.width * ratio));
    const height = Math.max(1, Math.round(rect.height * ratio));
    if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
    drawCanvas();
  }
  function drawCanvas() {
    const context = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const ratio = canvas.width / Math.max(rect.width, 1);
    const width = canvas.width / ratio; const height = canvas.height / ratio;
    context.setTransform(ratio,0,0,ratio,0,0); context.clearRect(0,0,width,height);
    context.strokeStyle = '#ddd8cf'; context.lineWidth = 1; context.setLineDash([7,7]);
    context.beginPath(); context.moveTo(width/2,18); context.lineTo(width/2,height-18); context.moveTo(18,height/2); context.lineTo(width-18,height/2); context.stroke(); context.setLineDash([]);
    if ((!shouldShowGuide || shouldShowGuide()) && writing.character) {
      context.fillStyle = '#ece8df'; context.textAlign = 'center'; context.textBaseline = 'middle';
      context.font = `700 ${Math.max(100, Math.min(width*.52,height*.7))}px "Hiragino Kaku Gothic ProN", sans-serif`;
      context.fillText(writing.character,width/2,height/2);
    }
    context.strokeStyle = '#17231f'; context.lineCap = 'round'; context.lineJoin = 'round';
    for (const stroke of writing.strokes) drawStroke(context, stroke);
    if (writing.activeStroke) drawStroke(context, writing.activeStroke);
  }
  function drawStroke(context, stroke) {
    if (!stroke.points.length) return;
    context.lineWidth = stroke.width; context.beginPath(); context.moveTo(stroke.points[0].x,stroke.points[0].y);
    for (let i=1; i<stroke.points.length; i++) {
      const point = stroke.points[i]; const before = stroke.points[i-1];
      context.quadraticCurveTo(before.x,before.y,(before.x+point.x)/2,(before.y+point.y)/2);
    }
    if (stroke.points.length === 1) context.lineTo(stroke.points[0].x+.1,stroke.points[0].y+.1);
    context.stroke();
  }
  function startDrawing(event) {
    event.preventDefault(); canvas.setPointerCapture(event.pointerId);
    writing.activeStroke = { width: Number(strokeWidth?.() || 7), points: [canvasPoint(event)] }; drawCanvas();
  }
  function moveDrawing(event) {
    if (!writing.activeStroke) return;
    event.preventDefault(); writing.activeStroke.points.push(canvasPoint(event)); drawCanvas();
  }
  function endDrawing(event) {
    if (!writing.activeStroke) return;
    event.preventDefault(); writing.strokes.push(writing.activeStroke); writing.activeStroke = null; drawCanvas();
  }
  canvas.addEventListener('pointerdown', startDrawing); canvas.addEventListener('pointermove', moveDrawing);
  canvas.addEventListener('pointerup', endDrawing); canvas.addEventListener('pointercancel', endDrawing);
  new ResizeObserver(resize).observe(canvas);
  return { setCharacter, resize, clear() { writing.strokes = []; drawCanvas(); }, undo() { writing.strokes.pop(); drawCanvas(); } };
}

let pageWriting;
function writingCandidates() {
  const hira = KANA_ROWS.flatMap(([, chars]) => chars.filter(Boolean));
  const mode = $('#writingMode').value;
  return mode === '히라가나' ? hira : mode === '가타카나' ? hira.map(toKatakana) : [...hira, ...hira.map(toKatakana)];
}
function nextKana() {
  const candidates = writingCandidates().filter(char => char !== $('#writingChar').textContent);
  pageWriting.setCharacter(candidates[Math.floor(Math.random() * candidates.length)]);
}
export function initWriting() {
  pageWriting = createWritingSurface({ canvas: $('#writingCanvas'), charElement: $('#writingChar'), soundElement: $('#writingSound'), shouldShowGuide: () => $('#showGuide').checked, strokeWidth: () => $('#penWidth').value });
  $('#writingMode').addEventListener('change', nextKana);
  $('#showGuide').addEventListener('change', () => pageWriting.resize());
  $('#clearCanvas').addEventListener('click', () => pageWriting.clear());
  $('#undoStroke').addEventListener('click', () => pageWriting.undo());
  $('#nextKana').addEventListener('click', nextKana);
  nextKana();
}
export function resizeCanvas() { pageWriting?.resize(); }
export { createWritingSurface };
