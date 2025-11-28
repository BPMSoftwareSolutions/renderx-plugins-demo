# Renderx Web Orchestration Code Analysis Report

**Generated**: 2025-11-28T18:57:08.781Z  
**Codebase**: renderx-web-orchestration  
**Pipeline**: symphonic-code-analysis-pipeline

## Executive Summary

This comprehensive analysis spans 4 movements with 16 beat stages, providing deep insights into code quality, test coverage, and architectural conformity.

### Overall Health: FAIR (Conditional) ⚠

**Note**: 'FAIR' reflects current architecture and test posture. CI/CD gating is stricter and requires higher thresholds for automated deployment gates.

| Metric | Value | Status | Classification |
|--------|-------|--------|-----------------|
| Conformity Score | 87.50% | ⚠️  FAIR| Governance: CONDITIONAL|
| Test Coverage | 73.84% | ⚠️  FAIR| Risk: MEDIUM|
| Maintainability | 53.27/100 | 🔴 POOR| Grade: C|
| Code Duplication | 78.30% | ❌ VERY HIGH| Action: Refactor|

---


╔══════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
║                    SYMPHONIC CODE ANALYSIS ARCHITECTURE - RENDERX WEB ORCHESTRATION                         ║
║                    Enhanced Handler Portfolio & Orchestration Framework                                          ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝

┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  📊 CODEBASE METRICS FOUNDATION                                                                                 │
│  ═════════════════════════════════════════════════════════════════════════════════════════════════════════════   │
│  │ Total Files: 777 │ Total LOC: 5045  │ Handlers: 283│ Avg LOC/Handler: 17.83│ Coverage: 73.84% │           │
│  ╰─────────────────────────────────────────────────────────────────────────────────────────────────────────────  │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

╔════ HANDLER PORTFOLIO METRICS ════╗
║ Files           : 777    ║
║ Total LOC       : 5045    ║
║ Handlers        : 283    ║
║ Avg LOC/Handler : 17.8    ║
║ Coverage        : 73.8%    ║
║ Duplication     :   0    ║
║ Maintainability : 53.3    ║
║ Conformity      : 87.5%    ║
╚════════════════════════════════════╝

╔════ COVERAGE HEATMAP BY BEAT ════╗
║ Beat       Mov.   Cov   Bar      ║
╠══════════════════════════════════╣
║ Beat 1.1   Mov 1   85% █████████████  ║
║ Beat 2.1   Mov 2   92% ██████████████ ║
║ Beat 3.1   Mov 3   68% ██████████     ║
║ Beat 4.1   Mov 4   55% ████████       ║
╚══════════════════════════════════╝

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
        │ 777  files           │ LOC metrics           │ coverage
        │                      │                      │
        └──────────┬───────────┴──────────┬───────────┘
                   │                      │
                   ▼                      ▼
        ╔══════════════════╗  ╔══════════════════╗
        │  DATA BATON 🎭   │  │  DATA BATON 🎭   │
        ├──────────────────┤  ├──────────────────┤
        │ • Files: 777     │  │ • Handlers: 283 │
        │ • LOC: 5045      │  │ • Avg LOC: 17.83│
        │ • Beats: 4/4 ✓   │  │ • Coverage: 73.8%│
        │ • Status: READY  │  │ • Status: READY  │
        └────────┬─────────┘  └────────┬─────────┘
                 │                     │
                 └──────────┬──────────┘
                            │
                            ▼

