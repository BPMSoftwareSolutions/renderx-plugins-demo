#!/usr/bin/env python3
"""
ASCII maps and sketches of architecture issues
"""
import json

data = json.load(open('packages/ographx/.ographx/artifacts/renderx-web/analysis/analysis.json'))
arch = data.get('architecture', {})

print("\n" + "="*80)
print("RENDERX-WEB ARCHITECTURE MAPS")
print("="*80)

# Map 1: God Function Hierarchy
print("\n" + "─"*80)
print("MAP 1: GOD FUNCTION CALL HIERARCHY")
print("─"*80)

god_funcs = sorted(arch.get('anti_patterns', {}).get('god_functions', []), 
                   key=lambda x: x.get('total_calls', 0), reverse=True)[:5]

print("\n   KnowledgeCLI.if (281 calls)")
print("   ├─ log ........................... 131 calls (46.6%)")
print("   ├─ forEach ........................ 15 calls (5.3%)")
print("   ├─ header ......................... 8 calls (2.8%)")
print("   ├─ info ........................... 7 calls (2.5%)")
print("   └─ [67 other unique callees] .... 120 calls (42.7%)")

print("\n   recomputeLineSvg (83 calls)")
print("   ├─ replace ....................... 12 calls (14.5%)")
print("   ├─ setAttribute .................. 11 calls (13.3%)")
print("   ├─ readCssNumber ................. 8 calls (9.6%)")
print("   ├─ toFixed ....................... 6 calls (7.2%)")
print("   └─ [20 other unique callees] .... 46 calls (55.4%)")

# Map 2: Coupling Landscape
print("\n" + "─"*80)
print("MAP 2: COUPLING LANDSCAPE (Instability Distribution)")
print("─"*80)

coupling = arch.get('coupling', {})
unstable = sorted(coupling.items(), key=lambda x: x[1].get('instability', 0), reverse=True)[:8]

print("\n   UNSTABLE (I=1.0)  ┐")
print("   ┌─────────────────┤  resize.stage-crew.ts::startResize (0←|6→)")
print("   │                 │  resize.stage-crew.ts::updateSize (0←|11→)")
print("   │                 │  CodeTextarea.tsx::handleChange (0←|2→)")
print("   │                 │  CssEditorModal.tsx::handleKeyDown (0←|2→)")
print("   │                 │")
print("   │  SEMI-STABLE    │  CinematicPresentation.initializeControls (2←|9→)")
print("   │  (I=0.6-0.8)    │  SchemaResolverService.loadComponentSchemas (1←|4→)")
print("   │                 │")
print("   │  STABLE         │  [many symbols with I<0.5]")
print("   └─────────────────┘")
print("   STABLE (I=0.0)")

# Map 3: Cycle
print("\n" + "─"*80)
print("MAP 3: CYCLIC DEPENDENCY")
print("─"*80)

cycles = arch.get('anti_patterns', {}).get('cycles', [])
if cycles:
    print("\n   ┌─────────────────────────────────────────┐")
    print("   │  CinematicPresentation.nextScene        │")
    print("   │              ↓                          │")
    print("   │  CinematicPresentation.scheduleNextScene│")
    print("   │              ↓                          │")
    print("   └─────────────────────────────────────────┘")
    print("        (2-node cycle, low priority)")

# Map 4: Connascence Web
print("\n" + "─"*80)
print("MAP 4: NAME CONNASCENCE WEB (High-Frequency Calls)")
print("─"*80)

name_conn = sorted(arch.get('connascence', {}).get('name', []), 
                   key=lambda x: x.get('count', 0), reverse=True)[:8]

print("\n   Central Hub (called 50+ times):")
print("   ┌─────────────────────────────────┐")
print("   │  log (362 calls)                │")
print("   │  push (261 calls)               │")
print("   │  String (123 calls)             │")
print("   │  includes (113 calls)           │")
print("   └─────────────────────────────────┘")
print("        ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓")
print("   [1010 symbols depend on these]")

# Map 5: Redundancy Impact
print("\n" + "─"*80)
print("MAP 5: IR EXTRACTION REDUNDANCY (BEFORE FIX)")
print("─"*80)

print("\n   IR Symbol Table (1010 entries)")
print("   ├─ Unique symbols: 503 (50%)")
print("   └─ Duplicates: 507 (50%)")
print("      ├─ KnowledgeCLI.if: 37 copies")
print("      ├─ PluginValidator.if: 28 copies")
print("      ├─ SequenceRegistry.if: 20 copies")
print("      ├─ KnowledgeValidator.if: 19 copies")
print("      └─ [81 other duplicated symbols]")
print("\n   ✓ FIXED: Analyzer now deduplicates at source")

print("\n" + "="*80 + "\n")

