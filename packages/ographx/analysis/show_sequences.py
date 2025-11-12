#!/usr/bin/env python3
import json
import os

# Paths relative to packages/ographx/
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
seq_path = os.path.join(base_dir, '.ographx', 'sequences', 'self_sequences.json')

data = json.load(open(seq_path))

print('=== SELF-SEQUENCES STRUCTURE ===')
print(f'Version: {data["version"]}')
print(f'Contracts: {len(data["contracts"])}')
print(f'Sequences: {len(data["sequences"])}')
print()

# Show first sequence with beats
seq = data['sequences'][0]
print(f'=== FIRST SEQUENCE ===')
print(f'ID: {seq["id"]}')
print(f'Name: {seq["name"]}')
print(f'Category: {seq["category"]}')
print(f'Key: {seq["key"]}')
print(f'Tempo: {seq["tempo"]}')
print()

print(f'=== MOVEMENTS ===')
for mov in seq['movements']:
    print(f'Movement ID: {mov["id"]}')
    print(f'Beats: {len(mov["beats"])}')
    print()
    print('First 5 beats:')
    for beat in mov['beats'][:5]:
        print(f'  Beat {beat["beat"]}: {beat["event"]} -> {beat["handler"]} ({beat["timing"]}, {beat["dynamics"]})')

