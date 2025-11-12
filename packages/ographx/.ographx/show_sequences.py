#!/usr/bin/env python3
import json

data = json.load(open('self_sequences.json'))

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

