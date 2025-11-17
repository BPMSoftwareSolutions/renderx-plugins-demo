#!/usr/bin/env python3
"""
Verify that the IR extraction bug is fixed
"""
import json

# Load the new analysis
with open('packages/ographx/.ographx/artifacts/renderx-web/analysis/analysis.json') as f:
    analysis = json.load(f)

# Check for god functions
god_funcs = analysis.get('architecture', {}).get('anti_patterns', {}).get('god_functions', [])
print(f'Total god functions found: {len(god_funcs)}')
print()

# Search for any 'if' methods
if_methods = [g for g in god_funcs if '.if' in g.get('symbol', '')]
print(f'Methods named .if: {len(if_methods)}')
if if_methods:
    print('❌ STILL BROKEN - Found:')
    for m in if_methods:
        sym = m.get('symbol', 'unknown')
        print(f'  - {sym}')
else:
    print('✅ FIXED: No .if methods found!')

# Search for KnowledgeCLI
print()
knowledge_cli = [g for g in god_funcs if 'KnowledgeCLI' in g.get('symbol', '')]
print(f'KnowledgeCLI methods: {len(knowledge_cli)}')
if knowledge_cli:
    print('Found:')
    for m in knowledge_cli:
        sym = m.get('symbol', 'unknown')
        print(f'  - {sym}')
else:
    print('✅ No KnowledgeCLI methods in god functions')

print()
print('Top 10 god functions:')
for i, g in enumerate(god_funcs[:10], 1):
    sym = g.get('symbol', 'unknown')
    calls = g.get('total_calls', 0)
    unique = g.get('unique_called', 0)
    print(f'{i}. {sym} - {calls} calls, {unique} unique callees')

