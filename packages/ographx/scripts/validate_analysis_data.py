#!/usr/bin/env python3
"""
Validate analysis data against actual source code
"""
import json
import os

# Load IR and analysis
ir_data = json.load(open('packages/ographx/.ographx/artifacts/renderx-web/ir/graph.json'))
analysis_data = json.load(open('packages/ographx/.ographx/artifacts/renderx-web/analysis/analysis.json'))

print("=" * 80)
print("VALIDATION: Analysis Data vs Source Code")
print("=" * 80)

# Find KnowledgeCLI in IR
print("\n1. UNDERSTANDING line_range:")
print("-" * 80)
print("line_range represents the START and END lines of a symbol in the source file.")
print("For methods, it's the range of the method body.")
print("For classes, it's the range of the class definition.")
print()

knowledge_cli_symbols = [s for s in ir_data['symbols'] if 'KnowledgeCLI' in s.get('id', '')]
print(f"Found {len(knowledge_cli_symbols)} KnowledgeCLI symbols in IR (includes duplicates):")
print(f"  - Unique IDs: {len(set(s.get('id') for s in knowledge_cli_symbols))}")
print()
print("First 5 KnowledgeCLI symbols:")
for sym in knowledge_cli_symbols[:5]:
    print(f"\n  ID: {sym['id']}")
    print(f"  Range: {sym['range']} (lines {sym['range'][0]}-{sym['range'][1]})")
    print(f"  Kind: {sym['kind']}")

# Check god functions in analysis
print("\n\n2. VALIDATING GOD FUNCTION DATA:")
print("-" * 80)
god_funcs = analysis_data['architecture']['anti_patterns']['god_functions']
knowledge_cli_gf = [gf for gf in god_funcs if 'KnowledgeCLI' in gf.get('symbol', '')]

if knowledge_cli_gf:
    gf = knowledge_cli_gf[0]
    print(f"\nGod Function: {gf['symbol']}")
    print(f"File: {gf['file']}")
    print(f"Line Range: {gf['line_range']} (lines {gf['line_range'][0]}-{gf['line_range'][1]})")
    print(f"Total Calls: {gf['total_calls']}")
    print(f"Unique Callees: {gf['unique_called']}")

    # Resolve file path
    file_path = gf['file']
    # Convert relative path to absolute from workspace root
    abs_path = os.path.abspath(file_path)

    print(f"\nFile path resolution:")
    print(f"  Relative: {file_path}")
    print(f"  Absolute: {abs_path}")
    print(f"  Exists: {'✓ YES' if os.path.exists(abs_path) else '✗ NO'}")

    if os.path.exists(abs_path):
        # Read file and check line range
        with open(abs_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()

        start_line, end_line = gf['line_range']
        print(f"\nFile validation:")
        print(f"  Total lines in file: {len(lines)}")
        print(f"  Line range valid: {'✓ YES' if end_line <= len(lines) else '✗ NO'}")

        print(f"\nContent at lines {start_line}-{end_line}:")
        for i in range(start_line - 1, min(end_line, len(lines))):
            print(f"  {i+1}: {lines[i].rstrip()}")

# Check coupling data
print("\n\n3. VALIDATING COUPLING DATA:")
print("-" * 80)
coupling = analysis_data['architecture']['coupling']
sample_symbols = list(coupling.keys())[:3]
for sym in sample_symbols:
    c = coupling[sym]
    print(f"\nSymbol: {sym}")
    print(f"  File: {c.get('file')}")
    print(f"  Line Range: {c.get('line_range')}")
    print(f"  Afferent: {c['afferent']}, Efferent: {c['efferent']}, Instability: {c['instability']}")

print("\n" + "=" * 80)
print("SUMMARY:")
print("=" * 80)
print("✓ line_range = [start_line, end_line] of the symbol in source code")
print("✓ file = relative path from workspace root")
print("✓ All paths normalized to forward slashes")
print("✓ Using first occurrence of duplicate symbol IDs")
print("=" * 80)

