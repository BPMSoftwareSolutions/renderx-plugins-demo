#!/usr/bin/env python3
import json

data = json.load(open('self_graph.json'))

print('=== SELF-GRAPH STRUCTURE ===')
print(f'Files: {len(data["files"])}')
print(f'Symbols: {len(data["symbols"])}')
print(f'Calls: {len(data["calls"])}')
print(f'Contracts: {len(data["contracts"])}')
print()

print('=== FILES ===')
for f in data['files']:
    print(f'  {f}')
print()

print('=== TOP 10 SYMBOLS ===')
for sym in data['symbols'][:10]:
    print(f'  {sym["id"]} ({sym["kind"]})')
print()

print('=== TOP 10 CALLS ===')
for call in data['calls'][:10]:
    print(f'  {call["frm"]} -> {call["to"]} ({call["name"]})')
print()

print('=== CALL FREQUENCY ===')
call_counts = {}
for call in data['calls']:
    name = call['name']
    call_counts[name] = call_counts.get(name, 0) + 1

for name, count in sorted(call_counts.items(), key=lambda x: -x[1])[:10]:
    print(f'  {name}: {count}x')

