# AC-to-Test Implementation Validation Report

Domain: renderx-web-orchestration

## Summary

- Total tagged tests: 63
- Compliant (≥75% score): 63
- Partial (40-74% score): 0
- Non-compliant (<40% score): 0
- Invalid tags: 0
- Compliance rate: 100%

## Compliance Categories

### ✅ Compliant Tests (63)

- **tests\ui-event-wiring.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:5.4:1] (100%)
  - Given condition referenced: "the renderTemplatePreview operation is triggered"
  - When action referenced: "the handler executes"
  - Then assertion referenced: "it completes successfully within < 200ms"
  - And clause referenced: "the output is valid and meets schema"
  - And clause referenced: "any required events are published"

- **tests\ui-event-wiring.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:5.4:2] (100%)
  - Given condition referenced: "valid input parameters"
  - When action referenced: "renderTemplatePreview processes them"
  - Then assertion referenced: "results conform to expected schema"
  - And clause referenced: "no errors are thrown"
  - And clause referenced: "telemetry events are recorded with latency metrics"

- **tests\topics-manifest-guard.spec.ts** → [AC:renderx-web-orchestration:renderx-web-ac-alignment-workflow-v2:5.1:1] (100%)
  - Given condition referenced: "Computed presence and THEN coverage"
  - When action referenced: "reporter runs"
  - Then assertion referenced: "Artifacts saved under .generated/analysis/renderx-web-orchestration/*ac-alignment*"
  - Then assertion referenced: "Markdown report at docs/generated/renderx-web-orchestration/ac-alignment-report.md"

- **tests\symphonic-code-analysis-fractal.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:3.4:1] (100%)
  - Given condition referenced: "the ensureLineOverlayFor operation is triggered"
  - When action referenced: "the handler executes"
  - Then assertion referenced: "it completes successfully within < 1 second"
  - And clause referenced: "the output is valid and meets schema"
  - And clause referenced: "any required events are published"

- **tests\symphonic-code-analysis-fractal.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:3.4:2] (100%)
  - Given condition referenced: "valid input parameters"
  - When action referenced: "ensureLineOverlayFor processes them"
  - Then assertion referenced: "results conform to expected schema"
  - And clause referenced: "no errors are thrown"
  - And clause referenced: "telemetry events are recorded with latency metrics"

- **tests\stats-enhancements.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:1.3:1] (100%)
  - Given condition referenced: "configuration metadata"
  - When action referenced: "initConfig is called"
  - Then assertion referenced: "configuration is loaded within 200ms"
  - And clause referenced: "all fields are prepared for rendering"
  - And clause referenced: "validation rules are attached"

- **tests\stats-enhancements.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:1.3:2] (100%)
  - Given condition referenced: "complex nested configuration"
  - When action referenced: "initConfig processes it"
  - Then assertion referenced: "all nested sections are initialized"
  - And clause referenced: "dependencies between sections are resolved"
  - And clause referenced: "no circular dependencies cause deadlock"

- **tests\stats-enhancements.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:1.3:3] (100%)
  - Given condition referenced: "configuration with 100+ fields"
  - When action referenced: "initConfig prepares the form"
  - Then assertion referenced: "initialization completes within 300ms"
  - And clause referenced: "form is ready for user interaction"
  - And clause referenced: "memory usage scales linearly with field count"

- **tests\sequence-player-multi-sequence.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:1.6:1] (100%)
  - Given condition referenced: "the notifyReady operation is triggered"
  - When action referenced: "the handler executes"
  - Then assertion referenced: "it completes successfully within < 50ms"
  - And clause referenced: "the output is valid and meets schema"
  - And clause referenced: "any required events are published"

- **tests\sequence-player-multi-sequence.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:1.6:2] (100%)
  - Given condition referenced: "valid input parameters"
  - When action referenced: "notifyReady processes them"
  - Then assertion referenced: "results conform to expected schema"
  - And clause referenced: "no errors are thrown"
  - And clause referenced: "telemetry events are recorded with latency metrics"

