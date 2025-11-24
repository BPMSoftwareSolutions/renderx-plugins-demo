<!-- AUTO-GENERATED — DO NOT EDIT
Sources: .generated/global-traceability-map.json, .generated/project-knowledge-map.json, packages/ographx/.ographx/artifacts/renderx-web/analysis/analysis.json, packages/ographx/.ographx/artifacts/renderx-web/analysis/catalog-vs-ir-gaps.json, packages/ographx/.ographx/artifacts/renderx-web/analysis/comprehensive-audit.json, packages/ographx/.ographx/artifacts/renderx-web/analysis/external-interactions-audit.json, packages/ographx/.ographx/artifacts/renderx-web/analysis/proposed-tests.handlers.json, packages/ographx/.ographx/artifacts/renderx-web/catalog/catalog-components.json, packages/ographx/.ographx/artifacts/renderx-web/catalog/catalog-manifest.json, packages/ographx/.ographx/artifacts/renderx-web/catalog/catalog-sequences.json
Source-Hashes: .generated/global-traceability-map.json:83006a9ad2627d415bfb644385f98bd3fa6dd351b3c15ff10d1fef88de2e0197, .generated/project-knowledge-map.json:95d7a6a74c12b8f7b21460c608bf29dbaf6e33a2e0b9c4f3fcea101be2ac567c, packages/ographx/.ographx/artifacts/renderx-web/analysis/analysis.json:b56fd3808fa75741fb346a411b90183faddc35c837631916d3f48b5b547db058, packages/ographx/.ographx/artifacts/renderx-web/analysis/catalog-vs-ir-gaps.json:a8943d80df9440d2d84aebc0743938e3de47f2e5c18454aac2aa8efde3a926ef, packages/ographx/.ographx/artifacts/renderx-web/analysis/comprehensive-audit.json:185d7f42a05f3b24495023f2d977b956d6c369ea437d86e48ee0dfdedb4f6b67, packages/ographx/.ographx/artifacts/renderx-web/analysis/external-interactions-audit.json:85c80c7651b2a814f35c204045bd4a0d84208cfc4fcf91d94805bbf0f54646be, packages/ographx/.ographx/artifacts/renderx-web/analysis/proposed-tests.handlers.json:df5c25d7325440975dc99e8aaf5b93e1e15fb8883b4fd58a3529e19936b5b72b, packages/ographx/.ographx/artifacts/renderx-web/catalog/catalog-components.json:f34864d2b850125a75b7933ed36f3451bf2c8f14fff97c58f4d7ec332dd30c32, packages/ographx/.ographx/artifacts/renderx-web/catalog/catalog-manifest.json:ad59b2a14593fc4bf3e788cc31114e7e06900277be655499bf759b5bc23677ae, packages/ographx/.ographx/artifacts/renderx-web/catalog/catalog-sequences.json:5d7bbd729b2de8d5f1a321a48e13fe055d9693ea438bd242fe89ef1127a32dff
Doc-Hash: f3a5fe4e0c86e053b89a076c2668665d8a0fed7d15212464b093bb501812ff76
Generated: 2025-11-24T01:11:26.664Z
Regenerate: npm run docs:generate:governed
-->

# Handlers Without Test Coverage

**Generated**: 2025-11-24T01:11:26.346Z

## Overview

- **Total Untested Handlers**: 57
- **Total Handlers**: 423
- **Coverage Gap**: 57 handlers need tests

## Priority: Sequence-Defined Handlers

These are part of the public orchestration API and should be prioritized:
- **Count**: 7
- **Coverage**: 92%

## Untested Handlers by Plugin

### canvas (2 handlers)

#### CanvasHeader
- **File**: \packages\canvas\src\ui\CanvasHeader.tsx
- **Async**: No

#### CanvasPage
- **File**: \packages\canvas\src\ui\CanvasPage.tsx
- **Async**: No

### canvas-component (2 handlers)

#### Name
- **File**: \packages\canvas-component\src\symphonies\create\create.react.stage-crew.ts
- **Async**: No