╔════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: CREATE                                            ║
║ Domain : renderx-web-orchestration                                  ║
║ Scope : 1 Symphony · 7 Movements · 26 Beats · 26 Handlers           ║
║ Health: 463 LOC · Avg Cov 74% · Size Band: LARGE · Risk: HIGH       ║
╠════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                        ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                   ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.4               ║
║   Focus: template     Focus: styling     Focus: import + payload    ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════╣
║ Beat Mov Handler                      LOC  Sz  Cov  Risk  Baton     ║
║ ─────────────────────────────────────────────────────────────────── ║
║ 1.1  M1  resolveTemplate                19  S    59% HIGH  start    ║
║ 1.2  M1  injectCssFallback              21  S    63% MED   metrics  ║
║ 1.3  M1  injectRawCss                   19  S    59% HIGH  metrics  ║
║ 1.4  M1  appendTo                       18  S    83% LOW   metrics  ║
║      🎭 Data Baton ▸ handoff: template + CSS metrics                ║
║ 2.1  M2  applyClasses                   16  S    67% MED   style    ║
║ 2.2  M2  applyInlineStyle               18  S    78% LOW   style    ║
║ 2.3  M2  createElementWithId            16  S    67% MED   style    ║
║ 2.4  M2  getCanvasOrThrow               18  S    82% LOW   style    ║
║ 3.1  M3  attachStandardImportInteracti  18  S    56% HIGH  import   ║
║ 3.2  M3  createFromImportRecord         20  S    72% MED   import   ║
║ 3.3  M3  toCreatePayloadFromData        19  S    74% MED   import   ║
║ 3.4  M3  transformClipboardToCreatePay  18  S    76% LOW   payload  ║
║ 4.1  M4  transformImportToCreatePayloa  21  S    58% HIGH  payload  ║
║ 4.2  M4  attachDrag                     18  S    56% HIGH  payload  ║
║ 4.3  M4  attachSelection                21  S    66% MED   payload  ║
║ 4.4  M4  attachSvgNodeClick             20  S    69% MED   payload  ║
║ 5.1  M5  registerInstance               15  S    80% LOW   payload  ║
║ 5.2  M5  notifyUi                       19  S    67% MED   payload  ║
║ 5.3  M5  cleanupReactRoot               17  S    78% LOW   payload  ║
║ 5.4  M5  exposeEventRouterToReact       20  S    78% LOW   payload  ║
║ 6.1  M6  renderReact                    15  S    72% MED   payload  ║
║ 6.2  M6  computeCssVarBlock             21  S    80% LOW   payload  ║
║ 6.3  M6  computeInlineStyle             17  S    58% HIGH  payload  ║
║ 6.4  M6  computeInstanceClass           15  S    57% HIGH  payload  ║
║ 7.1  M7  validateReactCode              18  S    57% HIGH  payload  ║
║ 7.2  M7  validateReactCodeOrThrow       15  S    83% LOW   payload  ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════╣
║ Size Bands    : Tiny 0 · Small 19 · Medium 7 · Large 0 · XL 0       ║
║ Coverage Dist.: 0–30% 0 · 30–60% 8 · 60–80% 13 · 80–100% 5          ║
║ Risk Summary  : CRITICAL 0 · HIGH 8 · MEDIUM 9 · LOW 9              ║
╚════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: UI                                                ║
║ Domain : renderx-web-orchestration                                  ║
║ Scope : 1 Symphony · 5 Movements · 19 Beats · 19 Handlers           ║
║ Health: 339 LOC · Avg Cov 74% · Size Band: LARGE · Risk: HIGH       ║
╠════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                        ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                   ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.4               ║
║   Focus: template     Focus: styling     Focus: import + payload    ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════╣
║ Beat Mov Handler                      LOC  Sz  Cov  Risk  Baton     ║
║ ─────────────────────────────────────────────────────────────────── ║
║ 1.1  M1  awaitRefresh                   20  S    61% MED   start    ║
║ 1.2  M1  dispatchField                  21  S    60% MED   metrics  ║
║ 1.3  M1  generateFields                 16  S    79% LOW   metrics  ║
║ 1.4  M1  generateSections               18  S    55% HIGH  metrics  ║
║      🎭 Data Baton ▸ handoff: template + CSS metrics                ║
║ 2.1  M2  initConfig                     21  S    60% MED   style    ║
║ 2.2  M2  initMovement                   14  S    55% HIGH  style    ║
║ 2.3  M2  initResolver                   18  S    76% LOW   style    ║
║ 2.4  M2  loadSchemas                    19  S    59% HIGH  style    ║
║ 3.1  M3  mergeErrors                    21  S    58% HIGH  import   ║
║ 3.2  M3  notifyReady                    16  S    73% MED   import   ║
║ 3.3  M3  prepareField                   18  S    56% HIGH  import   ║
║ 3.4  M3  registerObservers              16  S    55% HIGH  payload  ║
║ 4.1  M4  renderView                     16  S    63% MED   payload  ║
║ 4.2  M4  setDirty                       19  S    69% MED   payload  ║
║ 4.3  M4  toggleSection                  21  S    79% LOW   payload  ║
║ 4.4  M4  updateView                     20  S    64% MED   payload  ║
║ 5.1  M5  validateField                  15  S    63% MED   payload  ║
║ 5.2  M5  getCurrentTheme                15  S    61% MED   payload  ║
║ 5.3  M5  toggleTheme                    21  S    55% HIGH  payload  ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════╣
║ Size Bands    : Tiny 0 · Small 12 · Medium 7 · Large 0 · XL 0       ║
║ Coverage Dist.: 0–30% 0 · 30–60% 7 · 60–80% 12 · 80–100% 0          ║
║ Risk Summary  : CRITICAL 0 · HIGH 7 · MEDIUM 9 · LOW 3              ║
╚════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: SELECT                                            ║
║ Domain : renderx-web-orchestration                                  ║
║ Scope : 1 Symphony · 3 Movements · 12 Beats · 12 Handlers           ║
║ Health: 214 LOC · Avg Cov 74% · Size Band: MEDIUM · Risk: MEDIUM    ║
╠════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                        ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                   ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.4               ║
║   Focus: template     Focus: styling     Focus: import + payload    ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════╣
║ Beat Mov Handler                      LOC  Sz  Cov  Risk  Baton     ║
║ ─────────────────────────────────────────────────────────────────── ║
║ 1.1  M1  ensureOverlayCss               21  S    64% MED   start    ║
║ 1.2  M1  applyOverlayRectForEl          16  S    70% MED   metrics  ║
║ 1.3  M1  ensureOverlay                  21  S    62% MED   metrics  ║
║ 1.4  M1  getCanvasOrThrow               18  S    71% MED   metrics  ║
║      🎭 Data Baton ▸ handoff: template + CSS metrics                ║
║ 2.1  M2  getCanvasRect                  20  S    83% LOW   style    ║
║ 2.2  M2  createOverlayStructure         15  S    70% MED   style    ║
║ 2.3  M2  resolveEndpoints               18  S    61% MED   style    ║
║ 2.4  M2  attachAdvancedLineManipHandle  20  S    59% HIGH  style    ║
║ 3.1  M3  ensureAdvancedLineOverlayFor   17  S    76% LOW   import   ║
║ 3.2  M3  attachLineResizeHandlers       19  S    68% MED   import   ║
║ 3.3  M3  ensureLineOverlayFor           19  S    68% MED   import   ║
║ 3.4  M3  attachResizeHandlers           17  S    64% MED   payload  ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════╣
║ Size Bands    : Tiny 0 · Small 8 · Medium 4 · Large 0 · XL 0        ║
║ Coverage Dist.: 0–30% 0 · 30–60% 1 · 60–80% 10 · 80–100% 1          ║
║ Risk Summary  : CRITICAL 0 · HIGH 1 · MEDIUM 9 · LOW 2              ║
╚════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: EXPORT                                            ║
║ Domain : renderx-web-orchestration                                  ║
║ Scope : 1 Symphony · 3 Movements · 9 Beats · 9 Handlers             ║
║ Health: 160 LOC · Avg Cov 74% · Size Band: MEDIUM · Risk: MEDIUM    ║
╠════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                        ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                   ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1               ║
║   Focus: template     Focus: styling     Focus: import + payload    ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════╣
║ Beat Mov Handler                      LOC  Sz  Cov  Risk  Baton     ║
║ ─────────────────────────────────────────────────────────────────── ║
║ 1.1  M1  collectCssClasses              16  S    63% MED   start    ║
║ 1.2  M1  discoverComponentsFromDom      19  S    78% LOW   metrics  ║
║ 1.3  M1  downloadUiFile                 15  S    56% HIGH  metrics  ║
║ 1.4  M1  exportSvgToGif                 18  S    56% HIGH  metrics  ║
║      🎭 Data Baton ▸ handoff: template + CSS metrics                ║
║ 2.1  M2  queryAllComponents             20  S    73% MED   style    ║
║ 2.2  M2  createMP4Encoder               18  S    66% MED   style    ║
║ 2.3  M2  exportSvgToMp4                 21  S    76% LOW   style    ║
║ 2.4  M2  buildUiFileContent             16  S    58% HIGH  style    ║
║ 3.1  M3  collectLayoutData              19  S    71% MED   import   ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════╣
║ Size Bands    : Tiny 0 · Small 7 · Medium 2 · Large 0 · XL 0        ║
║ Coverage Dist.: 0–30% 0 · 30–60% 3 · 60–80% 6 · 80–100% 0           ║
║ Risk Summary  : CRITICAL 0 · HIGH 3 · MEDIUM 4 · LOW 2              ║
╚════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: CSS MANAGEMENT                                    ║
║ Domain : renderx-web-orchestration                                  ║
║ Scope : 1 Symphony · 3 Movements · 7 Beats · 7 Handlers             ║
║ Health: 125 LOC · Avg Cov 74% · Size Band: SMALL · Risk: MEDIUM     ║
╠════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                        ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                   ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1               ║
║   Focus: template     Focus: styling     Focus: import + payload    ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════╣
║ Beat Mov Handler                      LOC  Sz  Cov  Risk  Baton     ║
║ ─────────────────────────────────────────────────────────────────── ║
║ 1.1  M1  applyCssClassToElement         16  S    68% MED   start    ║
║ 1.2  M1  createCssClass                 15  S    66% MED   metrics  ║
║ 1.3  M1  deleteCssClass                 17  S    79% LOW   metrics  ║
║ 1.4  M1  getCssClass                    17  S    66% MED   metrics  ║
║      🎭 Data Baton ▸ handoff: template + CSS metrics                ║
║ 2.1  M2  listCssClasses                 21  S    74% MED   style    ║
║ 2.2  M2  removeCssClassFromElement      17  S    83% LOW   style    ║
║ 2.3  M2  updateCssClass                 17  S    63% MED   style    ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════╣
║ Size Bands    : Tiny 0 · Small 6 · Medium 1 · Large 0 · XL 0        ║
║ Coverage Dist.: 0–30% 0 · 30–60% 0 · 60–80% 6 · 80–100% 1           ║
║ Risk Summary  : CRITICAL 0 · HIGH 0 · MEDIUM 5 · LOW 2              ║
╚════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: DRAG                                              ║
║ Domain : renderx-web-orchestration                                  ║
║ Scope : 1 Symphony · 3 Movements · 7 Beats · 7 Handlers             ║
║ Health: 125 LOC · Avg Cov 74% · Size Band: SMALL · Risk: LOW        ║
╠════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                        ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                   ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1               ║
║   Focus: template     Focus: styling     Focus: import + payload    ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════╣
║ Beat Mov Handler                      LOC  Sz  Cov  Risk  Baton     ║
║ ─────────────────────────────────────────────────────────────────── ║
║ 1.1  M1  applyTemplateStyles            15  S    59% HIGH  start    ║
║ 1.2  M1  computeCursorOffsets           20  S    71% MED   metrics  ║
║ 1.3  M1  computeGhostSize               16  S    84% LOW   metrics  ║
║ 1.4  M1  createGhostContainer           21  S    81% LOW   metrics  ║
║      🎭 Data Baton ▸ handoff: template + CSS metrics                ║
║ 2.1  M2  ensurePayload                  21  S    77% LOW   style    ║
║ 2.2  M2  installDragImage               20  S    83% LOW   style    ║
║ 2.3  M2  renderTemplatePreview          17  S    79% LOW   style    ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════╣
║ Size Bands    : Tiny 0 · Small 3 · Medium 4 · Large 0 · XL 0        ║
║ Coverage Dist.: 0–30% 0 · 30–60% 1 · 60–80% 3 · 80–100% 3           ║
║ Risk Summary  : CRITICAL 0 · HIGH 1 · MEDIUM 1 · LOW 5              ║
╚════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: IMPORT                                            ║
║ Domain : renderx-web-orchestration                                  ║
║ Scope : 1 Symphony · 3 Movements · 6 Beats · 6 Handlers             ║
║ Health: 107 LOC · Avg Cov 74% · Size Band: SMALL · Risk: MEDIUM     ║
╠════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                        ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                   ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1               ║
║   Focus: template     Focus: styling     Focus: import + payload    ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════╣
║ Beat Mov Handler                      LOC  Sz  Cov  Risk  Baton     ║
║ ─────────────────────────────────────────────────────────────────── ║
║ 1.1  M1  injectCssClasses               18  S    76% LOW   start    ║
║ 1.2  M1  openUiFile                     17  S    72% MED   metrics  ║
║ 1.3  M1  registerInstances              17  S    73% MED   metrics  ║
║ 1.4  M1  applyHierarchyAndOrder         21  S    61% MED   metrics  ║
║      🎭 Data Baton ▸ handoff: template + CSS metrics                ║
║ 2.1  M2  createComponentsSequentially   19  S    59% HIGH  style    ║
║ 2.2  M2  parseUiFile                    19  S    70% MED   style    ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════╣
║ Size Bands    : Tiny 0 · Small 5 · Medium 1 · Large 0 · XL 0        ║
║ Coverage Dist.: 0–30% 0 · 30–60% 1 · 60–80% 5 · 80–100% 0           ║
║ Risk Summary  : CRITICAL 0 · HIGH 1 · MEDIUM 4 · LOW 1              ║
╚════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: UPDATE                                            ║
║ Domain : renderx-web-orchestration                                  ║
║ Scope : 1 Symphony · 3 Movements · 5 Beats · 5 Handlers             ║
║ Health: 89 LOC · Avg Cov 74% · Size Band: SMALL · Risk: MEDIUM      ║
╠════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                        ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                   ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1               ║
║   Focus: template     Focus: styling     Focus: import + payload    ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════╣
║ Beat Mov Handler                      LOC  Sz  Cov  Risk  Baton     ║
║ ─────────────────────────────────────────────────────────────────── ║
║ 1.1  M1  refreshControlPanel            19  S    58% HIGH  start    ║
║ 1.2  M1  updateAttribute                16  S    64% MED   metrics  ║
║ 1.3  M1  refreshControlPanel            16  S    78% LOW   metrics  ║
║ 1.4  M1  updateSvgNodeAttribute         20  S    71% MED   metrics  ║
║      🎭 Data Baton ▸ handoff: template + CSS metrics                ║
║ 2.1  M2  updateFromElement              15  S    73% MED   style    ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════╣
║ Size Bands    : Tiny 0 · Small 4 · Medium 1 · Large 0 · XL 0        ║
║ Coverage Dist.: 0–30% 0 · 30–60% 1 · 60–80% 4 · 80–100% 0           ║
║ Risk Summary  : CRITICAL 0 · HIGH 1 · MEDIUM 3 · LOW 1              ║
╚════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: LINE ADVANCED                                     ║
║ Domain : renderx-web-orchestration                                  ║
║ Scope : 1 Symphony · 3 Movements · 4 Beats · 4 Handlers             ║
║ Health: 71 LOC · Avg Cov 74% · Size Band: SMALL · Risk: LOW         ║
╠════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                        ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                   ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1               ║
║   Focus: template     Focus: styling     Focus: import + payload    ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════╣
║ Beat Mov Handler                      LOC  Sz  Cov  Risk  Baton     ║
║ ─────────────────────────────────────────────────────────────────── ║
║ 1.1  M1  line.manip.end.symphony        19  S    67% MED   start    ║
║ 1.2  M1  endLineManip                   17  S    70% MED   metrics  ║
║ 1.3  M1  moveLineManip                  19  S    68% MED   metrics  ║
║ 1.4  M1  startLineManip                 15  S    61% MED   metrics  ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════╣
║ Size Bands    : Tiny 0 · Small 4 · Medium 0 · Large 0 · XL 0        ║
║ Coverage Dist.: 0–30% 0 · 30–60% 0 · 60–80% 4 · 80–100% 0           ║
║ Risk Summary  : CRITICAL 0 · HIGH 0 · MEDIUM 4 · LOW 0              ║
╚════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: CLIPBOARD                                         ║
║ Domain : renderx-web-orchestration                                  ║
║ Scope : 1 Symphony · 3 Movements · 2 Beats · 2 Handlers             ║
║ Health: 36 LOC · Avg Cov 74% · Size Band: TINY · Risk: LOW          ║
╠════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                        ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                   ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1               ║
║   Focus: template     Focus: styling     Focus: import + payload    ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════╣
║ Beat Mov Handler                      LOC  Sz  Cov  Risk  Baton     ║
║ ─────────────────────────────────────────────────────────────────── ║
║ 1.1  M1  getClipboardText               15  S    69% MED   start    ║
║ 1.2  M1  setClipboardText               16  S    81% LOW   metrics  ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════╣
║ Size Bands    : Tiny 0 · Small 2 · Medium 0 · Large 0 · XL 0        ║
║ Coverage Dist.: 0–30% 0 · 30–60% 0 · 60–80% 1 · 80–100% 1           ║
║ Risk Summary  : CRITICAL 0 · HIGH 0 · MEDIUM 1 · LOW 1              ║
╚════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: AUGMENT                                           ║
║ Domain : renderx-web-orchestration                                  ║
║ Scope : 1 Symphony · 3 Movements · 2 Beats · 2 Handlers             ║
║ Health: 36 LOC · Avg Cov 74% · Size Band: TINY · Risk: LOW          ║
╠════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                        ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                   ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1               ║
║   Focus: template     Focus: styling     Focus: import + payload    ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════╣
║ Beat Mov Handler                      LOC  Sz  Cov  Risk  Baton     ║
║ ─────────────────────────────────────────────────────────────────── ║
║ 1.1  M1  enhanceLine                    16  S    56% HIGH  start    ║
║ 1.2  M1  recomputeLineSvg               18  S    66% MED   metrics  ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════╣
║ Size Bands    : Tiny 0 · Small 2 · Medium 0 · Large 0 · XL 0        ║
║ Coverage Dist.: 0–30% 0 · 30–60% 1 · 60–80% 1 · 80–100% 0           ║
║ Risk Summary  : CRITICAL 0 · HIGH 1 · MEDIUM 1 · LOW 0              ║
╚════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: RESIZE LINE                                       ║
║ Domain : renderx-web-orchestration                                  ║
║ Scope : 1 Symphony · 3 Movements · 2 Beats · 2 Handlers             ║
║ Health: 36 LOC · Avg Cov 74% · Size Band: TINY · Risk: MEDIUM       ║
╠════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                        ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                   ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1               ║
║   Focus: template     Focus: styling     Focus: import + payload    ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════╣
║ Beat Mov Handler                      LOC  Sz  Cov  Risk  Baton     ║
║ ─────────────────────────────────────────────────────────────────── ║
║ 1.1  M1  resize.line.move.symphony      16  S    55% HIGH  start    ║
║ 1.2  M1  resize.line.start.symphony     20  S    56% HIGH  metrics  ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════╣
║ Size Bands    : Tiny 0 · Small 1 · Medium 1 · Large 0 · XL 0        ║
║ Coverage Dist.: 0–30% 0 · 30–60% 2 · 60–80% 0 · 80–100% 0           ║
║ Risk Summary  : CRITICAL 0 · HIGH 2 · MEDIUM 0 · LOW 0              ║
╚════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: CLASSES                                           ║
║ Domain : renderx-web-orchestration                                  ║
║ Scope : 1 Symphony · 3 Movements · 2 Beats · 2 Handlers             ║
║ Health: 36 LOC · Avg Cov 74% · Size Band: TINY · Risk: LOW          ║
╠════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                        ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                   ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1               ║
║   Focus: template     Focus: styling     Focus: import + payload    ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════╣
║ Beat Mov Handler                      LOC  Sz  Cov  Risk  Baton     ║
║ ─────────────────────────────────────────────────────────────────── ║
║ 1.1  M1  addClass                       18  S    83% LOW   start    ║
║ 1.2  M1  removeClass                    21  S    57% HIGH  metrics  ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════╣
║ Size Bands    : Tiny 0 · Small 1 · Medium 1 · Large 0 · XL 0        ║
║ Coverage Dist.: 0–30% 0 · 30–60% 1 · 60–80% 0 · 80–100% 1           ║
║ Risk Summary  : CRITICAL 0 · HIGH 1 · MEDIUM 0 · LOW 1              ║
╚════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: RESIZE                                            ║
║ Domain : renderx-web-orchestration                                  ║
║ Scope : 1 Symphony · 3 Movements · 1 Beats · 1 Handlers             ║
║ Health: 18 LOC · Avg Cov 74% · Size Band: TINY · Risk: LOW          ║
╠════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                        ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                   ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1               ║
║   Focus: template     Focus: styling     Focus: import + payload    ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════╣
║ Beat Mov Handler                      LOC  Sz  Cov  Risk  Baton     ║
║ ─────────────────────────────────────────────────────────────────── ║
║ 1.1  M1  resize.start.symphony          15  S    58% HIGH  start    ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════╣
║ Size Bands    : Tiny 0 · Small 1 · Medium 0 · Large 0 · XL 0        ║
║ Coverage Dist.: 0–30% 0 · 30–60% 1 · 60–80% 0 · 80–100% 0           ║
║ Risk Summary  : CRITICAL 0 · HIGH 1 · MEDIUM 0 · LOW 0              ║
╚════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: SELECTION                                         ║
║ Domain : renderx-web-orchestration                                  ║
║ Scope : 1 Symphony · 3 Movements · 1 Beats · 1 Handlers             ║
║ Health: 18 LOC · Avg Cov 74% · Size Band: TINY · Risk: LOW          ║
╠════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                        ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                   ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1               ║
║   Focus: template     Focus: styling     Focus: import + payload    ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════╣
║ Beat Mov Handler                      LOC  Sz  Cov  Risk  Baton     ║
║ ─────────────────────────────────────────────────────────────────── ║
║ 1.1  M1  deriveSelectionModel           15  S    79% LOW   start    ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════╣
║ Size Bands    : Tiny 0 · Small 1 · Medium 0 · Large 0 · XL 0        ║
║ Coverage Dist.: 0–30% 0 · 30–60% 0 · 60–80% 1 · 80–100% 0           ║
║ Risk Summary  : CRITICAL 0 · HIGH 0 · MEDIUM 0 · LOW 1              ║
╚════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════╗
║ HANDLER SYMPHONY: DROP                                              ║
║ Domain : renderx-web-orchestration                                  ║
║ Scope : 1 Symphony · 3 Movements · 1 Beats · 1 Handlers             ║
║ Health: 18 LOC · Avg Cov 74% · Size Band: TINY · Risk: LOW          ║
╠════════════════════════════════════════════════════════════════════╣
║ MOVEMENT MAP                                                        ║
║   M1 Discovery   →   M2 Metrics   →   M3 Coverage                   ║
║   Beats 1.1–1.4      Beats 2.1–2.4      Beats 3.1–3.1               ║
║   Focus: template     Focus: styling     Focus: import + payload    ║
╠════════════════════════ BEAT / HANDLER PORTFOLIO ══════════════════╣
║ Beat Mov Handler                      LOC  Sz  Cov  Risk  Baton     ║
║ ─────────────────────────────────────────────────────────────────── ║
║ 1.1  M1  drop.symphony                  17  S    82% LOW   start    ║
╠════════════════════════ HANDLER PORTFOLIO METRICS ═════════════════╣
║ Size Bands    : Tiny 0 · Small 1 · Medium 0 · Large 0 · XL 0        ║
║ Coverage Dist.: 0–30% 0 · 30–60% 0 · 60–80% 0 · 80–100% 1           ║
║ Risk Summary  : CRITICAL 0 · HIGH 0 · MEDIUM 0 · LOW 1              ║
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
        ║  Handlers Analyzed: 283                              ║
        ║  Avg LOC/Handler: 17.83                              ║
        ║  Test Coverage: 73.8%                                  ║
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
║   Rationale: Current coverage: 73.8%. Target: 80%+     ║
║   PR: test: add comprehensive unit tests for core handl║
║                                                        ║
║ 3. Enhance maintainability                             ║
║   Target : Complex handlers                            ║
║   Effort : low                                         ║
║   Rationale: Split complex logic into smaller, testable║
║   PR: refactor: improve handler maintainability and rea║
╚═════════════════════════════════════════════════════════╝

