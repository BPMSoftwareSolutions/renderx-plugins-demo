# RenderX Web - Beat to Test Mapping Index

## Document Overview

This index provides **bidirectional traceability** between:
- **Beats** (in renderx-web-orchestration.json and .feature)
- **Gherkin Scenarios** (acceptance criteria)
- **Test Files** (concrete test implementations)

This enables:
- ✅ Coverage validation (every beat has a test)
- ✅ Regression detection (changes to handlers show which tests might fail)
- ✅ Documentation generation (test files serve as living documentation)
- ✅ Rapid failure diagnosis (beat failure → test file → handler)

---

## Movement 1: Initialization Symphony (6 beats)

### Beat 1.1: resolve-theme
**Handler:** `header/ui#getCurrentTheme`
**Event:** `renderx-web:initialization:theme-resolved`
**Gherkin Scenario:** "System resolves current theme on initialization"

| Aspect | Details |
|--------|---------|
| **Test File** | `packages/header/__tests__/handlers.handlers.spec.ts` |
| **Test Case** | "retrieving stored theme preference should cache value and emit event" |
| **Lines** | ~45-65 |
| **Coverage** | Theme retrieval, caching, event emission |
| **Setup** | localStorage mock with theme value |
| **Assertions** | Theme cached, event published, correct value |

**Related Files:**
- Handler: `packages/header/src/handlers.ts`
- Implementation: `header/ui#getCurrentTheme`

---

### Beat 1.2: apply-theme
**Handler:** `header/ui#toggleTheme`
**Event:** `renderx-web:initialization:theme-applied`
**Gherkin Scenario:** "System applies resolved theme to UI"

| Aspect | Details |
|--------|---------|
| **Test File** | `packages/header/__tests__/handlers.handlers.spec.ts` |
| **Test Case** | "applying theme should update DOM and publish event" |
| **Lines** | ~66-90 |
| **Coverage** | DOM CSS property update, event emission |
| **Setup** | Document mock with getComputedStyle, theme value |
| **Assertions** | CSS properties set, event published, DOM updated |

**Related Files:**
- Handler: `packages/header/src/handlers.ts`
- Implementation: `header/ui#toggleTheme`

---

### Beat 1.3: init-control-panel
**Handler:** `control-panel/ui#initConfig`
**Event:** `renderx-web:initialization:control-panel-ready`
**Gherkin Scenario:** "Control panel is initialized with default configuration"

| Aspect | Details |
|--------|---------|
| **Test File** | `packages/control-panel/__tests__/css-registry.store.test.ts` |
| **Test Case** | "initializing control panel should create schema resolver and registry" |
| **Lines** | ~1-50 |
| **Coverage** | CSS registry creation, schema resolver initialization |
| **Setup** | Mock store, empty registry |
| **Assertions** | Registry created, resolver ready, event emitted |

**Related Files:**
- Handler: `packages/control-panel/src/state/css-registry.store.ts`
- Implementation: `control-panel/ui#initConfig`

---

### Beat 1.4: init-resolver
**Handler:** `control-panel/ui#initResolver`
**Event:** `renderx-web:initialization:resolver-ready`
**Gherkin Scenario:** "Schema resolver is initialized for schema resolution"

| Aspect | Details |
|--------|---------|
| **Test File** | `packages/control-panel/__tests__/schema-resolver.memo.spec.ts` |
| **Test Case** | "initializing resolver should create cache and register event listener" |
| **Lines** | ~12-40 |
| **Coverage** | Resolver instance creation, caching, event registration |
| **Setup** | Mock event bus, schema definition |
| **Assertions** | Resolver created, cache initialized, listeners registered |

**Related Files:**
- Handler: `packages/control-panel/src/state/schema-resolver.ts`
- Implementation: `control-panel/ui#initResolver`

---

### Beat 1.5: register-observers
**Handler:** `control-panel/ui#registerObservers`
**Event:** `renderx-web:initialization:observers-registered`
**Gherkin Scenario:** "UI observer pattern is established for state synchronization"

| Aspect | Details |
|--------|---------|
| **Test File** | `packages/control-panel/__tests__/observer.store.spec.ts` |
| **Test Case** | "registering observers should attach all listeners and enable bidirectional sync" |
| **Lines** | ~5-35 |
| **Coverage** | Observer registration, state synchronization setup |
| **Setup** | Mock event bus, observer registry |
| **Assertions** | All observers attached, sync enabled, event published |

**Related Files:**
- Handler: `packages/control-panel/src/state/observer.store.ts`
- Implementation: `control-panel/ui#registerObservers`

