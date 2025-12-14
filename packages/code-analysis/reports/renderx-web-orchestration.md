# Renderx Web Orchestration Code Analysis Report

**Generated**: 2025-12-06T04:26:59.871Z  
**Codebase**: renderx-web-orchestration  
**Pipeline**: symphonic-code-analysis-pipeline

## Executive Summary

This comprehensive analysis spans 4 movements with 16 beat stages, providing deep insights into code quality, test coverage, and architectural conformity.

### Overall Health: FAIR (Conditional) ⚠

**Note**: 'FAIR' reflects current architecture and test posture. CI/CD gating is stricter and requires higher thresholds for automated deployment gates.

| Metric | Value | Status | Classification |
|--------|-------|--------|-----------------|
| Conformity Score | 87.50% | ⚠️  FAIR| Governance: CONDITIONAL|
| Test Coverage | 72.96% | ⚠️  FAIR| Risk: MEDIUM|
| Maintainability | 60.58/100 | 🟡 FAIR| Grade: B|
| Code Duplication | 77.60% | ❌ VERY HIGH| Action: Refactor|

---


╔════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
║                        SYMPHONIC CODE ANALYSIS ARCHITECTURE - RENDERX WEB ORCHESTRATION                        ║
║                              Enhanced Handler Portfolio & Orchestration Framework                              ║
╚════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝

┌─ 📊 CODEBASE METRICS FOUNDATION ───────────────────────────────────────────────────────────────────────┐
│ Total Files: 867  │  Total LOC: 5168  │  Handlers: 285  │  Avg LOC/Handler: 18.13  │  Coverage: 72.96% │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘

╔════════════════════════════════════════╗
║ HANDLER PORTFOLIO METRICS              ║
╠════════════════════════════════════════╣
║ Files           : 867                  ║
║ Total LOC       : 5168                 ║
║ Handlers        : 285                  ║
║ Avg LOC/Handler : 18.1                 ║
║ Coverage        : 73.0%                ║
║ Duplication     :                      ║
║ Maintainability : 60.6                 ║
║ Conformity      : 87.5%                ║
╚════════════════════════════════════════╝

╔══════════════════════════════════╗
║ Beat       Mov     Cov Bar       ║
╠══════════════════════════════════╣
║ Beat 1.1   Mov 1   85% █████████ ║
║ Beat 2.1   Mov 2   92% ██████████║
║ Beat 3.1   Mov 3   68% ███████   ║
║ Beat 4.1   Mov 4   55% ██████    ║
╚══════════════════════════════════╝

╔═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
║                           SYMPHONY ORCHESTRATION STRUCTURE                                                        ║
╠═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════╣
║  Hierarchy: Symphony → Sequence → Movement → Beat → Handler                                                      ║
║  • Symphony:  Logical grouping of related handler functions                                                      ║
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
        │ 867  files           │ LOC metrics           │ coverage
        │                      │                      │
        └──────────┬───────────┴──────────┬───────────┘
                   │                      │
                   ▼                      ▼
        ╔══════════════════╗  ╔══════════════════╗
        │  DATA BATON 🎭   │  │  DATA BATON 🎭   │
        ├──────────────────┤  ├──────────────────┤
        │ • Files: 867     │  │ • Handlers: 285 │
        │ • LOC: 5168      │  │ • Avg LOC: 18.13│
        │ • Beats: 4/4 ✓   │  │ • Coverage: 73.0%│
        │ • Status: READY  │  │ • Status: READY  │
        └────────┬─────────┘  └────────┬─────────┘
                 │                     │
                 └──────────┬──────────┘
                            │
                            ▼

