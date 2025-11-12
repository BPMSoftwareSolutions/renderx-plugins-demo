# Desktop Guardrails Implementation Roadmap

## Current Status

### Web Version (31 ESLint Rules)
- **Architecture Rules**: 4 rules (feature-flags, handler-export-exists, interaction-keys, topics-keys)
- **Configuration Rules**: 1 rule (panelslot-inside-slotcontainer)
- **General Rules**: 7 rules (beat-kind-dom-access, deprecate-stagecrew-api, root-shims-only, etc.)
- **Import/Export Rules**: 2 rules (consistent-json-import-attributes, import-css-injection-coverage)
- **Prohibition Rules**: 7 rules (no-console-in-plugins, no-cross-plugin-imports, no-hardcoded-*, etc.)
- **Validation Rules**: 10 rules (require-manifest-validation, validate-host-sdk-version, etc.)

### Desktop Version (15 Roslyn Rules) ✅ COMPLETE
- **SHELL001**: Thin-host violations
- **SHELL002**: Plugin decoupling violations
- **SHELL003**: Plugin completeness violations
- **SHELL004**: Manifest-driven loading violations
- **SHELL005**: No-Cross-Plugin-Imports ✅
- **SHELL006**: No-Host-Internals-In-Plugins ✅
- **SHELL007**: No-Console-In-Plugins ✅
- **SHELL008**: Require-Plugin-Manifest-Fragment ✅
- **SHELL009**: Validate-Internal-Plugin-Ids ✅
- **SHELL010**: Require-Manifest-Validation ✅
- **SHELL011**: Handler-Export-Exists ✅
- **SHELL012**: Valid-Handlers-Path ✅
- **SHELL013**: Feature-Flags ✅
- **SHELL014**: Interaction-Keys ✅
- **SHELL015**: Topics-Keys ✅

**Test Coverage**: 48 tests passing (100% coverage)

---

## Implementation Roadmap

### ✅ COMPLETED: Foundation (SHELL001-SHELL004)
- [x] Thin-host architecture enforcement
- [x] Plugin decoupling validation
- [x] Plugin completeness checks
- [x] Manifest-driven loading guardrails

### ✅ COMPLETED: PHASE 1 - Critical Plugin Isolation (SHELL005-SHELL007)
**Priority**: HIGH - Prevents architectural violations at compile time

#### ✅ SHELL005: No-Cross-Plugin-Imports
- **Web Equivalent**: `no-cross-plugin-imports`
- **Purpose**: Prevent plugins from importing code from other plugins
- **Detection**: Analyze using directives in plugin files
- **Error Message**: "Cross-plugin import detected: {{importPath}}. Plugins must not import from other plugins."
- **Status**: ✅ IMPLEMENTED & TESTED

#### ✅ SHELL006: No-Host-Internals-In-Plugins
- **Web Equivalent**: `no-host-internals-in-plugins`
- **Purpose**: Prevent plugins from importing shell internals
- **Detection**: Check for imports from RenderX.Shell.Avalonia.* (except SDK)
- **Error Message**: "Plugins must not import host internals ({{importPath}}). Use RenderX.HostSDK.Avalonia instead."
- **Status**: ✅ IMPLEMENTED & TESTED

#### ✅ SHELL007: No-Console-In-Plugins
- **Web Equivalent**: `no-console-in-plugins`
- **Purpose**: Prevent direct console usage in plugin code
- **Detection**: Look for Console.WriteLine, Debug.WriteLine calls
- **Error Message**: "Console usage detected in plugin code. Use ILogger instead."
- **Status**: ✅ IMPLEMENTED & TESTED

---

### 🎯 PHASE 2: Manifest Validation (SHELL008-SHELL010)
**Priority**: HIGH - Ensures manifest is single source of truth

#### SHELL008: Require-Plugin-Manifest-Fragment
- **Web Equivalent**: `require-plugin-manifest-fragment`
- **Purpose**: Validate plugin manifest structure and required fields
- **Detection**: Parse plugin-manifest.json and validate schema
- **Error Message**: "Plugin manifest missing required fields: {{missingFields}}"
- **Effort**: Medium (JSON parsing + schema validation)

