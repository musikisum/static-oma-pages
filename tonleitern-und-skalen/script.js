'use strict';

// ── Modusdaten ────────────────────────────────────────────────────────────────
// notes: alle 8 Töne des Modus (Finalis bis Oktave, innerhalb der Klaviaturreichweite)
// finalis: Grundton (interne Schreibweise A–G, B = deutsches H)
// hypo: true = plagaler Modus
const MODES = [
  { name: 'Dorisch',         finalis: 'D', hypo: false,
    notes: ['D3','E3','F3','G3','A3','B3','C4','D4'] },
  { name: 'Hypodorisch',     finalis: 'D', hypo: true,
    notes: ['A2','B2','C3','D3','E3','F3','G3','A3'] },
  { name: 'Phrygisch',       finalis: 'E', hypo: false,
    notes: ['E3','F3','G3','A3','B3','C4','D4','E4'] },
  { name: 'Hypophrygisch',   finalis: 'E', hypo: true,
    notes: ['B2','C3','D3','E3','F3','G3','A3','B3'] },
  { name: 'Lydisch',         finalis: 'F', hypo: false,
    notes: ['F3','G3','A3','B3','C4','D4','E4','F4'] },
  { name: 'Hypolydisch',     finalis: 'F', hypo: true,
    notes: ['C3','D3','E3','F3','G3','A3','B3','C4'] },
  { name: 'Mixolydisch',     finalis: 'G', hypo: false,
    notes: ['G3','A3','B3','C4','D4','E4','F4','G4'] },
  { name: 'Hypomixolydisch', finalis: 'G', hypo: true,
    notes: ['D3','E3','F3','G3','A3','B3','C4','D4'] },
  { name: 'Äolisch',         finalis: 'A', hypo: false,
    notes: ['A3','B3','C4','D4','E4','F4','G4','A4'] },
  { name: 'Hypoäolisch',     finalis: 'A', hypo: true,
    notes: ['E3','F3','G3','A3','B3','C4','D4','E4'] },
  { name: 'Ionisch',         finalis: 'C', hypo: false,
    notes: ['C4','D4','E4','F4','G4','A4','B4','C5'] },
  { name: 'Hypoionisch',     finalis: 'C', hypo: true,
    notes: ['G3','A3','B3','C4','D4','E4','F4','G4'] },
  { name: 'Lokrisch',        finalis: 'B', hypo: false,
    notes: ['B3','C4','D4','E4','F4','G4','A4','B4'] },
  { name: 'Hypolokrisch',    finalis: 'B', hypo: true,
    notes: ['F3','G3','A3','B3','C4','D4','E4','F4'] },
];

// ── Klaviaturlayout (A2 bis C5) ───────────────────────────────────────────────
// Weiße Tasten: 28 px breit, 100 px hoch. Schwarze Tasten: 16 × 62 px.
// Versatz schwarze Taste: 17 px rechts von der vorherigen weißen Taste.
const KEYBOARD_WIDTH = 476;
const WH = 100;

const KEYBOARD_KEYS = [
  // Oktave 2 (nur A2, B2)
  { note: 'A',  oct: 2, white: true,  left: 0   },
  { note: 'A#', oct: 2, white: false, left: 17  },
  { note: 'B',  oct: 2, white: true,  left: 28  },
  // Oktave 3
  { note: 'C',  oct: 3, white: true,  left: 56  },
  { note: 'C#', oct: 3, white: false, left: 73  },
  { note: 'D',  oct: 3, white: true,  left: 84  },
  { note: 'D#', oct: 3, white: false, left: 101 },
  { note: 'E',  oct: 3, white: true,  left: 112 },
  { note: 'F',  oct: 3, white: true,  left: 140 },
  { note: 'F#', oct: 3, white: false, left: 157 },
  { note: 'G',  oct: 3, white: true,  left: 168 },
  { note: 'G#', oct: 3, white: false, left: 185 },
  { note: 'A',  oct: 3, white: true,  left: 196 },
  { note: 'A#', oct: 3, white: false, left: 213 },
  { note: 'B',  oct: 3, white: true,  left: 224 },
  // Oktave 4
  { note: 'C',  oct: 4, white: true,  left: 252 },
  { note: 'C#', oct: 4, white: false, left: 269 },
  { note: 'D',  oct: 4, white: true,  left: 280 },
  { note: 'D#', oct: 4, white: false, left: 297 },
  { note: 'E',  oct: 4, white: true,  left: 308 },
  { note: 'F',  oct: 4, white: true,  left: 336 },
  { note: 'F#', oct: 4, white: false, left: 353 },
  { note: 'G',  oct: 4, white: true,  left: 364 },
  { note: 'G#', oct: 4, white: false, left: 381 },
  { note: 'A',  oct: 4, white: true,  left: 392 },
  { note: 'A#', oct: 4, white: false, left: 409 },
  { note: 'B',  oct: 4, white: true,  left: 420 },
  // C5
  { note: 'C',  oct: 5, white: true,  left: 448 },
];

