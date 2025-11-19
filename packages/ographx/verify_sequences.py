#!/usr/bin/env python3
"""Verify sequences.json for duplicate IDs"""
import json
from collections import Counter

# Load sequences
with open('.ographx/artifacts/renderx-web/sequences/sequences.json', 'r') as f:
    data = json.load(f)

sequences = data['sequences']
ids = [s['id'] for s in sequences]

# Count duplicates
id_counts = Counter(ids)
duplicates = {id: count for id, count in id_counts.items() if count > 1}

print("\n" + "="*70)
print("SEQUENCES VERIFICATION REPORT")
print("="*70)
print(f"\nTotal sequences: {len(sequences)}")
print(f"Unique IDs: {len(set(ids))}")
print(f"Duplicate IDs: {len(duplicates)}")

if duplicates:
    print(f"\n⚠️  DUPLICATES FOUND:")
    for id, count in sorted(duplicates.items(), key=lambda x: x[1], reverse=True)[:10]:
        print(f"  {id}: {count} copies")
else:
    print(f"\n✅ NO DUPLICATES - All sequences have unique IDs!")

print(f"\nSample sequences (first 5):")
for seq in sequences[:5]:
    print(f"  {seq['id']}: {seq['name']}")

print("\n" + "="*70 + "\n")

