#!/usr/bin/env python3
"""
Show evidence: What does KnowledgeCLI.if actually call?
"""
import json
from collections import defaultdict

# Load IR
ir_data = json.load(open('packages/ographx/.ographx/artifacts/renderx-web/ir/graph.json'))

# Find all calls FROM KnowledgeCLI.if
calls = ir_data.get('calls', [])
knowledge_cli_if_calls = [c for c in calls if c.get('frm') == 'knowledge-cli.ts::KnowledgeCLI.if']

print("=" * 80)
print("EVIDENCE: What does KnowledgeCLI.if call?")
print("=" * 80)

print(f"\nTotal calls FROM KnowledgeCLI.if: {len(knowledge_cli_if_calls)}")

# Count unique callees
unique_callees = set()
call_counts = defaultdict(int)

for call in knowledge_cli_if_calls:
    to_func = call.get('to')
    name = call.get('name', to_func)
    if name:
        unique_callees.add(name)
        call_counts[name] += 1

print(f"Unique callees: {len(unique_callees)}")

print("\n" + "=" * 80)
print("TOP 30 FUNCTIONS CALLED BY KnowledgeCLI.if")
print("=" * 80)

sorted_calls = sorted(call_counts.items(), key=lambda x: x[1], reverse=True)
for i, (func, count) in enumerate(sorted_calls[:30]):
    pct = (count / len(knowledge_cli_if_calls)) * 100
    print(f"{i+1:2}. {func:50} {count:3} calls ({pct:5.1f}%)")

print("\n" + "=" * 80)
print("SAMPLE CALLS (first 20)")
print("=" * 80)

for i, call in enumerate(knowledge_cli_if_calls[:20]):
    print(f"\n{i+1}. Line {call.get('line')}")
    print(f"   From: {call.get('frm')}")
    print(f"   To:   {call.get('to')}")
    print(f"   Name: {call.get('name')}")

print("\n" + "=" * 80)
print("SUMMARY")
print("=" * 80)
print(f"Total calls: {len(knowledge_cli_if_calls)}")
print(f"Unique functions called: {len(unique_callees)}")
print(f"Most called function: {sorted_calls[0][0]} ({sorted_calls[0][1]} times)")