═════════════════════════════════════════════════════════════════════════════════════════════════════════════════════

                           🎼 LEGEND & DOMAIN TERMINOLOGY 🎼

┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ SYMPHONIC ARCHITECTURE TERMS:                                                                                 │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ • Symphony:          Logical grouping of related handler functions                                            │
│ • Sequence:          Execution order of handlers within a symphony (choreographed flow)                        │
│ • Handler:           Individual function that performs a specific orchestration task                          │
│ • Beat:              Execution unit within a Movement (4 movements × 4 beats = 16 beats total)               │
│ • Movement:          Major phase in analysis (Discovery, Metrics, Coverage, Conformity)                       │
│ • Data Baton 🎭:     Metadata container passed between beats (files, handlers, metrics)                       │
│ • Orchestration:     Complete system of symphonies, sequences, and handlers working together                  │
│                                                                                                                 │
│ CODE ANALYSIS METRICS:                                                                                        │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ • LOC:               Lines of Code (measured, not synthetic)                                                   │
│ • Coverage:          Percentage of code covered by tests (target: 80%+)                                       │
│ • Duplication:       Percentage of duplicate code blocks identified                                           │
│ • God Handler:       Handler with 100+ LOC and <70% coverage (refactoring candidate)                         │
│                                                                                                                 │
│ COVERAGE SYMBOLS:                                                                                             │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 🟢 GREEN (80%+):     Well-covered, production-ready                                                           │
│ 🟡 YELLOW (50-79%):  Acceptable but needs improvement                                                         │
│ 🔴 RED (<50%):       Poor coverage, high risk                                                                 │
│ ⚠️  WARNING:          High complexity or high-risk area                                                         │
│ ✓ CHECK:             Meets requirements/passing                                                               │
│                                                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

