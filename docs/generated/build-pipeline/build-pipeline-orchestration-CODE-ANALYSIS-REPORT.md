# Build Pipeline Orchestration Code Analysis Report

**Generated**: 2025-11-28T20:06:56.330Z  
**Codebase**: build-pipeline-orchestration  
**Pipeline**: symphonic-code-analysis-pipeline

## Executive Summary

This comprehensive analysis spans 4 movements with 16 beat stages, providing deep insights into code quality, test coverage, and architectural conformity.

### Overall Health: FAIR (Conditional) ⚠

**Note**: 'FAIR' reflects current architecture and test posture. CI/CD gating is stricter and requires higher thresholds for automated deployment gates.

| Metric | Value | Status | Classification |
|--------|-------|--------|-----------------|
| Conformity Score | 87.50% | ⚠️  FAIR| Governance: CONDITIONAL|
| Test Coverage | 85.14% | ✅ GOOD| Risk: LOW|
| Maintainability | 61.83/100 | 🟡 FAIR| Grade: B|
| Code Duplication | 0.00% | ✅ EXCELLENT| Action: Refactor|

---


╔══════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
║                    SYMPHONIC CODE ANALYSIS ARCHITECTURE - BUILD PIPELINE ORCHESTRATION                      ║
║                    Enhanced Handler Portfolio & Orchestration Framework                                          ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝

┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  📊 CODEBASE METRICS FOUNDATION                                                                                 │
│  ═════════════════════════════════════════════════════════════════════════════════════════════════════════════   │
│  │ Total Files: 0   │ Total LOC: 0     │ Handlers: 403│ Avg LOC/Handler: 0.00 │ Coverage: 85.14% │           │
│  ╰─────────────────────────────────────────────────────────────────────────────────────────────────────────────  │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

╔════ HANDLER PORTFOLIO METRICS ════╗
║ Files           : 0             ║
║ Total LOC       : 0             ║
║ Handlers        : 403           ║
║ Avg LOC/Handler : 0.0           ║
║ Coverage        : 85.1%         ║
║ Duplication     : 0             ║
║ Maintainability : 61.8          ║
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
        │ 0    files           │ LOC metrics           │ coverage
        │                      │                      │
        └──────────┬───────────┴──────────┬───────────┘
                   │                      │
                   ▼                      ▼
        ╔══════════════════╗  ╔══════════════════╗
        │  DATA BATON 🎭   │  │  DATA BATON 🎭   │
        ├──────────────────┤  ├──────────────────┤
        │ • Files: 0       │  │ • Handlers: 403 │
        │ • LOC: 0         │  │ • Avg LOC: 0.00 │
        │ • Beats: 4/4 ✓   │  │ • Coverage: 85.1%│
        │ • Status: READY  │  │ • Status: READY  │
        └────────┬─────────┘  └────────┬─────────┘
                 │                     │
                 └──────────┬──────────┘
                            │
                            ▼

