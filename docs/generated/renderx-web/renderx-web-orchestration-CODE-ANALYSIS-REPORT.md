# Renderx Web Orchestration Code Analysis Report

**Generated**: 2025-11-28T19:59:43.654Z  
**Codebase**: renderx-web-orchestration  
**Pipeline**: symphonic-code-analysis-pipeline

## Executive Summary

This comprehensive analysis spans 4 movements with 16 beat stages, providing deep insights into code quality, test coverage, and architectural conformity.

### Overall Health: FAIR (Conditional) ⚠

**Note**: 'FAIR' reflects current architecture and test posture. CI/CD gating is stricter and requires higher thresholds for automated deployment gates.

| Metric | Value | Status | Classification |
|--------|-------|--------|-----------------|
| Conformity Score | 87.50% | ⚠️  FAIR| Governance: CONDITIONAL|
| Test Coverage | 74.02% | ⚠️  FAIR| Risk: MEDIUM|
| Maintainability | 62.19/100 | 🟡 FAIR| Grade: B|
| Code Duplication | 78.30% | ❌ VERY HIGH| Action: Refactor|

---


╔══════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
║                    SYMPHONIC CODE ANALYSIS ARCHITECTURE - RENDERX WEB ORCHESTRATION                         ║
║                    Enhanced Handler Portfolio & Orchestration Framework                                          ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝

┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  📊 CODEBASE METRICS FOUNDATION                                                                                 │
│  ═════════════════════════════════════════════════════════════════════════════════════════════════════════════   │
│  │ Total Files: 787 │ Total LOC: 5045  │ Handlers: 403│ Avg LOC/Handler: 12.52│ Coverage: 74.02% │           │
│  ╰─────────────────────────────────────────────────────────────────────────────────────────────────────────────  │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