- **tests\sequence-player-multi-sequence.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:1.6:3] (100%)
  - Given condition referenced: "error conditions"
  - When action referenced: "notifyReady encounters an error"
  - Then assertion referenced: "the error is logged with full context"
  - And clause referenced: "appropriate recovery is attempted"
  - And clause referenced: "the system remains stable"

- **tests\sequence-player-multi-sequence.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:1.6:4] (100%)
  - Given condition referenced: "performance SLA of < 50ms"
  - When action referenced: "notifyReady executes"
  - Then assertion referenced: "latency is consistently within target"
  - And clause referenced: "throughput meets baseline requirements"
  - And clause referenced: "resource usage stays within bounds"

- **tests\sequence-player-multi-sequence.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:1.6:5] (80%)
  - Given condition referenced: "compliance and governance"
  - When action referenced: "notifyReady operates"
  - Then assertion referenced: "all governance rules are enforced"
  - And clause referenced: "audit trails capture execution"

- **tests\sequence-player-integration.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:1.6:1] (100%)
  - Given condition referenced: "the notifyReady operation is triggered"
  - When action referenced: "the handler executes"
  - Then assertion referenced: "it completes successfully within < 50ms"
  - And clause referenced: "the output is valid and meets schema"
  - And clause referenced: "any required events are published"

- **tests\sequence-player-integration.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:1.6:2] (100%)
  - Given condition referenced: "valid input parameters"
  - When action referenced: "notifyReady processes them"
  - Then assertion referenced: "results conform to expected schema"
  - And clause referenced: "no errors are thrown"
  - And clause referenced: "telemetry events are recorded with latency metrics"

- **tests\sequence-player-integration.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:1.6:3] (100%)
  - Given condition referenced: "error conditions"
  - When action referenced: "notifyReady encounters an error"
  - Then assertion referenced: "the error is logged with full context"
  - And clause referenced: "appropriate recovery is attempted"
  - And clause referenced: "the system remains stable"

- **tests\sequence-player-integration.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:1.6:4] (100%)
  - Given condition referenced: "performance SLA of < 50ms"
  - When action referenced: "notifyReady executes"
  - Then assertion referenced: "latency is consistently within target"
  - And clause referenced: "throughput meets baseline requirements"
  - And clause referenced: "resource usage stays within bounds"

- **tests\sequence-player-integration.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:1.6:5] (100%)
  - Given condition referenced: "compliance and governance"
  - When action referenced: "notifyReady operates"
  - Then assertion referenced: "all governance rules are enforced"
  - And clause referenced: "audit trails capture execution"
  - And clause referenced: "no compliance violations occur"

- **tests\sequence-player-auto-convert.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:5.5:1] (100%)
  - Given condition referenced: "the applyTemplateStyles operation is triggered"
  - When action referenced: "the handler executes"
  - Then assertion referenced: "it completes successfully within < 1 second"
  - And clause referenced: "the output is valid and meets schema"
  - And clause referenced: "any required events are published"

- **tests\sequence-player-auto-convert.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:5.5:2] (100%)
  - Given condition referenced: "valid input parameters"
  - When action referenced: "applyTemplateStyles processes them"
  - Then assertion referenced: "results conform to expected schema"
  - And clause referenced: "no errors are thrown"
  - And clause referenced: "telemetry events are recorded with latency metrics"

- **tests\sequence-player-auto-convert.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:5.5:3] (100%)
  - Given condition referenced: "error conditions"
  - When action referenced: "applyTemplateStyles encounters an error"
  - Then assertion referenced: "the error is logged with full context"
  - And clause referenced: "appropriate recovery is attempted"
  - And clause referenced: "the system remains stable"

- **tests\sequence-player-auto-convert.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:5.5:4] (100%)
  - Given condition referenced: "performance SLA of < 1 second"
  - When action referenced: "applyTemplateStyles executes"
  - Then assertion referenced: "latency is consistently within target"
  - And clause referenced: "throughput meets baseline requirements"
  - And clause referenced: "resource usage stays within bounds"

