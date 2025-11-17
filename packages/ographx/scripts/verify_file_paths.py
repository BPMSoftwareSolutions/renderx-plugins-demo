#!/usr/bin/env python3
"""
Verify that file paths are included in analysis output
"""
import json

data = json.load(open('packages/ographx/.ographx/artifacts/renderx-web/analysis/analysis.json'))

print('GOD FUNCTIONS (with file paths):')
print('='*80)
for gf in data['architecture']['anti_patterns']['god_functions'][:3]:
    print(f"\nSymbol: {gf['symbol']}")
    print(f"File: {gf['file']}")
    print(f"Lines: {gf['line_range']}")
    print(f"Calls: {gf['total_calls']} total, {gf['unique_called']} unique")

print('\n\nCYCLES (with file paths):')
print('='*80)
for cycle in data['architecture']['anti_patterns']['cycles']:
    print(f"\nCycle size: {cycle['size']}")
    for member in cycle['members']:
        print(f"  - {member['symbol']}")
        print(f"    File: {member['file']}")
        print(f"    Lines: {member['line_range']}")

print('\n\nCOUPLING (sample with file paths):')
print('='*80)
coupling = data['architecture']['coupling']
for sym in list(coupling.keys())[:2]:
    c = coupling[sym]
    print(f"\nSymbol: {sym}")
    print(f"File: {c['file']}")
    print(f"Lines: {c['line_range']}")
    print(f"Instability: {c['instability']}")

print('\n\n✓ File paths successfully included in analysis output!')

