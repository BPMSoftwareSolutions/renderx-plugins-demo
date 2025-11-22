# Handler Specifications & Test Coverage

**Generated**: 2025-11-22T16:25:28.168Z

## Overview

- **Total Handlers**: 423
- **With Tests**: 146
- **Without Tests**: 76
- **Coverage**: 66%

## Handlers WITH Test Coverage (146)

### register
- **File**: \packages\canvas\src\index.ts
- **Plugin**: canvas
- **Test Files**: 3
- **Tests**:
  - @renderx-plugins/control-panel package exports
  - exports ControlPanel UI component
  - exports register() function (no-op allowed)
  - exports selection symphony handlers
  - register function
  - ... and 8 more

### onDropForTest
- **File**: \packages\canvas\src\ui\CanvasDrop.ts
- **Plugin**: canvas
- **Test Files**: 2
- **Tests**:
  - CanvasDrop routes to library.container.drop when dropping onto a container
  - canvas drop triggers library-component drop sequence

### enhanceLine
- **File**: \packages\canvas-component\src\symphonies\augment\augment.line.stage-crew.ts
- **Plugin**: canvas-component
- **Test Files**: 2
- **Tests**:
  - Advanced Line augmentation (Phase 1)
  - Advanced Line recompute (Phase 2+3)
  - maps CSS vars to line x1/y1/x2/y2 in viewBox coordinates
  - toggles marker-end via --arrowEnd CSS var
  - renders quadratic path when --curve=1 with --cx/--cy
  - ... and 1 more

### recomputeLineSvg
- **File**: \packages\canvas-component\src\symphonies\augment\line.recompute.stage-crew.ts
- **Plugin**: canvas-component
- **Test Files**: 5
- **Tests**:
  - Advanced Line handlers — moveLineManip
  - updates endpoint A and recomputes line geometry
  - Advanced Line overlay drag — cumulative delta causes runaway (expected failing)
  - Advanced Line recompute (Phase 2+3)
  - maps CSS vars to line x1/y1/x2/y2 in viewBox coordinates
  - ... and 8 more

### serializeSelectedComponent
- **File**: \packages\canvas-component\src\symphonies\copy\copy.stage-crew.ts
- **Plugin**: canvas-component
- **Test Files**: 1
- **Tests**:
  - canvas-component handlers handlers
  - serializeSelectedComponent - returns clipboardData when element present
  - serializeSelectedComponent - empty result when no selection
  - copyToClipboard - writes to fallback clipboard memory
  - notifyCopyComplete - does not throw
  - ... and 79 more

### copyToClipboard
- **File**: \packages\canvas-component\src\symphonies\copy\copy.stage-crew.ts
- **Plugin**: canvas-component
- **Test Files**: 1
- **Tests**:
  - canvas-component handlers handlers
  - serializeSelectedComponent - returns clipboardData when element present
  - serializeSelectedComponent - empty result when no selection
  - copyToClipboard - writes to fallback clipboard memory
  - notifyCopyComplete - does not throw
  - ... and 79 more

### notifyCopyComplete
- **File**: \packages\canvas-component\src\symphonies\copy\copy.stage-crew.ts
- **Plugin**: canvas-component
- **Test Files**: 1
- **Tests**:
  - canvas-component handlers handlers
  - serializeSelectedComponent - returns clipboardData when element present
  - serializeSelectedComponent - empty result when no selection
  - copyToClipboard - writes to fallback clipboard memory
  - notifyCopyComplete - does not throw
  - ... and 79 more

### resolveTemplate
- **File**: \packages\canvas-component\src\symphonies\create\create.arrangement.ts
- **Plugin**: canvas-component
- **Test Files**: 1
- **Tests**:
  - canvas-component handlers handlers
  - serializeSelectedComponent - returns clipboardData when element present
  - serializeSelectedComponent - empty result when no selection
  - copyToClipboard - writes to fallback clipboard memory
  - notifyCopyComplete - does not throw
  - ... and 79 more

### injectCssFallback
- **File**: \packages\canvas-component\src\symphonies\create\create.css.stage-crew.ts
- **Plugin**: canvas-component
- **Test Files**: 1
- **Tests**:
  - canvas-component handlers handlers
  - serializeSelectedComponent - returns clipboardData when element present
  - serializeSelectedComponent - empty result when no selection
  - copyToClipboard - writes to fallback clipboard memory
  - notifyCopyComplete - does not throw
  - ... and 79 more

### injectRawCss
- **File**: \packages\canvas-component\src\symphonies\create\create.css.stage-crew.ts
- **Plugin**: canvas-component
- **Test Files**: 1
- **Tests**:
  - canvas-component handlers handlers
  - serializeSelectedComponent - returns clipboardData when element present
  - serializeSelectedComponent - empty result when no selection
  - copyToClipboard - writes to fallback clipboard memory
  - notifyCopyComplete - does not throw
  - ... and 79 more

### getCanvasOrThrow
- **File**: \packages\canvas-component\src\symphonies\create\create.dom.stage-crew.ts
- **Plugin**: canvas-component
- **Test Files**: 1
- **Tests**:
  - canvas-component create.dom.stage-crew handlers
  - getCanvasOrThrow - returns canvas element
  - getCanvasOrThrow - throws when canvas missing
  - createElementWithId - creates element with ID
  - applyClasses - applies class list
  - ... and 2 more

### createElementWithId
- **File**: \packages\canvas-component\src\symphonies\create\create.dom.stage-crew.ts
- **Plugin**: canvas-component
- **Test Files**: 1
- **Tests**:
  - canvas-component create.dom.stage-crew handlers
  - getCanvasOrThrow - returns canvas element
  - getCanvasOrThrow - throws when canvas missing
  - createElementWithId - creates element with ID
  - applyClasses - applies class list
  - ... and 2 more

### applyClasses
- **File**: \packages\canvas-component\src\symphonies\create\create.dom.stage-crew.ts
- **Plugin**: canvas-component
- **Test Files**: 1
- **Tests**:
  - canvas-component create.dom.stage-crew handlers
  - getCanvasOrThrow - returns canvas element
  - getCanvasOrThrow - throws when canvas missing
  - createElementWithId - creates element with ID
  - applyClasses - applies class list
  - ... and 2 more

### applyInlineStyle
- **File**: \packages\canvas-component\src\symphonies\create\create.dom.stage-crew.ts
- **Plugin**: canvas-component
- **Test Files**: 1
- **Tests**:
  - canvas-component create.dom.stage-crew handlers
  - getCanvasOrThrow - returns canvas element
  - getCanvasOrThrow - throws when canvas missing
  - createElementWithId - creates element with ID
  - applyClasses - applies class list
  - ... and 2 more

### appendTo
- **File**: \packages\canvas-component\src\symphonies\create\create.dom.stage-crew.ts
- **Plugin**: canvas-component
- **Test Files**: 1
- **Tests**:
  - canvas-component create.dom.stage-crew handlers
  - getCanvasOrThrow - returns canvas element
  - getCanvasOrThrow - throws when canvas missing
  - createElementWithId - creates element with ID
  - applyClasses - applies class list
  - ... and 2 more

### transformImportToCreatePayload
- **File**: \packages\canvas-component\src\symphonies\create\create.from-import.ts
- **Plugin**: canvas-component
- **Test Files**: 1
- **Tests**:
  - transformImportToCreatePayload
  - maps import record to create payload with template, position, container and override id
  - handles minimal shapes without optional fields

### attachStandardImportInteractions
- **File**: \packages\canvas-component\src\symphonies\create\create.from-import.ts
- **Plugin**: canvas-component
- **Test Files**: 1
- **Tests**:
  - attachStandardImportInteractions forwards drag positions
  - publishes drag.move with { id, position }
  - publishes drag.end with { id, position } mapped from finalPosition when present

### createFromImportRecord
- **File**: \packages\canvas-component\src\symphonies\create\create.from-import.ts
- **Plugin**: canvas-component
- **Test Files**: 1
- **Tests**:
  - canvas-component handlers handlers
  - serializeSelectedComponent - returns clipboardData when element present
  - serializeSelectedComponent - empty result when no selection
  - copyToClipboard - writes to fallback clipboard memory
  - notifyCopyComplete - does not throw
  - ... and 79 more

### transformClipboardToCreatePayload
- **File**: \packages\canvas-component\src\symphonies\create\create.from-import.ts
- **Plugin**: canvas-component
- **Test Files**: 1
- **Tests**:
  - toCreatePayloadFromData (clipboard shape)
  - transformClipboardToCreatePayload
  - builds create payload from clipboard-shaped component without preserving id
  - maps template/position straight through
  - handles renderx-component wrapper structure

### toCreatePayloadFromData
- **File**: \packages\canvas-component\src\symphonies\create\create.from-import.ts
- **Plugin**: canvas-component
- **Test Files**: 1
- **Tests**:
  - toCreatePayloadFromData (clipboard shape)
  - transformClipboardToCreatePayload
  - builds create payload from clipboard-shaped component without preserving id
  - maps template/position straight through
  - handles renderx-component wrapper structure

### attachSelection
- **File**: \packages\canvas-component\src\symphonies\create\create.interactions.stage-crew.ts
- **Plugin**: canvas-component
- **Test Files**: 1
- **Tests**:
  - canvas-component handlers handlers
  - serializeSelectedComponent - returns clipboardData when element present
  - serializeSelectedComponent - empty result when no selection
  - copyToClipboard - writes to fallback clipboard memory
  - notifyCopyComplete - does not throw
  - ... and 79 more