// ── Intervallmuster für Transpositionen ───────────────────────────────────────
// intervals: Halbtonschritte ab dem tiefsten Ton des Ambitus
// finalisIndex: Position des Finalis im 8-Töne-Array (0-basiert)
// Authentische Modi: finalisIndex=0 (Finalis = unterster Ton)
// Plagale Modi:      finalisIndex=3 (Finalis = 4. Ton = Quarte über dem untersten Ton)
const MODE_DEFS = [
  { name: 'Dorisch',         intervals: [0,2,3,5,7,9,10,12], finalisIndex: 0, hypo: false },
  { name: 'Hypodorisch',     intervals: [0,2,3,5,7,8,10,12], finalisIndex: 3, hypo: true  },
  { name: 'Phrygisch',       intervals: [0,1,3,5,7,8,10,12], finalisIndex: 0, hypo: false },
  { name: 'Hypophrygisch',   intervals: [0,1,3,5,6,8,10,12], finalisIndex: 3, hypo: true  },
  { name: 'Lydisch',         intervals: [0,2,4,6,7,9,11,12], finalisIndex: 0, hypo: false },
  { name: 'Hypolydisch',     intervals: [0,2,4,5,7,9,11,12], finalisIndex: 3, hypo: true  },
  { name: 'Mixolydisch',     intervals: [0,2,4,5,7,9,10,12], finalisIndex: 0, hypo: false },
  { name: 'Hypomixolydisch', intervals: [0,2,3,5,7,9,10,12], finalisIndex: 3, hypo: true  },
  { name: 'Äolisch',         intervals: [0,2,3,5,7,8,10,12], finalisIndex: 0, hypo: false },
  { name: 'Hypoäolisch',     intervals: [0,1,3,5,7,8,10,12], finalisIndex: 3, hypo: true  },
  { name: 'Ionisch',         intervals: [0,2,4,5,7,9,11,12], finalisIndex: 0, hypo: false },
  { name: 'Hypoionisch',     intervals: [0,2,4,5,7,9,10,12], finalisIndex: 3, hypo: true  },
  { name: 'Lokrisch',        intervals: [0,1,3,5,6,8,10,12], finalisIndex: 0, hypo: false },
  { name: 'Hypolokrisch',    intervals: [0,2,4,6,7,9,11,12], finalisIndex: 3, hypo: true  },
];

// ── Hilfsfunktionen Notenbezeichnung ─────────────────────────────────────────
// Chromatische Töne in Kreuz-Schreibweise (wie Klaviatur)
const CHROMATIC_KB = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];

// MIDI-Zahl → Ton+Oktave, z. B. 62 → 'D4'
function midiToNoteOct(midi) {
  return CHROMATIC_KB[midi % 12] + (Math.floor(midi / 12) - 1);
}

// Deutsche Notenbezeichnungen (Kreuz-Schreibweise → deutsch)
const DE_NAMES = {
  'C': 'C', 'C#': 'Cis', 'D': 'D', 'D#': 'Dis', 'E': 'E',
  'F': 'F', 'F#': 'Fis', 'G': 'G', 'G#': 'Gis', 'A': 'A',
  'A#': 'Ais', 'B': 'H'
};

