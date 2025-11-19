#!/usr/bin/env python3
"""Inspect IR structure to see call information"""
import json

with open('.ographx/artifacts/renderx-web/ir/graph.json', 'r') as f:
    ir = json.load(f)

# Check calls structure
calls = ir.get('calls', [])
print(f"Total calls in IR: {len(calls)}")

# Build a map of symbol_id -> calls
symbol_calls = {}
for call in calls:
    caller = call.get('frm')  # Note: it's 'frm' not 'caller'
    if caller:
        if caller not in symbol_calls:
            symbol_calls[caller] = []
        symbol_calls[caller].append(call)

# Find symbols with most calls
sorted_symbols = sorted(symbol_calls.items(), key=lambda x: len(x[1]), reverse=True)

print(f"\nTop 10 symbols by call count:")
for symbol_id, calls_list in sorted_symbols[:10]:
    print(f"\n{symbol_id}: {len(calls_list)} calls")
    for call in calls_list[:5]:
        to_sym = call.get('to', '(unknown)')
        name = call.get('name', '?')
        line = call.get('line', '?')
        print(f"  → {name} (line {line}) → {to_sym}")
    if len(calls_list) > 5:
        print(f"  ... and {len(calls_list) - 5} more")

