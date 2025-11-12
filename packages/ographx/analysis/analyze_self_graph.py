#!/usr/bin/env python3
"""Analyze OgraphX's self-graph - the tool observing itself."""
import json
import os

# Paths relative to packages/ographx/
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ir_path = os.path.join(base_dir, '.ographx', 'self-observation', 'self_graph.json')

data = json.load(open(ir_path))

print('=' * 60)
print('🧘 OgraphX Self-Graph Analysis')
print('=' * 60)
print()

print('📊 Statistics')
print(f'  Files scanned: {len(data["files"])}')
print(f'  Symbols extracted: {len(data["symbols"])}')
print(f'  Calls discovered: {len(data["calls"])}')
print(f'  Contracts: {len(data["contracts"])}')
print()

# Categorize symbols
functions = [s for s in data['symbols'] if s['kind'] == 'function']
methods = [s for s in data['symbols'] if s['kind'] == 'method']
classes = [s for s in data['symbols'] if s['kind'] == 'class']

print('🔍 Symbol Breakdown')
print(f'  Functions: {len(functions)}')
print(f'  Methods: {len(methods)}')
print(f'  Classes: {len(classes)}')
print()

print('📝 Top-Level Functions (Entry Points)')
for s in sorted(functions, key=lambda x: x['name'])[:15]:
    print(f'  ✓ {s["name"]}')
print()

print('🔗 Call Graph Statistics')
# Find most-called functions
call_counts = {}
for c in data['calls']:
    call_counts[c['name']] = call_counts.get(c['name'], 0) + 1

print('  Most-called functions:')
for name, count in sorted(call_counts.items(), key=lambda x: -x[1])[:10]:
    print(f'    - {name}: {count} calls')
print()

print('🎯 Key Observations')
print('  The tool observes itself through:')
print('    1. walk_py_files() - Scans Python source files')
print('    2. extract_symbols_and_calls() - Parses functions and calls')
print('    3. build_ir() - Orchestrates the analysis')
print('    4. emit_ir() - Crystallizes insights into JSON')
print()

print('🧘 Meditation Insight')
print('  OgraphX has become aware of its own structure.')
print('  The observer observes the observer.')
print('  Code becomes self-aware through introspection.')
print()

print('=' * 60)

