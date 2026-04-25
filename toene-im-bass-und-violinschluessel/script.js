'use strict';

// ── Keyboard constants ──────────────────────────────────────────────────────
const W        = 28;
const WH       = 100;
const OCTAVE_W = 7 * W;

const OCTAVE_KEYS = [
  { note: 'C',  white: true,  left: 0   },
  { note: 'C#', white: false, left: 17  },
  { note: 'D',  white: true,  left: 28  },
  { note: 'D#', white: false, left: 45  },
  { note: 'E',  white: true,  left: 56  },
  { note: 'F',  white: true,  left: 84  },
  { note: 'F#', white: false, left: 101 },
  { note: 'G',  white: true,  left: 112 },
  { note: 'G#', white: false, left: 129 },
  { note: 'A',  white: true,  left: 140 },
  { note: 'A#', white: false, left: 157 },
  { note: 'B',  white: true,  left: 168 },
];

const CLEF_RANGES = {
  treble: { start: 4, end: 6 },
  bass:   { start: 2, end: 4 },
  both:   { start: 2, end: 6 },
};

// ── Staff SVG constants ─────────────────────────────────────────────────────
const SVG_NS   = 'http://www.w3.org/2000/svg';
const LINE_Y   = [38, 50, 62, 74, 86];
const STAFF_X1 = 70;
const STAFF_X2 = 390;
const LS       = 12;
const NOTE_X   = 230;

const TREBLE_Y = {
  'C4': 98, 'D4': 92, 'E4': 86, 'F4': 80, 'G4': 74,
  'A4': 68, 'B4': 62, 'C5': 56, 'D5': 50, 'E5': 44,
  'F5': 38, 'G5': 32, 'A5': 26, 'B5': 20, 'C6': 14,
};

const BASS_Y = {
  'C2': 110, 'D2': 104, 'E2': 98,  'F2': 92, 'G2': 86,
  'A2': 80,  'B2': 74,  'C3': 68,  'D3': 62, 'E3': 56,
  'F3': 50,  'G3': 44,  'A3': 38,  'B3': 32, 'C4': 26,
};

// ── State ───────────────────────────────────────────────────────────────────
let currentNote = null; // { key: 'C4', clef: 'treble'|'bass', y: number }
let answered    = false;
const stats     = { correct: 0, attempts: 0, streak: 0 };

function renderStats() {
  const pct  = stats.attempts === 0 ? 0 : Math.round(stats.correct / stats.attempts * 100);
  const sec  = document.getElementById('stats-section');
  const text = document.getElementById('stats-text');
  sec.hidden = false;
  text.textContent =
    `${stats.correct} von ${stats.attempts} richtig (${pct} %) · Serie: ${stats.streak}`;
}

function resetStats() {
  stats.correct = stats.attempts = stats.streak = 0;
  if (!document.getElementById('stats-section').hidden) renderStats();
}

// ── Audio ─────────────────────────────────────────────────────────────────────
const NOTE_SEMITONES = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

// Salamander Grand Piano samples hosted by Tone.js (CC BY 3.0)
const SAMPLE_BASE = 'https://tonejs.github.io/audio/salamander/';
const SAMPLE_MAP  = {          // MIDI number → filename stem
  36: 'C2',  39: 'Ds2', 42: 'Fs2', 45: 'A2',
  48: 'C3',  51: 'Ds3', 54: 'Fs3', 57: 'A3',
  60: 'C4',  63: 'Ds4', 66: 'Fs4', 69: 'A4',
  72: 'C5',  75: 'Ds5', 78: 'Fs5', 81: 'A5',
  84: 'C6',
};
const SAMPLE_MIDIS = Object.keys(SAMPLE_MAP).map(Number);

const rawCache = {};  // midi → ArrayBuffer  (fetched, not yet decoded)
const bufCache = {};  // midi → AudioBuffer  (decoded, ready to play)
let   audioCtx = null;

function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function noteToMidi(noteOct) {
  const note = noteOct.slice(0, -1);
  const oct  = parseInt(noteOct.slice(-1));
  return (oct + 1) * 12 + NOTE_SEMITONES[note];
}

function nearestSampleMidi(midi) {
  return SAMPLE_MIDIS.reduce((a, b) => Math.abs(b - midi) < Math.abs(a - midi) ? b : a);
}

function playOscillator(ctx, midi) {
  const freq = 440 * Math.pow(2, (midi - 69) / 12);
  const now  = ctx.currentTime;
  const osc  = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(freq, now);
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.3, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.1, now + 0.4);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
  osc.start(now);
  osc.stop(now + 1.5);
}

async function playNote(noteOct) {
  const ctx  = getAudioCtx();
  await ctx.resume();
  const midi    = noteToMidi(noteOct);
  const smpMidi = nearestSampleMidi(midi);

  // Decode on first use (ArrayBuffer is cloned so rawCache stays intact)
  if (!bufCache[smpMidi] && rawCache[smpMidi]) {
    bufCache[smpMidi] = await ctx.decodeAudioData(rawCache[smpMidi].slice(0));
  }

  if (!bufCache[smpMidi]) { playOscillator(ctx, midi); return; }

  const now  = ctx.currentTime;
  const src  = ctx.createBufferSource();
  const gain = ctx.createGain();
  src.buffer             = bufCache[smpMidi];
  src.playbackRate.value = Math.pow(2, (midi - smpMidi) / 12);
  src.connect(gain);
  gain.connect(ctx.destination);
  gain.gain.setValueAtTime(0.9, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 4);
  src.start(now);
  src.stop(now + 4);
}

