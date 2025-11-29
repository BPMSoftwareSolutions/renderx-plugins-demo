# Renderx Web Orchestration Code Analysis Report

**Generated**: 2025-11-29T22:30:57.915Z  
**Codebase**: renderx-web-orchestration  
**Pipeline**: symphonic-code-analysis-pipeline

## Executive Summary

This comprehensive analysis spans 4 movements with 16 beat stages, providing deep insights into code quality, test coverage, and architectural conformity.

### Overall Health: FAIR (Conditional) ⚠

**Note**: 'FAIR' reflects current architecture and test posture. CI/CD gating is stricter and requires higher thresholds for automated deployment gates.

| Metric | Value | Status | Classification |
|--------|-------|--------|-----------------|
| Conformity Score | 87.50% | ⚠️  FAIR| Governance: CONDITIONAL|
| Test Coverage | 85.25% | ✅ GOOD| Risk: LOW|
| Maintainability | 72.23/100 | 🟡 FAIR| Grade: B|
| Code Duplication | 78.30% | ❌ VERY HIGH| Action: Refactor|

---


╔══════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
║                    SYMPHONIC CODE ANALYSIS ARCHITECTURE - RENDERX WEB ORCHESTRATION                         ║
║                    Enhanced Handler Portfolio & Orchestration Framework                                          ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝

┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  📊 CODEBASE METRICS FOUNDATION                                                                                 │
│  ═════════════════════════════════════════════════════════════════════════════════════════════════════════════   │
│  │ Total Files: 790 │ Total LOC: 5045  │ Handlers: 529│ Avg LOC/Handler: 9.54 │ Coverage: 85.25% │           │
│  ╰─────────────────────────────────────────────────────────────────────────────────────────────────────────────  │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

╔════ HANDLER PORTFOLIO METRICS ════╗
║ Files           : 790           ║
║ Total LOC       : 5045          ║
║ Handlers        : 529           ║
║ Avg LOC/Handler : 9.5           ║
║ Coverage        : 85.3%         ║
║ Duplication     : 0             ║
║ Maintainability : 72.2          ║
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
        │ 790  files           │ LOC metrics           │ coverage
        │                      │                      │
        └──────────┬───────────┴──────────┬───────────┘
                   │                      │
                   ▼                      ▼
        ╔══════════════════╗  ╔══════════════════╗
        │  DATA BATON 🎭   │  │  DATA BATON 🎭   │
        ├──────────────────┤  ├──────────────────┤
        │ • Files: 790     │  │ • Handlers: 529 │
        │ • LOC: 5045      │  │ • Avg LOC: 9.54 │
        │ • Beats: 4/4 ✓   │  │ • Coverage: 85.3%│
        │ • Status: READY  │  │ • Status: READY  │
        └────────┬─────────┘  └────────┬─────────┘
                 │                     │
                 └──────────┬──────────┘
                            │
                            ▼