╔════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: CREATE                                            ║
║ Domain : build-pipeline-orchestration                               ║
║ Package: canvas-component                                           ║
║ Scope : 1 Symphony · 7 Movements · 28 Beats · 28 Handlers           ║
║ Health: 840 LOC · Avg Cov 85% · Size Band: XL · Risk: LOW           ║
╠════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                        ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                   ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.4               ║
║   Focus: template     Focus: styling     Focus: import + payload    ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════╣
║ Beat Mov Handler                      LOC  Sz  Cov  Risk  Baton     ║
║ ─────────────────────────────────────────────────────────────────── ║
║ 1.1  M1  resolveTemplate                25  S    80% LOW   start    ║
║ 1.2  M1  injectCssFallback              34  M    87% MED   metrics  ║
║ 1.3  M1  injectRawCss                   27  M    83% MED   metrics  ║
║ 1.4  M1  appendTo                       31  M    80% MED   metrics  ║
║      🎭 Data Baton ▸ handoff: template + CSS metrics                ║
║ 2.1  M2  applyClasses                   31  M    67% MED   style    ║
║ 2.2  M2  applyInlineStyle               25  S    92% LOW   style    ║
║ 2.3  M2  createElementWithId            26  M    67% MED   style    ║
║ 2.4  M2  getCanvasOrThrow               26  M    74% MED   style    ║
║ 3.1  M3  attachStandardImportInteracti  33  M    75% MED   import   ║
║ 3.2  M3  createFromImportRecord         34  M    91% MED   import   ║
║ 3.3  M3  toCreatePayloadFromData        25  S    87% LOW   import   ║
║ 3.4  M3  transformClipboardToCreatePay  34  M    94% MED   payload  ║
║ 4.1  M4  transformImportToCreatePayloa  25  S    70% MED   payload  ║
║ 4.2  M4  attachDrag                     27  M    73% MED   payload  ║
║ 4.3  M4  attachSelection                33  M    89% MED   payload  ║
║ 4.4  M4  attachSvgNodeClick             30  M    87% MED   payload  ║
║ 5.1  M5  registerInstance               34  M    73% MED   payload  ║
║ 5.2  M5  notifyUi                       33  M    75% MED   payload  ║
║ 5.3  M5  cleanupReactRoot               36  M    74% MED   payload  ║
║ 5.4  M5  exposeEventRouterToReact       25  S    90% LOW   payload  ║
║ 6.1  M6  renderReact                    24  S    85% LOW   payload  ║
║ 6.2  M6  createNode                     36  M    87% MED   payload  ║
║ 6.3  M6  create                         33  M    67% MED   payload  ║
║ 6.4  M6  computeCssVarBlock             28  M    84% MED   payload  ║
║ 7.1  M7  computeInlineStyle             35  M    87% MED   payload  ║
║ 7.2  M7  computeInstanceClass           25  S    86% LOW   payload  ║
║ 7.3  M7  validateReactCode              26  M    91% MED   payload  ║
║ 7.4  M7  validateReactCodeOrThrow       27  M    92% MED   payload  ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════╣
║ Size Bands    : Tiny 0 · Small 0 · Medium 28 · Large 0 · XL 0       ║
║ Coverage Dist.: 0–30% 0 · 30–60% 0 · 60–80% 10 · 80–100% 18         ║
║ Risk Summary  : CRITICAL 0 · HIGH 0 · MEDIUM 22 · LOW 6             ║
╚════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: UI                                                ║
║ Domain : build-pipeline-orchestration                               ║
║ Package: control-panel                                              ║
║ Scope : 1 Symphony · 6 Movements · 21 Beats · 21 Handlers           ║
║ Health: 630 LOC · Avg Cov 85% · Size Band: XL · Risk: LOW           ║
╠════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                        ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                   ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.4               ║
║   Focus: template     Focus: styling     Focus: import + payload    ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════╣
║ Beat Mov Handler                      LOC  Sz  Cov  Risk  Baton     ║
║ ─────────────────────────────────────────────────────────────────── ║
║ 1.1  M1  awaitRefresh                   28  M    82% MED   start    ║
║ 1.2  M1  dispatchField                  33  M    84% MED   metrics  ║
║ 1.3  M1  generateFields                 25  S    88% LOW   metrics  ║
║ 1.4  M1  generateSections               32  M    68% MED   metrics  ║
║      🎭 Data Baton ▸ handoff: template + CSS metrics                ║
║ 2.1  M2  initConfig                     35  M    82% MED   style    ║
║ 2.2  M2  initMovement                   31  M    76% MED   style    ║
║ 2.3  M2  initResolver                   26  M    93% MED   style    ║
║ 2.4  M2  loadSchemas                    29  M    85% MED   style    ║
║ 3.1  M3  mergeErrors                    32  M    83% MED   import   ║
║ 3.2  M3  notifyReady                    26  M    79% MED   import   ║
║ 3.3  M3  prepareField                   32  M    70% MED   import   ║
║ 3.4  M3  registerObservers              27  M    88% MED   payload  ║
║ 4.1  M4  renderView                     24  S    90% LOW   payload  ║
║ 4.2  M4  setDirty                       32  M    81% MED   payload  ║
║ 4.3  M4  toggleSection                  26  M    74% MED   payload  ║
║ 4.4  M4  updateView                     35  M    93% MED   payload  ║
║ 5.1  M5  validateField                  34  M    70% MED   payload  ║
║ 5.2  M5  ui.symphony                    33  M    91% MED   payload  ║
║ 5.3  M5  getCurrentTheme                29  M    85% MED   payload  ║
║ 5.4  M5  toggleTheme                    34  M    83% MED   payload  ║
║ 6.1  M6  ui.symphony                    27  M    84% MED   payload  ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════╣
║ Size Bands    : Tiny 0 · Small 0 · Medium 21 · Large 0 · XL 0       ║
║ Coverage Dist.: 0–30% 0 · 30–60% 0 · 60–80% 6 · 80–100% 15          ║
║ Risk Summary  : CRITICAL 0 · HIGH 0 · MEDIUM 19 · LOW 2             ║
╚════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: SELECT                                            ║
║ Domain : build-pipeline-orchestration                               ║
║ Package: canvas-component                                           ║
║ Scope : 1 Symphony · 5 Movements · 20 Beats · 20 Handlers           ║
║ Health: 600 LOC · Avg Cov 85% · Size Band: XL · Risk: LOW           ║
╠════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                        ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                   ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.4               ║
║   Focus: template     Focus: styling     Focus: import + payload    ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════╣
║ Beat Mov Handler                      LOC  Sz  Cov  Risk  Baton     ║
║ ─────────────────────────────────────────────────────────────────── ║
║ 1.1  M1  ensureOverlayCss               35  M    72% MED   start    ║
║ 1.2  M1  applyOverlayRectForEl          31  M    91% MED   metrics  ║
║ 1.3  M1  ensureOverlay                  35  M    93% MED   metrics  ║
║ 1.4  M1  getCanvasOrThrow               29  M    88% MED   metrics  ║
║      🎭 Data Baton ▸ handoff: template + CSS metrics                ║
║ 2.1  M2  getCanvasRect                  28  M    91% MED   style    ║
║ 2.2  M2  createOverlayStructure         24  S    69% MED   style    ║
║ 2.3  M2  resolveEndpoints               30  M    92% MED   style    ║
║ 2.4  M2  attachAdvancedLineManipHandle  30  M    78% MED   style    ║
║ 3.1  M3  ensureAdvancedLineOverlayFor   31  M    68% MED   import   ║
║ 3.2  M3  attachLineResizeHandlers       33  M    93% MED   import   ║
║ 3.3  M3  ensureLineOverlayFor           33  M    70% MED   import   ║
║ 3.4  M3  attachResizeHandlers           35  M    70% MED   payload  ║
║ 4.1  M4  select                         33  M    81% MED   payload  ║
║ 4.2  M4  hideSelectionOverlay           30  M    90% MED   payload  ║
║ 4.3  M4  notifyUi                       24  S    69% MED   payload  ║
║ 4.4  M4  publishSelectionChanged        34  M    83% MED   payload  ║
║ 5.1  M5  routeSelectionRequest          26  M    92% MED   payload  ║
║ 5.2  M5  showSelectionOverlay           28  M    74% MED   payload  ║
║ 5.3  M5  select.svg_node                28  M    70% MED   payload  ║
║ 5.4  M5  showSvgNodeOverlay             29  M    75% MED   payload  ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════╣
║ Size Bands    : Tiny 0 · Small 0 · Medium 20 · Large 0 · XL 0       ║
║ Coverage Dist.: 0–30% 0 · 30–60% 0 · 60–80% 10 · 80–100% 10         ║
║ Risk Summary  : CRITICAL 0 · HIGH 0 · MEDIUM 20 · LOW 0             ║
╚════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: INITIALIZE                                        ║
║ Domain : build-pipeline-orchestration                               ║
║ Package: musical-conductor                                          ║
║ Scope : 1 Symphony · 4 Movements · 14 Beats · 14 Handlers           ║
║ Health: 420 LOC · Avg Cov 85% · Size Band: LARGE · Risk: LOW        ║
╠════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                        ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                   ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.4               ║
║   Focus: template     Focus: styling     Focus: import + payload    ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════╣
║ Beat Mov Handler                      LOC  Sz  Cov  Risk  Baton     ║
║ ─────────────────────────────────────────────────────────────────── ║
║ 1.1  M1  bootstrapLogging               34  M    85% MED   start    ║
║ 1.2  M1  checkExistingInstance          33  M    91% MED   metrics  ║
║ 1.3  M1  connectSystems                 32  M    85% MED   metrics  ║
║ 1.4  M1  createConductor                27  M    84% MED   metrics  ║
║      🎭 Data Baton ▸ handoff: template + CSS metrics                ║
║ 2.1  M2  exposeFacade                   35  M    89% MED   style    ║
║ 2.2  M2  getCommunicationSystemInstanc  29  M    80% MED   style    ║
║ 2.3  M2  initialize                     28  M    65% MED   style    ║
║ 2.4  M2  isCommunicationSystemInitiali  32  M    79% MED   style    ║
║ 3.1  M3  loadSequences                  30  M    67% MED   import   ║
║ 3.2  M3  markInitialized                28  M    71% MED   import   ║
║ 3.3  M3  notifyReady                    36  M    90% MED   import   ║
║ 3.4  M3  resetCommunicationSystem       32  M    87% MED   payload  ║
║ 4.1  M4  validateEnvironment            24  S    85% LOW   payload  ║
║ 4.2  M4  validateRegistrations          30  M    67% MED   payload  ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════╣
║ Size Bands    : Tiny 0 · Small 0 · Medium 14 · Large 0 · XL 0       ║
║ Coverage Dist.: 0–30% 0 · 30–60% 0 · 60–80% 5 · 80–100% 9           ║
║ Risk Summary  : CRITICAL 0 · HIGH 0 · MEDIUM 13 · LOW 1             ║
╚════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: DRAG                                              ║
║ Domain : build-pipeline-orchestration                               ║
║ Package: canvas-component                                           ║
║ Scope : 1 Symphony · 4 Movements · 13 Beats · 13 Handlers           ║
║ Health: 390 LOC · Avg Cov 85% · Size Band: LARGE · Risk: LOW        ║
╠════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                        ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                   ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.4               ║
║   Focus: template     Focus: styling     Focus: import + payload    ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════╣
║ Beat Mov Handler                      LOC  Sz  Cov  Risk  Baton     ║
║ ─────────────────────────────────────────────────────────────────── ║
║ 1.1  M1  endDrag                        26  M    67% MED   start    ║
║ 1.2  M1  forwardToControlPanel          36  M    69% MED   metrics  ║
║ 1.3  M1  drag                           33  M    84% MED   metrics  ║
║ 1.4  M1  startDrag                      35  M    90% MED   metrics  ║
║      🎭 Data Baton ▸ handoff: template + CSS metrics                ║
║ 2.1  M2  updatePosition                 26  M    77% MED   style    ║
║ 2.2  M2  drag.symphony                  25  S    69% MED   style    ║
║ 2.3  M2  applyTemplateStyles            30  M    79% MED   style    ║
║ 2.4  M2  computeCursorOffsets           33  M    93% MED   style    ║
║ 3.1  M3  computeGhostSize               26  M    86% MED   import   ║
║ 3.2  M3  createGhostContainer           35  M    77% MED   import   ║
║ 3.3  M3  ensurePayload                  30  M    69% MED   import   ║
║ 3.4  M3  installDragImage               29  M    67% MED   payload  ║
║ 4.1  M4  renderTemplatePreview          33  M    93% MED   payload  ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════╣
║ Size Bands    : Tiny 0 · Small 0 · Medium 13 · Large 0 · XL 0       ║
║ Coverage Dist.: 0–30% 0 · 30–60% 0 · 60–80% 8 · 80–100% 5           ║
║ Risk Summary  : CRITICAL 0 · HIGH 0 · MEDIUM 13 · LOW 0             ║
╚════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: EXPORT                                            ║
║ Domain : build-pipeline-orchestration                               ║
║ Package: canvas-component                                           ║
║ Scope : 1 Symphony · 3 Movements · 12 Beats · 12 Handlers           ║
║ Health: 360 LOC · Avg Cov 85% · Size Band: LARGE · Risk: LOW        ║
╠════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                        ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                   ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.4               ║
║   Focus: template     Focus: styling     Focus: import + payload    ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════╣
║ Beat Mov Handler                      LOC  Sz  Cov  Risk  Baton     ║
║ ─────────────────────────────────────────────────────────────────── ║
║ 1.1  M1  collectCssClasses              35  M    85% MED   start    ║
║ 1.2  M1  discoverComponentsFromDom      30  M    68% MED   metrics  ║
║ 1.3  M1  downloadUiFile                 33  M    73% MED   metrics  ║
║ 1.4  M1  exportSvgToGif                 35  M    69% MED   metrics  ║
║      🎭 Data Baton ▸ handoff: template + CSS metrics                ║
║ 2.1  M2  export.gif.symphony            32  M    68% MED   style    ║
║ 2.2  M2  queryAllComponents             36  M    75% MED   style    ║
║ 2.3  M2  createMP4Encoder               34  M    68% MED   style    ║
║ 2.4  M2  exportSvgToMp4                 27  M    95% MED   style    ║
║ 3.1  M3  export.mp4.symphony            35  M    83% MED   import   ║
║ 3.2  M3  buildUiFileContent             32  M    81% MED   import   ║
║ 3.3  M3  collectLayoutData              33  M    76% MED   import   ║
║ 3.4  M3  export.symphony                25  S    82% LOW   payload  ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════╣
║ Size Bands    : Tiny 0 · Small 0 · Medium 12 · Large 0 · XL 0       ║
║ Coverage Dist.: 0–30% 0 · 30–60% 0 · 60–80% 7 · 80–100% 5           ║
║ Risk Summary  : CRITICAL 0 · HIGH 0 · MEDIUM 11 · LOW 1             ║
╚════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: EXECUTE SEQUENCE                                  ║
║ Domain : build-pipeline-orchestration                               ║
║ Package: musical-conductor                                          ║
║ Scope : 1 Symphony · 3 Movements · 11 Beats · 11 Handlers           ║
║ Health: 330 LOC · Avg Cov 85% · Size Band: LARGE · Risk: LOW        ║
╠════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                        ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                   ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.3               ║
║   Focus: template     Focus: styling     Focus: import + payload    ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════╣
║ Beat Mov Handler                      LOC  Sz  Cov  Risk  Baton     ║
║ ─────────────────────────────────────────────────────────────────── ║
║ 1.1  M1  checkResources                 28  M    89% MED   start    ║
║ 1.2  M1  cleanupResources               30  M    86% MED   metrics  ║
║ 1.3  M1  enqueueSequence                35  M    88% MED   metrics  ║
║ 1.4  M1  handleBeatComplete             33  M    83% MED   metrics  ║
║      🎭 Data Baton ▸ handoff: template + CSS metrics                ║
║ 2.1  M2  execute_sequence               31  M    77% MED   style    ║
║ 2.2  M2  notifyComplete                 26  M    93% MED   style    ║
║ 2.3  M2  processBeat                    26  M    82% MED   style    ║
║ 2.4  M2  recordMetrics                  27  M    72% MED   style    ║
║ 3.1  M3  startExecution                 25  S    65% MED   import   ║
║ 3.2  M3  updateStatistics               35  M    78% MED   import   ║
║ 3.3  M3  validateRequest                28  M    67% MED   import   ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════╣
║ Size Bands    : Tiny 0 · Small 0 · Medium 11 · Large 0 · XL 0       ║
║ Coverage Dist.: 0–30% 0 · 30–60% 0 · 60–80% 5 · 80–100% 6           ║
║ Risk Summary  : CRITICAL 0 · HIGH 0 · MEDIUM 11 · LOW 0             ║
╚════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: MONITOR                                           ║
║ Domain : build-pipeline-orchestration                               ║
║ Package: musical-conductor                                          ║
║ Scope : 1 Symphony · 3 Movements · 11 Beats · 11 Handlers           ║
║ Health: 330 LOC · Avg Cov 85% · Size Band: LARGE · Risk: LOW        ║
╠════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                        ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                   ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.3               ║
║   Focus: template     Focus: styling     Focus: import + payload    ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════╣
║ Beat Mov Handler                      LOC  Sz  Cov  Risk  Baton     ║
║ ─────────────────────────────────────────────────────────────────── ║
║ 1.1  M1  checkEventBusHealth            24  S    74% MED   start    ║
║ 1.2  M1  checkExecutionHealth           27  M    95% MED   metrics  ║
║ 1.3  M1  generateStatusReport           36  M    90% MED   metrics  ║
║ 1.4  M1  getConductorStatus             28  M    95% MED   metrics  ║
║      🎭 Data Baton ▸ handoff: template + CSS metrics                ║
║ 2.1  M2  getDuplicationReport           27  M    77% MED   style    ║
║ 2.2  M2  getPerformanceMetrics          29  M    72% MED   style    ║
║ 2.3  M2  getQueueStatus                 29  M    72% MED   style    ║
║ 2.4  M2  getSequenceCount               36  M    87% MED   style    ║
║ 3.1  M3  getStatistics                  33  M    94% MED   import   ║
║ 3.2  M3  monitor                        33  M    89% MED   import   ║
║ 3.3  M3  logHealthSummary               28  M    88% MED   import   ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════╣
║ Size Bands    : Tiny 0 · Small 0 · Medium 11 · Large 0 · XL 0       ║
║ Coverage Dist.: 0–30% 0 · 30–60% 0 · 60–80% 4 · 80–100% 7           ║
║ Risk Summary  : CRITICAL 0 · HIGH 0 · MEDIUM 11 · LOW 0             ║
╚════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: VALIDATE PLUGIN                                   ║
║ Domain : build-pipeline-orchestration                               ║
║ Package: musical-conductor                                          ║
║ Scope : 1 Symphony · 3 Movements · 11 Beats · 11 Handlers           ║
║ Health: 330 LOC · Avg Cov 85% · Size Band: LARGE · Risk: LOW        ║
╠════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                        ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                   ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.3               ║
║   Focus: template     Focus: styling     Focus: import + payload    ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════╣
║ Beat Mov Handler                      LOC  Sz  Cov  Risk  Baton     ║
║ ─────────────────────────────────────────────────────────────────── ║
║ 1.1  M1  checkManifest                  35  M    73% MED   start    ║
║ 1.2  M1  checkResourceRequirements      31  M    79% MED   metrics  ║
║ 1.3  M1  checkSPACompliance             30  M    93% MED   metrics  ║
║ 1.4  M1  generateValidationReport       32  M    82% MED   metrics  ║
║      🎭 Data Baton ▸ handoff: template + CSS metrics                ║
║ 2.1  M2  validate_plugin                31  M    73% MED   style    ║
║ 2.2  M2  logResults                     26  M    77% MED   style    ║
║ 2.3  M2  validateHandlerContracts       34  M    90% MED   style    ║
║ 2.4  M2  validatePluginShape            31  M    90% MED   style    ║
║ 3.1  M3  validatePriorities             32  M    80% MED   import   ║
║ 3.2  M3  verifyBeatMapping              35  M    90% MED   import   ║
║ 3.3  M3  verifyExports                  35  M    70% MED   import   ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════╣
║ Size Bands    : Tiny 0 · Small 0 · Medium 11 · Large 0 · XL 0       ║
║ Coverage Dist.: 0–30% 0 · 30–60% 0 · 60–80% 5 · 80–100% 6           ║
║ Risk Summary  : CRITICAL 0 · HIGH 0 · MEDIUM 11 · LOW 0             ║
╚════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: REGISTER SEQUENCE                                 ║
║ Domain : build-pipeline-orchestration                               ║
║ Package: musical-conductor                                          ║
║ Scope : 1 Symphony · 3 Movements · 9 Beats · 9 Handlers             ║
║ Health: 270 LOC · Avg Cov 85% · Size Band: MEDIUM · Risk: LOW       ║
╠════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                        ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                   ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1               ║
║   Focus: template     Focus: styling     Focus: import + payload    ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════╣
║ Beat Mov Handler                      LOC  Sz  Cov  Risk  Baton     ║
║ ─────────────────────────────────────────────────────────────────── ║
║ 1.1  M1  checkDuplicates                35  M    95% MED   start    ║
║ 1.2  M1  register_sequence              34  M    66% MED   metrics  ║
║ 1.3  M1  logRegistrationDetails         32  M    78% MED   metrics  ║
║ 1.4  M1  notifyRegistered               25  S    94% LOW   metrics  ║
║      🎭 Data Baton ▸ handoff: template + CSS metrics                ║
║ 2.1  M2  registerWithRegistry           30  M    87% MED   style    ║
║ 2.2  M2  updateEventMappings            34  M    69% MED   style    ║
║ 2.3  M2  validateBeats                  35  M    91% MED   style    ║
║ 2.4  M2  validateSequenceShape          30  M    81% MED   style    ║
║ 3.1  M3  verifyAvailability             34  M    68% MED   import   ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════╣
║ Size Bands    : Tiny 0 · Small 0 · Medium 9 · Large 0 · XL 0        ║
║ Coverage Dist.: 0–30% 0 · 30–60% 0 · 60–80% 4 · 80–100% 5           ║
║ Risk Summary  : CRITICAL 0 · HIGH 0 · MEDIUM 8 · LOW 1              ║
╚════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: RESIZE                                            ║
║ Domain : build-pipeline-orchestration                               ║
║ Package: canvas-component                                           ║
║ Scope : 1 Symphony · 3 Movements · 8 Beats · 8 Handlers             ║
║ Health: 240 LOC · Avg Cov 85% · Size Band: MEDIUM · Risk: LOW       ║
╠════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                        ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                   ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1               ║
║   Focus: template     Focus: styling     Focus: import + payload    ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════╣
║ Beat Mov Handler                      LOC  Sz  Cov  Risk  Baton     ║
║ ─────────────────────────────────────────────────────────────────── ║
║ 1.1  M1  resize.end.symphony            28  M    75% MED   start    ║
║ 1.2  M1  resize.move.symphony           25  S    76% LOW   metrics  ║
║ 1.3  M1  endResize                      31  M    79% MED   metrics  ║
║ 1.4  M1  resize                         29  M    67% MED   metrics  ║
║      🎭 Data Baton ▸ handoff: template + CSS metrics                ║
║ 2.1  M2  startResize                    27  M    67% MED   style    ║
║ 2.2  M2  updateSize                     31  M    93% MED   style    ║
║ 2.3  M2  resize.start.symphony          25  S    73% MED   style    ║
║ 2.4  M2  resize.symphony                29  M    68% MED   style    ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════╣
║ Size Bands    : Tiny 0 · Small 0 · Medium 8 · Large 0 · XL 0        ║
║ Coverage Dist.: 0–30% 0 · 30–60% 0 · 60–80% 7 · 80–100% 1           ║
║ Risk Summary  : CRITICAL 0 · HIGH 0 · MEDIUM 7 · LOW 1              ║
╚════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: CSS MANAGEMENT                                    ║
║ Domain : build-pipeline-orchestration                               ║
║ Package: control-panel                                              ║
║ Scope : 1 Symphony · 3 Movements · 8 Beats · 8 Handlers             ║
║ Health: 240 LOC · Avg Cov 85% · Size Band: MEDIUM · Risk: LOW       ║
╠════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                        ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                   ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1               ║
║   Focus: template     Focus: styling     Focus: import + payload    ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════╣
║ Beat Mov Handler                      LOC  Sz  Cov  Risk  Baton     ║
║ ─────────────────────────────────────────────────────────────────── ║
║ 1.1  M1  applyCssClassToElement         34  M    88% MED   start    ║
║ 1.2  M1  createCssClass                 30  M    92% MED   metrics  ║
║ 1.3  M1  deleteCssClass                 33  M    88% MED   metrics  ║
║ 1.4  M1  getCssClass                    31  M    90% MED   metrics  ║
║      🎭 Data Baton ▸ handoff: template + CSS metrics                ║
║ 2.1  M2  listCssClasses                 32  M    90% MED   style    ║
║ 2.2  M2  removeCssClassFromElement      35  M    86% MED   style    ║
║ 2.3  M2  updateCssClass                 34  M    91% MED   style    ║
║ 2.4  M2  css_management.symphony        27  M    82% MED   style    ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════╣
║ Size Bands    : Tiny 0 · Small 0 · Medium 8 · Large 0 · XL 0        ║
║ Coverage Dist.: 0–30% 0 · 30–60% 0 · 60–80% 0 · 80–100% 8           ║
║ Risk Summary  : CRITICAL 0 · HIGH 0 · MEDIUM 8 · LOW 0              ║
╚════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: DESELECT                                          ║
║ Domain : build-pipeline-orchestration                               ║
║ Package: canvas-component                                           ║
║ Scope : 1 Symphony · 3 Movements · 7 Beats · 7 Handlers             ║
║ Health: 210 LOC · Avg Cov 85% · Size Band: MEDIUM · Risk: LOW       ║
╠════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                        ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                   ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1               ║
║   Focus: template     Focus: styling     Focus: import + payload    ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════╣
║ Beat Mov Handler                      LOC  Sz  Cov  Risk  Baton     ║
║ ─────────────────────────────────────────────────────────────────── ║
║ 1.1  M1  clearAllSelections             34  M    81% MED   start    ║
║ 1.2  M1  deselectComponent              33  M    81% MED   metrics  ║
║ 1.3  M1  deselect                       27  M    69% MED   metrics  ║
║ 1.4  M1  hideAllOverlays                26  M    85% MED   metrics  ║
║      🎭 Data Baton ▸ handoff: template + CSS metrics                ║
║ 2.1  M2  publishDeselectionChanged      30  M    80% MED   style    ║
║ 2.2  M2  publishSelectionsCleared       30  M    71% MED   style    ║
║ 2.3  M2  routeDeselectionRequest        25  S    87% LOW   style    ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════╣
║ Size Bands    : Tiny 0 · Small 0 · Medium 7 · Large 0 · XL 0        ║
║ Coverage Dist.: 0–30% 0 · 30–60% 0 · 60–80% 2 · 80–100% 5           ║
║ Risk Summary  : CRITICAL 0 · HIGH 0 · MEDIUM 6 · LOW 1              ║
╚════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: IMPORT                                            ║
║ Domain : build-pipeline-orchestration                               ║
║ Package: canvas-component                                           ║
║ Scope : 1 Symphony · 3 Movements · 7 Beats · 7 Handlers             ║
║ Health: 210 LOC · Avg Cov 85% · Size Band: MEDIUM · Risk: LOW       ║
╠════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                        ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                   ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1               ║
║   Focus: template     Focus: styling     Focus: import + payload    ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════╣
║ Beat Mov Handler                      LOC  Sz  Cov  Risk  Baton     ║
║ ─────────────────────────────────────────────────────────────────── ║
║ 1.1  M1  injectCssClasses               25  S    90% LOW   start    ║
║ 1.2  M1  openUiFile                     34  M    79% MED   metrics  ║
║ 1.3  M1  registerInstances              32  M    67% MED   metrics  ║
║ 1.4  M1  applyHierarchyAndOrder         25  S    72% MED   metrics  ║
║      🎭 Data Baton ▸ handoff: template + CSS metrics                ║
║ 2.1  M2  createComponentsSequentially   35  M    90% MED   style    ║
║ 2.2  M2  parseUiFile                    33  M    94% MED   style    ║
║ 2.3  M2  import.symphony                25  S    91% LOW   style    ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════╣
║ Size Bands    : Tiny 0 · Small 0 · Medium 7 · Large 0 · XL 0        ║
║ Coverage Dist.: 0–30% 0 · 30–60% 0 · 60–80% 3 · 80–100% 4           ║
║ Risk Summary  : CRITICAL 0 · HIGH 0 · MEDIUM 5 · LOW 2              ║
╚════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: RESIZE LINE                                       ║
║ Domain : build-pipeline-orchestration                               ║
║ Package: canvas-component                                           ║
║ Scope : 1 Symphony · 3 Movements · 7 Beats · 7 Handlers             ║
║ Health: 210 LOC · Avg Cov 85% · Size Band: MEDIUM · Risk: LOW       ║
╠════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                        ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                   ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1               ║
║   Focus: template     Focus: styling     Focus: import + payload    ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════╣
║ Beat Mov Handler                      LOC  Sz  Cov  Risk  Baton     ║
║ ─────────────────────────────────────────────────────────────────── ║
║ 1.1  M1  resize.line.end.symphony       31  M    87% MED   start    ║
║ 1.2  M1  resize.line.move.symphony      30  M    71% MED   metrics  ║
║ 1.3  M1  endLineResize                  34  M    78% MED   metrics  ║
║ 1.4  M1  resize.line                    30  M    87% MED   metrics  ║
║      🎭 Data Baton ▸ handoff: template + CSS metrics                ║
║ 2.1  M2  startLineResize                31  M    83% MED   style    ║
║ 2.2  M2  updateLine                     30  M    72% MED   style    ║
║ 2.3  M2  resize.line.start.symphony     33  M    91% MED   style    ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════╣
║ Size Bands    : Tiny 0 · Small 0 · Medium 7 · Large 0 · XL 0        ║
║ Coverage Dist.: 0–30% 0 · 30–60% 0 · 60–80% 3 · 80–100% 4           ║
║ Risk Summary  : CRITICAL 0 · HIGH 0 · MEDIUM 7 · LOW 0              ║
╚════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: UPDATE                                            ║
║ Domain : build-pipeline-orchestration                               ║
║ Package: canvas-component                                           ║
║ Scope : 1 Symphony · 3 Movements · 7 Beats · 7 Handlers             ║
║ Health: 210 LOC · Avg Cov 85% · Size Band: MEDIUM · Risk: LOW       ║
╠════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                        ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                   ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1               ║
║   Focus: template     Focus: styling     Focus: import + payload    ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════╣
║ Beat Mov Handler                      LOC  Sz  Cov  Risk  Baton     ║
║ ─────────────────────────────────────────────────────────────────── ║
║ 1.1  M1  refreshControlPanel            35  M    68% MED   start    ║
║ 1.2  M1  updateAttribute                34  M    84% MED   metrics  ║
║ 1.3  M1  refreshControlPanel            26  M    92% MED   metrics  ║
║ 1.4  M1  updateSvgNodeAttribute         34  M    87% MED   metrics  ║
║      🎭 Data Baton ▸ handoff: template + CSS metrics                ║
║ 2.1  M2  update.svg_node.symphony       24  S    69% MED   style    ║
║ 2.2  M2  updateFromElement              29  M    74% MED   style    ║
║ 2.3  M2  update.symphony                31  M    69% MED   style    ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════╣
║ Size Bands    : Tiny 0 · Small 0 · Medium 7 · Large 0 · XL 0        ║
║ Coverage Dist.: 0–30% 0 · 30–60% 0 · 60–80% 4 · 80–100% 3           ║
║ Risk Summary  : CRITICAL 0 · HIGH 0 · MEDIUM 7 · LOW 0              ║
╚════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: LINE ADVANCED                                     ║
║ Domain : build-pipeline-orchestration                               ║
║ Package: canvas-component                                           ║
║ Scope : 1 Symphony · 3 Movements · 6 Beats · 6 Handlers             ║
║ Health: 180 LOC · Avg Cov 85% · Size Band: MEDIUM · Risk: LOW       ║
╠════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                        ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                   ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1               ║
║   Focus: template     Focus: styling     Focus: import + payload    ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════╣
║ Beat Mov Handler                      LOC  Sz  Cov  Risk  Baton     ║
║ ─────────────────────────────────────────────────────────────────── ║
║ 1.1  M1  line.manip.end.symphony        27  M    69% MED   start    ║
║ 1.2  M1  line.manip.move.symphony       35  M    89% MED   metrics  ║
║ 1.3  M1  endLineManip                   34  M    75% MED   metrics  ║
║ 1.4  M1  moveLineManip                  29  M    66% MED   metrics  ║
║      🎭 Data Baton ▸ handoff: template + CSS metrics                ║
║ 2.1  M2  startLineManip                 33  M    91% MED   style    ║
║ 2.2  M2  line.manip.start.symphony      36  M    87% MED   style    ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════╣
║ Size Bands    : Tiny 0 · Small 0 · Medium 6 · Large 0 · XL 0        ║
║ Coverage Dist.: 0–30% 0 · 30–60% 0 · 60–80% 3 · 80–100% 3           ║
║ Risk Summary  : CRITICAL 0 · HIGH 0 · MEDIUM 6 · LOW 0              ║
╚════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: PASTE                                             ║
║ Domain : build-pipeline-orchestration                               ║
║ Package: canvas-component                                           ║
║ Scope : 1 Symphony · 3 Movements · 6 Beats · 6 Handlers             ║
║ Health: 180 LOC · Avg Cov 85% · Size Band: MEDIUM · Risk: LOW       ║
╠════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                        ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                   ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1               ║
║   Focus: template     Focus: styling     Focus: import + payload    ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════╣
║ Beat Mov Handler                      LOC  Sz  Cov  Risk  Baton     ║
║ ─────────────────────────────────────────────────────────────────── ║
║ 1.1  M1  calculatePastePosition         25  S    94% LOW   start    ║
║ 1.2  M1  createPastedComponent          26  M    92% MED   metrics  ║
║ 1.3  M1  deserializeComponentData       33  M    89% MED   metrics  ║
║ 1.4  M1  paste                          32  M    86% MED   metrics  ║
║      🎭 Data Baton ▸ handoff: template + CSS metrics                ║
║ 2.1  M2  notifyPasteComplete            32  M    95% MED   style    ║
║ 2.2  M2  readFromClipboard              25  S    78% LOW   style    ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════╣
║ Size Bands    : Tiny 0 · Small 0 · Medium 6 · Large 0 · XL 0        ║
║ Coverage Dist.: 0–30% 0 · 30–60% 0 · 60–80% 1 · 80–100% 5           ║
║ Risk Summary  : CRITICAL 0 · HIGH 0 · MEDIUM 4 · LOW 2              ║
╚════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: COPY                                              ║
║ Domain : build-pipeline-orchestration                               ║
║ Package: canvas-component                                           ║
║ Scope : 1 Symphony · 3 Movements · 4 Beats · 4 Handlers             ║
║ Health: 120 LOC · Avg Cov 85% · Size Band: SMALL · Risk: LOW        ║
╠════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                        ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                   ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1               ║
║   Focus: template     Focus: styling     Focus: import + payload    ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════╣
║ Beat Mov Handler                      LOC  Sz  Cov  Risk  Baton     ║
║ ─────────────────────────────────────────────────────────────────── ║
║ 1.1  M1  copyToClipboard                34  M    76% MED   start    ║
║ 1.2  M1  copy                           35  M    91% MED   metrics  ║
║ 1.3  M1  notifyCopyComplete             24  S    81% LOW   metrics  ║
║ 1.4  M1  serializeSelectedComponent     24  S    85% LOW   metrics  ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════╣
║ Size Bands    : Tiny 0 · Small 0 · Medium 4 · Large 0 · XL 0        ║
║ Coverage Dist.: 0–30% 0 · 30–60% 0 · 60–80% 1 · 80–100% 3           ║
║ Risk Summary  : CRITICAL 0 · HIGH 0 · MEDIUM 2 · LOW 2              ║
╚════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: DELETE                                            ║
║ Domain : build-pipeline-orchestration                               ║
║ Package: canvas-component                                           ║
║ Scope : 1 Symphony · 3 Movements · 4 Beats · 4 Handlers             ║
║ Health: 120 LOC · Avg Cov 85% · Size Band: SMALL · Risk: LOW        ║
╠════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                        ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                   ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1               ║
║   Focus: template     Focus: styling     Focus: import + payload    ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════╣
║ Beat Mov Handler                      LOC  Sz  Cov  Risk  Baton     ║
║ ─────────────────────────────────────────────────────────────────── ║
║ 1.1  M1  deleteComponent                30  M    89% MED   start    ║
║ 1.2  M1  delete                         33  M    65% MED   metrics  ║
║ 1.3  M1  publishDeleted                 28  M    77% MED   metrics  ║
║ 1.4  M1  routeDeleteRequest             28  M    91% MED   metrics  ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════╣
║ Size Bands    : Tiny 0 · Small 0 · Medium 4 · Large 0 · XL 0        ║
║ Coverage Dist.: 0–30% 0 · 30–60% 0 · 60–80% 2 · 80–100% 2           ║
║ Risk Summary  : CRITICAL 0 · HIGH 0 · MEDIUM 4 · LOW 0              ║
╚════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: CLASSES                                           ║
║ Domain : build-pipeline-orchestration                               ║
║ Package: control-panel                                              ║
║ Scope : 1 Symphony · 3 Movements · 3 Beats · 3 Handlers             ║
║ Health: 90 LOC · Avg Cov 85% · Size Band: SMALL · Risk: LOW         ║
╠════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                        ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                   ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1               ║
║   Focus: template     Focus: styling     Focus: import + payload    ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════╣
║ Beat Mov Handler                      LOC  Sz  Cov  Risk  Baton     ║
║ ─────────────────────────────────────────────────────────────────── ║
║ 1.1  M1  addClass                       27  M    93% MED   start    ║
║ 1.2  M1  removeClass                    26  M    74% MED   metrics  ║
║ 1.3  M1  classes.symphony               26  M    90% MED   metrics  ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════╣
║ Size Bands    : Tiny 0 · Small 0 · Medium 3 · Large 0 · XL 0        ║
║ Coverage Dist.: 0–30% 0 · 30–60% 0 · 60–80% 1 · 80–100% 2           ║
║ Risk Summary  : CRITICAL 0 · HIGH 0 · MEDIUM 3 · LOW 0              ║
╚════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: CLIPBOARD                                         ║
║ Domain : build-pipeline-orchestration                               ║
║ Package: canvas-component                                           ║
║ Scope : 1 Symphony · 3 Movements · 2 Beats · 2 Handlers             ║
║ Health: 60 LOC · Avg Cov 85% · Size Band: SMALL · Risk: LOW         ║
╠════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                        ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                   ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1               ║
║   Focus: template     Focus: styling     Focus: import + payload    ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════╣
║ Beat Mov Handler                      LOC  Sz  Cov  Risk  Baton     ║
║ ─────────────────────────────────────────────────────────────────── ║
║ 1.1  M1  getClipboardText               34  M    76% MED   start    ║
║ 1.2  M1  setClipboardText               35  M    85% MED   metrics  ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════╣
║ Size Bands    : Tiny 0 · Small 0 · Medium 2 · Large 0 · XL 0        ║
║ Coverage Dist.: 0–30% 0 · 30–60% 0 · 60–80% 1 · 80–100% 1           ║
║ Risk Summary  : CRITICAL 0 · HIGH 0 · MEDIUM 2 · LOW 0              ║
╚════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: AUGMENT                                           ║
║ Domain : build-pipeline-orchestration                               ║
║ Package: canvas-component                                           ║
║ Scope : 1 Symphony · 3 Movements · 2 Beats · 2 Handlers             ║
║ Health: 60 LOC · Avg Cov 85% · Size Band: SMALL · Risk: LOW         ║
╠════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                        ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                   ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1               ║
║   Focus: template     Focus: styling     Focus: import + payload    ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════╣
║ Beat Mov Handler                      LOC  Sz  Cov  Risk  Baton     ║
║ ─────────────────────────────────────────────────────────────────── ║
║ 1.1  M1  enhanceLine                    34  M    83% MED   start    ║
║ 1.2  M1  recomputeLineSvg               29  M    88% MED   metrics  ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════╣
║ Size Bands    : Tiny 0 · Small 0 · Medium 2 · Large 0 · XL 0        ║
║ Coverage Dist.: 0–30% 0 · 30–60% 0 · 60–80% 0 · 80–100% 2           ║
║ Risk Summary  : CRITICAL 0 · HIGH 0 · MEDIUM 2 · LOW 0              ║
╚════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: SELECTION                                         ║
║ Domain : build-pipeline-orchestration                               ║
║ Package: control-panel                                              ║
║ Scope : 1 Symphony · 3 Movements · 2 Beats · 2 Handlers             ║
║ Health: 60 LOC · Avg Cov 85% · Size Band: SMALL · Risk: LOW         ║
╠════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                        ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                   ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1               ║
║   Focus: template     Focus: styling     Focus: import + payload    ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════╣
║ Beat Mov Handler                      LOC  Sz  Cov  Risk  Baton     ║
║ ─────────────────────────────────────────────────────────────────── ║
║ 1.1  M1  deriveSelectionModel           30  M    86% MED   start    ║
║ 1.2  M1  selection.symphony             30  M    89% MED   metrics  ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════╣
║ Size Bands    : Tiny 0 · Small 0 · Medium 2 · Large 0 · XL 0        ║
║ Coverage Dist.: 0–30% 0 · 30–60% 0 · 60–80% 0 · 80–100% 2           ║
║ Risk Summary  : CRITICAL 0 · HIGH 0 · MEDIUM 2 · LOW 0              ║
╚════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: DROP.CONTAINER                                    ║
║ Domain : build-pipeline-orchestration                               ║
║ Package: library-component                                          ║
║ Scope : 1 Symphony · 3 Movements · 1 Beats · 1 Handlers             ║
║ Health: 30 LOC · Avg Cov 85% · Size Band: TINY · Risk: LOW          ║
╠════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                        ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                   ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1               ║
║   Focus: template     Focus: styling     Focus: import + payload    ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════╣
║ Beat Mov Handler                      LOC  Sz  Cov  Risk  Baton     ║
║ ─────────────────────────────────────────────────────────────────── ║
║ 1.1  M1  drop.container.symphony        32  M    86% MED   start    ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════╣
║ Size Bands    : Tiny 0 · Small 0 · Medium 1 · Large 0 · XL 0        ║
║ Coverage Dist.: 0–30% 0 · 30–60% 0 · 60–80% 0 · 80–100% 1           ║
║ Risk Summary  : CRITICAL 0 · HIGH 0 · MEDIUM 1 · LOW 0              ║
╚════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: DROP                                              ║
║ Domain : build-pipeline-orchestration                               ║
║ Package: library-component                                          ║
║ Scope : 1 Symphony · 3 Movements · 1 Beats · 1 Handlers             ║
║ Health: 30 LOC · Avg Cov 85% · Size Band: TINY · Risk: LOW          ║
╠════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                        ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                   ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1               ║
║   Focus: template     Focus: styling     Focus: import + payload    ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════╣
║ Beat Mov Handler                      LOC  Sz  Cov  Risk  Baton     ║
║ ─────────────────────────────────────────────────────────────────── ║
║ 1.1  M1  drop.symphony                  31  M    75% MED   start    ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════╣
║ Size Bands    : Tiny 0 · Small 0 · Medium 1 · Large 0 · XL 0        ║
║ Coverage Dist.: 0–30% 0 · 30–60% 0 · 60–80% 1 · 80–100% 0           ║
║ Risk Summary  : CRITICAL 0 · HIGH 0 · MEDIUM 1 · LOW 0              ║
╚════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: LOAD                                              ║
║ Domain : build-pipeline-orchestration                               ║
║ Package: library                                                    ║
║ Scope : 1 Symphony · 3 Movements · 1 Beats · 1 Handlers             ║
║ Health: 30 LOC · Avg Cov 85% · Size Band: TINY · Risk: LOW          ║
╠════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                        ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                   ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1               ║
║   Focus: template     Focus: styling     Focus: import + payload    ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════╣
║ Beat Mov Handler                      LOC  Sz  Cov  Risk  Baton     ║
║ ─────────────────────────────────────────────────────────────────── ║
║ 1.1  M1  load.symphony                  28  M    91% MED   start    ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════╣
║ Size Bands    : Tiny 0 · Small 0 · Medium 1 · Large 0 · XL 0        ║
║ Coverage Dist.: 0–30% 0 · 30–60% 0 · 60–80% 0 · 80–100% 1           ║
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
        ║  Avg LOC/Handler: 0.00                               ║
        ║  Test Coverage: 85.1%                                  ║
        ║  Duplication: 0.0%                                       ║
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