### attachDrag
- **File**: \packages\canvas-component\src\symphonies\create\create.interactions.stage-crew.ts
- **Plugin**: canvas-component
- **Test Files**: 1
- **Tests**:
  - canvas-component handlers handlers
  - serializeSelectedComponent - returns clipboardData when element present
  - serializeSelectedComponent - empty result when no selection
  - copyToClipboard - writes to fallback clipboard memory
  - notifyCopyComplete - does not throw
  - ... and 79 more

### attachSvgNodeClick
- **File**: \packages\canvas-component\src\symphonies\create\create.interactions.stage-crew.ts
- **Plugin**: canvas-component
- **Test Files**: 1
- **Tests**:
  - canvas-component handlers handlers
  - serializeSelectedComponent - returns clipboardData when element present
  - serializeSelectedComponent - empty result when no selection
  - copyToClipboard - writes to fallback clipboard memory
  - notifyCopyComplete - does not throw
  - ... and 79 more

### registerInstance
- **File**: \packages\canvas-component\src\symphonies\create\create.io.ts
- **Plugin**: canvas-component
- **Test Files**: 1
- **Tests**:
  - canvas-component create.io
  - persists node metadata to KV/cache
  - throws when IO is accessed in a pure beat (guard example)

### renderReact
- **File**: \packages\canvas-component\src\symphonies\create\create.react.stage-crew.ts
- **Plugin**: canvas-component
- **Test Files**: 2
- **Tests**:
  - renderReact handler
  - cleanupReactRoot
  - skips rendering for non-React components
  - warns and returns early if nodeId is missing
  - warns and returns early if React code is missing
  - ... and 19 more

### cleanupReactRoot
- **File**: \packages\canvas-component\src\symphonies\create\create.react.stage-crew.ts
- **Plugin**: canvas-component
- **Test Files**: 2
- **Tests**:
  - renderReact handler
  - cleanupReactRoot
  - skips rendering for non-React components
  - warns and returns early if nodeId is missing
  - warns and returns early if React code is missing
  - ... and 19 more

### exposeEventRouterToReact
- **File**: \packages\canvas-component\src\symphonies\create\create.react.stage-crew.ts
- **Plugin**: canvas-component
- **Test Files**: 1
- **Tests**:
  - React Component Rendering
  - should render React component successfully
  - should publish componentMounted event
  - should handle React code with props
  - should handle compilation errors gracefully
  - ... and 5 more

### createNode
- **File**: \packages\canvas-component\src\symphonies\create\create.stage-crew.ts
- **Plugin**: canvas-component
- **Test Files**: 1
- **Tests**:
  - canvas-component public API beats
  - notifyUi (selection) routes to control panel selection.show via conductor.play
  - routeSelectionRequest forwards to canvas.component.select with _routed flag
  - updateAttribute applies update via rule engine and stores payload
  - createNode creates element under #rx-canvas and populates createdNode payload

### computeInstanceClass
- **File**: \packages\canvas-component\src\symphonies\create\create.style.stage-crew.ts
- **Plugin**: canvas-component
- **Test Files**: 1
- **Tests**:
  - canvas-component handlers handlers
  - serializeSelectedComponent - returns clipboardData when element present
  - serializeSelectedComponent - empty result when no selection
  - copyToClipboard - writes to fallback clipboard memory
  - notifyCopyComplete - does not throw
  - ... and 79 more

### computeCssVarBlock
- **File**: \packages\canvas-component\src\symphonies\create\create.style.stage-crew.ts
- **Plugin**: canvas-component
- **Test Files**: 1
- **Tests**:
  - canvas-component handlers handlers
  - serializeSelectedComponent - returns clipboardData when element present
  - serializeSelectedComponent - empty result when no selection
  - copyToClipboard - writes to fallback clipboard memory
  - notifyCopyComplete - does not throw
  - ... and 79 more

### computeInlineStyle
- **File**: \packages\canvas-component\src\symphonies\create\create.style.stage-crew.ts
- **Plugin**: canvas-component
- **Test Files**: 1
- **Tests**:
  - canvas-component handlers handlers
  - serializeSelectedComponent - returns clipboardData when element present
  - serializeSelectedComponent - empty result when no selection
  - copyToClipboard - writes to fallback clipboard memory
  - notifyCopyComplete - does not throw
  - ... and 79 more

### validateReactCode
- **File**: \packages\canvas-component\src\symphonies\create\react-code-validator.ts
- **Plugin**: canvas-component
- **Test Files**: 1
- **Tests**:
  - React Code Validator
  - Valid React Code
  - Invalid React Code - Syntax Errors
  - Invalid React Code - Empty/Invalid Input
  - Warnings
  - ... and 19 more

### validateReactCodeOrThrow
- **File**: \packages\canvas-component\src\symphonies\create\react-code-validator.ts
- **Plugin**: canvas-component
- **Test Files**: 1
- **Tests**:
  - React Code Validator
  - Valid React Code
  - Invalid React Code - Syntax Errors
  - Invalid React Code - Empty/Invalid Input
  - Warnings
  - ... and 19 more

### publishDeleted
- **File**: \packages\canvas-component\src\symphonies\delete\delete.stage-crew.ts
- **Plugin**: canvas-component
- **Test Files**: 1
- **Tests**:
  - canvas-component handlers handlers
  - serializeSelectedComponent - returns clipboardData when element present
  - serializeSelectedComponent - empty result when no selection
  - copyToClipboard - writes to fallback clipboard memory
  - notifyCopyComplete - does not throw
  - ... and 79 more

### deleteComponent
- **File**: \packages\canvas-component\src\symphonies\delete\delete.stage-crew.ts
- **Plugin**: canvas-component
- **Test Files**: 1
- **Tests**:
  - canvas-component handlers handlers
  - serializeSelectedComponent - returns clipboardData when element present
  - serializeSelectedComponent - empty result when no selection
  - copyToClipboard - writes to fallback clipboard memory
  - notifyCopyComplete - does not throw
  - ... and 79 more

### routeDeleteRequest
- **File**: \packages\canvas-component\src\symphonies\delete\delete.stage-crew.ts
- **Plugin**: canvas-component
- **Test Files**: 1
- **Tests**:
  - canvas-component handlers handlers
  - serializeSelectedComponent - returns clipboardData when element present
  - serializeSelectedComponent - empty result when no selection
  - copyToClipboard - writes to fallback clipboard memory
  - notifyCopyComplete - does not throw
  - ... and 79 more

### hideAllOverlays
- **File**: \packages\canvas-component\src\symphonies\deselect\deselect.stage-crew.ts
- **Plugin**: canvas-component
- **Test Files**: 1
- **Tests**:
  - canvas-component deselect.stage-crew handlers
  - hideAllOverlays - hides overlays if present
  - hideAllOverlays - safe when overlays are missing
  - deselectComponent - executes without throwing
  - deselectComponent - no-op when id missing
  - ... and 6 more

### deselectComponent
- **File**: \packages\canvas-component\src\symphonies\deselect\deselect.stage-crew.ts
- **Plugin**: canvas-component
- **Test Files**: 1
- **Tests**:
  - canvas-component deselect.stage-crew handlers
  - hideAllOverlays - hides overlays if present
  - hideAllOverlays - safe when overlays are missing
  - deselectComponent - executes without throwing
  - deselectComponent - no-op when id missing
  - ... and 6 more

### publishDeselectionChanged
- **File**: \packages\canvas-component\src\symphonies\deselect\deselect.stage-crew.ts
- **Plugin**: canvas-component
- **Test Files**: 1
- **Tests**:
  - canvas-component deselect.stage-crew handlers
  - hideAllOverlays - hides overlays if present
  - hideAllOverlays - safe when overlays are missing
  - deselectComponent - executes without throwing
  - deselectComponent - no-op when id missing
  - ... and 6 more

### publishSelectionsCleared
- **File**: \packages\canvas-component\src\symphonies\deselect\deselect.stage-crew.ts
- **Plugin**: canvas-component
- **Test Files**: 1
- **Tests**:
  - canvas-component deselect.stage-crew handlers
  - hideAllOverlays - hides overlays if present
  - hideAllOverlays - safe when overlays are missing
  - deselectComponent - executes without throwing
  - deselectComponent - no-op when id missing
  - ... and 6 more

### clearAllSelections
- **File**: \packages\canvas-component\src\symphonies\deselect\deselect.stage-crew.ts
- **Plugin**: canvas-component
- **Test Files**: 1
- **Tests**:
  - canvas-component deselect.stage-crew handlers
  - hideAllOverlays - hides overlays if present
  - hideAllOverlays - safe when overlays are missing
  - deselectComponent - executes without throwing
  - deselectComponent - no-op when id missing
  - ... and 6 more

### routeDeselectionRequest
- **File**: \packages\canvas-component\src\symphonies\deselect\deselect.stage-crew.ts
- **Plugin**: canvas-component
- **Test Files**: 1
- **Tests**:
  - canvas-component deselect.stage-crew handlers
  - hideAllOverlays - hides overlays if present
  - hideAllOverlays - safe when overlays are missing
  - deselectComponent - executes without throwing
  - deselectComponent - no-op when id missing
  - ... and 6 more

### updatePosition
- **File**: \packages\canvas-component\src\symphonies\drag\drag.stage-crew.ts
- **Plugin**: canvas-component
- **Test Files**: 1
- **Tests**:
  - canvas-component drag.stage-crew handlers
  - updatePosition - moves element based on delta
  - updatePosition - throws on missing id
  - startDrag - initializes drag state
  - startDrag - warns on missing id
  - ... and 3 more

