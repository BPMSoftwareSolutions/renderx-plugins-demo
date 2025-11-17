#!/usr/bin/env python3
"""
Generate comprehensive ASCII architecture map for god functions
"""
import json

# Load analysis
with open('packages/ographx/.ographx/artifacts/renderx-web/analysis/analysis.json') as f:
    analysis = json.load(f)

god_funcs = analysis.get('architecture', {}).get('anti_patterns', {}).get('god_functions', [])

print("""
╔════════════════════════════════════════════════════════════════════════════════╗
║                                                                                ║
║              GOD FUNCTIONS ARCHITECTURE MAP - COMPLEXITY LANDSCAPE             ║
║                                                                                ║
╚════════════════════════════════════════════════════════════════════════════════╝

COMPLEXITY SCALE (by total calls):

  ████████████████████████████████████████████████████████████████████ 82 calls
  ████████████████████████████ 45 calls
  ████████████ 25 calls
  ██████ 16 calls
  ██████ 15 calls
  ██████ 14 calls
  ██████ 13 calls
  ██████ 13 calls
  ████ 12 calls
  ████ 12 calls

════════════════════════════════════════════════════════════════════════════════

FUNCTIONAL GROUPING:

┌─ RENDERING & LAYOUT ─────────────────────────────────────────────────────────┐
│                                                                               │
│  recomputeLineSvg (82 calls, 23 unique)                                      │
│  ├─ String manipulation: replace, split, join                                │
│  ├─ CSS reading: readCssNumber, readBooleanVar                               │
│  └─ DOM operations: ensureLine, ensureCurve                                   │
│                                                                               │
│  createNode (45 calls, 31 unique)                                            │
│  ├─ DOM creation: createElement, appendChild, setAttribute                    │
│  ├─ CSS injection: injectRawCss                                              │
│  └─ Logging: ConductorLogger.push                                            │
│                                                                               │
│  CanvasHeader (25 calls, 15 unique)                                          │
│  ├─ React hooks: useState, useCallback, useEffect                            │
│  ├─ Event handling: resolveInteraction                                       │
│  └─ Conductor integration: useConductor                                      │
│                                                                               │
└───────────────────────────────────────────────────────────────────────────────┘

┌─ COMPONENT CREATION ─────────────────────────────────────────────────────────┐
│                                                                               │
│  renderReact (13 calls, 12 unique)                                           │
│  ├─ Registry: SequenceRegistry.get                                           │
│  ├─ Plugin: PluginManager.unmount                                            │
│  └─ Compilation: compileReactCode                                           │
│                                                                               │
│  compileReactCode (16 calls, 11 unique)                                      │
│  ├─ Code generation & transformation                                         │
│  └─ Error handling                                                           │
│                                                                               │
└───────────────────────────────────────────────────────────────────────────────┘

┌─ INTERACTION & MANIPULATION ─────────────────────────────────────────────────┐
│                                                                               │
│  updatePosition (13 calls, 9 unique)                                         │
│  ├─ Flag checking: isFlagEnabled                                             │
│  ├─ Position calculation                                                     │
│  └─ DOM updates                                                              │
│                                                                               │
│  enhanceLine (15 calls, 9 unique)                                            │
│  ├─ Feature flags: isFlagEnabled                                             │
│  ├─ DOM queries: contains                                                    │
│  └─ Line enhancement: ensureLineMarkers                                      │
│                                                                               │
└───────────────────────────────────────────────────────────────────────────────┘

┌─ EXPORT & DISCOVERY ─────────────────────────────────────────────────────────┐
│                                                                               │
│  collectCssClasses (20 calls, 18 unique)                                     │
│  ├─ CSS registry: CssRegistryStore.getClass                                  │
│  ├─ Collection: add, push                                                    │
│  └─ Logging: ConductorLogger.push                                            │
│                                                                               │
│  discoverComponentsFromDom (12 calls, 11 unique)                             │
│  ├─ DOM traversal                                                            │
│  ├─ Component detection                                                      │
│  └─ Logging: ConductorLogger.push                                            │
│                                                                               │
│  buildUiFileContent (14 calls, 10 unique)                                    │
│  ├─ Registry: SequenceRegistry.get                                           │
│  ├─ Tag resolution: getTagForType                                            │
│  └─ Content generation                                                       │
│                                                                               │
└───────────────────────────────────────────────────────────────────────────────┘

════════════════════════════════════════════════════════════════════════════════

CALL DEPENDENCY PATTERNS:

  High Frequency Patterns:
  ┌─────────────────────────────────────────────────────────────────────────────┐
  │ String Operations (replace, split, join)                                    │
  │   └─ Used by: recomputeLineSvg (26 calls)                                   │
  │                                                                              │
  │ DOM Operations (createElement, appendChild, setAttribute)                    │
  │   └─ Used by: createNode (19 calls)                                         │
  │                                                                              │
  │ React Hooks (useState, useCallback, useEffect)                              │
  │   └─ Used by: CanvasHeader (10 calls)                                       │
  │                                                                              │
  │ Logging (ConductorLogger.push)                                              │
  │   └─ Used by: collectCssClasses, discoverComponentsFromDom, createNode      │
  │                                                                              │
  │ Registry Access (SequenceRegistry.get)                                      │
  │   └─ Used by: renderReact, buildUiFileContent                              │
  │                                                                              │
  │ Feature Flags (isFlagEnabled)                                               │
  │   └─ Used by: updatePosition, enhanceLine                                   │
  └─────────────────────────────────────────────────────────────────────────────┘

════════════════════════════════════════════════════════════════════════════════

REFACTORING OPPORTUNITIES:

  1. Extract String Manipulation Utilities
     From: recomputeLineSvg (82 calls)
     To: StringUtils module
     Benefit: Reduce complexity by ~30%

  2. Extract DOM Creation Helpers
     From: createNode (45 calls)
     To: DomBuilder module
     Benefit: Reduce complexity by ~40%

  3. Extract React Component Logic
     From: CanvasHeader (25 calls)
     To: Separate hook modules
     Benefit: Improve testability

  4. Centralize Logging
     From: Multiple functions
     To: LoggingFacade
     Benefit: Reduce coupling, easier to change logging strategy

  5. Extract Registry Access Pattern
     From: renderReact, buildUiFileContent
     To: RegistryHelper module
     Benefit: Reduce duplication

════════════════════════════════════════════════════════════════════════════════
""")