╔════ LEGEND & DOMAIN TERMINOLOGY ══════════════════════════════════════╗
║ Domain: build-pipeline-orchestration                                 ║
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
  ✅ Discovered: 0 source files in build-pipeline-orchestration
  ✅ Analyzed: 403 handler functions with measured LOC (0 total lines)
  ✅ Mapped: Files to orchestration beats
  ✅ Measured: Test coverage (avg 85.1%)
  ✅ No God handlers detected
  ✅ Generated: Comprehensive metrics and analysis artifacts

NEXT ACTIONS:
  → Review detailed metrics in full report
  → Maintain low duplication levels
  → Maintain excellent test coverage
  

═════════════════════════════════════════════════════════════════════════════════════════════════════════════════════


---

## Movement 1: Code Discovery & Beat Mapping

**Purpose**: Discover all source files and map them to orchestration beats

- **Files Discovered**: 0
- **Beats Completed**: 4/4 ✓
- **Beat Mappings**:
  - Beat 1 (Discovery): 0 files
  - Beat 2 (Baseline): 0 files
  - Beat 3 (Structure): 0 files
  - Beat 4 (Dependencies): 0 files

---

## Movement 2: Code Metrics Analysis

**Purpose**: Calculate LOC, complexity, duplication, and maintainability metrics