### startDrag
- **File**: \packages\canvas-component\src\symphonies\drag\drag.stage-crew.ts
- **Plugin**: canvas-component
- **Test Files**: 1
- **Tests**:
  - canvas-component drag.stage-crew handlers
  - updatePosition - moves element based on delta
  - updatePosition - throws on missing id
  - startDrag - initializes drag state
  - startDrag - warns on missing id
  - ... and 3 more

### endDrag
- **File**: \packages\canvas-component\src\symphonies\drag\drag.stage-crew.ts
- **Plugin**: canvas-component
- **Test Files**: 1
- **Tests**:
  - canvas-component drag.stage-crew handlers
  - updatePosition - moves element based on delta
  - updatePosition - throws on missing id
  - startDrag - initializes drag state
  - startDrag - warns on missing id
  - ... and 3 more

### forwardToControlPanel
- **File**: \packages\canvas-component\src\symphonies\drag\drag.stage-crew.ts
- **Plugin**: canvas-component
- **Test Files**: 1
- **Tests**:
  - canvas-component drag.stage-crew handlers
  - updatePosition - moves element based on delta
  - updatePosition - throws on missing id
  - startDrag - initializes drag state
  - startDrag - warns on missing id
  - ... and 3 more

### collectCssClasses
- **File**: \packages\canvas-component\src\symphonies\export\export.css.stage-crew.ts
- **Plugin**: canvas-component
- **Test Files**: 7
- **Tests**:
  - canvas-component export/import content preservation (migrated)
  - should export and import button content correctly
  - CSS collection fix for classRefs vs classes mismatch (migrated)
  - collects CSS from components with template.classRefs (current export format)
  - still supports legacy components with classes property
  - ... and 11 more

### discoverComponentsFromDom
- **File**: \packages\canvas-component\src\symphonies\export\export.discover.stage-crew.ts
- **Plugin**: canvas-component
- **Test Files**: 1
- **Tests**:
  - canvas-component export/import content preservation (migrated)
  - should export and import button content correctly

### downloadUiFile
- **File**: \packages\canvas-component\src\symphonies\export\export.download.stage-crew.ts
- **Plugin**: canvas-component
- **Test Files**: 1
- **Tests**:
  - canvas-component export integration (basic)
  - should complete full export flow successfully
  - should handle missing components gracefully

### exportSvgToGif
- **File**: \packages\canvas-component\src\symphonies\export\export.gif.stage-crew.ts
- **Plugin**: canvas-component
- **Test Files**: 2
- **Tests**:
  - exportSvgToGif isolated
  - success minimal export triggers download without error
  - sets error when 2D context unavailable
  - canvas-component handlers handlers
  - serializeSelectedComponent - returns clipboardData when element present
  - ... and 82 more

### queryAllComponents
- **File**: \packages\canvas-component\src\symphonies\export\export.io.ts
- **Plugin**: canvas-component
- **Test Files**: 7
- **Tests**:
  - canvas-component export/import content preservation (migrated)
  - should export and import button content correctly
  - canvas-component export integration (basic)
  - should complete full export flow successfully
  - should handle missing components gracefully
  - ... and 19 more

### createMP4Encoder
- **File**: \packages\canvas-component\src\symphonies\export\export.mp4-encoder.ts
- **Plugin**: canvas-component
- **Test Files**: 1
- **Tests**:
  - canvas-component handlers handlers
  - serializeSelectedComponent - returns clipboardData when element present
  - serializeSelectedComponent - empty result when no selection
  - copyToClipboard - writes to fallback clipboard memory
  - notifyCopyComplete - does not throw
  - ... and 79 more

### exportSvgToMp4
- **File**: \packages\canvas-component\src\symphonies\export\export.mp4.stage-crew.ts
- **Plugin**: canvas-component
- **Test Files**: 1
- **Tests**:
  - canvas-component handlers handlers
  - serializeSelectedComponent - returns clipboardData when element present
  - serializeSelectedComponent - empty result when no selection
  - copyToClipboard - writes to fallback clipboard memory
  - notifyCopyComplete - does not throw
  - ... and 79 more

### buildUiFileContent
- **File**: \packages\canvas-component\src\symphonies\export\export.pure.ts
- **Plugin**: canvas-component
- **Test Files**: 8
- **Tests**:
  - canvas-component export/import content preservation (migrated)
  - should export and import button content correctly
  - canvas-component export integration (basic)
  - should complete full export flow successfully
  - should handle missing components gracefully
  - ... and 22 more

### collectLayoutData
- **File**: \packages\canvas-component\src\symphonies\export\export.stage-crew.ts
- **Plugin**: canvas-component
- **Test Files**: 7
- **Tests**:
  - canvas-component export/import content preservation (migrated)
  - should export and import button content correctly
  - canvas-component export integration (basic)
  - should complete full export flow successfully
  - should handle missing components gracefully
  - ... and 16 more

### injectCssClasses
- **File**: \packages\canvas-component\src\symphonies\import\import.css.stage-crew.ts
- **Plugin**: canvas-component
- **Test Files**: 5
- **Tests**:
  - canvas-component export/import content preservation (migrated)
  - should export and import button content correctly
  - import flow injects instance class on DOM elements
  - adds rx-comp-<tag>-<id> class for imported components
  - canvas-component import integration (migrated)
  - ... and 6 more

### openUiFile
- **File**: \packages\canvas-component\src\symphonies\import\import.file.stage-crew.ts
- **Plugin**: canvas-component
- **Test Files**: 1
- **Tests**:
  - canvas-component handlers handlers
  - serializeSelectedComponent - returns clipboardData when element present
  - serializeSelectedComponent - empty result when no selection
  - copyToClipboard - writes to fallback clipboard memory
  - notifyCopyComplete - does not throw
  - ... and 79 more

### registerInstances
- **File**: \packages\canvas-component\src\symphonies\import\import.io.ts
- **Plugin**: canvas-component
- **Test Files**: 1
- **Tests**:
  - canvas-component import integration (migrated)
  - imports UI file: injects css, creates DOM hierarchy, applies layout, registers KV

### createComponentsSequentially
- **File**: \packages\canvas-component\src\symphonies\import\import.nodes.stage-crew.ts
- **Plugin**: canvas-component
- **Test Files**: 3
- **Tests**:
  - import flow injects instance class on DOM elements
  - adds rx-comp-<tag>-<id> class for imported components
  - canvas-component import: nested structures
  - imports container inside container
  - imports grandchild component in nested container
  - ... and 2 more

### applyHierarchyAndOrder
- **File**: \packages\canvas-component\src\symphonies\import\import.nodes.stage-crew.ts
- **Plugin**: canvas-component
- **Test Files**: 6
- **Tests**:
  - canvas-component export/import content preservation (migrated)
  - should export and import button content correctly
  - import flow injects instance class on DOM elements
  - adds rx-comp-<tag>-<id> class for imported components
  - canvas-component import integration (migrated)
  - ... and 8 more

### parseUiFile
- **File**: \packages\canvas-component\src\symphonies\import\import.parse.pure.ts
- **Plugin**: canvas-component
- **Test Files**: 8
- **Tests**:
  - canvas-component export/import content preservation (migrated)
  - should export and import button content correctly
  - import.parse adds default base classes
  - adds rx-comp and rx-<type> when missing from classRefs
  - import flow injects instance class on DOM elements
  - ... and 14 more

### startLineManip
- **File**: \packages\canvas-component\src\symphonies\line-advanced\line.manip.stage-crew.ts
- **Plugin**: canvas-component
- **Test Files**: 1
- **Tests**:
  - canvas-component handlers handlers
  - serializeSelectedComponent - returns clipboardData when element present
  - serializeSelectedComponent - empty result when no selection
  - copyToClipboard - writes to fallback clipboard memory
  - notifyCopyComplete - does not throw
  - ... and 79 more

### moveLineManip
- **File**: \packages\canvas-component\src\symphonies\line-advanced\line.manip.stage-crew.ts
- **Plugin**: canvas-component
- **Test Files**: 2
- **Tests**:
  - Advanced Line handlers — moveLineManip
  - updates endpoint A and recomputes line geometry
  - canvas-component handlers handlers
  - serializeSelectedComponent - returns clipboardData when element present
  - serializeSelectedComponent - empty result when no selection
  - ... and 81 more

### endLineManip
- **File**: \packages\canvas-component\src\symphonies\line-advanced\line.manip.stage-crew.ts
- **Plugin**: canvas-component
- **Test Files**: 1
- **Tests**:
  - canvas-component handlers handlers
  - serializeSelectedComponent - returns clipboardData when element present
  - serializeSelectedComponent - empty result when no selection
  - copyToClipboard - writes to fallback clipboard memory
  - notifyCopyComplete - does not throw
  - ... and 79 more

### readFromClipboard
- **File**: \packages\canvas-component\src\symphonies\paste\paste.stage-crew.ts
- **Plugin**: canvas-component
- **Test Files**: 1
- **Tests**:
  - canvas-component paste.stage-crew handlers
  - readFromClipboard - parses clipboard into clipboardData
  - deserializeComponentData - uses provided clipboardText
  - calculatePastePosition - offsets by +20,+20
  - createPastedComponent - transforms and plays create sequence
  - ... and 1 more