═════════════════════════════════════════════════════════════════════════════════════════════════════════════════════

ANALYSIS EXECUTION SUMMARY:
  ✅ Discovered: 777 source files in renderx-web-orchestration
  ✅ Analyzed: 283 handler functions with measured LOC (5045 total lines)
  ✅ Mapped: Files to orchestration beats
  ✅ Measured: Test coverage (avg 73.8%)
  ✅ No God handlers detected
  ✅ Generated: Comprehensive metrics and analysis artifacts

NEXT ACTIONS:
  → Review detailed metrics in full report
  → Reduce code duplication from 78.3% to <50%
  → Improve test coverage to 80%+ (currently 73.8%)
  

═════════════════════════════════════════════════════════════════════════════════════════════════════════════════════


---

## Movement 1: Code Discovery & Beat Mapping

**Purpose**: Discover all source files and map them to orchestration beats

- **Files Discovered**: 777
- **Beats Completed**: 4/4 ✓
- **Beat Mappings**:
  - Beat 1 (Discovery): 0 files
  - Beat 2 (Baseline): 367 files
  - Beat 3 (Structure): 283 files
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

⚠ **561 duplicated code blocks detected**

**Top Duplications:**
  1. **12 files** | 15 occurrences | 5 lines | CanvasHeader.tsx:178-182, CanvasPage.tsx:26-30, ControlPanel.tsx:62-66
  2. **9 files** | 9 occurrences | 5 lines | ColorInput.tsx:80-84, NumberInput.tsx:78-82, SelectInput.tsx:60-64
  3. **5 files** | 8 occurrences | 5 lines | create.react.stage-crew.ts:136-140, create.react.stage-crew.ts:175-179, create.react.stage-crew.ts:237-241
  4. **4 files** | 8 occurrences | 5 lines | export.mp4.stage-crew.ts:247-251, export.mp4.stage-crew.ts:278-282, CanvasDrop.ts:186-190
  5. **8 files** | 8 occurrences | 5 lines | CanvasHeader.tsx:179-183, CanvasPage.tsx:27-31, HeaderControls.tsx:12-16

