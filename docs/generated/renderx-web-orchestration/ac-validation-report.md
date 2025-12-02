# AC-to-Test Implementation Validation Report

Domain: renderx-web-orchestration

## Summary

- Total tagged tests: 132
- Compliant (≥75% score): 35
- Partial (40-74% score): 46
- Non-compliant (<40% score): 49
- Invalid tags: 2
- Compliance rate: 27%

## Compliance Categories

### ✅ Compliant Tests (35)

- **tests\topics-manifest-guard.spec.ts** → [AC:renderx-web-orchestration:renderx-web-ac-alignment-workflow-v2:5.1:1] (75%)
  - Given condition referenced: "Computed presence and THEN coverage"
  - Then assertion referenced: "Artifacts saved under .generated/analysis/renderx-web-orchestration/*ac-alignment*"
  - Then assertion referenced: "Markdown report at docs/generated/renderx-web-orchestration/ac-alignment-report.md"

- **tests\renderx-web-orchestration-sequences-validation.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:5.4:2] (80%)
  - Given condition referenced: "valid input parameters"
  - When action referenced: "renderTemplatePreview processes them"
  - Then assertion referenced: "results conform to expected schema"
  - And clause referenced: "no errors are thrown"

- **tests\renderx-web-orchestration-sequences-validation.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:5.4:2] (80%)
  - Given condition referenced: "valid input parameters"
  - When action referenced: "renderTemplatePreview processes them"
  - Then assertion referenced: "results conform to expected schema"
  - And clause referenced: "no errors are thrown"

- **tests\react-component-validation-e2e.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:1.1:1] (80%)
  - Given condition referenced: "the theme system is initialized"
  - Then assertion referenced: "current theme (dark/light) is returned within 10ms"
  - And clause referenced: "theme preference from localStorage is respected"
  - And clause referenced: "default theme is applied if no preference exists"

- **tests\react-component-validation-e2e.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:1.1:1] (80%)
  - Given condition referenced: "the theme system is initialized"
  - Then assertion referenced: "current theme (dark/light) is returned within 10ms"
  - And clause referenced: "theme preference from localStorage is respected"
  - And clause referenced: "default theme is applied if no preference exists"

- **tests\react-component-theme-toggle.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:1.1:1] (100%)
  - Given condition referenced: "the theme system is initialized"
  - When action referenced: "getCurrentTheme is called"
  - Then assertion referenced: "current theme (dark/light) is returned within 10ms"
  - And clause referenced: "theme preference from localStorage is respected"
  - And clause referenced: "default theme is applied if no preference exists"

- **tests\react-component-theme-toggle.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:1.1:1] (100%)
  - Given condition referenced: "the theme system is initialized"
  - When action referenced: "getCurrentTheme is called"
  - Then assertion referenced: "current theme (dark/light) is returned within 10ms"
  - And clause referenced: "theme preference from localStorage is respected"
  - And clause referenced: "default theme is applied if no preference exists"

- **tests\react-component-theme-toggle.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:1.1:1] (100%)
  - Given condition referenced: "the theme system is initialized"
  - When action referenced: "getCurrentTheme is called"
  - Then assertion referenced: "current theme (dark/light) is returned within 10ms"
  - And clause referenced: "theme preference from localStorage is respected"
  - And clause referenced: "default theme is applied if no preference exists"

- **tests\react-component-theme-toggle-e2e.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:1.1:1] (100%)
  - Given condition referenced: "the theme system is initialized"
  - When action referenced: "getCurrentTheme is called"
  - Then assertion referenced: "current theme (dark/light) is returned within 10ms"
  - And clause referenced: "theme preference from localStorage is respected"
  - And clause referenced: "default theme is applied if no preference exists"

- **tests\react-component-theme-toggle-e2e.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:1.1:1] (100%)
  - Given condition referenced: "the theme system is initialized"
  - When action referenced: "getCurrentTheme is called"
  - Then assertion referenced: "current theme (dark/light) is returned within 10ms"
  - And clause referenced: "theme preference from localStorage is respected"
  - And clause referenced: "default theme is applied if no preference exists"

- **tests\orchestration-registry-completeness.spec.ts** → [AC:renderx-web-orchestration:renderx-web-ac-alignment-workflow-v2:1.1:1] (100%)
  - Given condition referenced: "ACs are present as acceptanceCriteriaStructured in sequence JSON"
  - When action referenced: "the generator runs over renderx-web-orchestration"
  - Then assertion referenced: "It emits .generated/acs/renderx-web-orchestration.registry.json"
  - Then assertion referenced: "Each AC entry has stable AC ID and normalized GWT"
  - Then assertion referenced: "Beat and sequence IDs are preserved"

- **tests\orchestration-registry-completeness.spec.ts** → [AC:renderx-web-orchestration:renderx-web-ac-alignment-workflow-v2:1.1:1] (100%)
  - Given condition referenced: "ACs are present as acceptanceCriteriaStructured in sequence JSON"
  - When action referenced: "the generator runs over renderx-web-orchestration"
  - Then assertion referenced: "It emits .generated/acs/renderx-web-orchestration.registry.json"
  - Then assertion referenced: "Each AC entry has stable AC ID and normalized GWT"
  - Then assertion referenced: "Beat and sequence IDs are preserved"