### deserializeComponentData
- **File**: \packages\canvas-component\src\symphonies\paste\paste.stage-crew.ts
- **Plugin**: canvas-component
- **Test Files**: 1
- **Tests**:
  - canvas-component paste.stage-crew handlers
  - readFromClipboard - parses clipboard into clipboardData
  - deserializeComponentData - uses provided clipboardText
  - calculatePastePosition - offsets by +20,+20
  - createPastedComponent - transforms and plays create sequence
  - ... and 1 more

### calculatePastePosition
- **File**: \packages\canvas-component\src\symphonies\paste\paste.stage-crew.ts
- **Plugin**: canvas-component
- **Test Files**: 1
- **Tests**:
  - canvas-component paste.stage-crew handlers
  - readFromClipboard - parses clipboard into clipboardData
  - deserializeComponentData - uses provided clipboardText
  - calculatePastePosition - offsets by +20,+20
  - createPastedComponent - transforms and plays create sequence
  - ... and 1 more

### createPastedComponent
- **File**: \packages\canvas-component\src\symphonies\paste\paste.stage-crew.ts
- **Plugin**: canvas-component
- **Test Files**: 2
- **Tests**:
  - paste interactions attach and publish drag events
  - attaches onDragMove to payload passed into canvas.component.create and publishes {id, position}
  - canvas-component paste.stage-crew handlers
  - readFromClipboard - parses clipboard into clipboardData
  - deserializeComponentData - uses provided clipboardText
  - ... and 3 more

### notifyPasteComplete
- **File**: \packages\canvas-component\src\symphonies\paste\paste.stage-crew.ts
- **Plugin**: canvas-component
- **Test Files**: 1
- **Tests**:
  - canvas-component paste.stage-crew handlers
  - readFromClipboard - parses clipboard into clipboardData
  - deserializeComponentData - uses provided clipboardText
  - calculatePastePosition - offsets by +20,+20
  - createPastedComponent - transforms and plays create sequence
  - ... and 1 more

### startResize
- **File**: \packages\canvas-component\src\symphonies\resize\resize.stage-crew.ts
- **Plugin**: canvas-component
- **Test Files**: 1
- **Tests**:
  - canvas-component resize.stage-crew handlers
  - startResize - captures line base metrics (non-line harmless)
  - updateSize - applies size deltas and updates payload
  - updateSize - throws on missing id
  - endResize - executes without error

### updateSize
- **File**: \packages\canvas-component\src\symphonies\resize\resize.stage-crew.ts
- **Plugin**: canvas-component
- **Test Files**: 1
- **Tests**:
  - canvas-component resize.stage-crew handlers
  - startResize - captures line base metrics (non-line harmless)
  - updateSize - applies size deltas and updates payload
  - updateSize - throws on missing id
  - endResize - executes without error

### endResize
- **File**: \packages\canvas-component\src\symphonies\resize\resize.stage-crew.ts
- **Plugin**: canvas-component
- **Test Files**: 1
- **Tests**:
  - canvas-component resize.stage-crew handlers
  - startResize - captures line base metrics (non-line harmless)
  - updateSize - applies size deltas and updates payload
  - updateSize - throws on missing id
  - endResize - executes without error

### startLineResize
- **File**: \packages\canvas-component\src\symphonies\resize-line\resize.line.stage-crew.ts
- **Plugin**: canvas-component
- **Test Files**: 1
- **Tests**:
  - canvas-component resize.line.stage-crew handlers
  - startLineResize - calls optional callback harmlessly
  - updateLine - updates endpoints/length
  - updateLine - throws when id missing
  - endLineResize - invokes optional callback

### updateLine
- **File**: \packages\canvas-component\src\symphonies\resize-line\resize.line.stage-crew.ts
- **Plugin**: canvas-component
- **Test Files**: 1
- **Tests**:
  - canvas-component resize.line.stage-crew handlers
  - startLineResize - calls optional callback harmlessly
  - updateLine - updates endpoints/length
  - updateLine - throws when id missing
  - endLineResize - invokes optional callback

### endLineResize
- **File**: \packages\canvas-component\src\symphonies\resize-line\resize.line.stage-crew.ts
- **Plugin**: canvas-component
- **Test Files**: 1
- **Tests**:
  - canvas-component resize.line.stage-crew handlers
  - startLineResize - calls optional callback harmlessly
  - updateLine - updates endpoints/length
  - updateLine - throws when id missing
  - endLineResize - invokes optional callback

### ensureOverlayCss
- **File**: \packages\canvas-component\src\symphonies\select\select.overlay.css.stage-crew.ts
- **Plugin**: canvas-component
- **Test Files**: 1
- **Tests**:
  - canvas-component handlers handlers
  - serializeSelectedComponent - returns clipboardData when element present
  - serializeSelectedComponent - empty result when no selection
  - copyToClipboard - writes to fallback clipboard memory
  - notifyCopyComplete - does not throw
  - ... and 79 more

### ensureOverlay
- **File**: \packages\canvas-component\src\symphonies\select\select.overlay.dom.stage-crew.ts
- **Plugin**: canvas-component
- **Test Files**: 2
- **Tests**:
  - canvas-component handlers handlers
  - serializeSelectedComponent - returns clipboardData when element present
  - serializeSelectedComponent - empty result when no selection
  - copyToClipboard - writes to fallback clipboard memory
  - notifyCopyComplete - does not throw
  - ... and 89 more

### getCanvasRect
- **File**: \packages\canvas-component\src\symphonies\select\select.overlay.dom.stage-crew.ts
- **Plugin**: canvas-component
- **Test Files**: 1
- **Tests**:
  - advanced selection/overlay handlers batch
  - getCanvasRect returns patched bounding client rect values
  - applyOverlayRectForEl uses inline style dimensions when present
  - createOverlayStructure creates advanced line overlay with handles a & b
  - resolveEndpoints returns endpoints from line segment in viewBox space
  - ... and 5 more

### applyOverlayRectForEl
- **File**: \packages\canvas-component\src\symphonies\select\select.overlay.dom.stage-crew.ts
- **Plugin**: canvas-component
- **Test Files**: 1
- **Tests**:
  - advanced selection/overlay handlers batch
  - getCanvasRect returns patched bounding client rect values
  - applyOverlayRectForEl uses inline style dimensions when present
  - createOverlayStructure creates advanced line overlay with handles a & b
  - resolveEndpoints returns endpoints from line segment in viewBox space
  - ... and 5 more

### createOverlayStructure
- **File**: \packages\canvas-component\src\symphonies\select\select.overlay.helpers.ts
- **Plugin**: canvas-component
- **Test Files**: 1
- **Tests**:
  - advanced selection/overlay handlers batch
  - getCanvasRect returns patched bounding client rect values
  - applyOverlayRectForEl uses inline style dimensions when present
  - createOverlayStructure creates advanced line overlay with handles a & b
  - resolveEndpoints returns endpoints from line segment in viewBox space
  - ... and 5 more

### resolveEndpoints
- **File**: \packages\canvas-component\src\symphonies\select\select.overlay.helpers.ts
- **Plugin**: canvas-component
- **Test Files**: 1
- **Tests**:
  - advanced selection/overlay handlers batch
  - getCanvasRect returns patched bounding client rect values
  - applyOverlayRectForEl uses inline style dimensions when present
  - createOverlayStructure creates advanced line overlay with handles a & b
  - resolveEndpoints returns endpoints from line segment in viewBox space
  - ... and 5 more

### ensureAdvancedLineOverlayFor
- **File**: \packages\canvas-component\src\symphonies\select\select.overlay.line-advanced.stage-crew.ts
- **Plugin**: canvas-component
- **Test Files**: 1
- **Tests**:
  - advanced selection/overlay handlers batch
  - getCanvasRect returns patched bounding client rect values
  - applyOverlayRectForEl uses inline style dimensions when present
  - createOverlayStructure creates advanced line overlay with handles a & b
  - resolveEndpoints returns endpoints from line segment in viewBox space
  - ... and 5 more

### attachAdvancedLineManipHandlers
- **File**: \packages\canvas-component\src\symphonies\select\select.overlay.line-advanced.stage-crew.ts
- **Plugin**: canvas-component
- **Test Files**: 1
- **Tests**:
  - advanced selection/overlay handlers batch
  - getCanvasRect returns patched bounding client rect values
  - applyOverlayRectForEl uses inline style dimensions when present
  - createOverlayStructure creates advanced line overlay with handles a & b
  - resolveEndpoints returns endpoints from line segment in viewBox space
  - ... and 5 more

### ensureLineOverlayFor
- **File**: \packages\canvas-component\src\symphonies\select\select.overlay.line-resize.stage-crew.ts
- **Plugin**: canvas-component
- **Test Files**: 1
- **Tests**:
  - line overlay + resize handlers
  - ensureLineOverlayFor creates overlay with endpoints positioned from CSS vars
  - attachLineResizeHandlers publishes start/move/end via EventRouter when conductor is provided
  - attachLineResizeHandlers falls back to CSS var updates when conductor is absent

### attachLineResizeHandlers
- **File**: \packages\canvas-component\src\symphonies\select\select.overlay.line-resize.stage-crew.ts
- **Plugin**: canvas-component
- **Test Files**: 1
- **Tests**:
  - line overlay + resize handlers
  - ensureLineOverlayFor creates overlay with endpoints positioned from CSS vars
  - attachLineResizeHandlers publishes start/move/end via EventRouter when conductor is provided
  - attachLineResizeHandlers falls back to CSS var updates when conductor is absent

