#!/usr/bin/env python3
"""
Open a god function in VS Code with line number
Usage: python open_god_function.py [index]
Example: python open_god_function.py 0  # Opens first god function
"""
import json
import subprocess
import sys
import os

data = json.load(open('packages/ographx/.ographx/artifacts/renderx-web/analysis/analysis.json'))
god_funcs = data['architecture']['anti_patterns']['god_functions']

if not god_funcs:
    print("No god functions found")
    sys.exit(1)

# Get index from command line or default to 0
index = int(sys.argv[1]) if len(sys.argv) > 1 else 0

if index >= len(god_funcs):
    print(f"Index {index} out of range (0-{len(god_funcs)-1})")
    sys.exit(1)

gf = god_funcs[index]
file_path = gf['file']
line_start = gf['line_range'][0] if gf['line_range'] else 1

# Convert relative path to absolute
abs_path = os.path.abspath(file_path)

print(f"\n📂 Opening: {gf['symbol']}")
print(f"📄 File: {abs_path}")
print(f"📍 Line: {line_start}")
print(f"📊 Calls: {gf['total_calls']} total, {gf['unique_called']} unique\n")

# Open in VS Code
try:
    subprocess.run(['code', f'{abs_path}:{line_start}'], check=True)
    print("✓ Opened in VS Code")
except FileNotFoundError:
    print("✗ VS Code not found. Copy this path to open manually:")
    print(f"  {abs_path}:{line_start}")
except Exception as e:
    print(f"✗ Error: {e}")