- **tests\orchestration-registry-completeness.spec.ts** → [AC:renderx-web-orchestration:renderx-web-ac-alignment-workflow-v2:1.1:1] (100%)
  - Given condition referenced: "ACs are present as acceptanceCriteriaStructured in sequence JSON"
  - When action referenced: "the generator runs over renderx-web-orchestration"
  - Then assertion referenced: "It emits .generated/acs/renderx-web-orchestration.registry.json"
  - Then assertion referenced: "Each AC entry has stable AC ID and normalized GWT"
  - Then assertion referenced: "Beat and sequence IDs are preserved"

- **tests\orchestration-registry-completeness.spec.ts** → [AC:renderx-web-orchestration:renderx-web-ac-alignment-workflow-v2:1.1:1] (100%)
  - Given condition referenced: "ACs are present as acceptanceCriteriaStructured in sequence JSON"
  - When action referenced: "the generator runs over renderx-web-orchestration"
  - Then assertion referenced: "It emits .generated/acs/renderx-web-orchestration.registry.json"
  - Then assertion referenced: "Each AC entry has stable AC ID and normalized GWT"
  - Then assertion referenced: "Beat and sequence IDs are preserved"

- **tests\orchestration-registry-completeness.spec.ts** → [AC:renderx-web-orchestration:renderx-web-ac-alignment-workflow-v2:1.1:1] (100%)
  - Given condition referenced: "ACs are present as acceptanceCriteriaStructured in sequence JSON"
  - When action referenced: "the generator runs over renderx-web-orchestration"
  - Then assertion referenced: "It emits .generated/acs/renderx-web-orchestration.registry.json"
  - Then assertion referenced: "Each AC entry has stable AC ID and normalized GWT"
  - Then assertion referenced: "Beat and sequence IDs are preserved"

- **tests\orchestration-registry-completeness.spec.ts** → [AC:renderx-web-orchestration:renderx-web-ac-alignment-workflow-v2:1.1:1] (100%)
  - Given condition referenced: "ACs are present as acceptanceCriteriaStructured in sequence JSON"
  - When action referenced: "the generator runs over renderx-web-orchestration"
  - Then assertion referenced: "It emits .generated/acs/renderx-web-orchestration.registry.json"
  - Then assertion referenced: "Each AC entry has stable AC ID and normalized GWT"
  - Then assertion referenced: "Beat and sequence IDs are preserved"

- **tests\orchestration-registry-completeness.spec.ts** → [AC:renderx-web-orchestration:renderx-web-ac-alignment-workflow-v2:1.1:1] (100%)
  - Given condition referenced: "ACs are present as acceptanceCriteriaStructured in sequence JSON"
  - When action referenced: "the generator runs over renderx-web-orchestration"
  - Then assertion referenced: "It emits .generated/acs/renderx-web-orchestration.registry.json"
  - Then assertion referenced: "Each AC entry has stable AC ID and normalized GWT"
  - Then assertion referenced: "Beat and sequence IDs are preserved"

- **tests\orchestration-registry-completeness.spec.ts** → [AC:renderx-web-orchestration:renderx-web-ac-alignment-workflow-v2:1.1:1] (100%)
  - Given condition referenced: "ACs are present as acceptanceCriteriaStructured in sequence JSON"
  - When action referenced: "the generator runs over renderx-web-orchestration"
  - Then assertion referenced: "It emits .generated/acs/renderx-web-orchestration.registry.json"
  - Then assertion referenced: "Each AC entry has stable AC ID and normalized GWT"
  - Then assertion referenced: "Beat and sequence IDs are preserved"

- **tests\orchestration-registry-completeness.spec.ts** → [AC:renderx-web-orchestration:renderx-web-ac-alignment-workflow-v2:1.1:1] (100%)
  - Given condition referenced: "ACs are present as acceptanceCriteriaStructured in sequence JSON"
  - When action referenced: "the generator runs over renderx-web-orchestration"
  - Then assertion referenced: "It emits .generated/acs/renderx-web-orchestration.registry.json"
  - Then assertion referenced: "Each AC entry has stable AC ID and normalized GWT"
  - Then assertion referenced: "Beat and sequence IDs are preserved"

- **tests\orchestration-registry-completeness.spec.ts** → [AC:renderx-web-orchestration:renderx-web-ac-alignment-workflow-v2:1.1:1] (100%)
  - Given condition referenced: "ACs are present as acceptanceCriteriaStructured in sequence JSON"
  - When action referenced: "the generator runs over renderx-web-orchestration"
  - Then assertion referenced: "It emits .generated/acs/renderx-web-orchestration.registry.json"
  - Then assertion referenced: "Each AC entry has stable AC ID and normalized GWT"
  - Then assertion referenced: "Beat and sequence IDs are preserved"

- **tests\orchestration-registry-completeness.spec.ts** → [AC:renderx-web-orchestration:renderx-web-ac-alignment-workflow-v2:1.1:1] (100%)
  - Given condition referenced: "ACs are present as acceptanceCriteriaStructured in sequence JSON"
  - When action referenced: "the generator runs over renderx-web-orchestration"
  - Then assertion referenced: "It emits .generated/acs/renderx-web-orchestration.registry.json"
  - Then assertion referenced: "Each AC entry has stable AC ID and normalized GWT"
  - Then assertion referenced: "Beat and sequence IDs are preserved"