### attachResizeHandlers
- **File**: \packages\canvas-component\src\symphonies\select\select.overlay.resize.stage-crew.ts
- **Plugin**: canvas-component
- **Test Files**: 1
- **Tests**:
  - advanced selection/overlay handlers batch
  - getCanvasRect returns patched bounding client rect values
  - applyOverlayRectForEl uses inline style dimensions when present
  - createOverlayStructure creates advanced line overlay with handles a & b
  - resolveEndpoints returns endpoints from line segment in viewBox space
  - ... and 5 more

### routeSelectionRequest
- **File**: \packages\canvas-component\src\symphonies\select\select.stage-crew.ts
- **Plugin**: canvas-component
- **Test Files**: 2
- **Tests**:
  - canvas-component public API beats
  - notifyUi (selection) routes to control panel selection.show via conductor.play
  - routeSelectionRequest forwards to canvas.component.select with _routed flag
  - updateAttribute applies update via rule engine and stores payload
  - createNode creates element under #rx-canvas and populates createdNode payload
  - ... and 7 more

### showSelectionOverlay
- **File**: \packages\canvas-component\src\symphonies\select\select.stage-crew.ts
- **Plugin**: canvas-component
- **Test Files**: 10
- **Tests**:
  - Container child overlay positioning issues (migrated)
  - positions overlay over child when child is clicked (absolute to canvas)
  - documents current overlay behavior for debugging
  - canvas-component drag: overlay visibility (migrated)
  - line component overlay is data-driven and uses standard resize when configured
  - ... and 16 more

### hideSelectionOverlay
- **File**: \packages\canvas-component\src\symphonies\select\select.stage-crew.ts
- **Plugin**: canvas-component
- **Test Files**: 1
- **Tests**:
  - canvas-component select.stage-crew handlers
  - routeSelectionRequest - executes without throwing
  - routeSelectionRequest - ignores missing id
  - hideSelectionOverlay - hides overlay
  - hideSelectionOverlay - safe when already hidden
  - ... and 2 more

### publishSelectionChanged
- **File**: \packages\canvas-component\src\symphonies\select\select.stage-crew.ts
- **Plugin**: canvas-component
- **Test Files**: 1
- **Tests**:
  - canvas-component select.stage-crew handlers
  - routeSelectionRequest - executes without throwing
  - routeSelectionRequest - ignores missing id
  - hideSelectionOverlay - hides overlay
  - hideSelectionOverlay - safe when already hidden
  - ... and 2 more

### showSvgNodeOverlay
- **File**: \packages\canvas-component\src\symphonies\select\select.svg-node.stage-crew.ts
- **Plugin**: canvas-component
- **Test Files**: 1
- **Tests**:
  - SVG sub-node selection overlay (TDD)

### updateAttribute
- **File**: \packages\canvas-component\src\symphonies\update\update.stage-crew.ts
- **Plugin**: canvas-component
- **Test Files**: 2
- **Tests**:
  - canvas-component public API beats
  - notifyUi (selection) routes to control panel selection.show via conductor.play
  - routeSelectionRequest forwards to canvas.component.select with _routed flag
  - updateAttribute applies update via rule engine and stores payload
  - createNode creates element under #rx-canvas and populates createdNode payload
  - ... and 84 more

### refreshControlPanel
- **File**: \packages\canvas-component\src\symphonies\update\update.stage-crew.ts
- **Plugin**: canvas-component
- **Test Files**: 1
- **Tests**:
  - SVG node update functionality
  - updates rect fill attribute correctly
  - updates circle radius attribute correctly
  - removes attribute when value is null or empty
  - rejects non-whitelisted attributes
  - ... and 3 more

### updateSvgNodeAttribute
- **File**: \packages\canvas-component\src\symphonies\update\update.svg-node.stage-crew.ts
- **Plugin**: canvas-component
- **Test Files**: 1
- **Tests**:
  - SVG node update functionality
  - updates rect fill attribute correctly
  - updates circle radius attribute correctly
  - removes attribute when value is null or empty
  - rejects non-whitelisted attributes
  - ... and 3 more

### setClipboardText
- **File**: \packages\canvas-component\src\symphonies\_clipboard.ts
- **Plugin**: canvas-component
- **Test Files**: 1
- **Tests**:
  - canvas-component handlers handlers
  - serializeSelectedComponent - returns clipboardData when element present
  - serializeSelectedComponent - empty result when no selection
  - copyToClipboard - writes to fallback clipboard memory
  - notifyCopyComplete - does not throw
  - ... and 79 more

### getClipboardText
- **File**: \packages\canvas-component\src\symphonies\_clipboard.ts
- **Plugin**: canvas-component
- **Test Files**: 1
- **Tests**:
  - canvas-component handlers handlers
  - serializeSelectedComponent - returns clipboardData when element present
  - serializeSelectedComponent - empty result when no selection
  - copyToClipboard - writes to fallback clipboard memory
  - notifyCopyComplete - does not throw
  - ... and 79 more

### initConductor
- **File**: \packages\canvas-component\src\temp-deps\conductor.ts
- **Plugin**: canvas-component
- **Test Files**: 1
- **Tests**:
  - advanced selection/overlay handlers batch
  - getCanvasRect returns patched bounding client rect values
  - applyOverlayRectForEl uses inline style dimensions when present
  - createOverlayStructure creates advanced line overlay with handles a & b
  - resolveEndpoints returns endpoints from line segment in viewBox space
  - ... and 5 more

### registerAllSequences
- **File**: \packages\canvas-component\src\temp-deps\conductor.ts
- **Plugin**: canvas-component
- **Test Files**: 1
- **Tests**:
  - advanced selection/overlay handlers batch
  - getCanvasRect returns patched bounding client rect values
  - applyOverlayRectForEl uses inline style dimensions when present
  - createOverlayStructure creates advanced line overlay with handles a & b
  - resolveEndpoints returns endpoints from line segment in viewBox space
  - ... and 5 more

### loadJsonSequenceCatalogs
- **File**: \packages\canvas-component\src\temp-deps\conductor.ts
- **Plugin**: canvas-component
- **Test Files**: 1
- **Tests**:
  - advanced selection/overlay handlers batch
  - getCanvasRect returns patched bounding client rect values
  - applyOverlayRectForEl uses inline style dimensions when present
  - createOverlayStructure creates advanced line overlay with handles a & b
  - resolveEndpoints returns endpoints from line segment in viewBox space
  - ... and 5 more

### setFlagOverride
- **File**: \packages\canvas-component\src\temp-deps\feature-flags.ts
- **Plugin**: canvas-component
- **Test Files**: 7
- **Tests**:
  - Advanced Line augmentation (Phase 1)
  - Advanced Line handlers — moveLineManip
  - updates endpoint A and recomputes line geometry
  - Advanced Line overlay attaches on selection (flag ON)
  - Advanced Line overlay drag — cumulative delta causes runaway (expected failing)
  - ... and 26 more

### clearFlagOverrides
- **File**: \packages\canvas-component\src\temp-deps\feature-flags.ts
- **Plugin**: canvas-component
- **Test Files**: 7
- **Tests**:
  - Advanced Line augmentation (Phase 1)
  - Advanced Line handlers — moveLineManip
  - updates endpoint A and recomputes line geometry
  - Advanced Line overlay attaches on selection (flag ON)
  - Advanced Line overlay drag — cumulative delta causes runaway (expected failing)
  - ... and 26 more

### getFlagOverride
- **File**: \packages\canvas-component\src\temp-deps\feature-flags.ts
- **Plugin**: canvas-component
- **Test Files**: 1
- **Tests**:
  - feature-flags getFlagOverride
  - rule-engine config getters/setters
  - sanitizeHtml
  - returns overridden values and undefined when not set
  - setAllRulesConfig then getAllRulesConfig returns same object
  - ... and 3 more

### isFlagEnabled
- **File**: \packages\canvas-component\src\temp-deps\feature-flags.ts
- **Plugin**: canvas-component
- **Test Files**: 1
- **Tests**:
  - Feature Flags
  - isFlagEnabled
  - getFlagMeta
  - getAllFlags
  - should return false for unknown flags
  - ... and 8 more

### setSelectionObserver
- **File**: \packages\canvas-component\src\temp-deps\observer.store.ts
- **Plugin**: canvas-component
- **Test Files**: 3
- **Tests**:
  - Control Panel bidirectional attribute editing
  - forwards content changes to Canvas component
  - forwards styling changes to Canvas component
  - forwards layout changes to Canvas component
  - Canvas component updates DOM when receiving attribute changes
  - ... and 7 more

### getSelectionObserver
- **File**: \packages\canvas-component\src\temp-deps\observer.store.ts
- **Plugin**: canvas-component
- **Test Files**: 1
- **Tests**:
  - observer.store idempotency
  - setters are idempotent and clearAll resets observers

### setClassesObserver
- **File**: \packages\canvas-component\src\temp-deps\observer.store.ts
- **Plugin**: canvas-component
- **Test Files**: 1
- **Tests**:
  - observer.store idempotency
  - setters are idempotent and clearAll resets observers

### getClassesObserver
- **File**: \packages\canvas-component\src\temp-deps\observer.store.ts
- **Plugin**: canvas-component
- **Test Files**: 1
- **Tests**:
  - observer.store idempotency
  - setters are idempotent and clearAll resets observers

### setCssRegistryObserver
- **File**: \packages\canvas-component\src\temp-deps\observer.store.ts
- **Plugin**: canvas-component
- **Test Files**: 1
- **Tests**:
  - observer.store idempotency
  - setters are idempotent and clearAll resets observers