╔════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: CREATE                                            ║
║ Domain : renderx-web-orchestration                                  ║
║ Package: canvas-component                                           ║
║ Scope : 1 Symphony · 9 Movements · 34 Beats · 34 Handlers           ║
║ Health: 324 LOC · Avg Cov 85% · Size Band: LARGE · Risk: LOW        ║
╠════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                        ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                   ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.4               ║
║   Focus: template     Focus: styling     Focus: import + payload    ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════╣
║ Beat Mov Handler                      LOC  Sz  Cov  Risk  Baton     ║
║ ─────────────────────────────────────────────────────────────────── ║
║ 1.1  M1  resolveTemplate                11  S    88% LOW   start    ║
║ 1.2  M1  injectCssFallback               9  S    80% LOW   metrics  ║
║ 1.3  M1  injectRawCss                    8  S    76% LOW   metrics  ║
║ 1.4  M1  appendTo                       10  S    88% LOW   metrics  ║
║      🎭 Data Baton ▸ handoff: template + CSS metrics                ║
║ 2.1  M2  applyClasses                    9  S    91% LOW   style    ║
║ 2.2  M2  applyInlineStyle               11  S    77% LOW   style    ║
║ 2.3  M2  createElementWithId            10  S    93% LOW   style    ║
║ 2.4  M2  getCanvasOrThrow               10  S    75% LOW   style    ║
║ 3.1  M3  attachStandardImportInteracti   8  S    66% MED   import   ║
║ 3.2  M3  createFromImportRecord          9  S    73% MED   import   ║
║ 3.3  M3  toCreatePayloadFromData        10  S    86% LOW   import   ║
║ 3.4  M3  transformClipboardToCreatePay   9  S    86% LOW   payload  ║
║ 4.1  M4  transformImportToCreatePayloa  10  S    87% LOW   payload  ║
║ 4.2  M4  attachDrag                      9  S    85% LOW   payload  ║
║ 4.3  M4  attachSelection                11  S    95% LOW   payload  ║
║ 4.4  M4  attachSvgNodeClick              9  S    79% LOW   payload  ║
║ 5.1  M5  derivePath                     11  S    89% LOW   payload  ║
║ 5.2  M5  registerInstance               10  S    90% LOW   payload  ║
║ 5.3  M5  notifyUi                        8  S    67% MED   payload  ║
║ 5.4  M5  cleanupReactRoot                8  S    66% MED   payload  ║
║ 6.1  M6  compileReactCode                9  S    73% MED   payload  ║
║ 6.2  M6  escapeHtml                      9  S    88% LOW   payload  ║
║ 6.3  M6  exposeEventRouterToReact        9  S    90% LOW   payload  ║
║ 6.4  M6  getDiagnosticsEmitter           9  S    82% LOW   payload  ║
║ 7.1  M7  getMetricsCollector             9  S    66% MED   payload  ║
║ 7.2  M7  renderReact                    10  S    68% MED   payload  ║
║ 7.3  M7  applyContentProperties          9  S    93% LOW   payload  ║
║ 7.4  M7  createNode                     11  S    76% LOW   payload  ║
║ 8.1  M8  create                         11  S    73% MED   payload  ║
║ 8.2  M8  computeCssVarBlock              8  S    76% LOW   payload  ║
║ 8.3  M8  computeInlineStyle             11  S    70% MED   payload  ║
║ 8.4  M8  computeInstanceClass            8  S    89% LOW   payload  ║
║ 9.1  M9  validateReactCode              10  S    75% LOW   payload  ║
║ 9.2  M9  validateReactCodeOrThrow        8  S    72% MED   payload  ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════╣
║ Size Bands    : Tiny 19 · Small 15 · Medium 0 · Large 0 · XL 0      ║
║ Coverage Dist.: 0–30% 0 · 30–60% 0 · 60–80% 17 · 80–100% 17         ║
║ Risk Summary  : CRITICAL 0 · HIGH 0 · MEDIUM 10 · LOW 24            ║
╚════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: SELECT                                            ║
║ Domain : renderx-web-orchestration                                  ║
║ Package: canvas-component                                           ║
║ Scope : 1 Symphony · 7 Movements · 28 Beats · 28 Handlers           ║
║ Health: 267 LOC · Avg Cov 85% · Size Band: MEDIUM · Risk: LOW       ║
╠════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                        ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                   ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.4               ║
║   Focus: template     Focus: styling     Focus: import + payload    ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════╣
║ Beat Mov Handler                      LOC  Sz  Cov  Risk  Baton     ║
║ ─────────────────────────────────────────────────────────────────── ║
║ 1.1  M1  ensureOverlayCss                9  S    77% LOW   start    ║
║ 1.2  M1  applyOverlayRectForEl          10  S    85% LOW   metrics  ║
║ 1.3  M1  ensureOverlay                  11  S    78% LOW   metrics  ║
║ 1.4  M1  getCanvasOrThrow                8  S    73% MED   metrics  ║
║      🎭 Data Baton ▸ handoff: template + CSS metrics                ║
║ 2.1  M2  getCanvasRect                  10  S    89% LOW   style    ║
║ 2.2  M2  createOverlayStructure          8  S    74% MED   style    ║
║ 2.3  M2  readCssNumber                   9  S    78% LOW   style    ║
║ 2.4  M2  resolveEndpoints                8  S    70% MED   style    ║
║ 3.1  M3  attachAdvancedLineManipHandle  11  S    68% MED   import   ║
║ 3.2  M3  ensureAdvancedLineCss          11  S    82% LOW   import   ║
║ 3.3  M3  ensureAdvancedLineOverlayFor   10  S    78% LOW   import   ║
║ 3.4  M3  attachLineResizeHandlers        8  S    75% LOW   payload  ║
║ 4.1  M4  ensureLineCss                   8  S    78% LOW   payload  ║
║ 4.2  M4  ensureLineOverlayFor            9  S    72% MED   payload  ║
║ 4.3  M4  attachResizeHandlers            8  S    84% LOW   payload  ║
║ 4.4  M4  getDiagnosticsEmitter          11  S    84% LOW   payload  ║
║ 5.1  M5  getResizeConfig                11  S    70% MED   payload  ║
║ 5.2  M5  readNumericPx                   9  S    93% LOW   payload  ║
║ 5.3  M5  configureHandlesVisibility     10  S    81% LOW   payload  ║
║ 5.4  M5  deriveSelectedId               10  S    83% LOW   payload  ║
║ 6.1  M6  select                          9  S    68% MED   payload  ║
║ 6.2  M6  hideSelectionOverlay           10  S    77% LOW   payload  ║
║ 6.3  M6  notifyUi                       11  S    70% MED   payload  ║
║ 6.4  M6  publishSelectionChanged         9  S    87% LOW   payload  ║
║ 7.1  M7  routeSelectionRequest          11  S    87% LOW   payload  ║
║ 7.2  M7  showSelectionOverlay            8  S    87% LOW   payload  ║
║ 7.3  M7  select.svg_node                11  S    83% LOW   payload  ║
║ 7.4  M7  showSvgNodeOverlay              8  S    70% MED   payload  ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════╣
║ Size Bands    : Tiny 14 · Small 14 · Medium 0 · Large 0 · XL 0      ║
║ Coverage Dist.: 0–30% 0 · 30–60% 0 · 60–80% 16 · 80–100% 12         ║
║ Risk Summary  : CRITICAL 0 · HIGH 0 · MEDIUM 9 · LOW 19             ║
╚════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: UI                                                ║
║ Domain : renderx-web-orchestration                                  ║
║ Package: control-panel                                              ║
║ Scope : 1 Symphony · 6 Movements · 24 Beats · 24 Handlers           ║
║ Health: 229 LOC · Avg Cov 85% · Size Band: MEDIUM · Risk: LOW       ║
╠════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                        ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                   ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.4               ║
║   Focus: template     Focus: styling     Focus: import + payload    ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════╣
║ Beat Mov Handler                      LOC  Sz  Cov  Risk  Baton     ║
║ ─────────────────────────────────────────────────────────────────── ║
║ 1.1  M1  awaitRefresh                   11  S    82% LOW   start    ║
║ 1.2  M1  dispatchField                  11  S    92% LOW   metrics  ║
║ 1.3  M1  generateFields                 10  S    92% LOW   metrics  ║
║ 1.4  M1  generateSections               10  S    93% LOW   metrics  ║
║      🎭 Data Baton ▸ handoff: template + CSS metrics                ║
║ 2.1  M2  initConfig                      9  S    70% MED   style    ║
║ 2.2  M2  initMovement                   10  S    94% LOW   style    ║
║ 2.3  M2  initResolver                   10  S    83% LOW   style    ║
║ 2.4  M2  loadSchemas                     9  S    66% MED   style    ║
║ 3.1  M3  mergeErrors                     9  S    78% LOW   import   ║
║ 3.2  M3  notifyReady                    10  S    73% MED   import   ║
║ 3.3  M3  prepareField                    9  S    79% LOW   import   ║
║ 3.4  M3  registerObservers               8  S    75% LOW   payload  ║
║ 4.1  M4  renderView                      8  S    70% MED   payload  ║
║ 4.2  M4  setDirty                        9  S    66% MED   payload  ║
║ 4.3  M4  toggleSection                  10  S    92% LOW   payload  ║
║ 4.4  M4  updateView                      9  S    66% MED   payload  ║
║ 5.1  M5  validateField                   8  S    80% LOW   payload  ║
║ 5.2  M5  ui.symphony                     9  S    82% LOW   payload  ║
║ 5.3  M5  coerceTheme                    11  S    74% MED   payload  ║
║ 5.4  M5  getCurrentTheme                11  S    69% MED   payload  ║
║ 6.1  M6  safeGetStoredTheme              9  S    79% LOW   payload  ║
║ 6.2  M6  safeSetStoredTheme             11  S    85% LOW   payload  ║
║ 6.3  M6  toggleTheme                    10  S    82% LOW   payload  ║
║ 6.4  M6  ui.symphony                    11  S    77% LOW   payload  ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════╣
║ Size Bands    : Tiny 11 · Small 13 · Medium 0 · Large 0 · XL 0      ║
║ Coverage Dist.: 0–30% 0 · 30–60% 0 · 60–80% 13 · 80–100% 11         ║
║ Risk Summary  : CRITICAL 0 · HIGH 0 · MEDIUM 8 · LOW 16             ║
╚════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: EXPORT                                            ║
║ Domain : renderx-web-orchestration                                  ║
║ Package: canvas-component                                           ║
║ Scope : 1 Symphony · 4 Movements · 14 Beats · 14 Handlers           ║
║ Health: 134 LOC · Avg Cov 85% · Size Band: SMALL · Risk: LOW        ║
╠════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                        ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                   ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.4               ║
║   Focus: template     Focus: styling     Focus: import + payload    ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════╣
║ Beat Mov Handler                      LOC  Sz  Cov  Risk  Baton     ║
║ ─────────────────────────────────────────────────────────────────── ║
║ 1.1  M1  collectCssClasses              11  S    93% LOW   start    ║
║ 1.2  M1  discoverComponentsFromDom       9  S    94% LOW   metrics  ║
║ 1.3  M1  downloadUiFile                  9  S    88% LOW   metrics  ║
║ 1.4  M1  exportSvgToGif                 11  S    68% MED   metrics  ║
║      🎭 Data Baton ▸ handoff: template + CSS metrics                ║
║ 2.1  M2  makeGifEncoder                 10  S    77% LOW   style    ║
║ 2.2  M2  export.gif.symphony             9  S    69% MED   style    ║
║ 2.3  M2  queryAllComponents             10  S    95% LOW   style    ║
║ 2.4  M2  createMP4Encoder               11  S    71% MED   style    ║
║ 3.1  M3  exportSvgToMp4                 10  S    90% LOW   import   ║
║ 3.2  M3  export.mp4.symphony            10  S    94% LOW   import   ║
║ 3.3  M3  buildUiFileContent             10  S    71% MED   import   ║
║ 3.4  M3  collectLayoutData               9  S    86% LOW   payload  ║
║ 4.1  M4  extractElementContent           8  S    92% LOW   payload  ║
║ 4.2  M4  export.symphony                 9  S    71% MED   payload  ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════╣
║ Size Bands    : Tiny 6 · Small 8 · Medium 0 · Large 0 · XL 0        ║
║ Coverage Dist.: 0–30% 0 · 30–60% 0 · 60–80% 6 · 80–100% 8           ║
║ Risk Summary  : CRITICAL 0 · HIGH 0 · MEDIUM 5 · LOW 9              ║
╚════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: INITIALIZE                                        ║
║ Domain : renderx-web-orchestration                                  ║
║ Package: musical-conductor                                          ║
║ Scope : 1 Symphony · 4 Movements · 14 Beats · 14 Handlers           ║
║ Health: 134 LOC · Avg Cov 85% · Size Band: SMALL · Risk: LOW        ║
╠════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                        ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                   ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.4               ║
║   Focus: template     Focus: styling     Focus: import + payload    ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════╣
║ Beat Mov Handler                      LOC  Sz  Cov  Risk  Baton     ║
║ ─────────────────────────────────────────────────────────────────── ║
║ 1.1  M1  bootstrapLogging                9  S    73% MED   start    ║
║ 1.2  M1  checkExistingInstance          11  S    76% LOW   metrics  ║
║ 1.3  M1  connectSystems                  9  S    71% MED   metrics  ║
║ 1.4  M1  createConductor                 9  S    76% LOW   metrics  ║
║      🎭 Data Baton ▸ handoff: template + CSS metrics                ║
║ 2.1  M2  exposeFacade                    9  S    88% LOW   style    ║
║ 2.2  M2  getCommunicationSystemInstanc   9  S    82% LOW   style    ║
║ 2.3  M2  initialize                     10  S    76% LOW   style    ║
║ 2.4  M2  isCommunicationSystemInitiali   9  S    87% LOW   style    ║
║ 3.1  M3  loadSequences                   9  S    80% LOW   import   ║
║ 3.2  M3  markInitialized                 8  S    66% MED   import   ║
║ 3.3  M3  notifyReady                    11  S    88% LOW   import   ║
║ 3.4  M3  resetCommunicationSystem       10  S    74% MED   payload  ║
║ 4.1  M4  validateEnvironment             8  S    86% LOW   payload  ║
║ 4.2  M4  validateRegistrations          10  S    94% LOW   payload  ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════╣
║ Size Bands    : Tiny 9 · Small 5 · Medium 0 · Large 0 · XL 0        ║
║ Coverage Dist.: 0–30% 0 · 30–60% 0 · 60–80% 7 · 80–100% 7           ║
║ Risk Summary  : CRITICAL 0 · HIGH 0 · MEDIUM 4 · LOW 10             ║
╚════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: BUILD PIPELINE                                    ║
║ Domain : renderx-web-orchestration                                  ║
║ Package: orchestration                                              ║
║ Scope : 1 Symphony · 4 Movements · 14 Beats · 14 Handlers           ║
║ Health: 134 LOC · Avg Cov 85% · Size Band: SMALL · Risk: LOW        ║
╠════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                        ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                   ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.4               ║
║   Focus: template     Focus: styling     Focus: import + payload    ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════╣
║ Beat Mov Handler                      LOC  Sz  Cov  Risk  Baton     ║
║ ─────────────────────────────────────────────────────────────────── ║
║ 1.1  M1  loadBuildContext               11  S    80% LOW   start    ║
║ 1.2  M1  recordValidationResults        10  S    66% MED   metrics  ║
║ 1.3  M1  validateAgentBehavior           8  S    89% LOW   metrics  ║
║ 1.4  M1  validateGovernanceRules        11  S    91% LOW   metrics  ║
║      🎭 Data Baton ▸ handoff: template + CSS metrics                ║
║ 2.1  M2  validateOrchestrationDomains    9  S    78% LOW   style    ║
║ 2.2  M2  generateManifests              10  S    70% MED   style    ║
║ 2.3  M2  recordManifestState             8  S    69% MED   style    ║
║ 2.4  M2  regenerateOrchestrationDomain  11  S    80% LOW   style    ║
║ 3.1  M3  syncJsonSources                10  S    73% MED   import   ║
║ 3.2  M3  validateManifestIntegrity       9  S    68% MED   import   ║
║ 3.3  M3  buildComponentsPackage          8  S    84% LOW   import   ║
║ 3.4  M3  buildHostSdkPackage            11  S    88% LOW   payload  ║
║ 4.1  M4  buildMusicalConductorPackage    9  S    84% LOW   payload  ║
║ 4.2  M4  initializePackageBuild         10  S    75% LOW   payload  ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════╣
║ Size Bands    : Tiny 6 · Small 8 · Medium 0 · Large 0 · XL 0        ║
║ Coverage Dist.: 0–30% 0 · 30–60% 0 · 60–80% 7 · 80–100% 7           ║
║ Risk Summary  : CRITICAL 0 · HIGH 0 · MEDIUM 5 · LOW 9              ║
╚════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: DRAG                                              ║
║ Domain : renderx-web-orchestration                                  ║
║ Package: canvas-component                                           ║
║ Scope : 1 Symphony · 4 Movements · 13 Beats · 13 Handlers           ║
║ Health: 124 LOC · Avg Cov 85% · Size Band: SMALL · Risk: LOW        ║
╠════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                        ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                   ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.4               ║
║   Focus: template     Focus: styling     Focus: import + payload    ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════╣
║ Beat Mov Handler                      LOC  Sz  Cov  Risk  Baton     ║
║ ─────────────────────────────────────────────────────────────────── ║
║ 1.1  M1  endDrag                        11  S    87% LOW   start    ║
║ 1.2  M1  forwardToControlPanel           8  S    88% LOW   metrics  ║
║ 1.3  M1  drag                           10  S    91% LOW   metrics  ║
║ 1.4  M1  startDrag                      11  S    70% MED   metrics  ║
║      🎭 Data Baton ▸ handoff: template + CSS metrics                ║
║ 2.1  M2  updatePosition                  9  S    87% LOW   style    ║
║ 2.2  M2  drag.symphony                  11  S    74% MED   style    ║
║ 2.3  M2  applyTemplateStyles            11  S    72% MED   style    ║
║ 2.4  M2  computeCursorOffsets           10  S    89% LOW   style    ║
║ 3.1  M3  computeGhostSize               10  S    65% MED   import   ║
║ 3.2  M3  createGhostContainer            9  S    82% LOW   import   ║
║ 3.3  M3  ensurePayload                  11  S    84% LOW   import   ║
║ 3.4  M3  installDragImage                8  S    70% MED   payload  ║
║ 4.1  M4  renderTemplatePreview          11  S    95% LOW   payload  ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════╣
║ Size Bands    : Tiny 4 · Small 9 · Medium 0 · Large 0 · XL 0        ║
║ Coverage Dist.: 0–30% 0 · 30–60% 0 · 60–80% 5 · 80–100% 8           ║
║ Risk Summary  : CRITICAL 0 · HIGH 0 · MEDIUM 5 · LOW 8              ║
╚════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: RESIZE                                            ║
║ Domain : renderx-web-orchestration                                  ║
║ Package: canvas-component                                           ║
║ Scope : 1 Symphony · 3 Movements · 12 Beats · 12 Handlers           ║
║ Health: 114 LOC · Avg Cov 85% · Size Band: SMALL · Risk: LOW        ║
╠════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                        ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                   ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.4               ║
║   Focus: template     Focus: styling     Focus: import + payload    ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════╣
║ Beat Mov Handler                      LOC  Sz  Cov  Risk  Baton     ║
║ ─────────────────────────────────────────────────────────────────── ║
║ 1.1  M1  resize.end.symphony             9  S    86% LOW   start    ║
║ 1.2  M1  resize.move.symphony            9  S    94% LOW   metrics  ║
║ 1.3  M1  clamp                          10  S    69% MED   metrics  ║
║ 1.4  M1  endResize                       9  S    86% LOW   metrics  ║
║      🎭 Data Baton ▸ handoff: template + CSS metrics                ║
║ 2.1  M2  getResizeConfig                 8  S    72% MED   style    ║
║ 2.2  M2  resize                         10  S    73% MED   style    ║
║ 2.3  M2  readCssNumber                  11  S    74% MED   style    ║
║ 2.4  M2  startResize                    11  S    77% LOW   style    ║
║ 3.1  M3  updateSize                     11  S    86% LOW   import   ║
║ 3.2  M3  writeCssNumber                 11  S    87% LOW   import   ║
║ 3.3  M3  resize.start.symphony          10  S    90% LOW   import   ║
║ 3.4  M3  resize.symphony                 8  S    83% LOW   payload  ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════╣
║ Size Bands    : Tiny 5 · Small 7 · Medium 0 · Large 0 · XL 0        ║
║ Coverage Dist.: 0–30% 0 · 30–60% 0 · 60–80% 5 · 80–100% 7           ║
║ Risk Summary  : CRITICAL 0 · HIGH 0 · MEDIUM 4 · LOW 8              ║
╚════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: AUGMENT                                           ║
║ Domain : renderx-web-orchestration                                  ║
║ Package: canvas-component                                           ║
║ Scope : 1 Symphony · 3 Movements · 11 Beats · 11 Handlers           ║
║ Health: 105 LOC · Avg Cov 85% · Size Band: SMALL · Risk: LOW        ║
╠════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                        ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                   ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.3               ║
║   Focus: template     Focus: styling     Focus: import + payload    ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════╣
║ Beat Mov Handler                      LOC  Sz  Cov  Risk  Baton     ║
║ ─────────────────────────────────────────────────────────────────── ║
║ 1.1  M1  enhanceLine                     8  S    75% LOW   start    ║
║ 1.2  M1  ensureLineMarkers               9  S    87% LOW   metrics  ║
║ 1.3  M1  ensureCurve                     8  S    67% MED   metrics  ║
║ 1.4  M1  ensureLine                      9  S    86% LOW   metrics  ║
║      🎭 Data Baton ▸ handoff: template + CSS metrics                ║
║ 2.1  M2  fmt                            10  S    88% LOW   style    ║
║ 2.2  M2  readBooleanVar                  8  S    83% LOW   style    ║
║ 2.3  M2  readCssNumber                  10  S    90% LOW   style    ║
║ 2.4  M2  recomputeLineSvg                9  S    81% LOW   style    ║
║ 3.1  M3  resolveSize                    11  S    84% LOW   import   ║
║ 3.2  M3  toVbX                          11  S    87% LOW   import   ║
║ 3.3  M3  toVbY                          10  S    90% LOW   import   ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════╣
║ Size Bands    : Tiny 6 · Small 5 · Medium 0 · Large 0 · XL 0        ║
║ Coverage Dist.: 0–30% 0 · 30–60% 0 · 60–80% 2 · 80–100% 9           ║
║ Risk Summary  : CRITICAL 0 · HIGH 0 · MEDIUM 1 · LOW 10             ║
╚════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: EXECUTE SEQUENCE                                  ║
║ Domain : renderx-web-orchestration                                  ║
║ Package: musical-conductor                                          ║
║ Scope : 1 Symphony · 3 Movements · 11 Beats · 11 Handlers           ║
║ Health: 105 LOC · Avg Cov 85% · Size Band: SMALL · Risk: LOW        ║
╠════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                        ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                   ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.3               ║
║   Focus: template     Focus: styling     Focus: import + payload    ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════╣
║ Beat Mov Handler                      LOC  Sz  Cov  Risk  Baton     ║
║ ─────────────────────────────────────────────────────────────────── ║
║ 1.1  M1  checkResources                 10  S    65% MED   start    ║
║ 1.2  M1  cleanupResources                8  S    75% LOW   metrics  ║
║ 1.3  M1  enqueueSequence                10  S    77% LOW   metrics  ║
║ 1.4  M1  handleBeatComplete             10  S    74% MED   metrics  ║
║      🎭 Data Baton ▸ handoff: template + CSS metrics                ║
║ 2.1  M2  execute_sequence                9  S    72% MED   style    ║
║ 2.2  M2  notifyComplete                  9  S    75% LOW   style    ║
║ 2.3  M2  processBeat                    11  S    75% LOW   style    ║
║ 2.4  M2  recordMetrics                   8  S    68% MED   style    ║
║ 3.1  M3  startExecution                  9  S    72% MED   import   ║
║ 3.2  M3  updateStatistics                8  S    69% MED   import   ║
║ 3.3  M3  validateRequest                10  S    83% LOW   import   ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════╣
║ Size Bands    : Tiny 6 · Small 5 · Medium 0 · Large 0 · XL 0        ║
║ Coverage Dist.: 0–30% 0 · 30–60% 0 · 60–80% 10 · 80–100% 1          ║
║ Risk Summary  : CRITICAL 0 · HIGH 0 · MEDIUM 6 · LOW 5              ║
╚════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: MONITOR                                           ║
║ Domain : renderx-web-orchestration                                  ║
║ Package: musical-conductor                                          ║
║ Scope : 1 Symphony · 3 Movements · 11 Beats · 11 Handlers           ║
║ Health: 105 LOC · Avg Cov 85% · Size Band: SMALL · Risk: LOW        ║
╠════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                        ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                   ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.3               ║
║   Focus: template     Focus: styling     Focus: import + payload    ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════╣
║ Beat Mov Handler                      LOC  Sz  Cov  Risk  Baton     ║
║ ─────────────────────────────────────────────────────────────────── ║
║ 1.1  M1  checkEventBusHealth            11  S    90% LOW   start    ║
║ 1.2  M1  checkExecutionHealth           10  S    92% LOW   metrics  ║
║ 1.3  M1  generateStatusReport           10  S    70% MED   metrics  ║
║ 1.4  M1  getConductorStatus             11  S    78% LOW   metrics  ║
║      🎭 Data Baton ▸ handoff: template + CSS metrics                ║
║ 2.1  M2  getDuplicationReport           10  S    92% LOW   style    ║
║ 2.2  M2  getPerformanceMetrics           9  S    71% MED   style    ║
║ 2.3  M2  getQueueStatus                  9  S    90% LOW   style    ║
║ 2.4  M2  getSequenceCount               10  S    82% LOW   style    ║
║ 3.1  M3  getStatistics                   9  S    75% LOW   import   ║
║ 3.2  M3  monitor                        10  S    76% LOW   import   ║
║ 3.3  M3  logHealthSummary               11  S    92% LOW   import   ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════╣
║ Size Bands    : Tiny 3 · Small 8 · Medium 0 · Large 0 · XL 0        ║
║ Coverage Dist.: 0–30% 0 · 30–60% 0 · 60–80% 5 · 80–100% 6           ║
║ Risk Summary  : CRITICAL 0 · HIGH 0 · MEDIUM 2 · LOW 9              ║
╚════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: VALIDATE PLUGIN                                   ║
║ Domain : renderx-web-orchestration                                  ║
║ Package: musical-conductor                                          ║
║ Scope : 1 Symphony · 3 Movements · 11 Beats · 11 Handlers           ║
║ Health: 105 LOC · Avg Cov 85% · Size Band: SMALL · Risk: LOW        ║
╠════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                        ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                   ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.3               ║
║   Focus: template     Focus: styling     Focus: import + payload    ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════╣
║ Beat Mov Handler                      LOC  Sz  Cov  Risk  Baton     ║
║ ─────────────────────────────────────────────────────────────────── ║
║ 1.1  M1  checkManifest                  10  S    69% MED   start    ║
║ 1.2  M1  checkResourceRequirements      10  S    81% LOW   metrics  ║
║ 1.3  M1  checkSPACompliance             10  S    93% LOW   metrics  ║
║ 1.4  M1  generateValidationReport        8  S    65% MED   metrics  ║
║      🎭 Data Baton ▸ handoff: template + CSS metrics                ║
║ 2.1  M2  validate_plugin                10  S    74% MED   style    ║
║ 2.2  M2  logResults                     10  S    70% MED   style    ║
║ 2.3  M2  validateHandlerContracts       10  S    88% LOW   style    ║
║ 2.4  M2  validatePluginShape            10  S    92% LOW   style    ║
║ 3.1  M3  validatePriorities             11  S    94% LOW   import   ║
║ 3.2  M3  verifyBeatMapping               9  S    90% LOW   import   ║
║ 3.3  M3  verifyExports                  10  S    66% MED   import   ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════╣
║ Size Bands    : Tiny 2 · Small 9 · Medium 0 · Large 0 · XL 0        ║
║ Coverage Dist.: 0–30% 0 · 30–60% 0 · 60–80% 5 · 80–100% 6           ║
║ Risk Summary  : CRITICAL 0 · HIGH 0 · MEDIUM 5 · LOW 6              ║
╚════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: LINE ADVANCED                                     ║
║ Domain : renderx-web-orchestration                                  ║
║ Package: canvas-component                                           ║
║ Scope : 1 Symphony · 3 Movements · 9 Beats · 9 Handlers             ║
║ Health: 86 LOC · Avg Cov 85% · Size Band: SMALL · Risk: LOW         ║
╠════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                        ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                   ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1               ║
║   Focus: template     Focus: styling     Focus: import + payload    ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════╣
║ Beat Mov Handler                      LOC  Sz  Cov  Risk  Baton     ║
║ ─────────────────────────────────────────────────────────────────── ║
║ 1.1  M1  line.manip.end.symphony         8  S    95% LOW   start    ║
║ 1.2  M1  line.manip.move.symphony       11  S    86% LOW   metrics  ║
║ 1.3  M1  endLineManip                   10  S    80% LOW   metrics  ║
║ 1.4  M1  moveLineManip                  10  S    67% MED   metrics  ║
║      🎭 Data Baton ▸ handoff: template + CSS metrics                ║
║ 2.1  M2  startLineManip                  8  S    78% LOW   style    ║
║ 2.2  M2  updateCurve                     8  S    70% MED   style    ║
║ 2.3  M2  updateEndpoint                 10  S    65% MED   style    ║
║ 2.4  M2  updateRotate                    8  S    87% LOW   style    ║
║ 3.1  M3  line.manip.start.symphony      11  S    94% LOW   import   ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════╣
║ Size Bands    : Tiny 4 · Small 5 · Medium 0 · Large 0 · XL 0        ║
║ Coverage Dist.: 0–30% 0 · 30–60% 0 · 60–80% 4 · 80–100% 5           ║
║ Risk Summary  : CRITICAL 0 · HIGH 0 · MEDIUM 3 · LOW 6              ║
╚════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: CSS MANAGEMENT                                    ║
║ Domain : renderx-web-orchestration                                  ║
║ Package: control-panel                                              ║
║ Scope : 1 Symphony · 3 Movements · 9 Beats · 9 Handlers             ║
║ Health: 86 LOC · Avg Cov 85% · Size Band: SMALL · Risk: LOW         ║
╠════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                        ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                   ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1               ║
║   Focus: template     Focus: styling     Focus: import + payload    ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════╣
║ Beat Mov Handler                      LOC  Sz  Cov  Risk  Baton     ║
║ ─────────────────────────────────────────────────────────────────── ║
║ 1.1  M1  applyCssClassToElement          8  S    66% MED   start    ║
║ 1.2  M1  createCssClass                 10  S    77% LOW   metrics  ║
║ 1.3  M1  deleteCssClass                 11  S    85% LOW   metrics  ║
║ 1.4  M1  getCssClass                     9  S    73% MED   metrics  ║
║      🎭 Data Baton ▸ handoff: template + CSS metrics                ║
║ 2.1  M2  listCssClasses                 10  S    85% LOW   style    ║
║ 2.2  M2  removeClassFromAllElements      9  S    80% LOW   style    ║
║ 2.3  M2  removeCssClassFromElement      11  S    74% MED   style    ║
║ 2.4  M2  updateCssClass                  9  S    92% LOW   style    ║
║ 3.1  M3  css_management.symphony        10  S    72% MED   import   ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════╣
║ Size Bands    : Tiny 4 · Small 5 · Medium 0 · Large 0 · XL 0        ║
║ Coverage Dist.: 0–30% 0 · 30–60% 0 · 60–80% 5 · 80–100% 4           ║
║ Risk Summary  : CRITICAL 0 · HIGH 0 · MEDIUM 4 · LOW 5              ║
╚════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: REGISTER SEQUENCE                                 ║
║ Domain : renderx-web-orchestration                                  ║
║ Package: musical-conductor                                          ║
║ Scope : 1 Symphony · 3 Movements · 9 Beats · 9 Handlers             ║
║ Health: 86 LOC · Avg Cov 85% · Size Band: SMALL · Risk: LOW         ║
╠════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                        ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                   ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1               ║
║   Focus: template     Focus: styling     Focus: import + payload    ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════╣
║ Beat Mov Handler                      LOC  Sz  Cov  Risk  Baton     ║
║ ─────────────────────────────────────────────────────────────────── ║
║ 1.1  M1  checkDuplicates                 9  S    70% MED   start    ║
║ 1.2  M1  register_sequence              11  S    83% LOW   metrics  ║
║ 1.3  M1  logRegistrationDetails         10  S    79% LOW   metrics  ║
║ 1.4  M1  notifyRegistered                9  S    92% LOW   metrics  ║
║      🎭 Data Baton ▸ handoff: template + CSS metrics                ║
║ 2.1  M2  registerWithRegistry           10  S    70% MED   style    ║
║ 2.2  M2  updateEventMappings            10  S    70% MED   style    ║
║ 2.3  M2  validateBeats                  11  S    76% LOW   style    ║
║ 2.4  M2  validateSequenceShape          11  S    94% LOW   style    ║
║ 3.1  M3  verifyAvailability              9  S    78% LOW   import   ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════╣
║ Size Bands    : Tiny 3 · Small 6 · Medium 0 · Large 0 · XL 0        ║
║ Coverage Dist.: 0–30% 0 · 30–60% 0 · 60–80% 6 · 80–100% 3           ║
║ Risk Summary  : CRITICAL 0 · HIGH 0 · MEDIUM 3 · LOW 6              ║
╚════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: DESELECT                                          ║
║ Domain : renderx-web-orchestration                                  ║
║ Package: canvas-component                                           ║
║ Scope : 1 Symphony · 3 Movements · 8 Beats · 8 Handlers             ║
║ Health: 76 LOC · Avg Cov 85% · Size Band: SMALL · Risk: LOW         ║
╠════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                        ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                   ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1               ║
║   Focus: template     Focus: styling     Focus: import + payload    ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════╣
║ Beat Mov Handler                      LOC  Sz  Cov  Risk  Baton     ║
║ ─────────────────────────────────────────────────────────────────── ║
║ 1.1  M1  clearAllSelections              9  S    68% MED   start    ║
║ 1.2  M1  deselectComponent              11  S    89% LOW   metrics  ║
║ 1.3  M1  deselect                       11  S    69% MED   metrics  ║
║ 1.4  M1  hideAllOverlays                10  S    66% MED   metrics  ║
║      🎭 Data Baton ▸ handoff: template + CSS metrics                ║
║ 2.1  M2  hideOverlayById                 9  S    74% MED   style    ║
║ 2.2  M2  publishDeselectionChanged       8  S    72% MED   style    ║
║ 2.3  M2  publishSelectionsCleared       10  S    84% LOW   style    ║
║ 2.4  M2  routeDeselectionRequest        11  S    68% MED   style    ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════╣
║ Size Bands    : Tiny 3 · Small 5 · Medium 0 · Large 0 · XL 0        ║
║ Coverage Dist.: 0–30% 0 · 30–60% 0 · 60–80% 6 · 80–100% 2           ║
║ Risk Summary  : CRITICAL 0 · HIGH 0 · MEDIUM 6 · LOW 2              ║
╚════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: IMPORT                                            ║
║ Domain : renderx-web-orchestration                                  ║
║ Package: canvas-component                                           ║
║ Scope : 1 Symphony · 3 Movements · 8 Beats · 8 Handlers             ║
║ Health: 76 LOC · Avg Cov 85% · Size Band: SMALL · Risk: LOW         ║
╠════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                        ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                   ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1               ║
║   Focus: template     Focus: styling     Focus: import + payload    ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════╣
║ Beat Mov Handler                      LOC  Sz  Cov  Risk  Baton     ║
║ ─────────────────────────────────────────────────────────────────── ║
║ 1.1  M1  injectCssClasses               11  S    80% LOW   start    ║
║ 1.2  M1  openUiFile                      8  S    92% LOW   metrics  ║
║ 1.3  M1  registerInstances               9  S    88% LOW   metrics  ║
║ 1.4  M1  applyHierarchyAndOrder         11  S    79% LOW   metrics  ║
║      🎭 Data Baton ▸ handoff: template + CSS metrics                ║
║ 2.1  M2  createComponentsSequentially    8  S    78% LOW   style    ║
║ 2.2  M2  loadComponentTemplate          10  S    74% MED   style    ║
║ 2.3  M2  parseUiFile                    11  S    68% MED   style    ║
║ 2.4  M2  import.symphony                 9  S    70% MED   style    ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════╣
║ Size Bands    : Tiny 4 · Small 4 · Medium 0 · Large 0 · XL 0        ║
║ Coverage Dist.: 0–30% 0 · 30–60% 0 · 60–80% 5 · 80–100% 3           ║
║ Risk Summary  : CRITICAL 0 · HIGH 0 · MEDIUM 3 · LOW 5              ║
╚════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: RESIZE LINE                                       ║
║ Domain : renderx-web-orchestration                                  ║
║ Package: canvas-component                                           ║
║ Scope : 1 Symphony · 3 Movements · 7 Beats · 7 Handlers             ║
║ Health: 67 LOC · Avg Cov 85% · Size Band: SMALL · Risk: LOW         ║
╠════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                        ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                   ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1               ║
║   Focus: template     Focus: styling     Focus: import + payload    ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════╣
║ Beat Mov Handler                      LOC  Sz  Cov  Risk  Baton     ║
║ ─────────────────────────────────────────────────────────────────── ║
║ 1.1  M1  resize.line.end.symphony        8  S    89% LOW   start    ║
║ 1.2  M1  resize.line.move.symphony      11  S    71% MED   metrics  ║
║ 1.3  M1  endLineResize                  10  S    91% LOW   metrics  ║
║ 1.4  M1  resize.line                     9  S    93% LOW   metrics  ║
║      🎭 Data Baton ▸ handoff: template + CSS metrics                ║
║ 2.1  M2  startLineResize                11  S    83% LOW   style    ║
║ 2.2  M2  updateLine                     10  S    69% MED   style    ║
║ 2.3  M2  resize.line.start.symphony      9  S    68% MED   style    ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════╣
║ Size Bands    : Tiny 3 · Small 4 · Medium 0 · Large 0 · XL 0        ║
║ Coverage Dist.: 0–30% 0 · 30–60% 0 · 60–80% 3 · 80–100% 4           ║
║ Risk Summary  : CRITICAL 0 · HIGH 0 · MEDIUM 3 · LOW 4              ║
╚════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: UPDATE                                            ║
║ Domain : renderx-web-orchestration                                  ║
║ Package: canvas-component                                           ║
║ Scope : 1 Symphony · 3 Movements · 7 Beats · 7 Handlers             ║
║ Health: 67 LOC · Avg Cov 85% · Size Band: SMALL · Risk: LOW         ║
╠════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                        ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                   ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1               ║
║   Focus: template     Focus: styling     Focus: import + payload    ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════╣
║ Beat Mov Handler                      LOC  Sz  Cov  Risk  Baton     ║
║ ─────────────────────────────────────────────────────────────────── ║
║ 1.1  M1  refreshControlPanel             9  S    85% LOW   start    ║
║ 1.2  M1  updateAttribute                 8  S    87% LOW   metrics  ║
║ 1.3  M1  refreshControlPanel             9  S    88% LOW   metrics  ║
║ 1.4  M1  updateSvgNodeAttribute         10  S    68% MED   metrics  ║
║      🎭 Data Baton ▸ handoff: template + CSS metrics                ║
║ 2.1  M2  update.svg_node.symphony        9  S    81% LOW   style    ║
║ 2.2  M2  updateFromElement               9  S    69% MED   style    ║
║ 2.3  M2  update.symphony                10  S    90% LOW   style    ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════╣
║ Size Bands    : Tiny 5 · Small 2 · Medium 0 · Large 0 · XL 0        ║
║ Coverage Dist.: 0–30% 0 · 30–60% 0 · 60–80% 2 · 80–100% 5           ║
║ Risk Summary  : CRITICAL 0 · HIGH 0 · MEDIUM 2 · LOW 5              ║
╚════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: COPY                                              ║
║ Domain : renderx-web-orchestration                                  ║
║ Package: canvas-component                                           ║
║ Scope : 1 Symphony · 3 Movements · 6 Beats · 6 Handlers             ║
║ Health: 57 LOC · Avg Cov 85% · Size Band: SMALL · Risk: LOW         ║
╠════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                        ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                   ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1               ║
║   Focus: template     Focus: styling     Focus: import + payload    ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════╣
║ Beat Mov Handler                      LOC  Sz  Cov  Risk  Baton     ║
║ ─────────────────────────────────────────────────────────────────── ║
║ 1.1  M1  copyToClipboard                11  S    74% MED   start    ║
║ 1.2  M1  getSelectedId                   8  S    88% LOW   metrics  ║
║ 1.3  M1  copy                            8  S    73% MED   metrics  ║
║ 1.4  M1  notifyCopyComplete              9  S    84% LOW   metrics  ║
║      🎭 Data Baton ▸ handoff: template + CSS metrics                ║
║ 2.1  M2  serializeElement                8  S    67% MED   style    ║
║ 2.2  M2  serializeSelectedComponent     10  S    94% LOW   style    ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════╣
║ Size Bands    : Tiny 4 · Small 2 · Medium 0 · Large 0 · XL 0        ║
║ Coverage Dist.: 0–30% 0 · 30–60% 0 · 60–80% 3 · 80–100% 3           ║
║ Risk Summary  : CRITICAL 0 · HIGH 0 · MEDIUM 3 · LOW 3              ║
╚════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: DELETE                                            ║
║ Domain : renderx-web-orchestration                                  ║
║ Package: canvas-component                                           ║
║ Scope : 1 Symphony · 3 Movements · 6 Beats · 6 Handlers             ║
║ Health: 57 LOC · Avg Cov 85% · Size Band: SMALL · Risk: LOW         ║
╠════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                        ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                   ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1               ║
║   Focus: template     Focus: styling     Focus: import + payload    ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════╣
║ Beat Mov Handler                      LOC  Sz  Cov  Risk  Baton     ║
║ ─────────────────────────────────────────────────────────────────── ║
║ 1.1  M1  deleteComponent                 9  S    75% LOW   start    ║
║ 1.2  M1  delete                          9  S    85% LOW   metrics  ║
║ 1.3  M1  hideOverlaysForId              11  S    75% LOW   metrics  ║
║ 1.4  M1  publishDeleted                 10  S    74% MED   metrics  ║
║      🎭 Data Baton ▸ handoff: template + CSS metrics                ║
║ 2.1  M2  resolveId                       9  S    68% MED   style    ║
║ 2.2  M2  routeDeleteRequest             11  S    70% MED   style    ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════╣
║ Size Bands    : Tiny 3 · Small 3 · Medium 0 · Large 0 · XL 0        ║
║ Coverage Dist.: 0–30% 0 · 30–60% 0 · 60–80% 5 · 80–100% 1           ║
║ Risk Summary  : CRITICAL 0 · HIGH 0 · MEDIUM 3 · LOW 3              ║
╚════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: PASTE                                             ║
║ Domain : renderx-web-orchestration                                  ║
║ Package: canvas-component                                           ║
║ Scope : 1 Symphony · 3 Movements · 6 Beats · 6 Handlers             ║
║ Health: 57 LOC · Avg Cov 85% · Size Band: SMALL · Risk: LOW         ║
╠════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                        ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                   ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1               ║
║   Focus: template     Focus: styling     Focus: import + payload    ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════╣
║ Beat Mov Handler                      LOC  Sz  Cov  Risk  Baton     ║
║ ─────────────────────────────────────────────────────────────────── ║
║ 1.1  M1  calculatePastePosition         11  S    78% LOW   start    ║
║ 1.2  M1  createPastedComponent          11  S    78% LOW   metrics  ║
║ 1.3  M1  deserializeComponentData       11  S    85% LOW   metrics  ║
║ 1.4  M1  paste                           9  S    75% LOW   metrics  ║
║      🎭 Data Baton ▸ handoff: template + CSS metrics                ║
║ 2.1  M2  notifyPasteComplete             8  S    89% LOW   style    ║
║ 2.2  M2  readFromClipboard              10  S    70% MED   style    ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════╣
║ Size Bands    : Tiny 2 · Small 4 · Medium 0 · Large 0 · XL 0        ║
║ Coverage Dist.: 0–30% 0 · 30–60% 0 · 60–80% 4 · 80–100% 2           ║
║ Risk Summary  : CRITICAL 0 · HIGH 0 · MEDIUM 1 · LOW 5              ║
╚════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: CLIPBOARD                                         ║
║ Domain : renderx-web-orchestration                                  ║
║ Package: canvas-component                                           ║
║ Scope : 1 Symphony · 3 Movements · 4 Beats · 4 Handlers             ║
║ Health: 38 LOC · Avg Cov 85% · Size Band: TINY · Risk: LOW          ║
╠════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                        ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                   ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1               ║
║   Focus: template     Focus: styling     Focus: import + payload    ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════╣
║ Beat Mov Handler                      LOC  Sz  Cov  Risk  Baton     ║
║ ─────────────────────────────────────────────────────────────────── ║
║ 1.1  M1  getClipboardText               10  S    71% MED   start    ║
║ 1.2  M1  safeGetStorage                 11  S    87% LOW   metrics  ║
║ 1.3  M1  safeSetStorage                 10  S    90% LOW   metrics  ║
║ 1.4  M1  setClipboardText               11  S    77% LOW   metrics  ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════╣
║ Size Bands    : Tiny 0 · Small 4 · Medium 0 · Large 0 · XL 0        ║
║ Coverage Dist.: 0–30% 0 · 30–60% 0 · 60–80% 2 · 80–100% 2           ║
║ Risk Summary  : CRITICAL 0 · HIGH 0 · MEDIUM 1 · LOW 3              ║
╚════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: CLASSES                                           ║
║ Domain : renderx-web-orchestration                                  ║
║ Package: control-panel                                              ║
║ Scope : 1 Symphony · 3 Movements · 3 Beats · 3 Handlers             ║
║ Health: 29 LOC · Avg Cov 85% · Size Band: TINY · Risk: LOW          ║
╠════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                        ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                   ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1               ║
║   Focus: template     Focus: styling     Focus: import + payload    ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════╣
║ Beat Mov Handler                      LOC  Sz  Cov  Risk  Baton     ║
║ ─────────────────────────────────────────────────────────────────── ║
║ 1.1  M1  addClass                        8  S    76% LOW   start    ║
║ 1.2  M1  removeClass                    11  S    86% LOW   metrics  ║
║ 1.3  M1  classes.symphony               10  S    72% MED   metrics  ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════╣
║ Size Bands    : Tiny 1 · Small 2 · Medium 0 · Large 0 · XL 0        ║
║ Coverage Dist.: 0–30% 0 · 30–60% 0 · 60–80% 2 · 80–100% 1           ║
║ Risk Summary  : CRITICAL 0 · HIGH 0 · MEDIUM 1 · LOW 2              ║
╚════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: SELECTION                                         ║
║ Domain : renderx-web-orchestration                                  ║
║ Package: control-panel                                              ║
║ Scope : 1 Symphony · 3 Movements · 2 Beats · 2 Handlers             ║
║ Health: 19 LOC · Avg Cov 85% · Size Band: TINY · Risk: LOW          ║
╠════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                        ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                   ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1               ║
║   Focus: template     Focus: styling     Focus: import + payload    ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════╣
║ Beat Mov Handler                      LOC  Sz  Cov  Risk  Baton     ║
║ ─────────────────────────────────────────────────────────────────── ║
║ 1.1  M1  deriveSelectionModel           11  S    71% MED   start    ║
║ 1.2  M1  selection.symphony              9  S    71% MED   metrics  ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════╣
║ Size Bands    : Tiny 1 · Small 1 · Medium 0 · Large 0 · XL 0        ║
║ Coverage Dist.: 0–30% 0 · 30–60% 0 · 60–80% 2 · 80–100% 0           ║
║ Risk Summary  : CRITICAL 0 · HIGH 0 · MEDIUM 2 · LOW 0              ║
╚════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: LOAD                                              ║
║ Domain : renderx-web-orchestration                                  ║
║ Package: library                                                    ║
║ Scope : 1 Symphony · 3 Movements · 2 Beats · 2 Handlers             ║
║ Health: 19 LOC · Avg Cov 85% · Size Band: TINY · Risk: LOW          ║
╠════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                        ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                   ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1               ║
║   Focus: template     Focus: styling     Focus: import + payload    ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════╣
║ Beat Mov Handler                      LOC  Sz  Cov  Risk  Baton     ║
║ ─────────────────────────────────────────────────────────────────── ║
║ 1.1  M1  load.symphony                  10  S    80% LOW   start    ║
║ 1.2  M1  mapJsonComponentToTemplateCom   9  S    72% MED   metrics  ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════╣
║ Size Bands    : Tiny 1 · Small 1 · Medium 0 · Large 0 · XL 0        ║
║ Coverage Dist.: 0–30% 0 · 30–60% 0 · 60–80% 1 · 80–100% 1           ║
║ Risk Summary  : CRITICAL 0 · HIGH 0 · MEDIUM 1 · LOW 1              ║
╚════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: DROP.CONTAINER                                    ║
║ Domain : renderx-web-orchestration                                  ║
║ Package: library-component                                          ║
║ Scope : 1 Symphony · 3 Movements · 1 Beats · 1 Handlers             ║
║ Health: 10 LOC · Avg Cov 85% · Size Band: TINY · Risk: LOW          ║
╠════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                        ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                   ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1               ║
║   Focus: template     Focus: styling     Focus: import + payload    ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════╣
║ Beat Mov Handler                      LOC  Sz  Cov  Risk  Baton     ║
║ ─────────────────────────────────────────────────────────────────── ║
║ 1.1  M1  drop.container.symphony        10  S    78% LOW   start    ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════╣
║ Size Bands    : Tiny 0 · Small 1 · Medium 0 · Large 0 · XL 0        ║
║ Coverage Dist.: 0–30% 0 · 30–60% 0 · 60–80% 1 · 80–100% 0           ║
║ Risk Summary  : CRITICAL 0 · HIGH 0 · MEDIUM 0 · LOW 1              ║
╚════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: DROP                                              ║
║ Domain : renderx-web-orchestration                                  ║
║ Package: library-component                                          ║
║ Scope : 1 Symphony · 3 Movements · 1 Beats · 1 Handlers             ║
║ Health: 10 LOC · Avg Cov 85% · Size Band: TINY · Risk: LOW          ║
╠════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                        ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                   ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1               ║
║   Focus: template     Focus: styling     Focus: import + payload    ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════╣
║ Beat Mov Handler                      LOC  Sz  Cov  Risk  Baton     ║
║ ─────────────────────────────────────────────────────────────────── ║
║ 1.1  M1  drop.symphony                   8  S    73% MED   start    ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════╣
║ Size Bands    : Tiny 1 · Small 0 · Medium 0 · Large 0 · XL 0        ║
║ Coverage Dist.: 0–30% 0 · 30–60% 0 · 60–80% 1 · 80–100% 0           ║
║ Risk Summary  : CRITICAL 0 · HIGH 0 · MEDIUM 1 · LOW 0              ║
╚════════════════════════════════════════════════════════════════════╝

                        │
                        ▼
        ╔═══════════════════════════════════════════════════════╗
        ║   QUALITY & COVERAGE METRICS                         ║
        ╠═══════════════════════════════════════════════════════╣
        ║                                                       ║
        ║  Handlers Analyzed: 529                              ║
        ║  Avg LOC/Handler: 9.54                               ║
        ║  Test Coverage: 85.3%                                  ║
        ║  Duplication: 78.3%                                      ║
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