// Fetch all MP3s in parallel on page load (no AudioContext needed yet)
function preloadSamples() {
  Object.entries(SAMPLE_MAP).forEach(([midi, name]) => {
    fetch(SAMPLE_BASE + name + '.mp3')
      .then(r => r.arrayBuffer())
      .then(ab => { rawCache[+midi] = ab; })
      .catch(() => {});
  });
}

// ── Helpers ─────────────────────────────────────────────────────────────────
function mkSvg(tag, attrs) {
  const el = document.createElementNS(SVG_NS, tag);
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
  return el;
}

function ledgerLineYs(noteY) {
  const top = LINE_Y[0], bot = LINE_Y[4];
  const out = [];
  if (noteY < top) {
    for (let y = top - LS; y >= noteY; y -= LS) out.push(y);
  } else if (noteY > bot) {
    for (let y = bot + LS; y <= noteY; y += LS) out.push(y);
  }
  return out;
}

// ── Note bag (shuffle all notes before repeating any) ────────────────────────
let noteBag = [];

function fillBag(clefVal) {
  const entries = [];
  if (clefVal !== 'bass')
    Object.keys(TREBLE_Y).forEach(key => entries.push({ key, clef: 'treble', y: TREBLE_Y[key] }));
  if (clefVal !== 'treble')
    Object.keys(BASS_Y).forEach(key => entries.push({ key, clef: 'bass', y: BASS_Y[key] }));
  // Fisher-Yates shuffle
  for (let i = entries.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [entries[i], entries[j]] = [entries[j], entries[i]];
  }
  noteBag = entries;
}

function pickNote(clefVal) {
  if (noteBag.length === 0) fillBag(clefVal);
  return noteBag.pop();
}

function formatNoteName(noteOct, intl) {
  const note = noteOct.slice(0, -1);
  const oct  = parseInt(noteOct.slice(-1));
  if (intl) return note + oct;
  const de = note === 'B' ? 'H' : note;
  if (oct <= 2) return de;                              // C2 → C
  if (oct === 3) return de.toLowerCase();               // C3 → c
  return de.toLowerCase() + "'".repeat(oct - 3);        // C4 → c', C5 → c''
}

// ── Draw staff ──────────────────────────────────────────────────────────────
function drawStaff(clef) {
  const svg = document.getElementById('staff-svg');
  svg.innerHTML = '';
  LINE_Y.forEach(y =>
    svg.appendChild(mkSvg('line', { x1: STAFF_X1, y1: y, x2: STAFF_X2, y2: y, class: 'staff-line' }))
  );
  if (clef === 'bass') {
    const t = mkSvg('text', { x: 70, y: 73, class: 'clef-symbol', 'font-size': 52 });
    t.textContent = '\u{1D122}';
    svg.appendChild(t);
  } else {
    const t = mkSvg('text', { x: 70, y: 90, class: 'clef-symbol', 'font-size': 84 });
    t.textContent = '\u{1D11E}';
    svg.appendChild(t);
  }
}

function drawNote(note) {
  const svg  = document.getElementById('staff-svg');
  const { y } = note;
  const intl  = document.getElementById('intl-notation').checked;

  ledgerLineYs(y).forEach(ly =>
    svg.appendChild(mkSvg('line', {
      x1: NOTE_X - 14, y1: ly, x2: NOTE_X + 14, y2: ly, class: 'ledger-line'
    }))
  );

  svg.appendChild(mkSvg('ellipse', {
    cx: NOTE_X, cy: y, rx: 6, ry: 4.5,
    transform: `rotate(-20, ${NOTE_X}, ${y})`,
    class: 'note-head'
  }));

  // Stem up (right side) when note is on/below middle line; stem down (left side) when above
  if (y >= LINE_Y[2]) {
    svg.appendChild(mkSvg('line', {
      x1: NOTE_X + 5.5, y1: y - 3, x2: NOTE_X + 5.5, y2: y - 34, class: 'note-stem'
    }));
  } else {
    svg.appendChild(mkSvg('line', {
      x1: NOTE_X - 5.5, y1: y + 3, x2: NOTE_X - 5.5, y2: y + 34, class: 'note-stem'
    }));
  }

}

// ── Keyboard ─────────────────────────────────────────────────────────────────
function labelMiddleC() {
  const c4 = document.querySelector('#keyboard .key[data-note="C"][data-octave="4"]');
  if (!c4) return;
  const intl  = document.getElementById('intl-notation').checked;
  const label = c4.querySelector('.key-label');
  if (label) {
    label.textContent = formatNoteName('C4', intl);
    label.classList.add('visible');
  }
}