- **tests\musical-sequence-schema.spec.ts** → [AC:renderx-web-orchestration:renderx-web-ac-alignment-workflow-v2:1.1:1] (100%)
  - Given condition referenced: "ACs are present as acceptanceCriteriaStructured in sequence JSON"
  - When action referenced: "the generator runs over renderx-web-orchestration"
  - Then assertion referenced: "It emits .generated/acs/renderx-web-orchestration.registry.json"
  - Then assertion referenced: "Each AC entry has stable AC ID and normalized GWT"
  - Then assertion referenced: "Beat and sequence IDs are preserved"

- **tests\musical-sequence-schema.spec.ts** → [AC:renderx-web-orchestration:renderx-web-ac-alignment-workflow-v2:1.1:1] (100%)
  - Given condition referenced: "ACs are present as acceptanceCriteriaStructured in sequence JSON"
  - When action referenced: "the generator runs over renderx-web-orchestration"
  - Then assertion referenced: "It emits .generated/acs/renderx-web-orchestration.registry.json"
  - Then assertion referenced: "Each AC entry has stable AC ID and normalized GWT"
  - Then assertion referenced: "Beat and sequence IDs are preserved"

- **tests\musical-sequence-schema.spec.ts** → [AC:renderx-web-orchestration:renderx-web-ac-alignment-workflow-v2:1.1:1] (100%)
  - Given condition referenced: "ACs are present as acceptanceCriteriaStructured in sequence JSON"
  - When action referenced: "the generator runs over renderx-web-orchestration"
  - Then assertion referenced: "It emits .generated/acs/renderx-web-orchestration.registry.json"
  - Then assertion referenced: "Each AC entry has stable AC ID and normalized GWT"
  - Then assertion referenced: "Beat and sequence IDs are preserved"

- **tests\musical-sequence-schema.spec.ts** → [AC:renderx-web-orchestration:renderx-web-ac-alignment-workflow-v2:1.1:1] (100%)
  - Given condition referenced: "ACs are present as acceptanceCriteriaStructured in sequence JSON"
  - When action referenced: "the generator runs over renderx-web-orchestration"
  - Then assertion referenced: "It emits .generated/acs/renderx-web-orchestration.registry.json"
  - Then assertion referenced: "Each AC entry has stable AC ID and normalized GWT"
  - Then assertion referenced: "Beat and sequence IDs are preserved"

- **tests\musical-sequence-schema.spec.ts** → [AC:renderx-web-orchestration:renderx-web-ac-alignment-workflow-v2:1.1:1] (100%)
  - Given condition referenced: "ACs are present as acceptanceCriteriaStructured in sequence JSON"
  - When action referenced: "the generator runs over renderx-web-orchestration"
  - Then assertion referenced: "It emits .generated/acs/renderx-web-orchestration.registry.json"
  - Then assertion referenced: "Each AC entry has stable AC ID and normalized GWT"
  - Then assertion referenced: "Beat and sequence IDs are preserved"

- **tests\musical-sequence-schema.spec.ts** → [AC:renderx-web-orchestration:renderx-web-ac-alignment-workflow-v2:1.1:1] (100%)
  - Given condition referenced: "ACs are present as acceptanceCriteriaStructured in sequence JSON"
  - When action referenced: "the generator runs over renderx-web-orchestration"
  - Then assertion referenced: "It emits .generated/acs/renderx-web-orchestration.registry.json"
  - Then assertion referenced: "Each AC entry has stable AC ID and normalized GWT"
  - Then assertion referenced: "Beat and sequence IDs are preserved"

- **tests\domain-registry-orchestration-spike.spec.ts** → [AC:renderx-web-orchestration:renderx-web-ac-alignment-workflow-v2:1.1:1] (100%)
  - Given condition referenced: "ACs are present as acceptanceCriteriaStructured in sequence JSON"
  - When action referenced: "the generator runs over renderx-web-orchestration"
  - Then assertion referenced: "It emits .generated/acs/renderx-web-orchestration.registry.json"
  - Then assertion referenced: "Each AC entry has stable AC ID and normalized GWT"
  - Then assertion referenced: "Beat and sequence IDs are preserved"

- **tests\domain-registry-orchestration-spike.spec.ts** → [AC:renderx-web-orchestration:renderx-web-ac-alignment-workflow-v2:1.1:1] (100%)
  - Given condition referenced: "ACs are present as acceptanceCriteriaStructured in sequence JSON"
  - When action referenced: "the generator runs over renderx-web-orchestration"
  - Then assertion referenced: "It emits .generated/acs/renderx-web-orchestration.registry.json"
  - Then assertion referenced: "Each AC entry has stable AC ID and normalized GWT"
  - Then assertion referenced: "Beat and sequence IDs are preserved"

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

- **tests\domain-registry-orchestration-invariants.spec.ts** → [AC:renderx-web-orchestration:renderx-web-ac-alignment-workflow-v2:1.1:1] (100%)
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

- **tests\domain-registry-orchestration-invariants.spec.ts** → [AC:renderx-web-orchestration:renderx-web-ac-alignment-workflow-v2:1.1:1] (100%)
  - Given condition referenced: "ACs are present as acceptanceCriteriaStructured in sequence JSON"
  - When action referenced: "the generator runs over renderx-web-orchestration"
  - Then assertion referenced: "It emits .generated/acs/renderx-web-orchestration.registry.json"
  - Then assertion referenced: "Each AC entry has stable AC ID and normalized GWT"
  - Then assertion referenced: "Beat and sequence IDs are preserved"

