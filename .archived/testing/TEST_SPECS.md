<!-- AUTO-GENERATED — DO NOT EDIT
Sources: .generated/global-traceability-map.json, .generated/project-knowledge-map.json, packages/ographx/.ographx/artifacts/renderx-web/analysis/analysis.json, packages/ographx/.ographx/artifacts/renderx-web/analysis/catalog-vs-ir-gaps.json, packages/ographx/.ographx/artifacts/renderx-web/analysis/comprehensive-audit.json, packages/ographx/.ographx/artifacts/renderx-web/analysis/external-interactions-audit.json, packages/ographx/.ographx/artifacts/renderx-web/analysis/proposed-tests.handlers.json, packages/ographx/.ographx/artifacts/renderx-web/catalog/catalog-components.json, packages/ographx/.ographx/artifacts/renderx-web/catalog/catalog-manifest.json, packages/ographx/.ographx/artifacts/renderx-web/catalog/catalog-sequences.json
Source-Hashes: .generated/global-traceability-map.json:83006a9ad2627d415bfb644385f98bd3fa6dd351b3c15ff10d1fef88de2e0197, .generated/project-knowledge-map.json:95d7a6a74c12b8f7b21460c608bf29dbaf6e33a2e0b9c4f3fcea101be2ac567c, packages/ographx/.ographx/artifacts/renderx-web/analysis/analysis.json:b56fd3808fa75741fb346a411b90183faddc35c837631916d3f48b5b547db058, packages/ographx/.ographx/artifacts/renderx-web/analysis/catalog-vs-ir-gaps.json:a8943d80df9440d2d84aebc0743938e3de47f2e5c18454aac2aa8efde3a926ef, packages/ographx/.ographx/artifacts/renderx-web/analysis/comprehensive-audit.json:185d7f42a05f3b24495023f2d977b956d6c369ea437d86e48ee0dfdedb4f6b67, packages/ographx/.ographx/artifacts/renderx-web/analysis/external-interactions-audit.json:85c80c7651b2a814f35c204045bd4a0d84208cfc4fcf91d94805bbf0f54646be, packages/ographx/.ographx/artifacts/renderx-web/analysis/proposed-tests.handlers.json:df5c25d7325440975dc99e8aaf5b93e1e15fb8883b4fd58a3529e19936b5b72b, packages/ographx/.ographx/artifacts/renderx-web/catalog/catalog-components.json:f34864d2b850125a75b7933ed36f3451bf2c8f14fff97c58f4d7ec332dd30c32, packages/ographx/.ographx/artifacts/renderx-web/catalog/catalog-manifest.json:ad59b2a14593fc4bf3e788cc31114e7e06900277be655499bf759b5bc23677ae, packages/ographx/.ographx/artifacts/renderx-web/catalog/catalog-sequences.json:5d7bbd729b2de8d5f1a321a48e13fe055d9693ea438bd242fe89ef1127a32dff
Doc-Hash: 1f2cfa5dbe96be484064dde02c09961c40823ba1ee867db34d0a67303b85a12c
Generated: 2025-11-24T01:11:26.664Z
Regenerate: npm run docs:generate:governed
-->

# Test Specifications

**Generated**: 2025-11-24T01:11:26.340Z

## Overview

- **Test Files**: 272
- **Total Tests**: 1830

## Test Files by Plugin

### canvas (8 files)

#### \packages\canvas\__tests__\allowed-imports.spec.ts
- @renderx-plugins/canvas: allowed-imports rule
- allows relative and approved bare imports
- flags disallowed bare imports

#### \packages\canvas\__tests__\CanvasDrop.container-route.spec.ts
- CanvasDrop routes to library.container.drop when dropping onto a container

#### \packages\canvas\__tests__\create-page.dom.spec.ts
- CanvasPage drop orchestration (no UI node rendering)
- forwards to drop symphony and does not render React nodes directly

### canvas-component (92 files)

#### \packages\canvas-component\__tests__\advanced-line.augment.spec.ts
- Advanced Line augmentation (Phase 1)

#### \packages\canvas-component\__tests__\advanced-line.manip.handlers.spec.ts
- Advanced Line handlers — moveLineManip
- updates endpoint A and recomputes line geometry

#### \packages\canvas-component\__tests__\advanced-line.overlay.attach.spec.ts
- Advanced Line overlay attaches on selection (flag ON)

### control-panel (29 files)

#### \packages\control-panel\src\state\__tests__\css-registry.store.test.ts
- CssRegistryStore
- initialization
- createClass
- ... and 22 more

#### \packages\control-panel\__tests__\api.control-panel.classes.notify.spec.ts
- control-panel: classes add/remove + notifyUi
- addClass adds class and populates payload
- removeClass removes class and populates payload
- ... and 1 more

