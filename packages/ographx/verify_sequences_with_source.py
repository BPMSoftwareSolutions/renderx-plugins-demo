#!/usr/bin/env python3
"""Verify sequences.json has source location info"""
import json

with open('.ographx/artifacts/renderx-web/sequences/sequences.json', 'r') as f:
    data = json.load(f)

sequences = data['sequences']

print("\n" + "="*70)
print("SEQUENCES WITH SOURCE INFO VERIFICATION")
print("="*70)

# Check for source info
with_source = sum(1 for s in sequences if s.get('source'))
without_source = len(sequences) - with_source

print(f"\nTotal sequences: {len(sequences)}")
print(f"With source info: {with_source}")
print(f"Without source info: {without_source}")

# Show examples
print(f"\nExample sequences with source info:")
count = 0
for seq in sequences:
    if seq.get('source') and count < 3:
        print(f"\n  ID: {seq['id']}")
        print(f"  Name: {seq['name']}")
        print(f"  Source: {json.dumps(seq['source'], indent=4)}")
        count += 1

print("\n" + "="*70 + "\n")

