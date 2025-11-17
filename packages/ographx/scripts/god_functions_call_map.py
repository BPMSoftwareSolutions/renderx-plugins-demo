#!/usr/bin/env python3
"""
Generate ASCII call map for top god functions
"""
import json

# Load analysis
with open('packages/ographx/.ographx/artifacts/renderx-web/analysis/analysis.json') as f:
    analysis = json.load(f)

# Load IR to get call details
with open('packages/ographx/.ographx/artifacts/renderx-web/ir/graph.json') as f:
    ir = json.load(f)

god_funcs = analysis.get('architecture', {}).get('anti_patterns', {}).get('god_functions', [])[:10]

# Build call map
calls_by_symbol = {}
for call in ir.get('calls', []):
    frm = call.get('frm', '')
    to = call.get('to', '')
    name = call.get('name', '')
    if frm and to:
        if frm not in calls_by_symbol:
            calls_by_symbol[frm] = []
        calls_by_symbol[frm].append({'to': to, 'name': name})

print("""
╔════════════════════════════════════════════════════════════════════════════════╗
║                                                                                ║
║                    GOD FUNCTIONS - CALL MAP (ASCII SKETCH)                    ║
║                                                                                ║
╚════════════════════════════════════════════════════════════════════════════════╝
""")

# Top 3 detailed
for i, god in enumerate(god_funcs[:3], 1):
    sym = god.get('symbol', 'unknown')
    calls = god.get('total_calls', 0)
    unique = god.get('unique_called', 0)
    file_path = god.get('file', 'unknown')

    # Extract just the filename
    filename = file_path.split('/')[-1] if file_path else 'unknown'

    print(f"\n{i}. {sym}")
    print(f"   📁 {filename}")
    print(f"   📊 {calls} total calls → {unique} unique callees")
    print(f"   ")

    # Get actual calls for this symbol
    actual_calls = calls_by_symbol.get(sym, [])
    if actual_calls:
        # Group by callee
        callees = {}
        for call in actual_calls:
            to = call.get('to', 'unknown')
            name = call.get('name', 'unknown')
            if to not in callees:
                callees[to] = 0
            callees[to] += 1

        # Sort by frequency
        sorted_callees = sorted(callees.items(), key=lambda x: x[1], reverse=True)[:8]

        print(f"   Call tree:")
        for j, (callee, count) in enumerate(sorted_callees):
            # Extract function name from symbol
            func_name = callee.split('::')[-1] if '::' in callee else callee
            is_last = j == len(sorted_callees) - 1
            prefix = "   └─" if is_last else "   ├─"
            print(f"{prefix} {func_name} ({count}x)")

    print(f"   {'─' * 76}")

# Summary for remaining
print(f"\nRemaining God Functions (4-10):")
for i, god in enumerate(god_funcs[3:], 4):
    sym = god.get('symbol', 'unknown')
    calls = god.get('total_calls', 0)
    unique = god.get('unique_called', 0)
    filename = sym.split('::')[0] if '::' in sym else sym
    print(f"   {i}. {sym.split('::')[-1]} ({calls} calls, {unique} unique) - {filename}")

print("""
╔════════════════════════════════════════════════════════════════════════════════╗
║                                                                                ║
║                              CALL FLOW DIAGRAM                                ║
║                                                                                ║
╚════════════════════════════════════════════════════════════════════════════════╝

Legend:
  ┌─────────────────────────────────────────────────────────────────────────────┐
  │ [God Function]                                                              │
  │      ↓                                                                       │
  │   [Callee 1] ─→ [Sub-callee]                                               │
  │   [Callee 2] ─→ [Sub-callee]                                               │
  │   [Callee 3] ─→ [Sub-callee]                                               │
  │      ...                                                                     │
  └─────────────────────────────────────────────────────────────────────────────┘

Top 3 God Functions by Complexity:

┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. recomputeLineSvg (82 calls, 23 unique)                                   │
│    ├─ replace (12x)                                                          │
│    ├─ split (8x)                                                             │
│    ├─ join (6x)                                                              │
│    ├─ push (5x)                                                              │
│    └─ ... 18 more unique callees                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ 2. createNode (45 calls, 31 unique)                                         │
│    ├─ createElement (8x)                                                     │
│    ├─ appendChild (6x)                                                       │
│    ├─ setAttribute (5x)                                                      │
│    ├─ push (4x)                                                              │
│    └─ ... 26 more unique callees                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ 3. CanvasHeader (25 calls, 15 unique)                                       │
│    ├─ useState (4x)                                                          │
│    ├─ useCallback (3x)                                                       │
│    ├─ useEffect (3x)                                                         │
│    ├─ render (2x)                                                            │
│    └─ ... 10 more unique callees                                             │
└─────────────────────────────────────────────────────────────────────────────┘

════════════════════════════════════════════════════════════════════════════════
""")

