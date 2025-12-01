# RenderX Web - Symphonic Domain-Driven Design Review

## Executive Summary

This document establishes the next evolution of symphonic orchestration for renderx-web by mapping each symphony (movement) to **user stories** (Gherkin format), breaking those stories into **acceptance criteria with Gherkin scenarios**, and linking each scenario to **test files** (BDD/TDD).

This is **symphonic domain-driven design in practice** — where every beat has business value, every movement has a persona, and every AC is verifiable.

---

## Current State Assessment

### renderx-web-orchestration.json Structure
- **6 Movements**: Initialization → Build → Test & Validation → Delivery → Telemetry → Recovery
- **30 Total Beats** across movements
- **Clear Handler Mapping**: Each beat has a handler (e.g., `canvas-component/select#showSelectionOverlay`)
- **Gap**: Movements lack explicit user stories and beats lack Gherkin scenarios + test file linking

---

## Target State: Symphonic Domain-Driven Design

### Three-Tier Hierarchy

```
Movement (User Story)
  ├─ Persona: "As a [role]"
  ├─ Goal: "I want to [achieve]"
  ├─ Purpose: "So that [business value]"
  └─ Beats (Acceptance Criteria)
       ├─ Gherkin Scenario: Given/When/Then
       └─ Test File Link: `/path/to/test.spec.ts`
```

---

## RenderX Web Symphonic Mapping

### Movement 1: Initialization Symphony

**User Story:**
```
As a RenderX Web Application Runtime
I want to initialize the build environment and UI state
So that the application is ready to process user interactions and render components
```

**Persona:** System Runtime / Application Startup Service
**Business Value:** Ensures system is in a valid, consistent state before accepting user input

#### Beat 1.1: resolve-theme
**Handler:** `header/ui#getCurrentTheme`
**AC - Gherkin Scenario:**
```gherkin
Scenario: System resolves current theme on initialization
  Given the application is starting up
  And localStorage contains a stored theme preference
  When the Initialization movement beat 1 executes (resolve-theme)
  Then the header module retrieves the current theme
  And the theme value is cached in memory
  And the theme state is published to the event bus
```
**Test File:** `packages/header/__tests__/handlers.handlers.spec.ts`
**Test Case:** "retrieving stored theme preference should cache value and emit event"

#### Beat 1.2: apply-theme
**Handler:** `header/ui#toggleTheme`
**AC - Gherkin Scenario:**
```gherkin
Scenario: System applies resolved theme to UI
  Given the current theme has been resolved in beat 1.1
  When the Initialization movement beat 2 executes (apply-theme)
  Then the header module applies the theme to the DOM
  And CSS custom properties (--color-*) are updated
  And all UI components reflect the new theme
  And theme application event is published
```
**Test File:** `packages/header/__tests__/handlers.handlers.spec.ts`
**Test Case:** "applying theme should update DOM and publish event"

#### Beat 1.3: init-control-panel
**Handler:** `control-panel/ui#initConfig`
**AC - Gherkin Scenario:**
```gherkin
Scenario: Control panel is initialized with default configuration
  Given the application startup sequence is in progress
  And theme has been applied (beat 1.2 complete)
  When the Initialization movement beat 3 executes (init-control-panel)
  Then the control panel configuration is loaded from schema
  And default CSS registry is created
  And schema resolver is initialized
  And control panel ready event is emitted
```
**Test File:** `packages/control-panel/__tests__/css-registry.store.test.ts`
**Test Case:** "initializing control panel should create schema resolver and registry"

#### Beat 1.4: init-resolver
**Handler:** `control-panel/ui#initResolver`
**AC - Gherkin Scenario:**
```gherkin
Scenario: Schema resolver is initialized for schema resolution
  Given control panel configuration is ready (beat 1.3 complete)
  When the Initialization movement beat 4 executes (init-resolver)
  Then the schema resolver instance is created
  And schema cache is initialized
  And resolver is registered with event bus
  And resolver ready event is published
```
**Test File:** `packages/control-panel/__tests__/schema-resolver.memo.spec.ts`
**Test Case:** "initializing resolver should create cache and register event listener"