function clearKeyFeedback() {
  document.querySelectorAll('#keyboard .correct, #keyboard .incorrect')
    .forEach(k => k.classList.remove('correct', 'incorrect'));
  document.querySelectorAll('#keyboard .key-label.visible')
    .forEach(l => l.classList.remove('visible'));
  labelMiddleC();
}

function updateKeyLabel() {
  document.querySelectorAll('#keyboard .key-label.visible')
    .forEach(l => l.classList.remove('visible'));
  labelMiddleC();
  if (!answered || !currentNote || !showNames.checked) return;
  const noteName = currentNote.key.slice(0, -1);
  const noteOct  = currentNote.key.slice(-1);
  const greenKey = document.querySelector(
    `#keyboard .key[data-note="${noteName}"][data-octave="${noteOct}"]`
  );
  if (!greenKey) return;
  const intl  = document.getElementById('intl-notation').checked;
  const label = greenKey.querySelector('.key-label');
  if (label) {
    label.textContent = formatNoteName(currentNote.key, intl);
    label.classList.add('visible');
  }
}

function buildKeyboard(clef) {
  const keyboard  = document.getElementById('keyboard');
  keyboard.innerHTML = '';
  const range      = CLEF_RANGES[clef];
  const totalWidth = (range.end - range.start) * OCTAVE_W + W;
  keyboard.style.width  = totalWidth + 'px';
  keyboard.style.height = WH + 'px';

  for (let oct = range.start; oct <= range.end; oct++) {
    const offset = (oct - range.start) * OCTAVE_W;
    const keys   = oct < range.end ? OCTAVE_KEYS : OCTAVE_KEYS.slice(0, 1);
    keys.forEach(k => {
      const el = document.createElement('div');
      el.className    = `key ${k.white ? 'white' : 'black'}`;
      el.dataset.note   = k.note;
      el.dataset.octave = oct;
      el.style.left     = (offset + k.left) + 'px';
      if (k.note === 'C' && oct === 4) el.classList.add('middle-c');
      const span = document.createElement('span');
      span.className   = 'key-label';
      span.textContent = formatNoteName(k.note + oct, false);
      el.appendChild(span);
      keyboard.appendChild(el);
    });
  }
  labelMiddleC();
}

// ── Task control ─────────────────────────────────────────────────────────────
function activeClef() {
  const val = clefSelect.value;
  if (val !== 'both') return val;
  return currentNote ? currentNote.clef : 'treble';
}

function newTask() {
  currentNote = pickNote(clefSelect.value);
  answered    = false;
  clearKeyFeedback();
  drawStaff(activeClef());
  drawNote(currentNote);
  playNote(currentNote.key);
}

function reset() {
  if (currentNote) {
    answered = false;
    clearKeyFeedback();
    drawStaff(activeClef());
    drawNote(currentNote);
    playNote(currentNote.key);
  }
}

function clearAll() {
  currentNote = null;
  answered    = false;
  clearKeyFeedback();
  drawStaff(activeClef());
  const svg  = document.getElementById('staff-svg');
  const hint = mkSvg('text', {
    x: '50%', y: 132, 'text-anchor': 'middle',
    'font-size': 11, fill: '#bbb', 'font-family': 'system-ui, sans-serif'
  });
  hint.textContent = 'Klicke „Neue Aufgabe" zum Starten';
  svg.appendChild(hint);
}

function redrawCurrentNote() {
  if (!currentNote) return;
  drawStaff(activeClef());
  drawNote(currentNote);
}

// ── Event listeners ───────────────────────────────────────────────────────────
const clefSelect = document.getElementById('clef-select');
const showNames  = document.getElementById('show-names');

document.getElementById('keyboard').addEventListener('click', e => {
  const keyEl = e.target.closest('.key');
  if (!keyEl || !currentNote || answered) return;
  answered = true;
  const clicked   = keyEl.dataset.note + keyEl.dataset.octave;
  const isCorrect = clicked === currentNote.key;
  playNote(clicked);
  stats.attempts++;
  if (isCorrect) { stats.correct++; stats.streak++; }
  else            { stats.streak = 0; }
  renderStats();
  if (isCorrect) {
    keyEl.classList.add('correct');
  } else {
    keyEl.classList.add('incorrect');
    const noteName = currentNote.key.slice(0, -1);
    const noteOct  = currentNote.key.slice(-1);
    const correct  = document.querySelector(
      `#keyboard .key[data-note="${noteName}"][data-octave="${noteOct}"]`
    );
    if (correct) correct.classList.add('correct');
  }
  updateKeyLabel();
});

clefSelect.addEventListener('change', () => {
  noteBag = [];
  buildKeyboard(clefSelect.value);
  clearAll();
});

showNames.addEventListener('change', updateKeyLabel);
document.getElementById('intl-notation').addEventListener('change', updateKeyLabel);
document.getElementById('btn-new').addEventListener('click', newTask);
document.getElementById('btn-reset').addEventListener('click', reset);
document.getElementById('btn-stats-reset').addEventListener('click', resetStats);

// ── Init ─────────────────────────────────────────────────────────────────────
buildKeyboard(clefSelect.value);
clearAll();
preloadSamples();