╔════ HANDLER PORTFOLIO METRICS ════╗
║ Files           : 787           ║
║ Total LOC       : 5045          ║
║ Handlers        : 403           ║
║ Avg LOC/Handler : 12.5          ║
║ Coverage        : 74.0%         ║
║ Duplication     : 0             ║
║ Maintainability : 62.2          ║
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
        │ 787  files           │ LOC metrics           │ coverage
        │                      │                      │
        └──────────┬───────────┴──────────┬───────────┘
                   │                      │
                   ▼                      ▼
        ╔══════════════════╗  ╔══════════════════╗
        │  DATA BATON 🎭   │  │  DATA BATON 🎭   │
        ├──────────────────┤  ├──────────────────┤
        │ • Files: 787     │  │ • Handlers: 403 │
        │ • LOC: 5045      │  │ • Avg LOC: 12.52│
        │ • Beats: 4/4 ✓   │  │ • Coverage: 74.0%│
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
║ Scope : 1 Symphony · 7 Movements · 28 Beats · 28 Handlers           ║
║ Health: 351 LOC · Avg Cov 74% · Size Band: LARGE · Risk: HIGH       ║
╠════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                        ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                   ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.4               ║
║   Focus: template     Focus: styling     Focus: import + payload    ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════╣
║ Beat Mov Handler                      LOC  Sz  Cov  Risk  Baton     ║
║ ─────────────────────────────────────────────────────────────────── ║
║ 1.1  M1  resolveTemplate                13  S    76% LOW   start    ║
║ 1.2  M1  injectCssFallback              11  S    61% MED   metrics  ║
║ 1.3  M1  injectRawCss                   10  S    80% LOW   metrics  ║
║ 1.4  M1  appendTo                       13  S    59% HIGH  metrics  ║
║      🎭 Data Baton ▸ handoff: template + CSS metrics                ║
║ 2.1  M2  applyClasses                   11  S    63% MED   style    ║
║ 2.2  M2  applyInlineStyle               11  S    67% MED   style    ║
║ 2.3  M2  createElementWithId            11  S    81% LOW   style    ║
║ 2.4  M2  getCanvasOrThrow               12  S    60% MED   style    ║
║ 3.1  M3  attachStandardImportInteracti  12  S    76% LOW   import   ║
║ 3.2  M3  createFromImportRecord         13  S    83% LOW   import   ║
║ 3.3  M3  toCreatePayloadFromData        12  S    66% MED   import   ║
║ 3.4  M3  transformClipboardToCreatePay  15  S    76% LOW   payload  ║
║ 4.1  M4  transformImportToCreatePayloa  10  S    66% MED   payload  ║
║ 4.2  M4  attachDrag                     12  S    74% MED   payload  ║
║ 4.3  M4  attachSelection                14  S    67% MED   payload  ║
║ 4.4  M4  attachSvgNodeClick             14  S    80% LOW   payload  ║
║ 5.1  M5  registerInstance               11  S    75% LOW   payload  ║
║ 5.2  M5  notifyUi                       11  S    72% MED   payload  ║
║ 5.3  M5  cleanupReactRoot               15  S    62% MED   payload  ║
║ 5.4  M5  exposeEventRouterToReact       11  S    79% LOW   payload  ║
║ 6.1  M6  renderReact                    12  S    64% MED   payload  ║
║ 6.2  M6  createNode                     13  S    68% MED   payload  ║
║ 6.3  M6  create                         13  S    58% HIGH  payload  ║
║ 6.4  M6  computeCssVarBlock             14  S    59% HIGH  payload  ║
║ 7.1  M7  computeInlineStyle             14  S    60% MED   payload  ║
║ 7.2  M7  computeInstanceClass           14  S    83% LOW   payload  ║
║ 7.3  M7  validateReactCode              14  S    80% LOW   payload  ║
║ 7.4  M7  validateReactCodeOrThrow       12  S    80% LOW   payload  ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════╣
║ Size Bands    : Tiny 0 · Small 28 · Medium 0 · Large 0 · XL 0       ║
║ Coverage Dist.: 0–30% 0 · 30–60% 3 · 60–80% 18 · 80–100% 7          ║
║ Risk Summary  : CRITICAL 0 · HIGH 3 · MEDIUM 13 · LOW 12            ║
╚════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: UI                                                ║
║ Domain : renderx-web-orchestration                                  ║
║ Package: control-panel                                              ║
║ Scope : 1 Symphony · 6 Movements · 21 Beats · 21 Handlers           ║
║ Health: 263 LOC · Avg Cov 74% · Size Band: MEDIUM · Risk: HIGH      ║
╠════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                        ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                   ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.4               ║
║   Focus: template     Focus: styling     Focus: import + payload    ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════╣
║ Beat Mov Handler                      LOC  Sz  Cov  Risk  Baton     ║
║ ─────────────────────────────────────────────────────────────────── ║
║ 1.1  M1  awaitRefresh                   14  S    61% MED   start    ║
║ 1.2  M1  dispatchField                  13  S    66% MED   metrics  ║
║ 1.3  M1  generateFields                 12  S    55% HIGH  metrics  ║
║ 1.4  M1  generateSections               12  S    76% LOW   metrics  ║
║      🎭 Data Baton ▸ handoff: template + CSS metrics                ║
║ 2.1  M2  initConfig                     11  S    78% LOW   style    ║
║ 2.2  M2  initMovement                   13  S    57% HIGH  style    ║
║ 2.3  M2  initResolver                   14  S    55% HIGH  style    ║
║ 2.4  M2  loadSchemas                    14  S    74% MED   style    ║
║ 3.1  M3  mergeErrors                    14  S    79% LOW   import   ║
║ 3.2  M3  notifyReady                    14  S    63% MED   import   ║
║ 3.3  M3  prepareField                   11  S    60% MED   import   ║
║ 3.4  M3  registerObservers              11  S    76% LOW   payload  ║
║ 4.1  M4  renderView                     11  S    71% MED   payload  ║
║ 4.2  M4  setDirty                       14  S    59% HIGH  payload  ║
║ 4.3  M4  toggleSection                  14  S    54% HIGH  payload  ║
║ 4.4  M4  updateView                     13  S    59% HIGH  payload  ║
║ 5.1  M5  validateField                  14  S    79% LOW   payload  ║
║ 5.2  M5  ui.symphony                    12  S    64% MED   payload  ║
║ 5.3  M5  getCurrentTheme                12  S    79% LOW   payload  ║
║ 5.4  M5  toggleTheme                    14  S    54% HIGH  payload  ║
║ 6.1  M6  ui.symphony                    14  S    58% HIGH  payload  ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════╣
║ Size Bands    : Tiny 0 · Small 21 · Medium 0 · Large 0 · XL 0       ║
║ Coverage Dist.: 0–30% 0 · 30–60% 8 · 60–80% 13 · 80–100% 0          ║
║ Risk Summary  : CRITICAL 0 · HIGH 8 · MEDIUM 7 · LOW 6              ║
╚════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: SELECT                                            ║
║ Domain : renderx-web-orchestration                                  ║
║ Package: canvas-component                                           ║
║ Scope : 1 Symphony · 5 Movements · 20 Beats · 20 Handlers           ║
║ Health: 250 LOC · Avg Cov 74% · Size Band: MEDIUM · Risk: HIGH      ║
╠════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                        ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                   ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.4               ║
║   Focus: template     Focus: styling     Focus: import + payload    ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════╣
║ Beat Mov Handler                      LOC  Sz  Cov  Risk  Baton     ║
║ ─────────────────────────────────────────────────────────────────── ║
║ 1.1  M1  ensureOverlayCss               11  S    64% MED   start    ║
║ 1.2  M1  applyOverlayRectForEl          15  S    78% LOW   metrics  ║
║ 1.3  M1  ensureOverlay                  13  S    67% MED   metrics  ║
║ 1.4  M1  getCanvasOrThrow               11  S    64% MED   metrics  ║
║      🎭 Data Baton ▸ handoff: template + CSS metrics                ║
║ 2.1  M2  getCanvasRect                  13  S    71% MED   style    ║
║ 2.2  M2  createOverlayStructure         12  S    60% MED   style    ║
║ 2.3  M2  resolveEndpoints               14  S    80% LOW   style    ║
║ 2.4  M2  attachAdvancedLineManipHandle  14  S    62% MED   style    ║
║ 3.1  M3  ensureAdvancedLineOverlayFor   12  S    61% MED   import   ║
║ 3.2  M3  attachLineResizeHandlers       15  S    72% MED   import   ║
║ 3.3  M3  ensureLineOverlayFor           11  S    77% LOW   import   ║
║ 3.4  M3  attachResizeHandlers           14  S    64% MED   payload  ║
║ 4.1  M4  select                         14  S    72% MED   payload  ║
║ 4.2  M4  hideSelectionOverlay           12  S    65% MED   payload  ║
║ 4.3  M4  notifyUi                       14  S    66% MED   payload  ║
║ 4.4  M4  publishSelectionChanged        14  S    65% MED   payload  ║
║ 5.1  M5  routeSelectionRequest          14  S    56% HIGH  payload  ║
║ 5.2  M5  showSelectionOverlay           14  S    71% MED   payload  ║
║ 5.3  M5  select.svg_node                13  S    59% HIGH  payload  ║
║ 5.4  M5  showSvgNodeOverlay             12  S    67% MED   payload  ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════╣
║ Size Bands    : Tiny 0 · Small 20 · Medium 0 · Large 0 · XL 0       ║
║ Coverage Dist.: 0–30% 0 · 30–60% 2 · 60–80% 17 · 80–100% 1          ║
║ Risk Summary  : CRITICAL 0 · HIGH 2 · MEDIUM 15 · LOW 3             ║
╚════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: INITIALIZE                                        ║
║ Domain : renderx-web-orchestration                                  ║
║ Package: musical-conductor                                          ║
║ Scope : 1 Symphony · 4 Movements · 14 Beats · 14 Handlers           ║
║ Health: 175 LOC · Avg Cov 74% · Size Band: MEDIUM · Risk: HIGH      ║
╠════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                        ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                   ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.4               ║
║   Focus: template     Focus: styling     Focus: import + payload    ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════╣
║ Beat Mov Handler                      LOC  Sz  Cov  Risk  Baton     ║
║ ─────────────────────────────────────────────────────────────────── ║
║ 1.1  M1  bootstrapLogging               12  S    58% HIGH  start    ║
║ 1.2  M1  checkExistingInstance          13  S    65% MED   metrics  ║
║ 1.3  M1  connectSystems                 12  S    83% LOW   metrics  ║
║ 1.4  M1  createConductor                14  S    54% HIGH  metrics  ║
║      🎭 Data Baton ▸ handoff: template + CSS metrics                ║
║ 2.1  M2  exposeFacade                   13  S    58% HIGH  style    ║
║ 2.2  M2  getCommunicationSystemInstanc  13  S    57% HIGH  style    ║
║ 2.3  M2  initialize                     15  S    57% HIGH  style    ║
║ 2.4  M2  isCommunicationSystemInitiali  12  S    77% LOW   style    ║
║ 3.1  M3  loadSequences                  14  S    55% HIGH  import   ║
║ 3.2  M3  markInitialized                12  S    60% MED   import   ║
║ 3.3  M3  notifyReady                    13  S    79% LOW   import   ║
║ 3.4  M3  resetCommunicationSystem       11  S    76% LOW   payload  ║
║ 4.1  M4  validateEnvironment            10  S    63% MED   payload  ║
║ 4.2  M4  validateRegistrations          10  S    61% MED   payload  ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════╣
║ Size Bands    : Tiny 0 · Small 14 · Medium 0 · Large 0 · XL 0       ║
║ Coverage Dist.: 0–30% 0 · 30–60% 6 · 60–80% 7 · 80–100% 1           ║
║ Risk Summary  : CRITICAL 0 · HIGH 6 · MEDIUM 4 · LOW 4              ║
╚════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: DRAG                                              ║
║ Domain : renderx-web-orchestration                                  ║
║ Package: canvas-component                                           ║
║ Scope : 1 Symphony · 4 Movements · 13 Beats · 13 Handlers           ║
║ Health: 163 LOC · Avg Cov 74% · Size Band: MEDIUM · Risk: HIGH      ║
╠════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                        ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                   ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.4               ║
║   Focus: template     Focus: styling     Focus: import + payload    ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════╣
║ Beat Mov Handler                      LOC  Sz  Cov  Risk  Baton     ║
║ ─────────────────────────────────────────────────────────────────── ║
║ 1.1  M1  endDrag                        14  S    71% MED   start    ║
║ 1.2  M1  forwardToControlPanel          10  S    75% LOW   metrics  ║
║ 1.3  M1  drag                           12  S    74% MED   metrics  ║
║ 1.4  M1  startDrag                      15  S    75% LOW   metrics  ║
║      🎭 Data Baton ▸ handoff: template + CSS metrics                ║
║ 2.1  M2  updatePosition                 12  S    80% LOW   style    ║
║ 2.2  M2  drag.symphony                  15  S    61% MED   style    ║
║ 2.3  M2  applyTemplateStyles            11  S    55% HIGH  style    ║
║ 2.4  M2  computeCursorOffsets           12  S    76% LOW   style    ║
║ 3.1  M3  computeGhostSize               11  S    76% LOW   import   ║
║ 3.2  M3  createGhostContainer           11  S    68% MED   import   ║
║ 3.3  M3  ensurePayload                  11  S    64% MED   import   ║
║ 3.4  M3  installDragImage               15  S    62% MED   payload  ║
║ 4.1  M4  renderTemplatePreview          15  S    69% MED   payload  ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════╣
║ Size Bands    : Tiny 0 · Small 13 · Medium 0 · Large 0 · XL 0       ║
║ Coverage Dist.: 0–30% 0 · 30–60% 1 · 60–80% 11 · 80–100% 1          ║
║ Risk Summary  : CRITICAL 0 · HIGH 1 · MEDIUM 7 · LOW 5              ║
╚════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: EXPORT                                            ║
║ Domain : renderx-web-orchestration                                  ║
║ Package: canvas-component                                           ║
║ Scope : 1 Symphony · 3 Movements · 12 Beats · 12 Handlers           ║
║ Health: 150 LOC · Avg Cov 74% · Size Band: MEDIUM · Risk: HIGH      ║
╠════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                        ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                   ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.4               ║
║   Focus: template     Focus: styling     Focus: import + payload    ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════╣
║ Beat Mov Handler                      LOC  Sz  Cov  Risk  Baton     ║
║ ─────────────────────────────────────────────────────────────────── ║
║ 1.1  M1  collectCssClasses              14  S    72% MED   start    ║
║ 1.2  M1  discoverComponentsFromDom      11  S    79% LOW   metrics  ║
║ 1.3  M1  downloadUiFile                 12  S    56% HIGH  metrics  ║
║ 1.4  M1  exportSvgToGif                 12  S    59% HIGH  metrics  ║
║      🎭 Data Baton ▸ handoff: template + CSS metrics                ║
║ 2.1  M2  export.gif.symphony            14  S    68% MED   style    ║
║ 2.2  M2  queryAllComponents             12  S    75% LOW   style    ║
║ 2.3  M2  createMP4Encoder               10  S    77% LOW   style    ║
║ 2.4  M2  exportSvgToMp4                 13  S    76% LOW   style    ║
║ 3.1  M3  export.mp4.symphony            11  S    60% MED   import   ║
║ 3.2  M3  buildUiFileContent             15  S    67% MED   import   ║
║ 3.3  M3  collectLayoutData              11  S    58% HIGH  import   ║
║ 3.4  M3  export.symphony                14  S    84% LOW   payload  ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════╣
║ Size Bands    : Tiny 0 · Small 12 · Medium 0 · Large 0 · XL 0       ║
║ Coverage Dist.: 0–30% 0 · 30–60% 3 · 60–80% 8 · 80–100% 1           ║
║ Risk Summary  : CRITICAL 0 · HIGH 3 · MEDIUM 4 · LOW 5              ║
╚════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: EXECUTE SEQUENCE                                  ║
║ Domain : renderx-web-orchestration                                  ║
║ Package: musical-conductor                                          ║
║ Scope : 1 Symphony · 3 Movements · 11 Beats · 11 Handlers           ║
║ Health: 138 LOC · Avg Cov 74% · Size Band: SMALL · Risk: MEDIUM     ║
╠════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                        ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                   ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.3               ║
║   Focus: template     Focus: styling     Focus: import + payload    ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════╣
║ Beat Mov Handler                      LOC  Sz  Cov  Risk  Baton     ║
║ ─────────────────────────────────────────────────────────────────── ║
║ 1.1  M1  checkResources                 11  S    79% LOW   start    ║
║ 1.2  M1  cleanupResources               13  S    67% MED   metrics  ║
║ 1.3  M1  enqueueSequence                14  S    74% MED   metrics  ║
║ 1.4  M1  handleBeatComplete             13  S    74% MED   metrics  ║
║      🎭 Data Baton ▸ handoff: template + CSS metrics                ║
║ 2.1  M2  execute_sequence               13  S    77% LOW   style    ║
║ 2.2  M2  notifyComplete                 10  S    71% MED   style    ║
║ 2.3  M2  processBeat                    13  S    79% LOW   style    ║
║ 2.4  M2  recordMetrics                  12  S    58% HIGH  style    ║
║ 3.1  M3  startExecution                 15  S    73% MED   import   ║
║ 3.2  M3  updateStatistics               11  S    76% LOW   import   ║
║ 3.3  M3  validateRequest                11  S    70% MED   import   ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════╣
║ Size Bands    : Tiny 0 · Small 11 · Medium 0 · Large 0 · XL 0       ║
║ Coverage Dist.: 0–30% 0 · 30–60% 1 · 60–80% 10 · 80–100% 0          ║
║ Risk Summary  : CRITICAL 0 · HIGH 1 · MEDIUM 6 · LOW 4              ║
╚════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: MONITOR                                           ║
║ Domain : renderx-web-orchestration                                  ║
║ Package: musical-conductor                                          ║
║ Scope : 1 Symphony · 3 Movements · 11 Beats · 11 Handlers           ║
║ Health: 138 LOC · Avg Cov 74% · Size Band: SMALL · Risk: LOW        ║
╠════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                        ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                   ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.3               ║
║   Focus: template     Focus: styling     Focus: import + payload    ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════╣
║ Beat Mov Handler                      LOC  Sz  Cov  Risk  Baton     ║
║ ─────────────────────────────────────────────────────────────────── ║
║ 1.1  M1  checkEventBusHealth            13  S    72% MED   start    ║
║ 1.2  M1  checkExecutionHealth           13  S    84% LOW   metrics  ║
║ 1.3  M1  generateStatusReport           12  S    66% MED   metrics  ║
║ 1.4  M1  getConductorStatus             14  S    80% LOW   metrics  ║
║      🎭 Data Baton ▸ handoff: template + CSS metrics                ║
║ 2.1  M2  getDuplicationReport           11  S    82% LOW   style    ║
║ 2.2  M2  getPerformanceMetrics          11  S    63% MED   style    ║
║ 2.3  M2  getQueueStatus                 10  S    80% LOW   style    ║
║ 2.4  M2  getSequenceCount               15  S    58% HIGH  style    ║
║ 3.1  M3  getStatistics                  15  S    83% LOW   import   ║
║ 3.2  M3  monitor                        15  S    80% LOW   import   ║
║ 3.3  M3  logHealthSummary               11  S    79% LOW   import   ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════╣
║ Size Bands    : Tiny 0 · Small 11 · Medium 0 · Large 0 · XL 0       ║
║ Coverage Dist.: 0–30% 0 · 30–60% 1 · 60–80% 4 · 80–100% 6           ║
║ Risk Summary  : CRITICAL 0 · HIGH 1 · MEDIUM 3 · LOW 7              ║
╚════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: VALIDATE PLUGIN                                   ║
║ Domain : renderx-web-orchestration                                  ║
║ Package: musical-conductor                                          ║
║ Scope : 1 Symphony · 3 Movements · 11 Beats · 11 Handlers           ║
║ Health: 138 LOC · Avg Cov 74% · Size Band: SMALL · Risk: MEDIUM     ║
╠════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                        ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                   ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.3               ║
║   Focus: template     Focus: styling     Focus: import + payload    ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════╣
║ Beat Mov Handler                      LOC  Sz  Cov  Risk  Baton     ║
║ ─────────────────────────────────────────────────────────────────── ║
║ 1.1  M1  checkManifest                  13  S    84% LOW   start    ║
║ 1.2  M1  checkResourceRequirements      13  S    75% LOW   metrics  ║
║ 1.3  M1  checkSPACompliance             14  S    63% MED   metrics  ║
║ 1.4  M1  generateValidationReport       12  S    65% MED   metrics  ║
║      🎭 Data Baton ▸ handoff: template + CSS metrics                ║
║ 2.1  M2  validate_plugin                13  S    62% MED   style    ║
║ 2.2  M2  logResults                     12  S    61% MED   style    ║
║ 2.3  M2  validateHandlerContracts       10  S    81% LOW   style    ║
║ 2.4  M2  validatePluginShape            13  S    81% LOW   style    ║
║ 3.1  M3  validatePriorities             14  S    66% MED   import   ║
║ 3.2  M3  verifyBeatMapping              12  S    78% LOW   import   ║
║ 3.3  M3  verifyExports                  13  S    58% HIGH  import   ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════╣
║ Size Bands    : Tiny 0 · Small 11 · Medium 0 · Large 0 · XL 0       ║
║ Coverage Dist.: 0–30% 0 · 30–60% 1 · 60–80% 7 · 80–100% 3           ║
║ Risk Summary  : CRITICAL 0 · HIGH 1 · MEDIUM 5 · LOW 5              ║
╚════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: REGISTER SEQUENCE                                 ║
║ Domain : renderx-web-orchestration                                  ║
║ Package: musical-conductor                                          ║
║ Scope : 1 Symphony · 3 Movements · 9 Beats · 9 Handlers             ║
║ Health: 113 LOC · Avg Cov 74% · Size Band: SMALL · Risk: HIGH       ║
╠════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                        ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                   ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1               ║
║   Focus: template     Focus: styling     Focus: import + payload    ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════╣
║ Beat Mov Handler                      LOC  Sz  Cov  Risk  Baton     ║
║ ─────────────────────────────────────────────────────────────────── ║
║ 1.1  M1  checkDuplicates                12  S    78% LOW   start    ║
║ 1.2  M1  register_sequence              14  S    72% MED   metrics  ║
║ 1.3  M1  logRegistrationDetails         13  S    71% MED   metrics  ║
║ 1.4  M1  notifyRegistered               14  S    82% LOW   metrics  ║
║      🎭 Data Baton ▸ handoff: template + CSS metrics                ║
║ 2.1  M2  registerWithRegistry           15  S    77% LOW   style    ║
║ 2.2  M2  updateEventMappings            11  S    55% HIGH  style    ║
║ 2.3  M2  validateBeats                  12  S    62% MED   style    ║
║ 2.4  M2  validateSequenceShape          11  S    69% MED   style    ║
║ 3.1  M3  verifyAvailability             12  S    65% MED   import   ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════╣
║ Size Bands    : Tiny 0 · Small 9 · Medium 0 · Large 0 · XL 0        ║
║ Coverage Dist.: 0–30% 0 · 30–60% 1 · 60–80% 7 · 80–100% 1           ║
║ Risk Summary  : CRITICAL 0 · HIGH 1 · MEDIUM 5 · LOW 3              ║
╚════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: RESIZE                                            ║
║ Domain : renderx-web-orchestration                                  ║
║ Package: canvas-component                                           ║
║ Scope : 1 Symphony · 3 Movements · 8 Beats · 8 Handlers             ║
║ Health: 100 LOC · Avg Cov 74% · Size Band: SMALL · Risk: MEDIUM     ║
╠════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                        ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                   ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1               ║
║   Focus: template     Focus: styling     Focus: import + payload    ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════╣
║ Beat Mov Handler                      LOC  Sz  Cov  Risk  Baton     ║
║ ─────────────────────────────────────────────────────────────────── ║
║ 1.1  M1  resize.end.symphony            13  S    57% HIGH  start    ║
║ 1.2  M1  resize.move.symphony           14  S    81% LOW   metrics  ║
║ 1.3  M1  endResize                      15  S    81% LOW   metrics  ║
║ 1.4  M1  resize                         14  S    61% MED   metrics  ║
║      🎭 Data Baton ▸ handoff: template + CSS metrics                ║
║ 2.1  M2  startResize                    15  S    62% MED   style    ║
║ 2.2  M2  updateSize                     13  S    59% HIGH  style    ║
║ 2.3  M2  resize.start.symphony          12  S    71% MED   style    ║
║ 2.4  M2  resize.symphony                15  S    63% MED   style    ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════╣
║ Size Bands    : Tiny 0 · Small 8 · Medium 0 · Large 0 · XL 0        ║
║ Coverage Dist.: 0–30% 0 · 30–60% 2 · 60–80% 4 · 80–100% 2           ║
║ Risk Summary  : CRITICAL 0 · HIGH 2 · MEDIUM 4 · LOW 2              ║
╚════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: CSS MANAGEMENT                                    ║
║ Domain : renderx-web-orchestration                                  ║
║ Package: control-panel                                              ║
║ Scope : 1 Symphony · 3 Movements · 8 Beats · 8 Handlers             ║
║ Health: 100 LOC · Avg Cov 74% · Size Band: SMALL · Risk: HIGH       ║
╠════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                        ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                   ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1               ║
║   Focus: template     Focus: styling     Focus: import + payload    ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════╣
║ Beat Mov Handler                      LOC  Sz  Cov  Risk  Baton     ║
║ ─────────────────────────────────────────────────────────────────── ║
║ 1.1  M1  applyCssClassToElement         12  S    70% MED   start    ║
║ 1.2  M1  createCssClass                 12  S    58% HIGH  metrics  ║
║ 1.3  M1  deleteCssClass                 13  S    72% MED   metrics  ║
║ 1.4  M1  getCssClass                    13  S    66% MED   metrics  ║
║      🎭 Data Baton ▸ handoff: template + CSS metrics                ║
║ 2.1  M2  listCssClasses                 13  S    54% HIGH  style    ║
║ 2.2  M2  removeCssClassFromElement      11  S    69% MED   style    ║
║ 2.3  M2  updateCssClass                 15  S    75% LOW   style    ║
║ 2.4  M2  css_management.symphony        11  S    72% MED   style    ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════╣
║ Size Bands    : Tiny 0 · Small 8 · Medium 0 · Large 0 · XL 0        ║
║ Coverage Dist.: 0–30% 0 · 30–60% 2 · 60–80% 6 · 80–100% 0           ║
║ Risk Summary  : CRITICAL 0 · HIGH 2 · MEDIUM 5 · LOW 1              ║
╚════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: DESELECT                                          ║
║ Domain : renderx-web-orchestration                                  ║
║ Package: canvas-component                                           ║
║ Scope : 1 Symphony · 3 Movements · 7 Beats · 7 Handlers             ║
║ Health: 88 LOC · Avg Cov 74% · Size Band: SMALL · Risk: MEDIUM      ║
╠════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                        ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                   ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1               ║
║   Focus: template     Focus: styling     Focus: import + payload    ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════╣
║ Beat Mov Handler                      LOC  Sz  Cov  Risk  Baton     ║
║ ─────────────────────────────────────────────────────────────────── ║
║ 1.1  M1  clearAllSelections             14  S    66% MED   start    ║
║ 1.2  M1  deselectComponent              15  S    76% LOW   metrics  ║
║ 1.3  M1  deselect                       13  S    64% MED   metrics  ║
║ 1.4  M1  hideAllOverlays                11  S    69% MED   metrics  ║
║      🎭 Data Baton ▸ handoff: template + CSS metrics                ║
║ 2.1  M2  publishDeselectionChanged      10  S    82% LOW   style    ║
║ 2.2  M2  publishSelectionsCleared       14  S    58% HIGH  style    ║
║ 2.3  M2  routeDeselectionRequest        10  S    65% MED   style    ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════╣
║ Size Bands    : Tiny 0 · Small 7 · Medium 0 · Large 0 · XL 0        ║
║ Coverage Dist.: 0–30% 0 · 30–60% 1 · 60–80% 5 · 80–100% 1           ║
║ Risk Summary  : CRITICAL 0 · HIGH 1 · MEDIUM 4 · LOW 2              ║
╚════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: IMPORT                                            ║
║ Domain : renderx-web-orchestration                                  ║
║ Package: canvas-component                                           ║
║ Scope : 1 Symphony · 3 Movements · 7 Beats · 7 Handlers             ║
║ Health: 88 LOC · Avg Cov 74% · Size Band: SMALL · Risk: MEDIUM      ║
╠════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                        ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                   ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1               ║
║   Focus: template     Focus: styling     Focus: import + payload    ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════╣
║ Beat Mov Handler                      LOC  Sz  Cov  Risk  Baton     ║
║ ─────────────────────────────────────────────────────────────────── ║
║ 1.1  M1  injectCssClasses               14  S    78% LOW   start    ║
║ 1.2  M1  openUiFile                     11  S    79% LOW   metrics  ║
║ 1.3  M1  registerInstances              14  S    67% MED   metrics  ║
║ 1.4  M1  applyHierarchyAndOrder         12  S    75% LOW   metrics  ║
║      🎭 Data Baton ▸ handoff: template + CSS metrics                ║
║ 2.1  M2  createComponentsSequentially   12  S    63% MED   style    ║
║ 2.2  M2  parseUiFile                    14  S    57% HIGH  style    ║
║ 2.3  M2  import.symphony                14  S    65% MED   style    ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════╣
║ Size Bands    : Tiny 0 · Small 7 · Medium 0 · Large 0 · XL 0        ║
║ Coverage Dist.: 0–30% 0 · 30–60% 1 · 60–80% 6 · 80–100% 0           ║
║ Risk Summary  : CRITICAL 0 · HIGH 1 · MEDIUM 3 · LOW 3              ║
╚════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: RESIZE LINE                                       ║
║ Domain : renderx-web-orchestration                                  ║
║ Package: canvas-component                                           ║
║ Scope : 1 Symphony · 3 Movements · 7 Beats · 7 Handlers             ║
║ Health: 88 LOC · Avg Cov 74% · Size Band: SMALL · Risk: MEDIUM      ║
╠════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                        ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                   ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1               ║
║   Focus: template     Focus: styling     Focus: import + payload    ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════╣
║ Beat Mov Handler                      LOC  Sz  Cov  Risk  Baton     ║
║ ─────────────────────────────────────────────────────────────────── ║
║ 1.1  M1  resize.line.end.symphony       13  S    77% LOW   start    ║
║ 1.2  M1  resize.line.move.symphony      13  S    61% MED   metrics  ║
║ 1.3  M1  endLineResize                  11  S    61% MED   metrics  ║
║ 1.4  M1  resize.line                    14  S    74% MED   metrics  ║
║      🎭 Data Baton ▸ handoff: template + CSS metrics                ║
║ 2.1  M2  startLineResize                12  S    65% MED   style    ║
║ 2.2  M2  updateLine                     12  S    65% MED   style    ║
║ 2.3  M2  resize.line.start.symphony     10  S    62% MED   style    ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════╣
║ Size Bands    : Tiny 0 · Small 7 · Medium 0 · Large 0 · XL 0        ║
║ Coverage Dist.: 0–30% 0 · 30–60% 0 · 60–80% 7 · 80–100% 0           ║
║ Risk Summary  : CRITICAL 0 · HIGH 0 · MEDIUM 6 · LOW 1              ║
╚════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: UPDATE                                            ║
║ Domain : renderx-web-orchestration                                  ║
║ Package: canvas-component                                           ║
║ Scope : 1 Symphony · 3 Movements · 7 Beats · 7 Handlers             ║
║ Health: 88 LOC · Avg Cov 74% · Size Band: SMALL · Risk: CRITICAL    ║
╠════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                        ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                   ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1               ║
║   Focus: template     Focus: styling     Focus: import + payload    ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════╣
║ Beat Mov Handler                      LOC  Sz  Cov  Risk  Baton     ║
║ ─────────────────────────────────────────────────────────────────── ║
║ 1.1  M1  refreshControlPanel            12  S    57% HIGH  start    ║
║ 1.2  M1  updateAttribute                12  S    62% MED   metrics  ║
║ 1.3  M1  refreshControlPanel            15  S    71% MED   metrics  ║
║ 1.4  M1  updateSvgNodeAttribute         10  S    68% MED   metrics  ║
║      🎭 Data Baton ▸ handoff: template + CSS metrics                ║
║ 2.1  M2  update.svg_node.symphony       12  S    60% MED   style    ║
║ 2.2  M2  updateFromElement              12  S    55% HIGH  style    ║
║ 2.3  M2  update.symphony                12  S    83% LOW   style    ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════╣
║ Size Bands    : Tiny 0 · Small 7 · Medium 0 · Large 0 · XL 0        ║
║ Coverage Dist.: 0–30% 0 · 30–60% 2 · 60–80% 4 · 80–100% 1           ║
║ Risk Summary  : CRITICAL 0 · HIGH 2 · MEDIUM 4 · LOW 1              ║
╚════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: LINE ADVANCED                                     ║
║ Domain : renderx-web-orchestration                                  ║
║ Package: canvas-component                                           ║
║ Scope : 1 Symphony · 3 Movements · 6 Beats · 6 Handlers             ║
║ Health: 75 LOC · Avg Cov 74% · Size Band: SMALL · Risk: MEDIUM      ║
╠════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                        ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                   ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1               ║
║   Focus: template     Focus: styling     Focus: import + payload    ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════╣
║ Beat Mov Handler                      LOC  Sz  Cov  Risk  Baton     ║
║ ─────────────────────────────────────────────────────────────────── ║
║ 1.1  M1  line.manip.end.symphony        12  S    79% LOW   start    ║
║ 1.2  M1  line.manip.move.symphony       11  S    76% LOW   metrics  ║
║ 1.3  M1  endLineManip                   11  S    55% HIGH  metrics  ║
║ 1.4  M1  moveLineManip                  12  S    77% LOW   metrics  ║
║      🎭 Data Baton ▸ handoff: template + CSS metrics                ║
║ 2.1  M2  startLineManip                 10  S    76% LOW   style    ║
║ 2.2  M2  line.manip.start.symphony      14  S    72% MED   style    ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════╣
║ Size Bands    : Tiny 0 · Small 6 · Medium 0 · Large 0 · XL 0        ║
║ Coverage Dist.: 0–30% 0 · 30–60% 1 · 60–80% 5 · 80–100% 0           ║
║ Risk Summary  : CRITICAL 0 · HIGH 1 · MEDIUM 1 · LOW 4              ║
╚════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: PASTE                                             ║
║ Domain : renderx-web-orchestration                                  ║
║ Package: canvas-component                                           ║
║ Scope : 1 Symphony · 3 Movements · 6 Beats · 6 Handlers             ║
║ Health: 75 LOC · Avg Cov 74% · Size Band: SMALL · Risk: MEDIUM      ║
╠════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                        ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                   ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1               ║
║   Focus: template     Focus: styling     Focus: import + payload    ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════╣
║ Beat Mov Handler                      LOC  Sz  Cov  Risk  Baton     ║
║ ─────────────────────────────────────────────────────────────────── ║
║ 1.1  M1  calculatePastePosition         11  S    56% HIGH  start    ║
║ 1.2  M1  createPastedComponent          11  S    57% HIGH  metrics  ║
║ 1.3  M1  deserializeComponentData       11  S    70% MED   metrics  ║
║ 1.4  M1  paste                          13  S    67% MED   metrics  ║
║      🎭 Data Baton ▸ handoff: template + CSS metrics                ║
║ 2.1  M2  notifyPasteComplete            12  S    84% LOW   style    ║
║ 2.2  M2  readFromClipboard              11  S    59% HIGH  style    ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════╣
║ Size Bands    : Tiny 0 · Small 6 · Medium 0 · Large 0 · XL 0        ║
║ Coverage Dist.: 0–30% 0 · 30–60% 3 · 60–80% 2 · 80–100% 1           ║
║ Risk Summary  : CRITICAL 0 · HIGH 3 · MEDIUM 2 · LOW 1              ║
╚════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: COPY                                              ║
║ Domain : renderx-web-orchestration                                  ║
║ Package: canvas-component                                           ║
║ Scope : 1 Symphony · 3 Movements · 4 Beats · 4 Handlers             ║
║ Health: 50 LOC · Avg Cov 74% · Size Band: SMALL · Risk: MEDIUM      ║
╠════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                        ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                   ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1               ║
║   Focus: template     Focus: styling     Focus: import + payload    ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════╣
║ Beat Mov Handler                      LOC  Sz  Cov  Risk  Baton     ║
║ ─────────────────────────────────────────────────────────────────── ║
║ 1.1  M1  copyToClipboard                10  S    64% MED   start    ║
║ 1.2  M1  copy                           10  S    73% MED   metrics  ║
║ 1.3  M1  notifyCopyComplete             13  S    80% LOW   metrics  ║
║ 1.4  M1  serializeSelectedComponent     11  S    74% MED   metrics  ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════╣
║ Size Bands    : Tiny 0 · Small 4 · Medium 0 · Large 0 · XL 0        ║
║ Coverage Dist.: 0–30% 0 · 30–60% 0 · 60–80% 3 · 80–100% 1           ║
║ Risk Summary  : CRITICAL 0 · HIGH 0 · MEDIUM 3 · LOW 1              ║
╚════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: DELETE                                            ║
║ Domain : renderx-web-orchestration                                  ║
║ Package: canvas-component                                           ║
║ Scope : 1 Symphony · 3 Movements · 4 Beats · 4 Handlers             ║
║ Health: 50 LOC · Avg Cov 74% · Size Band: SMALL · Risk: MEDIUM      ║
╠════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                        ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                   ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1               ║
║   Focus: template     Focus: styling     Focus: import + payload    ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════╣
║ Beat Mov Handler                      LOC  Sz  Cov  Risk  Baton     ║
║ ─────────────────────────────────────────────────────────────────── ║
║ 1.1  M1  deleteComponent                12  S    83% LOW   start    ║
║ 1.2  M1  delete                         13  S    65% MED   metrics  ║
║ 1.3  M1  publishDeleted                 10  S    72% MED   metrics  ║
║ 1.4  M1  routeDeleteRequest             13  S    78% LOW   metrics  ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════╣
║ Size Bands    : Tiny 0 · Small 4 · Medium 0 · Large 0 · XL 0        ║
║ Coverage Dist.: 0–30% 0 · 30–60% 0 · 60–80% 3 · 80–100% 1           ║
║ Risk Summary  : CRITICAL 0 · HIGH 0 · MEDIUM 2 · LOW 2              ║
╚════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: CLASSES                                           ║
║ Domain : renderx-web-orchestration                                  ║
║ Package: control-panel                                              ║
║ Scope : 1 Symphony · 3 Movements · 3 Beats · 3 Handlers             ║
║ Health: 38 LOC · Avg Cov 74% · Size Band: TINY · Risk: CRITICAL     ║
╠════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                        ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                   ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1               ║
║   Focus: template     Focus: styling     Focus: import + payload    ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════╣
║ Beat Mov Handler                      LOC  Sz  Cov  Risk  Baton     ║
║ ─────────────────────────────────────────────────────────────────── ║
║ 1.1  M1  addClass                       13  S    56% HIGH  start    ║
║ 1.2  M1  removeClass                    14  S    65% MED   metrics  ║
║ 1.3  M1  classes.symphony               15  S    54% HIGH  metrics  ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════╣
║ Size Bands    : Tiny 0 · Small 3 · Medium 0 · Large 0 · XL 0        ║
║ Coverage Dist.: 0–30% 0 · 30–60% 2 · 60–80% 1 · 80–100% 0           ║
║ Risk Summary  : CRITICAL 0 · HIGH 2 · MEDIUM 1 · LOW 0              ║
╚════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: CLIPBOARD                                         ║
║ Domain : renderx-web-orchestration                                  ║
║ Package: canvas-component                                           ║
║ Scope : 1 Symphony · 3 Movements · 2 Beats · 2 Handlers             ║
║ Health: 25 LOC · Avg Cov 74% · Size Band: TINY · Risk: LOW          ║
╠════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                        ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                   ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1               ║
║   Focus: template     Focus: styling     Focus: import + payload    ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════╣
║ Beat Mov Handler                      LOC  Sz  Cov  Risk  Baton     ║
║ ─────────────────────────────────────────────────────────────────── ║
║ 1.1  M1  getClipboardText               10  S    70% MED   start    ║
║ 1.2  M1  setClipboardText               15  S    55% HIGH  metrics  ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════╣
║ Size Bands    : Tiny 0 · Small 2 · Medium 0 · Large 0 · XL 0        ║
║ Coverage Dist.: 0–30% 0 · 30–60% 1 · 60–80% 1 · 80–100% 0           ║
║ Risk Summary  : CRITICAL 0 · HIGH 1 · MEDIUM 1 · LOW 0              ║
╚════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: AUGMENT                                           ║
║ Domain : renderx-web-orchestration                                  ║
║ Package: canvas-component                                           ║
║ Scope : 1 Symphony · 3 Movements · 2 Beats · 2 Handlers             ║
║ Health: 25 LOC · Avg Cov 74% · Size Band: TINY · Risk: LOW          ║
╠════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                        ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                   ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1               ║
║   Focus: template     Focus: styling     Focus: import + payload    ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════╣
║ Beat Mov Handler                      LOC  Sz  Cov  Risk  Baton     ║
║ ─────────────────────────────────────────────────────────────────── ║
║ 1.1  M1  enhanceLine                    14  S    77% LOW   start    ║
║ 1.2  M1  recomputeLineSvg               14  S    71% MED   metrics  ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════╣
║ Size Bands    : Tiny 0 · Small 2 · Medium 0 · Large 0 · XL 0        ║
║ Coverage Dist.: 0–30% 0 · 30–60% 0 · 60–80% 2 · 80–100% 0           ║
║ Risk Summary  : CRITICAL 0 · HIGH 0 · MEDIUM 1 · LOW 1              ║
╚════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: SELECTION                                         ║
║ Domain : renderx-web-orchestration                                  ║
║ Package: control-panel                                              ║
║ Scope : 1 Symphony · 3 Movements · 2 Beats · 2 Handlers             ║
║ Health: 25 LOC · Avg Cov 74% · Size Band: TINY · Risk: MEDIUM       ║
╠════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                        ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                   ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1               ║
║   Focus: template     Focus: styling     Focus: import + payload    ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════╣
║ Beat Mov Handler                      LOC  Sz  Cov  Risk  Baton     ║
║ ─────────────────────────────────────────────────────────────────── ║
║ 1.1  M1  deriveSelectionModel           10  S    65% MED   start    ║
║ 1.2  M1  selection.symphony             10  S    78% LOW   metrics  ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════╣
║ Size Bands    : Tiny 0 · Small 2 · Medium 0 · Large 0 · XL 0        ║
║ Coverage Dist.: 0–30% 0 · 30–60% 0 · 60–80% 2 · 80–100% 0           ║
║ Risk Summary  : CRITICAL 0 · HIGH 0 · MEDIUM 1 · LOW 1              ║
╚════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: DROP.CONTAINER                                    ║
║ Domain : renderx-web-orchestration                                  ║
║ Package: library-component                                          ║
║ Scope : 1 Symphony · 3 Movements · 1 Beats · 1 Handlers             ║
║ Health: 13 LOC · Avg Cov 74% · Size Band: TINY · Risk: CRITICAL     ║
╠════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                        ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                   ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1               ║
║   Focus: template     Focus: styling     Focus: import + payload    ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════╣
║ Beat Mov Handler                      LOC  Sz  Cov  Risk  Baton     ║
║ ─────────────────────────────────────────────────────────────────── ║
║ 1.1  M1  drop.container.symphony        15  S    66% MED   start    ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════╣
║ Size Bands    : Tiny 0 · Small 1 · Medium 0 · Large 0 · XL 0        ║
║ Coverage Dist.: 0–30% 0 · 30–60% 0 · 60–80% 1 · 80–100% 0           ║
║ Risk Summary  : CRITICAL 0 · HIGH 0 · MEDIUM 1 · LOW 0              ║
╚════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: DROP                                              ║
║ Domain : renderx-web-orchestration                                  ║
║ Package: library-component                                          ║
║ Scope : 1 Symphony · 3 Movements · 1 Beats · 1 Handlers             ║
║ Health: 13 LOC · Avg Cov 74% · Size Band: TINY · Risk: LOW          ║
╠════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                        ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                   ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1               ║
║   Focus: template     Focus: styling     Focus: import + payload    ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════╣
║ Beat Mov Handler                      LOC  Sz  Cov  Risk  Baton     ║
║ ─────────────────────────────────────────────────────────────────── ║
║ 1.1  M1  drop.symphony                  11  S    71% MED   start    ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════╣
║ Size Bands    : Tiny 0 · Small 1 · Medium 0 · Large 0 · XL 0        ║
║ Coverage Dist.: 0–30% 0 · 30–60% 0 · 60–80% 1 · 80–100% 0           ║
║ Risk Summary  : CRITICAL 0 · HIGH 0 · MEDIUM 1 · LOW 0              ║
╚════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: LOAD                                              ║
║ Domain : renderx-web-orchestration                                  ║
║ Package: library                                                    ║
║ Scope : 1 Symphony · 3 Movements · 1 Beats · 1 Handlers             ║
║ Health: 13 LOC · Avg Cov 74% · Size Band: TINY · Risk: LOW          ║
╠════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                        ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                   ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1               ║
║   Focus: template     Focus: styling     Focus: import + payload    ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════╣
║ Beat Mov Handler                      LOC  Sz  Cov  Risk  Baton     ║
║ ─────────────────────────────────────────────────────────────────── ║
║ 1.1  M1  load.symphony                  15  S    73% MED   start    ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════╣
║ Size Bands    : Tiny 0 · Small 1 · Medium 0 · Large 0 · XL 0        ║
║ Coverage Dist.: 0–30% 0 · 30–60% 0 · 60–80% 1 · 80–100% 0           ║
║ Risk Summary  : CRITICAL 0 · HIGH 0 · MEDIUM 1 · LOW 0              ║
╚════════════════════════════════════════════════════════════════════╝

        ║  │                                  ║
        ║  └─ ... (+ 15 more symphonies)      ║
        ║     with 100+ additional handlers   ║
        ║                                     ║
        ╚═════════════════════════════════════╝
                        │
                        ▼
        ╔═══════════════════════════════════════════════════════╗
        ║   QUALITY & COVERAGE METRICS                         ║
        ╠═══════════════════════════════════════════════════════╣
        ║                                                       ║
        ║  Handlers Analyzed: 403                              ║
        ║  Avg LOC/Handler: 12.52                              ║
        ║  Test Coverage: 74.0%                                  ║
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
║ MEDIUM  : 1                                 ║
║   - Missing complexity threshold validation  ║
║ LOW     : 1                                 ║
╚══════════════════════════════════════════════╝

