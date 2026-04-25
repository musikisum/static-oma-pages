# Töne im Bass- und Violinschlüssel — fertig

Lernspiel: Eine Note erscheint auf dem Notensystem, der Spieler klickt die richtige Taste auf der Klaviertastatur.

## Spielprinzip

- Zufällige Note wird auf dem SVG-Notensystem gezeichnet (inkl. Hilfslinien, Hals)
- Spieler klickt die Taste auf der Klaviertastatur → sofortiges Feedback (grün/rot)
- Bei Fehler: richtige Taste wird zusätzlich grün markiert
- Bag-Randomisierung: alle Noten kommen einmal dran, bevor eine Wiederholung kommt
- Statistik: Richtig / Versuche / Quote / Serie

## Schlüssel & Tonumfang

| Schlüssel | Bereich | Noten |
|-----------|---------|-------|
| Violin    | C4–C6   | 15 Noten |
| Bass      | C2–C4   | 15 Noten |
| Beide     | C2–C6   | 30 Noten (Bag über beide) |

## Features

- Notennamen-Checkbox: zeigt Helmholtz (c') oder International (C4) auf der grünen Taste
- c' (mittleres C) ist statisch auf der Tastatur beschriftet
- Salamander Grand Piano Samples (Tone.js CDN), Fallback: Oszillator
- Ton erklingt bei neuer Aufgabe und beim Tastendruck
- „Zurücksetzen": gleiche Aufgabe nochmal (kein Statistik-Eintrag)
- „Neue Aufgabe": nächste Note aus dem Bag

## Technische Eckdaten

```
SVG viewBox:  0 0 420 140
Notenlinien:  y = 38, 50, 62, 74, 86  (Abstand 12px)
Notensystem:  x1=70 … x2=390
Note-X:       230 (Mitte)
Tastatur:     weiße Taste 28×100px, schwarze 16×62px
```

Lookup-Tabellen `TREBLE_Y` / `BASS_Y`: `'C4' → 98` (SVG-y-Koordinate).