---

### Beat 1.6: notify-ready
**Handler:** `control-panel/ui#notifyReady`
**Event:** `renderx-web:initialization:complete`
**Gherkin Scenario:** "Application signals that initialization is complete"

| Aspect | Details |
|--------|---------|
| **Test File** | `packages/control-panel/__tests__/ui-init.batched.spec.ts` |
| **Test Case** | "notifying ready should emit completion event and enable downstream movements" |
| **Lines** | ~50-80 |
| **Coverage** | Completion event emission, downstream enablement |
| **Setup** | All beats 1.1-1.5 mocked as complete |
| **Assertions** | Event emitted, timestamp recorded, next movement enabled |

**Related Files:**
- Handler: `packages/control-panel/src/handlers.ts`
- Implementation: `control-panel/ui#notifyReady`

---

## Movement 2: Build Symphony (2 beats)

### Beat 2.1: update-attribute
**Handler:** `canvas-component/update#updateAttribute`
**Event:** `renderx-web:build:attribute-updated`
**Gherkin Scenario:** "Component attribute is updated in control panel"

| Aspect | Details |
|--------|---------|
| **Test File** | `packages/control-panel/__tests__/attribute-editing.integration.spec.ts` |
| **Test Case** | "updating attribute should sync control panel and emit change event" |
| **Lines** | ~60-95 |
| **Coverage** | Attribute update, control panel sync, event emission |
| **Setup** | Canvas component with attributes, mock control panel |
| **Assertions** | Attribute updated, control panel synchronized, event published |

**Related Files:**
- Handler: `packages/canvas-component/src/update.ts`
- Implementation: `canvas-component/update#updateAttribute`

---

### Beat 2.2: refresh-control-panel
**Handler:** `canvas-component/update#refreshControlPanel`
**Event:** `renderx-web:build:complete`
**Gherkin Scenario:** "Control panel is refreshed after pre-build validation"

| Aspect | Details |
|--------|---------|
| **Test File** | `packages/control-panel/__tests__/api.control-panel.state.update.refresh.spec.ts` |
| **Test Case** | "refreshing control panel should trigger re-render and update registry" |
| **Lines** | ~15-50 |
| **Coverage** | Control panel re-render, registry update, build readiness |
| **Setup** | Updated attribute state, mock DOM |
| **Assertions** | Control panel re-rendered, registry updated, event published |

**Related Files:**
- Handler: `packages/control-panel/src/api.ts`
- Implementation: `canvas-component/update#refreshControlPanel`

---

## Movement 3: Test & Validation Symphony (5 beats)

### Beat 3.1: show-selection-overlay
**Handler:** `canvas-component/select#showSelectionOverlay`
**Event:** `renderx-web:test:selection-overlay-shown`
**Gherkin Scenario:** "Selection overlay is displayed on canvas component selection"

| Aspect | Details |
|--------|---------|
| **Test File** | `packages/canvas-component/__tests__/selection.overlay.line.handlers.spec.ts` |
| **Test Case** | "showing selection overlay should display and emit selection event" |
| **Lines** | ~20-55 |
| **Coverage** | Overlay creation, positioning, event emission |
| **Setup** | Canvas component, mock SVG element |
| **Assertions** | Overlay created, dimensions match, event emitted |

**Related Files:**
- Handler: `packages/canvas-component/src/select/overlay.ts`
- Implementation: `canvas-component/select#showSelectionOverlay`

---

### Beat 3.2: hide-selection-overlay
**Handler:** `canvas-component/select#hideSelectionOverlay`
**Event:** `renderx-web:test:selection-overlay-hidden`
**Gherkin Scenario:** "Selection overlay is hidden on deselection"

| Aspect | Details |
|--------|---------|
| **Test File** | `packages/canvas-component/__tests__/deselect.stage-crew.handlers.spec.ts` |
| **Test Case** | "hiding selection overlay should deselect and emit deselection event" |
| **Lines** | ~30-65 |
| **Coverage** | Overlay removal, deselection, event emission |
| **Setup** | Visible overlay on component |
| **Assertions** | Overlay removed, deselection event emitted, component cleaned |

**Related Files:**
- Handler: `packages/canvas-component/src/select/overlay.ts`
- Implementation: `canvas-component/select#hideSelectionOverlay`

---

### Beat 3.3: attach-line-resize
**Handler:** `canvas-component/select.overlay.line-resize#attachLineResizeHandlers`
**Event:** `renderx-web:test:line-resize-attached`
**Gherkin Scenario:** "Line component resize handlers are attached to overlay"