#### \packages\control-panel\__tests__\api.control-panel.css-management.retrieval.apply.spec.ts
- control-panel css-management retrieval/apply handlers (public API)
- getCssClass returns built-in class definition (rx-button)
- getCssClass sets error when class missing
- ... and 5 more

### digital-assets (1 files)

#### \packages\digital-assets\src\mono-graph.test.ts
- Mono Graph System
- Mono Graph Creation
- Scene Positioning and Layout
- ... and 29 more

### header (4 files)

#### \packages\header\tests\integration\css-side-effects.spec.ts
- CSS side-effects (dist build)
- injects a <style> tag with header CSS on import

#### \packages\header\tests\integration\exports.spec.ts
- package exports (source)
- exposes expected symbols

#### \packages\header\tests\unit\symphonies\ui.stage-crew.spec.ts
- ui.stage-crew handlers
- getCurrentTheme applies DOM attribute and persists
- getCurrentTheme respects existing DOM attribute first
- ... and 1 more

### host-sdk (7 files)

#### \packages\host-sdk\tests\component-mapper.spec.ts
- Component Mapper
- getTagForType
- computeTagFromJson
- ... and 11 more

#### \packages\host-sdk\tests\conductor.spec.ts
- useConductor
- should throw error when conductor not initialized in browser
- should return conductor when properly initialized
- ... and 1 more

#### \packages\host-sdk\tests\config.spec.ts
- Config API
- getConfigValue
- hasConfigValue
- ... and 15 more

### library (12 files)

#### \packages\library\src\services\__tests__\rag-enrichment-telemetry.service.test.ts
- RAGEnrichmentTelemetryService
- enrichComponentWithTelemetry
- interaction extraction
- ... and 8 more

#### \packages\library\__tests__\chat.utils.spec.ts
- Chat Utils
- loadChatHistory
- saveChatHistory
- ... and 30 more

#### \packages\library\__tests__\handlers.handlers.spec.ts
- library handlers handlers
- loadComponents - happy path
- loadComponents - edge case/error handling
- ... and 38 more

### library-component (7 files)

#### \packages\library-component\__tests__\handlers.drag.nodragimage.spec.ts
- library-component drag handlers (no drag image support, package)
- onDragStart sets payload and returns { started: true } even without setDragImage

#### \packages\library-component\__tests__\handlers.drop.container.spec.ts
- library-component container drop handlers (package)
- publishCreateRequested publishes canvas.component.create.requested with payload and ctx conductor

#### \packages\library-component\__tests__\handlers.drop.spec.ts
- library-component drop handlers (package)
- publishCreateRequested publishes canvas.component.create.requested with payload and ctx conductor

### musical-conductor (29 files)

#### \packages\musical-conductor\tests\cli-utils.test.ts
- cli-utils
- parseArgs: combines multi-token JSON for --context
- parseContextString: parses pure JSON
- ... and 2 more

#### \packages\musical-conductor\tests\unit\cli\comparison-reporter.test.ts
- ComparisonReporter
- compare
- formatComparison
- ... and 9 more

#### \packages\musical-conductor\tests\unit\cli\mock-executor.test.ts
- MockExecutor
- executeWithMocking
- getResults
- ... and 11 more

### real-estate-analyzer (2 files)

#### \packages\real-estate-analyzer\__tests__\analysis.engine.spec.ts
- AnalysisEngine
- should analyze a property and return opportunity score
- should calculate ROI potential based on zestimate
- ... and 4 more

#### \packages\real-estate-analyzer\__tests__\handlers.handlers.spec.ts
- real-estate-analyzer handlers handlers
- fetchPropertyData - happy path
- fetchPropertyData - edge case/error handling
- ... and 8 more

### self-healing (81 files)

#### \packages\self-healing\__tests__\anomaly.detect.spec.ts
- Detect Anomalies (self-healing-anomaly-detect-symphony)
- detectAnomaliesRequested - happy path
- detectAnomaliesRequested - error handling
- ... and 16 more

#### \packages\self-healing\__tests__\business-bdd\1-i-want-to-parse-production-logs-to-under.spec.ts
- Feature: I want to parse production logs to understand system behavior
- Scenario: Parse valid production logs
- Scenario: Handle missing or corrupted logs gracefully
- ... and 2 more

#### \packages\self-healing\__tests__\business-bdd\2-i-want-to-automatically-detect-anomalies.spec.ts
- Feature: I want to automatically detect anomalies in production
- Scenario: Detect performance degradation
- Scenario: Detect error rate spikes
- ... and 2 more