**Metrics:**
- Duplicate Regions: 561
- Estimated Duplicate Lines: 4085
- Duplication Rate: ~145.63%

**Status**: Review and refactor identified blocks. Priority: #1 (highest frequency)

**Measurement**: Source='measured' (AST region hashing across 233 files)
**Last Scan**: 2025-11-28T18:57:07.814Z

### Maintainability Index
- **Score**: 53.27/100
- **Classification**: 🔴 **POOR** (C)
- **Threshold**: <60
- **Guidance**: Critical refactoring needed. High priority for next cycle.
- **Contributing Factors**:
  - Test Coverage: 65.1%
  - Documentation: 71.7%
  - Comment Density: 20.4%
  - Complexity Score: 49.0

---

## Movement 3: Test Coverage Analysis (Orchestration Suite)

**Purpose**: Measure statement, branch, function, and line coverage

**Scope**: Full `renderx-web-orchestration` domain - all source files in `packages/` analyzed

### Coverage Metrics
| Type | Coverage | Target | Gap | Status |
|------|----------|--------|-----|--------|
| Statements | 73.84% | 80% | -6.2% | 🟡 Needs Improvement |
| Branches | 83.02% | 75% | 8.0% | 🟢 Close |
| Functions | 85.95% | 80% | 6.0% | 🟡 Needs Improvement |
| Lines | 83.16% | 80% | 3.2% | 🟢 Close |

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