╔════ REFACTORING ROADMAP ══════════════════════════════╗
║ 1. Reduce code duplication                             ║
║   Target : High duplication areas                      ║
║   Effort : medium                                      ║
║   Rationale: Current duplication: 78.3%. Target: <50%  ║
║   PR: refactor: extract common code patterns to reduce ║
║                                                        ║
║ 2. Improve test coverage                               ║
║   Target : Uncovered handlers                          ║
║   Effort : medium                                      ║
║   Rationale: Current coverage: 74.0%. Target: 80%+     ║
║   PR: test: add comprehensive unit tests for core handl║
║                                                        ║
║ 3. Enhance maintainability                             ║
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
  ✅ Discovered: 787 source files in renderx-web-orchestration
  ✅ Analyzed: 403 handler functions with measured LOC (5045 total lines)
  ✅ Mapped: Files to orchestration beats
  ✅ Measured: Test coverage (avg 74.0%)
  ✅ No God handlers detected
  ✅ Generated: Comprehensive metrics and analysis artifacts

NEXT ACTIONS:
  → Review detailed metrics in full report
  → Reduce code duplication from 78.3% to <50%
  → Improve test coverage to 80%+ (currently 74.0%)
  

═════════════════════════════════════════════════════════════════════════════════════════════════════════════════════