- **tests\diagnostics-eventTap.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:3.5:2] (100%)
  - Given condition referenced: "multiple class operations occur in sequence"
  - When action referenced: "notifyUi publishes events"
  - Then assertion referenced: "events are queued in FIFO order"
  - And clause referenced: "subscribers receive events in the order they occurred"
  - And clause referenced: "no events are dropped or duplicated"

### ⚠️ Partial Compliance (46)

- **tests\ui-event-wiring.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:5.4:1] (40%)
  - Issues:
    - Missing Given setup: "the renderTemplatePreview operation is triggered"
    - Missing When action: "the handler executes"
    - Missing Then assertion: "it completes successfully within < 200ms"

- **tests\ui-event-wiring.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:5.4:1] (40%)
  - Issues:
    - Missing Given setup: "the renderTemplatePreview operation is triggered"
    - Missing When action: "the handler executes"
    - Missing Then assertion: "it completes successfully within < 200ms"

- **tests\symphonic-code-analysis-fractal.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:3.4:2] (40%)
  - Issues:
    - Missing Given setup: "valid input parameters"
    - Missing When action: "ensureLineOverlayFor processes them"
    - Missing And clause: "no errors are thrown"

- **tests\symphonic-code-analysis-fractal.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:3.4:2] (40%)
  - Issues:
    - Missing Given setup: "valid input parameters"
    - Missing When action: "ensureLineOverlayFor processes them"
    - Missing And clause: "no errors are thrown"

- **tests\sequence-player-multi-sequence.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:1.6:3] (60%)
  - Issues:
    - Missing And clause: "appropriate recovery is attempted"
    - Missing And clause: "the system remains stable"

- **tests\sequence-player-multi-sequence.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:1.6:5] (60%)
  - Issues:
    - Missing When action: "notifyReady operates"
    - Missing And clause: "no compliance violations occur"

- **tests\sequence-player-integration.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:1.6:5] (60%)
  - Issues:
    - Missing When action: "notifyReady operates"
    - Missing And clause: "no compliance violations occur"

- **tests\sequence-player-auto-convert.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:5.5:1] (40%)
  - Issues:
    - Missing Given setup: "the applyTemplateStyles operation is triggered"
    - Missing When action: "the handler executes"
    - Missing And clause: "any required events are published"

- **tests\sequence-player-auto-convert.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:5.5:3] (60%)
  - Issues:
    - Missing And clause: "appropriate recovery is attempted"
    - Missing And clause: "the system remains stable"

- **tests\sequence-player-auto-convert.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:5.5:5] (60%)
  - Issues:
    - Missing When action: "applyTemplateStyles operates"
    - Missing And clause: "no compliance violations occur"

- **tests\sequence-player-auto-convert.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:5.5:1] (40%)
  - Issues:
    - Missing Given setup: "the applyTemplateStyles operation is triggered"
    - Missing When action: "the handler executes"
    - Missing And clause: "any required events are published"

- **tests\sequence-player-auto-convert.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:5.5:3] (60%)
  - Issues:
    - Missing And clause: "appropriate recovery is attempted"
    - Missing And clause: "the system remains stable"

- **tests\sequence-execution.service.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:1.6:1] (40%)
  - Issues:
    - Missing Given setup: "the notifyReady operation is triggered"
    - Missing When action: "the handler executes"
    - Missing Then assertion: "it completes successfully within < 50ms"

- **tests\sequence-execution.service.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:1.6:3] (60%)
  - Issues:
    - Missing And clause: "appropriate recovery is attempted"
    - Missing And clause: "the system remains stable"

- **tests\sequence-execution.service.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:1.6:5] (60%)
  - Issues:
    - Missing When action: "notifyReady operates"
    - Missing And clause: "no compliance violations occur"

- **tests\sequence-execution.service.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:1.6:1] (40%)
  - Issues:
    - Missing Given setup: "the notifyReady operation is triggered"
    - Missing When action: "the handler executes"
    - Missing Then assertion: "it completes successfully within < 50ms"

- **tests\sequence-execution.service.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:1.6:3] (60%)
  - Issues:
    - Missing And clause: "appropriate recovery is attempted"
    - Missing And clause: "the system remains stable"

- **tests\sequence-execution.service.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:1.6:5] (60%)
  - Issues:
    - Missing When action: "notifyReady operates"
    - Missing And clause: "no compliance violations occur"

- **tests\sequence-execution.service.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:1.6:1] (40%)
  - Issues:
    - Missing Given setup: "the notifyReady operation is triggered"
    - Missing When action: "the handler executes"
    - Missing Then assertion: "it completes successfully within < 50ms"

- **tests\sequence-execution.service.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:1.6:3] (60%)
  - Issues:
    - Missing And clause: "appropriate recovery is attempted"
    - Missing And clause: "the system remains stable"

- **tests\sequence-execution.service.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:1.6:5] (60%)
  - Issues:
    - Missing When action: "notifyReady operates"
    - Missing And clause: "no compliance violations occur"

- **tests\sequence-execution.service.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:1.6:1] (40%)
  - Issues:
    - Missing Given setup: "the notifyReady operation is triggered"
    - Missing When action: "the handler executes"
    - Missing Then assertion: "it completes successfully within < 50ms"

- **tests\sequence-execution.service.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:1.6:3] (60%)
  - Issues:
    - Missing And clause: "appropriate recovery is attempted"
    - Missing And clause: "the system remains stable"