#### Beat 1.5: register-observers
**Handler:** `control-panel/ui#registerObservers`
**AC - Gherkin Scenario:**
```gherkin
Scenario: UI observer pattern is established for state synchronization
  Given all infrastructure components are initialized (beats 1.3-1.4 complete)
  When the Initialization movement beat 5 executes (register-observers)
  Then control panel observer is registered with event bus
  And CSS registry observer is registered
  And schema resolver observer is registered
  And canvas component observer is registered
  And all observers can receive state change events
```
**Test File:** `packages/control-panel/__tests__/observer.store.spec.ts`
**Test Case:** "registering observers should attach all listeners and enable bidirectional sync"

#### Beat 1.6: notify-ready
**Handler:** `control-panel/ui#notifyReady`
**AC - Gherkin Scenario:**
```gherkin
Scenario: Application signals that initialization is complete
  Given all initialization beats 1.1-1.5 have completed successfully
  When the Initialization movement beat 6 executes (notify-ready)
  Then the application emits initialization:complete event
  And all dependent systems know the app is ready
  And event listeners for renderx-web:initialization:complete are triggered
  And the system transitions to Movement 2 (Build)
```
**Test File:** `packages/control-panel/__tests__/ui-init.batched.spec.ts`
**Test Case:** "notifying ready should emit completion event and enable downstream movements"

---

### Movement 2: Build Symphony

**User Story:**
```
As a Build Orchestration System
I want to execute pre-build validation and attribute synchronization
So that component state and control panel remain synchronized before the build starts
```

**Persona:** Build Pipeline Orchestrator
**Business Value:** Ensures UI state is consistent before build compilation, preventing runtime errors

#### Beat 2.1: update-attribute
**Handler:** `canvas-component/update#updateAttribute`
**AC - Gherkin Scenario:**
```gherkin
Scenario: Component attribute is updated in control panel
  Given the Build movement has started (Movement 2 initiated)
  When the Build movement beat 1 executes (update-attribute)
  Then the canvas component attribute change is captured
  And the control panel is updated with new attribute value
  And the updated attribute is validated against schema
  And attribute change event is published to event bus
```
**Test File:** `packages/control-panel/__tests__/attribute-editing.integration.spec.ts`
**Test Case:** "updating attribute should sync control panel and emit change event"

#### Beat 2.2: refresh-control-panel
**Handler:** `canvas-component/update#refreshControlPanel`
**AC - Gherkin Scenario:**
```gherkin
Scenario: Control panel is refreshed after pre-build validation
  Given component attributes have been updated (beat 2.1 complete)
  When the Build movement beat 2 executes (refresh-control-panel)
  Then the control panel UI re-renders with latest state
  And all CSS class registry entries are up-to-date
  And schema resolver is refreshed with current data
  And build readiness event is published
```
**Test File:** `packages/control-panel/__tests__/api.control-panel.state.update.refresh.spec.ts`
**Test Case:** "refreshing control panel should trigger re-render and update registry"

---

### Movement 3: Test & Validation Symphony

**User Story:**
```
As a Quality Assurance System
I want to execute E2E tests and validate compliance across 7 layers
So that the application meets functional, visual, and governance requirements
```

**Persona:** QA / Test Automation Engine
**Business Value:** Ensures application functionality, visual integrity, and regulatory compliance before deployment

#### Beat 3.1: show-selection-overlay
**Handler:** `canvas-component/select#showSelectionOverlay`
**AC - Gherkin Scenario:**
```gherkin
Scenario: Selection overlay is displayed on canvas component selection
  Given the Test & Validation movement has started (Movement 3 initiated)
  And a canvas component is eligible for selection
  When the Test & Validation movement beat 1 executes (show-selection-overlay)
  Then the selection overlay appears on the component
  And overlay dimensions match component bounds
  And selection event is emitted to event bus
  And control panel displays component properties
```
**Test File:** `packages/canvas-component/__tests__/selection.overlay.line.handlers.spec.ts`
**Test Case:** "showing selection overlay should display and emit selection event"

