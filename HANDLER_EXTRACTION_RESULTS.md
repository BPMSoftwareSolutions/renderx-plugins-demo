# Handler Extraction Results

## Summary
- **Total unique handlers**: 253
- **Total handler occurrences**: 292
- **Search scope**: packages/*/json-sequences directories

---

## Handlers by Frequency (Top 50)

| Handler | Count | Packages/Symphonies |
|---------|-------|-------------------|
| `analysis.discovery#scanOrchestrationFiles` | 14 | orchestration: build-pipeline-symphony, cag-agent-workflow, graphing-orchestration, musical-conductor-orchestration, orchestration-audit-session, orchestration-audit-system, orchestration-core, orchestration-registry-audit-pipeline, product-owner-signoff-demo, safe-continuous-delivery-pipeline, self_sequences, symphonia-conformity-alignment-pipeline, symphonic-code-analysis-demo, symphonic-code-analysis-pipeline |
| `notifyUi` | 11 | canvas-component: create, select; control-panel: classes.add, classes.remove, css.create, css.delete, css.edit, selection.show, update; header: ui.theme.get; library: library-load |
| `analysis.conformity#validateHandlerMapping` | 3 | orchestration: orchestration-registry-audit-pipeline, symphonic-code-analysis-pipeline |
| `forwardToControlPanel` | 2 | canvas-component: drag.move, resize.move |
| `refreshControlPanel` | 2 | canvas-component: update, update.svg-node |
| `initConfig` | 2 | control-panel: ui.init.batched, ui.init |
| `initResolver` | 2 | control-panel: ui.init.batched, ui.init |
| `loadSchemas` | 2 | control-panel: ui.init.batched, ui.init |
| `registerObservers` | 2 | control-panel: ui.init.batched, ui.init |
| `notifyReady` | 2 | control-panel: ui.init.batched, ui.init |
| `initMovement` | 2 | control-panel: ui.init.batched, ui.init |
| `publishCreateRequested` | 2 | library-component: container.drop, drop |
| `fractal.narration#fractalNarrator` | 2 | orchestration: fractal-orchestration-domain-symphony |
| `analysis.conformity#calculateConformityScore` | 2 | orchestration: orchestration-registry-audit-pipeline, symphonic-code-analysis-pipeline |
| `analysis.conformity#generateAnalysisReport` | 2 | orchestration: orchestration-registry-audit-pipeline, symphonic-code-analysis-pipeline |
| `loadMetrics` | 2 | slo-dashboard: dashboard.load, dashboard.refresh.metrics |
| `computeCompliance` | 2 | slo-dashboard: dashboard.load, dashboard.refresh.metrics |

---

## Single-Occurrence Handlers (By Package)

### canvas-component (30 handlers)
- serializeSelectedComponent
- copyToClipboard
- notifyCopyComplete
- resolveTemplate
- registerInstance
- createNode
- renderReact
- enhanceLine
- deleteComponent
- publishDeleted
- routeDeleteRequest
- hideAllOverlays
- publishSelectionsCleared
- deselectComponent
- publishDeselectionChanged
- routeDeselectionRequest
- endDrag
- updatePosition
- startDrag
- exportSvgToGif
- exportSvgToMp4
- queryAllComponents
- discoverComponentsFromDom
- collectCssClasses
- collectLayoutData
- buildUiFileContent
- downloadUiFile
- openUiFile
- parseUiFile
- injectCssClasses
- createComponentsSequentially
- applyHierarchyAndOrder
- endLineManip
- moveLineManip
- startLineManip
- readFromClipboard
- deserializeComponentData
- calculatePastePosition
- createPastedComponent
- notifyPasteComplete
- endResize
- endLineResize
- updateLine
- startLineResize
- updateSize
- startResize
- setAllRulesConfig
- loadAllRulesFromWindow
- getAllRulesConfig
- showSelectionOverlay
- publishSelectionChanged
- routeSelectionRequest
- showSvgNodeOverlay
- updateAttribute
- updateSvgNodeAttribute

### control-panel (15 handlers)
- addClass
- removeClass
- createCssClass
- deleteCssClass
- updateCssClass
- deriveSelectionModel
- prepareField
- dispatchField
- setDirty
- awaitRefresh
- validateField
- mergeErrors
- updateView
- generateFields
- generateSections
- renderView
- toggleSection
- updateFromElement

### header (2 handlers)
- getCurrentTheme
- toggleTheme

### library (1 handler)
- loadComponents

### library-component (1 handler)
- onDragStart

### orchestration (101 governance handlers + Build Pipeline handlers)

#### Governance Handlers (40)
- governance.handlers#validateJSONSchemaStructure
- governance.handlers#validateOrchestrationDomainsRegistry
- governance.handlers#validateSymphonyFiles
- governance.handlers#validateSchemaSection
- governance.handlers#reportJSONValidation
- governance.handlers#startHandlerMappingVerification
- governance.handlers#loadHandlerImplementations
- governance.handlers#indexBeatsFromJSON
- governance.handlers#verifyBeatHandlerMapping
- governance.handlers#detectOrphanHandlers
- governance.handlers#reportHandlerMapping
- governance.handlers#startTestCoverageVerification
- governance.handlers#catalogBeatsFromJSON
- governance.handlers#indexTestFiles
- governance.handlers#analyzeTestCoverage
- governance.handlers#identifyUncoveredBeats
- governance.handlers#reportTestCoverage
- governance.handlers#startMarkdownConsistencyCheck
- governance.handlers#extractFactsFromJSON
- governance.handlers#identifyMarkdownFiles
- governance.handlers#verifyFactsInMarkdown
- governance.handlers#detectMarkdownContradictions
- governance.handlers#reportMarkdownConsistency
- governance.handlers#startAuditabilityVerification
- governance.handlers#loadJSONDefinitions
- governance.handlers#createCodeMappings
- governance.handlers#createTestMappings
- governance.handlers#createMarkdownMappings
- governance.handlers#verifyChainCompleteness
- governance.handlers#reportAuditability
- governance.handlers#startConformityAnalysis
- governance.handlers#aggregateGovernanceResults
- governance.handlers#calculateConformityScore
- governance.handlers#summarizeViolations
- governance.handlers#makeGovernanceDecision
- governance.handlers#generateGovernanceReport
- governance.handlers#concludeGovernanceEnforcement

#### Build Pipeline Handlers (13)
- orchestration/build-pipeline.build.validation#loadBuildContext
- orchestration/build-pipeline.build.validation#validateOrchestrationDomains
- orchestration/build-pipeline.build.validation#validateGovernanceRules
- orchestration/build-pipeline.build.validation#validateAgentBehavior
- orchestration/build-pipeline.build.validation#recordValidationResults
- orchestration/build-pipeline.manifests#regenerateOrchestrationDomains
- orchestration/build-pipeline.manifests#syncJsonSources
- orchestration/build-pipeline.manifests#generateManifests
- orchestration/build-pipeline.manifests#validateManifestIntegrity
- orchestration/build-pipeline.manifests#recordManifestState
- orchestration/build-pipeline.packages.build#initializePackageBuild
- orchestration/build-pipeline.packages.build#buildComponentsPackage
- orchestration/build-pipeline.packages.build#buildMusicalConductorPackage
- orchestration/build-pipeline.packages.build#buildHostSdkPackage

#### Web Orchestration Handlers (45)
- header/ui#getCurrentTheme
- header/ui#toggleTheme
- control-panel/ui#initConfig
- control-panel/ui#initResolver
- control-panel/ui#registerObservers
- control-panel/ui#notifyReady
- canvas-component/update#updateAttribute
- canvas-component/update#refreshControlPanel
- canvas-component/select#showSelectionOverlay
- canvas-component/select#hideSelectionOverlay
- canvas-component/select.overlay.line-resize#attachLineResizeHandlers
- canvas-component/select.overlay.line-resize#ensureLineOverlayFor
- canvas-component/select#notifyUi
- canvas-component/export.export.gif#exportSvgToGif
- canvas-component/export.export.mp4#exportSvgToMp4
- library-component/drag.preview#ensurePayload
- library-component/drag.preview#computeGhostSize
- library-component/drag.preview#createGhostContainer
- library-component/drag.preview#renderTemplatePreview
- library-component/drag.preview#applyTemplateStyles
- library-component/drag.preview#computeCursorOffsets
- library-component/drag.preview#installDragImage
- self-healing/baseline#establish

#### Code Analysis Handlers (16)
- analysis.discovery#discoverSourceCode
- analysis.discovery#mapBeatsToCode
- analysis.discovery#collectBaseline
- analysis.metrics#countLinesOfCode
- analysis.metrics#analyzeComplexity
- analysis.metrics#detectDuplication
- analysis.metrics#calculateMaintainability
- analysis.coverage#measureStatementCoverage
- analysis.coverage#measureBranchCoverage
- analysis.coverage#measureFunctionCoverage
- analysis.coverage#calculateGapAnalysis
- analysis.conformity#generateTrendReport

### real-estate-analyzer (3 handlers)
- fetchPropertyData
- analyze
- format

### self-healing (47 handlers)

#### Anomaly Detection (9)
- detectAnomaliesRequested
- loadTelemetryData
- detectPerformanceAnomalies
- detectBehavioralAnomalies
- detectCoverageGaps
- detectErrorPatterns
- aggregateAnomalyResults
- storeAnomalyResults
- detectAnomaliesCompleted

#### Deployment (11)
- deployRequested
- loadValidationResults
- checkApproval
- createBranch
- applyChanges
- createPullRequest
- runCIChecks
- autoMergePR
- deployToProduction
- verifyDeployment
- deployCompleted

#### Diagnosis (13)
- analyzeRequested
- loadAnomalies
- loadCodebaseInfo
- analyzePerformanceIssues
- analyzeBehavioralIssues
- analyzeCoverageIssues
- analyzeErrorIssues
- assessImpact
- recommendFixes
- storeDiagnosis
- analyzeCompleted

#### Fix Generation (11)
- generateFixRequested
- loadDiagnosis
- generateCodeFix
- generateTestFix
- generateDocumentationFix
- createPatch
- validateSyntax
- storePatch
- generateFixCompleted

#### Learning Tracking (11)
- trackRequested
- loadDeploymentInfo
- collectPostDeploymentMetrics
- compareMetrics
- calculateImprovement
- assessSuccess
- updateLearningModels
- generateInsights
- storeEffectiveness
- trackCompleted

#### Telemetry Parsing (7)
- parseTelemetryRequested
- loadLogFiles
- extractTelemetryEvents
- normalizeTelemetryData
- aggregateTelemetryMetrics
- storeTelemetryDatabase
- parseTelemetryCompleted

#### Validation (10)
- validateRequested
- loadPatch
- applyPatch
- runTests
- checkCoverage
- verifyPerformance
- validateDocumentation
- aggregateValidationResults
- storeValidationResults
- validateCompleted

### slo-dashboard (3 handlers)
- serializeDashboardState
- triggerExportDownload
- loadBudgets

---

## Key Observations

1. **High-Frequency Handlers**:
   - `analysis.discovery#scanOrchestrationFiles` (14 occurrences) - Used across multiple orchestration symphonies
   - `notifyUi` (11 occurrences) - UI notification handler used across canvas and control-panel

2. **Governance Handlers** (40 unique):
   - All used in `architecture-governance-enforcement-symphony.json`
   - These handlers validate, verify, and enforce governance rules

3. **Orchestration Patterns**:
   - Build pipeline handlers (13) - Manage build orchestration
   - Web orchestration handlers (45) - Manage UI component coordination
   - Governance handlers (40) - Enforce architectural rules

4. **Specialized Domains**:
   - **self-healing** (47 handlers): Anomaly detection, deployment, diagnosis, fix generation, learning, telemetry, validation
   - **orchestration** (101+ handlers): Governance, build pipeline, web orchestration, code analysis
   - **canvas-component** (55+ handlers): Component manipulation, export/import, selection, resizing, dragging
   - **control-panel** (18 handlers): UI configuration and state management

5. **Uncovered Handlers** (likely candidates for metadata):
   - Most governance handlers (#validateJSONSchemaStructure, etc.)
   - Most build pipeline handlers
   - Most self-healing domain handlers
   - All domain-specific handlers with package qualifiers (e.g., `header/ui#`, `library-component/drag.preview#`)

---

## Extraction Details

**Scanned Directories**:
- packages/canvas-component/json-sequences
- packages/control-panel/json-sequences
- packages/header/json-sequences
- packages/library/json-sequences
- packages/library-component/json-sequences
- packages/orchestration/json-sequences
- packages/real-estate-analyzer/json-sequences
- packages/self-healing/json-sequences
- packages/slo-dashboard/json-sequences

**Handler Format Support**:
- String handlers (direct handler names)
- Object handlers (with `.name` property)
- Both `beats` array and `movements[].beats` array structures