✅ **283 handlers discovered**

✅ **283 handlers discovered**

**By Type:**
  * generic: 207
  * input: 18
  * initialization: 16
  * event: 15
  * validation: 7
  * output: 7
  * ui-interaction: 4
  * error-handling: 4
  * execution: 4
  * transformation: 1

**Top Handlers:**
  * getClipboardText (generic) — packages/canvas-component/src/symphonies/_clipboard.ts
  * setClipboardText (generic) — packages/canvas-component/src/symphonies/_clipboard.ts
  * enhanceLine (generic) — packages/canvas-component/src/symphonies/augment/augment.line.stage-crew.ts
  * recomputeLineSvg (generic) — packages/canvas-component/src/symphonies/augment/line.recompute.stage-crew.ts
  * resolveTemplate (generic) — packages/canvas-component/src/symphonies/create/create.arrangement.ts
  * ... and 278 more

**Measurement**: Source='measured' (real discovered exports via pattern matching)
**Coverage**: Handlers distributed across 10 types
**Last Scan**: 2025-11-28T18:57:07.573Z

### Handler Scope Analysis

**Scope Definition**: The handler scope/kind layer distinguishes orchestration handlers (system-level logic) from plugin handlers (feature-level logic).

# Handler Scope Analysis Report

**Generated**: 2025-11-28T18:57:07.598Z

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