╔════════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: RENDERX WEB ORCHESTRATION                            ║
║ Domain : renderx-web-orchestration                                     ║
║ Package: header                                                        ║
║ Scope : 1 Symphony · 6 Movements · 22 Beats · 22 Handlers              ║
║ Health: 399 LOC · Avg Cov 73% · Size Band: LARGE · Risk: CRITICAL      ║
╠════════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                           ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                      ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.4                  ║
║   Focus: template     Focus: styling     Focus: import + payload       ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════════╣
║ Beat Mov Handler                     LOC  Sz   Cov Risk AC  Src Baton  ║
║ ───────────────────────────────────────────────────────────────────────║
║ 1.1  M1  getCurrentTheme              15  S    72% MED  Y   N   start  ║
║ 1.2  M1  toggleTheme                  19  S    64% MED  N   N   metrics║
║ 1.3  M1  initConfig                   15  S    59% HIGH Y   N   metrics║
║ 1.4  M1  initResolver                 20  S    70% MED  N   N   metrics║
║      🎭 Data Baton ▸ handoff: template + CSS metrics                   ║
║ 2.1  M2  registerObservers            17  S    74% MED  Y   N   style  ║
║ 2.2  M2  notifyReady                  21  S    75% LOW  Y   N   style  ║
║ 2.3  M2  updateAttribute              15  S    53% HIGH N   N   style  ║
║ 2.4  M2  refreshControlPanel          15  S    60% MED  N   N   style  ║
║ 3.1  M3  showSelectionOverlay         19  S    60% MED  Y   Y   import ║
║ 3.2  M3  hideSelectionOverlay         20  S    61% MED  N   N   import ║
║ 3.3  M3  attachLineResizeHandlers     18  S    78% LOW  N   N   import ║
║ 3.4  M3  ensureLineOverlayFor         16  S    62% MED  Y   N   payload║
║ 4.1  M4  notifyUi                     18  S    78% LOW  Y   Y   payload║
║ 4.2  M4  exportSvgToGif               15  S    72% MED  N   N   payload║
║ 4.3  M4  exportSvgToMp4               18  S    65% MED  N   N   payload║
║ 4.4  M4  ensurePayload                21  S    57% HIGH N   N   payload║
║ 5.1  M5  computeGhostSize             16  S    55% HIGH N   N   payload║
║ 5.2  M5  createGhostContainer         16  S    75% LOW  Y   N   payload║
║ 5.3  M5  renderTemplatePreview        21  S    71% MED  Y   N   payload║
║ 5.4  M5  applyTemplateStyles          15  S    64% MED  Y   N   payload║
║ 6.1  M6  computeCursorOffsets         20  S    65% MED  Y   N   payload║
║ 6.2  M6  installDragImage             16  S    69% MED  Y   N   payload║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════════╣
║ Size Bands    : Tiny 0 · Small 16 · Medium 6 · Large 0 · XL 0          ║
║ Coverage Dist.: 0–30% 0 · 30–60% 4 · 60–80% 18 · 80–100% 0             ║
║ Risk Summary  : CRITICAL 0 · HIGH 4 · MEDIUM 14 · LOW 4                ║
╚════════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: BUILD PIPELINE ORCHESTRATION                         ║
║ Domain : renderx-web-orchestration                                     ║
║ Package: orchestration                                                 ║
║ Scope : 1 Symphony · 4 Movements · 14 Beats · 14 Handlers              ║
║ Health: 254 LOC · Avg Cov 73% · Size Band: MEDIUM · Risk: HIGH         ║
╠════════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                           ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                      ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.4                  ║
║   Focus: template     Focus: styling     Focus: import + payload       ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════════╣
║ Beat Mov Handler                     LOC  Sz   Cov Risk AC  Src Baton  ║
║ ───────────────────────────────────────────────────────────────────────║
║ 1.1  M1  loadBuildContext             19  S    77% LOW  N   N   start  ║
║ 1.2  M1  validateOrchestrationDomain  17  S    56% HIGH N   N   metrics║
║ 1.3  M1  validateGovernanceRules      17  S    79% LOW  N   N   metrics║
║ 1.4  M1  validateAgentBehavior        20  S    67% MED  N   N   metrics║
║      🎭 Data Baton ▸ handoff: template + CSS metrics                   ║
║ 2.1  M2  recordValidationResults      19  S    70% MED  N   N   style  ║
║ 2.2  M2  regenerateOrchestrationDoma  21  S    77% LOW  N   N   style  ║
║ 2.3  M2  syncJsonSources              20  S    73% MED  N   N   style  ║
║ 2.4  M2  generateManifests            17  S    79% LOW  N   N   style  ║
║ 3.1  M3  validateManifestIntegrity    20  S    59% HIGH N   N   import ║
║ 3.2  M3  recordManifestState          17  S    82% LOW  N   N   import ║
║ 3.3  M3  initializePackageBuild       22  S    80% LOW  N   N   import ║
║ 3.4  M3  buildComponentsPackage       22  S    81% LOW  N   N   payload║
║ 4.1  M4  buildMusicalConductorPackag  20  S    66% MED  N   N   payload║
║ 4.2  M4  buildHostSdkPackage          19  S    66% MED  N   N   payload║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════════╣
║ Size Bands    : Tiny 0 · Small 7 · Medium 7 · Large 0 · XL 0           ║
║ Coverage Dist.: 0–30% 0 · 30–60% 2 · 60–80% 9 · 80–100% 3              ║
║ Risk Summary  : CRITICAL 0 · HIGH 2 · MEDIUM 5 · LOW 7                 ║
╚════════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: ANALYZE ROOT CAUSE                                   ║
║ Domain : renderx-web-orchestration                                     ║
║ Package: self-healing                                                  ║
║ Scope : 1 Symphony · 3 Movements · 11 Beats · 11 Handlers              ║
║ Health: 199 LOC · Avg Cov 73% · Size Band: MEDIUM · Risk: HIGH         ║
╠════════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                           ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                      ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.3                  ║
║   Focus: template     Focus: styling     Focus: import + payload       ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════════╣
║ Beat Mov Handler                     LOC  Sz   Cov Risk AC  Src Baton  ║
║ ───────────────────────────────────────────────────────────────────────║
║ 1.1  M1  analyzeRequested             21  S    59% HIGH N   N   start  ║
║ 1.2  M1  loadAnomalies                20  S    69% MED  N   N   metrics║
║ 1.3  M1  loadCodebaseInfo             21  S    75% LOW  N   N   metrics║
║ 1.4  M1  analyzePerformanceIssues     15  S    69% MED  N   N   metrics║
║      🎭 Data Baton ▸ handoff: template + CSS metrics                   ║
║ 2.1  M2  analyzeBehavioralIssues      18  S    75% LOW  N   N   style  ║
║ 2.2  M2  analyzeCoverageIssues        19  S    82% LOW  N   N   style  ║
║ 2.3  M2  analyzeErrorIssues           20  S    60% MED  N   N   style  ║
║ 2.4  M2  assessImpact                 16  S    61% MED  N   N   style  ║
║ 3.1  M3  recommendFixes               15  S    72% MED  N   N   import ║
║ 3.2  M3  storeDiagnosis               19  S    71% MED  N   N   import ║
║ 3.3  M3  analyzeCompleted             22  S    58% HIGH N   N   import ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════════╣
║ Size Bands    : Tiny 0 · Small 6 · Medium 5 · Large 0 · XL 0           ║
║ Coverage Dist.: 0–30% 0 · 30–60% 2 · 60–80% 8 · 80–100% 1              ║
║ Risk Summary  : CRITICAL 0 · HIGH 2 · MEDIUM 6 · LOW 3                 ║
╚════════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: PARSE PRODUCTION TELEMETRY                           ║
║ Domain : renderx-web-orchestration                                     ║
║ Package: self-healing                                                  ║
║ Scope : 1 Symphony · 3 Movements · 7 Beats · 7 Handlers                ║
║ Health: 127 LOC · Avg Cov 73% · Size Band: SMALL · Risk: MEDIUM        ║
╠════════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                           ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                      ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1                  ║
║   Focus: template     Focus: styling     Focus: import + payload       ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════════╣
║ Beat Mov Handler                     LOC  Sz   Cov Risk AC  Src Baton  ║
║ ───────────────────────────────────────────────────────────────────────║
║ 1.1  M1  parseTelemetryRequested      19  S    74% MED  N   N   start  ║
║ 1.2  M1  loadLogFiles                 17  S    74% MED  N   N   metrics║
║ 1.3  M1  extractTelemetryEvents       18  S    77% LOW  N   N   metrics║
║ 1.4  M1  normalizeTelemetryData       16  S    79% LOW  N   N   metrics║
║      🎭 Data Baton ▸ handoff: template + CSS metrics                   ║
║ 2.1  M2  aggregateTelemetryMetrics    21  S    62% MED  N   N   style  ║
║ 2.2  M2  storeTelemetryDatabase       19  S    71% MED  N   N   style  ║
║ 2.3  M2  parseTelemetryCompleted      15  S    58% HIGH N   N   style  ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════════╣
║ Size Bands    : Tiny 0 · Small 6 · Medium 1 · Large 0 · XL 0           ║
║ Coverage Dist.: 0–30% 0 · 30–60% 1 · 60–80% 6 · 80–100% 0              ║
║ Risk Summary  : CRITICAL 0 · HIGH 1 · MEDIUM 4 · LOW 2                 ║
╚════════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: CONTROL PANEL UI INIT                                ║
║ Domain : renderx-web-orchestration                                     ║
║ Package: control-panel                                                 ║
║ Scope : 1 Symphony · 3 Movements · 6 Beats · 6 Handlers                ║
║ Health: 109 LOC · Avg Cov 73% · Size Band: SMALL · Risk: CRITICAL      ║
╠════════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                           ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                      ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1                  ║
║   Focus: template     Focus: styling     Focus: import + payload       ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════════╣
║ Beat Mov Handler                     LOC  Sz   Cov Risk AC  Src Baton  ║
║ ───────────────────────────────────────────────────────────────────────║
║ 1.1  M1  initConfig                   17  S    79% LOW  Y   N   start  ║
║ 1.2  M1  initResolver                 16  S    67% MED  N   N   metrics║
║ 1.3  M1  loadSchemas                  16  S    62% MED  N   N   metrics║
║ 1.4  M1  registerObservers            17  S    75% LOW  Y   N   metrics║
║      🎭 Data Baton ▸ handoff: template + CSS metrics                   ║
║ 2.1  M2  notifyReady                  21  S    62% MED  Y   N   style  ║
║ 2.2  M2  initMovement                 15  S    63% MED  N   N   style  ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════════╣
║ Size Bands    : Tiny 0 · Small 5 · Medium 1 · Large 0 · XL 0           ║
║ Coverage Dist.: 0–30% 0 · 30–60% 0 · 60–80% 6 · 80–100% 0              ║
║ Risk Summary  : CRITICAL 0 · HIGH 0 · MEDIUM 4 · LOW 2                 ║
╚════════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: CONTROL PANEL UI INIT (BATCHED)                      ║
║ Domain : renderx-web-orchestration                                     ║
║ Package: control-panel                                                 ║
║ Scope : 1 Symphony · 3 Movements · 6 Beats · 6 Handlers                ║
║ Health: 109 LOC · Avg Cov 73% · Size Band: SMALL · Risk: CRITICAL      ║
╠════════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                           ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                      ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1                  ║
║   Focus: template     Focus: styling     Focus: import + payload       ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════════╣
║ Beat Mov Handler                     LOC  Sz   Cov Risk AC  Src Baton  ║
║ ───────────────────────────────────────────────────────────────────────║
║ 1.1  M1  initConfig                   16  S    71% MED  Y   N   start  ║
║ 1.2  M1  initResolver                 18  S    56% HIGH N   N   metrics║
║ 1.3  M1  loadSchemas                  18  S    68% MED  N   N   metrics║
║ 1.4  M1  registerObservers            18  S    75% LOW  Y   N   metrics║
║      🎭 Data Baton ▸ handoff: template + CSS metrics                   ║
║ 2.1  M2  notifyReady                  16  S    65% MED  Y   N   style  ║
║ 2.2  M2  initMovement                 22  S    64% MED  N   N   style  ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════════╣
║ Size Bands    : Tiny 0 · Small 5 · Medium 1 · Large 0 · XL 0           ║
║ Coverage Dist.: 0–30% 0 · 30–60% 1 · 60–80% 5 · 80–100% 0              ║
║ Risk Summary  : CRITICAL 0 · HIGH 1 · MEDIUM 4 · LOW 1                 ║
╚════════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: CANVAS COMPONENT EXPORT                              ║
║ Domain : renderx-web-orchestration                                     ║
║ Package: canvas-component                                              ║
║ Scope : 1 Symphony · 3 Movements · 6 Beats · 6 Handlers                ║
║ Health: 109 LOC · Avg Cov 73% · Size Band: SMALL · Risk: HIGH          ║
╠════════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                           ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                      ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1                  ║
║   Focus: template     Focus: styling     Focus: import + payload       ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════════╣
║ Beat Mov Handler                     LOC  Sz   Cov Risk AC  Src Baton  ║
║ ───────────────────────────────────────────────────────────────────────║
║ 1.1  M1  queryAllComponents           20  S    69% MED  N   N   start  ║
║ 1.2  M1  discoverComponentsFromDom    18  S    82% LOW  N   N   metrics║
║ 1.3  M1  collectCssClasses            20  S    65% MED  N   N   metrics║
║ 1.4  M1  collectLayoutData            18  S    64% MED  N   N   metrics║
║      🎭 Data Baton ▸ handoff: template + CSS metrics                   ║
║ 2.1  M2  buildUiFileContent           18  S    59% HIGH N   N   style  ║
║ 2.2  M2  downloadUiFile               16  S    83% LOW  N   N   style  ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════════╣
║ Size Bands    : Tiny 0 · Small 4 · Medium 2 · Large 0 · XL 0           ║
║ Coverage Dist.: 0–30% 0 · 30–60% 1 · 60–80% 3 · 80–100% 2              ║
║ Risk Summary  : CRITICAL 0 · HIGH 1 · MEDIUM 3 · LOW 2                 ║
╚════════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: DETECT ANOMALIES                                     ║
║ Domain : renderx-web-orchestration                                     ║
║ Package: self-healing                                                  ║
║ Scope : 1 Symphony · 3 Movements · 5 Beats · 5 Handlers                ║
║ Health: 91 LOC · Avg Cov 73% · Size Band: SMALL · Risk: CRITICAL       ║
╠════════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                           ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                      ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1                  ║
║   Focus: template     Focus: styling     Focus: import + payload       ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════════╣
║ Beat Mov Handler                     LOC  Sz   Cov Risk AC  Src Baton  ║
║ ───────────────────────────────────────────────────────────────────────║
║ 1.1  M1  detectAnomaliesRequested     15  S    59% HIGH N   N   start  ║
║ 1.2  M1  loadTelemetryData            17  S    69% MED  N   N   metrics║
║ 1.3  M1  detectPerformanceAnomalies   19  S    77% LOW  N   N   metrics║
║ 1.4  M1  detectBehavioralAnomalies    17  S    72% MED  N   N   metrics║
║      🎭 Data Baton ▸ handoff: template + CSS metrics                   ║
║ 2.1  M2  detectAnomaliesCompleted     21  S    72% MED  N   N   style  ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════════╣
║ Size Bands    : Tiny 0 · Small 4 · Medium 1 · Large 0 · XL 0           ║
║ Coverage Dist.: 0–30% 0 · 30–60% 1 · 60–80% 4 · 80–100% 0              ║
║ Risk Summary  : CRITICAL 0 · HIGH 1 · MEDIUM 3 · LOW 1                 ║
╚════════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: CANVAS COMPONENT PASTE                               ║
║ Domain : renderx-web-orchestration                                     ║
║ Package: canvas-component                                              ║
║ Scope : 1 Symphony · 3 Movements · 5 Beats · 5 Handlers                ║
║ Health: 91 LOC · Avg Cov 73% · Size Band: SMALL · Risk: LOW            ║
╠════════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                           ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                      ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1                  ║
║   Focus: template     Focus: styling     Focus: import + payload       ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════════╣
║ Beat Mov Handler                     LOC  Sz   Cov Risk AC  Src Baton  ║
║ ───────────────────────────────────────────────────────────────────────║
║ 1.1  M1  readFromClipboard            18  S    73% MED  N   N   start  ║
║ 1.2  M1  deserializeComponentData     18  S    67% MED  N   N   metrics║
║ 1.3  M1  calculatePastePosition       21  S    83% LOW  N   N   metrics║
║ 1.4  M1  createPastedComponent        18  S    79% LOW  N   N   metrics║
║      🎭 Data Baton ▸ handoff: template + CSS metrics                   ║
║ 2.1  M2  notifyPasteComplete          21  S    83% LOW  N   N   style  ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════════╣
║ Size Bands    : Tiny 0 · Small 3 · Medium 2 · Large 0 · XL 0           ║
║ Coverage Dist.: 0–30% 0 · 30–60% 0 · 60–80% 3 · 80–100% 2              ║
║ Risk Summary  : CRITICAL 0 · HIGH 0 · MEDIUM 2 · LOW 3                 ║
╚════════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: CANVAS COMPONENT IMPORT                              ║
║ Domain : renderx-web-orchestration                                     ║
║ Package: canvas-component                                              ║
║ Scope : 1 Symphony · 3 Movements · 5 Beats · 5 Handlers                ║
║ Health: 91 LOC · Avg Cov 73% · Size Band: SMALL · Risk: CRITICAL       ║
╠════════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                           ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                      ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1                  ║
║   Focus: template     Focus: styling     Focus: import + payload       ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════════╣
║ Beat Mov Handler                     LOC  Sz   Cov Risk AC  Src Baton  ║
║ ───────────────────────────────────────────────────────────────────────║
║ 1.1  M1  openUiFile                   15  S    76% LOW  N   N   start  ║
║ 1.2  M1  parseUiFile                  16  S    71% MED  N   N   metrics║
║ 1.3  M1  injectCssClasses             17  S    70% MED  N   N   metrics║
║ 1.4  M1  createComponentsSequentiall  17  S    57% HIGH N   N   metrics║
║      🎭 Data Baton ▸ handoff: template + CSS metrics                   ║
║ 2.1  M2  applyHierarchyAndOrder       15  S    71% MED  N   N   style  ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════════╣
║ Size Bands    : Tiny 0 · Small 5 · Medium 0 · Large 0 · XL 0           ║
║ Coverage Dist.: 0–30% 0 · 30–60% 1 · 60–80% 4 · 80–100% 0              ║
║ Risk Summary  : CRITICAL 0 · HIGH 1 · MEDIUM 3 · LOW 1                 ║
╚════════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: CANVAS COMPONENT CREATE                              ║
║ Domain : renderx-web-orchestration                                     ║
║ Package: canvas-component                                              ║
║ Scope : 1 Symphony · 3 Movements · 5 Beats · 5 Handlers                ║
║ Health: 91 LOC · Avg Cov 73% · Size Band: SMALL · Risk: MEDIUM         ║
╠════════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                           ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                      ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1                  ║
║   Focus: template     Focus: styling     Focus: import + payload       ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════════╣
║ Beat Mov Handler                     LOC  Sz   Cov Risk AC  Src Baton  ║
║ ───────────────────────────────────────────────────────────────────────║
║ 1.1  M1  resolveTemplate              21  S    73% MED  Y   Y   start  ║
║ 1.2  M1  registerInstance             20  S    83% LOW  Y   Y   metrics║
║ 1.3  M1  createNode                   17  S    53% HIGH Y   Y   metrics║
║ 1.4  M1  renderReact                  17  S    71% MED  Y   Y   metrics║
║      🎭 Data Baton ▸ handoff: template + CSS metrics                   ║
║ 2.1  M2  notifyUi                     17  S    54% HIGH Y   Y   style  ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════════╣
║ Size Bands    : Tiny 0 · Small 3 · Medium 2 · Large 0 · XL 0           ║
║ Coverage Dist.: 0–30% 0 · 30–60% 2 · 60–80% 2 · 80–100% 1              ║
║ Risk Summary  : CRITICAL 0 · HIGH 2 · MEDIUM 2 · LOW 1                 ║
╚════════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: CONTROL PANEL UI FIELD CHANGE                        ║
║ Domain : renderx-web-orchestration                                     ║
║ Package: control-panel                                                 ║
║ Scope : 1 Symphony · 3 Movements · 4 Beats · 4 Handlers                ║
║ Health: 73 LOC · Avg Cov 73% · Size Band: SMALL · Risk: MEDIUM         ║
╠════════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                           ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                      ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1                  ║
║   Focus: template     Focus: styling     Focus: import + payload       ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════════╣
║ Beat Mov Handler                     LOC  Sz   Cov Risk AC  Src Baton  ║
║ ───────────────────────────────────────────────────────────────────────║
║ 1.1  M1  prepareField                 19  S    75% LOW  N   N   start  ║
║ 1.2  M1  dispatchField                16  S    69% MED  N   N   metrics║
║ 1.3  M1  setDirty                     21  S    59% HIGH N   N   metrics║
║ 1.4  M1  awaitRefresh                 16  S    76% LOW  N   N   metrics║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════════╣
║ Size Bands    : Tiny 0 · Small 3 · Medium 1 · Large 0 · XL 0           ║
║ Coverage Dist.: 0–30% 0 · 30–60% 1 · 60–80% 3 · 80–100% 0              ║
║ Risk Summary  : CRITICAL 0 · HIGH 1 · MEDIUM 1 · LOW 2                 ║
╚════════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: DASHBOARD.LOAD                                       ║
║ Domain : renderx-web-orchestration                                     ║
║ Package: slo-dashboard                                                 ║
║ Scope : 1 Symphony · 3 Movements · 3 Beats · 3 Handlers                ║
║ Health: 54 LOC · Avg Cov 73% · Size Band: SMALL · Risk: CRITICAL       ║
╠════════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                           ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                      ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1                  ║
║   Focus: template     Focus: styling     Focus: import + payload       ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════════╣
║ Beat Mov Handler                     LOC  Sz   Cov Risk AC  Src Baton  ║
║ ───────────────────────────────────────────────────────────────────────║
║ 1.1  M1  loadBudgets                  17  S    76% LOW  N   N   start  ║
║ 1.2  M1  loadMetrics                  15  S    54% HIGH N   N   metrics║
║ 1.3  M1  computeCompliance            21  S    82% LOW  N   N   metrics║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════════╣
║ Size Bands    : Tiny 0 · Small 2 · Medium 1 · Large 0 · XL 0           ║
║ Coverage Dist.: 0–30% 0 · 30–60% 1 · 60–80% 1 · 80–100% 1              ║
║ Risk Summary  : CRITICAL 0 · HIGH 1 · MEDIUM 0 · LOW 2                 ║
╚════════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: CONTROL PANEL UI RENDER                              ║
║ Domain : renderx-web-orchestration                                     ║
║ Package: control-panel                                                 ║
║ Scope : 1 Symphony · 3 Movements · 3 Beats · 3 Handlers                ║
║ Health: 54 LOC · Avg Cov 73% · Size Band: SMALL · Risk: CRITICAL       ║
╠════════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                           ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                      ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1                  ║
║   Focus: template     Focus: styling     Focus: import + payload       ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════════╣
║ Beat Mov Handler                     LOC  Sz   Cov Risk AC  Src Baton  ║
║ ───────────────────────────────────────────────────────────────────────║
║ 1.1  M1  generateFields               19  S    81% LOW  N   N   start  ║
║ 1.2  M1  generateSections             18  S    60% MED  N   N   metrics║
║ 1.3  M1  renderView                   15  S    73% MED  N   N   metrics║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════════╣
║ Size Bands    : Tiny 0 · Small 3 · Medium 0 · Large 0 · XL 0           ║
║ Coverage Dist.: 0–30% 0 · 30–60% 0 · 60–80% 2 · 80–100% 1              ║
║ Risk Summary  : CRITICAL 0 · HIGH 0 · MEDIUM 2 · LOW 1                 ║
╚════════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: CONTROL PANEL UI FIELD VALIDATE                      ║
║ Domain : renderx-web-orchestration                                     ║
║ Package: control-panel                                                 ║
║ Scope : 1 Symphony · 3 Movements · 3 Beats · 3 Handlers                ║
║ Health: 54 LOC · Avg Cov 73% · Size Band: SMALL · Risk: MEDIUM         ║
╠════════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                           ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                      ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1                  ║
║   Focus: template     Focus: styling     Focus: import + payload       ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════════╣
║ Beat Mov Handler                     LOC  Sz   Cov Risk AC  Src Baton  ║
║ ───────────────────────────────────────────────────────────────────────║
║ 1.1  M1  validateField                20  S    73% MED  N   N   start  ║
║ 1.2  M1  mergeErrors                  16  S    57% HIGH N   N   metrics║
║ 1.3  M1  updateView                   19  S    67% MED  N   N   metrics║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════════╣
║ Size Bands    : Tiny 0 · Small 2 · Medium 1 · Large 0 · XL 0           ║
║ Coverage Dist.: 0–30% 0 · 30–60% 1 · 60–80% 2 · 80–100% 0              ║
║ Risk Summary  : CRITICAL 0 · HIGH 1 · MEDIUM 2 · LOW 0                 ║
╚════════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: CANVAS COMPONENT SELECT                              ║
║ Domain : renderx-web-orchestration                                     ║
║ Package: canvas-component                                              ║
║ Scope : 1 Symphony · 3 Movements · 3 Beats · 3 Handlers                ║
║ Health: 54 LOC · Avg Cov 73% · Size Band: SMALL · Risk: MEDIUM         ║
╠════════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                           ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                      ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1                  ║
║   Focus: template     Focus: styling     Focus: import + payload       ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════════╣
║ Beat Mov Handler                     LOC  Sz   Cov Risk AC  Src Baton  ║
║ ───────────────────────────────────────────────────────────────────────║
║ 1.1  M1  showSelectionOverlay         15  S    60% MED  Y   Y   start  ║
║ 1.2  M1  notifyUi                     18  S    67% MED  Y   Y   metrics║
║ 1.3  M1  publishSelectionChanged      15  S    69% MED  Y   Y   metrics║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════════╣
║ Size Bands    : Tiny 0 · Small 3 · Medium 0 · Large 0 · XL 0           ║
║ Coverage Dist.: 0–30% 0 · 30–60% 0 · 60–80% 3 · 80–100% 0              ║
║ Risk Summary  : CRITICAL 0 · HIGH 0 · MEDIUM 3 · LOW 0                 ║
╚════════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: CANVAS COMPONENT RULES CONFIG                        ║
║ Domain : renderx-web-orchestration                                     ║
║ Package: canvas-component                                              ║
║ Scope : 1 Symphony · 3 Movements · 3 Beats · 3 Handlers                ║
║ Health: 54 LOC · Avg Cov 73% · Size Band: SMALL · Risk: LOW            ║
╠════════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                           ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                      ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1                  ║
║   Focus: template     Focus: styling     Focus: import + payload       ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════════╣
║ Beat Mov Handler                     LOC  Sz   Cov Risk AC  Src Baton  ║
║ ───────────────────────────────────────────────────────────────────────║
║ 1.1  M1  setAllRulesConfig            16  S    58% HIGH N   N   start  ║
║ 1.2  M1  loadAllRulesFromWindow       15  S    61% MED  N   N   metrics║
║ 1.3  M1  getAllRulesConfig            21  S    81% LOW  N   N   metrics║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════════╣
║ Size Bands    : Tiny 0 · Small 2 · Medium 1 · Large 0 · XL 0           ║
║ Coverage Dist.: 0–30% 0 · 30–60% 1 · 60–80% 1 · 80–100% 1              ║
║ Risk Summary  : CRITICAL 0 · HIGH 1 · MEDIUM 1 · LOW 1                 ║
╚════════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: CANVAS COMPONENT COPY                                ║
║ Domain : renderx-web-orchestration                                     ║
║ Package: canvas-component                                              ║
║ Scope : 1 Symphony · 3 Movements · 3 Beats · 3 Handlers                ║
║ Health: 54 LOC · Avg Cov 73% · Size Band: SMALL · Risk: LOW            ║
╠════════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                           ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                      ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1                  ║
║   Focus: template     Focus: styling     Focus: import + payload       ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════════╣
║ Beat Mov Handler                     LOC  Sz   Cov Risk AC  Src Baton  ║
║ ───────────────────────────────────────────────────────────────────────║
║ 1.1  M1  serializeSelectedComponent   20  S    71% MED  N   N   start  ║
║ 1.2  M1  copyToClipboard              20  S    72% MED  N   N   metrics║
║ 1.3  M1  notifyCopyComplete           16  S    83% LOW  N   N   metrics║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════════╣
║ Size Bands    : Tiny 0 · Small 1 · Medium 2 · Large 0 · XL 0           ║
║ Coverage Dist.: 0–30% 0 · 30–60% 0 · 60–80% 2 · 80–100% 1              ║
║ Risk Summary  : CRITICAL 0 · HIGH 0 · MEDIUM 2 · LOW 1                 ║
╚════════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: DASHBOARD.REFRESH.METRICS                            ║
║ Domain : renderx-web-orchestration                                     ║
║ Package: slo-dashboard                                                 ║
║ Scope : 1 Symphony · 3 Movements · 2 Beats · 2 Handlers                ║
║ Health: 36 LOC · Avg Cov 73% · Size Band: TINY · Risk: MEDIUM          ║
╠════════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                           ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                      ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1                  ║
║   Focus: template     Focus: styling     Focus: import + payload       ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════════╣
║ Beat Mov Handler                     LOC  Sz   Cov Risk AC  Src Baton  ║
║ ───────────────────────────────────────────────────────────────────────║
║ 1.1  M1  loadMetrics                  16  S    63% MED  N   N   start  ║
║ 1.2  M1  computeCompliance            20  S    53% HIGH N   N   metrics║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════════╣
║ Size Bands    : Tiny 0 · Small 1 · Medium 1 · Large 0 · XL 0           ║
║ Coverage Dist.: 0–30% 0 · 30–60% 1 · 60–80% 1 · 80–100% 0              ║
║ Risk Summary  : CRITICAL 0 · HIGH 1 · MEDIUM 1 · LOW 0                 ║
╚════════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: DASHBOARD.EXPORT.REPORT                              ║
║ Domain : renderx-web-orchestration                                     ║
║ Package: slo-dashboard                                                 ║
║ Scope : 1 Symphony · 3 Movements · 2 Beats · 2 Handlers                ║
║ Health: 36 LOC · Avg Cov 73% · Size Band: TINY · Risk: LOW             ║
╠════════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                           ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                      ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1                  ║
║   Focus: template     Focus: styling     Focus: import + payload       ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════════╣
║ Beat Mov Handler                     LOC  Sz   Cov Risk AC  Src Baton  ║
║ ───────────────────────────────────────────────────────────────────────║
║ 1.1  M1  serializeDashboardState      18  S    64% MED  N   N   start  ║
║ 1.2  M1  triggerExportDownload        21  S    58% HIGH N   N   metrics║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════════╣
║ Size Bands    : Tiny 0 · Small 1 · Medium 1 · Large 0 · XL 0           ║
║ Coverage Dist.: 0–30% 0 · 30–60% 1 · 60–80% 1 · 80–100% 0              ║
║ Risk Summary  : CRITICAL 0 · HIGH 1 · MEDIUM 1 · LOW 0                 ║
╚════════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: HEADER UI THEME GET                                  ║
║ Domain : renderx-web-orchestration                                     ║
║ Package: header                                                        ║
║ Scope : 1 Symphony · 3 Movements · 2 Beats · 2 Handlers                ║
║ Health: 36 LOC · Avg Cov 73% · Size Band: TINY · Risk: LOW             ║
╠════════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                           ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                      ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1                  ║
║   Focus: template     Focus: styling     Focus: import + payload       ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════════╣
║ Beat Mov Handler                     LOC  Sz   Cov Risk AC  Src Baton  ║
║ ───────────────────────────────────────────────────────────────────────║
║ 1.1  M1  getCurrentTheme              18  S    75% LOW  Y   N   start  ║
║ 1.2  M1  notifyUi                     15  S    82% LOW  Y   Y   metrics║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════════╣
║ Size Bands    : Tiny 0 · Small 2 · Medium 0 · Large 0 · XL 0           ║
║ Coverage Dist.: 0–30% 0 · 30–60% 0 · 60–80% 1 · 80–100% 1              ║
║ Risk Summary  : CRITICAL 0 · HIGH 0 · MEDIUM 0 · LOW 2                 ║
╚════════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: CONTROL PANEL UPDATE                                 ║
║ Domain : renderx-web-orchestration                                     ║
║ Package: control-panel                                                 ║
║ Scope : 1 Symphony · 3 Movements · 2 Beats · 2 Handlers                ║
║ Health: 36 LOC · Avg Cov 73% · Size Band: TINY · Risk: MEDIUM          ║
╠════════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                           ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                      ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1                  ║
║   Focus: template     Focus: styling     Focus: import + payload       ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════════╣
║ Beat Mov Handler                     LOC  Sz   Cov Risk AC  Src Baton  ║
║ ───────────────────────────────────────────────────────────────────────║
║ 1.1  M1  updateFromElement            16  S    63% MED  N   N   start  ║
║ 1.2  M1  notifyUi                     18  S    59% HIGH Y   Y   metrics║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════════╣
║ Size Bands    : Tiny 0 · Small 2 · Medium 0 · Large 0 · XL 0           ║
║ Coverage Dist.: 0–30% 0 · 30–60% 1 · 60–80% 1 · 80–100% 0              ║
║ Risk Summary  : CRITICAL 0 · HIGH 1 · MEDIUM 1 · LOW 0                 ║
╚════════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: CONTROL PANEL SELECTION SHOW                         ║
║ Domain : renderx-web-orchestration                                     ║
║ Package: control-panel                                                 ║
║ Scope : 1 Symphony · 3 Movements · 2 Beats · 2 Handlers                ║
║ Health: 36 LOC · Avg Cov 73% · Size Band: TINY · Risk: MEDIUM          ║
╠════════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                           ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                      ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1                  ║
║   Focus: template     Focus: styling     Focus: import + payload       ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════════╣
║ Beat Mov Handler                     LOC  Sz   Cov Risk AC  Src Baton  ║
║ ───────────────────────────────────────────────────────────────────────║
║ 1.1  M1  deriveSelectionModel         17  S    73% MED  N   N   start  ║
║ 1.2  M1  notifyUi                     19  S    66% MED  Y   Y   metrics║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════════╣
║ Size Bands    : Tiny 0 · Small 2 · Medium 0 · Large 0 · XL 0           ║
║ Coverage Dist.: 0–30% 0 · 30–60% 0 · 60–80% 2 · 80–100% 0              ║
║ Risk Summary  : CRITICAL 0 · HIGH 0 · MEDIUM 2 · LOW 0                 ║
╚════════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: CONTROL PANEL CSS EDIT                               ║
║ Domain : renderx-web-orchestration                                     ║
║ Package: control-panel                                                 ║
║ Scope : 1 Symphony · 3 Movements · 2 Beats · 2 Handlers                ║
║ Health: 36 LOC · Avg Cov 73% · Size Band: TINY · Risk: MEDIUM          ║
╠════════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                           ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                      ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1                  ║
║   Focus: template     Focus: styling     Focus: import + payload       ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════════╣
║ Beat Mov Handler                     LOC  Sz   Cov Risk AC  Src Baton  ║
║ ───────────────────────────────────────────────────────────────────────║
║ 1.1  M1  updateCssClass               20  S    61% MED  N   N   start  ║
║ 1.2  M1  notifyUi                     22  S    70% MED  Y   Y   metrics║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════════╣
║ Size Bands    : Tiny 0 · Small 0 · Medium 2 · Large 0 · XL 0           ║
║ Coverage Dist.: 0–30% 0 · 30–60% 0 · 60–80% 2 · 80–100% 0              ║
║ Risk Summary  : CRITICAL 0 · HIGH 0 · MEDIUM 2 · LOW 0                 ║
╚════════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: CONTROL PANEL CSS DELETE                             ║
║ Domain : renderx-web-orchestration                                     ║
║ Package: control-panel                                                 ║
║ Scope : 1 Symphony · 3 Movements · 2 Beats · 2 Handlers                ║
║ Health: 36 LOC · Avg Cov 73% · Size Band: TINY · Risk: MEDIUM          ║
╠════════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                           ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                      ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1                  ║
║   Focus: template     Focus: styling     Focus: import + payload       ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════════╣
║ Beat Mov Handler                     LOC  Sz   Cov Risk AC  Src Baton  ║
║ ───────────────────────────────────────────────────────────────────────║
║ 1.1  M1  deleteCssClass               17  S    68% MED  N   N   start  ║
║ 1.2  M1  notifyUi                     17  S    73% MED  Y   Y   metrics║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════════╣
║ Size Bands    : Tiny 0 · Small 2 · Medium 0 · Large 0 · XL 0           ║
║ Coverage Dist.: 0–30% 0 · 30–60% 0 · 60–80% 2 · 80–100% 0              ║
║ Risk Summary  : CRITICAL 0 · HIGH 0 · MEDIUM 2 · LOW 0                 ║
╚════════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: CONTROL PANEL CSS CREATE                             ║
║ Domain : renderx-web-orchestration                                     ║
║ Package: control-panel                                                 ║
║ Scope : 1 Symphony · 3 Movements · 2 Beats · 2 Handlers                ║
║ Health: 36 LOC · Avg Cov 73% · Size Band: TINY · Risk: MEDIUM          ║
╠════════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                           ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                      ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1                  ║
║   Focus: template     Focus: styling     Focus: import + payload       ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════════╣
║ Beat Mov Handler                     LOC  Sz   Cov Risk AC  Src Baton  ║
║ ───────────────────────────────────────────────────────────────────────║
║ 1.1  M1  createCssClass               19  S    81% LOW  N   N   start  ║
║ 1.2  M1  notifyUi                     22  S    69% MED  Y   Y   metrics║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════════╣
║ Size Bands    : Tiny 0 · Small 1 · Medium 1 · Large 0 · XL 0           ║
║ Coverage Dist.: 0–30% 0 · 30–60% 0 · 60–80% 1 · 80–100% 1              ║
║ Risk Summary  : CRITICAL 0 · HIGH 0 · MEDIUM 1 · LOW 1                 ║
╚════════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: CONTROL PANEL CLASSES REMOVE                         ║
║ Domain : renderx-web-orchestration                                     ║
║ Package: control-panel                                                 ║
║ Scope : 1 Symphony · 3 Movements · 2 Beats · 2 Handlers                ║
║ Health: 36 LOC · Avg Cov 73% · Size Band: TINY · Risk: MEDIUM          ║
╠════════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                           ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                      ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1                  ║
║   Focus: template     Focus: styling     Focus: import + payload       ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════════╣
║ Beat Mov Handler                     LOC  Sz   Cov Risk AC  Src Baton  ║
║ ───────────────────────────────────────────────────────────────────────║
║ 1.1  M1  removeClass                  17  S    71% MED  N   N   start  ║
║ 1.2  M1  notifyUi                     16  S    54% HIGH Y   Y   metrics║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════════╣
║ Size Bands    : Tiny 0 · Small 2 · Medium 0 · Large 0 · XL 0           ║
║ Coverage Dist.: 0–30% 0 · 30–60% 1 · 60–80% 1 · 80–100% 0              ║
║ Risk Summary  : CRITICAL 0 · HIGH 1 · MEDIUM 1 · LOW 0                 ║
╚════════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: CONTROL PANEL CLASSES ADD                            ║
║ Domain : renderx-web-orchestration                                     ║
║ Package: control-panel                                                 ║
║ Scope : 1 Symphony · 3 Movements · 2 Beats · 2 Handlers                ║
║ Health: 36 LOC · Avg Cov 73% · Size Band: TINY · Risk: MEDIUM          ║
╠════════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                           ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                      ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1                  ║
║   Focus: template     Focus: styling     Focus: import + payload       ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════════╣
║ Beat Mov Handler                     LOC  Sz   Cov Risk AC  Src Baton  ║
║ ───────────────────────────────────────────────────────────────────────║
║ 1.1  M1  addClass                     17  S    74% MED  N   N   start  ║
║ 1.2  M1  notifyUi                     19  S    82% LOW  Y   Y   metrics║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════════╣
║ Size Bands    : Tiny 0 · Small 2 · Medium 0 · Large 0 · XL 0           ║
║ Coverage Dist.: 0–30% 0 · 30–60% 0 · 60–80% 1 · 80–100% 1              ║
║ Risk Summary  : CRITICAL 0 · HIGH 0 · MEDIUM 1 · LOW 1                 ║
╚════════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: CANVAS COMPONENT UPDATE SVG NODE                     ║
║ Domain : renderx-web-orchestration                                     ║
║ Package: canvas-component                                              ║
║ Scope : 1 Symphony · 3 Movements · 2 Beats · 2 Handlers                ║
║ Health: 36 LOC · Avg Cov 73% · Size Band: TINY · Risk: LOW             ║
╠════════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                           ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                      ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1                  ║
║   Focus: template     Focus: styling     Focus: import + payload       ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════════╣
║ Beat Mov Handler                     LOC  Sz   Cov Risk AC  Src Baton  ║
║ ───────────────────────────────────────────────────────────────────────║
║ 1.1  M1  updateSvgNodeAttribute       18  S    58% HIGH N   N   start  ║
║ 1.2  M1  refreshControlPanel          15  S    55% HIGH N   N   metrics║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════════╣
║ Size Bands    : Tiny 0 · Small 2 · Medium 0 · Large 0 · XL 0           ║
║ Coverage Dist.: 0–30% 0 · 30–60% 2 · 60–80% 0 · 80–100% 0              ║
║ Risk Summary  : CRITICAL 0 · HIGH 2 · MEDIUM 0 · LOW 0                 ║
╚════════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: CANVAS COMPONENT UPDATE                              ║
║ Domain : renderx-web-orchestration                                     ║
║ Package: canvas-component                                              ║
║ Scope : 1 Symphony · 3 Movements · 2 Beats · 2 Handlers                ║
║ Health: 36 LOC · Avg Cov 73% · Size Band: TINY · Risk: LOW             ║
╠════════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                           ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                      ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1                  ║
║   Focus: template     Focus: styling     Focus: import + payload       ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════════╣
║ Beat Mov Handler                     LOC  Sz   Cov Risk AC  Src Baton  ║
║ ───────────────────────────────────────────────────────────────────────║
║ 1.1  M1  updateAttribute              15  S    54% HIGH N   N   start  ║
║ 1.2  M1  refreshControlPanel          17  S    78% LOW  N   N   metrics║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════════╣
║ Size Bands    : Tiny 0 · Small 2 · Medium 0 · Large 0 · XL 0           ║
║ Coverage Dist.: 0–30% 0 · 30–60% 1 · 60–80% 1 · 80–100% 0              ║
║ Risk Summary  : CRITICAL 0 · HIGH 1 · MEDIUM 0 · LOW 1                 ║
╚════════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: CANVAS COMPONENT RESIZE MOVE                         ║
║ Domain : renderx-web-orchestration                                     ║
║ Package: canvas-component                                              ║
║ Scope : 1 Symphony · 3 Movements · 2 Beats · 2 Handlers                ║
║ Health: 36 LOC · Avg Cov 73% · Size Band: TINY · Risk: LOW             ║
╠════════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                           ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                      ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1                  ║
║   Focus: template     Focus: styling     Focus: import + payload       ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════════╣
║ Beat Mov Handler                     LOC  Sz   Cov Risk AC  Src Baton  ║
║ ───────────────────────────────────────────────────────────────────────║
║ 1.1  M1  updateSize                   19  S    66% MED  N   N   start  ║
║ 1.2  M1  forwardToControlPanel        21  S    63% MED  N   N   metrics║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════════╣
║ Size Bands    : Tiny 0 · Small 1 · Medium 1 · Large 0 · XL 0           ║
║ Coverage Dist.: 0–30% 0 · 30–60% 0 · 60–80% 2 · 80–100% 0              ║
║ Risk Summary  : CRITICAL 0 · HIGH 0 · MEDIUM 2 · LOW 0                 ║
╚════════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: CANVAS COMPONENT DRAG MOVE                           ║
║ Domain : renderx-web-orchestration                                     ║
║ Package: canvas-component                                              ║
║ Scope : 1 Symphony · 3 Movements · 2 Beats · 2 Handlers                ║
║ Health: 36 LOC · Avg Cov 73% · Size Band: TINY · Risk: CRITICAL        ║
╠════════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                           ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                      ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1                  ║
║   Focus: template     Focus: styling     Focus: import + payload       ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════════╣
║ Beat Mov Handler                     LOC  Sz   Cov Risk AC  Src Baton  ║
║ ───────────────────────────────────────────────────────────────────────║
║ 1.1  M1  updatePosition               19  S    70% MED  N   N   start  ║
║ 1.2  M1  forwardToControlPanel        15  S    58% HIGH N   N   metrics║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════════╣
║ Size Bands    : Tiny 0 · Small 2 · Medium 0 · Large 0 · XL 0           ║
║ Coverage Dist.: 0–30% 0 · 30–60% 1 · 60–80% 1 · 80–100% 0              ║
║ Risk Summary  : CRITICAL 0 · HIGH 1 · MEDIUM 1 · LOW 0                 ║
╚════════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: CANVAS COMPONENT DESELECT                            ║
║ Domain : renderx-web-orchestration                                     ║
║ Package: canvas-component                                              ║
║ Scope : 1 Symphony · 3 Movements · 2 Beats · 2 Handlers                ║
║ Health: 36 LOC · Avg Cov 73% · Size Band: TINY · Risk: MEDIUM          ║
╠════════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                           ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                      ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1                  ║
║   Focus: template     Focus: styling     Focus: import + payload       ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════════╣
║ Beat Mov Handler                     LOC  Sz   Cov Risk AC  Src Baton  ║
║ ───────────────────────────────────────────────────────────────────────║
║ 1.1  M1  deselectComponent            21  S    68% MED  N   N   start  ║
║ 1.2  M1  publishDeselectionChanged    21  S    63% MED  N   N   metrics║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════════╣
║ Size Bands    : Tiny 0 · Small 0 · Medium 2 · Large 0 · XL 0           ║
║ Coverage Dist.: 0–30% 0 · 30–60% 0 · 60–80% 2 · 80–100% 0              ║
║ Risk Summary  : CRITICAL 0 · HIGH 0 · MEDIUM 2 · LOW 0                 ║
╚════════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: CANVAS COMPONENT DESELECT ALL                        ║
║ Domain : renderx-web-orchestration                                     ║
║ Package: canvas-component                                              ║
║ Scope : 1 Symphony · 3 Movements · 2 Beats · 2 Handlers                ║
║ Health: 36 LOC · Avg Cov 73% · Size Band: TINY · Risk: MEDIUM          ║
╠════════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                           ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                      ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1                  ║
║   Focus: template     Focus: styling     Focus: import + payload       ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════════╣
║ Beat Mov Handler                     LOC  Sz   Cov Risk AC  Src Baton  ║
║ ───────────────────────────────────────────────────────────────────────║
║ 1.1  M1  hideAllOverlays              15  S    69% MED  N   N   start  ║
║ 1.2  M1  publishSelectionsCleared     21  S    64% MED  N   N   metrics║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════════╣
║ Size Bands    : Tiny 0 · Small 1 · Medium 1 · Large 0 · XL 0           ║
║ Coverage Dist.: 0–30% 0 · 30–60% 0 · 60–80% 2 · 80–100% 0              ║
║ Risk Summary  : CRITICAL 0 · HIGH 0 · MEDIUM 2 · LOW 0                 ║
╚════════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: CANVAS COMPONENT DELETE                              ║
║ Domain : renderx-web-orchestration                                     ║
║ Package: canvas-component                                              ║
║ Scope : 1 Symphony · 3 Movements · 2 Beats · 2 Handlers                ║
║ Health: 36 LOC · Avg Cov 73% · Size Band: TINY · Risk: LOW             ║
╠════════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                           ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                      ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1                  ║
║   Focus: template     Focus: styling     Focus: import + payload       ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════════╣
║ Beat Mov Handler                     LOC  Sz   Cov Risk AC  Src Baton  ║
║ ───────────────────────────────────────────────────────────────────────║
║ 1.1  M1  deleteComponent              20  S    72% MED  N   N   start  ║
║ 1.2  M1  publishDeleted               20  S    74% MED  N   N   metrics║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════════╣
║ Size Bands    : Tiny 0 · Small 0 · Medium 2 · Large 0 · XL 0           ║
║ Coverage Dist.: 0–30% 0 · 30–60% 0 · 60–80% 2 · 80–100% 0              ║
║ Risk Summary  : CRITICAL 0 · HIGH 0 · MEDIUM 2 · LOW 0                 ║
╚════════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: LIBRARY LOAD                                         ║
║ Domain : renderx-web-orchestration                                     ║
║ Package: canvas-component                                              ║
║ Scope : 1 Symphony · 3 Movements · 1 Beats · 1 Handlers                ║
║ Health: 18 LOC · Avg Cov 73% · Size Band: TINY · Risk: LOW             ║
╠════════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                           ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                      ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1                  ║
║   Focus: template     Focus: styling     Focus: import + payload       ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════════╣
║ Beat Mov Handler                     LOC  Sz   Cov Risk AC  Src Baton  ║
║ ───────────────────────────────────────────────────────────────────────║
║ 1.1  M1  notifyUi                     17  S    80% LOW  Y   Y   start  ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════════╣
║ Size Bands    : Tiny 0 · Small 1 · Medium 0 · Large 0 · XL 0           ║
║ Coverage Dist.: 0–30% 0 · 30–60% 0 · 60–80% 0 · 80–100% 1              ║
║ Risk Summary  : CRITICAL 0 · HIGH 0 · MEDIUM 0 · LOW 1                 ║
╚════════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: HEADER UI THEME TOGGLE                               ║
║ Domain : renderx-web-orchestration                                     ║
║ Package: header                                                        ║
║ Scope : 1 Symphony · 3 Movements · 1 Beats · 1 Handlers                ║
║ Health: 18 LOC · Avg Cov 73% · Size Band: TINY · Risk: LOW             ║
╠════════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                           ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                      ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1                  ║
║   Focus: template     Focus: styling     Focus: import + payload       ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════════╣
║ Beat Mov Handler                     LOC  Sz   Cov Risk AC  Src Baton  ║
║ ───────────────────────────────────────────────────────────────────────║
║ 1.1  M1  toggleTheme                  16  S    67% MED  N   N   start  ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════════╣
║ Size Bands    : Tiny 0 · Small 1 · Medium 0 · Large 0 · XL 0           ║
║ Coverage Dist.: 0–30% 0 · 30–60% 0 · 60–80% 1 · 80–100% 0              ║
║ Risk Summary  : CRITICAL 0 · HIGH 0 · MEDIUM 1 · LOW 0                 ║
╚════════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: CONTROL PANEL UI SECTION TOGGLE                      ║
║ Domain : renderx-web-orchestration                                     ║
║ Package: control-panel                                                 ║
║ Scope : 1 Symphony · 3 Movements · 1 Beats · 1 Handlers                ║
║ Health: 18 LOC · Avg Cov 73% · Size Band: TINY · Risk: LOW             ║
╠════════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                           ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                      ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1                  ║
║   Focus: template     Focus: styling     Focus: import + payload       ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════════╣
║ Beat Mov Handler                     LOC  Sz   Cov Risk AC  Src Baton  ║
║ ───────────────────────────────────────────────────────────────────────║
║ 1.1  M1  toggleSection                19  S    64% MED  N   N   start  ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════════╣
║ Size Bands    : Tiny 0 · Small 1 · Medium 0 · Large 0 · XL 0           ║
║ Coverage Dist.: 0–30% 0 · 30–60% 0 · 60–80% 1 · 80–100% 0              ║
║ Risk Summary  : CRITICAL 0 · HIGH 0 · MEDIUM 1 · LOW 0                 ║
╚════════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: CANVAS COMPONENT SELECT SVG NODE                     ║
║ Domain : renderx-web-orchestration                                     ║
║ Package: canvas-component                                              ║
║ Scope : 1 Symphony · 3 Movements · 1 Beats · 1 Handlers                ║
║ Health: 18 LOC · Avg Cov 73% · Size Band: TINY · Risk: CRITICAL        ║
╠════════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                           ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                      ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1                  ║
║   Focus: template     Focus: styling     Focus: import + payload       ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════════╣
║ Beat Mov Handler                     LOC  Sz   Cov Risk AC  Src Baton  ║
║ ───────────────────────────────────────────────────────────────────────║
║ 1.1  M1  showSvgNodeOverlay           19  S    65% MED  N   N   start  ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════════╣
║ Size Bands    : Tiny 0 · Small 1 · Medium 0 · Large 0 · XL 0           ║
║ Coverage Dist.: 0–30% 0 · 30–60% 0 · 60–80% 1 · 80–100% 0              ║
║ Risk Summary  : CRITICAL 0 · HIGH 0 · MEDIUM 1 · LOW 0                 ║
╚════════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: CANVAS COMPONENT SELECT REQUESTED                    ║
║ Domain : renderx-web-orchestration                                     ║
║ Package: canvas-component                                              ║
║ Scope : 1 Symphony · 3 Movements · 1 Beats · 1 Handlers                ║
║ Health: 18 LOC · Avg Cov 73% · Size Band: TINY · Risk: LOW             ║
╠════════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                           ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                      ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1                  ║
║   Focus: template     Focus: styling     Focus: import + payload       ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════════╣
║ Beat Mov Handler                     LOC  Sz   Cov Risk AC  Src Baton  ║
║ ───────────────────────────────────────────────────────────────────────║
║ 1.1  M1  routeSelectionRequest        20  S    69% MED  N   N   start  ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════════╣
║ Size Bands    : Tiny 0 · Small 0 · Medium 1 · Large 0 · XL 0           ║
║ Coverage Dist.: 0–30% 0 · 30–60% 0 · 60–80% 1 · 80–100% 0              ║
║ Risk Summary  : CRITICAL 0 · HIGH 0 · MEDIUM 1 · LOW 0                 ║
╚════════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: CANVAS COMPONENT RESIZE START                        ║
║ Domain : renderx-web-orchestration                                     ║
║ Package: canvas-component                                              ║
║ Scope : 1 Symphony · 3 Movements · 1 Beats · 1 Handlers                ║
║ Health: 18 LOC · Avg Cov 73% · Size Band: TINY · Risk: CRITICAL        ║
╠════════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                           ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                      ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1                  ║
║   Focus: template     Focus: styling     Focus: import + payload       ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════════╣
║ Beat Mov Handler                     LOC  Sz   Cov Risk AC  Src Baton  ║
║ ───────────────────────────────────────────────────────────────────────║
║ 1.1  M1  startResize                  21  S    76% LOW  N   N   start  ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════════╣
║ Size Bands    : Tiny 0 · Small 0 · Medium 1 · Large 0 · XL 0           ║
║ Coverage Dist.: 0–30% 0 · 30–60% 0 · 60–80% 1 · 80–100% 0              ║
║ Risk Summary  : CRITICAL 0 · HIGH 0 · MEDIUM 0 · LOW 1                 ║
╚════════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: CANVAS LINE RESIZE START                             ║
║ Domain : renderx-web-orchestration                                     ║
║ Package: canvas-component                                              ║
║ Scope : 1 Symphony · 3 Movements · 1 Beats · 1 Handlers                ║
║ Health: 18 LOC · Avg Cov 73% · Size Band: TINY · Risk: LOW             ║
╠════════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                           ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                      ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1                  ║
║   Focus: template     Focus: styling     Focus: import + payload       ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════════╣
║ Beat Mov Handler                     LOC  Sz   Cov Risk AC  Src Baton  ║
║ ───────────────────────────────────────────────────────────────────────║
║ 1.1  M1  startLineResize              21  S    57% HIGH N   N   start  ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════════╣
║ Size Bands    : Tiny 0 · Small 0 · Medium 1 · Large 0 · XL 0           ║
║ Coverage Dist.: 0–30% 0 · 30–60% 1 · 60–80% 0 · 80–100% 0              ║
║ Risk Summary  : CRITICAL 0 · HIGH 1 · MEDIUM 0 · LOW 0                 ║
╚════════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: CANVAS LINE RESIZE MOVE                              ║
║ Domain : renderx-web-orchestration                                     ║
║ Package: canvas-component                                              ║
║ Scope : 1 Symphony · 3 Movements · 1 Beats · 1 Handlers                ║
║ Health: 18 LOC · Avg Cov 73% · Size Band: TINY · Risk: LOW             ║
╠════════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                           ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                      ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1                  ║
║   Focus: template     Focus: styling     Focus: import + payload       ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════════╣
║ Beat Mov Handler                     LOC  Sz   Cov Risk AC  Src Baton  ║
║ ───────────────────────────────────────────────────────────────────────║
║ 1.1  M1  updateLine                   18  S    59% HIGH N   N   start  ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════════╣
║ Size Bands    : Tiny 0 · Small 1 · Medium 0 · Large 0 · XL 0           ║
║ Coverage Dist.: 0–30% 0 · 30–60% 1 · 60–80% 0 · 80–100% 0              ║
║ Risk Summary  : CRITICAL 0 · HIGH 1 · MEDIUM 0 · LOW 0                 ║
╚════════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: CANVAS LINE RESIZE END                               ║
║ Domain : renderx-web-orchestration                                     ║
║ Package: canvas-component                                              ║
║ Scope : 1 Symphony · 3 Movements · 1 Beats · 1 Handlers                ║
║ Health: 18 LOC · Avg Cov 73% · Size Band: TINY · Risk: LOW             ║
╠════════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                           ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                      ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1                  ║
║   Focus: template     Focus: styling     Focus: import + payload       ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════════╣
║ Beat Mov Handler                     LOC  Sz   Cov Risk AC  Src Baton  ║
║ ───────────────────────────────────────────────────────────────────────║
║ 1.1  M1  endLineResize                20  S    61% MED  N   N   start  ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════════╣
║ Size Bands    : Tiny 0 · Small 0 · Medium 1 · Large 0 · XL 0           ║
║ Coverage Dist.: 0–30% 0 · 30–60% 0 · 60–80% 1 · 80–100% 0              ║
║ Risk Summary  : CRITICAL 0 · HIGH 0 · MEDIUM 1 · LOW 0                 ║
╚════════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: CANVAS COMPONENT RESIZE END                          ║
║ Domain : renderx-web-orchestration                                     ║
║ Package: canvas-component                                              ║
║ Scope : 1 Symphony · 3 Movements · 1 Beats · 1 Handlers                ║
║ Health: 18 LOC · Avg Cov 73% · Size Band: TINY · Risk: LOW             ║
╠════════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                           ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                      ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1                  ║
║   Focus: template     Focus: styling     Focus: import + payload       ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════════╣
║ Beat Mov Handler                     LOC  Sz   Cov Risk AC  Src Baton  ║
║ ───────────────────────────────────────────────────────────────────────║
║ 1.1  M1  endResize                    16  S    64% MED  N   N   start  ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════════╣
║ Size Bands    : Tiny 0 · Small 1 · Medium 0 · Large 0 · XL 0           ║
║ Coverage Dist.: 0–30% 0 · 30–60% 0 · 60–80% 1 · 80–100% 0              ║
║ Risk Summary  : CRITICAL 0 · HIGH 0 · MEDIUM 1 · LOW 0                 ║
╚════════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: CANVAS LINE MANIP START                              ║
║ Domain : renderx-web-orchestration                                     ║
║ Package: canvas-component                                              ║
║ Scope : 1 Symphony · 3 Movements · 1 Beats · 1 Handlers                ║
║ Health: 18 LOC · Avg Cov 73% · Size Band: TINY · Risk: LOW             ║
╠════════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                           ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                      ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1                  ║
║   Focus: template     Focus: styling     Focus: import + payload       ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════════╣
║ Beat Mov Handler                     LOC  Sz   Cov Risk AC  Src Baton  ║
║ ───────────────────────────────────────────────────────────────────────║
║ 1.1  M1  startLineManip               15  S    65% MED  N   N   start  ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════════╣
║ Size Bands    : Tiny 0 · Small 1 · Medium 0 · Large 0 · XL 0           ║
║ Coverage Dist.: 0–30% 0 · 30–60% 0 · 60–80% 1 · 80–100% 0              ║
║ Risk Summary  : CRITICAL 0 · HIGH 0 · MEDIUM 1 · LOW 0                 ║
╚════════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: CANVAS LINE MANIP MOVE                               ║
║ Domain : renderx-web-orchestration                                     ║
║ Package: canvas-component                                              ║
║ Scope : 1 Symphony · 3 Movements · 1 Beats · 1 Handlers                ║
║ Health: 18 LOC · Avg Cov 73% · Size Band: TINY · Risk: LOW             ║
╠════════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                           ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                      ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1                  ║
║   Focus: template     Focus: styling     Focus: import + payload       ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════════╣
║ Beat Mov Handler                     LOC  Sz   Cov Risk AC  Src Baton  ║
║ ───────────────────────────────────────────────────────────────────────║
║ 1.1  M1  moveLineManip                19  S    61% MED  N   N   start  ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════════╣
║ Size Bands    : Tiny 0 · Small 1 · Medium 0 · Large 0 · XL 0           ║
║ Coverage Dist.: 0–30% 0 · 30–60% 0 · 60–80% 1 · 80–100% 0              ║
║ Risk Summary  : CRITICAL 0 · HIGH 0 · MEDIUM 1 · LOW 0                 ║
╚════════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: CANVAS LINE MANIP END                                ║
║ Domain : renderx-web-orchestration                                     ║
║ Package: canvas-component                                              ║
║ Scope : 1 Symphony · 3 Movements · 1 Beats · 1 Handlers                ║
║ Health: 18 LOC · Avg Cov 73% · Size Band: TINY · Risk: LOW             ║
╠════════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                           ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                      ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1                  ║
║   Focus: template     Focus: styling     Focus: import + payload       ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════════╣
║ Beat Mov Handler                     LOC  Sz   Cov Risk AC  Src Baton  ║
║ ───────────────────────────────────────────────────────────────────────║
║ 1.1  M1  endLineManip                 18  S    56% HIGH N   N   start  ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════════╣
║ Size Bands    : Tiny 0 · Small 1 · Medium 0 · Large 0 · XL 0           ║
║ Coverage Dist.: 0–30% 0 · 30–60% 1 · 60–80% 0 · 80–100% 0              ║
║ Risk Summary  : CRITICAL 0 · HIGH 1 · MEDIUM 0 · LOW 0                 ║
╚════════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: CANVAS COMPONENT EXPORT MP4                          ║
║ Domain : renderx-web-orchestration                                     ║
║ Package: canvas-component                                              ║
║ Scope : 1 Symphony · 3 Movements · 1 Beats · 1 Handlers                ║
║ Health: 18 LOC · Avg Cov 73% · Size Band: TINY · Risk: LOW             ║
╠════════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                           ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                      ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1                  ║
║   Focus: template     Focus: styling     Focus: import + payload       ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════════╣
║ Beat Mov Handler                     LOC  Sz   Cov Risk AC  Src Baton  ║
║ ───────────────────────────────────────────────────────────────────────║
║ 1.1  M1  exportSvgToMp4               21  S    79% LOW  N   N   start  ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════════╣
║ Size Bands    : Tiny 0 · Small 0 · Medium 1 · Large 0 · XL 0           ║
║ Coverage Dist.: 0–30% 0 · 30–60% 0 · 60–80% 1 · 80–100% 0              ║
║ Risk Summary  : CRITICAL 0 · HIGH 0 · MEDIUM 0 · LOW 1                 ║
╚════════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: CANVAS COMPONENT EXPORT GIF                          ║
║ Domain : renderx-web-orchestration                                     ║
║ Package: canvas-component                                              ║
║ Scope : 1 Symphony · 3 Movements · 1 Beats · 1 Handlers                ║
║ Health: 18 LOC · Avg Cov 73% · Size Band: TINY · Risk: CRITICAL        ║
╠════════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                           ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                      ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1                  ║
║   Focus: template     Focus: styling     Focus: import + payload       ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════════╣
║ Beat Mov Handler                     LOC  Sz   Cov Risk AC  Src Baton  ║
║ ───────────────────────────────────────────────────────────────────────║
║ 1.1  M1  exportSvgToGif               17  S    56% HIGH N   N   start  ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════════╣
║ Size Bands    : Tiny 0 · Small 1 · Medium 0 · Large 0 · XL 0           ║
║ Coverage Dist.: 0–30% 0 · 30–60% 1 · 60–80% 0 · 80–100% 0              ║
║ Risk Summary  : CRITICAL 0 · HIGH 1 · MEDIUM 0 · LOW 0                 ║
╚════════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: CANVAS COMPONENT DRAG START                          ║
║ Domain : renderx-web-orchestration                                     ║
║ Package: canvas-component                                              ║
║ Scope : 1 Symphony · 3 Movements · 1 Beats · 1 Handlers                ║
║ Health: 18 LOC · Avg Cov 73% · Size Band: TINY · Risk: LOW             ║
╠════════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                           ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                      ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1                  ║
║   Focus: template     Focus: styling     Focus: import + payload       ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════════╣
║ Beat Mov Handler                     LOC  Sz   Cov Risk AC  Src Baton  ║
║ ───────────────────────────────────────────────────────────────────────║
║ 1.1  M1  startDrag                    15  S    71% MED  N   N   start  ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════════╣
║ Size Bands    : Tiny 0 · Small 1 · Medium 0 · Large 0 · XL 0           ║
║ Coverage Dist.: 0–30% 0 · 30–60% 0 · 60–80% 1 · 80–100% 0              ║
║ Risk Summary  : CRITICAL 0 · HIGH 0 · MEDIUM 1 · LOW 0                 ║
╚════════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: CANVAS COMPONENT DRAG END                            ║
║ Domain : renderx-web-orchestration                                     ║
║ Package: canvas-component                                              ║
║ Scope : 1 Symphony · 3 Movements · 1 Beats · 1 Handlers                ║
║ Health: 18 LOC · Avg Cov 73% · Size Band: TINY · Risk: CRITICAL        ║
╠════════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                           ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                      ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1                  ║
║   Focus: template     Focus: styling     Focus: import + payload       ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════════╣
║ Beat Mov Handler                     LOC  Sz   Cov Risk AC  Src Baton  ║
║ ───────────────────────────────────────────────────────────────────────║
║ 1.1  M1  endDrag                      20  S    72% MED  N   N   start  ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════════╣
║ Size Bands    : Tiny 0 · Small 0 · Medium 1 · Large 0 · XL 0           ║
║ Coverage Dist.: 0–30% 0 · 30–60% 0 · 60–80% 1 · 80–100% 0              ║
║ Risk Summary  : CRITICAL 0 · HIGH 0 · MEDIUM 1 · LOW 0                 ║
╚════════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: CANVAS COMPONENT DESELECT REQUESTED                  ║
║ Domain : renderx-web-orchestration                                     ║
║ Package: canvas-component                                              ║
║ Scope : 1 Symphony · 3 Movements · 1 Beats · 1 Handlers                ║
║ Health: 18 LOC · Avg Cov 73% · Size Band: TINY · Risk: CRITICAL        ║
╠════════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                           ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                      ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1                  ║
║   Focus: template     Focus: styling     Focus: import + payload       ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════════╣
║ Beat Mov Handler                     LOC  Sz   Cov Risk AC  Src Baton  ║
║ ───────────────────────────────────────────────────────────────────────║
║ 1.1  M1  routeDeselectionRequest      16  S    63% MED  N   N   start  ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════════╣
║ Size Bands    : Tiny 0 · Small 1 · Medium 0 · Large 0 · XL 0           ║
║ Coverage Dist.: 0–30% 0 · 30–60% 0 · 60–80% 1 · 80–100% 0              ║
║ Risk Summary  : CRITICAL 0 · HIGH 0 · MEDIUM 1 · LOW 0                 ║
╚════════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: CANVAS COMPONENT DELETE REQUESTED                    ║
║ Domain : renderx-web-orchestration                                     ║
║ Package: canvas-component                                              ║
║ Scope : 1 Symphony · 3 Movements · 1 Beats · 1 Handlers                ║
║ Health: 18 LOC · Avg Cov 73% · Size Band: TINY · Risk: CRITICAL        ║
╠════════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                           ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                      ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1                  ║
║   Focus: template     Focus: styling     Focus: import + payload       ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════════╣
║ Beat Mov Handler                     LOC  Sz   Cov Risk AC  Src Baton  ║
║ ───────────────────────────────────────────────────────────────────────║
║ 1.1  M1  routeDeleteRequest           16  S    63% MED  N   N   start  ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════════╣
║ Size Bands    : Tiny 0 · Small 1 · Medium 0 · Large 0 · XL 0           ║
║ Coverage Dist.: 0–30% 0 · 30–60% 0 · 60–80% 1 · 80–100% 0              ║
║ Risk Summary  : CRITICAL 0 · HIGH 0 · MEDIUM 1 · LOW 0                 ║
╚════════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: CANVAS COMPONENT AUGMENT                             ║
║ Domain : renderx-web-orchestration                                     ║
║ Package: canvas-component                                              ║
║ Scope : 1 Symphony · 3 Movements · 1 Beats · 1 Handlers                ║
║ Health: 18 LOC · Avg Cov 73% · Size Band: TINY · Risk: CRITICAL        ║
╠════════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                           ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                      ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1                  ║
║   Focus: template     Focus: styling     Focus: import + payload       ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════════╣
║ Beat Mov Handler                     LOC  Sz   Cov Risk AC  Src Baton  ║
║ ───────────────────────────────────────────────────────────────────────║
║ 1.1  M1  enhanceLine                  20  S    75% LOW  Y   Y   start  ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════════╣
║ Size Bands    : Tiny 0 · Small 0 · Medium 1 · Large 0 · XL 0           ║
║ Coverage Dist.: 0–30% 0 · 30–60% 0 · 60–80% 1 · 80–100% 0              ║
║ Risk Summary  : CRITICAL 0 · HIGH 0 · MEDIUM 0 · LOW 1                 ║
╚════════════════════════════════════════════════════════════════════════╝

                        │
                        ▼

