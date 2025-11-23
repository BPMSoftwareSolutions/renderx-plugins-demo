# Handlers Without Test Coverage

**Generated**: 2025-11-23T00:23:58.232Z

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