╔════ REFACTORING ROADMAP ══════════════════════════════╗
║ 1. Reduce code duplication                             ║
║   Target : High duplication areas                      ║
║   Effort : medium                                      ║
║   Rationale: Current duplication: 78.3%. Target: <50%  ║
║   PR: refactor: extract common code patterns to reduce ║
║                                                        ║
║ 2. Enhance maintainability                             ║
║   Target : Complex handlers                            ║
║   Effort : low                                         ║
║   Rationale: Split complex logic into smaller, testable║
║   PR: refactor: improve handler maintainability and rea║
╚═════════════════════════════════════════════════════════╝



╔════ LEGEND & DOMAIN TERMINOLOGY ══════════════════════════════════════╗
║ Domain: renderx-web-orchestration                                    ║
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
  ✅ Discovered: 790 source files in renderx-web-orchestration
  ✅ Analyzed: 529 handler functions with measured LOC (5045 total lines)
  ✅ Mapped: Files to orchestration beats
  ✅ Measured: Test coverage (avg 85.3%)
  ✅ No God handlers detected
  ✅ Generated: Comprehensive metrics and analysis artifacts

NEXT ACTIONS:
  → Review detailed metrics in full report
  → Reduce code duplication from 78.3% to <50%
  → Maintain excellent test coverage
  