### getCssRegistryObserver
- **File**: \packages\canvas-component\src\temp-deps\observer.store.ts
- **Plugin**: canvas-component
- **Test Files**: 1
- **Tests**:
  - observer.store idempotency
  - setters are idempotent and clearAll resets observers

### clearAllObservers
- **File**: \packages\canvas-component\src\temp-deps\observer.store.ts
- **Plugin**: canvas-component
- **Test Files**: 1
- **Tests**:
  - observer.store idempotency
  - setters are idempotent and clearAll resets observers

### sanitizeHtml
- **File**: \packages\canvas-component\src\temp-deps\sanitizeHtml.ts
- **Plugin**: canvas-component
- **Test Files**: 1
- **Tests**:
  - feature-flags getFlagOverride
  - rule-engine config getters/setters
  - sanitizeHtml
  - returns overridden values and undefined when not set
  - setAllRulesConfig then getAllRulesConfig returns same object
  - ... and 3 more

### addClass
- **File**: \packages\control-panel\src\symphonies\classes\classes.stage-crew.ts
- **Plugin**: control-panel
- **Test Files**: 2
- **Tests**:
  - control-panel: classes add/remove + notifyUi
  - addClass adds class and populates payload
  - removeClass removes class and populates payload
  - notifyUi publishes control.panel.classes.updated when payload present
  - control-panel handlers handlers
  - ... and 84 more

### removeClass
- **File**: \packages\control-panel\src\symphonies\classes\classes.stage-crew.ts
- **Plugin**: control-panel
- **Test Files**: 1
- **Tests**:
  - control-panel: classes add/remove + notifyUi
  - addClass adds class and populates payload
  - removeClass removes class and populates payload
  - notifyUi publishes control.panel.classes.updated when payload present

### createCssClass
- **File**: \packages\control-panel\src\symphonies\css-management\css-management.stage-crew.ts
- **Plugin**: control-panel
- **Test Files**: 1
- **Tests**:
  - CSS registry idempotency
  - createCssClass is idempotent: second create with same content is a success no-op
  - updateCssClass upserts when missing and no-ops when content unchanged

### updateCssClass
- **File**: \packages\control-panel\src\symphonies\css-management\css-management.stage-crew.ts
- **Plugin**: control-panel
- **Test Files**: 1
- **Tests**:
  - CSS registry idempotency
  - createCssClass is idempotent: second create with same content is a success no-op
  - updateCssClass upserts when missing and no-ops when content unchanged

### getCssClass
- **File**: \packages\control-panel\src\symphonies\css-management\css-management.stage-crew.ts
- **Plugin**: control-panel
- **Test Files**: 1
- **Tests**:
  - control-panel css-management retrieval/apply handlers (public API)
  - getCssClass returns built-in class definition (rx-button)
  - getCssClass sets error when class missing
  - listCssClasses returns built-in classes collection
  - applyCssClassToElement adds class to DOM element and sets payload success
  - ... and 3 more

### listCssClasses
- **File**: \packages\control-panel\src\symphonies\css-management\css-management.stage-crew.ts
- **Plugin**: control-panel
- **Test Files**: 1
- **Tests**:
  - control-panel css-management retrieval/apply handlers (public API)
  - getCssClass returns built-in class definition (rx-button)
  - getCssClass sets error when class missing
  - listCssClasses returns built-in classes collection
  - applyCssClassToElement adds class to DOM element and sets payload success
  - ... and 3 more

### applyCssClassToElement
- **File**: \packages\control-panel\src\symphonies\css-management\css-management.stage-crew.ts
- **Plugin**: control-panel
- **Test Files**: 1
- **Tests**:
  - control-panel css-management retrieval/apply handlers (public API)
  - getCssClass returns built-in class definition (rx-button)
  - getCssClass sets error when class missing
  - listCssClasses returns built-in classes collection
  - applyCssClassToElement adds class to DOM element and sets payload success
  - ... and 3 more

### removeCssClassFromElement
- **File**: \packages\control-panel\src\symphonies\css-management\css-management.stage-crew.ts
- **Plugin**: control-panel
- **Test Files**: 1
- **Tests**:
  - control-panel css-management retrieval/apply handlers (public API)
  - getCssClass returns built-in class definition (rx-button)
  - getCssClass sets error when class missing
  - listCssClasses returns built-in classes collection
  - applyCssClassToElement adds class to DOM element and sets payload success
  - ... and 3 more

### deriveSelectionModel
- **File**: \packages\control-panel\src\symphonies\selection\selection.stage-crew.ts
- **Plugin**: control-panel
- **Test Files**: 1
- **Tests**:
  - control-panel selection deriveSelectionModel handler (public API)
  - returns null selectionModel when id missing
  - returns null selectionModel when element not found
  - derives model for element with rx-button class
  - falls back to container type for plain div without rx- classes

### initConfig
- **File**: \packages\control-panel\src\symphonies\ui\ui.stage-crew.ts
- **Plugin**: control-panel
- **Test Files**: 1
- **Tests**:
  - Core Environment Config
  - initConfig
  - setConfigValue
  - removeConfigValue
  - getAllConfigKeys
  - ... and 21 more

### ControlPanel
- **File**: \packages\control-panel\src\ui\ControlPanel.tsx
- **Plugin**: control-panel
- **Test Files**: 1
- **Tests**:
  - @renderx-plugins/control-panel package exports
  - exports ControlPanel UI component
  - exports register() function (no-op allowed)
  - exports selection symphony handlers

### getCurrentTheme
- **File**: \packages\header\src\symphonies\ui\ui.stage-crew.ts
- **Plugin**: header
- **Test Files**: 1
- **Tests**:
  - ui.stage-crew handlers
  - getCurrentTheme applies DOM attribute and persists
  - getCurrentTheme respects existing DOM attribute first
  - toggleTheme flips and persists theme

### toggleTheme
- **File**: \packages\header\src\symphonies\ui\ui.stage-crew.ts
- **Plugin**: header
- **Test Files**: 1
- **Tests**:
  - ui.stage-crew handlers
  - getCurrentTheme applies DOM attribute and persists
  - getCurrentTheme respects existing DOM attribute first
  - toggleTheme flips and persists theme

### HeaderControls
- **File**: \packages\header\src\ui\HeaderControls.tsx
- **Plugin**: header
- **Test Files**: 1
- **Tests**:
  - header handlers handlers
  - HeaderControls - happy path
  - HeaderControls - edge case/error handling
  - HeaderThemeToggle - happy path
  - HeaderThemeToggle - edge case/error handling
  - ... and 2 more

### loadComponents
- **File**: \packages\library\src\symphonies\load.symphony.ts
- **Plugin**: library
- **Test Files**: 1
- **Tests**:
  - library handlers handlers
  - loadComponents - happy path
  - loadComponents - edge case/error handling
  - for - happy path
  - for - edge case/error handling
  - ... and 36 more

### loadChatHistory
- **File**: \packages\library\src\utils\chat.utils.ts
- **Plugin**: library
- **Test Files**: 1
- **Tests**:
  - Chat Utils
  - loadChatHistory
  - saveChatHistory
  - createChatSession
  - addMessagesToCurrentSession
  - ... and 28 more

### saveChatHistory
- **File**: \packages\library\src\utils\chat.utils.ts
- **Plugin**: library
- **Test Files**: 1
- **Tests**:
  - Chat Utils
  - loadChatHistory
  - saveChatHistory
  - createChatSession
  - addMessagesToCurrentSession
  - ... and 28 more

### createChatSession
- **File**: \packages\library\src\utils\chat.utils.ts
- **Plugin**: library
- **Test Files**: 1
- **Tests**:
  - Chat Utils
  - loadChatHistory
  - saveChatHistory
  - createChatSession
  - addMessagesToCurrentSession
  - ... and 28 more

### addMessagesToCurrentSession
- **File**: \packages\library\src\utils\chat.utils.ts
- **Plugin**: library
- **Test Files**: 1
- **Tests**:
  - Chat Utils
  - loadChatHistory
  - saveChatHistory
  - createChatSession
  - addMessagesToCurrentSession
  - ... and 28 more

### getCurrentChatSession
- **File**: \packages\library\src\utils\chat.utils.ts
- **Plugin**: library
- **Test Files**: 1
- **Tests**:
  - Chat Utils
  - loadChatHistory
  - saveChatHistory
  - createChatSession
  - addMessagesToCurrentSession
  - ... and 28 more

### deleteChatSession
- **File**: \packages\library\src\utils\chat.utils.ts
- **Plugin**: library
- **Test Files**: 1
- **Tests**:
  - Chat Utils
  - loadChatHistory
  - saveChatHistory
  - createChatSession
  - addMessagesToCurrentSession
  - ... and 28 more

### clearAllChatHistory
- **File**: \packages\library\src\utils\chat.utils.ts
- **Plugin**: library
- **Test Files**: 1
- **Tests**:
  - Chat Utils
  - loadChatHistory
  - saveChatHistory
  - createChatSession
  - addMessagesToCurrentSession
  - ... and 28 more

### getChatHistoryStats
- **File**: \packages\library\src\utils\chat.utils.ts
- **Plugin**: library
- **Test Files**: 1
- **Tests**:
  - Chat Utils
  - loadChatHistory
  - saveChatHistory
  - createChatSession
  - addMessagesToCurrentSession
  - ... and 28 more

