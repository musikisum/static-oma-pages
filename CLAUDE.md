# Musikspiele-Sammlung — Claude-Kontext

Statische HTML-Lernspiele für Musiktheorie, gehostet auf GitHub Pages (musikisum/static-oma-pages).
Kein Build-Schritt, kein Framework, keine externen JS-Abhängigkeiten. Ziel: < 1 MB pro Spiel.

## Projektregeln

- Jedes Spiel bekommt einen eigenen Unterordner mit `index.html`, `style.css`, `script.js`
- Kein `<h1>` im HTML — die Überschrift kommt vom einbettenden CMS (Open Music Academy)
- Body ohne `min-height: 100vh` — Seite passt sich dem Content an (Embed-Plugin)
- Schlüsselwahl = Bereichswahl (kein separater Schlüssel-Toggle)
- Sofortiges Feedback beim ersten Tastendruck — kein „Überprüfen"-Button
- GitHub Remote: `git@github.com:musikisum/static-oma-pages.git`

## Architektur-Muster (aus Spiel 1 etabliert)

### SVG-Notensystem
```
viewBox="0 0 420 140"
LINE_Y = [38, 50, 62, 74, 86]   // 5 Linien, Abstand 12px
STAFF_X1 = 70, STAFF_X2 = 390
NOTE_X = 230                     // Noten-x-Position (Mitte)
```
Schlüssel als Unicode-Text in SVG: 𝄞 `\u{1D11E}` (Violin), 𝄢 `\u{1D122}` (Bass).
Position absolut per `x`/`y` auf dem SVG-Text-Element — mit `position: absolute` im CSS korrigierbar.

### Hilfslinien
```js
function ledgerLineYs(noteY) {
  // Gibt y-Positionen aller benötigten Hilfslinien zurück
  // Oberhalb: top-LS bis noteY (schrittweise -LS)
  // Unterhalb: bot+LS bis noteY (schrittweise +LS)
}
```

### Bag-Randomisierung (gleichmäßige Verteilung)
Statt `Math.random()` direkt: Fisher-Yates-gemischtes Array aller Noten.
Wenn leer → neu mischen. Verhindert Häufung gleicher Töne.
```js
let noteBag = [];
function fillBag(clefVal) { /* Fisher-Yates shuffle aller Noten */ }
function pickNote(clefVal) {
  if (noteBag.length === 0) fillBag(clefVal);
  return noteBag.pop();
}
```
Bag zurücksetzen bei Schlüsselwechsel: `noteBag = []`.

### Web Audio — Salamander Grand Piano
MP3-Samples von `https://tonejs.github.io/audio/salamander/` (CC BY 3.0).
Dateinamen: `C4.mp3`, `Ds4.mp3` (D# = Ds), `Fs4.mp3` (F# = Fs), `A4.mp3`.

```js
// Verfügbare Samples in unserem Bereich (MIDI → Dateiname):
// 36:C2  39:Ds2  42:Fs2  45:A2
// 48:C3  51:Ds3  54:Fs3  57:A3
// 60:C4  63:Ds4  66:Fs4  69:A4
// 72:C5  75:Ds5  78:Fs5  81:A5
// 84:C6
```

Strategie: Fetch auf Seitenlade (kein AudioContext nötig) → ArrayBuffer cachen →
beim ersten `playNote`-Aufruf AudioContext erzeugen + decodeAudioData.
`playbackRate = 2^((zielMidi - sampleMidi) / 12)` für Zwischentöne.
Fallback: Triangle-Oszillator wenn Sample noch nicht geladen.

MIDI-Formel: `midi = (oktave + 1) * 12 + halbton`  (C4 = 60, A4 = 69)

### Notenbezeichnung
```js
function formatNoteName(noteOct, intl) {
  // intl=true  → C4, D3, A5 ...
  // intl=false → Helmholtz: C(oct≤2), c(oct=3), c'(oct=4), c''(oct=5), c'''(oct=6)
  //              B → H (deutsche Notation)
}
```

### Tastatur
Weiße Taste: 28px breit, 100px hoch. Schwarze Taste: 16px × 62px.
Oktave = 7 × 28 = 196px.
Black-Key-Offsets pro Oktave: C#=17, D#=45, F#=101, G#=129, A#=157.
Event-Delegation auf `#keyboard` mit `e.target.closest('.key')`.

### Statistik
`stats = { correct, attempts, streak }` — nur echte Erstantworten zählen.
`renderStats()` zeigt `X von Y richtig (Z %) · Serie: N`.
Sichtbar erst nach erster Antwort (`hidden`-Attribut).

---

## Nächstes Spiel: Rhythmus

**Idee:** Rhythmusmuster erkennen / klatschen / eingeben.

### Adaptierbare Teile aus Spiel 1
- SVG-Notensystem: gleiche Dimensionen, gleiche `drawStaff()`-Funktion
- Web Audio: `playNote()` + Salamander-Samples wiederverwendbar für Notenklang;
  zusätzlich Metronom-Klick mit simplem Oszillator (kurzer Burst ~50ms)
- Bag-Randomisierung: für zufällige Rhythmusmuster
- Statistik-Komponente: identisch übernehmbar
- CSS-Grundgerüst: `.app`, `.settings`, `.controls`, `.stats` direkt kopieren

### Neue Anforderungen Rhythmus
- Notenwerte darstellen: Ganze, Halbe, Viertel, Achtel (SVG-Elemente)
  - Ganze Note: ungefüllte Ellipse (rx=6, ry=4.5)
  - Halbe Note: ungefüllte Ellipse + Hals
  - Viertel: gefüllte Ellipse + Hals (wie aktuell)
  - Achtel: gefüllte Ellipse + Hals + Fähnchen
- Taktstriche in SVG: senkrechte Linien über alle 5 Linien
- Metronom / Playback: `AudioContext` + `setTimeout`/`AudioContext.currentTime` für präzises Timing
- Eingabe: Klatschen per Leertaste oder Touch → Zeitstempel aufzeichnen → mit Soll-Rhythmus vergleichen
- Toleranzfenster für Timing (z.B. ±150ms)