#### transform
- **File**: \packages\canvas-component\src\types\babel-standalone.d.ts
- **Parameters**: code: string, options?: {
      presets?: (string | unknown
- **Async**: No

### control-panel (20 handlers)

#### if
- **File**: \packages\control-panel\src\symphonies\classes\classes.symphony.ts
- **Parameters**: id && updatedClasses
- **Async**: No

#### catch
- **File**: \packages\control-panel\src\symphonies\classes\classes.symphony.ts
- **Parameters**: e
- **Async**: No

#### deleteCssClass
- **File**: \packages\control-panel\src\symphonies\css-management\css-management.stage-crew.ts
- **Parameters**: data: any, ctx: any
- **Async**: No

#### initMovement
- **File**: \packages\control-panel\src\symphonies\ui\ui.stage-crew.ts
- **Parameters**: data: any, ctx: any
- **Async**: Yes

#### renderView
- **File**: \packages\control-panel\src\symphonies\ui\ui.stage-crew.ts
- **Parameters**: data: any, ctx: any
- **Async**: No

#### registerFieldRenderer
- **File**: \packages\control-panel\src\components\field-renderers\index.ts
- **Parameters**: type: string, component: FieldRenderer
- **Async**: No

#### getFieldRenderer
- **File**: \packages\control-panel\src\components\field-renderers\index.ts
- **Parameters**: type: string
- **Async**: No

#### EmptyState
- **File**: \packages\control-panel\src\components\layout\EmptyState.tsx
- **Async**: No

#### LoadingState
- **File**: \packages\control-panel\src\components\layout\LoadingState.tsx
- **Async**: No

#### PanelHeader
- **File**: \packages\control-panel\src\components\layout\PanelHeader.tsx
- **Parameters**: { selectedElement }: { selectedElement: SelectedElement | null }
- **Async**: No

#### useControlPanelActions
- **File**: \packages\control-panel\src\hooks\useControlPanelActions.ts
- **Parameters**: selectedElement: SelectedElement | null, dispatch: React.Dispatch<ControlPanelAction>
- **Async**: No

#### useControlPanelSequences
- **File**: \packages\control-panel\src\hooks\useControlPanelSequences.ts
- **Async**: No

#### useControlPanelState
- **File**: \packages\control-panel\src\hooks\useControlPanelState.ts
- **Async**: No

#### useSchemaResolver
- **File**: \packages\control-panel\src\hooks\useSchemaResolver.ts
- **Async**: No

#### controlPanelReducer
- **File**: \packages\control-panel\src\state\control-panel.reducer.ts
- **Parameters**: state: ControlPanelState, action: ControlPanelAction
- **Async**: No

#### extractElementContent
- **File**: \packages\control-panel\src\utils\content-extractor.ts
- **Parameters**: element: HTMLElement, type?: string
- **Async**: No

#### getNestedValue
- **File**: \packages\control-panel\src\utils\field.utils.ts
- **Parameters**: obj: any, path: string
- **Async**: No

#### setNestedValue
- **File**: \packages\control-panel\src\utils\field.utils.ts
- **Parameters**: obj: any, path: string, value: any
- **Async**: No

#### formatLabel
- **File**: \packages\control-panel\src\utils\field.utils.ts
- **Parameters**: key: string
- **Async**: No

#### generatePlaceholder
- **File**: \packages\control-panel\src\utils\field.utils.ts
- **Parameters**: key: string, type: string
- **Async**: No

### header (2 handlers)

#### HeaderThemeToggle
- **File**: \packages\header\src\ui\HeaderThemeToggle.tsx
- **Async**: No

#### HeaderTitle
- **File**: \packages\header\src\ui\HeaderTitle.tsx
- **Async**: No

### library (19 handlers)

#### for
- **File**: \packages\library\src\symphonies\load.symphony.ts
- **Parameters**: const f of files
- **Async**: No

#### RAGEnrichmentService.if
- **File**: \packages\library\src\services\rag-enrichment.service.ts
- **Parameters**: !libraryComponents || libraryComponents.length === 0
- **Async**: No

#### ComponentBehaviorExtractor.for
- **File**: \packages\library\src\telemetry\component-behavior-extractor.ts
- **Parameters**: const mapping of mappings
- **Async**: No

#### ComponentBehaviorExtractor.if
- **File**: \packages\library\src\telemetry\component-behavior-extractor.ts
- **Parameters**: m
- **Async**: No

#### ChatMessageComponent
- **File**: \packages\library\src\ui\ChatMessage.tsx
- **Parameters**: { 
  message, onAddToLibrary, onEditComponent, onCopyJSON, onRegenerateComponent 
}: ChatMessageProps
- **Async**: No

#### ChatWindow
- **File**: \packages\library\src\ui\ChatWindow.tsx
- **Parameters**: { isOpen, onClose, onComponentGenerated }: ChatWindowProps
- **Async**: No

#### ConfigStatusUI
- **File**: \packages\library\src\ui\ConfigStatusUI.tsx
- **Parameters**: { status }: ConfigStatusUIProps
- **Async**: No

#### CustomComponentList
- **File**: \packages\library\src\ui\CustomComponentList.tsx
- **Parameters**: { components, onComponentRemoved, onRemove }: CustomComponentListProps
- **Async**: No

#### CustomComponentUpload
- **File**: \packages\library\src\ui\CustomComponentUpload.tsx
- **Parameters**: { onUpload, onComponentAdded }: CustomComponentUploadProps
- **Async**: No

#### registerCssForComponents
- **File**: \packages\library\src\ui\LibraryPanel.tsx
- **Parameters**: items: any[], _conductor: any
- **Async**: Yes

#### LibraryPanel
- **File**: \packages\library\src\ui\LibraryPanel.tsx
- **Async**: No

#### LibraryPreview
- **File**: \packages\library\src\ui\LibraryPreview.tsx
- **Parameters**: {
  component, conductor, }: {
  component: any;
  conductor: any;
}
- **Async**: No

#### computePreviewModel
- **File**: \packages\library\src\ui\preview.model.ts
- **Parameters**: component: any
- **Async**: No

#### startNewChatSession
- **File**: \packages\library\src\utils\chat.utils.ts
- **Async**: No

#### exportChatHistory
- **File**: \packages\library\src\utils\chat.utils.ts
- **Async**: No

#### importChatHistory
- **File**: \packages\library\src\utils\chat.utils.ts
- **Parameters**: jsonData: string
- **Async**: No

#### cleanupChatHistory
- **File**: \packages\library\src\utils\chat.utils.ts
- **Parameters**: maxSessions: number = MAX_HISTORY_SESSIONS
- **Async**: No

#### buildSystemPrompt
- **File**: \packages\library\src\utils\prompt.templates.ts
- **Parameters**: context?: PromptContext
- **Async**: No

#### getPromptTemplate
- **File**: \packages\library\src\utils\prompt.templates.ts
- **Parameters**: id: string
- **Async**: No

### library-component (8 handlers)

#### computeGhostSize
- **File**: \packages\library-component\src\symphonies\drag\drag.preview.stage-crew.ts
- **Parameters**: e: any, component: any
- **Async**: No

#### createGhostContainer
- **File**: \packages\library-component\src\symphonies\drag\drag.preview.stage-crew.ts
- **Parameters**: width: number, height: number
- **Async**: No

#### renderTemplatePreview
- **File**: \packages\library-component\src\symphonies\drag\drag.preview.stage-crew.ts
- **Parameters**: ghost: HTMLElement, template: any, width: number, height: number
- **Async**: No

#### applyTemplateStyles
- **File**: \packages\library-component\src\symphonies\drag\drag.preview.stage-crew.ts
- **Parameters**: ghost: HTMLElement, template: any
- **Async**: No

#### computeCursorOffsets
- **File**: \packages\library-component\src\symphonies\drag\drag.preview.stage-crew.ts
- **Parameters**: e: any, targetEl: HTMLElement | null, width: number, height: number
- **Async**: No

#### installDragImage
- **File**: \packages\library-component\src\symphonies\drag\drag.preview.stage-crew.ts
- **Parameters**: dt: DataTransfer, ghost: HTMLElement, offsetX: number, offsetY: number
- **Async**: No

#### onDragStart
- **File**: \packages\library-component\src\symphonies\drag.symphony.ts
- **Parameters**: data: any
- **Async**: No

#### publishCreateRequested
- **File**: \packages\library-component\src\symphonies\drop.container.symphony.ts
- **Parameters**: data: any, ctx: any
- **Async**: Yes

### real-estate-analyzer (4 handlers)

#### analyze
- **File**: \packages\real-estate-analyzer\src\index.ts
- **Parameters**: _data: Record<string, never>, ctx: SequenceContext
- **Async**: Yes

#### format
- **File**: \packages\real-estate-analyzer\src\index.ts
- **Parameters**: _data: Record<string, never>, ctx: SequenceContext
- **Async**: Yes

#### ZillowService.if
- **File**: \packages\real-estate-analyzer\src\services\zillow.service.ts
- **Parameters**: !ZILLOW_API_KEY
- **Async**: No

#### OpportunityAnalyzer
- **File**: \packages\real-estate-analyzer\src\ui\OpportunityAnalyzer.tsx
- **Async**: No