function toDE(note) {
  return DE_NAMES[note] || note;
}

// Tastenbeschriftung: z. B. 'B3' → 'H3', 'C#4' → 'C#4'
function keyLabel(note, oct) {
  return toDE(note) + oct;
}

// Alle Transpositionen aller Modi berechnen (Ambitus A2–C5)
function buildTranspositions() {
  const result = [];
  for (const def of MODE_DEFS) {
    // Startton A2 (MIDI 45) bis C4 (MIDI 60); höchster Ton = start+12 ≤ C5 (MIDI 72)
    for (let start = 45; start <= 60; start++) {
      const midiNotes = def.intervals.map(i => start + i);
      const notes     = midiNotes.map(midiToNoteOct);
      const finalis   = notes[def.finalisIndex].slice(0, -1); // ohne Oktavziffer
      result.push({ name: def.name, finalis, notes, hypo: def.hypo });
    }
  }
  return result;
}

// ── Audio (Salamander Grand Piano, CC BY 3.0) ─────────────────────────────────
const NOTE_SEMITONES = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const SAMPLE_BASE    = 'https://tonejs.github.io/audio/salamander/';
const SAMPLE_MAP     = {
  36: 'C2',  39: 'Ds2', 42: 'Fs2', 45: 'A2',
  48: 'C3',  51: 'Ds3', 54: 'Fs3', 57: 'A3',
  60: 'C4',  63: 'Ds4', 66: 'Fs4', 69: 'A4',
  72: 'C5',  75: 'Ds5', 78: 'Fs5', 81: 'A5',
  84: 'C6',
};
const SAMPLE_MIDIS = Object.keys(SAMPLE_MAP).map(Number);
const rawCache = {};
const bufCache = {};
let audioCtx = null;

function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function noteToMidi(noteOct) {
  const name = noteOct.slice(0, -1);
  const oct  = parseInt(noteOct.slice(-1));
  const base = name[0];
  const acc  = name.length > 1 ? name[1] : '';
  return (oct + 1) * 12 + NOTE_SEMITONES[base] + (acc === '#' ? 1 : acc === 'b' ? -1 : 0);
}

function nearestSampleMidi(midi) {
  return SAMPLE_MIDIS.reduce((a, b) => Math.abs(b - midi) < Math.abs(a - midi) ? b : a);
}

function playOscillator(ctx, midi) {
  const freq = 440 * Math.pow(2, (midi - 69) / 12);
  const now  = ctx.currentTime;
  const osc  = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain); gain.connect(ctx.destination);
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(freq, now);
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.3, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
  osc.start(now); osc.stop(now + 1.5);
}

async function playNote(noteOct) {
  const ctx = getAudioCtx();
  await ctx.resume();
  const midi    = noteToMidi(noteOct);
  const smpMidi = nearestSampleMidi(midi);
  if (!bufCache[smpMidi] && rawCache[smpMidi]) {
    bufCache[smpMidi] = await ctx.decodeAudioData(rawCache[smpMidi].slice(0));
  }
  if (!bufCache[smpMidi]) { playOscillator(ctx, midi); return; }
  const now  = ctx.currentTime;
  const src  = ctx.createBufferSource();
  const gain = ctx.createGain();
  src.buffer = bufCache[smpMidi];
  src.playbackRate.value = Math.pow(2, (midi - smpMidi) / 12);
  src.connect(gain); gain.connect(ctx.destination);
  gain.gain.setValueAtTime(0.9, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 4);
  src.start(now); src.stop(now + 4);
}

function preloadSamples() {
  Object.entries(SAMPLE_MAP).forEach(([midi, name]) => {
    fetch(SAMPLE_BASE + name + '.mp3')
      .then(r => r.arrayBuffer())
      .then(ab => { rawCache[+midi] = ab; })
      .catch(() => {});
  });
}

// ── Zustand ───────────────────────────────────────────────────────────────────
let currentMode = null;
let foundNotes  = new Set();
const stats = { modes: 0, correct: 0, errors: 0 };

