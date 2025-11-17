#!/usr/bin/env python3
"""
Investigate: Are all 281 calls really from lines 273-277?
"""
import json

# Load IR
ir_data = json.load(open('packages/ographx/.ographx/artifacts/renderx-web/ir/graph.json'))

# Find all calls FROM KnowledgeCLI.if
calls = ir_data.get('calls', [])
knowledge_cli_if_calls = [c for c in calls if c.get('frm') == 'knowledge-cli.ts::KnowledgeCLI.if']

print("=" * 80)
print("INVESTIGATION: Where are the 281 calls actually from?")
print("=" * 80)

# Group by line number
calls_by_line = {}
for call in knowledge_cli_if_calls:
    line = call.get('line')
    if line not in calls_by_line:
        calls_by_line[line] = []
    calls_by_line[line].append(call)

print(f"\nTotal calls: {len(knowledge_cli_if_calls)}")
print(f"Calls span {len(calls_by_line)} different lines")
print()

# Show line distribution
print("Calls by line number:")
print("-" * 80)
for line in sorted(calls_by_line.keys()):
    count = len(calls_by_line[line])
    print(f"Line {line:4}: {count:3} calls")

print()
print("=" * 80)
print("PROBLEM IDENTIFIED:")
print("=" * 80)
print(f"The symbol 'KnowledgeCLI.if' has line_range [273, 277]")
print(f"But calls are from lines: {sorted(calls_by_line.keys())}")
print()
print("This means the IR extractor is:")
print("1. Creating a SINGLE symbol ID 'KnowledgeCLI.if'")
print("2. But attributing calls from MANY different if statements to it")
print("3. Across the ENTIRE class (lines 273-1187)")
print()
print("ROOT CAUSE: The TypeScript extractor treats all 'if' statements")
print("in the class as a single symbol!")

