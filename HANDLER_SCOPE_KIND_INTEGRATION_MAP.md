# Handler Scope/Kind Integration Map

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                        ORCHESTRATION DOMAINS REGISTRY                        │
│                         orchestration-domains.json                           │
└──────────────────────────────────────────────────────────────────────────────┘
                          │
                          ├─── handlerSchema ◄─── NEW: Handler scope/kind definition
                          │     (scope, kind, stage, implementationRef)
                          │
                          ├─── unifiedInterface (MusicalSequence)
                          ├─── executionFlow (5 steps)
                          ├─── categories (plugin | orchestration)
                          └─── domains (61 entries)


┌──────────────────────────────────────────────────────────────────────────────┐
│                           GLOBAL DOMAIN REGISTRY                             │
│                           DOMAIN_REGISTRY.json                               │
└──────────────────────────────────────────────────────────────────────────────┘
                          │
                          └─── handlerLayerIntroduction ◄─── NEW: Handler scope
                                metadata (date, rationale, benefits)


┌──────────────────────────────────────────────────────────────────────────────┐
│                         ORCHESTRATION SEQUENCES                              │
│                    (json-sequences/*.json files)                             │
└──────────────────────────────────────────────────────────────────────────────┘

SYMPHONIC CODE ANALYSIS:
  Movement 1: Code Discovery
    Beat 1: "Scan Orchestration Files"
      └─ handler: {
           id: "analysis.discovery.scanOrchestrationFiles",
           scope: "orchestration" ◄─── NEW
           kind: "orchestration"   ◄─── NEW
           stage: "discovery"      ◄─── NEW
         }
    Beat 2: "Discover Source Code"
      └─ handler: {id: "...", scope: "orchestration", ...}
    Beat 3: "Map Beats to Code"
      └─ handler: {id: "...", scope: "orchestration", ...}
    Beat 4: "Collect Baseline"
      └─ handler: {id: "...", scope: "orchestration", ...}

  Movement 2: Code Metrics Analysis
    Beat 1-4: [metrics handlers with scope: orchestration]

  Movement 3: Test Coverage Analysis
    Beat 1-4: [coverage handlers with scope: orchestration]

  Movement 4: Architecture Conformity
    Beat 1-4: [conformity handlers with scope: orchestration]

BUILD PIPELINE SYMPHONY:
  Movement 1: Validation & Verification
    Beat 1-5: [validation handlers with scope: orchestration]
  Movement 2: Manifest Preparation
    Beat 1-5: [generation handlers with scope: orchestration]
  Movement 3: Package Building
    Beat 1-14: [package build handlers with scope: orchestration]
  Movement 4: Host Building
    Beat 1-5: [host build handlers with scope: orchestration]
  Movement 5: Artifact Management
    Beat 1-5: [artifact handlers with scope: orchestration]
  Movement 6: Verification
    Beat 1-6: [verification handlers with scope: orchestration]

ARCHITECTURE GOVERNANCE ENFORCEMENT:
  Movement 1-5: [validation/enforcement handlers with scope: orchestration]


┌──────────────────────────────────────────────────────────────────────────────┐
│                          PLUGIN SEQUENCES                                    │
│              (src/RenderX.Plugins.*/json-sequences/*.json)                  │
└──────────────────────────────────────────────────────────────────────────────┘

CANVAS COMPONENT SYMPHONIES:
  Copy Symphony
    Beat 1-3: [copy handlers with scope: plugin ◄─── NEW]
  Create Symphony
    Beat 1-6: [create handlers with scope: plugin]
  Drag Symphony
    Beat 1-4: [drag handlers with scope: plugin]
  Resize Symphony
    Beat 1-3: [resize handlers with scope: plugin]
  Select Symphony
    Beat 1-3: [select handlers with scope: plugin]
  Delete Symphony
    Beat 1-3: [delete handlers with scope: plugin]
  Paste Symphony
    Beat 1-5: [paste handlers with scope: plugin]
  Export Symphonies (GIF/MP4)
    Beat 1-2: [export handlers with scope: plugin]

CONTROL PANEL SEQUENCES:
  UI Initialization
    Beats: [ui init handlers with scope: plugin]
  Field Validation/Change
    Beats: [field handlers with scope: plugin]
  CSS Management
    Beats: [css handlers with scope: plugin]

LIBRARY & OTHER PLUGINS:
  Library Component
    Beats: [library handlers with scope: plugin]
  Header UI
    Beats: [header handlers with scope: plugin]
  Real Estate Analyzer
    Beats: [analysis handlers with scope: plugin]


┌──────────────────────────────────────────────────────────────────────────────┐
│                      HANDLER ANALYSIS OUTPUTS                                │
│                  (docs/generated/handler-analysis/)                          │
└──────────────────────────────────────────────────────────────────────────────┘

handlers-by-scope-summary.json
├─ orchestration: 76 handlers ◄─── System-level logic
├─ plugin: 103 handlers      ◄─── Feature-level logic
└─ unknown: 16 handlers      ◄─── To be classified

handlers-orchestration-list.json
├─ architecture-governance-enforcement-symphony: 37+ handlers
└─ build-pipeline-symphony: 39 handlers

handlers-plugin-list.json
├─ canvas-component-*: ~50 handlers
├─ control-panel: ~25 handlers
├─ library: ~15 handlers
└─ other: ~13 handlers


┌──────────────────────────────────────────────────────────────────────────────┐
│                     ANALYSIS INTEGRATION READY                               │
│               (symphonic-code-analysis-pipeline can now)                     │
└──────────────────────────────────────────────────────────────────────────────┘

✅ METRICS SEPARATION:
   orchestration_handlers: 76
   plugin_handlers: 103
   
   orchestration_total_loc: X
   orchestration_avg_loc: X/handler
   plugin_total_loc: Y
   plugin_avg_loc: Y/handler
   
   orchestration_coverage: X%
   plugin_coverage: Y%

✅ REGISTRY AUDIT:
   Missing orchestration handlers?
   Handlers without implementationRef?
   Scope/kind mismatches?

✅ GOVERNANCE ENFORCEMENT:
   Apply scope-specific rules
   Different thresholds per scope
   Targeted refactoring strategies

✅ SELF-HEALING:
   Orchestration handler refactoring
   Plugin-specific optimizations
   Scope-aware recommendations


FLOW: Domain Registry → Sequences → Handler Metadata → Analysis Tools → Metrics/Governance
```

---

## Handler Scope Reference

### Orchestration Handlers (76)
- **Purpose**: System-level logic (code analysis, build coordination, governance enforcement)
- **Examples**: 
  - `analysis.discovery.discoverSourceFiles`
  - `build.validation.validateOrchestrationDomains`
  - `governance.validation.validateJSONSchemaStructure`
- **Metrics**: Tracked separately (LOC, coverage, complexity)
- **Rules**: Higher coverage threshold (85%+)

### Plugin Handlers (103)
- **Purpose**: Feature-level logic (UI behavior, component creation, user interactions)
- **Examples**:
  - `canvas-component-copy-symphony.copyToClipboard`
  - `canvas-component-create-symphony.resolveTemplate`
  - `control-panel.uiInit`
- **Metrics**: Tracked separately (LOC, coverage, complexity)
- **Rules**: Standard coverage threshold (80%+)

### Unknown Handlers (16)
- **Status**: To be classified
- **Action**: Review and assign scope

---

## Implementation Checklist

- [x] Schema defined in registries
- [x] Orchestration sequences enhanced
- [x] Plugin sequences enhanced
- [x] Analysis tools created
- [x] 195 handlers cataloged
- [ ] Metrics integration (next phase)
- [ ] Registry audit rules (next phase)
- [ ] Governance enforcement (next phase)
- [ ] Self-healing integration (next phase)