// ── Statistik ─────────────────────────────────────────────────────────────────
function renderStats() {
  const sec = document.getElementById('stats-section');
  const txt = document.getElementById('stats-text');
  sec.hidden = false;
  txt.textContent =
    `${stats.modes} Modi gespielt · ${stats.correct} richtige Töne · ${stats.errors} Fehler`;
}

// ── Klaviatur aufbauen ────────────────────────────────────────────────────────
function buildKeyboard() {
  const kb = document.getElementById('keyboard');
  kb.innerHTML = '';
  kb.style.width  = KEYBOARD_WIDTH + 'px';
  kb.style.height = WH + 'px';

  KEYBOARD_KEYS.forEach(k => {
    const el = document.createElement('div');
    el.className = `key ${k.white ? 'white' : 'black'}`;
    if (k.white && k.note === 'C') el.classList.add('c-mark');
    el.dataset.note   = k.note;
    el.dataset.octave = k.oct;
    el.style.left     = k.left + 'px';

    const span = document.createElement('span');
    span.className   = 'key-label';
    span.textContent = keyLabel(k.note, k.oct);
    el.appendChild(span);

    kb.appendChild(el);
  });
}

function getKeyEl(noteOct) {
  const oct  = noteOct.slice(-1);
  const name = noteOct.slice(0, -1);
  return document.querySelector(`#keyboard .key[data-note="${name}"][data-octave="${oct}"]`);
}

// ── Tastenfarben setzen ───────────────────────────────────────────────────────
function applyColors() {
  document.querySelectorAll('#keyboard .key').forEach(k =>
    k.classList.remove('finalis', 'correct', 'incorrect')
  );
  if (!currentMode) return;

  // Finalis-Taste blau: ohne Ambitus nur die echte Finalis (eindeutige Oktave),
  // mit Ambitus beide Endpunkte (z. B. G3 + G4 für Mixolydisch).
  const showAmbitus = document.getElementById('show-ambitus').checked;
  const finalisNote = currentMode.notes[currentMode.hypo ? 3 : 0];
  const ambitusSet  = new Set([currentMode.notes[0], currentMode.notes[7]]);
  currentMode.notes.forEach(n => {
    const highlighted = showAmbitus ? ambitusSet.has(n) : n === finalisNote;
    if (highlighted && !foundNotes.has(n)) {
      const el = getKeyEl(n);
      if (el) el.classList.add('finalis');
    }
  });

  // Bereits gefundene Töne grün
  foundNotes.forEach(n => {
    const el = getKeyEl(n);
    if (el) { el.classList.remove('finalis'); el.classList.add('correct'); }
  });
}

function flashRed(keyEl) {
  keyEl.classList.add('incorrect');
  setTimeout(() => keyEl.classList.remove('incorrect'), 600);
}

// ── Modusbeutel (gleichmäßige Verteilung) ─────────────────────────────────────
let modeBag = [];

const MODES_8  = ['Dorisch','Hypodorisch','Phrygisch','Hypophrygisch',
                   'Lydisch','Hypolydisch','Mixolydisch','Hypomixolydisch'];
const MODES_12 = [...MODES_8, 'Äolisch','Hypoäolisch','Ionisch','Hypoionisch'];

function filteredModes() {
  const transpOn = document.getElementById('transpositionen').checked;
  const v        = document.getElementById('mode-filter').value;
  let pool = transpOn ? buildTranspositions() : MODES.slice();

  if (v.startsWith('m-'))  return pool.filter(m => m.name === v.slice(2));
  if (v === '8')           return pool.filter(m => MODES_8.includes(m.name));
  if (v === '12')          return pool.filter(m => MODES_12.includes(m.name));
  return pool; // 'all'
}

function fillBag() {
  const pool = [...filteredModes()];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  // Verhindert, dass nach Neubefüllung dieselbe Skala nochmals erscheint
  if (currentMode && pool.length > 1) {
    const curKey = currentMode.notes.join(',');
    const topIdx = pool.length - 1;
    if (pool[topIdx].notes.join(',') === curKey) {
      const swapIdx = Math.floor(Math.random() * topIdx);
      [pool[topIdx], pool[swapIdx]] = [pool[swapIdx], pool[topIdx]];
    }
  }
  modeBag = pool;
}

