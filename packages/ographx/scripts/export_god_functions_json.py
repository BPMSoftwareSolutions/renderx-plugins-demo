#!/usr/bin/env python3
"""
Export god functions with all their calls/callees to a dedicated JSON file
"""
import json

# Load analysis
import os
script_dir = os.path.dirname(os.path.abspath(__file__))
# scripts -> ographx -> packages -> repo_root
repo_root = os.path.dirname(os.path.dirname(os.path.dirname(script_dir)))
analysis_path = os.path.join(repo_root, 'packages/ographx/.ographx/artifacts/renderx-web/analysis/analysis.json')
with open(analysis_path) as f:
    analysis = json.load(f)

# Extract god functions
god_funcs = analysis.get('architecture', {}).get('anti_patterns', {}).get('god_functions', [])

# Create export structure
export = {
    "version": "0.1.0",
    "title": "God Functions Analysis",
    "description": "Detailed analysis of god functions (functions with 10+ calls and 8+ unique callees)",
    "generated_at": analysis.get('generated_at', ''),
    "summary": {
        "total_god_functions": len(god_funcs),
        "total_calls_in_god_functions": sum(g.get('total_calls', 0) for g in god_funcs),
        "total_unique_callees": sum(g.get('unique_called', 0) for g in god_funcs),
    },
    "god_functions": []
}

# Sort by total_calls descending
sorted_funcs = sorted(god_funcs, key=lambda x: x.get('total_calls', 0), reverse=True)

for i, god in enumerate(sorted_funcs, 1):
    func_entry = {
        "rank": i,
        "symbol": god.get('symbol', 'unknown'),
        "file": god.get('file', 'unknown'),
        "line_range": god.get('line_range', []),
        "metrics": {
            "total_calls": god.get('total_calls', 0),
            "unique_called": god.get('unique_called', 0),
            "complexity_ratio": round(
                god.get('unique_called', 0) / max(god.get('total_calls', 1), 1), 2
            )
        },
        "top_callees": god.get('top_callees', [])
    }
    export['god_functions'].append(func_entry)

# Write to file
output_path = os.path.join(repo_root, 'packages/ographx/.ographx/artifacts/renderx-web/god-functions.json')
with open(output_path, 'w') as f:
    json.dump(export, f, indent=2)

print(f"✅ Exported {len(god_funcs)} god functions to {output_path}")
print(f"\nTop 5 God Functions:")
for god in export['god_functions'][:5]:
    print(f"  {god['rank']}. {god['symbol'].split('::')[-1]}")
    print(f"     📊 {god['metrics']['total_calls']} calls → {god['metrics']['unique_called']} unique")
    print(f"     📁 {god['file'].split('/')[-1]}")