---

## Movement 1: Code Discovery & Beat Mapping

**Purpose**: Discover all source files and map them to orchestration beats

- **Files Discovered**: 787
- **Beats Completed**: 4/4 ✓
- **Beat Mappings**:
  - Beat 1 (Discovery): 0 files
  - Beat 2 (Baseline): 367 files
  - Beat 3 (Structure): 293 files
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

**Measurement**: Source='measured' (AST region hashing across 243 files)
**Last Scan**: 2025-11-28T19:59:42.704Z

### Maintainability Index
- **Score**: 62.19/100
- **Classification**: 🟡 **FAIR** (B)
- **Threshold**: 60-80
- **Guidance**: Address technical debt in next sprint. Schedule refactoring review.
- **Contributing Factors**:
  - Test Coverage: 79.7%
  - Documentation: 72.5%
  - Comment Density: 46.6%
  - Complexity Score: 51.8

---

## Movement 3: Test Coverage Analysis (Orchestration Suite)

**Purpose**: Measure statement, branch, function, and line coverage

**Scope**: Full `renderx-web-orchestration` domain - all source files in `packages/` analyzed

### Coverage Metrics
| Type | Coverage | Target | Gap | Status |
|------|----------|--------|-----|--------|
| Statements | 74.02% | 80% | -6.0% | 🟡 Needs Improvement |
| Branches | 68.36% | 75% | -6.6% | 🔴 Off-track |
| Functions | 79.85% | 80% | -0.2% | 🔴 Off-track |
| Lines | 83.97% | 80% | 4.0% | 🟢 Close |

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
- **Registry-only Domains**: 1