- **tests\sequence-execution.service.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:1.6:5] (60%)
  - Issues:
    - Missing When action: "notifyReady operates"
    - Missing And clause: "no compliance violations occur"

- **tests\sequence-execution.service.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:1.6:1] (40%)
  - Issues:
    - Missing Given setup: "the notifyReady operation is triggered"
    - Missing When action: "the handler executes"
    - Missing Then assertion: "it completes successfully within < 50ms"

- **tests\renderx-web-orchestration-sequences-validation.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:5.4:1] (60%)
  - Issues:
    - Missing Given setup: "the renderTemplatePreview operation is triggered"
    - Missing Then assertion: "it completes successfully within < 200ms"

- **tests\renderx-web-orchestration-sequences-validation.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:5.4:1] (60%)
  - Issues:
    - Missing Given setup: "the renderTemplatePreview operation is triggered"
    - Missing Then assertion: "it completes successfully within < 200ms"

- **tests\renderx-web-orchestration-sequences-validation.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:5.4:3] (60%)
  - Issues:
    - Missing And clause: "appropriate recovery is attempted"
    - Missing And clause: "the system remains stable"

- **tests\renderx-web-orchestration-conflation.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:5.4:1] (60%)
  - Issues:
    - Missing Given setup: "the renderTemplatePreview operation is triggered"
    - Missing Then assertion: "it completes successfully within < 200ms"

- **tests\renderx-web-orchestration-conflation.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:5.4:1] (60%)
  - Issues:
    - Missing Given setup: "the renderTemplatePreview operation is triggered"
    - Missing Then assertion: "it completes successfully within < 200ms"

- **tests\react-component-validation-e2e.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:1.1:2] (40%)
  - Issues:
    - Missing When action: "getCurrentTheme executes"
    - Missing Then assertion: "saved preference is returned"
    - Missing And clause: "no API calls are made (cached lookup)"

- **tests\react-component-validation-e2e.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:1.1:2] (40%)
  - Issues:
    - Missing When action: "getCurrentTheme executes"
    - Missing Then assertion: "saved preference is returned"
    - Missing And clause: "no API calls are made (cached lookup)"

- **tests\react-component-validation-e2e.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:1.1:3] (60%)
  - Issues:
    - Missing When action: "getCurrentTheme fails"
    - Missing And clause: "system remains functional"

- **tests\react-component-theme-toggle.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:1.1:2] (40%)
  - Issues:
    - Missing When action: "getCurrentTheme executes"
    - Missing Then assertion: "saved preference is returned"
    - Missing And clause: "no API calls are made (cached lookup)"

- **tests\react-component-theme-toggle-e2e.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:1.1:2] (60%)
  - Issues:
    - Missing When action: "getCurrentTheme executes"
    - Missing Then assertion: "saved preference is returned"

- **tests\react-component-theme-toggle-e2e.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:1.1:2] (60%)
  - Issues:
    - Missing When action: "getCurrentTheme executes"
    - Missing Then assertion: "saved preference is returned"

- **tests\react-component-theme-toggle-e2e.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:1.1:3] (40%)
  - Issues:
    - Missing When action: "getCurrentTheme fails"
    - Missing And clause: "error is logged for monitoring"
    - Missing And clause: "system remains functional"

- **tests\react-component-theme-toggle-e2e.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:1.1:3] (40%)
  - Issues:
    - Missing When action: "getCurrentTheme fails"
    - Missing And clause: "error is logged for monitoring"
    - Missing And clause: "system remains functional"

- **tests\react-component-e2e.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:5.4:1] (60%)
  - Issues:
    - Missing Given setup: "the renderTemplatePreview operation is triggered"
    - Missing Then assertion: "it completes successfully within < 200ms"

- **tests\react-component-e2e.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:3.1:1] (60%)
  - Issues:
    - Missing Given setup: "the showSelectionOverlay operation is triggered"
    - Missing Then assertion: "it completes successfully within < 200ms"

- **tests\react-component-e2e.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:5.4:1] (60%)
  - Issues:
    - Missing Given setup: "the renderTemplatePreview operation is triggered"
    - Missing Then assertion: "it completes successfully within < 200ms"

- **tests\react-component-communication.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:5.4:1] (60%)
  - Issues:
    - Missing Given setup: "the renderTemplatePreview operation is triggered"
    - Missing Then assertion: "it completes successfully within < 200ms"

- **tests\react-component-communication.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:5.4:1] (60%)
  - Issues:
    - Missing Given setup: "the renderTemplatePreview operation is triggered"
    - Missing Then assertion: "it completes successfully within < 200ms"

- **tests\host-sdk.v1.spec.ts** → [AC:renderx-web-orchestration:renderx-web-ac-alignment-workflow-v2:1.1:1] (40%)
  - Issues:
    - Missing Given setup: "ACs are present as acceptanceCriteriaStructured in sequence JSON"
    - Missing Then assertion: "Each AC entry has stable AC ID and normalized GWT"
    - Missing Then assertion: "Beat and sequence IDs are preserved"

- **tests\diagnostics-eventTap.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:3.5:1] (60%)
  - Issues:
    - Missing Given setup: "a class change operation completes"
    - Missing When action: "notifyUi is invoked with change details"

- **tests\diagnostics-eventTap.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:3.5:3] (60%)
  - Issues:
    - Missing When action: "notifyUi publishes"
    - Missing And clause: "the subscriber can act on the notification"

