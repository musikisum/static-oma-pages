import json
import glob
import os

entries = []
for path in sorted(glob.glob('*/meta.json')):
    folder = os.path.dirname(path)
    with open(path, encoding='utf-8') as f:
        items = json.load(f)
    for item in items:
        item['folder'] = folder
        entries.append(item)

with open('games.json', 'w', encoding='utf-8') as f:
    json.dump(entries, f, ensure_ascii=False, indent=2)

# Zusätzlich als JS-Variable – funktioniert auch mit file://-Protokoll
with open('games-data.js', 'w', encoding='utf-8') as f:
    f.write('// Auto-generiert von generate_games.py – nicht manuell bearbeiten\n')
    f.write('var GAMES_DATA = ')
    json.dump(entries, f, ensure_ascii=False, indent=2)
    f.write(';\n')

print(f'Generated {len(entries)} entries in games.json and games-data.js')