### Handler Metrics

✅ **403 handlers discovered**

✅ **403 handlers discovered**

**By Type:**
  * generic: 292
  * validation: 26
  * initialization: 21
  * input: 21
  * event: 15
  * output: 9
  * ui-interaction: 8
  * execution: 5
  * error-handling: 4
  * transformation: 2

**Top Handlers:**
  * getClipboardText (generic) — packages/canvas-component/src/symphonies/_clipboard.ts
  * setClipboardText (generic) — packages/canvas-component/src/symphonies/_clipboard.ts
  * enhanceLine (generic) — packages/canvas-component/src/symphonies/augment/augment.line.stage-crew.ts
  * recomputeLineSvg (generic) — packages/canvas-component/src/symphonies/augment/line.recompute.stage-crew.ts
  * copyToClipboard (generic) — packages/canvas-component/src/symphonies/copy/copy.stage-crew.ts
  * ... and 398 more

**Measurement**: Source='measured' (real discovered exports via pattern matching)
**Coverage**: Handlers distributed across 10 types
**Last Scan**: 2025-11-28T19:59:42.466Z

### Handler Scope Analysis

**Scope Definition**: The handler scope/kind layer distinguishes orchestration handlers (system-level logic) from plugin handlers (feature-level logic).

# Handler Scope Analysis Report