| Aspect | Details |
|--------|---------|
| **Test File** | `packages/canvas-component/__tests__/resize.overlay-tools-config.spec.ts` |
| **Test Case** | "attaching line resize handlers should enable drag preview and constrain dimensions" |
| **Lines** | ~40-85 |
| **Coverage** | Handler attachment, drag listeners, dimension constraints |
| **Setup** | Line component, overlay element |
| **Assertions** | Handlers attached, listeners registered, event emitted |

**Related Files:**
- Handler: `packages/canvas-component/src/select/overlay.line-resize.ts`
- Implementation: `canvas-component/select.overlay.line-resize#attachLineResizeHandlers`

---

### Beat 3.4: ensure-line-overlay
**Handler:** `canvas-component/select.overlay.line-resize#ensureLineOverlayFor`
**Event:** `renderx-web:test:line-overlay-ensured`
**Gherkin Scenario:** "Line component overlay is ensured to exist and be properly configured"

| Aspect | Details |
|--------|---------|
| **Test File** | `packages/canvas-component/__tests__/advanced-line.overlay.attach.spec.ts` |
| **Test Case** | "ensuring line overlay should create overlay with correct positioning" |
| **Lines** | ~25-60 |
| **Coverage** | Overlay existence check, positioning calculation, configuration |
| **Setup** | Line element, parent container |
| **Assertions** | Overlay exists, positioned correctly, event published |

**Related Files:**
- Handler: `packages/canvas-component/src/select/overlay.line-resize.ts`
- Implementation: `canvas-component/select.overlay.line-resize#ensureLineOverlayFor`

---

### Beat 3.5: notify-ui
**Handler:** `canvas-component/select#notifyUi`
**Event:** `renderx-web:test:complete`
**Gherkin Scenario:** "UI components are notified of selection state changes"

| Aspect | Details |
|--------|---------|
| **Test File** | `packages/control-panel/__tests__/selection.sequence-model-and-notify.spec.ts` |
| **Test Case** | "notifying UI should update control panel and trigger context-aware toolbar" |
| **Lines** | ~35-70 |
| **Coverage** | UI notification, control panel update, context propagation |
| **Setup** | Selected component state, mock toolbar |
| **Assertions** | Notifications sent, control panel updated, toolbar context set |

**Related Files:**
- Handler: `packages/canvas-component/src/select/notify.ts`
- Implementation: `canvas-component/select#notifyUi`

---

## Movement 4: Delivery Symphony (2 beats)

### Beat 4.1: export-gif
**Handler:** `canvas-component/export.export.gif#exportSvgToGif`
**Event:** `renderx-web:delivery:gif-exported`
**Gherkin Scenario:** "Canvas composition is exported to GIF format"

| Aspect | Details |
|--------|---------|
| **Test File** | `packages/canvas-component/__tests__/export.gif.handler.spec.ts` |
| **Test Case** | "exporting canvas to GIF should create animated file in output directory" |
| **Lines** | ~15-50 |
| **Coverage** | SVG to GIF conversion, file writing, event emission |
| **Setup** | Canvas SVG, mock file system |
| **Assertions** | GIF file created, in output dir, event published |

**Related Files:**
- Handler: `packages/canvas-component/src/export/gif.ts`
- Implementation: `canvas-component/export.export.gif#exportSvgToGif`

---

### Beat 4.2: export-mp4
**Handler:** `canvas-component/export.export.mp4#exportSvgToMp4`
**Event:** `renderx-web:delivery:complete`
**Gherkin Scenario:** "Canvas composition is exported to MP4 video format"

| Aspect | Details |
|--------|---------|
| **Test File** | `packages/canvas-component/__tests__/export.integration.dom-scan.spec.ts` |
| **Test Case** | "exporting canvas to MP4 should create video file with correct codec" |
| **Lines** | ~20-60 |
| **Coverage** | SVG to MP4 conversion, codec verification, metadata writing |
| **Setup** | Canvas SVG, mock file system, codec validation |
| **Assertions** | MP4 file created, codec correct, metadata stored, event published |

**Related Files:**
- Handler: `packages/canvas-component/src/export/mp4.ts`
- Implementation: `canvas-component/export.export.mp4#exportSvgToMp4`

---

## Movement 5: Telemetry & Monitoring Symphony (7 beats)

