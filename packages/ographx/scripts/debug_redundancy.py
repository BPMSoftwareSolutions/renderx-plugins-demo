#!/usr/bin/env python3
"""
Debug redundancy in god function detection
"""
import json

# Load IR
ir_data = json.load(open('packages/ographx/.ographx/artifacts/renderx-web/ir/graph.json'))
symbols = ir_data.get('symbols', [])

# Find KnowledgeCLI symbols
knowledge_cli = [s for s in symbols if 'KnowledgeCLI' in s.get('id', '')]
print(f'KnowledgeCLI symbols found: {len(knowledge_cli)}')
print()
for s in knowledge_cli[:20]:
    print(f"  ID: {s.get('id')}")
    print(f"     Name: {s.get('name')}, Kind: {s.get('kind')}")
    print()

# Check calls
calls = ir_data.get('calls', [])
knowledge_cli_calls = [c for c in calls if 'KnowledgeCLI' in c.get('frm', '')]
print(f'\nCalls FROM KnowledgeCLI symbols: {len(knowledge_cli_calls)}')
print('Sample calls:')
for c in knowledge_cli_calls[:10]:
    print(f"  {c.get('frm')} -> {c.get('to')} ({c.get('name')})")