═════════════════════════════════════════════════════════════════════════════════════════════════════════════════════


---

## Movement 1: Code Discovery & Beat Mapping

**Purpose**: Discover all source files and map them to orchestration beats

- **Files Discovered**: 790
- **Beats Completed**: 4/4 ✓
- **Beat Mappings**:
  - Beat 1 (Discovery): 0 files
  - Beat 2 (Baseline): 367 files
  - Beat 3 (Structure): 296 files
  - Beat 4 (Dependencies): 127 files

---

## Movement 2: Code Metrics Analysis

**Purpose**: Calculate LOC, complexity, duplication, and maintainability metrics

### Lines of Code (LOC)
- **Total**: 5,045
- **Average per File**: 6
- **Status**: ✓ Normal range

### Complexity Analysis
- **High Complexity**: 2 files
- **Medium Complexity**: 0 files
- **Low Complexity**: 28 files
- **Average**: 1.13
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
**Last Scan**: 2025-11-29T22:30:56.146Z

### Maintainability Index
- **Score**: 72.23/100
- **Classification**: 🟡 **FAIR** (B)
- **Threshold**: 60-80
- **Guidance**: Address technical debt in next sprint. Schedule refactoring review.
- **Contributing Factors**:
  - Test Coverage: 77.6%
  - Documentation: 93.5%
  - Comment Density: 93.6%
  - Complexity Score: 61.5