### ❌ Non-Compliant Tests (49)

- **tests\ui-event-wiring.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:5.4:2] (20%)
  - Issues:
    - Missing Given setup: "valid input parameters"
    - Missing When action: "renderTemplatePreview processes them"
    - Missing Then assertion: "results conform to expected schema"
    - Missing And clause: "no errors are thrown"

- **tests\ui-event-wiring.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:5.4:2] (20%)
  - Issues:
    - Missing Given setup: "valid input parameters"
    - Missing When action: "renderTemplatePreview processes them"
    - Missing Then assertion: "results conform to expected schema"
    - Missing And clause: "no errors are thrown"

- **tests\symphonic-code-analysis-fractal.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:3.4:1] (20%)
  - Issues:
    - Missing Given setup: "the ensureLineOverlayFor operation is triggered"
    - Missing When action: "the handler executes"
    - Missing Then assertion: "it completes successfully within < 1 second"
    - Missing And clause: "the output is valid and meets schema"

- **tests\symphonic-code-analysis-fractal.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:3.4:1] (20%)
  - Issues:
    - Missing Given setup: "the ensureLineOverlayFor operation is triggered"
    - Missing When action: "the handler executes"
    - Missing Then assertion: "it completes successfully within < 1 second"
    - Missing And clause: "the output is valid and meets schema"

- **tests\stats-enhancements.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:1.3:1] (20%)
  - Issues:
    - Missing Given setup: "configuration metadata"
    - Missing When action: "initConfig is called"
    - Missing Then assertion: "configuration is loaded within 200ms"
    - Missing And clause: "validation rules are attached"

- **tests\stats-enhancements.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:1.3:1] (20%)
  - Issues:
    - Missing Given setup: "configuration metadata"
    - Missing When action: "initConfig is called"
    - Missing Then assertion: "configuration is loaded within 200ms"
    - Missing And clause: "validation rules are attached"

- **tests\stats-enhancements.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:1.3:2] (20%)
  - Issues:
    - Missing Given setup: "complex nested configuration"
    - Missing When action: "initConfig processes it"
    - Missing And clause: "dependencies between sections are resolved"
    - Missing And clause: "no circular dependencies cause deadlock"

- **tests\stats-enhancements.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:1.3:2] (20%)
  - Issues:
    - Missing Given setup: "complex nested configuration"
    - Missing When action: "initConfig processes it"
    - Missing And clause: "dependencies between sections are resolved"
    - Missing And clause: "no circular dependencies cause deadlock"

- **tests\stats-enhancements.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:1.3:3] (0%)
  - Issues:
    - Missing Given setup: "configuration with 100+ fields"
    - Missing When action: "initConfig prepares the form"
    - Missing Then assertion: "initialization completes within 300ms"
    - Missing And clause: "form is ready for user interaction"
    - Missing And clause: "memory usage scales linearly with field count"

- **tests\sequence-player-multi-sequence.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:1.6:1] (20%)
  - Issues:
    - Missing Given setup: "the notifyReady operation is triggered"
    - Missing When action: "the handler executes"
    - Missing Then assertion: "it completes successfully within < 50ms"
    - Missing And clause: "any required events are published"

- **tests\sequence-player-multi-sequence.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:1.6:2] (0%)
  - Issues:
    - Missing Given setup: "valid input parameters"
    - Missing When action: "notifyReady processes them"
    - Missing Then assertion: "results conform to expected schema"
    - Missing And clause: "no errors are thrown"
    - Missing And clause: "telemetry events are recorded with latency metrics"

- **tests\sequence-player-multi-sequence.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:1.6:4] (20%)
  - Issues:
    - Missing Given setup: "performance SLA of < 50ms"
    - Missing When action: "notifyReady executes"
    - Missing Then assertion: "latency is consistently within target"
    - Missing And clause: "throughput meets baseline requirements"

- **tests\sequence-player-multi-sequence.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:1.6:1] (20%)
  - Issues:
    - Missing Given setup: "the notifyReady operation is triggered"
    - Missing When action: "the handler executes"
    - Missing Then assertion: "it completes successfully within < 50ms"
    - Missing And clause: "any required events are published"

- **tests\sequence-player-multi-sequence.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:1.6:2] (0%)
  - Issues:
    - Missing Given setup: "valid input parameters"
    - Missing When action: "notifyReady processes them"
    - Missing Then assertion: "results conform to expected schema"
    - Missing And clause: "no errors are thrown"
    - Missing And clause: "telemetry events are recorded with latency metrics"

- **tests\sequence-player-integration.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:1.6:1] (20%)
  - Issues:
    - Missing Given setup: "the notifyReady operation is triggered"
    - Missing When action: "the handler executes"
    - Missing Then assertion: "it completes successfully within < 50ms"
    - Missing And clause: "any required events are published"

- **tests\sequence-player-integration.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:1.6:2] (20%)
  - Issues:
    - Missing When action: "notifyReady processes them"
    - Missing Then assertion: "results conform to expected schema"
    - Missing And clause: "no errors are thrown"
    - Missing And clause: "telemetry events are recorded with latency metrics"

- **tests\sequence-player-integration.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:1.6:3] (0%)
  - Issues:
    - Missing Given setup: "error conditions"
    - Missing When action: "notifyReady encounters an error"
    - Missing Then assertion: "the error is logged with full context"
    - Missing And clause: "appropriate recovery is attempted"
    - Missing And clause: "the system remains stable"