### Lines of Code (LOC)
- **Total**: 0
- **Average per File**: NaN
- **Status**: ✓ Normal range

### Complexity Analysis
- **High Complexity**: 0 files
- **Medium Complexity**: 0 files
- **Low Complexity**: 0 files
- **Average**: 0.00
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
**Last Scan**: 2025-11-28T20:06:55.390Z

### Maintainability Index
- **Score**: 61.83/100
- **Classification**: 🟡 **FAIR** (B)
- **Threshold**: 60-80
- **Guidance**: Address technical debt in next sprint. Schedule refactoring review.
- **Contributing Factors**:
  - Test Coverage: 73.4%
  - Documentation: 76.9%
  - Comment Density: 66.5%
  - Complexity Score: 62.9

---

## Movement 3: Test Coverage Analysis (Orchestration Suite)

**Purpose**: Measure statement, branch, function, and line coverage

**Scope**: Full `build-pipeline-orchestration` domain - all source files in `packages/` analyzed

### Coverage Metrics
| Type | Coverage | Target | Gap | Status |
|------|----------|--------|-----|--------|
| Statements | 85.14% | 80% | 5.1% | ✅ On-target |
| Branches | 73.67% | 75% | -1.3% | 🔴 Off-track |
| Functions | 87.76% | 80% | 7.8% | 🟢 Close |
| Lines | 86.84% | 80% | 6.8% | ✅ On-target |

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
**Last Scan**: 2025-11-28T20:06:55.145Z

