# Symphonic Code Analysis Pipeline - Design Document

## Vision

Create a **comprehensive code analysis pipeline** that maps symphonic orchestration metrics (movements, beats, handlers) to actual codebase metrics (LOC, complexity, coverage, performance) for any orchestrated pipeline codebase.

## Data Sources Available

We have rich analysis artifacts from `ographx` already:

```
├── analysis/
│   ├── analysis.json                        — Symbol table (611 functions, 60 classes, 482 methods)
│   ├── comprehensive-audit.json             — Test coverage (74% overall, 92% sequence-defined)
│   ├── external-interactions-audit.json     — Component interactions (112 edges, 6 interaction events)
│   ├── catalog-vs-ir-gaps.json              — Sequence → Code alignment gaps
│   └── proposed-tests.handlers.json         — Missing test recommendations
├── god-functions.json                       — Complexity analysis (100 god functions, 2520 calls)
├── catalog/
│   ├── catalog-sequences.json               — Sequence definitions (6 core sequences)
│   ├── catalog-components.json              — Component catalog
│   ├── catalog-topics.json                  — Topic/event definitions
│   └── catalog-manifest.json                — Unified manifest
├── ir/
│   ├── ir-handlers.json                     — Extracted code handlers
│   ├── ir-sequences.json                    — Code-extracted sequences
│   └── ir-handler-tests.json                — Test extraction
├── sequences/
│   ├── enhanced.sequences.json              — Enriched sequence data
│   └── improvement-sequences.json           — Suggested improvements
└── visualization/
    ├── orchestration.mmd/.svg               — Orchestration diagrams
    ├── call_graph.mmd/.svg                  — Call graphs
    └── sequence_flow.mmd/.svg               — Sequence flows
```

## Proposed Analysis Dimensions

### 1. **Beat-to-Code Mapping** (LOC per Beat)
```json
{
  "beat_id": "create:1",
  "handler": "resolveTemplate",
  "files_involved": ["create.arrangement.ts", "create.dom.stage-crew.ts"],
  "lines_of_code": 147,
  "complexity_score": 12,
  "call_count": 4,
  "tests_covering": 3,
  "coverage_percentage": 85
}
```

**What this shows:**
- How much code implements each beat
- Code distribution across beats
- Code hotspots (beats with most complexity)
- Under-tested beats

### 2. **Movement-Level Metrics** (Aggregated Beat Data)
```json
{
  "movement": "Create",
  "beats": 15,
  "total_loc": 2847,
  "avg_loc_per_beat": 190,
  "total_complexity": 156,
  "total_calls_external": 45,
  "test_coverage": 82,
  "critical_path_beats": ["create:15", "create:7", "create:2"],
  "god_functions_in_movement": 3
}
```

**What this shows:**
- Movement complexity profile
- Whether beats are evenly distributed or have hotspots
- Critical paths for optimization
- Test coverage by movement

### 3. **Handler Performance Profile**
```json
{
  "handler": "updateSize",
  "calls_count": 63,
  "unique_callees": 17,
  "complexity_ratio": 0.27,
  "god_function_rank": 2,
  "beat_references": ["resize:2", "resize.line:2"],
  "cyclomatic_complexity": 18,
  "nesting_depth": 6,
  "improvement_opportunity": "Extract validation logic to separate handler"
}
```

**What this shows:**
- Which handlers are complexity bottlenecks
- Call patterns and dependencies
- Refactoring opportunities
- Test coverage gaps

### 4. **Symphonic Code Health Score**
```json
{
  "pipeline": "build-pipeline-symphony",
  "overall_health": 0.78,
  "dimensions": {
    "code_distribution": 0.82,      — Are beats evenly sized? (LOC variance)
    "test_coverage": 0.74,           — Are beats tested? (Coverage %)
    "complexity_distribution": 0.68, — Are beats evenly complex? (Complexity variance)
    "handler_efficiency": 0.81,      — Are handlers well-factored? (Call efficiency)
    "dead_code_ratio": 0.04,         — Is there orphaned code? (Handlers in IR but not sequences)
    "external_integration": 0.85     — Are external interactions handled? (Topic coverage)
  },
  "red_flags": [
    "3 god functions with >50 calls",
    "7 sequence-defined handlers without tests",
    "13 missing topics in component interactions"
  ],
  "optimization_opportunities": [
    "refactor: resize.stage-crew.ts::updateSize (2520 calls, rank 2)",
    "test: canvas.component.create movement (82% coverage)",
    "document: 210 orphan handlers (external code patterns)"
  ]
}
```