---

## Movement 3: Test Coverage Analysis (Orchestration Suite)

**Purpose**: Measure statement, branch, function, and line coverage

**Scope**: Full `renderx-web-orchestration` domain - all source files in `packages/` analyzed

### Coverage Metrics
| Type | Coverage | Target | Gap | Status |
|------|----------|--------|-----|--------|
| Statements | 85.25% | 80% | 5.3% | ✅ On-target |
| Branches | 77.23% | 75% | 2.2% | 🟡 Needs Improvement |
| Functions | 81.12% | 80% | 1.1% | 🟡 Needs Improvement |
| Lines | 80.95% | 80% | 1.0% | 🟡 Needs Improvement |

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

	- **Fractal Score**: 0.07 (0-1)
- **Total Orchestration Domains**: 75
- **System-of-Systems Domains**: 5
- **Projection-only Domains**: 0
- **Registry-only Domains**: 2

### Handler Metrics

✅ **529 handlers discovered**

✅ **529 handlers discovered**

**By Type:**
  * generic: 382
  * input: 36
  * validation: 33
  * initialization: 22
  * output: 18
  * event: 15
  * ui-interaction: 10
  * error-handling: 5
  * execution: 5
  * transformation: 3

**Top Handlers:**
  * getClipboardText (generic) — packages/canvas-component/src/symphonies/_clipboard.ts
  * safeGetStorage (generic) — packages/canvas-component/src/symphonies/_clipboard.ts
  * safeSetStorage (generic) — packages/canvas-component/src/symphonies/_clipboard.ts
  * setClipboardText (generic) — packages/canvas-component/src/symphonies/_clipboard.ts
  * enhanceLine (generic) — packages/canvas-component/src/symphonies/augment/augment.line.stage-crew.ts
  * ... and 524 more