### Beat 5.1: ensure-payload
**Handler:** `library-component/drag.preview#ensurePayload`
**Event:** `renderx-web:telemetry:payload-ensured`
**Gherkin Scenario:** "Drag operation payload is created and validated"

| Aspect | Details |
|--------|---------|
| **Test File** | `packages/library-component/__tests__/handlers.drag.nodragimage.spec.ts` |
| **Test Case** | "ensuring drag payload should create and validate metadata object" |
| **Lines** | ~25-55 |
| **Coverage** | Payload creation, validation, caching |
| **Setup** | Component with metadata, mock schema validator |
| **Assertions** | Payload created, validated, cached, event emitted |

**Related Files:**
- Handler: `packages/library-component/src/drag-preview.ts`
- Implementation: `library-component/drag.preview#ensurePayload`

---

### Beat 5.2: compute-ghost-size
**Handler:** `library-component/drag.preview#computeGhostSize`
**Event:** `renderx-web:telemetry:ghost-size-computed`
**Gherkin Scenario:** "Ghost element size is computed for drag preview"

| Aspect | Details |
|--------|---------|
| **Test File** | `packages/library-component/__tests__/register.spec.ts` |
| **Test Case** | "computing ghost size should calculate dimensions with transforms" |
| **Lines** | ~40-75 |
| **Coverage** | Size calculation, transform handling, caching |
| **Setup** | Source component with transforms |
| **Assertions** | Size computed, transforms applied, cached, event emitted |

**Related Files:**
- Handler: `packages/library-component/src/drag-preview.ts`
- Implementation: `library-component/drag.preview#computeGhostSize`

---

### Beat 5.3: create-ghost-container
**Handler:** `library-component/drag.preview#createGhostContainer`
**Event:** `renderx-web:telemetry:ghost-container-created`
**Gherkin Scenario:** "Ghost container DOM element is created for drag preview"

| Aspect | Details |
|--------|---------|
| **Test File** | `packages/library/__tests__/handlers.loadComponents.spec.ts` |
| **Test Case** | "creating ghost container should initialize off-screen element" |
| **Lines** | ~30-65 |
| **Coverage** | DOM element creation, positioning, z-index setting |
| **Setup** | Mock document, computed ghost size |
| **Assertions** | Container created, off-screen, z-index set, event emitted |

**Related Files:**
- Handler: `packages/library-component/src/drag-preview.ts`
- Implementation: `library-component/drag.preview#createGhostContainer`

---

### Beat 5.4: render-template-preview
**Handler:** `library-component/drag.preview#renderTemplatePreview`
**Event:** `renderx-web:telemetry:template-preview-rendered`
**Gherkin Scenario:** "Template content is rendered into ghost preview"

| Aspect | Details |
|--------|---------|
| **Test File** | `packages/library-component/__tests__/handlers.handlers.spec.ts` |
| **Test Case** | "rendering template preview should clone and style content" |
| **Lines** | ~45-85 |
| **Coverage** | Template cloning, DOM insertion, rendering |
| **Setup** | Source component, ghost container |
| **Assertions** | Template cloned, inserted, rendered, event emitted |

**Related Files:**
- Handler: `packages/library-component/src/drag-preview.ts`
- Implementation: `library-component/drag.preview#renderTemplatePreview`

---

### Beat 5.5: apply-template-styles
**Handler:** `library-component/drag.preview#applyTemplateStyles`
**Event:** `renderx-web:telemetry:template-styles-applied`
**Gherkin Scenario:** "Styles are applied to maintain visual consistency in ghost preview"

| Aspect | Details |
|--------|---------|
| **Test File** | `packages/canvas-component/__tests__/export.css.debug.spec.ts` |
| **Test Case** | "applying template styles should sync CSS from source" |
| **Lines** | ~50-90 |
| **Coverage** | Style extraction, application, opacity/shadow adjustment |
| **Setup** | Rendered template, source component |
| **Assertions** | Styles extracted, applied, adjusted, event emitted |

**Related Files:**
- Handler: `packages/library-component/src/drag-preview.ts`
- Implementation: `library-component/drag.preview#applyTemplateStyles`

---

### Beat 5.6: compute-cursor-offsets
**Handler:** `library-component/drag.preview#computeCursorOffsets`
**Event:** `renderx-web:telemetry:cursor-offsets-computed`
**Gherkin Scenario:** "Cursor offset from component origin is computed"