### 5. **Test Coverage by Movement & Beat**
```json
{
  "movement": "Create",
  "beats": [
    {
      "beat_id": "create:1",
      "handler": "resolveTemplate",
      "loc": 45,
      "tests": {
        "count": 2,
        "files": ["create.arrangement.spec.ts"],
        "coverage_percentage": 95
      },
      "missing_test_scenarios": [
        "Missing edge case: undefined template",
        "Missing edge case: circular imports",
        "Missing performance test: 1000+ templates"
      ]
    }
  ],
  "movement_coverage": 82,
  "untested_beats": ["create:3", "create:8"],
  "proposed_tests": [...]
}
```

### 6. **Interaction Graph Analysis**
```json
{
  "interaction": "canvas.component.create",
  "sequence": "canvas-component-create-symphony",
  "beats_handling": ["create:0"],
  "handlers": ["resolveTemplate"],
  "component_type": "button",
  "event_type": "create",
  "dependencies": {
    "topics_required": ["canvas:component:resolve-template"],
    "topics_missing": 1,
    "topics_available": 0,
    "handlers_required": 1,
    "handlers_available": 1,
    "tests_covering": 0
  },
  "implementation_status": "IMPLEMENTED_WITHOUT_TOPIC_COVERAGE"
}
```

### 7. **Beat Complexity Distribution** (for load balancing)
```json
{
  "pipeline": "build-pipeline-symphony",
  "beat_distribution": {
    "movement_1_validation": {
      "beats": 5,
      "loc": [120, 150, 89, 110, 95],
      "complexity": [8, 12, 5, 7, 6],
      "calls": [12, 18, 4, 9, 8],
      "std_dev_loc": 23.4,
      "std_dev_complexity": 2.6,
      "imbalance_flag": false
    },
    "movement_3_packages": {
      "beats": 15,
      "loc": [100, 95, 2400, 2100, ...],  — Package builds (outliers)
      "complexity": [5, 4, 24, 22, ...],
      "std_dev_loc": 890.2,
      "std_dev_complexity": 8.9,
      "imbalance_flag": true,
      "recommendation": "Parallel execution pattern"
    }
  }
}
```

## Pipeline Commands to Create

```bash
# Analyze single pipeline
npm run analyze:symphonic-code renderx-web-orchestration

# Compare pipelines
npm run analyze:symphonic-code --compare build-pipeline-symphony safe-continuous-delivery-pipeline

# Generate code health report
npm run analyze:symphonic-code -- --report health

# Export metrics for visualization
npm run analyze:symphonic-code -- --export csv,json,html

# Watch mode - track changes
npm run analyze:symphonic-code -- --watch

# Benchmark performance
npm run analyze:symphonic-code -- --benchmark
```

## Expected Outputs

### 1. Interactive HTML Dashboard
```
┌─────────────────────────────────────┐
│ Symphonic Code Analysis Dashboard   │
├─────────────────────────────────────┤
│ Pipeline: renderx-web-orchestration │
│ Health Score: 78% 🟡               │
│                                     │
│ Movements:        6                 │
│ Total Beats:      30                │
│ Total LOC:        15,847            │
│ Avg LOC/Beat:     528               │
│ Test Coverage:    74%               │
│ God Functions:    3 (⚠️ refactor)  │
│                                     │
│ [Movement 1] ████░░░░░░ 50% covered │
│ [Movement 2] ██████░░░░ 60% covered │
│ [Movement 3] ████████░░ 80% covered │
│ [Movement 4] █████░░░░░ 50% covered │
│ [Movement 5] ███████░░░ 70% covered │
│ [Movement 6] ██████░░░░ 60% covered │
│                                     │
│ Top Handlers:    [View] [Analyze]  │
│ Problem Areas:   [View] [Fix]      │
│ Test Gaps:       [View] [Propose]  │
└─────────────────────────────────────┘
```