- **tests\sequence-player-auto-convert.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:5.5:5] (100%)
  - Given condition referenced: "compliance and governance"
  - When action referenced: "applyTemplateStyles operates"
  - Then assertion referenced: "all governance rules are enforced"
  - And clause referenced: "audit trails capture execution"
  - And clause referenced: "no compliance violations occur"

- **tests\sequence-execution.service.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:1.6:1] (100%)
  - Given condition referenced: "the notifyReady operation is triggered"
  - When action referenced: "the handler executes"
  - Then assertion referenced: "it completes successfully within < 50ms"
  - And clause referenced: "the output is valid and meets schema"
  - And clause referenced: "any required events are published"

- **tests\sequence-execution.service.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:1.6:2] (100%)
  - Given condition referenced: "valid input parameters"
  - When action referenced: "notifyReady processes them"
  - Then assertion referenced: "results conform to expected schema"
  - And clause referenced: "no errors are thrown"
  - And clause referenced: "telemetry events are recorded with latency metrics"

- **tests\sequence-execution.service.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:1.6:3] (100%)
  - Given condition referenced: "error conditions"
  - When action referenced: "notifyReady encounters an error"
  - Then assertion referenced: "the error is logged with full context"
  - And clause referenced: "appropriate recovery is attempted"
  - And clause referenced: "the system remains stable"

- **tests\sequence-execution.service.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:1.6:4] (100%)
  - Given condition referenced: "performance SLA of < 50ms"
  - When action referenced: "notifyReady executes"
  - Then assertion referenced: "latency is consistently within target"
  - And clause referenced: "throughput meets baseline requirements"
  - And clause referenced: "resource usage stays within bounds"

- **tests\sequence-execution.service.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:1.6:5] (100%)
  - Given condition referenced: "compliance and governance"
  - When action referenced: "notifyReady operates"
  - Then assertion referenced: "all governance rules are enforced"
  - And clause referenced: "audit trails capture execution"
  - And clause referenced: "no compliance violations occur"

- **tests\select.overlay.helpers.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:3.1:1] (100%)
  - Given condition referenced: "the showSelectionOverlay operation is triggered"
  - When action referenced: "the handler executes"
  - Then assertion referenced: "it completes successfully within < 200ms"
  - And clause referenced: "the output is valid and meets schema"
  - And clause referenced: "any required events are published"

- **tests\select.overlay.dom.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:3.1:1] (100%)
  - Given condition referenced: "the showSelectionOverlay operation is triggered"
  - When action referenced: "the handler executes"
  - Then assertion referenced: "it completes successfully within < 200ms"
  - And clause referenced: "the output is valid and meets schema"
  - And clause referenced: "any required events are published"

- **tests\scene-5-destination.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:1.5:1] (100%)
  - Given condition referenced: "the registerObservers operation is triggered"
  - When action referenced: "the handler executes"
  - Then assertion referenced: "it completes successfully within < 1 second"
  - And clause referenced: "the output is valid and meets schema"
  - And clause referenced: "any required events are published"

- **tests\scene-4-transfer-hub.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:1.5:1] (100%)
  - Given condition referenced: "the registerObservers operation is triggered"
  - When action referenced: "the handler executes"
  - Then assertion referenced: "it completes successfully within < 1 second"
  - And clause referenced: "the output is valid and meets schema"
  - And clause referenced: "any required events are published"

- **tests\scene-3-subscribers.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:1.5:1] (100%)
  - Given condition referenced: "the registerObservers operation is triggered"
  - When action referenced: "the handler executes"
  - Then assertion referenced: "it completes successfully within < 1 second"
  - And clause referenced: "the output is valid and meets schema"
  - And clause referenced: "any required events are published"

- **tests\renderx-web-orchestration-sequences-validation.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:5.4:1] (100%)
  - Given condition referenced: "the renderTemplatePreview operation is triggered"
  - When action referenced: "the handler executes"
  - Then assertion referenced: "it completes successfully within < 200ms"
  - And clause referenced: "the output is valid and meets schema"
  - And clause referenced: "any required events are published"