### getConversationContext
- **File**: \packages\library\src\utils\chat.utils.ts
- **Plugin**: library
- **Test Files**: 1
- **Tests**:
  - Chat Utils
  - loadChatHistory
  - saveChatHistory
  - createChatSession
  - addMessagesToCurrentSession
  - ... and 28 more

### saveCustomComponent
- **File**: \packages\library\src\utils\storage.utils.ts
- **Plugin**: library
- **Test Files**: 1
- **Tests**:
  - storage.utils
  - saveCustomComponent
  - loadCustomComponents
  - removeCustomComponent
  - clearCustomComponents
  - ... and 17 more

### loadCustomComponents
- **File**: \packages\library\src\utils\storage.utils.ts
- **Plugin**: library
- **Test Files**: 3
- **Tests**:
  - library.handlers
  - loadComponents uses Host SDK inventory when available and assigns payload components
  - loadComponents merges custom components with inventory components
  - loadComponents works with only custom components when no inventory
  - loadComponents handles empty custom components
  - ... and 26 more

### removeCustomComponent
- **File**: \packages\library\src\utils\storage.utils.ts
- **Plugin**: library
- **Test Files**: 1
- **Tests**:
  - storage.utils
  - saveCustomComponent
  - loadCustomComponents
  - removeCustomComponent
  - clearCustomComponents
  - ... and 17 more

### clearCustomComponents
- **File**: \packages\library\src\utils\storage.utils.ts
- **Plugin**: library
- **Test Files**: 1
- **Tests**:
  - storage.utils
  - saveCustomComponent
  - loadCustomComponents
  - removeCustomComponent
  - clearCustomComponents
  - ... and 17 more

### getStorageInfo
- **File**: \packages\library\src\utils\storage.utils.ts
- **Plugin**: library
- **Test Files**: 1
- **Tests**:
  - storage.utils
  - saveCustomComponent
  - loadCustomComponents
  - removeCustomComponent
  - clearCustomComponents
  - ... and 17 more

### validateComponentJson
- **File**: \packages\library\src\utils\validation.utils.ts
- **Plugin**: library
- **Test Files**: 1
- **Tests**:
  - validation.utils
  - validateComponentJson
  - normalizeComponent
  - validateAndParseJson
  - validateFile
  - ... and 29 more

### normalizeComponent
- **File**: \packages\library\src\utils\validation.utils.ts
- **Plugin**: library
- **Test Files**: 1
- **Tests**:
  - validation.utils
  - validateComponentJson
  - normalizeComponent
  - validateAndParseJson
  - validateFile
  - ... and 29 more

### validateAndParseJson
- **File**: \packages\library\src\utils\validation.utils.ts
- **Plugin**: library
- **Test Files**: 1
- **Tests**:
  - validation.utils
  - validateComponentJson
  - normalizeComponent
  - validateAndParseJson
  - validateFile
  - ... and 29 more

### validateFile
- **File**: \packages\library\src\utils\validation.utils.ts
- **Plugin**: library
- **Test Files**: 1
- **Tests**:
  - validation.utils
  - validateComponentJson
  - normalizeComponent
  - validateAndParseJson
  - validateFile
  - ... and 29 more

### ensurePayload
- **File**: \packages\library-component\src\symphonies\drag\drag.preview.stage-crew.ts
- **Plugin**: library-component
- **Test Files**: 1
- **Tests**:
  - library-component handlers handlers
  - ensurePayload - happy path
  - ensurePayload - edge case/error handling
  - computeGhostSize - happy path
  - computeGhostSize - edge case/error handling
  - ... and 14 more

### fetchPropertyData
- **File**: \packages\real-estate-analyzer\src\index.ts
- **Plugin**: real-estate-analyzer
- **Test Files**: 1
- **Tests**:
  - real-estate-analyzer handlers handlers
  - fetchPropertyData - happy path
  - fetchPropertyData - edge case/error handling
  - analyze - happy path
  - analyze - edge case/error handling
  - ... and 6 more

## Handlers WITHOUT Test Coverage (76)

### CanvasHeader
- **File**: \packages\canvas\src\ui\CanvasHeader.tsx
- **Plugin**: canvas
- **Parameters**: none
- **Async**: No

### CanvasPage
- **File**: \packages\canvas\src\ui\CanvasPage.tsx
- **Plugin**: canvas
- **Parameters**: none
- **Async**: No

### notifyUi
- **File**: \packages\canvas-component\src\symphonies\create\create.notify.ts
- **Plugin**: canvas-component
- **Parameters**: data: any, ctx: any
- **Async**: No

### Name
- **File**: \packages\canvas-component\src\symphonies\create\create.react.stage-crew.ts
- **Plugin**: canvas-component
- **Parameters**: none
- **Async**: No

### setAllRulesConfig
- **File**: \packages\canvas-component\src\temp-deps\rule-engine.ts
- **Plugin**: canvas-component
- **Parameters**: cfg: AllRulesConfig
- **Async**: No

### loadAllRulesFromWindow
- **File**: \packages\canvas-component\src\temp-deps\rule-engine.ts
- **Plugin**: canvas-component
- **Parameters**: none
- **Async**: No

### getAllRulesConfig
- **File**: \packages\canvas-component\src\temp-deps\rule-engine.ts
- **Plugin**: canvas-component
- **Parameters**: none
- **Async**: No