**Generated**: 2025-11-28T19:59:42.492Z

## Overview

The handler scope/kind metadata introduced on 2025-11-27 distinguishes orchestration-level handlers (system logic) from plugin-level handlers (feature logic).

## Summary Statistics

| Scope | Count | Percentage | Sequences | Stages |
|-------|-------|-----------|-----------|--------|
| Orchestration | 92 | 47.2% | 3 | discovery, metrics, coverage, conformity |
| Plugin | 103 | 52.8% | 48 | N/A |
| Unknown | 0 | 0.0% | - | - |
| **TOTAL** | **195** | **100%** | - | - |

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


## Plugin Handlers (103)

Plugin handlers implement feature-level logic (UI behavior, component interactions).

### Top Sequences by Handler Count

| Sequence | Handler Count |
|----------|---|
| control-panel-ui-init-symphony | 6 |
| control-panel-ui-init-batched-symphony | 6 |
| canvas-component-export-symphony | 6 |
| canvas-component-create-symphony | 6 |
| canvas-component-paste-symphony | 5 |
| canvas-component-import-symphony | 5 |
| control-panel-ui-field-change-symphony | 4 |
| control-panel-ui-render-symphony | 3 |
| control-panel-ui-field-validate-symphony | 3 |
| canvas-component-select-symphony | 3 |
| canvas-component-copy-symphony | 3 |
| library-load-symphony | 2 |
| header-ui-theme-get-symphony | 2 |
| control-panel-update-symphony | 2 |
| control-panel-selection-show-symphony | 2 |