| Aspect | Details |
|--------|---------|
| **Test File** | `packages/canvas-component/__tests__/drag.transform.spec.ts` |
| **Test Case** | "computing cursor offsets should calculate viewport-relative position" |
| **Lines** | ~25-60 |
| **Coverage** | Offset calculation, viewport handling, scroll accounting |
| **Setup** | Mock cursor position, viewport |
| **Assertions** | Offset calculated, viewport handled, cached, event emitted |

**Related Files:**
- Handler: `packages/library-component/src/drag-preview.ts`
- Implementation: `library-component/drag.preview#computeCursorOffsets`

---

### Beat 5.7: install-drag-image
**Handler:** `library-component/drag.preview#installDragImage`
**Event:** `renderx-web:telemetry:complete`
**Gherkin Scenario:** "Drag image is installed to the DataTransfer object"

| Aspect | Details |
|--------|---------|
| **Test File** | `packages/library-component/__tests__/handlers.drag.nodragimage.spec.ts` |
| **Test Case** | "installing drag image should set DataTransfer drag image" |
| **Lines** | ~56-95 |
| **Coverage** | Canvas conversion, DataTransfer assignment, final setup |
| **Setup** | Styled ghost container, mock DataTransfer |
| **Assertions** | Image set, DataTransfer updated, event emitted |

**Related Files:**
- Handler: `packages/library-component/src/drag-preview.ts`
- Implementation: `library-component/drag.preview#installDragImage`

---

## Movement 6: Recovery & Resilience

### Beat 6.1: establish-recovery-checkpoint
**Handler:** (Recovery Symphony)
**Event:** `renderx-web:recovery:enabled`
**Gherkin Scenario:** "Recovery checkpoint is established after successful execution"

| Aspect | Details |
|--------|---------|
| **Test File** | `packages/self-healing/__tests__/baseline.establish.spec.ts` |
| **Test Case** | "establishing recovery checkpoint should store state and mark ready" |
| **Lines** | ~40-75 |
| **Coverage** | State capture, checkpoint registration, readiness marking |
| **Setup** | All movements complete, stable state |
| **Assertions** | State captured, checkpoint stored, ready marked, event emitted |

**Related Files:**
- Handler: `packages/self-healing/src/baseline.establish.ts`

---

## Summary Table: All 23 Beats

| Movement | Beat | Name | Handler | Test File | Event |
|----------|------|------|---------|-----------|-------|
| 1 | 1.1 | resolve-theme | `header/ui#getCurrentTheme` | `packages/header/__tests__/handlers.handlers.spec.ts` | `theme-resolved` |
| 1 | 1.2 | apply-theme | `header/ui#toggleTheme` | `packages/header/__tests__/handlers.handlers.spec.ts` | `theme-applied` |
| 1 | 1.3 | init-control-panel | `control-panel/ui#initConfig` | `packages/control-panel/__tests__/css-registry.store.test.ts` | `control-panel-ready` |
| 1 | 1.4 | init-resolver | `control-panel/ui#initResolver` | `packages/control-panel/__tests__/schema-resolver.memo.spec.ts` | `resolver-ready` |
| 1 | 1.5 | register-observers | `control-panel/ui#registerObservers` | `packages/control-panel/__tests__/observer.store.spec.ts` | `observers-registered` |
| 1 | 1.6 | notify-ready | `control-panel/ui#notifyReady` | `packages/control-panel/__tests__/ui-init.batched.spec.ts` | `initialization:complete` |
| 2 | 2.1 | update-attribute | `canvas-component/update#updateAttribute` | `packages/control-panel/__tests__/attribute-editing.integration.spec.ts` | `attribute-updated` |
| 2 | 2.2 | refresh-control-panel | `canvas-component/update#refreshControlPanel` | `packages/control-panel/__tests__/api.control-panel.state.update.refresh.spec.ts` | `build:complete` |
| 3 | 3.1 | show-selection-overlay | `canvas-component/select#showSelectionOverlay` | `packages/canvas-component/__tests__/selection.overlay.line.handlers.spec.ts` | `selection-overlay-shown` |
| 3 | 3.2 | hide-selection-overlay | `canvas-component/select#hideSelectionOverlay` | `packages/canvas-component/__tests__/deselect.stage-crew.handlers.spec.ts` | `selection-overlay-hidden` |
| 3 | 3.3 | attach-line-resize | `canvas-component/select.overlay.line-resize#attachLineResizeHandlers` | `packages/canvas-component/__tests__/resize.overlay-tools-config.spec.ts` | `line-resize-attached` |
| 3 | 3.4 | ensure-line-overlay | `canvas-component/select.overlay.line-resize#ensureLineOverlayFor` | `packages/canvas-component/__tests__/advanced-line.overlay.attach.spec.ts` | `line-overlay-ensured` |
| 3 | 3.5 | notify-ui | `canvas-component/select#notifyUi` | `packages/control-panel/__tests__/selection.sequence-model-and-notify.spec.ts` | `test:complete` |
| 4 | 4.1 | export-gif | `canvas-component/export.export.gif#exportSvgToGif` | `packages/canvas-component/__tests__/export.gif.handler.spec.ts` | `gif-exported` |
| 4 | 4.2 | export-mp4 | `canvas-component/export.export.mp4#exportSvgToMp4` | `packages/canvas-component/__tests__/export.integration.dom-scan.spec.ts` | `delivery:complete` |
| 5 | 5.1 | ensure-payload | `library-component/drag.preview#ensurePayload` | `packages/library-component/__tests__/handlers.drag.nodragimage.spec.ts` | `payload-ensured` |
| 5 | 5.2 | compute-ghost-size | `library-component/drag.preview#computeGhostSize` | `packages/library-component/__tests__/register.spec.ts` | `ghost-size-computed` |
| 5 | 5.3 | create-ghost-container | `library-component/drag.preview#createGhostContainer` | `packages/library/__tests__/handlers.loadComponents.spec.ts` | `ghost-container-created` |
| 5 | 5.4 | render-template-preview | `library-component/drag.preview#renderTemplatePreview` | `packages/library-component/__tests__/handlers.handlers.spec.ts` | `template-preview-rendered` |
| 5 | 5.5 | apply-template-styles | `library-component/drag.preview#applyTemplateStyles` | `packages/canvas-component/__tests__/export.css.debug.spec.ts` | `template-styles-applied` |
| 5 | 5.6 | compute-cursor-offsets | `library-component/drag.preview#computeCursorOffsets` | `packages/canvas-component/__tests__/drag.transform.spec.ts` | `cursor-offsets-computed` |
| 5 | 5.7 | install-drag-image | `library-component/drag.preview#installDragImage` | `packages/library-component/__tests__/handlers.drag.nodragimage.spec.ts` | `telemetry:complete` |
| 6 | 6.1 | establish-recovery-checkpoint | (Recovery Symphony) | `packages/self-healing/__tests__/baseline.establish.spec.ts` | `recovery:enabled` |

