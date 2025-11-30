# Build Pipeline Symphony Code Analysis Report

**Generated**: 2025-11-30T09:24:00.531Z  
**Codebase**: build-pipeline-symphony  
**Pipeline**: symphonic-code-analysis-pipeline

## Executive Summary

This comprehensive analysis spans 4 movements with 16 beat stages, providing deep insights into code quality, test coverage, and architectural conformity.

### Overall Health: FAIR (Conditional) ⚠

**Note**: 'FAIR' reflects current architecture and test posture. CI/CD gating is stricter and requires higher thresholds for automated deployment gates.

| Metric | Value | Status | Classification |
|--------|-------|--------|-----------------|
| Conformity Score | 87.50% | ⚠️  FAIR| Governance: CONDITIONAL|
| Test Coverage | 78.62% | ⚠️  FAIR| Risk: MEDIUM|
| Maintainability | 64.89/100 | 🟡 FAIR| Grade: B|
| Code Duplication | 21.10% | ⚠️  ACCEPTABLE| Action: Refactor|

---


╔══════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
║                    SYMPHONIC CODE ANALYSIS ARCHITECTURE - BUILD PIPELINE SYMPHONY                           ║
║                    Enhanced Handler Portfolio & Orchestration Framework                                          ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝

┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  📊 CODEBASE METRICS FOUNDATION                                                                                 │
│  ═════════════════════════════════════════════════════════════════════════════════════════════════════════════   │
│  │ Total Files: 26  │ Total LOC: 2147  │ Handlers: 69 │ Avg LOC/Handler: 31.12│ Coverage: 78.62% │           │
│  ╰─────────────────────────────────────────────────────────────────────────────────────────────────────────────  │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

╔════ HANDLER PORTFOLIO METRICS ════╗
║ Files           : 26            ║
║ Total LOC       : 2147          ║
║ Handlers        : 69            ║
║ Avg LOC/Handler : 31.1          ║
║ Coverage        : 78.6%         ║
║ Duplication     : 0             ║
║ Maintainability : 64.9          ║
║ Conformity      : 87.5%         ║
╚════════════════════════════════════╝

╔════ COVERAGE HEATMAP BY BEAT ════╗
║ Beat       Mov.  Cov  Bar         ║
╠═══════════════════════════════════╣
║ Beat 1.1   Mov 1 85% █████████   ║
║ Beat 2.1   Mov 2 92% ██████████  ║
║ Beat 3.1   Mov 3 68% ███████     ║
║ Beat 4.1   Mov 4 55% ██████      ║
╚═══════════════════════════════════╝

╔═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
║                           SYMPHONY ORCHESTRATION STRUCTURE                                                        ║
╠═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════╣
║  Hierarchy: Symphony → Sequence → Movement → Beat → Handler                                                      ║
║  • Symphony:  Logical grouping of related handler functions (e.g., Copy Symphony, Create Symphony)               ║
║  • Sequence:  Execution order of handlers within a symphony (choreographed flow)                                 ║
║  • Movement:  Major analysis phase (Discovery, Metrics, Coverage, Conformity)                                    ║
║  • Beat:      Workflow stage within a movement (fine-grained execution step)                                     ║
║  • Handler:   Individual function performing specific domain logic                                               ║
║  • Data Baton: Metrics and context passed between movements (🎭)                                                 ║
╚═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝

                                           ▲
                                           │
                      ┌────────────────────┴────────────────────┐
                      │   SYMPHONIC CODE ANALYSIS PIPELINE      │
                      │   (4 Movements × 16 Beats)             │
                      └────────────┬───────────────────────────┘
                                   │
        ┌──────────────────────────┼──────────────────────────┐
        │                          │                          │
        ▼                          ▼                          ▼
    ╔═══════════╗            ╔═══════════╗            ╔═══════════╗
    ║ MOVEMENT  ║            ║ MOVEMENT  ║            ║ MOVEMENT  ║
    ║     1     ║            ║     2     ║            ║     3     ║
    ║DISCOVERY  ║            ║ METRICS   ║            ║ COVERAGE  ║
    ║  & BEATS  ║            ║ ANALYSIS  ║            ║ ANALYSIS  ║
    ╚═════╤═════╝            ╚═════╤═════╝            ╚═════╤═════╝
          │                         │                        │
        ┌─┴─┐                     ┌─┴─┐                    ┌─┴─┐
        │   │                     │   │                    │   │
        ▼   ▼                     ▼   ▼                    ▼   ▼
      Beat Beat                Beat Beat                Beat Beat
      1.1  1.2                2.1  2.2                3.1  3.2
      ┌─┬─┐                  ┌─┬─┐                  ┌─┬─┐
      │ │ │                  │ │ │                  │ │ │
      │ │ │                  │ │ │                  │ │ │
      └─┴─┘                  └─┴─┘                  └─┴─┘
        │                      │                      │
        │ DISCOVER             │ MEASURE              │ MEASURE
        │ 26   files           │ LOC metrics           │ coverage
        │                      │                      │
        └──────────┬───────────┴──────────┬───────────┘
                   │                      │
                   ▼                      ▼
        ╔══════════════════╗  ╔══════════════════╗
        │  DATA BATON 🎭   │  │  DATA BATON 🎭   │
        ├──────────────────┤  ├──────────────────┤
        │ • Files: 26      │  │ • Handlers: 69  │
        │ • LOC: 2147      │  │ • Avg LOC: 31.12│
        │ • Beats: 4/4 ✓   │  │ • Coverage: 78.6%│
        │ • Status: READY  │  │ • Status: READY  │
        └────────┬─────────┘  └────────┬─────────┘
                 │                     │
                 └──────────┬──────────┘
                            │
                            ▼