**Measurement**: Source='measured' (real discovered exports via pattern matching)
**Coverage**: Handlers distributed across 10 types
**Last Scan**: 2025-11-29T22:30:55.841Z

### Handler Scope Analysis

**Scope Definition**: The handler scope/kind layer distinguishes orchestration handlers (system-level logic) from plugin handlers (feature-level logic).

# Handler Scope Analysis Report

**Generated**: 2025-11-29T22:30:55.865Z

## Overview

The handler scope/kind metadata introduced on 2025-11-27 distinguishes orchestration-level handlers (system logic) from plugin-level handlers (feature logic).

## Summary Statistics

| Scope | Count | Percentage | Sequences | Stages |
|-------|-------|-----------|-----------|--------|
| Orchestration | 92 | 100.0% | 3 | discovery, metrics, coverage, conformity |
| Plugin | 0 | 0.0% | 0 | N/A |
| Unknown | 0 | 0.0% | - | - |
| **TOTAL** | **92** | **100%** | - | - |

## Orchestration Handlers (92)

Orchestration handlers implement system-level logic (code analysis, governance, build coordination).

### By Stage


#### Discovery (4 handlers)

| Sequence | Beat | Handler |
|----------|------|---------|
| symphonic-code-analysis-pipeline | Scan Orchestration Files | analysis.discovery.scanOrchestrationFiles |
| symphonic-code-analysis-pipeline | Discover Source Code | analysis.discovery.discoverSourceCode |
| symphonic-code-analysis-pipeline | Map Beats to Code | analysis.discovery.mapBeatsToCode |
| symphonic-code-analysis-pipeline | Collect Baseline | analysis.discovery.collectBaseline |