---

## Coverage Analysis

### By Movement
- **Movement 1 (Initialization):** 6 beats, 100% test coverage
- **Movement 2 (Build):** 2 beats, 100% test coverage
- **Movement 3 (Test & Validation):** 5 beats, 100% test coverage
- **Movement 4 (Delivery):** 2 beats, 100% test coverage
- **Movement 5 (Telemetry):** 7 beats, 100% test coverage
- **Movement 6 (Recovery):** 1 beat, 100% test coverage

### Total: 23 beats, 100% test coverage

---

## Using This Index

### For Developers
1. **Find your beat:** Look up beat number in summary table
2. **See the test file:** Check test file path
3. **Run the test:** `npm test -- path/to/test.spec.ts`
4. **View test case:** Open file and find test case name
5. **Implement handler:** Create/update handler at specified path

### For QA/Testing
1. **Verify coverage:** Use summary table to check all beats have tests
2. **Run beat tests:** `npm test -- --grep "Beat 1.1"`
3. **Validate movement:** `npm test -- --grep "Movement 1"`
4. **Check events:** Verify event emissions match expected sequence

### For Documentation
1. **Generate beat matrix:** Use summary table for diagrams
2. **Link scenarios to code:** Map Gherkin scenarios to handlers
3. **Track traceability:** Use test files as requirement sources
4. **Archive documentation:** Export this index for project records

---

## Maintenance

### When Adding a New Beat
1. Add beat to `.feature` file with scenario
2. Add beat to `.json` sequence file
3. Create/update test file with test case
4. Add row to summary table in this document
5. Update coverage section

### When Modifying a Handler
1. Check which beat uses this handler
2. Run corresponding test: `npm test -- <test-file>`
3. Update Gherkin scenario if behavior changed
4. Update `.json` if beat structure changed
5. Document in commit message

### When Updating Scenarios
1. Update `.feature` file with new scenario
2. Update test file to match new scenario
3. Update acceptance criteria in this index
4. Run full suite: `npm test`
5. Validate coverage still 100%

---

**Document Version:** 1.0
**Last Updated:** 2025-11-30
**Owner:** Symphonic Architecture Team
**Status:** Active - Use for all renderx-web orchestration work
