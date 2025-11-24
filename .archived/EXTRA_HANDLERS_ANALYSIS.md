# Extra Handlers Analysis

## Overview
The audit identified **135 "Extra Handlers"** - functions/components found in the codebase but NOT listed in the plugin manifests/catalogs. These are NOT missing tests; they're **internal implementation details** that shouldn't be in the catalog.

## Key Finding: These Are NOT Test Gaps

The "extra handlers" are **intentionally excluded** from the catalog because they are:

1. **Internal Utilities** - Helper functions used within symphonies
2. **React Components** - UI components (not orchestration handlers)
3. **Stage-Crew Functions** - DOM manipulation helpers
4. **Test Utilities** - Functions only used in tests

## Distribution by Plugin

| Plugin | Count | Examples |
|--------|-------|----------|
| **canvas-component** | ~70 | `recomputeLineSvg`, `getCanvasOrThrow`, `attachSelection`, `ensureOverlay` |
| **canvas** | 4 | `register`, `onDropForTest`, `CanvasHeader`, `CanvasPage` |
| **control-panel** | ~30 | `getCssClass`, `EmptyState`, `useControlPanelState`, `ControlPanel` |
| **header** | 3 | `HeaderControls`, `HeaderThemeToggle`, `HeaderTitle` |
| **library** | ~20 | `ChatMessageComponent`, `loadChatHistory`, `buildSystemPrompt` |
| **library-component** | ~8 | `ensurePayload`, `computeGhostSize`, `renderTemplatePreview` |
| **real-estate-analyzer** | 2 | `ZillowService.if`, `OpportunityAnalyzer` |

## Categories

### 1. **Helper/Utility Functions** (40%)
- `getCanvasOrThrow`, `createElementWithId`, `getClipboardText`
- `getNestedValue`, `formatLabel`, `getFieldRenderer`
- **Purpose**: Support internal symphony logic
- **Status**: ✅ Correctly excluded from catalog

### 2. **DOM/Style Manipulation** (25%)
- `recomputeLineSvg`, `applyClasses`, `computeInlineStyle`
- `ensureOverlay`, `applyOverlayRectForEl`, `computeCssVarBlock`
- **Purpose**: Direct DOM operations
- **Status**: ✅ Correctly excluded (stage-crew functions)

### 3. **React Components** (20%)
- `CanvasHeader`, `CanvasPage`, `ControlPanel`, `ChatMessageComponent`
- `HeaderControls`, `LibraryPanel`, `OpportunityAnalyzer`
- **Purpose**: UI rendering
- **Status**: ✅ Correctly excluded (not orchestration)

### 4. **Event/Interaction Handlers** (10%)
- `attachSelection`, `attachDrag`, `attachSvgNodeClick`
- `attachLineResizeHandlers`, `attachAdvancedLineManipHandlers`
- **Purpose**: Attach DOM event listeners
- **Status**: ✅ Correctly excluded (internal to symphonies)

### 5. **Internal/Temporary** (5%)
- `register`, `onDropForTest`, `initConductor`, `sanitizeHtml`
- **Purpose**: Setup, testing, or temporary dependencies
- **Status**: ✅ Correctly excluded

## Conclusion

**The 135 "extra handlers" are NOT a problem.** They represent:
- ✅ Proper separation of concerns (internal vs. catalog)
- ✅ Clean architecture (stage-crew functions isolated)
- ✅ Correct manifest design (only public orchestration handlers listed)

## Real Test Coverage Issue

The **62% coverage** gap is NOT about extra handlers. It's about:
- **85 handlers WITHOUT tests** (the real problem)
- These are handlers that SHOULD be tested but aren't
- Focus should be on implementing tests for these 85 handlers

## Recommendation

**Do NOT add extra handlers to the catalog.** Instead:
1. Focus on the 85 handlers without tests
2. Use the proposed-tests.json to guide test implementation
3. Keep internal utilities out of the manifest (current design is correct)

