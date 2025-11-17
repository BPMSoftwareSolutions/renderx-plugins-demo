#!/usr/bin/env python3
"""
ASCII visualizations of architecture issues
"""
import json
from collections import defaultdict

data = json.load(open('packages/ographx/.ographx/artifacts/renderx-web/analysis/analysis.json'))
ir_data = json.load(open('packages/ographx/.ographx/artifacts/renderx-web/ir/graph.json'))

arch = data.get('architecture', {})
symbols = ir_data.get('symbols', [])

# Count duplicate symbols
symbol_ids = [s.get('id') for s in symbols]
from collections import Counter
dup_counts = Counter(symbol_ids)
duplicates = {sym: count for sym, count in dup_counts.items() if count > 1}

print("\n" + "="*80)
print("REDUNDANCY ANALYSIS: DUPLICATE SYMBOLS IN IR")
print("="*80)

print(f"\n📋 STATISTICS")
print(f"   Total symbol entries: {len(symbol_ids)}")
print(f"   Unique symbol IDs: {len(set(symbol_ids))}")
print(f"   Duplicate IDs: {len(duplicates)}")
print(f"   Total duplicate entries: {sum(dup_counts.values()) - len(set(symbol_ids))}")

print(f"\n🔴 TOP 10 MOST DUPLICATED SYMBOLS")
for i, (sym, count) in enumerate(sorted(duplicates.items(), key=lambda x: x[1], reverse=True)[:10], 1):
    print(f"   {i}. {sym}")
    print(f"      Appears {count} times (should be 1)")

print("\n" + "="*80)
print("COUPLING MAP: MOST UNSTABLE SYMBOLS")
print("="*80)

coupling = arch.get('coupling', {})
unstable = sorted(coupling.items(), key=lambda x: x[1].get('instability', 0), reverse=True)[:15]

print("\n   INSTABILITY SCALE: 0 (stable) -------- 1 (unstable)")
print()
for sym, metrics in unstable:
    inst = metrics['instability']
    bar_len = int(inst * 40)
    bar = "█" * bar_len + "░" * (40 - bar_len)
    ca = metrics['afferent']
    ce = metrics['efferent']
    print(f"   [{bar}] {inst:.2f}")
    print(f"      {sym}")
    print(f"      ← {ca} callers | {ce} calls →")
    print()

print("="*80)
print("CYCLE MAP")
print("="*80)

cycles = arch.get('anti_patterns', {}).get('cycles', [])
if cycles:
    for i, cyc in enumerate(cycles, 1):
        members = cyc['members']
        print(f"\n   Cycle #{i} (size {cyc['size']}):")
        for j, member in enumerate(members):
            next_member = members[(j + 1) % len(members)]
            print(f"      {member}")
            print(f"         ↓")
        print(f"      {members[0]} (closes loop)")
else:
    print("\n   ✓ No cycles detected")

print("\n" + "="*80 + "\n")