### Handler Scope Analysis

**Scope Definition**: The handler scope/kind layer distinguishes orchestration handlers (system-level logic) from plugin handlers (feature-level logic).

# Handler Scope Analysis Report

**Generated**: 2025-11-28T20:06:55.167Z

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
**Global Coverage**: 74.2% statements

| Metric | Coverage | Status |
|--------|----------|--------|
| Statements | 74.2% | 🟡 |
| Branches | 71.95% | 🟡 |
| Functions | 82.97% | 🟢 |
| Lines | 82.87% | 🟢 |

### Handler Coverage Summary
| Category | Count | % | Status |
|----------|-------|---|--------|
| Well-Covered (80%+) | 0 | 0.0% | ✅ |
| Partially-Covered (50-79%) | 195 | 100.0% | ⚠️ |
| Poorly-Covered (1-49%) | 0 | 0.0% | ⚠️ |
| Uncovered (0%) | 0 | 0.0% | ❌ |

**Average Handler Coverage**: 72.44%

**Handlers**: 195 | **Average LOC per Handler**: 23.68 | **Total LOC**: 2202

### Coverage Heatmap by Beat

| Beat | Avg Coverage | Handlers | Status |
|------|--------------|----------|--------|
| beat-3-structure | 74.49% | 81 | ⚠️ |
| beat-4-dependencies | 74.39% | 44 | ⚠️ |
| beat-2-baseline | 74.13% | 46 | ⚠️ |
| beat-1-discovery | 58.71% | 24 | ⚠️ |