### 2. Code Distribution Heatmap
```
Movement 1:  ████████░░  (480 LOC avg, 8 complexity avg)
Movement 2:  ██░░░░░░░░  (320 LOC avg, 5 complexity avg)
Movement 3:  ████████████ (1200 LOC avg, 22 complexity avg)  ← Hotspot
Movement 4:  ███░░░░░░░  (380 LOC avg, 6 complexity avg)
Movement 5:  █████░░░░░  (450 LOC avg, 9 complexity avg)
Movement 6:  ███░░░░░░░  (340 LOC avg, 7 complexity avg)
```

### 3. Test Coverage Report by Beat
```
✓ create:1 (resolveTemplate)      — 95% coverage   — [2 tests]  ✅
✓ create:2 (applyClasses)         — 78% coverage   — [1 test]   ⚠️
✗ create:3 (applyInlineStyle)     — 0% coverage    — [0 tests]  ❌
✓ create:4 (attachDrag)           — 82% coverage   — [3 tests]  ✅
✓ create:5 (notify)               — 45% coverage   — [1 test]   ⚠️
...
```

### 4. JSON Metrics Export
```json
{
  "pipeline": "renderx-web-orchestration",
  "timestamp": "2025-11-27T14:30:00Z",
  "metrics": {
    "beats": [
      {
        "id": "init:1",
        "handler": "loadBuildContext",
        "loc": 120,
        "complexity": 8,
        "coverage": 95,
        "calls": 12,
        "tests": 2
      },
      ...
    ],
    "movements": [...],
    "summary": {...}
  }
}
```

## Implementation Strategy

### Phase 1: Core Infrastructure
- Parse orchestration sequences + extract handlers
- Map handlers to LOC, complexity, tests
- Aggregate beats → movements
- Calculate health scores

### Phase 2: Advanced Metrics
- Call graph analysis (interactions)
- Dead code detection (orphan handlers)
- Complexity distribution analysis
- Performance profiling

### Phase 3: Visualization & Reporting
- Interactive dashboard
- HTML/PDF reports
- Heatmaps and charts
- Comparison views

### Phase 4: Integration
- CI/CD pipeline integration
- Trend tracking over time
- Automated recommendations
- Performance regression detection

## Cool Features to Build

1. **"Refactor Advisor"** — Identify god functions + suggest beat decomposition
2. **"Test Gap Filler"** — Propose tests based on code coverage + beat requirements
3. **"Code Health Trends"** — Track metrics over time as code evolves
4. **"Beat Balancer"** — Suggest beat reorganization for better code distribution
5. **"Interaction Validator"** — Ensure topics exist for all component interactions
6. **"Performance Hotspot Detector"** — Flag beats/handlers with unusual latency
7. **"Symphony Lint Rules"** — Custom lint rules based on beat patterns
8. **"Comparative Analysis"** — Compare code metrics across different pipelines

## Reuse from Existing ographx Artifacts

✅ **Already Available:**
- Symbol table & call graph (analysis.json)
- Test coverage data (comprehensive-audit.json)
- God functions list (god-functions.json)
- Handler extraction (ir-handlers.json)
- External interactions (external-interactions-audit.json)
- Visualization foundation (mmd/svg diagrams)

✅ **Just Need to Map:**
- Beats → Handlers → LOC/Complexity
- Movements → Beat aggregation
- Sequences → Code coverage
- Topics → Handler interactions

## Success Metrics

When complete, you'll be able to ask:
- "Which beats in my pipeline have the most code?"
- "Where are my code complexity hotspots?"
- "Which movements have poor test coverage?"
- "Are my beats evenly distributed or imbalanced?"
- "What happens if I decompose this god function?"
- "Which handlers need refactoring?"
- "Are all component interactions properly tested?"

---

**This transforms orchestration from abstraction into actionable code metrics.**
