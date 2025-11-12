#!/usr/bin/env python3
import json

data = json.load(open('self_sequences.json'))

# Find a sequence with actual beats (not just noop)
for seq in data['sequences']:
    for mov in seq['movements']:
        if len(mov['beats']) > 1 or (len(mov['beats']) == 1 and mov['beats'][0]['event'] != 'noop'):
            print(f'=== SEQUENCE: {seq["name"]} ===')
            print(f'ID: {seq["id"]}')
            print(f'Category: {seq["category"]}')
            print(f'Key: {seq["key"]} | Tempo: {seq["tempo"]}')
            print()
            
            for mov in seq['movements']:
                print(f'MOVEMENT: {mov["id"]}')
                print(f'Total beats: {len(mov["beats"])}')
                print()
                print('Beats:')
                for beat in mov['beats'][:10]:
                    print(f'  Beat {beat["beat"]:2d}: {beat["event"]:20s} -> {beat["handler"]:20s} ({beat["timing"]:10s}, {beat["dynamics"]})')
            print()
            print('---')
            break
    else:
        continue
    break