- **tests\renderx-web-orchestration-sequences-validation.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:5.4:2] (100%)
  - Given condition referenced: "valid input parameters"
  - When action referenced: "renderTemplatePreview processes them"
  - Then assertion referenced: "results conform to expected schema"
  - And clause referenced: "no errors are thrown"
  - And clause referenced: "telemetry events are recorded with latency metrics"

- **tests\renderx-web-orchestration-sequences-validation.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:5.4:3] (100%)
  - Given condition referenced: "error conditions"
  - When action referenced: "renderTemplatePreview encounters an error"
  - Then assertion referenced: "the error is logged with full context"
  - And clause referenced: "appropriate recovery is attempted"
  - And clause referenced: "the system remains stable"

- **tests\renderx-web-orchestration-conflation.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:5.4:1] (100%)
  - Given condition referenced: "the renderTemplatePreview operation is triggered"
  - When action referenced: "the handler executes"
  - Then assertion referenced: "it completes successfully within < 200ms"
  - And clause referenced: "the output is valid and meets schema"
  - And clause referenced: "any required events are published"

- **tests\react-component-validation-e2e.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:1.1:1] (100%)
  - Given condition referenced: "the theme system is initialized"
  - When action referenced: "getCurrentTheme is called"
  - Then assertion referenced: "current theme (dark/light) is returned within 10ms"
  - And clause referenced: "theme preference from localStorage is respected"
  - And clause referenced: "default theme is applied if no preference exists"

- **tests\react-component-validation-e2e.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:1.1:2] (100%)
  - Given condition referenced: "user has theme preference saved"
  - When action referenced: "getCurrentTheme executes"
  - Then assertion referenced: "saved preference is returned"
  - And clause referenced: "the response includes theme metadata (colors, fonts)"
  - And clause referenced: "no API calls are made (cached lookup)"

- **tests\react-component-validation-e2e.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:1.1:3] (100%)
  - Given condition referenced: "theme system encounters error"
  - When action referenced: "getCurrentTheme fails"
  - Then assertion referenced: "fallback default theme is returned"
  - And clause referenced: "error is logged for monitoring"
  - And clause referenced: "system remains functional"

- **tests\react-component-theme-toggle.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:1.1:1] (100%)
  - Given condition referenced: "the theme system is initialized"
  - When action referenced: "getCurrentTheme is called"
  - Then assertion referenced: "current theme (dark/light) is returned within 10ms"
  - And clause referenced: "theme preference from localStorage is respected"
  - And clause referenced: "default theme is applied if no preference exists"

- **tests\react-component-theme-toggle.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:1.1:2] (100%)
  - Given condition referenced: "user has theme preference saved"
  - When action referenced: "getCurrentTheme executes"
  - Then assertion referenced: "saved preference is returned"
  - And clause referenced: "the response includes theme metadata (colors, fonts)"
  - And clause referenced: "no API calls are made (cached lookup)"

- **tests\react-component-theme-toggle-e2e.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:1.1:1] (100%)
  - Given condition referenced: "the theme system is initialized"
  - When action referenced: "getCurrentTheme is called"
  - Then assertion referenced: "current theme (dark/light) is returned within 10ms"
  - And clause referenced: "theme preference from localStorage is respected"
  - And clause referenced: "default theme is applied if no preference exists"

- **tests\react-component-theme-toggle-e2e.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:1.1:2] (100%)
  - Given condition referenced: "user has theme preference saved"
  - When action referenced: "getCurrentTheme executes"
  - Then assertion referenced: "saved preference is returned"
  - And clause referenced: "the response includes theme metadata (colors, fonts)"
  - And clause referenced: "no API calls are made (cached lookup)"

- **tests\react-component-theme-toggle-e2e.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:1.1:3] (100%)
  - Given condition referenced: "theme system encounters error"
  - When action referenced: "getCurrentTheme fails"
  - Then assertion referenced: "fallback default theme is returned"
  - And clause referenced: "error is logged for monitoring"
  - And clause referenced: "system remains functional"

