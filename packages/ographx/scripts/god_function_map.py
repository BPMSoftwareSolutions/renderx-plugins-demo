#!/usr/bin/env python3
"""
Map of god functions and their call patterns
"""
import json
from collections import defaultdict

data = json.load(open('packages/ographx/.ographx/artifacts/renderx-web/analysis/analysis.json'))
ir_data = json.load(open('packages/ographx/.ographx/artifacts/renderx-web/ir/graph.json'))

arch = data.get('architecture', {})
calls = ir_data.get('calls', [])

# Get unique god functions (deduplicated)
god_funcs_raw = arch.get('anti_patterns', {}).get('god_functions', [])
unique_gods = {}
for gf in god_funcs_raw:
    sym = gf['symbol']
    if sym not in unique_gods:
        unique_gods[sym] = gf

print("\n" + "="*80)
print("GOD FUNCTION CALL PATTERNS")
print("="*80)

# Sort by total calls
sorted_gods = sorted(unique_gods.items(), key=lambda x: x[1]['total_calls'], reverse=True)[:10]

for i, (sym, metrics) in enumerate(sorted_gods, 1):
    total = metrics['total_calls']
    unique = metrics['unique_called']
    
    # Get actual calls from this symbol
    symbol_calls = [c for c in calls if c.get('frm') == sym]
    call_names = defaultdict(int)
    for c in symbol_calls:
        name = c.get('name') or c.get('to') or 'unknown'
        call_names[name] += 1
    
    # Top callees
    top_callees = sorted(call_names.items(), key=lambda x: x[1], reverse=True)[:5]
    
    print(f"\n   {i}. {sym}")
    print(f"      Total calls: {total} | Unique: {unique}")
    print(f"      Call ratio: {unique}/{total} = {unique/total:.1%} unique")
    print(f"      Top callees:")
    for name, count in top_callees:
        bar_len = int((count / total) * 20)
        bar = "█" * bar_len
        print(f"         {name:30s} {bar} {count}")

print("\n" + "="*80)
print("REDUNDANCY IMPACT")
print("="*80)

symbol_ids = [s.get('id') for s in ir_data.get('symbols', [])]
from collections import Counter
dup_counts = Counter(symbol_ids)
duplicates = {sym: count for sym, count in dup_counts.items() if count > 1}

total_dups = sum(dup_counts.values()) - len(set(symbol_ids))
print(f"\n   Duplicate symbol entries: {total_dups}")
print(f"   This inflates god function count by ~{int(total_dups * 0.75)}")
print(f"   Actual unique god functions: ~{len(unique_gods)}")
print(f"   Reported god functions: {len(god_funcs_raw)}")
print(f"   Inflation factor: {len(god_funcs_raw) / len(unique_gods):.1f}x")

print("\n" + "="*80 + "\n")