## Unknown Scope Handlers (0)

These handlers need scope assignment:



## Key Metrics

- **Orchestration Coverage**: 92 handlers across 3 sequences
- **Plugin Coverage**: 103 handlers across 48 sequences
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

**Overall**: 🟡 **65.63/100** (FAIR)

**Component Scores:**
| Component | Score | Target | Status |
|-----------|-------|--------|--------|
| Handler Coverage | 100.00% | 90%+ | ✓ |
| Beat Coverage | 40.00% | 100% | ⚠ |
| Mapping Confidence | 68.14% | 80%+ | ⚠ |
| Distribution | 0.00% | 80%+ | ⚠ |

**Metrics:**
- Mapped Handlers: 403/403
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

**Mapping Status**: 403/403 handlers have explicit beat mappings. Coverage heatmap reflects current measurement scope.

**Heatmap Terminology**: "Unassigned" in the Coverage Heatmap table refers to handlers without coverage measurement data correlated to specific beats in the current analysis scope, not to unmapped handlers. All 38 handlers have explicit beat assignments in the orchestration-domains.json mapping.

## Coverage by Handler Analysis

### Overall Test Coverage
**Global Coverage**: 83.8% statements

| Metric | Coverage | Status |
|--------|----------|--------|
| Statements | 83.8% | 🟢 |
| Branches | 83.35% | 🟢 |
| Functions | 81.06% | 🟢 |
| Lines | 78.81% | 🟡 |

