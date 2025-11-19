#!/usr/bin/env python3
"""Verify sequences.json has call-based beats"""
import json

with open('.ographx/artifacts/renderx-web/sequences/sequences.json', 'r') as f:
    data = json.load(f)

sequences = data['sequences']

print("\n" + "="*70)
print("SEQUENCES WITH CALL-BASED BEATS VERIFICATION")
print("="*70)

# Find sequences with different call counts
call_counts = {}
for seq in sequences:
    count = seq.get('callCount', 0)
    if count not in call_counts:
        call_counts[count] = 0
    call_counts[count] += 1

print(f"\nTotal sequences: {len(sequences)}")
print(f"\nDistribution by call count:")
for count in sorted(call_counts.keys()):
    print(f"  {count:3d} calls: {call_counts[count]:4d} sequences")

# Show examples
print(f"\n\nExample sequences:")

# Find one with no calls
for seq in sequences:
    if seq.get('callCount') == 0:
        print(f"\n[NO CALLS] {seq['id']}")
        print(f"  Name: {seq['name']}")
        print(f"  Movements: {len(seq['movements'])}")
        for mov in seq['movements']:
            print(f"    - {mov['name']}: {len(mov['beats'])} beat(s)")
        break

# Find one with many calls
for seq in sorted(sequences, key=lambda s: s.get('callCount', 0), reverse=True)[:1]:
    print(f"\n[{seq['callCount']} CALLS] {seq['id']}")
    print(f"  Name: {seq['name']}")
    print(f"  Movements: {len(seq['movements'])}")
    for mov in seq['movements']:
        beats = mov['beats']
        print(f"    - {mov['name']}: {len(beats)} beat(s)")
        if mov['name'] == 'Execution' and beats:
            for beat in beats[:3]:
                print(f"      • {beat['event']} (line {beat.get('line', '?')})")
            if len(beats) > 3:
                print(f"      ... and {len(beats) - 3} more")

print("\n" + "="*70 + "\n")