- **tests\sequence-player-integration.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:1.6:4] (0%)
  - Issues:
    - Missing Given setup: "performance SLA of < 50ms"
    - Missing When action: "notifyReady executes"
    - Missing Then assertion: "latency is consistently within target"
    - Missing And clause: "throughput meets baseline requirements"
    - Missing And clause: "resource usage stays within bounds"

- **tests\sequence-player-integration.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:1.6:1] (20%)
  - Issues:
    - Missing Given setup: "the notifyReady operation is triggered"
    - Missing When action: "the handler executes"
    - Missing Then assertion: "it completes successfully within < 50ms"
    - Missing And clause: "any required events are published"

- **tests\sequence-player-integration.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:1.6:2] (20%)
  - Issues:
    - Missing When action: "notifyReady processes them"
    - Missing Then assertion: "results conform to expected schema"
    - Missing And clause: "no errors are thrown"
    - Missing And clause: "telemetry events are recorded with latency metrics"

- **tests\sequence-player-integration.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:1.6:3] (0%)
  - Issues:
    - Missing Given setup: "error conditions"
    - Missing When action: "notifyReady encounters an error"
    - Missing Then assertion: "the error is logged with full context"
    - Missing And clause: "appropriate recovery is attempted"
    - Missing And clause: "the system remains stable"

- **tests\sequence-player-auto-convert.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:5.5:2] (20%)
  - Issues:
    - Missing When action: "applyTemplateStyles processes them"
    - Missing Then assertion: "results conform to expected schema"
    - Missing And clause: "no errors are thrown"
    - Missing And clause: "telemetry events are recorded with latency metrics"

- **tests\sequence-player-auto-convert.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:5.5:4] (20%)
  - Issues:
    - Missing When action: "applyTemplateStyles executes"
    - Missing Then assertion: "latency is consistently within target"
    - Missing And clause: "throughput meets baseline requirements"
    - Missing And clause: "resource usage stays within bounds"

- **tests\sequence-player-auto-convert.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:5.5:2] (20%)
  - Issues:
    - Missing When action: "applyTemplateStyles processes them"
    - Missing Then assertion: "results conform to expected schema"
    - Missing And clause: "no errors are thrown"
    - Missing And clause: "telemetry events are recorded with latency metrics"

- **tests\sequence-player-auto-convert.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:5.5:4] (20%)
  - Issues:
    - Missing When action: "applyTemplateStyles executes"
    - Missing Then assertion: "latency is consistently within target"
    - Missing And clause: "throughput meets baseline requirements"
    - Missing And clause: "resource usage stays within bounds"

- **tests\sequence-execution.service.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:1.6:2] (20%)
  - Issues:
    - Missing When action: "notifyReady processes them"
    - Missing Then assertion: "results conform to expected schema"
    - Missing And clause: "no errors are thrown"
    - Missing And clause: "telemetry events are recorded with latency metrics"

- **tests\sequence-execution.service.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:1.6:4] (0%)
  - Issues:
    - Missing Given setup: "performance SLA of < 50ms"
    - Missing When action: "notifyReady executes"
    - Missing Then assertion: "latency is consistently within target"
    - Missing And clause: "throughput meets baseline requirements"
    - Missing And clause: "resource usage stays within bounds"

- **tests\sequence-execution.service.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:1.6:2] (20%)
  - Issues:
    - Missing When action: "notifyReady processes them"
    - Missing Then assertion: "results conform to expected schema"
    - Missing And clause: "no errors are thrown"
    - Missing And clause: "telemetry events are recorded with latency metrics"

- **tests\sequence-execution.service.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:1.6:4] (0%)
  - Issues:
    - Missing Given setup: "performance SLA of < 50ms"
    - Missing When action: "notifyReady executes"
    - Missing Then assertion: "latency is consistently within target"
    - Missing And clause: "throughput meets baseline requirements"
    - Missing And clause: "resource usage stays within bounds"

- **tests\sequence-execution.service.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:1.6:2] (20%)
  - Issues:
    - Missing When action: "notifyReady processes them"
    - Missing Then assertion: "results conform to expected schema"
    - Missing And clause: "no errors are thrown"
    - Missing And clause: "telemetry events are recorded with latency metrics"

- **tests\sequence-execution.service.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:1.6:4] (0%)
  - Issues:
    - Missing Given setup: "performance SLA of < 50ms"
    - Missing When action: "notifyReady executes"
    - Missing Then assertion: "latency is consistently within target"
    - Missing And clause: "throughput meets baseline requirements"
    - Missing And clause: "resource usage stays within bounds"

- **tests\sequence-execution.service.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:1.6:2] (20%)
  - Issues:
    - Missing When action: "notifyReady processes them"
    - Missing Then assertion: "results conform to expected schema"
    - Missing And clause: "no errors are thrown"
    - Missing And clause: "telemetry events are recorded with latency metrics"

- **tests\sequence-execution.service.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:1.6:4] (0%)
  - Issues:
    - Missing Given setup: "performance SLA of < 50ms"
    - Missing When action: "notifyReady executes"
    - Missing Then assertion: "latency is consistently within target"
    - Missing And clause: "throughput meets baseline requirements"
    - Missing And clause: "resource usage stays within bounds"