### Handler Coverage Summary
| Category | Count | % | Status |
|----------|-------|---|--------|
| Well-Covered (80%+) | 140 | 71.8% | ✅ |
| Partially-Covered (50-79%) | 55 | 28.2% | ⚠️ |
| Poorly-Covered (1-49%) | 0 | 0.0% | ⚠️ |
| Uncovered (0%) | 0 | 0.0% | ❌ |

**Average Handler Coverage**: 81.6%

**Handlers**: 195 | **Average LOC per Handler**: 23.68 | **Total LOC**: 2202

### Coverage Heatmap by Beat

| Beat | Avg Coverage | Handlers | Status |
|------|--------------|----------|--------|
| beat-2-baseline | 83.83% | 46 | ✅ |
| beat-4-dependencies | 83.3% | 44 | ✅ |
| beat-3-structure | 83.14% | 81 | ✅ |
| beat-1-discovery | 68.99% | 24 | ⚠️ |

### ✅ Well-Tested Handlers (Coverage >= 80%)
| Handler | Coverage | Beat |
|---------|----------|------|
| items | 88.67% | beat-4-dependencies |
| component | 88.39% | beat-2-baseline |
| removeClass | 88.35% | beat-3-structure |
| addClass | 88.25% | beat-3-structure |
| applyCssClassToElement | 88.2% | beat-3-structure |
| attachAdvancedLineManipHandlers | 88.18% | beat-2-baseline |
| clearAllSelections | 88.16% | beat-2-baseline |
| injectCssClasses | 88.16% | beat-4-dependencies |

**Measurement**: Source='measured' (test coverage analysis with handler-beat correlation)
**Timestamp**: 2025-11-28T19:59:43.091Z


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
- Package contains 142 handlers clustered together. Consider extracting into specialized sub-modules or consolidating related handlers.

**[P2] Refactor handler clustering in "self-healing"**
- Package contains 62 handlers clustered together. Consider extracting into specialized sub-modules or consolidating related handlers.

**[P2] Refactor handler clustering in "control-panel"**
- Package contains 57 handlers clustered together. Consider extracting into specialized sub-modules or consolidating related handlers.

**[P2] Refactor handler clustering in "musical-conductor"**
- Package contains 56 handlers clustered together. Consider extracting into specialized sub-modules or consolidating related handlers.

**[P2] Refactor handler clustering in "library"**
- Package contains 38 handlers clustered together. Consider extracting into specialized sub-modules or consolidating related handlers.

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

Package contains 142 handlers clustered together. Consider extracting into specialized sub-modules or consolidating related handlers.

**Recommendation**: Split into 2-3 focused modules or consolidate into handler factory
**Impact**: +145 points | -8 (reduce module complexity) | Improved (easier to isolate functionality)

**PR Template** (use `npm run generate:pr -- CLUSTER-01` to generate):
```markdown
# Refactor handler clustering in "canvas-component"
Package contains 142 handlers clustered together. Consider extracting into specialized sub-modules or consolidating related handlers.

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
- Timestamp: 2025-11-28T19:59:43.355Z


### Historical Trend Analysis

**Note**: Trend coverage metrics may differ from current run's Movement 3 metrics due to snapshot timing and aggregation. These represent baseline or averaged coverage, not current execution coverage.

## Historical Trend Analysis

**Analysis Period**: Last 30 snapshots
**Current Baseline**: 2025-11-28T19:59:43.647Z

### Overall Trend Summary

| Metric | Current | Previous | Change | Trend | Direction |
|--------|---------|----------|--------|-------|-----------|
| Handler Count | 403 | 403 | - | New | - |
| Duplication (blocks) | 562 | 562 | - | Monitoring | - |
| Coverage (avg) | 85.28% | 42.17% | - | Monitoring | - |
| Maintainability | 75.33/100 | - | - | Baseline | - |
| Conformity | 87.50% | - | - | Baseline | - |

### Handler Metrics

**Current State**: 403 handlers discovered

**Handler Tracking:**
- Starting baseline: 403 handlers
- Types detected: 10
- Target for next sprint: 484 (20% growth for enhanced coverage)
- Health score: 54/100 (POOR - focus on distribution)

**Expected Evolution**:
- Week 4: 424 handlers (Type-specific handlers added)
- Week 8: 464 handlers (Enhanced testing harness)
- Week 12: 524 handlers (Full handler decomposition)

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
| Statements | 84.48% | 85% | 0.52% | 🟡 Close |
| Branches | 86.09% | 85% | -1.09% | 🟡 Close |
| Functions | 77.14% | 90% | 12.86% | 🟡 Close |
| Lines | 85.08% | 85% | -0.08% | ✅ On-target |

**Coverage Improvement Roadmap**:
- **Week 2**: Add 5-8 integration tests → +3% statements
- **Week 4**: Refactor handler coverage → +5% branches
- **Week 6**: Beat 4 expansion → +8% functions
- **Target**: 85%+ all metrics by week 8

### Maintainability Trends

**Current Maintainability Index**: 75.33/100

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
- Handlers: 403
- Duplication: 145.55%
- Coverage: 85.28%
- Maintainability: 75.33/100
- Conformity: 87.50%

**Projected (Week 4)**:
- Handlers: +5% → 424
- Duplication: -15% → 130.55%
- Coverage: +3-5% → 89.28%
- Maintainability: +5 → 80.33/100
- Conformity: +2% → 89.50%

**Projected (Week 8 - Full Sprint)**:
- Handlers: +15% → 464
- Duplication: -30% → 115.55%
- Coverage: +8-10% → 94.28%
- Maintainability: +15 → 90.33/100
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

**Timestamp**: 2025-11-28T19:59:43.653Z
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
✓ Coverage - Orchestration Suite (74.02%) ❌
✓ Handler Scanning (403 handlers discovered) ✅

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

- **JSON Analysis**: renderx-web-orchestration-code-analysis-2025-11-28T19-59-41-744Z.json
- **Coverage Summary**: renderx-web-orchestration-coverage-summary-2025-11-28T19-59-41-744Z.json
- **Per-Beat Metrics**: renderx-web-orchestration-per-beat-metrics-2025-11-28T19-59-41-744Z.csv
- **Trend Analysis**: renderx-web-orchestration-trends-2025-11-28T19-59-41-744Z.json

---

*Report auto-generated from symphonic-code-analysis-pipeline. All metrics are immutable and traceable to source analysis.*
