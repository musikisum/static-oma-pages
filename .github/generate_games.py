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

print(f'Generated {len(entries)} entries in games.json')