- **tests\select.overlay.helpers.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:3.1:1] (20%)
  - Issues:
    - Missing Given setup: "the showSelectionOverlay operation is triggered"
    - Missing When action: "the handler executes"
    - Missing Then assertion: "it completes successfully within < 200ms"
    - Missing And clause: "any required events are published"

- **tests\select.overlay.helpers.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:3.1:1] (20%)
  - Issues:
    - Missing Given setup: "the showSelectionOverlay operation is triggered"
    - Missing When action: "the handler executes"
    - Missing Then assertion: "it completes successfully within < 200ms"
    - Missing And clause: "any required events are published"

- **tests\select.overlay.dom.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:3.1:1] (20%)
  - Issues:
    - Missing Given setup: "the showSelectionOverlay operation is triggered"
    - Missing When action: "the handler executes"
    - Missing Then assertion: "it completes successfully within < 200ms"
    - Missing And clause: "any required events are published"

- **tests\scene-5-destination.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:1.5:1] (20%)
  - Issues:
    - Missing Given setup: "the registerObservers operation is triggered"
    - Missing When action: "the handler executes"
    - Missing Then assertion: "it completes successfully within < 1 second"
    - Missing And clause: "any required events are published"

- **tests\scene-4-transfer-hub.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:1.5:1] (20%)
  - Issues:
    - Missing Given setup: "the registerObservers operation is triggered"
    - Missing When action: "the handler executes"
    - Missing Then assertion: "it completes successfully within < 1 second"
    - Missing And clause: "any required events are published"

- **tests\scene-3-subscribers.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:1.5:1] (20%)
  - Issues:
    - Missing Given setup: "the registerObservers operation is triggered"
    - Missing When action: "the handler executes"
    - Missing Then assertion: "it completes successfully within < 1 second"
    - Missing And clause: "any required events are published"

- **tests\react-component-e2e.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:5.4:2] (20%)
  - Issues:
    - Missing Given setup: "valid input parameters"
    - Missing When action: "renderTemplatePreview processes them"
    - Missing Then assertion: "results conform to expected schema"
    - Missing And clause: "no errors are thrown"

- **tests\react-component-e2e.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:5.4:2] (20%)
  - Issues:
    - Missing Given setup: "valid input parameters"
    - Missing When action: "renderTemplatePreview processes them"
    - Missing Then assertion: "results conform to expected schema"
    - Missing And clause: "no errors are thrown"

- **tests\react-component-communication.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:5.4:2] (20%)
  - Issues:
    - Missing Given setup: "valid input parameters"
    - Missing When action: "renderTemplatePreview processes them"
    - Missing Then assertion: "results conform to expected schema"
    - Missing And clause: "no errors are thrown"

- **tests\react-component-communication.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:5.4:2] (20%)
  - Issues:
    - Missing Given setup: "valid input parameters"
    - Missing When action: "renderTemplatePreview processes them"
    - Missing Then assertion: "results conform to expected schema"
    - Missing And clause: "no errors are thrown"

- **tests\placeholder.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:5.7:1] (0%)
  - Issues:
    - Missing Given setup: "the installDragImage operation is triggered"
    - Missing When action: "the handler executes"
    - Missing Then assertion: "it completes successfully within < 1 second"
    - Missing And clause: "the output is valid and meets schema"
    - Missing And clause: "any required events are published"

- **tests\no-local-control-panel-sequences.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:1.3:1] (0%)
  - Issues:
    - Missing Given setup: "configuration metadata"
    - Missing When action: "initConfig is called"
    - Missing Then assertion: "configuration is loaded within 200ms"
    - Missing And clause: "all fields are prepared for rendering"
    - Missing And clause: "validation rules are attached"

- **tests\no-local-control-panel-sequences.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:1.3:1] (0%)
  - Issues:
    - Missing Given setup: "configuration metadata"
    - Missing When action: "initConfig is called"
    - Missing Then assertion: "configuration is loaded within 200ms"
    - Missing And clause: "all fields are prepared for rendering"
    - Missing And clause: "validation rules are attached"

- **tests\integrated-scene-1-2.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:1.5:1] (20%)
  - Issues:
    - Missing Given setup: "the registerObservers operation is triggered"
    - Missing When action: "the handler executes"
    - Missing Then assertion: "it completes successfully within < 1 second"
    - Missing And clause: "any required events are published"

- **tests\event-route-onepage.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:1.5:1] (20%)
  - Issues:
    - Missing Given setup: "the registerObservers operation is triggered"
    - Missing When action: "the handler executes"
    - Missing Then assertion: "it completes successfully within < 1 second"
    - Missing And clause: "any required events are published"

- **tests\digital-assets.spec.ts** → [AC:renderx-web-orchestration:renderx-web-orchestration:5.3:1] (20%)
  - Issues:
    - Missing Given setup: "the createGhostContainer operation is triggered"
    - Missing When action: "the handler executes"
    - Missing Then assertion: "it completes successfully within < 2 seconds"
    - Missing And clause: "any required events are published"

### 🚫 Invalid Tags (2)

- **tests\select.overlay.dom.spec.ts** → [AC:renderx-web-orchestration:select:1.1:1]: AC not found in registry
- **tests\react-component-theme-toggle.spec.ts** → [AC:renderx-web-orchestration:ui-theme-toggle:1.1:1]: AC not found in registry

## Next Steps

1. Fix non-compliant tests to properly implement their AC requirements
2. Address partial compliance issues
3. Generate tests for uncovered ACs (5 remaining)