**Overall**: 🟡 **62.46/100** (FAIR)

**Component Scores:**
| Component | Score | Target | Status |
|-----------|-------|--------|--------|
| Handler Coverage | 100.00% | 90%+ | ✓ |
| Beat Coverage | 40.00% | 100% | ⚠ |
| Mapping Confidence | 52.31% | 80%+ | ⚠ |
| Distribution | 0.00% | 80%+ | ⚠ |

**Metrics:**
- Mapped Handlers: 283/283
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

**Mapping Status**: 283/283 handlers have explicit beat mappings. Coverage heatmap reflects current measurement scope.

**Heatmap Terminology**: "Unassigned" in the Coverage Heatmap table refers to handlers without coverage measurement data correlated to specific beats in the current analysis scope, not to unmapped handlers. All 38 handlers have explicit beat assignments in the orchestration-domains.json mapping.

## Coverage by Handler Analysis

### Overall Test Coverage
**Global Coverage**: 77.37% statements

| Metric | Coverage | Status |
|--------|----------|--------|
| Statements | 77.37% | 🟡 |
| Branches | 70.26% | 🟡 |
| Functions | 75.74% | 🟡 |
| Lines | 76.64% | 🟡 |

### Handler Coverage Summary
| Category | Count | % | Status |
|----------|-------|---|--------|
| Well-Covered (80%+) | 37 | 25.2% | ✅ |
| Partially-Covered (50-79%) | 110 | 74.8% | ⚠️ |
| Poorly-Covered (1-49%) | 0 | 0.0% | ⚠️ |
| Uncovered (0%) | 0 | 0.0% | ❌ |

**Average Handler Coverage**: 77.51%

**Handlers**: 147 | **Average LOC per Handler**: 29.33 | **Total LOC**: 1320

### Coverage Heatmap by Beat

| Beat | Avg Coverage | Handlers | Status |
|------|--------------|----------|--------|
| unassigned | 77.51% | 147 | ⚠️ |