- **tests\react-component-e2e.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:5.4:1] (100%)
  - Given condition referenced: "the renderTemplatePreview operation is triggered"
  - When action referenced: "the handler executes"
  - Then assertion referenced: "it completes successfully within < 200ms"
  - And clause referenced: "the output is valid and meets schema"
  - And clause referenced: "any required events are published"

- **tests\react-component-e2e.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:3.1:1] (100%)
  - Given condition referenced: "the showSelectionOverlay operation is triggered"
  - When action referenced: "the handler executes"
  - Then assertion referenced: "it completes successfully within < 200ms"
  - And clause referenced: "the output is valid and meets schema"
  - And clause referenced: "any required events are published"

- **tests\react-component-e2e.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:5.4:2] (100%)
  - Given condition referenced: "valid input parameters"
  - When action referenced: "renderTemplatePreview processes them"
  - Then assertion referenced: "results conform to expected schema"
  - And clause referenced: "no errors are thrown"
  - And clause referenced: "telemetry events are recorded with latency metrics"

- **tests\react-component-communication.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:5.4:1] (100%)
  - Given condition referenced: "the renderTemplatePreview operation is triggered"
  - When action referenced: "the handler executes"
  - Then assertion referenced: "it completes successfully within < 200ms"
  - And clause referenced: "the output is valid and meets schema"
  - And clause referenced: "any required events are published"

- **tests\react-component-communication.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:5.4:2] (100%)
  - Given condition referenced: "valid input parameters"
  - When action referenced: "renderTemplatePreview processes them"
  - Then assertion referenced: "results conform to expected schema"
  - And clause referenced: "no errors are thrown"
  - And clause referenced: "telemetry events are recorded with latency metrics"

- **tests\placeholder.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:5.7:1] (100%)
  - Given condition referenced: "the installDragImage operation is triggered"
  - When action referenced: "the handler executes"
  - Then assertion referenced: "it completes successfully within < 1 second"
  - And clause referenced: "the output is valid and meets schema"
  - And clause referenced: "any required events are published"

- **tests\orchestration-registry-completeness.spec.ts** → [AC:renderx-web-orchestration:renderx-web-ac-alignment-workflow-v2:1.1:1] (100%)
  - Given condition referenced: "ACs are present as acceptanceCriteriaStructured in sequence JSON"
  - When action referenced: "the generator runs over renderx-web-orchestration"
  - Then assertion referenced: "It emits .generated/acs/renderx-web-orchestration.registry.json"
  - Then assertion referenced: "Each AC entry has stable AC ID and normalized GWT"
  - Then assertion referenced: "Beat and sequence IDs are preserved"

- **tests\no-local-control-panel-sequences.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:1.3:1] (100%)
  - Given condition referenced: "configuration metadata"
  - When action referenced: "initConfig is called"
  - Then assertion referenced: "configuration is loaded within 200ms"
  - And clause referenced: "all fields are prepared for rendering"
  - And clause referenced: "validation rules are attached"

- **tests\musical-sequence-schema.spec.ts** → [AC:renderx-web-orchestration:renderx-web-ac-alignment-workflow-v2:1.1:1] (100%)
  - Given condition referenced: "ACs are present as acceptanceCriteriaStructured in sequence JSON"
  - When action referenced: "the generator runs over renderx-web-orchestration"
  - Then assertion referenced: "It emits .generated/acs/renderx-web-orchestration.registry.json"
  - Then assertion referenced: "Each AC entry has stable AC ID and normalized GWT"
  - Then assertion referenced: "Beat and sequence IDs are preserved"

- **tests\integrated-scene-1-2.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:1.5:1] (100%)
  - Given condition referenced: "the registerObservers operation is triggered"
  - When action referenced: "the handler executes"
  - Then assertion referenced: "it completes successfully within < 1 second"
  - And clause referenced: "the output is valid and meets schema"
  - And clause referenced: "any required events are published"