╔════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: GOVERNANCE                                        ║
║ Domain : build-pipeline-symphony                                    ║
║ Package: build-scripts                                              ║
║ Scope : 1 Symphony · 10 Movements · 37 Beats · 37 Handlers          ║
║ Health: 1151 LOC · Avg Cov 79% · Size Band: XL · Risk: MEDIUM       ║
╠════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                        ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                   ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.4               ║
║   Focus: template     Focus: styling     Focus: import + payload    ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════╣
║ Beat Mov Handler                      LOC  Sz  Cov  Risk  Baton     ║
║ ─────────────────────────────────────────────────────────────────── ║
║ 1.1  M1  aggregateGovernanceResults     29  M    61% MED   start    ║
║ 1.2  M1  analyzeTestCoverage            35  M    67% MED   metrics  ║
║ 1.3  M1  calculateConformityScore       31  M    78% MED   metrics  ║
║ 1.4  M1  catalogBeatsFromJSON           33  M    78% MED   metrics  ║
║      🎭 Data Baton ▸ handoff: template + CSS metrics                ║
║ 2.1  M2  concludeGovernanceEnforcement  32  M    79% MED   style    ║
║ 2.2  M2  createCodeMappings             28  M    66% MED   style    ║
║ 2.3  M2  createMarkdownMappings         34  M    64% MED   style    ║
║ 2.4  M2  createTestMappings             36  M    87% MED   style    ║
║ 3.1  M3  detectMarkdownContradictions   34  M    70% MED   import   ║
║ 3.2  M3  detectOrphanHandlers           33  M    87% MED   import   ║
║ 3.3  M3  extractFactsFromJSON           29  M    77% MED   import   ║
║ 3.4  M3  generateGovernanceReport       35  M    80% MED   payload  ║
║ 4.1  M4  identifyMarkdownFiles          37  M    62% MED   payload  ║
║ 4.2  M4  identifyUncoveredBeats         30  M    86% MED   payload  ║
║ 4.3  M4  indexBeatsFromJSON             37  M    68% MED   payload  ║
║ 4.4  M4  indexTestFiles                 28  M    63% MED   payload  ║
║ 5.1  M5  loadHandlerImplementations     34  M    67% MED   payload  ║
║ 5.2  M5  loadJSONDefinitions            27  M    86% MED   payload  ║
║ 5.3  M5  makeGovernanceDecision         29  M    86% MED   payload  ║
║ 5.4  M5  reportAuditability             37  M    83% MED   payload  ║
║ 6.1  M6  reportHandlerMapping           31  M    84% MED   payload  ║
║ 6.2  M6  reportJSONValidation           35  M    86% MED   payload  ║
║ 6.3  M6  reportMarkdownConsistency      33  M    69% MED   payload  ║
║ 6.4  M6  reportTestCoverage             37  M    86% MED   payload  ║
║ 7.1  M7  startAuditabilityVerification  34  M    85% MED   payload  ║
║ 7.2  M7  startConformityAnalysis        36  M    62% MED   payload  ║
║ 7.3  M7  startHandlerMappingVerificati  37  M    66% MED   payload  ║
║ 7.4  M7  startMarkdownConsistencyCheck  29  M    74% MED   payload  ║
║ 8.1  M8  startTestCoverageVerification  28  M    64% MED   payload  ║
║ 8.2  M8  summarizeViolations            27  M    70% MED   payload  ║
║ 8.3  M8  validateJSONSchemaStructure    37  M    87% MED   payload  ║
║ 8.4  M8  validateOrchestrationDomainsR  30  M    88% MED   payload  ║
║ 9.1  M9  validateSchemaSection          27  M    61% MED   payload  ║
║ 9.2  M9  validateSymphonyFiles          27  M    62% MED   payload  ║
║ 9.3  M9  verifyBeatHandlerMapping       33  M    70% MED   payload  ║
║ 9.4  M9  verifyChainCompleteness        25  S    80% LOW   payload  ║
║ 10.1 M10 verifyFactsInMarkdown          37  M    60% MED   payload  ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════╣
║ Size Bands    : Tiny 0 · Small 0 · Medium 37 · Large 0 · XL 0       ║
║ Coverage Dist.: 0–30% 0 · 30–60% 0 · 60–80% 23 · 80–100% 14         ║
║ Risk Summary  : CRITICAL 0 · HIGH 0 · MEDIUM 36 · LOW 1             ║
╚════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: ANALYSIS                                          ║
║ Domain : build-pipeline-symphony                                    ║
║ Package: build-scripts                                              ║
║ Scope : 1 Symphony · 4 Movements · 16 Beats · 16 Handlers           ║
║ Health: 498 LOC · Avg Cov 79% · Size Band: LARGE · Risk: LOW        ║
╠════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                        ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                   ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.4               ║
║   Focus: template     Focus: styling     Focus: import + payload    ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════╣
║ Beat Mov Handler                      LOC  Sz  Cov  Risk  Baton     ║
║ ─────────────────────────────────────────────────────────────────── ║
║ 1.1  M1  calculateConformityScore       26  M    89% MED   start    ║
║ 1.2  M1  generateAnalysisReport         34  M    83% MED   metrics  ║
║ 1.3  M1  generateTrendReport            28  M    68% MED   metrics  ║
║ 1.4  M1  validateHandlerMapping         30  M    71% MED   metrics  ║
║      🎭 Data Baton ▸ handoff: template + CSS metrics                ║
║ 2.1  M2  calculateGapAnalysis           31  M    88% MED   style    ║
║ 2.2  M2  measureBranchCoverage          26  M    64% MED   style    ║
║ 2.3  M2  measureFunctionCoverage        28  M    60% MED   style    ║
║ 2.4  M2  measureStatementCoverage       36  M    71% MED   style    ║
║ 3.1  M3  collectBaseline                31  M    60% MED   import   ║
║ 3.2  M3  discoverSourceCode             30  M    79% MED   import   ║
║ 3.3  M3  mapBeatsToCode                 26  M    79% MED   import   ║
║ 3.4  M3  scanOrchestrationFiles         28  M    73% MED   payload  ║
║ 4.1  M4  analyzeComplexity              36  M    75% MED   payload  ║
║ 4.2  M4  calculateMaintainability       27  M    69% MED   payload  ║
║ 4.3  M4  countLinesOfCode               37  M    85% MED   payload  ║
║ 4.4  M4  detectDuplication              30  M    75% MED   payload  ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════╣
║ Size Bands    : Tiny 0 · Small 0 · Medium 16 · Large 0 · XL 0       ║
║ Coverage Dist.: 0–30% 0 · 30–60% 0 · 60–80% 12 · 80–100% 4          ║
║ Risk Summary  : CRITICAL 0 · HIGH 0 · MEDIUM 16 · LOW 0             ║
╚════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: FRACTAL                                           ║
║ Domain : build-pipeline-symphony                                    ║
║ Package: build-scripts                                              ║
║ Scope : 1 Symphony · 3 Movements · 1 Beats · 1 Handlers             ║
║ Health: 31 LOC · Avg Cov 79% · Size Band: TINY · Risk: LOW          ║
╠════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                        ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                   ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1               ║
║   Focus: template     Focus: styling     Focus: import + payload    ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════╣
║ Beat Mov Handler                      LOC  Sz  Cov  Risk  Baton     ║
║ ─────────────────────────────────────────────────────────────────── ║
║ 1.1  M1  fractalNarrator                35  M    86% MED   start    ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════╣
║ Size Bands    : Tiny 0 · Small 0 · Medium 1 · Large 0 · XL 0        ║
║ Coverage Dist.: 0–30% 0 · 30–60% 0 · 60–80% 0 · 80–100% 1           ║
║ Risk Summary  : CRITICAL 0 · HIGH 0 · MEDIUM 1 · LOW 0              ║
╚════════════════════════════════════════════════════════════════════╝

                        │
                        ▼
        ╔═══════════════════════════════════════════════════════╗
        ║   QUALITY & COVERAGE METRICS                         ║
        ╠═══════════════════════════════════════════════════════╣
        ║                                                       ║
        ║  Handlers Analyzed: 69                               ║
        ║  Avg LOC/Handler: 31.12                              ║
        ║  Test Coverage: 78.6%                                  ║
        ║  Duplication: 21.1%                                      ║
        ║  ✓  No God Handlers                              ║
        ║                                                       ║
        ║  [Full metrics available in detailed report]          ║
        ║                                                       ║
        ╚═══════════════════════════════════════════════════════╝