#### Metrics (4 handlers)

| Sequence | Beat | Handler |
|----------|------|---------|
| symphonic-code-analysis-pipeline | Count Lines of Code | analysis.metrics.countLinesOfCode |
| symphonic-code-analysis-pipeline | Analyze Complexity | analysis.metrics.analyzeComplexity |
| symphonic-code-analysis-pipeline | Detect Duplication | analysis.metrics.detectDuplication |
| symphonic-code-analysis-pipeline | Calculate Maintainability | analysis.metrics.calculateMaintainability |

#### Coverage (4 handlers)

| Sequence | Beat | Handler |
|----------|------|---------|
| symphonic-code-analysis-pipeline | Measure Statement Coverage | analysis.coverage.measureStatementCoverage |
| symphonic-code-analysis-pipeline | Measure Branch Coverage | analysis.coverage.measureBranchCoverage |
| symphonic-code-analysis-pipeline | Measure Function Coverage | analysis.coverage.measureFunctionCoverage |
| symphonic-code-analysis-pipeline | Calculate Gap Analysis | analysis.coverage.calculateGapAnalysis |

#### Conformity (4 handlers)

| Sequence | Beat | Handler |
|----------|------|---------|
| symphonic-code-analysis-pipeline | Validate Handler Mapping | analysis.conformity.validateHandlerMapping |
| symphonic-code-analysis-pipeline | Calculate Conformity Score | analysis.conformity.calculateConformityScore |
| symphonic-code-analysis-pipeline | Analyze Trends | analysis.conformity.analyzeTrends |
| symphonic-code-analysis-pipeline | Generate Reports | analysis.conformity.generateReports |

