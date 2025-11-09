# Desktop vs Web ESLint Guardrails Analysis

## Summary
The web version has **31 custom ESLint rules** across 6 categories. The desktop (Avalonia) version currently has **4 Roslyn analyzer rules** (SHELL001-SHELL004) covering only thin-host and plugin architecture.

**Gap Analysis**: Desktop is missing ~27 rules that exist on the web side.

---

## Web ESLint Rules (31 Total)

### 1. **Architecture Rules** (4 rules)
- ✅ `feature-flags` - Enforce string literal flag IDs
- ✅ `handler-export-exists` - Validate handlers exist in referenced modules
- ✅ `interaction-keys` - Enforce string literal interaction keys
- ✅ `topics-keys` - Enforce string literal topic names

### 2. **Configuration Rules** (1 rule)
- ✅ `panelslot-inside-slotcontainer` - Require PanelSlot inside SlotContainer

### 3. **General Rules** (7 rules)
- ✅ `beat-kind-dom-access` - DOM access only in stage-crew handlers
- ✅ `deprecate-stagecrew-api` - Deprecate old StageCrew API
- ✅ `root-shims-only` - Top-level src/* must be pure re-export shims
- ✅ `rule-engine-coverage` - Validate control panel property extraction
- ✅ `sequences-in-json` - Sequence definitions must be in JSON, not TypeScript
- ✅ `valid-handlers-path` - Validate handlersPath entries are resolvable
- ✅ `valid-sequence-handlers` - Validate sequence handler references

### 4. **Import/Export Rules** (2 rules)
- ✅ `consistent-json-import-attributes` - Enforce consistent JSON import attributes
- ✅ `import-css-injection-coverage` - Validate CSS import flow mapping

### 5. **Prohibition Rules** (7 rules)
- ✅ `no-console-in-plugins` - Prevent console usage in plugins
- ✅ `no-cross-plugin-imports` - Forbid cross-plugin imports
- ✅ `no-hardcoded-layout-styles` - Disallow inline grid styles outside layout/**
- ✅ `no-hardcoded-play-ids` - Disallow hardcoded pluginId/sequenceId
- ✅ `no-hardcoded-slot-names` - Disallow hardcoded slot name unions
- ✅ `no-host-internals-in-plugins` - Forbid src/** imports in plugins
- ✅ `no-layout-logic-in-components` - Disallow layout logic outside layout/**

### 6. **Validation Rules** (10 rules)
- ✅ `require-manifest-validation` - Validate layout manifest
- ✅ `require-plugin-manifest-fragment` - Require plugin manifest fragments
- ✅ `require-routing-declarations` - Require routing declarations
- ✅ `require-slot-manifest-registration` - Require slot registration in manifest
- ✅ `validate-external-plugin-consistency` - Validate external plugin IDs
- ✅ `validate-host-sdk-missing` - Check for missing Host SDK dependency
- ✅ `validate-host-sdk-version` - Validate Host SDK version compatibility
- ✅ `validate-host-sdk-version-mismatch` - Detect version mismatches
- ✅ `validate-internal-plugin-ids` - Validate internal plugin ID consistency
- ✅ `validate-served-sequences-mountable` - Validate served sequences are mountable

---

## Desktop Roslyn Analyzer Rules (4 Total)

### Current Rules
- **SHELL001**: Thin-host violations (forbidden imports, custom implementations)
- **SHELL002**: Plugin decoupling violations (direct instantiation, hardcoded imports)
- **SHELL003**: Plugin completeness violations (embedded plugins detection)
- **SHELL004**: Manifest-driven loading violations (hardcoded mappings detection)

---

## Gap Analysis: What's Missing on Desktop

### High Priority (Directly Applicable)
1. **Plugin Isolation**
   - ❌ No-cross-plugin-imports (equivalent to web rule)
   - ❌ No-host-internals-in-plugins (equivalent to web rule)
   - ❌ No-console-in-plugins (equivalent to web rule)

2. **Manifest Validation**
   - ❌ Require-plugin-manifest-fragment (validate plugin manifests)
   - ❌ Validate-internal-plugin-ids (check plugin ID consistency)
   - ❌ Validate-external-plugin-consistency (for external plugins)

3. **Configuration Validation**
   - ❌ Require-slot-manifest-registration (validate slot registration)
   - ❌ Require-manifest-validation (validate manifest structure)

### Medium Priority (Partially Applicable)
4. **Handler/Sequence Validation**
   - ❌ Handler-export-exists (validate handler references)
   - ❌ Valid-handlers-path (validate handler paths)
   - ❌ Valid-sequence-handlers (validate sequence handlers)

5. **Feature Flags & Interactions**
   - ❌ Feature-flags (enforce string literal flag IDs)
   - ❌ Interaction-keys (enforce string literal interaction keys)
   - ❌ Topics-keys (enforce string literal topic names)

### Lower Priority (Web-Specific)
6. **React/DOM-Specific**
   - ❌ Beat-kind-dom-access (DOM access in stage-crew handlers)
   - ❌ No-layout-logic-in-components (layout logic separation)
   - ❌ No-hardcoded-layout-styles (inline grid styles)
   - ❌ Panelslot-inside-slotcontainer (React component nesting)
   - ❌ Deprecate-stagecrew-api (deprecated API)
   - ❌ Root-shims-only (re-export shims)
   - ❌ Consistent-json-import-attributes (JSON import attributes)
   - ❌ Import-css-injection-coverage (CSS injection flow)
   - ❌ Rule-engine-coverage (control panel property extraction)
   - ❌ Sequences-in-json (sequence definitions)
   - ❌ Validate-host-sdk-missing (SDK dependency check)
   - ❌ Validate-host-sdk-version (SDK version validation)
   - ❌ Validate-host-sdk-version-mismatch (version mismatch detection)
   - ❌ Validate-served-sequences-mountable (sequence mountability)
   - ❌ No-hardcoded-play-ids (hardcoded play IDs)
   - ❌ No-hardcoded-slot-names (hardcoded slot names)

---

## Recommendations

### Phase 1: Critical Plugin Isolation (Next)
1. Add `SHELL005`: No-cross-plugin-imports
2. Add `SHELL006`: No-host-internals-in-plugins
3. Add `SHELL007`: No-console-in-plugins

### Phase 2: Manifest Validation
1. Add `SHELL008`: Require-plugin-manifest-fragment
2. Add `SHELL009`: Validate-internal-plugin-ids
3. Add `SHELL010`: Require-manifest-validation

### Phase 3: Handler/Sequence Validation
1. Add `SHELL011`: Handler-export-exists
2. Add `SHELL012`: Valid-handlers-path

### Phase 4: Feature Flags & Interactions
1. Add `SHELL013`: Feature-flags
2. Add `SHELL014`: Interaction-keys
3. Add `SHELL015`: Topics-keys

---

## Implementation Strategy

Each new Roslyn analyzer rule should:
1. Follow the existing pattern in `ThinHostArchitectureAnalyzer.cs`
2. Have corresponding unit tests in `ThinHostArchitectureAnalyzerTests.cs`
3. Be documented in the analyzer's XML comments
4. Have a unique SHELL diagnostic ID
5. Report errors at compile time to prevent violations

**Note**: Some web rules are React/DOM-specific and may not have direct desktop equivalents. Focus on plugin architecture and manifest validation rules first.