### ✅ Well-Tested Handlers (Coverage >= 80%)
| Handler | Coverage | Beat |
|---------|----------|------|
| inventoryMapped | 82.33% | unassigned |
| notifyUi | 82.15% | unassigned |
| createPastedComponent | 82.1% | unassigned |
| addClass | 82.04% | unassigned |
| resolveTemplate | 82.03% | unassigned |
| offsetX | 81.94% | unassigned |
| registerInstance | 81.85% | unassigned |
| width | 81.77% | unassigned |

**Measurement**: Source='measured' (test coverage analysis with handler-beat correlation)
**Timestamp**: 2025-11-28T18:57:08.165Z


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
- Package contains 87 handlers clustered together. Consider extracting into specialized sub-modules or consolidating related handlers.

**[P2] Refactor handler clustering in "self-healing"**
- Package contains 62 handlers clustered together. Consider extracting into specialized sub-modules or consolidating related handlers.

**[P2] Refactor handler clustering in "control-panel"**
- Package contains 52 handlers clustered together. Consider extracting into specialized sub-modules or consolidating related handlers.

**[P2] Refactor handler clustering in "library"**
- Package contains 37 handlers clustered together. Consider extracting into specialized sub-modules or consolidating related handlers.

**[P2] Refactor handler clustering in "slo-dashboard"**
- Package contains 19 handlers clustered together. Consider extracting into specialized sub-modules or consolidating related handlers.

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

Package contains 87 handlers clustered together. Consider extracting into specialized sub-modules or consolidating related handlers.

**Recommendation**: Split into 2-3 focused modules or consolidate into handler factory
**Impact**: +90 points | -8 (reduce module complexity) | Improved (easier to isolate functionality)

**PR Template** (use `npm run generate:pr -- CLUSTER-01` to generate):
```markdown
# Refactor handler clustering in "canvas-component"
Package contains 87 handlers clustered together. Consider extracting into specialized sub-modules or consolidating related handlers.

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
- Timestamp: 2025-11-28T18:57:08.463Z


### Historical Trend Analysis

**Note**: Trend coverage metrics may differ from current run's Movement 3 metrics due to snapshot timing and aggregation. These represent baseline or averaged coverage, not current execution coverage.

## Historical Trend Analysis

**Analysis Period**: Last 30 snapshots
**Current Baseline**: 2025-11-28T18:57:08.773Z

### Overall Trend Summary

| Metric | Current | Previous | Change | Trend | Direction |
|--------|---------|----------|--------|-------|-----------|
| Handler Count | 283 | 283 | - | New | - |
| Duplication (blocks) | 561 | 561 | - | Monitoring | - |
| Coverage (avg) | 85.34% | 43.84% | - | Monitoring | - |
| Maintainability | 69.47/100 | - | - | Baseline | - |
| Conformity | 87.50% | - | - | Baseline | - |

### Handler Metrics

**Current State**: 283 handlers discovered

**Handler Tracking:**
- Starting baseline: 283 handlers
- Types detected: 10
- Target for next sprint: 340 (20% growth for enhanced coverage)
- Health score: 54/100 (POOR - focus on distribution)

**Expected Evolution**:
- Week 4: 298 handlers (Type-specific handlers added)
- Week 8: 326 handlers (Enhanced testing harness)
- Week 12: 368 handlers (Full handler decomposition)

### Duplication Metrics

**Current State**: 561 duplicate blocks, 4085 duplicate lines

**Duplication Tracking:**
- Current rate: 145.63%
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
| Statements | 85.03% | 85% | -0.03% | 🟡 Close |
| Branches | 85.65% | 85% | -0.65% | 🟡 Close |
| Functions | 79.78% | 90% | 10.22% | 🟡 Close |
| Lines | 85.73% | 85% | -0.73% | ✅ On-target |

**Coverage Improvement Roadmap**:
- **Week 2**: Add 5-8 integration tests → +3% statements
- **Week 4**: Refactor handler coverage → +5% branches
- **Week 6**: Beat 4 expansion → +8% functions
- **Target**: 85%+ all metrics by week 8

### Maintainability Trends

**Current Maintainability Index**: 69.47/100

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
- Handlers: 283
- Duplication: 145.63%
- Coverage: 85.34%
- Maintainability: 69.47/100
- Conformity: 87.50%

**Projected (Week 4)**:
- Handlers: +5% → 298
- Duplication: -15% → 130.63%
- Coverage: +3-5% → 89.34%
- Maintainability: +5 → 74.47/100
- Conformity: +2% → 89.50%

**Projected (Week 8 - Full Sprint)**:
- Handlers: +15% → 326
- Duplication: -30% → 115.63%
- Coverage: +8-10% → 94.34%
- Maintainability: +15 → 84.47/100
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

**Timestamp**: 2025-11-28T18:57:08.780Z
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
✓ Coverage - Orchestration Suite (73.84%) ❌
✓ Handler Scanning (283 handlers discovered) ✅

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

- **JSON Analysis**: renderx-web-orchestration-code-analysis-2025-11-28T18-57-06-888Z.json
- **Coverage Summary**: renderx-web-orchestration-coverage-summary-2025-11-28T18-57-06-888Z.json
- **Per-Beat Metrics**: renderx-web-orchestration-per-beat-metrics-2025-11-28T18-57-06-888Z.csv
- **Trend Analysis**: renderx-web-orchestration-trends-2025-11-28T18-57-06-888Z.json

---

*Report auto-generated from symphonic-code-analysis-pipeline. All metrics are immutable and traceable to source analysis.*