╔════ RISK ASSESSMENT MATRIX ═════════════════╗
║ Level    Items                               ║
╠══════════════════════════════════════════════╣
║ CRITICAL: 0                                 ║
║ HIGH    : 0                                 ║
║ MEDIUM  : 0                                 ║
║ LOW     : 0                                 ║
╚══════════════════════════════════════════════╝





╔════ LEGEND & DOMAIN TERMINOLOGY ══════════════════════════════════════╗
║ Domain: build-pipeline-symphony                                      ║
╠════════════════════════════════════════════════════════════════════════╣
║ • Symphony: Logical grouping of related handler functions             ║
║ • Sequence: Execution order of handlers (choreographed flow)          ║
║ • Handler: Individual function performing specific orchestration task ║
║ • Beat: Execution unit within a Movement (4 movements × 4 beats)      ║
║ • Movement: Major phase (Discovery, Metrics, Coverage, Conformity)    ║
║ • Data Baton 🎭: Metadata passed between beats (files, handlers, metri║
║ • Orchestration: Complete system of symphonies, sequences, and handler║
║ • LOC: Lines of Code (measured, not synthetic)                        ║
║ • Coverage: Percentage covered by tests (target: 80%+)                ║
║ • Duplication: Percentage of duplicate code blocks identified         ║
║ • God Handler: Handler with 100+ LOC and <70% coverage (refactor)     ║
║ • 🟢 GREEN (80%+): Well-covered, production-ready                     ║
║ • 🟡 YELLOW (50-79%): Acceptable but needs improvement                ║
║ • 🔴 RED (<50%): Poor coverage, high risk                             ║
║ • ⚠️ WARNING: High complexity or high-risk area                       ║
║ • ✓ CHECK: Meets requirements/passing                                 ║
║                                                                       ║
╚════════════════════════════════════════════════════════════════════════╝

═════════════════════════════════════════════════════════════════════════════════════════════════════════════════════

ANALYSIS EXECUTION SUMMARY:
  ✅ Discovered: 26 source files in build-pipeline-symphony
  ✅ Analyzed: 69 handler functions with measured LOC (2147 total lines)
  ✅ Mapped: Files to orchestration beats
  ✅ Measured: Test coverage (avg 78.6%)
  ✅ No God handlers detected
  ✅ Generated: Comprehensive metrics and analysis artifacts

NEXT ACTIONS:
  → Review detailed metrics in full report
  → Maintain low duplication levels
  → Improve test coverage to 80%+ (currently 78.6%)
  

═════════════════════════════════════════════════════════════════════════════════════════════════════════════════════


---

## Movement 1: Code Discovery & Beat Mapping

**Purpose**: Discover all source files and map them to orchestration beats

- **Files Discovered**: 26
- **Beats Completed**: 4/4 ✓
- **Beat Mappings**:
  - Beat 1 (Discovery): 0 files
  - Beat 2 (Baseline): 18 files
  - Beat 3 (Structure): 1 files
  - Beat 4 (Dependencies): 7 files

---

## Movement 2: Code Metrics Analysis

**Purpose**: Calculate LOC, complexity, duplication, and maintainability metrics

### Lines of Code (LOC)
- **Total**: 2,147
- **Average per File**: 83
- **Status**: ✓ Normal range

### Complexity Analysis
- **High Complexity**: 1 files
- **Medium Complexity**: 1 files
- **Low Complexity**: 24 files
- **Average**: 1.12
- **Status**: ✓ Within acceptable limits

### Code Duplication

⚠ **562 duplicated code blocks detected**

**Top Duplications:**
  1. **12 files** | 15 occurrences | 5 lines | CanvasHeader.tsx:178-182, CanvasPage.tsx:26-30, ControlPanel.tsx:62-66
  2. **9 files** | 9 occurrences | 5 lines | ColorInput.tsx:80-84, NumberInput.tsx:78-82, SelectInput.tsx:60-64
  3. **5 files** | 8 occurrences | 5 lines | create.react.stage-crew.ts:136-140, create.react.stage-crew.ts:175-179, create.react.stage-crew.ts:237-241
  4. **4 files** | 8 occurrences | 5 lines | export.mp4.stage-crew.ts:247-251, export.mp4.stage-crew.ts:278-282, CanvasDrop.ts:186-190
  5. **8 files** | 8 occurrences | 5 lines | CanvasHeader.tsx:179-183, CanvasPage.tsx:27-31, HeaderControls.tsx:12-16

**Metrics:**
- Duplicate Regions: 562
- Estimated Duplicate Lines: 4090
- Duplication Rate: ~145.55%

**Status**: Review and refactor identified blocks. Priority: #1 (highest frequency)

**Measurement**: Source='measured' (AST region hashing across 246 files)
**Last Scan**: 2025-11-30T09:23:58.950Z

### Maintainability Index
- **Score**: 64.89/100
- **Classification**: 🟡 **FAIR** (B)
- **Threshold**: 60-80
- **Guidance**: Address technical debt in next sprint. Schedule refactoring review.
- **Contributing Factors**:
  - Test Coverage: 77.4%
  - Documentation: 88.5%
  - Comment Density: 75.5%
  - Complexity Score: 70.4

---

## Movement 3: Test Coverage Analysis (Orchestration Suite)

**Purpose**: Measure statement, branch, function, and line coverage

**Scope**: Full `build-pipeline-symphony` domain - all source files in `scripts/` analyzed

### Coverage Metrics
| Type | Coverage | Target | Gap | Status |
|------|----------|--------|-----|--------|
| Statements | 78.62% | 80% | -1.4% | 🟢 Close |
| Branches | 73.81% | 75% | -1.2% | 🔴 Off-track |
| Functions | 84.29% | 80% | 4.3% | 🟡 Needs Improvement |
| Lines | 86.34% | 80% | 6.3% | ✅ On-target |

### Beat-by-Beat Coverage
```
Beat 1 (Discovery):     85% statements, 80% branches
Beat 2 (Baseline):      92% statements, 88% branches
Beat 3 (Structure):     68% statements, 60% branches ⚠
Beat 4 (Dependencies):  55% statements, 48% branches ⚠
```

---

## Movement 4: Architecture Conformity & Reporting

**Purpose**: Validate handler-to-beat mapping and architectural conformity

### Conformity Assessment
- **Conformity Score**: 87.50%
- **Conforming Beats**: 14/16
- **Violations**: 2

### Violation Details
- **beat-3-structure** (Movement 2): Missing complexity threshold validation [MEDIUM]
- **beat-4-dependencies** (Movement 2): Handler not tracking duplication trends [LOW]

	### Fractal Architecture (Domains-as-Systems, Systems-as-Domains)

	- **Fractal Score**: 0.02 (0-1)
- **Total Orchestration Domains**: 61
- **System-of-Systems Domains**: 1
- **Projection-only Domains**: 0
- **Registry-only Domains**: 16

### Handler Metrics

✅ **69 handlers discovered**

✅ **69 handlers discovered**

**By Type:**
  * generic: 44
  * validation: 10
  * output: 6
  * initialization: 4
  * transformation: 3
  * execution: 1
  * input: 1

**Top Handlers:**
  * gatherTargets (generic) — scripts/codemods/migrate-imports-to-host-sdk.js
  * main (generic) — scripts/codemods/migrate-imports-to-host-sdk.js
  * processFile (execution) — scripts/codemods/migrate-imports-to-host-sdk.js
  * rewriteImportsInText (output) — scripts/codemods/migrate-imports-to-host-sdk.js
  * shouldRewriteImport (output) — scripts/codemods/migrate-imports-to-host-sdk.js
  * ... and 64 more

**Measurement**: Source='measured' (real discovered exports via pattern matching)
**Coverage**: Handlers distributed across 7 types
**Last Scan**: 2025-11-30T09:23:58.502Z

### Handler Scope Analysis

**Scope Definition**: The handler scope/kind layer distinguishes orchestration handlers (system-level logic) from plugin handlers (feature-level logic).

ℹ **Handler scope metadata not yet populated** in sequence files.

To enable scope-aware metrics:
1. Update sequence JSON files with handler.scope field (plugin|orchestration|infra)
2. Re-run pipeline to generate scope-separated metrics

See HANDLER_SCOPE_KIND_QUICK_REF.md for implementation guide.

### Handler-to-Beat Mapping & Health Score

### Symphonic Health Score

**Overall**: 🟠 **58.66/100** (POOR)

**Component Scores:**
| Component | Score | Target | Status |
|-----------|-------|--------|--------|
| Handler Coverage | 100.00% | 90%+ | ✓ |
| Beat Coverage | 25.00% | 100% | ⚠ |
| Mapping Confidence | 55.80% | 80%+ | ⚠ |
| Distribution | 0.00% | 80%+ | ⚠ |

**Metrics:**
- Mapped Handlers: 69/69
- Orphaned Handlers: 0
- Beats with Handlers: 5
- Beats Without Handlers: 15

**Orphaned Handlers:**
**Orphaned Handlers**: None ✓

**Beats Without Handlers (15):**
- beat-1a-discovery-core (Movement 1)
- beat-1b-discovery-extended (Movement 1)
- beat-1d-discovery-telemetry (Movement 1)
- beat-2-baseline (Movement 2)
- beat-2b-baseline-analysis (Movement 2)
- ... and 10 more

**Mapping Strategy:**
- Symphony keywords (e.g., export → beat-3-structure)
- Stage-crew patterns (UI interaction → beat-3)
- Type-based defaults (initialization → beat-1, transformation → beat-3)
- Default fallback (beat-2-baseline)

**Next Steps to Improve:**
1. Add explicit handler-to-beat mappings in orchestration-domains.json
2. Enhance handler type detection (currently 100% generic)
3. Distribute handlers evenly across beats for 80%+ distribution score

### Coverage by Handler Analysis (Handler-Scoped Analysis)

**Note**: Handler coverage is computed only for handler modules; global orchestration coverage is shown in Movement 3 above. These are different scopes and may show different percentages.

**Mapping Status**: 69/69 handlers have explicit beat mappings. Coverage heatmap reflects current measurement scope.

**Heatmap Terminology**: "Unassigned" in the Coverage Heatmap table refers to handlers without coverage measurement data correlated to specific beats in the current analysis scope, not to unmapped handlers. All 69 handlers have explicit beat assignments in the orchestration-domains.json mapping.

## Coverage by Handler Analysis

### Overall Test Coverage
**Global Coverage**: 73.95% statements

| Metric | Coverage | Status |
|--------|----------|--------|
| Statements | 73.95% | 🟡 |
| Branches | 72.59% | 🟡 |
| Functions | 82.54% | 🟢 |
| Lines | 86.93% | 🟢 |

### Handler Coverage Summary
| Category | Count | % | Status |
|----------|-------|---|--------|
| Well-Covered (80%+) | 0 | 0.0% | ✅ |
| Partially-Covered (50-79%) | 195 | 100.0% | ⚠️ |
| Poorly-Covered (1-49%) | 0 | 0.0% | ⚠️ |
| Uncovered (0%) | 0 | 0.0% | ❌ |

**Average Handler Coverage**: 70.92%

**Handlers**: 195 | **Average LOC per Handler**: 23.68 | **Total LOC**: 2202

### Coverage Heatmap by Beat

| Beat | Avg Coverage | Handlers | Status |
|------|--------------|----------|--------|
| beat-4-dependencies | 74.54% | 28 | ⚠️ |
| beat-2a-baseline-metrics | 74.04% | 43 | ⚠️ |
| beat-3-structure | 73.63% | 84 | ⚠️ |
| beat-1-discovery | 59.36% | 40 | ⚠️ |

**Measurement**: Source='measured' (test coverage analysis with handler-beat correlation)
**Timestamp**: 2025-11-30T09:23:59.893Z


### Automated Refactor Suggestions

## Automated Refactor Suggestions

### Executive Summary

Analysis identified **9 refactoring opportunities** across the codebase:

| Category | Count | Impact | Effort |
|----------|-------|--------|--------|
| Code Consolidation | 5 | High | Low-Medium |
| Handler Clustering | 1 | Medium | Medium |
| Maintainability | 3 | High | Low-Medium |

### Priority Ranking

#### 🔴 Critical Path (P0-P1): 2 items

**1. [P1] Reduce cyclomatic complexity**
- Type: improvement
- Effort: Medium | Benefit: High | Risk: Low
- Recommendation: Extract nested logic into separate functions; apply early returns pattern
- Impact: +20 points | -30% (split functions) | Significantly improved

**2. [P1] Increase branch test coverage**
- Type: improvement
- Effort: Medium | Benefit: High | Risk: Very Low
- Recommendation: Target beat-3 (structure) and beat-4 (dependencies) for coverage improvements
- Impact: +10 points | No change | Improved (+6% branch coverage target)

#### 🟡 Next Batch (P2): 2 items

**[P2] Refactor handler clustering in "root"**
- Package contains 69 handlers clustered together. Consider extracting into specialized sub-modules or consolidating related handlers.

**[P2] Improve code documentation**
- Current documentation score is below target. Add JSDoc comments and README documentation.

#### 🟢 Backlog (P3): 5 items
Additional opportunities for future iterations.

### Detailed Refactoring Plan

#### Suggestion 1: Reduce cyclomatic complexity
**ID**: MAINT-02 | **Priority**: P1

Some files have high cyclomatic complexity (avg 1.13, high outliers at 2-3+). Break into smaller functions.

**Recommendation**: Extract nested logic into separate functions; apply early returns pattern
**Impact**: +20 points | -30% (split functions) | Significantly improved

**PR Template** (use `npm run generate:pr -- MAINT-02` to generate):
```markdown
# Reduce cyclomatic complexity
Some files have high cyclomatic complexity (avg 1.13, high outliers at 2-3+). Break into smaller functions.

**Recommendation**: Extract nested logic into separate functions; apply early returns pattern
```

#### Suggestion 2: Increase branch test coverage
**ID**: MAINT-03 | **Priority**: P1

Branch coverage is 79.07%, below 85% target. Add tests for conditional paths.

**Recommendation**: Target beat-3 (structure) and beat-4 (dependencies) for coverage improvements
**Impact**: +10 points | No change | Improved (+6% branch coverage target)

**PR Template** (use `npm run generate:pr -- MAINT-03` to generate):
```markdown
# Increase branch test coverage
Branch coverage is 79.07%, below 85% target. Add tests for conditional paths.

**Recommendation**: Target beat-3 (structure) and beat-4 (dependencies) for coverage improvements
```

#### Suggestion 3: Refactor handler clustering in "root"
**ID**: CLUSTER-01 | **Priority**: P2

Package contains 69 handlers clustered together. Consider extracting into specialized sub-modules or consolidating related handlers.

**Recommendation**: Split into 2-3 focused modules or consolidate into handler factory
**Impact**: +72 points | -8 (reduce module complexity) | Improved (easier to isolate functionality)

**PR Template** (use `npm run generate:pr -- CLUSTER-01` to generate):
```markdown
# Refactor handler clustering in "root"
Package contains 69 handlers clustered together. Consider extracting into specialized sub-modules or consolidating related handlers.

**Recommendation**: Split into 2-3 focused modules or consolidate into handler factory
```

### Coverage Gap Analysis

**Improvement Targets**:
- Beat 3 (Structure): Target 75%+ statements (currently 68%)
- Beat 4 (Dependencies): Target 70%+ statements (currently 55%)
- Branch coverage: Target 85%+ (currently 79.07%)

**Quick Wins**:
- Add 5-10 integration tests for Beat 4 modules → +8% coverage
- Extract 3 utility functions from handlers → +5% maintainability
- Document 10 high-complexity functions → +10 maintainability points

### Implementation Roadmap

**Sprint 1** (Weeks 1-2): High-priority consolidations
- 0 consolidations reducing 200+ lines

**Sprint 2** (Weeks 3-4): Handler refactoring & coverage
- Clustering improvements
- Target +6% branch coverage

**Sprint 3** (Weeks 5-6): Documentation & polish
- Maintainability improvements
- Finish reaching 85%+ coverage targets

### Risk Assessment

**Overall Risk**: Low (most suggestions are refactoring with no behavior change)

**Mitigation Strategies**:
- Run full test suite after each consolidation
- Use git bisect to identify regressions
- PR review by 2+ architects
- Stage in dev environment 1 week before production

**Measurement**:
- Source: 'computed' (suggestions derived from measured duplication & clustering data)
- Timestamp: 2025-11-30T09:24:00.197Z


### Historical Trend Analysis

**Note**: Trend coverage metrics may differ from current run's Movement 3 metrics due to snapshot timing and aggregation. These represent baseline or averaged coverage, not current execution coverage.

## Historical Trend Analysis

**Analysis Period**: Last 30 snapshots
**Current Baseline**: 2025-11-30T09:24:00.509Z

### Overall Trend Summary

| Metric | Current | Previous | Change | Trend | Direction |
|--------|---------|----------|--------|-------|-----------|
| Handler Count | 69 | 14 | - | New | - |
| Duplication (blocks) | 562 | 562 | - | Monitoring | - |
| Coverage (avg) | 76.07% | 37.52% | - | Monitoring | - |
| Maintainability | 73.29/100 | - | - | Baseline | - |
| Conformity | 87.50% | - | - | Baseline | - |

### Handler Metrics

**Current State**: 69 handlers discovered

**Handler Tracking:**
- Starting baseline: 69 handlers
- Types detected: 7
- Target for next sprint: 83 (20% growth for enhanced coverage)
- Health score: 54/100 (POOR - focus on distribution)

**Expected Evolution**:
- Week 4: 73 handlers (Type-specific handlers added)
- Week 8: 80 handlers (Enhanced testing harness)
- Week 12: 90 handlers (Full handler decomposition)

### Duplication Metrics

**Current State**: 562 duplicate blocks, 4090 duplicate lines

**Duplication Tracking:**
- Current rate: 145.55%
- Target rate: 50% (50% reduction)
- Refactor suggestions: 5 high-impact consolidations identified

**Improvement Plan**:
- Sprint 1 (Weeks 1-2): Target -15% duplicate lines (save ~600 lines)
- Sprint 2 (Weeks 3-4): Target -20% total (save ~1,200 lines cumulative)
- Sprint 3 (Weeks 5-6): Target 30% reduction (save ~2,000 lines total)

### Coverage Metrics

**Current Coverage Baselines**:
| Metric | Current | Target | Gap | Status |
|--------|---------|--------|-----|--------|
| Statements | 78.82% | 85% | 6.18% | 🟡 Close |
| Branches | 73.32% | 85% | 11.68% | 🟡 Close |
| Functions | 76.45% | 90% | 13.55% | 🟡 Close |
| Lines | 84.86% | 85% | 0.14% | ✅ On-target |

**Coverage Improvement Roadmap**:
- **Week 2**: Add 5-8 integration tests → +3% statements
- **Week 4**: Refactor handler coverage → +5% branches
- **Week 6**: Beat 4 expansion → +8% functions
- **Target**: 85%+ all metrics by week 8

### Maintainability Trends

**Current Maintainability Index**: 73.29/100

**Component Health**:
- Complexity (average): 1.13
- Documentation score: 70/100
- Maintainability grade: B

**Improvement Strategy**:
- Add 50-100 lines of JSDoc documentation (+10 points)
- Reduce cyclomatic complexity in 3 high-complexity files (-5 average)
- Target maintainability: 75+ (Grade B) by week 4

### Conformity Metrics

**Architectural Conformity**: 87.50%

**Beat Alignment Status**:
- Beats with handlers: 3/20 (15%)
- Target: 10/20 (50%) by week 6
- Orphaned beats: 17 (focus area)

**Conformity Roadmap**:
- Week 2: Improve to 89% (add beat mappings)
- Week 4: Reach 92% (resolve violations)
- Week 8: Target 95% (full conformity)

### Period-over-Period Comparison

**Baseline (Today)**:
- Handlers: 69
- Duplication: 145.55%
- Coverage: 76.07%
- Maintainability: 73.29/100
- Conformity: 87.50%

**Projected (Week 4)**:
- Handlers: +5% → 73
- Duplication: -15% → 130.55%
- Coverage: +3-5% → 80.07%
- Maintainability: +5 → 78.29/100
- Conformity: +2% → 89.50%

**Projected (Week 8 - Full Sprint)**:
- Handlers: +15% → 80
- Duplication: -30% → 115.55%
- Coverage: +8-10% → 85.07%
- Maintainability: +15 → 88.29/100
- Conformity: +5% → 92.50%

### Data Quality & Confidence

**Measurement Sources**:
- Handlers: Measured (via scan-handlers.cjs pattern matching)
- Duplication: Measured (via AST region hashing)
- Coverage: Measured (via vitest/jest analysis)
- Maintainability: Computed (formula-based calculation)
- Conformity: Measured (beat validation rules)

**Snapshot Frequency**: After each `npm run analyze:symphonic:code` execution

**Retention**: Last 30 snapshots retained in `.generated/history/symphonic-metrics/`

**Timestamp**: 2025-11-30T09:24:00.530Z
**Source**: 'measured + computed' (baseline establishment)

---

### Next Steps

1. **Week 1**: Execute Phase 3 refactor suggestions (5 consolidations)
2. **Week 2**: Add 8 integration tests for coverage gaps
3. **Week 4**: Run next analysis cycle for trend measurement
4. **Week 6**: Review trend velocity and adjust projections
5. **Week 8**: Full sprint retrospective with trend analysis



---

## Movement Governance Summary

| Movement | Coverage | Conformity | Maintainability | Governance |
|----------|----------|-----------|------------------|------------|
| 1: Discovery | 85% ✅ | High ✅ | N/A | **PASS** ✅ |
| 2: Metrics | 90% ✅ | Medium ⚠ | 47.1 🔴 | **REVIEW** ⚠ |
| 3: Coverage | 70% ⚠ | Low ❌ | Poor 🔴 | **NEEDS WORK** ❌ |
| 4: Reporting | 78% ⚠ | High ✅ | Fair 🟡 | **CONDITIONAL** ⚠ |

---

## CI/CD Readiness Assessment

**Ready for CI Gating**: ❌ **NOT READY**

Gating Level: **FAIL**

✓ Conformity (87.50%) ✅
✓ Coverage - Orchestration Suite (78.62%) ❌
✓ Handler Scanning (69 handlers discovered) ✅

---

## Top 10 Actionable Improvements (Priority Order)

### [HIGH] 1. Improve handler type classification (currently 100% generic)

### [HIGH] 2. Increase branch test coverage (target 85%, currently 79.07%)

### [HIGH] 3. Add integration tests for Beat 4 (dependencies)

### [MEDIUM] 4. Execute 5 consolidation refactors (save 600+ duplicate lines)

### [MEDIUM] 5. Distribute handlers across beats (target 50% beats with handlers, currently 15%)

### [MEDIUM] 6. Reduce Movement 2 maintainability complexity

### [LOW] 7. Add JSDoc documentation (50-100 lines)

### [LOW] 8. Tune trend thresholds and velocity alerts

### [LOW] 9. Review and prioritize refactor suggestions (11 opportunities)

### [LOW] 10. Establish team SLOs based on trend projections

---

## Summary & Next Steps

**Overall Status**: ✅ **READY FOR REVIEW** (conditional CI gating)

- **Must Address** (blocker): Handler implementation status clarification
- **Should Address** (next sprint): Duplication refactoring, branch coverage improvements
- **Nice to Have** (backlog): Maintainability improvements, trend tracking

**Recommended Action**:
1. Schedule code review for Movement 2 (metrics, complexity)
2. Assign handler implementation work (clarify TODO vs external)
3. Plan coverage testing for Beats 3 & 4
4. Add this report to CI/CD pipeline for automated gate enforcement

---

## Artifacts Generated

- **JSON Analysis**: build-pipeline-symphony-code-analysis-2025-11-30T09-23-56-911Z.json
- **Coverage Summary**: build-pipeline-symphony-coverage-summary-2025-11-30T09-23-56-911Z.json
- **Per-Beat Metrics**: build-pipeline-symphony-per-beat-metrics-2025-11-30T09-23-56-911Z.csv
- **Trend Analysis**: build-pipeline-symphony-trends-2025-11-30T09-23-56-911Z.json

---

*Report auto-generated from symphonic-code-analysis-pipeline. All metrics are immutable and traceable to source analysis.*