#### Beat 3.2: hide-selection-overlay
**Handler:** `canvas-component/select#hideSelectionOverlay`
**AC - Gherkin Scenario:**
```gherkin
Scenario: Selection overlay is hidden on deselection
  Given the selection overlay is visible (beat 3.1 complete)
  When the Test & Validation movement beat 2 executes (hide-selection-overlay)
  Then the selection overlay is removed from the canvas
  And deselection event is emitted
  And control panel clears component properties display
  And canvas component returns to normal state
```
**Test File:** `packages/canvas-component/__tests__/deselect.stage-crew.handlers.spec.ts`
**Test Case:** "hiding selection overlay should deselect and emit deselection event"

#### Beat 3.3: attach-line-resize
**Handler:** `canvas-component/select.overlay.line-resize#attachLineResizeHandlers`
**AC - Gherkin Scenario:**
```gherkin
Scenario: Line component resize handlers are attached to overlay
  Given the selection overlay is displayed (beat 3.1 complete)
  And the selected component is a line element
  When the Test & Validation movement beat 3 executes (attach-line-resize)
  Then resize handles (NE, SE, SW, NW) are attached to the overlay
  And each handle has drag event listeners
  And resize preview is calculated for each handle interaction
  And resize handlers are ready for user interaction
```
**Test File:** `packages/canvas-component/__tests__/resize.overlay-tools-config.spec.ts`
**Test Case:** "attaching line resize handlers should enable drag preview and constrain dimensions"

#### Beat 3.4: ensure-line-overlay
**Handler:** `canvas-component/select.overlay.line-resize#ensureLineOverlayFor`
**AC - Gherkin Scenario:**
```gherkin
Scenario: Line component overlay is ensured to exist and be properly configured
  Given the attachment of resize handlers is in progress (beat 3.3 executing)
  When the Test & Validation movement beat 4 executes (ensure-line-overlay)
  Then the overlay for the line component exists in the DOM
  And overlay positioning is calculated relative to line element
  And overlay visibility state matches component visibility
  And overlay configuration event is published
```
**Test File:** `packages/canvas-component/__tests__/advanced-line.overlay.attach.spec.ts`
**Test Case:** "ensuring line overlay should create overlay with correct positioning"

#### Beat 3.5: notify-ui
**Handler:** `canvas-component/select#notifyUi`
**AC - Gherkin Scenario:**
```gherkin
Scenario: UI components are notified of selection state changes
  Given all selection and overlay operations are complete (beats 3.1-3.4 complete)
  When the Test & Validation movement beat 5 executes (notify-ui)
  Then all UI components receive selection state update
  And control panel updates to show selected component properties
  And menu and toolbar items reflect selection context
  And event bus publishes ui:selection:notify event
```
**Test File:** `packages/control-panel/__tests__/selection.sequence-model-and-notify.spec.ts`
**Test Case:** "notifying UI should update control panel and trigger context-aware toolbar"

---

### Movement 4: Delivery Symphony

**User Story:**
```
As a Content Export System
I want to export canvas compositions to multiple media formats
So that users can share and present their designs in GIF and MP4 formats
```

**Persona:** Export / Content Distribution Engine
**Business Value:** Enables end-user design sharing and presentation capabilities

#### Beat 4.1: export-gif
**Handler:** `canvas-component/export.export.gif#exportSvgToGif`
**AC - Gherkin Scenario:**
```gherkin
Scenario: Canvas composition is exported to GIF format
  Given the Delivery movement has started (Movement 4 initiated)
  And a valid canvas composition is ready for export
  When the Delivery movement beat 1 executes (export-gif)
  Then the canvas SVG is rendered to frames
  And frames are compiled into an animated GIF
  And GIF file is written to output directory
  And export completion event is published with file path
```
**Test File:** `packages/canvas-component/__tests__/export.gif.handler.spec.ts`
**Test Case:** "exporting canvas to GIF should create animated file in output directory"

#### Beat 4.2: export-mp4
**Handler:** `canvas-component/export.export.mp4#exportSvgToMp4`
**AC - Gherkin Scenario:**
```gherkin
Scenario: Canvas composition is exported to MP4 video format
  Given the GIF export is complete (beat 4.1 complete)
  When the Delivery movement beat 2 executes (export-mp4)
  Then the canvas SVG is rendered as video frames
  And frames are encoded to H.264 MP4 codec
  And MP4 file is written to output directory with metadata
  And video export completion event is published with file path and duration
```
**Test File:** `packages/canvas-component/__tests__/export.integration.dom-scan.spec.ts`
**Test Case:** "exporting canvas to MP4 should create video file with correct codec"