- **tests\host-sdk.v1.spec.ts** → [AC:renderx-web-orchestration:renderx-web-ac-alignment-workflow-v2:1.1:1] (100%)
  - Given condition referenced: "ACs are present as acceptanceCriteriaStructured in sequence JSON"
  - When action referenced: "the generator runs over renderx-web-orchestration"
  - Then assertion referenced: "It emits .generated/acs/renderx-web-orchestration.registry.json"
  - Then assertion referenced: "Each AC entry has stable AC ID and normalized GWT"
  - Then assertion referenced: "Beat and sequence IDs are preserved"

- **tests\event-route-onepage.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:1.5:1] (100%)
  - Given condition referenced: "the registerObservers operation is triggered"
  - When action referenced: "the handler executes"
  - Then assertion referenced: "it completes successfully within < 1 second"
  - And clause referenced: "the output is valid and meets schema"
  - And clause referenced: "any required events are published"

- **tests\domain-registry-orchestration-spike.spec.ts** → [AC:renderx-web-orchestration:renderx-web-ac-alignment-workflow-v2:1.1:1] (100%)
  - Given condition referenced: "ACs are present as acceptanceCriteriaStructured in sequence JSON"
  - When action referenced: "the generator runs over renderx-web-orchestration"
  - Then assertion referenced: "It emits .generated/acs/renderx-web-orchestration.registry.json"
  - Then assertion referenced: "Each AC entry has stable AC ID and normalized GWT"
  - Then assertion referenced: "Beat and sequence IDs are preserved"

- **tests\domain-registry-orchestration-invariants.spec.ts** → [AC:renderx-web-orchestration:renderx-web-ac-alignment-workflow-v2:1.1:1] (100%)
  - Given condition referenced: "ACs are present as acceptanceCriteriaStructured in sequence JSON"
  - When action referenced: "the generator runs over renderx-web-orchestration"
  - Then assertion referenced: "It emits .generated/acs/renderx-web-orchestration.registry.json"
  - Then assertion referenced: "Each AC entry has stable AC ID and normalized GWT"
  - Then assertion referenced: "Beat and sequence IDs are preserved"

- **tests\digital-assets.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:5.3:1] (100%)
  - Given condition referenced: "the createGhostContainer operation is triggered"
  - When action referenced: "the handler executes"
  - Then assertion referenced: "it completes successfully within < 2 seconds"
  - And clause referenced: "the output is valid and meets schema"
  - And clause referenced: "any required events are published"

- **tests\diagnostics-eventTap.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:3.5:1] (100%)
  - Given condition referenced: "a class change operation completes"
  - When action referenced: "notifyUi is invoked with change details"
  - Then assertion referenced: "an event is published to the central EventRouter within 5ms"
  - And clause referenced: "the event contains element ID, action (add/remove), and class name"
  - And clause referenced: "the event is stamped with microsecond-precision timestamp"

- **tests\diagnostics-eventTap.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:3.5:2] (100%)
  - Given condition referenced: "multiple class operations occur in sequence"
  - When action referenced: "notifyUi publishes events"
  - Then assertion referenced: "events are queued in FIFO order"
  - And clause referenced: "subscribers receive events in the order they occurred"
  - And clause referenced: "no events are dropped or duplicated"

- **tests\diagnostics-eventTap.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:3.5:3] (100%)
  - Given condition referenced: "a subscriber is registered for UI change events"
  - When action referenced: "notifyUi publishes"
  - Then assertion referenced: "the subscriber receives the event within 20ms"
  - And clause referenced: "the subscriber can act on the notification"
  - And clause referenced: "multiple subscribers can consume the same event"

### ⚠️ Partial Compliance (0)

No partially compliant tests.

### ❌ Non-Compliant Tests (0)

No non-compliant tests.

### 🚫 Invalid Tags (0)

No invalid tags.

## 🎯 Top Offenders (ACs with Most Non-Compliant Tests)

No recurring issues found.

## ⚡ Quick Wins (Tests Missing 1-2 Requirements)

No quick wins identified.

## Next Steps

1. **Quick Wins**: Fix tests missing 1-2 requirements (0 tests)
2. **Top Offenders**: Focus on ACs with multiple non-compliant tests
3. **Partial Compliance**: Address 0 partial tests
4. **Generate New Tests**: Cover 74 uncovered ACs
