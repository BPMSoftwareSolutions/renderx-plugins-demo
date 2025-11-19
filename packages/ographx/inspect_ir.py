#!/usr/bin/env python3
"""Inspect IR structure to see what data is available"""
import json

with open('.ographx/artifacts/renderx-web/ir/graph.json', 'r') as f:
    ir = json.load(f)

print("\n" + "="*70)
print("IR STRUCTURE INSPECTION")
print("="*70)

# Look at a few symbols
symbols = ir.get('symbols', [])
print(f"\nTotal symbols: {len(symbols)}")
print(f"\nFirst 3 symbols:")

for i, sym in enumerate(symbols[:3]):
    print(f"\n[{i}] Symbol ID: {sym.get('id')}")
    print(f"    Available keys: {list(sym.keys())}")
    print(f"    Full data:")
    print(json.dumps(sym, indent=6))

# Check if any symbols have line/location info
print(f"\n\nSearching for line/location info in symbols...")
has_line = 0
has_location = 0
has_range = 0
for sym in symbols:
    if 'line' in sym or 'lineNumber' in sym or 'startLine' in sym:
        has_line += 1
    if 'location' in sym:
        has_location += 1
    if 'range' in sym:
        has_range += 1

print(f"Symbols with line info: {has_line}")
print(f"Symbols with location info: {has_location}")
print(f"Symbols with range info: {has_range}")

# Check files structure
files = ir.get('files', [])
print(f"\n\nFiles in IR: {len(files)}")
if files:
    print(f"First file:")
    print(json.dumps(files[0], indent=2))

print("\n" + "="*70 + "\n")