---

### Movement 5: Telemetry & Monitoring Symphony

**User Story:**
```
As an Observability System
I want to collect instrumentation telemetry and monitor user interactions
So that the platform can track performance, debug issues, and measure user engagement
```

**Persona:** Telemetry / Observability Engine
**Business Value:** Provides runtime visibility for debugging, performance optimization, and user behavior analysis

#### Beat 5.1: ensure-payload
**Handler:** `library-component/drag.preview#ensurePayload`
**AC - Gherkin Scenario:**
```gherkin
Scenario: Drag operation payload is created and validated
  Given the Telemetry movement has started (Movement 5 initiated)
  And a component is ready to be dragged
  When the Telemetry movement beat 1 executes (ensure-payload)
  Then a drag payload object is created with component metadata
  And payload includes component id, type, and initial position
  And payload is validated against schema
  And payload is cached for subsequent beats
```
**Test File:** `packages/library-component/__tests__/handlers.drag.nodragimage.spec.ts`
**Test Case:** "ensuring drag payload should create and validate metadata object"

#### Beat 5.2: compute-ghost-size
**Handler:** `library-component/drag.preview#computeGhostSize`
**AC - Gherkin Scenario:**
```gherkin
Scenario: Ghost element size is computed for drag preview
  Given the drag payload is ready (beat 5.1 complete)
  When the Telemetry movement beat 2 executes (compute-ghost-size)
  Then the ghost element dimensions are calculated from source component
  And dimensions account for transform scaling and rotation
  And ghost size is cached for rendering
  And size computation event is published
```
**Test File:** `packages/library-component/__tests__/register.spec.ts`
**Test Case:** "computing ghost size should calculate dimensions with transforms"

#### Beat 5.3: create-ghost-container
**Handler:** `library-component/drag.preview#createGhostContainer`
**AC - Gherkin Scenario:**
```gherkin
Scenario: Ghost container DOM element is created for drag preview
  Given the ghost size is computed (beat 5.2 complete)
  When the Telemetry movement beat 3 executes (create-ghost-container)
  Then a DOM container element is created with ghost styles
  And container is positioned off-screen initially
  And container z-index is set to appear above all other elements
  And container reference is stored for subsequent beats
```
**Test File:** `packages/library/__tests__/handlers.loadComponents.spec.ts`
**Test Case:** "creating ghost container should initialize off-screen element"

#### Beat 5.4: render-template-preview
**Handler:** `library-component/drag.preview#renderTemplatePreview`
**AC - Gherkin Scenario:**
```gherkin
Scenario: Template content is rendered into ghost preview
  Given the ghost container is created (beat 5.3 complete)
  When the Telemetry movement beat 4 executes (render-template-preview)
  Then the source component template is cloned into ghost container
  And styles from source are applied to the preview
  And preview is rendered to match source appearance
  And render completion event is published
```
**Test File:** `packages/library-component/__tests__/handlers.handlers.spec.ts`
**Test Case:** "rendering template preview should clone and style content"

#### Beat 5.5: apply-template-styles
**Handler:** `library-component/drag.preview#applyTemplateStyles`
**AC - Gherkin Scenario:**
```gherkin
Scenario: Styles are applied to maintain visual consistency in ghost preview
  Given the template preview is rendered (beat 5.4 complete)
  When the Telemetry movement beat 5 executes (apply-template-styles)
  Then computed styles from source component are extracted
  And styles are applied to ghost container
  And opacity and shadow effects are adjusted for drag indication
  And style application event is published
```
**Test File:** `packages/canvas-component/__tests__/export.css.debug.spec.ts`
**Test Case:** "applying template styles should sync CSS from source"