┌─ 📊 QUALITY & COVERAGE METRICS ────────────────────────────────────────────────────────────────────────────────────────────┐
│ Handlers Analyzed: 285  │  Avg LOC/Handler: 18.13  │  Test Coverage: 73.0%  │  Duplication: 77.6%  │  God Handlers: ✓ None │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

╔═════════════════════════════════════════════╗
║ RISK ASSESSMENT MATRIX                      ║
╠═════════════════════════════════════════════╣
║ CRITICAL: 0                                 ║
║                                             ║
║ HIGH    : 0                                 ║
║                                             ║
║ MEDIUM  : 1                                 ║
║   - Missing complexity threshold validation ║
║                                             ║
║ LOW     : 1                                 ║
║   - Handler not tracking duplication trends ║
╚═════════════════════════════════════════════╝

╔═══════════════════════════════════════════════════════╗
║ Reduce code duplication                               ║
╠═══════════════════════════════════════════════════════╣
║ Target : High duplication areas                       ║
║ Effort : medium                                       ║
║ Rationale: Current duplication: 77.6%. Target: <50%   ║
║ PR: refactor: extract common code patterns to reduce d║
╚═══════════════════════════════════════════════════════╝

╔═══════════════════════════════════════════════════════╗
║ Improve test coverage                                 ║
╠═══════════════════════════════════════════════════════╣
║ Target : Uncovered handlers                           ║
║ Effort : medium                                       ║
║ Rationale: Current coverage: 73.0%. Target: 80%+      ║
║ PR: test: add comprehensive unit tests for core handle║
╚═══════════════════════════════════════════════════════╝