#### SHELL009: Validate-Internal-Plugin-Ids
- **Web Equivalent**: `validate-internal-plugin-ids`
- **Purpose**: Ensure plugin IDs are consistent across manifest and code
- **Detection**: Compare plugin IDs in manifest vs PluginLoader
- **Error Message**: "Plugin ID mismatch: manifest has {{manifestId}}, code expects {{codeId}}"
- **Effort**: Medium (cross-file validation)

#### SHELL010: Require-Manifest-Validation
- **Web Equivalent**: `require-manifest-validation`
- **Purpose**: Ensure manifest is validated at startup
- **Detection**: Check for manifest validation calls in PluginLoader
- **Error Message**: "PluginLoader must validate plugin-manifest.json structure"
- **Effort**: Low (method call detection)

---

### 🎯 PHASE 3: Handler/Sequence Validation (SHELL011-SHELL012)
**Priority**: MEDIUM - Validates plugin handler references

#### SHELL011: Handler-Export-Exists
- **Web Equivalent**: `handler-export-exists`
- **Purpose**: Validate that referenced handlers exist in plugin code
- **Detection**: Parse plugin manifests and verify handler exports
- **Error Message**: "Handler {{handlerName}} referenced in manifest but not exported from {{modulePath}}"
- **Effort**: High (requires handler discovery)

#### SHELL012: Valid-Handlers-Path
- **Web Equivalent**: `valid-handlers-path`
- **Purpose**: Validate handler paths are resolvable and not in restricted locations
- **Detection**: Check handler paths in manifest
- **Error Message**: "Handler path {{path}} is not resolvable or in restricted location"
- **Effort**: Medium (path resolution)

---

### 🎯 PHASE 4: Feature Flags & Interactions (SHELL013-SHELL015)
**Priority**: MEDIUM - Enforces string literal usage

#### SHELL013: Feature-Flags
- **Web Equivalent**: `feature-flags`
- **Purpose**: Enforce string literal flag IDs in feature flag checks
- **Detection**: Look for isFlagEnabled() calls with non-literal arguments
- **Error Message**: "isFlagEnabled() requires a string literal flag ID, not {{expression}}"
- **Effort**: Medium (expression analysis)

#### SHELL014: Interaction-Keys
- **Web Equivalent**: `interaction-keys`
- **Purpose**: Enforce string literal interaction keys
- **Detection**: Look for resolveInteraction() calls with non-literal arguments
- **Error Message**: "resolveInteraction() requires a string literal key, not {{expression}}"
- **Effort**: Medium (expression analysis)

#### SHELL015: Topics-Keys
- **Web Equivalent**: `topics-keys`
- **Purpose**: Enforce string literal topic names in event publishing
- **Detection**: Look for EventRouter.publish() calls with non-literal topics
- **Error Message**: "EventRouter.publish() requires a string literal topic, not {{expression}}"
- **Effort**: Medium (expression analysis)

---

## Implementation Notes

### Common Patterns
1. **Using Directive Analysis**: SHELL001, SHELL005, SHELL006
2. **Method Call Analysis**: SHELL007, SHELL013, SHELL014, SHELL015
3. **Manifest Parsing**: SHELL008, SHELL009, SHELL010
4. **Cross-File Validation**: SHELL009, SHELL011, SHELL012

### Testing Strategy
- Unit tests for each rule in `ThinHostArchitectureAnalyzerTests.cs`
- Test both positive (should pass) and negative (should fail) cases
- Verify error messages are clear and actionable

### Documentation
- Update analyzer XML comments with new rules
- Add examples of violations and fixes
- Document in ADR-0020 (Plugin Architecture Validation)

---

## Success Criteria

✅ All 15 rules (SHELL001-SHELL015) implemented and tested
✅ 100% test coverage for each rule
✅ Zero false positives in existing codebase
✅ Clear error messages guide developers to fixes
✅ Documentation updated with examples
✅ CI/CD enforces all rules on every build

---

## Timeline Estimate

- **Phase 1**: 2-3 days (3 rules)
- **Phase 2**: 2-3 days (3 rules)
- **Phase 3**: 3-4 days (2 rules, more complex)
- **Phase 4**: 2-3 days (3 rules)

**Total**: ~10-13 days for full parity with web guardrails