### transform
- **File**: \packages\canvas-component\src\types\babel-standalone.d.ts
- **Plugin**: canvas-component
- **Parameters**: code: string, options?: {
      presets?: (string | unknown
- **Async**: No

### if
- **File**: \packages\control-panel\src\symphonies\classes\classes.symphony.ts
- **Plugin**: control-panel
- **Parameters**: id && updatedClasses
- **Async**: No

### catch
- **File**: \packages\control-panel\src\symphonies\classes\classes.symphony.ts
- **Plugin**: control-panel
- **Parameters**: e
- **Async**: No

### deleteCssClass
- **File**: \packages\control-panel\src\symphonies\css-management\css-management.stage-crew.ts
- **Plugin**: control-panel
- **Parameters**: data: any, ctx: any
- **Async**: No

### initMovement
- **File**: \packages\control-panel\src\symphonies\ui\ui.stage-crew.ts
- **Plugin**: control-panel
- **Parameters**: data: any, ctx: any
- **Async**: Yes

### initResolver
- **File**: \packages\control-panel\src\symphonies\ui\ui.stage-crew.ts
- **Plugin**: control-panel
- **Parameters**: data: any, ctx: any
- **Async**: No

### loadSchemas
- **File**: \packages\control-panel\src\symphonies\ui\ui.stage-crew.ts
- **Plugin**: control-panel
- **Parameters**: data: any, ctx: any
- **Async**: Yes

### registerObservers
- **File**: \packages\control-panel\src\symphonies\ui\ui.stage-crew.ts
- **Plugin**: control-panel
- **Parameters**: data: any, ctx: any
- **Async**: No

### notifyReady
- **File**: \packages\control-panel\src\symphonies\ui\ui.stage-crew.ts
- **Plugin**: control-panel
- **Parameters**: data: any, ctx: any
- **Async**: No

### generateFields
- **File**: \packages\control-panel\src\symphonies\ui\ui.stage-crew.ts
- **Plugin**: control-panel
- **Parameters**: data: any, ctx: any
- **Async**: No

### generateSections
- **File**: \packages\control-panel\src\symphonies\ui\ui.stage-crew.ts
- **Plugin**: control-panel
- **Parameters**: data: any, ctx: any
- **Async**: No

### renderView
- **File**: \packages\control-panel\src\symphonies\ui\ui.stage-crew.ts
- **Plugin**: control-panel
- **Parameters**: data: any, ctx: any
- **Async**: No

### prepareField
- **File**: \packages\control-panel\src\symphonies\ui\ui.stage-crew.ts
- **Plugin**: control-panel
- **Parameters**: data: any, ctx: any
- **Async**: No

### dispatchField
- **File**: \packages\control-panel\src\symphonies\ui\ui.stage-crew.ts
- **Plugin**: control-panel
- **Parameters**: data: any, ctx: any
- **Async**: No

### setDirty
- **File**: \packages\control-panel\src\symphonies\ui\ui.stage-crew.ts
- **Plugin**: control-panel
- **Parameters**: data: any, ctx: any
- **Async**: No

### awaitRefresh
- **File**: \packages\control-panel\src\symphonies\ui\ui.stage-crew.ts
- **Plugin**: control-panel
- **Parameters**: data: any, ctx: any
- **Async**: No

### validateField
- **File**: \packages\control-panel\src\symphonies\ui\ui.stage-crew.ts
- **Plugin**: control-panel
- **Parameters**: data: any, ctx: any
- **Async**: No

### mergeErrors
- **File**: \packages\control-panel\src\symphonies\ui\ui.stage-crew.ts
- **Plugin**: control-panel
- **Parameters**: data: any, ctx: any
- **Async**: No

### updateView
- **File**: \packages\control-panel\src\symphonies\ui\ui.stage-crew.ts
- **Plugin**: control-panel
- **Parameters**: data: any, ctx: any
- **Async**: No

### toggleSection
- **File**: \packages\control-panel\src\symphonies\ui\ui.stage-crew.ts
- **Plugin**: control-panel
- **Parameters**: data: any, ctx: any
- **Async**: No

### updateFromElement
- **File**: \packages\control-panel\src\symphonies\update\update.stage-crew.ts
- **Plugin**: control-panel
- **Parameters**: data: any, ctx: any
- **Async**: No

### registerFieldRenderer
- **File**: \packages\control-panel\src\components\field-renderers\index.ts
- **Plugin**: control-panel
- **Parameters**: type: string, component: FieldRenderer
- **Async**: No

### getFieldRenderer
- **File**: \packages\control-panel\src\components\field-renderers\index.ts
- **Plugin**: control-panel
- **Parameters**: type: string
- **Async**: No

### EmptyState
- **File**: \packages\control-panel\src\components\layout\EmptyState.tsx
- **Plugin**: control-panel
- **Parameters**: none
- **Async**: No

### LoadingState
- **File**: \packages\control-panel\src\components\layout\LoadingState.tsx
- **Plugin**: control-panel
- **Parameters**: none
- **Async**: No

### PanelHeader
- **File**: \packages\control-panel\src\components\layout\PanelHeader.tsx
- **Plugin**: control-panel
- **Parameters**: { selectedElement }: { selectedElement: SelectedElement | null }
- **Async**: No

### useControlPanelActions
- **File**: \packages\control-panel\src\hooks\useControlPanelActions.ts
- **Plugin**: control-panel
- **Parameters**: selectedElement: SelectedElement | null, dispatch: React.Dispatch<ControlPanelAction>
- **Async**: No

### useControlPanelSequences
- **File**: \packages\control-panel\src\hooks\useControlPanelSequences.ts
- **Plugin**: control-panel
- **Parameters**: none
- **Async**: No

### useControlPanelState
- **File**: \packages\control-panel\src\hooks\useControlPanelState.ts
- **Plugin**: control-panel
- **Parameters**: none
- **Async**: No

### useSchemaResolver
- **File**: \packages\control-panel\src\hooks\useSchemaResolver.ts
- **Plugin**: control-panel
- **Parameters**: none
- **Async**: No

### controlPanelReducer
- **File**: \packages\control-panel\src\state\control-panel.reducer.ts
- **Plugin**: control-panel
- **Parameters**: state: ControlPanelState, action: ControlPanelAction
- **Async**: No

### extractElementContent
- **File**: \packages\control-panel\src\utils\content-extractor.ts
- **Plugin**: control-panel
- **Parameters**: element: HTMLElement, type?: string
- **Async**: No

### getNestedValue
- **File**: \packages\control-panel\src\utils\field.utils.ts
- **Plugin**: control-panel
- **Parameters**: obj: any, path: string
- **Async**: No

### setNestedValue
- **File**: \packages\control-panel\src\utils\field.utils.ts
- **Plugin**: control-panel
- **Parameters**: obj: any, path: string, value: any
- **Async**: No

### formatLabel
- **File**: \packages\control-panel\src\utils\field.utils.ts
- **Plugin**: control-panel
- **Parameters**: key: string
- **Async**: No

### generatePlaceholder
- **File**: \packages\control-panel\src\utils\field.utils.ts
- **Plugin**: control-panel
- **Parameters**: key: string, type: string
- **Async**: No

### HeaderThemeToggle
- **File**: \packages\header\src\ui\HeaderThemeToggle.tsx
- **Plugin**: header
- **Parameters**: none
- **Async**: No

### HeaderTitle
- **File**: \packages\header\src\ui\HeaderTitle.tsx
- **Plugin**: header
- **Parameters**: none
- **Async**: No

### for
- **File**: \packages\library\src\symphonies\load.symphony.ts
- **Plugin**: library
- **Parameters**: const f of files
- **Async**: No

### RAGEnrichmentService.if
- **File**: \packages\library\src\services\rag-enrichment.service.ts
- **Plugin**: library
- **Parameters**: !libraryComponents || libraryComponents.length === 0
- **Async**: No

### ComponentBehaviorExtractor.for
- **File**: \packages\library\src\telemetry\component-behavior-extractor.ts
- **Plugin**: library
- **Parameters**: const mapping of mappings
- **Async**: No

### ComponentBehaviorExtractor.if
- **File**: \packages\library\src\telemetry\component-behavior-extractor.ts
- **Plugin**: library
- **Parameters**: m
- **Async**: No

### ChatMessageComponent
- **File**: \packages\library\src\ui\ChatMessage.tsx
- **Plugin**: library
- **Parameters**: { 
  message, onAddToLibrary, onEditComponent, onCopyJSON, onRegenerateComponent 
}: ChatMessageProps
- **Async**: No

### ChatWindow
- **File**: \packages\library\src\ui\ChatWindow.tsx
- **Plugin**: library
- **Parameters**: { isOpen, onClose, onComponentGenerated }: ChatWindowProps
- **Async**: No

### ConfigStatusUI
- **File**: \packages\library\src\ui\ConfigStatusUI.tsx
- **Plugin**: library
- **Parameters**: { status }: ConfigStatusUIProps
- **Async**: No

### CustomComponentList
- **File**: \packages\library\src\ui\CustomComponentList.tsx
- **Plugin**: library
- **Parameters**: { components, onComponentRemoved, onRemove }: CustomComponentListProps
- **Async**: No

### CustomComponentUpload
- **File**: \packages\library\src\ui\CustomComponentUpload.tsx
- **Plugin**: library
- **Parameters**: { onUpload, onComponentAdded }: CustomComponentUploadProps
- **Async**: No

### registerCssForComponents
- **File**: \packages\library\src\ui\LibraryPanel.tsx
- **Plugin**: library
- **Parameters**: items: any[], _conductor: any
- **Async**: Yes

### LibraryPanel
- **File**: \packages\library\src\ui\LibraryPanel.tsx
- **Plugin**: library
- **Parameters**: none
- **Async**: No

### LibraryPreview
- **File**: \packages\library\src\ui\LibraryPreview.tsx
- **Plugin**: library
- **Parameters**: {
  component, conductor, }: {
  component: any;
  conductor: any;
}
- **Async**: No

### computePreviewModel
- **File**: \packages\library\src\ui\preview.model.ts
- **Plugin**: library
- **Parameters**: component: any
- **Async**: No

### startNewChatSession
- **File**: \packages\library\src\utils\chat.utils.ts
- **Plugin**: library
- **Parameters**: none
- **Async**: No

### exportChatHistory
- **File**: \packages\library\src\utils\chat.utils.ts
- **Plugin**: library
- **Parameters**: none
- **Async**: No

### importChatHistory
- **File**: \packages\library\src\utils\chat.utils.ts
- **Plugin**: library
- **Parameters**: jsonData: string
- **Async**: No

### cleanupChatHistory
- **File**: \packages\library\src\utils\chat.utils.ts
- **Plugin**: library
- **Parameters**: maxSessions: number = MAX_HISTORY_SESSIONS
- **Async**: No

### buildSystemPrompt
- **File**: \packages\library\src\utils\prompt.templates.ts
- **Plugin**: library
- **Parameters**: context?: PromptContext
- **Async**: No

### getPromptTemplate
- **File**: \packages\library\src\utils\prompt.templates.ts
- **Plugin**: library
- **Parameters**: id: string
- **Async**: No

### computeGhostSize
- **File**: \packages\library-component\src\symphonies\drag\drag.preview.stage-crew.ts
- **Plugin**: library-component
- **Parameters**: e: any, component: any
- **Async**: No

### createGhostContainer
- **File**: \packages\library-component\src\symphonies\drag\drag.preview.stage-crew.ts
- **Plugin**: library-component
- **Parameters**: width: number, height: number
- **Async**: No

### renderTemplatePreview
- **File**: \packages\library-component\src\symphonies\drag\drag.preview.stage-crew.ts
- **Plugin**: library-component
- **Parameters**: ghost: HTMLElement, template: any, width: number, height: number
- **Async**: No

### applyTemplateStyles
- **File**: \packages\library-component\src\symphonies\drag\drag.preview.stage-crew.ts
- **Plugin**: library-component
- **Parameters**: ghost: HTMLElement, template: any
- **Async**: No

### computeCursorOffsets
- **File**: \packages\library-component\src\symphonies\drag\drag.preview.stage-crew.ts
- **Plugin**: library-component
- **Parameters**: e: any, targetEl: HTMLElement | null, width: number, height: number
- **Async**: No

### installDragImage
- **File**: \packages\library-component\src\symphonies\drag\drag.preview.stage-crew.ts
- **Plugin**: library-component
- **Parameters**: dt: DataTransfer, ghost: HTMLElement, offsetX: number, offsetY: number
- **Async**: No

### onDragStart
- **File**: \packages\library-component\src\symphonies\drag.symphony.ts
- **Plugin**: library-component
- **Parameters**: data: any
- **Async**: No

### publishCreateRequested
- **File**: \packages\library-component\src\symphonies\drop.container.symphony.ts
- **Plugin**: library-component
- **Parameters**: data: any, ctx: any
- **Async**: Yes

### analyze
- **File**: \packages\real-estate-analyzer\src\index.ts
- **Plugin**: real-estate-analyzer
- **Parameters**: _data: Record<string, never>, ctx: SequenceContext
- **Async**: Yes

### format
- **File**: \packages\real-estate-analyzer\src\index.ts
- **Plugin**: real-estate-analyzer
- **Parameters**: _data: Record<string, never>, ctx: SequenceContext
- **Async**: Yes

### ZillowService.if
- **File**: \packages\real-estate-analyzer\src\services\zillow.service.ts
- **Plugin**: real-estate-analyzer
- **Parameters**: !ZILLOW_API_KEY
- **Async**: No

### OpportunityAnalyzer
- **File**: \packages\real-estate-analyzer\src\ui\OpportunityAnalyzer.tsx
- **Plugin**: real-estate-analyzer
- **Parameters**: none
- **Async**: No