#### Beat 5.6: compute-cursor-offsets
**Handler:** `library-component/drag.preview#computeCursorOffsets`
**AC - Gherkin Scenario:**
```gherkin
Scenario: Cursor offset from component origin is computed
  Given the ghost preview is styled (beat 5.5 complete)
  When the Telemetry movement beat 6 executes (compute-cursor-offsets)
  Then the offset between cursor and component top-left is calculated
  And offset accounts for scroll position and viewport
  And offset is used to position ghost under cursor during drag
  And offset computation event is published
```
**Test File:** `packages/canvas-component/__tests__/drag.transform.spec.ts`
**Test Case:** "computing cursor offsets should calculate viewport-relative position"

#### Beat 5.7: install-drag-image
**Handler:** `library-component/drag.preview#installDragImage`
**AC - Gherkin Scenario:**
```gherkin
Scenario: Drag image is installed to the DataTransfer object
  Given all ghost preview preparation is complete (beats 5.1-5.6 complete)
  When the Telemetry movement beat 7 executes (install-drag-image)
  Then the ghost container is converted to canvas image data
  And image is set as the drag image on the DataTransfer object
  And browser will display this image during drag operation
  And drag image installation event is published
```
**Test File:** `packages/library-component/__tests__/handlers.drag.nodragimage.spec.ts`
**Test Case:** "installing drag image should set DataTransfer drag image"

---

### Movement 6: Recovery & Resilience Symphony

**User Story:**
```
As a Fault-Tolerant Runtime
I want to detect failures and execute recovery procedures
So that the application can gracefully handle errors and maintain availability
```

**Persona:** Runtime Fault Handler / Recovery Orchestrator
**Business Value:** Ensures application resilience and user experience continuity during failures

**Note:** Recovery movement references `pipeline-recovery-symphony` for detailed procedures. This movement establishes the recovery checkpoint after successful completion of movements 1-5.

#### Beat 6.1: establish-recovery-checkpoint
**Scenario:**
```gherkin
Scenario: Recovery checkpoint is established after successful execution
  Given all previous movements 1-5 have completed successfully
  When the Recovery movement beat 1 executes
  Then the current system state is captured and stored
  And recovery checkpoint is registered with recovery symphony
  And system is marked as ready for operation or next cycle
  And recovery enabled event is published
```
**Test File:** `packages/self-healing/__tests__/baseline.establish.spec.ts`
**Test Case:** "establishing recovery checkpoint should store state and mark ready"

---

## Implementation Roadmap

### Phase 1: Create Symphonic User Story Document (Complete ✅)
- [x] Define 6 movement user stories (personas, goals, business value)
- [x] Map each beat to Gherkin scenario
- [x] Link scenarios to existing test files
- [x] Create this comprehensive mapping document

### Phase 2: Create BDD Feature File (Pending)
**File:** `packages/orchestration/bdd/renderx-web-orchestration.feature`

Create a Gherkin feature file with:
```gherkin
Feature: RenderX Web Master Orchestration
  As a web application runtime platform
  I want to orchestrate a complete lifecycle from initialization through recovery
  So that the application maintains state consistency and handles all user workflows

  Background:
    Given the RenderX Web application is deployed
    And all handler modules are loaded
    And the event bus is initialized

  # Movement 1: Initialization (6 beats)
  Scenario: Movement 1 - Application Initialization
    Given the application startup sequence is triggered
    When the Initialization movement executes with 6 beats:
      | beat | name | handler |
      | 1    | resolve-theme | header/ui#getCurrentTheme |
      ...
    Then the application is ready for user interaction
    And initialization:complete event is published
    And all dependent systems know the app is ready

  # ... (Movement 2-6 scenarios)
```

### Phase 3: Enhance JSON Sequence (Pending)
**File:** `packages/orchestration/json-sequences/renderx-web-orchestration.json`

Add to each beat:
```json
{
  "name": "resolve-theme",
  "handler": { "name": "header/ui#getCurrentTheme" },
  "event": "renderx-web:initialization:theme-resolved",
  "beat": 1,
  "scenario": "System resolves current theme on initialization",
  "acceptanceCriteria": [
    "Retrieve current theme from localStorage",
    "Cache theme value in memory",
    "Publish theme state to event bus"
  ],
  "testFile": "packages/header/__tests__/handlers.handlers.spec.ts",
  "testCase": "retrieving stored theme preference should cache value and emit event"
}
```