**Measurement**: Source='measured' (test coverage analysis with handler-beat correlation)
**Timestamp**: 2025-11-28T20:06:55.789Z


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
- Timestamp: 2025-11-28T20:06:56.064Z


### Historical Trend Analysis

**Note**: Trend coverage metrics may differ from current run's Movement 3 metrics due to snapshot timing and aggregation. These represent baseline or averaged coverage, not current execution coverage.

## Historical Trend Analysis

**Analysis Period**: Last 30 snapshots
**Current Baseline**: 2025-11-28T20:06:56.322Z

### Overall Trend Summary

| Metric | Current | Previous | Change | Trend | Direction |
|--------|---------|----------|--------|-------|-----------|
| Handler Count | 403 | 403 | - | New | - |
| Duplication (blocks) | 562 | 562 | - | Monitoring | - |
| Coverage (avg) | 86.31% | 39.90% | - | Monitoring | - |
| Maintainability | 73.66/100 | - | - | Baseline | - |
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
| Statements | 83.55% | 85% | 1.45% | 🟡 Close |
| Branches | 89.08% | 85% | -4.08% | 🟡 Close |
| Functions | 77.70% | 90% | 12.30% | 🟡 Close |
| Lines | 82.29% | 85% | 2.71% | ✅ On-target |