#### Unspecified (76 handlers)

| Sequence | Beat | Handler |
|----------|------|---------|
| build-pipeline-symphony | beat-0 | loadBuildContext |
| build-pipeline-symphony | beat-1 | validateOrchestrationDomains |
| build-pipeline-symphony | beat-2 | validateGovernanceRules |
| build-pipeline-symphony | beat-3 | validateAgentBehavior |
| build-pipeline-symphony | beat-4 | recordValidationResults |
| build-pipeline-symphony | beat-0 | regenerateOrchestrationDomains |
| build-pipeline-symphony | beat-1 | syncJsonSources |
| build-pipeline-symphony | beat-2 | generateManifests |
| build-pipeline-symphony | beat-3 | validateManifestIntegrity |
| build-pipeline-symphony | beat-4 | recordManifestState |
| ... | ... | and 66 more |


## Plugin Handlers (0)

Plugin handlers implement feature-level logic (UI behavior, component interactions).

### Top Sequences by Handler Count

| Sequence | Handler Count |
|----------|---|


## Unknown Scope Handlers (0)

These handlers need scope assignment:



## Key Metrics

- **Orchestration Coverage**: 92 handlers across 3 sequences
- **Plugin Coverage**: 0 handlers across 0 sequences
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

**Overall**: 🟡 **66.39/100** (FAIR)

**Component Scores:**
| Component | Score | Target | Status |
|-----------|-------|--------|--------|
| Handler Coverage | 100.00% | 90%+ | ✓ |
| Beat Coverage | 40.00% | 100% | ⚠ |
| Mapping Confidence | 71.95% | 80%+ | ⚠ |
| Distribution | 0.00% | 80%+ | ⚠ |

**Metrics:**
- Mapped Handlers: 529/529
- Orphaned Handlers: 0
- Beats with Handlers: 8
- Beats Without Handlers: 12

**Orphaned Handlers:**
**Orphaned Handlers**: None ✓

**Beats Without Handlers (12):**
- beat-1a-discovery-core (Movement 1)
- beat-1b-discovery-extended (Movement 1)
- beat-1c-discovery-analysis (Movement 1)
- beat-2b-baseline-analysis (Movement 2)
- beat-2d-baseline-reporting (Movement 2)
- ... and 7 more

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

**Mapping Status**: 529/529 handlers have explicit beat mappings. Coverage heatmap reflects current measurement scope.

**Heatmap Terminology**: "Unassigned" in the Coverage Heatmap table refers to handlers without coverage measurement data correlated to specific beats in the current analysis scope, not to unmapped handlers. All 529 handlers have explicit beat assignments in the orchestration-domains.json mapping.

## Coverage by Handler Analysis

### Overall Test Coverage
**Global Coverage**: 77.11% statements

| Metric | Coverage | Status |
|--------|----------|--------|
| Statements | 77.11% | 🟡 |
| Branches | 83.02% | 🟢 |
| Functions | 87.67% | 🟢 |
| Lines | 81.37% | 🟢 |

### Handler Coverage Summary
| Category | Count | % | Status |
|----------|-------|---|--------|
| Well-Covered (80%+) | 26 | 13.3% | ✅ |
| Partially-Covered (50-79%) | 169 | 86.7% | ⚠️ |
| Poorly-Covered (1-49%) | 0 | 0.0% | ⚠️ |
| Uncovered (0%) | 0 | 0.0% | ❌ |

**Average Handler Coverage**: 73.69%

**Handlers**: 195 | **Average LOC per Handler**: 23.68 | **Total LOC**: 2202

### Coverage Heatmap by Beat

| Beat | Avg Coverage | Handlers | Status |
|------|--------------|----------|--------|
| beat-2a-baseline-metrics | 76.96% | 43 | ⚠️ |
| beat-4-dependencies | 76.9% | 28 | ⚠️ |
| beat-3-structure | 76.68% | 84 | ⚠️ |
| beat-1-discovery | 61.67% | 40 | ⚠️ |

### ✅ Well-Tested Handlers (Coverage >= 80%)
| Handler | Coverage | Beat |
|---------|----------|------|
| selectionModel | 82.04% | beat-2a-baseline-metrics |
| updatePosition | 81.94% | beat-3-structure |
| updateSize | 81.9% | beat-3-structure |
| id | 81.8% | beat-3-structure |
| renderView | 81.8% | beat-3-structure |
| timestamp | 81.49% | beat-3-structure |
| logResults | 81.23% | beat-2a-baseline-metrics |
| just | 81.17% | beat-4-dependencies |

**Measurement**: Source='measured' (test coverage analysis with handler-beat correlation)
**Timestamp**: 2025-11-29T22:30:57.354Z


### Automated Refactor Suggestions

## Automated Refactor Suggestions

### Executive Summary

Analysis identified **16 refactoring opportunities** across the codebase:

| Category | Count | Impact | Effort |
|----------|-------|--------|--------|
| Code Consolidation | 5 | High | Low-Medium |
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

**[P2] Refactor handler clustering in "self-healing"**
- Package contains 98 handlers clustered together. Consider extracting into specialized sub-modules or consolidating related handlers.

**[P2] Refactor handler clustering in "control-panel"**
- Package contains 66 handlers clustered together. Consider extracting into specialized sub-modules or consolidating related handlers.

**[P2] Refactor handler clustering in "library"**
- Package contains 56 handlers clustered together. Consider extracting into specialized sub-modules or consolidating related handlers.

**[P2] Refactor handler clustering in "musical-conductor"**
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
- Timestamp: 2025-11-29T22:30:57.643Z


### Historical Trend Analysis

**Note**: Trend coverage metrics may differ from current run's Movement 3 metrics due to snapshot timing and aggregation. These represent baseline or averaged coverage, not current execution coverage.

## Historical Trend Analysis

**Analysis Period**: Last 30 snapshots
**Current Baseline**: 2025-11-29T22:30:57.908Z

### Overall Trend Summary

| Metric | Current | Previous | Change | Trend | Direction |
|--------|---------|----------|--------|-------|-----------|
| Handler Count | 529 | 14 | - | New | - |
| Duplication (blocks) | 562 | 562 | - | Monitoring | - |
| Coverage (avg) | 84.33% | 42.21% | - | Monitoring | - |
| Maintainability | 79.61/100 | - | - | Baseline | - |
| Conformity | 87.50% | - | - | Baseline | - |

### Handler Metrics

**Current State**: 529 handlers discovered

**Handler Tracking:**
- Starting baseline: 529 handlers
- Types detected: 10
- Target for next sprint: 635 (20% growth for enhanced coverage)
- Health score: 54/100 (POOR - focus on distribution)

**Expected Evolution**:
- Week 4: 556 handlers (Type-specific handlers added)
- Week 8: 609 handlers (Enhanced testing harness)
- Week 12: 688 handlers (Full handler decomposition)

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
| Statements | 80.74% | 85% | 4.26% | 🟡 Close |
| Branches | 87.92% | 85% | -2.92% | 🟡 Close |
| Functions | 76.32% | 90% | 13.68% | 🟡 Close |
| Lines | 86.61% | 85% | -1.61% | ✅ On-target |

**Coverage Improvement Roadmap**:
- **Week 2**: Add 5-8 integration tests → +3% statements
- **Week 4**: Refactor handler coverage → +5% branches
- **Week 6**: Beat 4 expansion → +8% functions
- **Target**: 85%+ all metrics by week 8

### Maintainability Trends

**Current Maintainability Index**: 79.61/100

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
- Handlers: 529
- Duplication: 145.55%
- Coverage: 84.33%
- Maintainability: 79.61/100
- Conformity: 87.50%

**Projected (Week 4)**:
- Handlers: +5% → 556
- Duplication: -15% → 130.55%
- Coverage: +3-5% → 88.33%
- Maintainability: +5 → 84.61/100
- Conformity: +2% → 89.50%

**Projected (Week 8 - Full Sprint)**:
- Handlers: +15% → 609
- Duplication: -30% → 115.55%
- Coverage: +8-10% → 93.33%
- Maintainability: +15 → 94.61/100
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

**Timestamp**: 2025-11-29T22:30:57.914Z
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

**Ready for CI Gating**: ⚠️ **READY WITH CAUTION**

Gating Level: **CONDITIONAL**

✓ Conformity (87.50%) ✅
✓ Coverage - Orchestration Suite (85.25%) ✅
✓ Handler Scanning (529 handlers discovered) ✅

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

- **JSON Analysis**: renderx-web-orchestration-code-analysis-2025-11-29T22-30-54-038Z.json
- **Coverage Summary**: renderx-web-orchestration-coverage-summary-2025-11-29T22-30-54-038Z.json
- **Per-Beat Metrics**: renderx-web-orchestration-per-beat-metrics-2025-11-29T22-30-54-038Z.csv
- **Trend Analysis**: renderx-web-orchestration-trends-2025-11-29T22-30-54-038Z.json

---

*Report auto-generated from symphonic-code-analysis-pipeline. All metrics are immutable and traceable to source analysis.*
