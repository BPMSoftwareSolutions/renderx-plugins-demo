<!-- AUTO-GENERATED — DO NOT EDIT
Sources: .generated/global-traceability-map.json, .generated/project-knowledge-map.json, packages/ographx/.ographx/artifacts/renderx-web/analysis/analysis.json, packages/ographx/.ographx/artifacts/renderx-web/analysis/catalog-vs-ir-gaps.json, packages/ographx/.ographx/artifacts/renderx-web/analysis/comprehensive-audit.json, packages/ographx/.ographx/artifacts/renderx-web/analysis/external-interactions-audit.json, packages/ographx/.ographx/artifacts/renderx-web/analysis/proposed-tests.handlers.json, packages/ographx/.ographx/artifacts/renderx-web/catalog/catalog-components.json, packages/ographx/.ographx/artifacts/renderx-web/catalog/catalog-manifest.json, packages/ographx/.ographx/artifacts/renderx-web/catalog/catalog-sequences.json
Source-Hashes: .generated/global-traceability-map.json:83006a9ad2627d415bfb644385f98bd3fa6dd351b3c15ff10d1fef88de2e0197, .generated/project-knowledge-map.json:95d7a6a74c12b8f7b21460c608bf29dbaf6e33a2e0b9c4f3fcea101be2ac567c, packages/ographx/.ographx/artifacts/renderx-web/analysis/analysis.json:b56fd3808fa75741fb346a411b90183faddc35c837631916d3f48b5b547db058, packages/ographx/.ographx/artifacts/renderx-web/analysis/catalog-vs-ir-gaps.json:a8943d80df9440d2d84aebc0743938e3de47f2e5c18454aac2aa8efde3a926ef, packages/ographx/.ographx/artifacts/renderx-web/analysis/comprehensive-audit.json:185d7f42a05f3b24495023f2d977b956d6c369ea437d86e48ee0dfdedb4f6b67, packages/ographx/.ographx/artifacts/renderx-web/analysis/external-interactions-audit.json:85c80c7651b2a814f35c204045bd4a0d84208cfc4fcf91d94805bbf0f54646be, packages/ographx/.ographx/artifacts/renderx-web/analysis/proposed-tests.handlers.json:df5c25d7325440975dc99e8aaf5b93e1e15fb8883b4fd58a3529e19936b5b72b, packages/ographx/.ographx/artifacts/renderx-web/catalog/catalog-components.json:f34864d2b850125a75b7933ed36f3451bf2c8f14fff97c58f4d7ec332dd30c32, packages/ographx/.ographx/artifacts/renderx-web/catalog/catalog-manifest.json:ad59b2a14593fc4bf3e788cc31114e7e06900277be655499bf759b5bc23677ae, packages/ographx/.ographx/artifacts/renderx-web/catalog/catalog-sequences.json:5d7bbd729b2de8d5f1a321a48e13fe055d9693ea438bd242fe89ef1127a32dff
Doc-Hash: 74bc19a48784e26676a9b082160866fca1edc8cfe058df17d7b481eade853963
Generated: 2025-11-24T01:11:26.656Z
Regenerate: npm run docs:generate:governed
-->

# Handler Reference

**Generated**: 2025-11-24T01:11:26.340Z

## Handler Statistics

- **Total Handlers**: 423
- **With Tests**: 165
- **Without Tests**: 57
- **Coverage**: 74%

## Handlers by Plugin

### canvas
- register
- onDropForTest
- CanvasHeader
- CanvasPage


### canvas-component
- enhanceLine
- recomputeLineSvg
- serializeSelectedComponent
- copyToClipboard
- notifyCopyComplete
- resolveTemplate
- injectCssFallback
- injectRawCss
- getCanvasOrThrow
- createElementWithId
... and 208 more

### control-panel
- addClass
- removeClass
- notifyUi
- if
- if
- catch
- createCssClass
- updateCssClass
- deleteCssClass
- getCssClass
... and 100 more

### header
- getCurrentTheme
- toggleTheme
- register
- getCurrentTheme
- toggleTheme
- HeaderControls
- HeaderThemeToggle
- HeaderTitle


### library
- loadComponents
- if
- if
- for
- if
- if
- notifyUi
- register
- RAGEnrichmentService.if
- loadComponents
... and 42 more

### library-component
- ensurePayload
- computeGhostSize
- createGhostContainer
- renderTemplatePreview
- applyTemplateStyles
- computeCursorOffsets
- installDragImage
- onDragStart
- if
- publishCreateRequested
... and 13 more

### real-estate-analyzer
- register
- fetchPropertyData
- catch
- analyze
- catch
- format
- ZillowService.if
- OpportunityAnalyzer


## Untested Handlers (Priority)

- **CanvasHeader** (canvas)
- **CanvasPage** (canvas)
- **Name** (canvas-component)
- **transform** (canvas-component)
- **if** (control-panel)
- **catch** (control-panel)
- **deleteCssClass** (control-panel)
- **initMovement** (control-panel)
- **renderView** (control-panel)
- **registerFieldRenderer** (control-panel)
- **getFieldRenderer** (control-panel)
- **EmptyState** (control-panel)
- **LoadingState** (control-panel)
- **PanelHeader** (control-panel)
- **useControlPanelActions** (control-panel)
- **useControlPanelSequences** (control-panel)
- **useControlPanelState** (control-panel)
- **useSchemaResolver** (control-panel)
- **controlPanelReducer** (control-panel)
- **extractElementContent** (control-panel)
... and 37 more

## See Also

- [TEST_COVERAGE_GUIDE.md](./TEST_COVERAGE_GUIDE.md) - Test coverage analysis