╔═══════════════════════════════════════════════════════╗
║ Enhance maintainability                               ║
╠═══════════════════════════════════════════════════════╣
║ Target : Complex handlers                             ║
║ Effort : low                                          ║
║ Rationale: Split complex logic into smaller, testable ║
║ PR: refactor: improve handler maintainability and read║
╚═══════════════════════════════════════════════════════╝



╔══════════════════════════════════════════════════════════════════════╗
║ LEGEND & DOMAIN TERMINOLOGY                                          ║
╠══════════════════════════════════════════════════════════════════════╣
║ Domain: renderx-web-orchestration                                    ║
║                                                                      ║
║ • Symphony: Logical grouping of related handler functions            ║
║ • Sequence: Execution order of handlers (choreographed flow)         ║
║ • Handler: Individual function performing specific orchestration task║
║ • Beat: Execution unit within a Movement (4 movements × 4 beats)     ║
║ • Movement: Major phase (Discovery, Metrics, Coverage, Conformity)   ║
║ • Data Baton 🎭: Metadata passed between beats (files, handlers, metr║
║ • Orchestration: Complete system of symphonies, sequences, and handle║
║ • LOC: Lines of Code (measured, not synthetic)                       ║
║ • Coverage: Percentage covered by tests (target: 80%+)               ║
║ • Duplication: Percentage of duplicate code blocks identified        ║
║ • God Handler: Handler with 100+ LOC and <70% coverage (refactor)    ║
║ • 🟢 GREEN (80%+): Well-covered, production-ready                    ║
║ • 🟡 YELLOW (50-79%): Acceptable but needs improvement               ║
║ • 🔴 RED (<50%): Poor coverage, high risk                            ║
║ • ⚠️ WARNING: High complexity or high-risk area                      ║
║ • ✓ CHECK: Meets requirements/passing                                ║
╚══════════════════════════════════════════════════════════════════════╝

═════════════════════════════════════════════════════════════════════════════════════════════════════════════════════

ANAlYSIS EXECUTION SUMMARY:
  ✅ Discovered: 867 source files in renderx-web-orchestration
  ✅ Analyzed: 285 handler functions with measured LOC (5168 total lines)
  ✅ Mapped: Files to orchestration beats
  ✅ Measured: Test coverage (avg 73.0%)
  ✅ No God handlers detected
  ✅ Generated: Comprehensive metrics and analysis artifacts

NEXT ACTIONS:
  → Review detailed metrics in full report
  → Reduce code duplication from 77.6% to <50%
  → Improve test coverage to 80%+ (currently 73.0%)
  

═════════════════════════════════════════════════════════════════════════════════════════════════════════════════════


---

## Movement 1: Code Discovery & Beat Mapping

**Purpose**: Discover all source files and map them to orchestration beats

- **Files Discovered**: 867
- **Beats Completed**: 4/4 ✓
- **Beat Mappings**:
  - Beat 1 (Discovery): 0 files
  - Beat 2 (Baseline): 379 files
  - Beat 3 (Structure): 361 files
  - Beat 4 (Dependencies): 127 files

---

## Movement 2: Code Metrics Analysis

**Purpose**: Calculate LOC, complexity, duplication, and maintainability metrics

### Lines of Code (LOC)
- **Total**: 5,168
- **Average per File**: 6
- **Status**: ✓ Normal range

### Complexity Analysis
- **High Complexity**: 2 files
- **Medium Complexity**: 0 files
- **Low Complexity**: 28 files
- **Average**: 1.13
- **Status**: ✓ Within acceptable limits

### Code Duplication

⚠ **708 duplicated code blocks detected**

**Top Duplications:**
  1. **47 files** | 94 occurrences | 5 lines | blue-green-deployment.ts:34-38, blue-green-deployment.ts:35-39, dark-launches.ts:34-38
  2. **44 files** | 88 occurrences | 5 lines | blue-green-deployment.ts:27-31, blue-green-deployment.ts:28-32, dark-launches.ts:27-31
  3. **67 files** | 67 occurrences | 5 lines | blue-green-deployment.ts:41-45, dark-launches.ts:41-45, feature-toggles.ts:41-45
  4. **64 files** | 64 occurrences | 5 lines | blue-green-deployment.ts:13-17, dark-launches.ts:13-17, feature-toggles.ts:13-17
  5. **64 files** | 64 occurrences | 5 lines | blue-green-deployment.ts:14-18, dark-launches.ts:14-18, feature-toggles.ts:14-18

**Metrics:**
- Duplicate Regions: 708
- Estimated Duplicate Lines: 10115
- Duplication Rate: ~285.73%

**Status**: Review and refactor identified blocks. Priority: #1 (highest frequency)

**Measurement**: Source='measured' (AST region hashing across 319 files)
**Last Scan**: 2025-12-06T04:26:56.242Z

### Maintainability Index
- **Score**: 60.58/100
- **Classification**: 🟡 **FAIR** (B)
- **Threshold**: 60-80
- **Guidance**: Address technical debt in next sprint. Schedule refactoring review.
- **Contributing Factors**:
  - Test Coverage: 74.8%
  - Documentation: 87.1%
  - Comment Density: 40.1%
  - Complexity Score: 57.7

---

## Movement 3: Test Coverage Analysis (Orchestration Suite)

**Purpose**: Measure statement, branch, function, and line coverage

**Scope**: Full `renderx-web-orchestration` domain - all source files in `packages/` analyzed

### Coverage Metrics
| Type | Coverage | Target | Gap | Status |
|------|----------|--------|-----|--------|
| Statements | 72.96% | 80% | -7.0% | 🟡 Needs Improvement |
| Branches | 65.98% | 75% | -9.0% | 🔴 Off-track |
| Functions | 86.31% | 80% | 6.3% | 🟡 Needs Improvement |
| Lines | 79.44% | 80% | -0.6% | 🟡 Needs Improvement |

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

### Acceptance Criteria-to-Test Alignment

**Status**: ❌ POOR

| Metric | Value |
|--------|-------|
| Average AC Coverage | **0%** |
| Covered ACs | 0/11 |
| Beats with Tests | 0/3 |
| Total Tests | 389 |
| Tests with AC Tags | 27 |
| THEN Clause Coverage | 0% |

⚠️ **Action Required**: AC coverage is below 70% threshold.

📖 See [AC Alignment Report](./ac-alignment-report.md) for detailed breakdown.



	### Fractal Architecture (Domains-as-Systems, Systems-as-Domains)

	- **Fractal Score**: 0.07 (0-1)
- **Total Orchestration Domains**: 80
- **System-of-Systems Domains**: 6
- **Projection-only Domains**: 3
- **Registry-only Domains**: 4

### Handler Metrics

✅ **647 handlers discovered**

✅ **647 handlers discovered**

**By Type:**
  * generic: 480
  * validation: 48
  * input: 36
  * initialization: 23
  * output: 18
  * event: 15
  * ui-interaction: 10
  * execution: 9
  * error-handling: 5
  * transformation: 3

**Top Handlers:**
  * getClipboardText (generic) — packages/canvas-component/src/symphonies/_clipboard.ts
  * safeGetStorage (generic) — packages/canvas-component/src/symphonies/_clipboard.ts
  * safeSetStorage (generic) — packages/canvas-component/src/symphonies/_clipboard.ts
  * setClipboardText (generic) — packages/canvas-component/src/symphonies/_clipboard.ts
  * enhanceLine (generic) — packages/canvas-component/src/symphonies/augment/augment.line.stage-crew.ts
  * ... and 642 more

**Measurement**: Source='measured' (real discovered exports via pattern matching)
**Coverage**: Handlers distributed across 10 types
**Last Scan**: 2025-12-06T04:26:55.721Z

### Handler Scope Analysis

**Scope Definition**: The handler scope/kind layer distinguishes orchestration handlers (system-level logic) from plugin handlers (feature-level logic).

# Handler Scope Analysis Report

**Generated**: 2025-12-06T04:26:55.747Z

## Overview

The handler scope/kind metadata introduced on 2025-11-27 distinguishes orchestration-level handlers (system logic) from plugin-level handlers (feature logic).

## Summary Statistics

| Scope | Count | Percentage | Sequences | Stages |
|-------|-------|-----------|-----------|--------|
| Orchestration | 60 | 73.2% | 5 | N/A |
| Plugin | 22 | 26.8% | 1 | N/A |
| Unknown | 0 | 0.0% | - | - |
| **TOTAL** | **82** | **100%** | - | - |

## Orchestration Handlers (60)

Orchestration handlers implement system-level logic (code analysis, governance, build coordination).

### By Stage


#### Unspecified (60 handlers)

| Sequence | Beat | Handler |
|----------|------|---------|
| renderx-web-orchestration | establish-recovery-checkpoint | undefined |
| build-pipeline-symphony | bootstrap-scan | undefined |
| architecture-governance-enforcement-symphony | beat-0 | architecture-governance-enforcement-symphony.validatejsonschemastructure.0 |
| architecture-governance-enforcement-symphony | beat-1 | architecture-governance-enforcement-symphony.validateorchestrationdomainsregistry.1 |
| architecture-governance-enforcement-symphony | beat-2 | architecture-governance-enforcement-symphony.validatesymphonyfiles.2 |
| architecture-governance-enforcement-symphony | beat-3 | architecture-governance-enforcement-symphony.validateschemasection.3 |
| architecture-governance-enforcement-symphony | beat-4 | architecture-governance-enforcement-symphony.reportjsonvalidation.4 |
| architecture-governance-enforcement-symphony | beat-0 | architecture-governance-enforcement-symphony.starthandlermappingverification.0 |
| architecture-governance-enforcement-symphony | beat-1 | architecture-governance-enforcement-symphony.loadhandlerimplementations.1 |
| architecture-governance-enforcement-symphony | beat-2 | architecture-governance-enforcement-symphony.indexbeatsfromjson.2 |
| ... | ... | and 50 more |


## Plugin Handlers (22)

Plugin handlers implement feature-level logic (UI behavior, component interactions).

### Top Sequences by Handler Count

| Sequence | Handler Count |
|----------|---|
| renderx-web-orchestration | 22 |


## Unknown Scope Handlers (0)

These handlers need scope assignment:



## Key Metrics

- **Orchestration Coverage**: 60 handlers across 5 sequences
- **Plugin Coverage**: 22 handlers across 1 sequences
- **Implementation Status**: Ready for per-scope metrics analysis

## Integration Points

With handler scope/kind now defined, the pipeline can now:

1. **Separate Metrics**: Report LOC, coverage, and complexity separately by scope
2. **Governance Rules**: Apply scope-specific thresholds and standards
3. **Registry Validation**: Audit completeness of orchestration handlers
4. **Self-Healing**: Target fixes to specific handler scopes

## Next Steps

1. Update `analyze-symphonic-code.cjs` to report metrics by scope
2. Implement registry validation for missing orchestration handlers
3. Add scope-specific governance rules to conformity checking
4. Integrate with self-healing domain for targeted refactoring


### Handler-to-Beat Mapping & Health Score

### Symphonic Health Score

**Overall**: 🟢 **88.01/100** (GOOD)

**Component Scores:**
| Component | Score | Target | Status |
|-----------|-------|--------|--------|
| Handler Coverage | 100.00% | 90%+ | ✓ |
| Beat Coverage | 95.65% | 100% | ⚠ |
| Mapping Confidence | 96.56% | 80%+ | ✓ |
| Distribution | 0.00% | 80%+ | ⚠ |

**Metrics:**
- Mapped Handlers: 285/285
- Orphaned Handlers: 0
- Beats with Handlers: 22
- Beats Without Handlers: 1

**Orphaned Handlers:**
**Orphaned Handlers**: None ✓

**Beats Without Handlers (1):**
- establish-recovery-checkpoint (Movement 6: Recovery & Resilience)

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

**Mapping Status**: 647/285 handlers have explicit beat mappings. Coverage heatmap reflects current measurement scope.

**Heatmap Terminology**: "Unassigned" in the Coverage Heatmap table refers to handlers without coverage measurement data correlated to specific beats in the current analysis scope, not to unmapped handlers. All 285 handlers have explicit beat assignments in the orchestration-domains.json mapping.

## Coverage by Handler Analysis

### Overall Test Coverage
**Global Coverage**: 79.8% statements

| Metric | Coverage | Status |
|--------|----------|--------|
| Statements | 79.8% | 🟡 |
| Branches | 67.33% | 🟡 |
| Functions | 76.86% | 🟡 |
| Lines | 81.68% | 🟢 |

### Handler Coverage Summary
| Category | Count | % | Status |
|----------|-------|---|--------|
| Well-Covered (80%+) | 97 | 49.7% | ✅ |
| Partially-Covered (50-79%) | 98 | 50.3% | ⚠️ |
| Poorly-Covered (1-49%) | 0 | 0.0% | ⚠️ |
| Uncovered (0%) | 0 | 0.0% | ❌ |

**Average Handler Coverage**: 79.93%

**Handlers**: 195 | **Average LOC per Handler**: 23.53 | **Total LOC**: 2188

### Coverage Heatmap by Beat

| Beat | Avg Coverage | Handlers | Status |
|------|--------------|----------|--------|
| export-mp4 | 82.27% | 1 | ✅ |
| attach-line-resize | 81.06% | 18 | ✅ |
| register-observers | 80.24% | 1 | ✅ |
| export-gif | 80.04% | 1 | ✅ |
| notify-ui | 79.95% | 8 | ⚠️ |
| resolve-theme | 79.93% | 119 | ⚠️ |
| init-control-panel | 79.8% | 38 | ⚠️ |
| notify-ready | 79.65% | 2 | ⚠️ |
| show-selection-overlay | 79.4% | 3 | ⚠️ |
| refresh-control-panel | 76.84% | 1 | ⚠️ |
| hide-selection-overlay | 76.57% | 1 | ⚠️ |
| apply-theme | 75.72% | 1 | ⚠️ |

### ✅ Well-Tested Handlers (Coverage >= 80%)
| Handler | Coverage | Beat |
|---------|----------|------|
| showSvgNodeOverlay | 84.8% | resolve-theme |
| ui | 84.8% | init-control-panel |
| removeCssClassFromElement | 84.79% | init-control-panel |
| logResults | 84.76% | resolve-theme |
| validateSequenceShape | 84.74% | resolve-theme |
| updateSize | 84.67% | attach-line-resize |
| validateEnvironment | 84.63% | resolve-theme |
| resolveTemplate | 84.62% | resolve-theme |

**Measurement**: Source='measured' (test coverage analysis with handler-beat correlation)
**Timestamp**: 2025-12-06T04:26:58.739Z


### Automated Refactor Suggestions

## Automated Refactor Suggestions

### Executive Summary

Analysis identified **16 refactoring opportunities** across the codebase:

| Category | Count | Impact | Effort |
|----------|-------|--------|--------|
| Code Consolidation | 5 | High | Medium |
| Handler Clustering | 8 | Medium | Medium |
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

#### 🟡 Next Batch (P2): 9 items

**[P2] Refactor handler clustering in "canvas-component"**
- Package contains 184 handlers clustered together. Consider extracting into specialized sub-modules or consolidating related handlers.

**[P2] Refactor handler clustering in "continuous-delivery-pipeline"**
- Package contains 118 handlers clustered together. Consider extracting into specialized sub-modules or consolidating related handlers.

**[P2] Refactor handler clustering in "self-healing"**
- Package contains 98 handlers clustered together. Consider extracting into specialized sub-modules or consolidating related handlers.

**[P2] Refactor handler clustering in "control-panel"**
- Package contains 66 handlers clustered together. Consider extracting into specialized sub-modules or consolidating related handlers.

**[P2] Refactor handler clustering in "library"**
- Package contains 56 handlers clustered together. Consider extracting into specialized sub-modules or consolidating related handlers.

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

#### Suggestion 3: Refactor handler clustering in "canvas-component"
**ID**: CLUSTER-01 | **Priority**: P2

Package contains 184 handlers clustered together. Consider extracting into specialized sub-modules or consolidating related handlers.

**Recommendation**: Split into 2-3 focused modules or consolidate into handler factory
**Impact**: +187 points | -8 (reduce module complexity) | Improved (easier to isolate functionality)

**PR Template** (use `npm run generate:pr -- CLUSTER-01` to generate):
```markdown
# Refactor handler clustering in "canvas-component"
Package contains 184 handlers clustered together. Consider extracting into specialized sub-modules or consolidating related handlers.

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
- Timestamp: 2025-12-06T04:26:59.317Z


### Historical Trend Analysis

**Note**: Trend coverage metrics may differ from current run's Movement 3 metrics due to snapshot timing and aggregation. These represent baseline or averaged coverage, not current execution coverage.

## Historical Trend Analysis

**Analysis Period**: Last 30 snapshots
**Current Baseline**: 2025-12-06T04:26:59.862Z

### Overall Trend Summary

| Metric | Current | Previous | Change | Trend | Direction |
|--------|---------|----------|--------|-------|-----------|
| Handler Count | 647 | 647 | - | New | - |
| Duplication (blocks) | 708 | 708 | - | Monitoring | - |
| Coverage (avg) | 78.96% | 38.07% | - | Monitoring | - |
| Maintainability | 65.38/100 | - | - | Baseline | - |
| Conformity | 87.50% | - | - | Baseline | - |

### Handler Metrics

**Current State**: 647 handlers discovered

**Handler Tracking:**
- Starting baseline: 647 handlers
- Types detected: 10
- Target for next sprint: 777 (20% growth for enhanced coverage)
- Health score: 54/100 (POOR - focus on distribution)

**Expected Evolution**:
- Week 4: 680 handlers (Type-specific handlers added)
- Week 8: 745 handlers (Enhanced testing harness)
- Week 12: 842 handlers (Full handler decomposition)

### Duplication Metrics

**Current State**: 708 duplicate blocks, 10115 duplicate lines

**Duplication Tracking:**
- Current rate: 285.73%
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
| Statements | 83.81% | 85% | 1.19% | 🟡 Close |
| Branches | 74.12% | 85% | 10.88% | 🟡 Close |
| Functions | 75.29% | 90% | 14.71% | 🟡 Close |
| Lines | 83.33% | 85% | 1.67% | ✅ On-target |

**Coverage Improvement Roadmap**:
- **Week 2**: Add 5-8 integration tests → +3% statements
- **Week 4**: Refactor handler coverage → +5% branches
- **Week 6**: Beat 4 expansion → +8% functions
- **Target**: 85%+ all metrics by week 8

### Maintainability Trends

**Current Maintainability Index**: 65.38/100

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
- Handlers: 647
- Duplication: 285.73%
- Coverage: 78.96%
- Maintainability: 65.38/100
- Conformity: 87.50%

**Projected (Week 4)**:
- Handlers: +5% → 680
- Duplication: -15% → 270.73%
- Coverage: +3-5% → 82.96%
- Maintainability: +5 → 70.38/100
- Conformity: +2% → 89.50%

**Projected (Week 8 - Full Sprint)**:
- Handlers: +15% → 745
- Duplication: -30% → 255.73%
- Coverage: +8-10% → 87.96%
- Maintainability: +15 → 80.38/100
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

**Timestamp**: 2025-12-06T04:26:59.870Z
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
✓ Coverage - Orchestration Suite (72.96%) ❌
✓ Handler Scanning (285 handlers discovered) ✅

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

- **JSON Analysis**: renderx-web-orchestration-code-analysis.json
- **Coverage Summary**: renderx-web-orchestration-coverage-summary.json
- **Per-Beat Metrics**: renderx-web-orchestration-per-beat-metrics.csv
- **Trend Analysis**: renderx-web-orchestration-trends.json

---

*Report auto-generated from symphonic-code-analysis-pipeline. All metrics are immutable and traceable to source analysis.*
