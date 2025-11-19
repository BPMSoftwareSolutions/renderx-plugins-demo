#!/usr/bin/env python3
"""Inspect IR structure to see call information"""
import json

with open('.ographx/artifacts/renderx-web/ir/graph.json', 'r') as f:
    ir = json.load(f)

print("\n" + "="*70)
print("IR CALLS STRUCTURE INSPECTION")
print("="*70)

# Check calls structure
calls = ir.get('calls', [])
print(f"\nTotal calls in IR: {len(calls)}")

if calls:
    print(f"\nFirst 5 calls:")
    for i, call in enumerate(calls[:5]):
        print(f"\n[{i}] Call:")
        print(f"    Keys: {list(call.keys())}")
        print(f"    Full: {json.dumps(call, indent=6)}")

# Find a symbol with calls
print(f"\n\nLooking for symbols with calls...")
symbols = ir.get('symbols', [])

# Build a map of symbol_id -> calls
symbol_calls = {}
for call in calls:
    caller = call.get('caller')
    if caller:
        if caller not in symbol_calls:
            symbol_calls[caller] = []
        symbol_calls[caller].append(call)

# Find symbols with most calls
sorted_symbols = sorted(symbol_calls.items(), key=lambda x: len(x[1]), reverse=True)

print(f"\nTop 5 symbols by call count:")
for symbol_id, calls_list in sorted_symbols[:5]:
    print(f"\n  {symbol_id}: {len(calls_list)} calls")
    for call in calls_list[:3]:
        print(f"    → calls {call.get('callee')}")
    if len(calls_list) > 3:
        print(f"    ... and {len(calls_list) - 3} more")

print("\n" + "="*70 + "\n")