### Phase 4: Create Test Linking Index (Pending)
**File:** `docs/RENDERX_WEB_BDD_TEST_MAPPING.md`

Create an index:
```markdown
# RenderX Web - Beat to Test Mapping Index

## Movement 1: Initialization
- Beat 1.1 (resolve-theme) → `packages/header/__tests__/handlers.handlers.spec.ts`
- Beat 1.2 (apply-theme) → `packages/header/__tests__/handlers.handlers.spec.ts`
- Beat 1.3 (init-control-panel) → `packages/control-panel/__tests__/css-registry.store.test.ts`
...
```

---

## BDD/TDD Integration Points

### Test Execution Strategy

1. **Unit Tests** (Each beat handler)
   ```bash
   npm test -- packages/header/__tests__/handlers.handlers.spec.ts
   ```

2. **Integration Tests** (Movement validation)
   ```bash
   npm test -- --grep "Movement 1"
   ```

3. **Symphony Validation Tests** (Full orchestration)
   ```bash
   npm test -- renderx-web-orchestration.spec.ts
   ```

4. **E2E Tests** (User workflows)
   ```bash
   npm run test:e2e
   ```

---

## Key Principles: Symphonic Domain-Driven Design

### 1. **Purpose-First Architecture**
Each beat has a business purpose tied to a user story, not just a technical task.

### 2. **Scenario-Driven Implementation**
Every AC is expressed in Gherkin, making requirements testable and traceable.

### 3. **Test File Traceability**
Every scenario points to a concrete test file and test case, enabling:
- Bidirectional traceability (beat ↔ test)
- Coverage validation
- Regression detection
- Documentation generation

### 4. **Persona Alignment**
Movements are designed from a persona's perspective (DevOps, QA, Runtime, etc.), not internal architecture.

### 5. **Event-Driven Verification**
Each beat publishes events, enabling downstream beats to verify completion and enable recovery patterns.

---

## Success Metrics

| Metric | Target | Current |
|--------|--------|---------|
| Beats with defined user stories | 100% | 0% |
| Beats with Gherkin scenarios | 100% | 0% |
| Beats with test file links | 100% | 0% |
| Test coverage for scenarios | ≥95% | TBD |
| Beat execution time tracking | 100% | TBD |
| Event publish validation | 100% | TBD |

---

## Recommended Next Actions

1. **Create the BDD feature file** with all 30 beats and scenarios
2. **Enhance the JSON sequence** with scenario, AC, testFile, and testCase fields
3. **Generate the beat-to-test mapping index** for traceability
4. **Create symphony validation tests** to ensure all beats execute in order
5. **Document recovery procedures** for each beat failure mode

---

## Questions & Discussion Points

1. **Should each beat have an error recovery path?**
   - E.g., if `init-resolver` fails, what's the rollback?

2. **What's the acceptable failure rate per beat?**
   - Do we fail fast or continue with degraded state?

3. **How should we track beat execution metrics?**
   - Timing, success rate, error patterns?

4. **Should movements be parallelizable?**
   - Movement 5 (Telemetry) seems independent; can it run in parallel with others?

5. **How do we version symphony changes?**
   - When a beat handler changes, how do we track backwards compatibility?

---

## Appendix: File References

### Sequence Files
- `packages/orchestration/json-sequences/renderx-web-orchestration.json`

### Test Files (By Movement)
- **Movement 1:** `packages/{header,control-panel}/__tests__/**`
- **Movement 2:** `packages/control-panel/__tests__/**`
- **Movement 3:** `packages/canvas-component/__tests__/**`
- **Movement 4:** `packages/canvas-component/__tests__/export.**`
- **Movement 5:** `packages/library-component/__tests__/**`
- **Movement 6:** `packages/self-healing/__tests__/**`

### Documentation
- This file: `RENDERX_WEB_SYMPHONIC_REVIEW.md`
- Build Pipeline Symphony: `packages/orchestration/bdd/build-pipeline-symphony.feature`
- Symphony Report Pipeline: `packages/orchestration/bdd/symphony-report-pipeline.feature`

---

**Document Version:** 1.0
**Last Updated:** 2025-11-30
**Owner:** Symphonic Architecture Team
