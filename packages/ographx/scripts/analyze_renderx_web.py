#!/usr/bin/env python3
"""
Extract and display architecture analysis for renderx-web
"""
import json

data = json.load(open('packages/ographx/.ographx/artifacts/renderx-web/analysis/analysis.json'))
arch = data.get('architecture', {})

print("\n" + "="*80)
print("RENDERX-WEB ARCHITECTURE ANALYSIS")
print("="*80)

# Summary
summary = arch.get('summary', {})
print(f"\n📊 SUMMARY")
print(f"   Symbols: {summary.get('symbols', 0)}")
print(f"   Calls: {summary.get('calls', 0)}")

# Anti-patterns
anti_patterns = arch.get('anti_patterns', {})
print(f"\n⚠️  ANTI-PATTERNS")
print(f"   God Functions: {len(anti_patterns.get('god_functions', []))}")
print(f"   Long Parameter Lists: {len(anti_patterns.get('long_parameter_list', []))}")
print(f"   Shotgun Surgery Risk: {len(anti_patterns.get('shotgun_surgery_risk', []))}")
print(f"   Cycles: {len(anti_patterns.get('cycles', []))}")

# Top god functions
god_funcs = sorted(anti_patterns.get('god_functions', []), key=lambda x: x.get('total_calls', 0), reverse=True)[:10]
print(f"\n🔴 TOP 10 GOD FUNCTIONS (excessive calls)")
for i, gf in enumerate(god_funcs, 1):
    print(f"   {i}. {gf['symbol']}")
    print(f"      Total calls: {gf['total_calls']}, Unique: {gf['unique_called']}")

# Cycles
cycles = anti_patterns.get('cycles', [])
print(f"\n🔄 CYCLES ({len(cycles)})")
for cyc in cycles:
    members = cyc['members']
    display = ' -> '.join(members[:5])
    if len(members) > 5:
        display += f" ... (+{len(members)-5} more)"
    print(f"   Cycle size {cyc['size']}: {display}")

# Connascence
connascence = arch.get('connascence', {})
print(f"\n🔗 CONNASCENCE SIGNALS")
print(f"   Name (12+ calls): {len(connascence.get('name', []))}")
print(f"   Value (literals): {len(connascence.get('value', []))}")
print(f"   Position (6+ params): {len(connascence.get('position', []))}")
print(f"   Algorithm (10+ fan-in): {len(connascence.get('algorithm', []))}")
print(f"   Timing (setTimeout/setInterval): {len(connascence.get('timing', []))}")

# Top name connascence
name_conn = sorted(connascence.get('name', []), key=lambda x: x.get('count', 0), reverse=True)[:10]
print(f"\n📍 TOP 10 NAME CONNASCENCE (called 12+ times)")
for i, nc in enumerate(name_conn, 1):
    print(f"   {i}. {nc['identifier']}: {nc['count']} calls")

# Coupling metrics - most unstable
coupling = arch.get('coupling', {})
unstable = sorted(coupling.items(), key=lambda x: x[1].get('instability', 0), reverse=True)[:10]
print(f"\n📈 TOP 10 MOST UNSTABLE SYMBOLS (high efferent coupling)")
for i, (sym, metrics) in enumerate(unstable, 1):
    print(f"   {i}. {sym}")
    print(f"      Afferent: {metrics['afferent']}, Efferent: {metrics['efferent']}, Instability: {metrics['instability']}")

print("\n" + "="*80 + "\n")

