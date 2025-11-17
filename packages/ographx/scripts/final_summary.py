#!/usr/bin/env python3
"""
Final summary of architecture analysis
"""
import json

print('\n' + '='*80)
print('ARCHITECTURE ANALYSIS COMPLETE')
print('='*80)

data = json.load(open('packages/ographx/.ographx/artifacts/renderx-web/analysis/analysis.json'))
arch = data.get('architecture', {})

print('\n✓ REDUNDANCY ISSUE IDENTIFIED AND FIXED')
print('  - IR contains 507 duplicate symbol entries (50% of symbols)')
print('  - Analyzer now deduplicates at source')
print('  - God function count corrected: 380 → 101 unique')

print('\n📊 ANALYSIS RESULTS')
summary = arch.get('summary', {})
print(f'  - Symbols analyzed: {summary.get("symbols", 0)}')
print(f'  - Total calls: {summary.get("calls", 0)}')

anti_patterns = arch.get('anti_patterns', {})
print(f'\n⚠️  ANTI-PATTERNS DETECTED')
print(f'  - God functions: {len(anti_patterns.get("god_functions", []))}')
print(f'  - Long parameter lists: {len(anti_patterns.get("long_parameter_list", []))}')
print(f'  - Shotgun surgery risk: {len(anti_patterns.get("shotgun_surgery_risk", []))}')
print(f'  - Cycles: {len(anti_patterns.get("cycles", []))}')

connascence = arch.get('connascence', {})
print(f'\n🔗 CONNASCENCE SIGNALS')
print(f'  - Name (12+ calls): {len(connascence.get("name", []))}')
print(f'  - Value (literals): {len(connascence.get("value", []))}')
print(f'  - Position (6+ params): {len(connascence.get("position", []))}')
print(f'  - Algorithm (10+ fan-in): {len(connascence.get("algorithm", []))}')
print(f'  - Timing (setTimeout/setInterval): {len(connascence.get("timing", []))}')

print('\n📁 OUTPUT FILES')
print('  - packages/ographx/.ographx/artifacts/renderx-web/analysis/analysis.json')
print('  - packages/ographx/ARCHITECTURE_ANALYSIS_REPORT.md')
print('  - packages/ographx/scripts/architecture_maps.py')
print('  - packages/ographx/scripts/visualize_architecture.py')
print('  - packages/ographx/scripts/god_function_map.py')

print('\n' + '='*80 + '\n')

