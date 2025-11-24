<!-- AUTO-GENERATED — DO NOT EDIT
Sources: .generated/global-traceability-map.json, .generated/project-knowledge-map.json, packages/ographx/.ographx/artifacts/renderx-web/analysis/analysis.json, packages/ographx/.ographx/artifacts/renderx-web/analysis/catalog-vs-ir-gaps.json, packages/ographx/.ographx/artifacts/renderx-web/analysis/comprehensive-audit.json, packages/ographx/.ographx/artifacts/renderx-web/analysis/external-interactions-audit.json, packages/ographx/.ographx/artifacts/renderx-web/analysis/proposed-tests.handlers.json, packages/ographx/.ographx/artifacts/renderx-web/catalog/catalog-components.json, packages/ographx/.ographx/artifacts/renderx-web/catalog/catalog-manifest.json, packages/ographx/.ographx/artifacts/renderx-web/catalog/catalog-sequences.json
Source-Hashes: .generated/global-traceability-map.json:83006a9ad2627d415bfb644385f98bd3fa6dd351b3c15ff10d1fef88de2e0197, .generated/project-knowledge-map.json:95d7a6a74c12b8f7b21460c608bf29dbaf6e33a2e0b9c4f3fcea101be2ac567c, packages/ographx/.ographx/artifacts/renderx-web/analysis/analysis.json:b56fd3808fa75741fb346a411b90183faddc35c837631916d3f48b5b547db058, packages/ographx/.ographx/artifacts/renderx-web/analysis/catalog-vs-ir-gaps.json:a8943d80df9440d2d84aebc0743938e3de47f2e5c18454aac2aa8efde3a926ef, packages/ographx/.ographx/artifacts/renderx-web/analysis/comprehensive-audit.json:185d7f42a05f3b24495023f2d977b956d6c369ea437d86e48ee0dfdedb4f6b67, packages/ographx/.ographx/artifacts/renderx-web/analysis/external-interactions-audit.json:85c80c7651b2a814f35c204045bd4a0d84208cfc4fcf91d94805bbf0f54646be, packages/ographx/.ographx/artifacts/renderx-web/analysis/proposed-tests.handlers.json:df5c25d7325440975dc99e8aaf5b93e1e15fb8883b4fd58a3529e19936b5b72b, packages/ographx/.ographx/artifacts/renderx-web/catalog/catalog-components.json:f34864d2b850125a75b7933ed36f3451bf2c8f14fff97c58f4d7ec332dd30c32, packages/ographx/.ographx/artifacts/renderx-web/catalog/catalog-manifest.json:ad59b2a14593fc4bf3e788cc31114e7e06900277be655499bf759b5bc23677ae, packages/ographx/.ographx/artifacts/renderx-web/catalog/catalog-sequences.json:5d7bbd729b2de8d5f1a321a48e13fe055d9693ea438bd242fe89ef1127a32dff
Doc-Hash: 27ad10e856cc0ceab42f2c165df4a68f6aca7f6b7a44792f0e432230e14e400c
Generated: 2025-11-24T01:11:26.661Z
Regenerate: npm run docs:generate:governed
-->

# Plugin Guide

**Generated**: 2025-11-24T01:11:26.337Z

## Plugin System Overview

RenderX uses a plugin architecture with:
- **10 Plugins** total
- **7 UI Plugins** for user interface
- **6 Runtime Plugins** for orchestration

## All Plugins

### HeaderTitlePlugin
  - **UI**: @renderx-plugins/header → HeaderTitle

### HeaderControlsPlugin
  - **UI**: @renderx-plugins/header → HeaderControls

### HeaderThemePlugin
  - **UI**: @renderx-plugins/header → HeaderThemeToggle

### LibraryPlugin
  - **UI**: @renderx-plugins/library → LibraryPanel
  - **Runtime**: @renderx-plugins/library → register

### CanvasPlugin
  - **UI**: @renderx-plugins/canvas → CanvasPage
  - **Runtime**: @renderx-plugins/canvas → register

### ControlPanelPlugin
  - **UI**: @renderx-plugins/control-panel → ControlPanel
  - **Runtime**: @renderx-plugins/control-panel → register

### LibraryComponentPlugin
  - **Runtime**: @renderx-plugins/library-component → register

### CanvasComponentPlugin
  - **Runtime**: @renderx-plugins/canvas-component → register

### RealEstateAnalyzerPlugin
  - **UI**: @renderx-plugins/real-estate-analyzer → OpportunityAnalyzer
  - **Runtime**: @renderx-plugins/real-estate-analyzer → register

### SelfHealingPlugin

## Plugin Slots

Plugins mount to these slots:

- headerLeft
- headerCenter
- headerRight
- library
- canvas
- controlPanel

## Test Coverage by Plugin

### canvas
- **Handlers**: 4
- **With Tests**: 2
- **Without Tests**: 2
- **Coverage**: 50%

### canvas-component
- **Handlers**: 218
- **With Tests**: 215
- **Without Tests**: 3
- **Coverage**: 99%

### control-panel
- **Handlers**: 110
- **With Tests**: 67
- **Without Tests**: 43
- **Coverage**: 61%

### header
- **Handlers**: 8
- **With Tests**: 6
- **Without Tests**: 2
- **Coverage**: 75%

### library
- **Handlers**: 52
- **With Tests**: 23
- **Without Tests**: 29
- **Coverage**: 44%

### library-component
- **Handlers**: 23
- **With Tests**: 3
- **Without Tests**: 20
- **Coverage**: 13%

### real-estate-analyzer
- **Handlers**: 8
- **With Tests**: 2
- **Without Tests**: 6
- **Coverage**: 25%