function pickMode() {
  if (modeBag.length === 0) fillBag();
  return modeBag.pop();
}

// ── Modusinfo rendern (auch bei Checkbox-Änderung) ────────────────────────────
function renderModeInfo() {
  if (!currentMode) return;
  const infoEl = document.getElementById('mode-info');
  if (infoEl.classList.contains('done')) return; // bereits abgeschlossen
  const finDE = toDE(currentMode.finalis);
  const typ   = currentMode.hypo ? 'plagaler Modus' : 'authentischer Modus';
  let text    = `Finalis: ${finDE} · ${typ}`;
  if (document.getElementById('show-ambitus').checked) {
    const n0 = currentMode.notes[0];
    const n7 = currentMode.notes[7];
    text += ` · Ambitus: ${toDE(n0.slice(0,-1)) + n0.slice(-1)}–${toDE(n7.slice(0,-1)) + n7.slice(-1)}`;
  }
  infoEl.textContent = text;
}

// ── Aufgabensteuerung ─────────────────────────────────────────────────────────
function newTask() {
  currentMode = pickMode();
  foundNotes  = new Set();

  document.getElementById('mode-name').textContent = currentMode.name;
  const infoEl = document.getElementById('mode-info');
  infoEl.classList.remove('done');
  renderModeInfo();

  applyColors();

  // Finalisnote kurz erklingen lassen
  const finalisNote = currentMode.notes.find(n => n.slice(0, -1) === currentMode.finalis);
  if (finalisNote) playNote(finalisNote);
}

// ── Tastaturklick ─────────────────────────────────────────────────────────────
document.getElementById('keyboard').addEventListener('click', e => {
  const keyEl = e.target.closest('.key');
  if (!keyEl || !currentMode) return;

  const noteOct = keyEl.dataset.note + keyEl.dataset.octave;

  // Bereits gefundene Taste: nur Klang, keine Wertung
  if (foundNotes.has(noteOct)) {
    playNote(noteOct);
    return;
  }

  playNote(noteOct);

  if (currentMode.notes.includes(noteOct)) {
    foundNotes.add(noteOct);
    keyEl.classList.remove('finalis');
    keyEl.classList.add('correct');
    stats.correct++;
    renderStats();

    if (foundNotes.size === currentMode.notes.length) {
      stats.modes++;
      const infoEl = document.getElementById('mode-info');
      infoEl.textContent = '✓ Alle 8 Töne gefunden!';
      infoEl.classList.add('done');
      renderStats();
    }
  } else {
    flashRed(keyEl);
    stats.errors++;
    renderStats();
  }
});

// ── Einstellungen ─────────────────────────────────────────────────────────────
document.getElementById('mode-filter').addEventListener('change',   () => { modeBag = []; });
document.getElementById('transpositionen').addEventListener('change', () => { modeBag = []; });

document.getElementById('show-ambitus').addEventListener('change', () => {
  renderModeInfo();
  applyColors();
});

document.getElementById('show-names').addEventListener('change', function () {
  document.getElementById('keyboard').classList.toggle('show-names', this.checked);
});

document.getElementById('btn-new').addEventListener('click', newTask);

document.getElementById('btn-stats-reset').addEventListener('click', () => {
  stats.modes = stats.correct = stats.errors = 0;
  if (!document.getElementById('stats-section').hidden) renderStats();
});

// ── Initialisierung ───────────────────────────────────────────────────────────
document.getElementById('show-ambitus').checked = false;
document.getElementById('transpositionen').checked = false;
document.getElementById('show-names').checked = false;
buildKeyboard();
preloadSamples();

// pageshow feuert nach jeder Browser-Formwiederherstellung (inkl. BFCache) –
// damit werden gespeicherte Checkbox-Zustände zuverlässig zurückgesetzt.
window.addEventListener('pageshow', () => {
  document.getElementById('show-ambitus').checked = false;
  document.getElementById('transpositionen').checked = false;
  document.getElementById('show-names').checked = false;
  document.getElementById('keyboard').classList.remove('show-names');
  renderModeInfo();
});
