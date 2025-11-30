# renderx-web-orchestration feature
# Symphonic Domain-Driven Design: Master Orchestration Pipeline
# Maps 6 movements to complete RenderX Web application lifecycle

Feature: RenderX Web Master Orchestration
  In order to orchestrate a complete, auditable application lifecycle
  As a web application runtime platform
  I want to manage initialization, build, test, delivery, telemetry, and recovery with full traceability

  Background:
    Given the RenderX Web application deployment is triggered
    And all handler modules are loaded and registered
    And the event bus is initialized and listening
    And governance rules are loaded from DOMAIN_REGISTRY
    And output directories are prepared (dist/, docs/, build-logs/)
    And previous execution state is accessible (for recovery)

  # ══════════════════════════════════════════════════════════════════
  # MOVEMENT 1: INITIALIZATION SYMPHONY (6 beats)
  # ══════════════════════════════════════════════════════════════════

  Scenario: Movement 1 - Application Initialization Phase
    Given the application startup sequence is triggered
    And no UI state is currently loaded
    When the Initialization movement executes:
      | beat | action | handler | event |
      | 1 | resolve-theme | header/ui#getCurrentTheme | renderx-web:initialization:theme-resolved |
      | 2 | apply-theme | header/ui#toggleTheme | renderx-web:initialization:theme-applied |
      | 3 | init-control-panel | control-panel/ui#initConfig | renderx-web:initialization:control-panel-ready |
      | 4 | init-resolver | control-panel/ui#initResolver | renderx-web:initialization:resolver-ready |
      | 5 | register-observers | control-panel/ui#registerObservers | renderx-web:initialization:observers-registered |
      | 6 | notify-ready | control-panel/ui#notifyReady | renderx-web:initialization:complete |
    Then all 6 initialization beats complete successfully
    And the theme is resolved from localStorage
    And theme is applied to all UI components
    And control panel configuration is loaded and ready
    And schema resolver is initialized and cached
    And all observers (control-panel, css-registry, schema-resolver, canvas-component) are registered
    And the application emits renderx-web:initialization:complete event
    And the system is ready to proceed to Movement 2
    And execution logs contain beat timestamps and event confirmations
    And all beats are recorded in telemetry with durations

  # Beat 1.1: Resolve Theme
  Scenario: Beat 1.1 - System resolves current theme on initialization
    Given the application is starting up
    And localStorage contains a stored theme preference or defaults to 'light'
    When the Initialization movement beat 1 executes (resolve-theme)
    Then the header module retrieves the current theme via header/ui#getCurrentTheme
    And the theme value is cached in memory for fast access
    And the theme state is published to the event bus as renderx-web:initialization:theme-resolved
    And the control panel receives the theme notification

  # Beat 1.2: Apply Theme
  Scenario: Beat 1.2 - System applies resolved theme to UI
    Given the current theme has been resolved in beat 1.1
    When the Initialization movement beat 2 executes (apply-theme)
    Then the header module applies the theme via header/ui#toggleTheme
    And CSS custom properties (--color-primary, --color-bg, etc.) are updated in the DOM
    And all UI components reflect the new theme in real-time
    And theme application event renderx-web:initialization:theme-applied is published
    And the control panel confirms theme application

  # Beat 1.3: Init Control Panel
  Scenario: Beat 1.3 - Control panel is initialized with default configuration
    Given the application startup sequence is in progress
    And theme has been applied (beat 1.2 complete)
    When the Initialization movement beat 3 executes (init-control-panel)
    Then the control panel configuration is loaded from schema via control-panel/ui#initConfig
    And default CSS registry is created and indexed
    And schema resolver is initialized and ready for use
    And control panel ready event renderx-web:initialization:control-panel-ready is emitted
    And the control panel UI is ready to receive state updates

  # Beat 1.4: Init Resolver
  Scenario: Beat 1.4 - Schema resolver is initialized for schema resolution
    Given control panel configuration is ready (beat 1.3 complete)
    When the Initialization movement beat 4 executes (init-resolver)
    Then the schema resolver instance is created via control-panel/ui#initResolver
    And schema cache is initialized and memoized
    And resolver is registered with event bus for listeners
    And resolver ready event renderx-web:initialization:resolver-ready is published
    And the resolver can now service schema lookup requests

  # Beat 1.5: Register Observers
  Scenario: Beat 1.5 - UI observer pattern is established for state synchronization
    Given all infrastructure components are initialized (beats 1.3-1.4 complete)
    When the Initialization movement beat 5 executes (register-observers)
    Then control panel observer is registered with event bus via control-panel/ui#registerObservers
    And CSS registry observer is registered for style changes
    And schema resolver observer is registered for validation changes
    And canvas component observer is registered for component updates
    And all observers are enabled to receive state change events
    And bidirectional synchronization is established
    And observers registered event renderx-web:initialization:observers-registered is published

  # Beat 1.6: Notify Ready
  Scenario: Beat 1.6 - Application signals that initialization is complete
    Given all initialization beats 1.1-1.5 have completed successfully
    And all components have confirmed readiness
    When the Initialization movement beat 6 executes (notify-ready)
    Then the application emits initialization:complete event via control-panel/ui#notifyReady
    And all dependent systems know the app is ready for use
    And event listeners for renderx-web:initialization:complete are triggered
    And the system transitions to Movement 2 (Build)
    And telemetry captures total initialization duration
    And recovery checkpoint is stored with initialization state

  # ══════════════════════════════════════════════════════════════════
  # MOVEMENT 2: BUILD SYMPHONY (2 beats)
  # ══════════════════════════════════════════════════════════════════

  Scenario: Movement 2 - Build & Attribute Synchronization Phase
    Given Movement 1 (Initialization) has completed successfully
    And the application is ready for build operations
    When the Build movement executes:
      | beat | action | handler | event |
      | 1 | update-attribute | canvas-component/update#updateAttribute | renderx-web:build:attribute-updated |
      | 2 | refresh-control-panel | canvas-component/update#refreshControlPanel | renderx-web:build:complete |
    Then all 2 build beats complete successfully
    And component attributes are synchronized with control panel state
    And control panel is refreshed with latest component configuration
    And build readiness event is published
    And the system is ready to proceed to Movement 3 (Test & Validation)
    And build metrics are recorded in telemetry

  # Beat 2.1: Update Attribute
  Scenario: Beat 2.1 - Component attribute is updated in control panel
    Given the Build movement has started (Movement 2 initiated)
    And a canvas component has attribute changes pending
    When the Build movement beat 1 executes (update-attribute)
    Then the canvas component attribute change is captured via canvas-component/update#updateAttribute
    And the control panel is updated with new attribute value
    And the updated attribute is validated against schema
    And attribute change event renderx-web:build:attribute-updated is published to event bus
    And the canvas component reflects the change visually

  # Beat 2.2: Refresh Control Panel
  Scenario: Beat 2.2 - Control panel is refreshed after pre-build validation
    Given component attributes have been updated (beat 2.1 complete)
    When the Build movement beat 2 executes (refresh-control-panel)
    Then the control panel UI re-renders with latest state via canvas-component/update#refreshControlPanel
    And all CSS class registry entries are up-to-date
    And schema resolver is refreshed with current data
    And build readiness event renderx-web:build:complete is published
    And the control panel is prepared for the next movement

  # ══════════════════════════════════════════════════════════════════
  # MOVEMENT 3: TEST & VALIDATION SYMPHONY (5 beats)
  # ══════════════════════════════════════════════════════════════════

  Scenario: Movement 3 - Test, Validation, & Selection Phase
    Given Movement 2 (Build) has completed successfully
    And all component state is synchronized
    When the Test & Validation movement executes:
      | beat | action | handler | event |
      | 1 | show-selection-overlay | canvas-component/select#showSelectionOverlay | renderx-web:test:selection-overlay-shown |
      | 2 | hide-selection-overlay | canvas-component/select#hideSelectionOverlay | renderx-web:test:selection-overlay-hidden |
      | 3 | attach-line-resize | canvas-component/select.overlay.line-resize#attachLineResizeHandlers | renderx-web:test:line-resize-attached |
      | 4 | ensure-line-overlay | canvas-component/select.overlay.line-resize#ensureLineOverlayFor | renderx-web:test:line-overlay-ensured |
      | 5 | notify-ui | canvas-component/select#notifyUi | renderx-web:test:complete |
    Then all 5 test beats complete successfully
    And E2E Cypress tests maintain ≥ 85% pass rate
    And 7-layer compliance validation passes
    And all selection and overlay operations work correctly
    And the system is ready to proceed to Movement 4 (Delivery)
    And test metrics and coverage data are recorded in telemetry

  # Beat 3.1: Show Selection Overlay
  Scenario: Beat 3.1 - Selection overlay is displayed on canvas component selection
    Given the Test & Validation movement has started (Movement 3 initiated)
    And a canvas component is eligible for selection
    When the Test & Validation movement beat 1 executes (show-selection-overlay)
    Then the selection overlay appears on the component via canvas-component/select#showSelectionOverlay
    And overlay dimensions match component bounds precisely
    And selection event renderx-web:test:selection-overlay-shown is emitted to event bus
    And control panel displays component properties (id, class, attributes)
    And the overlay has visual indication of selection state

  # Beat 3.2: Hide Selection Overlay
  Scenario: Beat 3.2 - Selection overlay is hidden on deselection
    Given the selection overlay is visible (beat 3.1 complete)
    When the Test & Validation movement beat 2 executes (hide-selection-overlay)
    Then the selection overlay is removed from the canvas via canvas-component/select#hideSelectionOverlay
    And deselection event renderx-web:test:selection-overlay-hidden is emitted
    And control panel clears component properties display
    And canvas component returns to normal state without overlay

  # Beat 3.3: Attach Line Resize
  Scenario: Beat 3.3 - Line component resize handlers are attached to overlay
    Given the selection overlay is displayed (beat 3.1 complete)
    And the selected component is a line element (SVG path or similar)
    When the Test & Validation movement beat 3 executes (attach-line-resize)
    Then resize handles (NE, SE, SW, NW, N, S, E, W) are attached via canvas-component/select.overlay.line-resize#attachLineResizeHandlers
    And each handle has drag event listeners registered
    And resize preview is calculated for each handle interaction
    And resize constraints are enforced (minimum size, maximum bounds)
    And resize handlers ready event renderx-web:test:line-resize-attached is published

  # Beat 3.4: Ensure Line Overlay
  Scenario: Beat 3.4 - Line component overlay is ensured to exist and be properly configured
    Given the attachment of resize handlers is in progress (beat 3.3 executing)
    When the Test & Validation movement beat 4 executes (ensure-line-overlay)
    Then the overlay for the line component exists in the DOM via canvas-component/select.overlay.line-resize#ensureLineOverlayFor
    And overlay positioning is calculated relative to line element
    And overlay visibility state matches component visibility
    And overlay configuration event renderx-web:test:line-overlay-ensured is published
    And all subsequent selection operations can use the established overlay

  # Beat 3.5: Notify UI
  Scenario: Beat 3.5 - UI components are notified of selection state changes
    Given all selection and overlay operations are complete (beats 3.1-3.4 complete)
    When the Test & Validation movement beat 5 executes (notify-ui)
    Then all UI components receive selection state update via canvas-component/select#notifyUi
    And control panel updates to show selected component properties
    And menu and toolbar items reflect selection context (cut/copy/delete/group enabled)
    And event bus publishes renderx-web:test:complete event
    And context-aware actions become available to the user

  # ══════════════════════════════════════════════════════════════════
  # MOVEMENT 4: DELIVERY SYMPHONY (2 beats)
  # ══════════════════════════════════════════════════════════════════

  Scenario: Movement 4 - Content Export & Distribution Phase
    Given Movement 3 (Test & Validation) has completed successfully
    And canvas composition is ready for export
    When the Delivery movement executes:
      | beat | action | handler | event |
      | 1 | export-gif | canvas-component/export.export.gif#exportSvgToGif | renderx-web:delivery:gif-exported |
      | 2 | export-mp4 | canvas-component/export.export.mp4#exportSvgToMp4 | renderx-web:delivery:complete |
    Then all 2 delivery beats complete successfully
    And canvas composition is exported to GIF and MP4 formats
    And export files are written to output directory with metadata
    And export completion events are published
    And the system is ready to proceed to Movement 5 (Telemetry)
    And delivery metrics are recorded in telemetry

  # Beat 4.1: Export GIF
  Scenario: Beat 4.1 - Canvas composition is exported to GIF format
    Given the Delivery movement has started (Movement 4 initiated)
    And a valid canvas composition is ready for export
    When the Delivery movement beat 1 executes (export-gif)
    Then the canvas SVG is rendered to frames via canvas-component/export.export.gif#exportSvgToGif
    And frames are compiled into an animated GIF with 30fps
    And GIF file is written to output directory with proper naming
    And export metadata (dimensions, duration, frame count) is recorded
    And export completion event renderx-web:delivery:gif-exported is published with file path

  # Beat 4.2: Export MP4
  Scenario: Beat 4.2 - Canvas composition is exported to MP4 video format
    Given the GIF export is complete (beat 4.1 complete)
    When the Delivery movement beat 2 executes (export-mp4)
    Then the canvas SVG is rendered as video frames via canvas-component/export.export.mp4#exportSvgToMp4
    And frames are encoded to H.264 MP4 codec with bitrate optimization
    And MP4 file is written to output directory with metadata
    And video metadata (dimensions, duration, bitrate, codec) is recorded
    And video export completion event renderx-web:delivery:complete is published with file path and duration

  # ══════════════════════════════════════════════════════════════════
  # MOVEMENT 5: TELEMETRY & MONITORING SYMPHONY (7 beats)
  # ══════════════════════════════════════════════════════════════════

  Scenario: Movement 5 - Drag Interaction Telemetry & Observability Phase
    Given Movement 4 (Delivery) has completed successfully
    And telemetry collection is enabled
    When the Telemetry & Monitoring movement executes:
      | beat | action | handler | event |
      | 1 | ensure-payload | library-component/drag.preview#ensurePayload | renderx-web:telemetry:payload-ensured |
      | 2 | compute-ghost-size | library-component/drag.preview#computeGhostSize | renderx-web:telemetry:ghost-size-computed |
      | 3 | create-ghost-container | library-component/drag.preview#createGhostContainer | renderx-web:telemetry:ghost-container-created |
      | 4 | render-template-preview | library-component/drag.preview#renderTemplatePreview | renderx-web:telemetry:template-preview-rendered |
      | 5 | apply-template-styles | library-component/drag.preview#applyTemplateStyles | renderx-web:telemetry:template-styles-applied |
      | 6 | compute-cursor-offsets | library-component/drag.preview#computeCursorOffsets | renderx-web:telemetry:cursor-offsets-computed |
      | 7 | install-drag-image | library-component/drag.preview#installDragImage | renderx-web:telemetry:complete |
    Then all 7 telemetry beats complete successfully
    And drag interaction telemetry is collected and instrumented
    And performance metrics are recorded (beat durations, memory usage)
    And user interaction patterns are captured
    And the system is ready to proceed to Movement 6 (Recovery)
    And telemetry data is prepared for analysis and storage

  # Beat 5.1: Ensure Payload
  Scenario: Beat 5.1 - Drag operation payload is created and validated
    Given the Telemetry movement has started (Movement 5 initiated)
    And a component is ready to be dragged
    When the Telemetry movement beat 1 executes (ensure-payload)
    Then a drag payload object is created via library-component/drag.preview#ensurePayload
    And payload includes component id, type, initial position, and metadata
    And payload is validated against schema
    And payload is cached in memory for subsequent beats
    And payload ensured event renderx-web:telemetry:payload-ensured is published

  # Beat 5.2: Compute Ghost Size
  Scenario: Beat 5.2 - Ghost element size is computed for drag preview
    Given the drag payload is ready (beat 5.1 complete)
    When the Telemetry movement beat 2 executes (compute-ghost-size)
    Then the ghost element dimensions are calculated via library-component/drag.preview#computeGhostSize
    And dimensions account for transform scaling, rotation, and skew
    And computed size is cached for rendering
    And size computation event renderx-web:telemetry:ghost-size-computed is published
    And size data is recorded in telemetry

  # Beat 5.3: Create Ghost Container
  Scenario: Beat 5.3 - Ghost container DOM element is created for drag preview
    Given the ghost size is computed (beat 5.2 complete)
    When the Telemetry movement beat 3 executes (create-ghost-container)
    Then a DOM container element is created via library-component/drag.preview#createGhostContainer
    And container is positioned off-screen initially (typically top: -9999px)
    And container z-index is set to appear above all other elements (z-index: 999999)
    And container reference is stored for subsequent beats
    And container created event renderx-web:telemetry:ghost-container-created is published

  # Beat 5.4: Render Template Preview
  Scenario: Beat 5.4 - Template content is rendered into ghost preview
    Given the ghost container is created (beat 5.3 complete)
    When the Telemetry movement beat 4 executes (render-template-preview)
    Then the source component template is cloned via library-component/drag.preview#renderTemplatePreview
    And cloned content is appended to the ghost container
    And styles from source are applied to preserve appearance
    And preview is rendered to match source appearance exactly
    And render completion event renderx-web:telemetry:template-preview-rendered is published

  # Beat 5.5: Apply Template Styles
  Scenario: Beat 5.5 - Styles are applied to maintain visual consistency in ghost preview
    Given the template preview is rendered (beat 5.4 complete)
    When the Telemetry movement beat 5 executes (apply-template-styles)
    Then computed styles from source component are extracted via library-component/drag.preview#applyTemplateStyles
    And styles are applied to ghost container (color, font, spacing, etc.)
    And opacity is reduced to 0.8 for drag indication
    And shadow effects are adjusted for visual depth
    And style application event renderx-web:telemetry:template-styles-applied is published

  # Beat 5.6: Compute Cursor Offsets
  Scenario: Beat 5.6 - Cursor offset from component origin is computed
    Given the ghost preview is styled (beat 5.5 complete)
    When the Telemetry movement beat 6 executes (compute-cursor-offsets)
    Then the offset between cursor and component top-left is calculated via library-component/drag.preview#computeCursorOffsets
    And offset accounts for scroll position and viewport transformations
    And offset is stored for positioning ghost under cursor during drag
    And offset computation event renderx-web:telemetry:cursor-offsets-computed is published
    And offset data is recorded in telemetry for performance analysis

  # Beat 5.7: Install Drag Image
  Scenario: Beat 5.7 - Drag image is installed to the DataTransfer object
    Given all ghost preview preparation is complete (beats 5.1-5.6 complete)
    When the Telemetry movement beat 7 executes (install-drag-image)
    Then the ghost container is converted to canvas image data via library-component/drag.preview#installDragImage
    And image is set as the drag image on the DataTransfer object
    And browser will display this image during drag operation
    And drag image installation event renderx-web:telemetry:complete is published
    And drag operation is now ready for user interaction

  # ══════════════════════════════════════════════════════════════════
  # MOVEMENT 6: RECOVERY & RESILIENCE SYMPHONY (Checkpoint)
  # ══════════════════════════════════════════════════════════════════

  Scenario: Movement 6 - Recovery Checkpoint Establishment
    Given all previous movements 1-5 have completed successfully
    And the application has reached a stable, consistent state
    When the Recovery movement executes checkpoint establishment
    Then the current system state is captured and stored
    And recovery checkpoint is registered with the recovery symphony
    And recovery data includes timestamp, state hash, and component registry
    And system is marked as ready for operation
    And recovery:enabled event renderx-web:recovery:enabled is published
    And the application can now gracefully recover from any future failures
    And execution logs and telemetry are archived

  # ══════════════════════════════════════════════════════════════════
  # COMPLETE ORCHESTRATION SCENARIOS
  # ══════════════════════════════════════════════════════════════════

  Scenario: Complete RenderX Web Master Orchestration - Happy Path
    Given the RenderX Web application deployment is triggered
    When the complete master orchestration sequence executes:
      | movement | beats | name |
      | 1 | 6 | Initialization |
      | 2 | 2 | Build |
      | 3 | 5 | Test & Validation |
      | 4 | 2 | Delivery |
      | 5 | 7 | Telemetry & Monitoring |
      | 6 | 1 | Recovery & Resilience |
    Then all 23 total beats complete successfully in sequence
    And all 6 movements execute in order without skipping
    And governance conformity score is ≥ 0.90
    And all events are published in correct sequence
    And complete execution telemetry is archived
    And application is ready for production or next deployment cycle
    And recovery checkpoint enables graceful failure recovery

  Scenario: Orchestration Fails When Movement 1 (Initialization) Fails
    Given the application startup sequence is triggered
    When the Initialization movement fails at beat 3 (init-control-panel)
    Then the failure is recorded with severity CRITICAL
    And initialization:failed event is emitted
    And subsequent movements do not execute
    And diagnostic information is captured (error stack, state)
    And recovery procedures are initiated
    And application reports initialization failure to monitoring system

  Scenario: Orchestration Performance Tracking
    Given performance profiling is enabled for all movements
    When the complete master orchestration executes
    Then each beat records start/end timestamps
    And each movement records total duration
    And beat execution times are compared to baseline
    And slow beats (> 100ms) are flagged for optimization
    And performance metrics are included in telemetry report
    And trend analysis identifies optimization opportunities

  Scenario: Concurrent Telemetry Collection During All Movements
    Given telemetry collection is enabled
    When all movements execute concurrently with telemetry
    Then user interaction events are captured in real-time
    And performance metrics are recorded per beat
    And error events are captured with full context
    And state transitions are logged with timestamps
    And memory usage is tracked across movements
    And telemetry data is aggregated for post-execution analysis
    And observability data supports debugging and optimization