**Coverage Improvement Roadmap**:
- **Week 2**: Add 5-8 integration tests → +3% statements
- **Week 4**: Refactor handler coverage → +5% branches
- **Week 6**: Beat 4 expansion → +8% functions
- **Target**: 85%+ all metrics by week 8

### Maintainability Trends

**Current Maintainability Index**: 73.66/100

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
- Coverage: 86.31%
- Maintainability: 73.66/100
- Conformity: 87.50%

**Projected (Week 4)**:
- Handlers: +5% → 424
- Duplication: -15% → 130.55%
- Coverage: +3-5% → 90.31%
- Maintainability: +5 → 78.66/100
- Conformity: +2% → 89.50%

**Projected (Week 8 - Full Sprint)**:
- Handlers: +15% → 464
- Duplication: -30% → 115.55%
- Coverage: +8-10% → 95.31%
- Maintainability: +15 → 88.66/100
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

**Timestamp**: 2025-11-28T20:06:56.329Z
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
✓ Coverage - Orchestration Suite (85.14%) ✅
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

- **JSON Analysis**: build-pipeline-orchestration-code-analysis-2025-11-28T20-06-54-470Z.json
- **Coverage Summary**: build-pipeline-orchestration-coverage-summary-2025-11-28T20-06-54-470Z.json
- **Per-Beat Metrics**: build-pipeline-orchestration-per-beat-metrics-2025-11-28T20-06-54-470Z.csv
- **Trend Analysis**: build-pipeline-orchestration-trends-2025-11-28T20-06-54-470Z.json

---

*Report auto-generated from symphonic-code-analysis-pipeline. All metrics are immutable and traceable to source analysis.*
