# 🎼 Handler Scope/Kind Quick Reference

## One-Sentence Summary
**Handler-level metadata now distinguishes plugin-level handlers (UI/features) from orchestration-level handlers (system/governance) for targeted metrics, audit, and governance.**

---

## Handler Scopes

### 🎨 Plugin Handlers (103 total)
- **What**: Feature logic (UI, components, interactions)
- **Where**: Canvas component, control panel, library, header, etc.
- **Marked as**: `scope: "plugin", kind: "plugin"`
- **Example**: `canvas-component-copy-symphony.copyToClipboard`
- **Coverage threshold**: 80%+

### 🎭 Orchestration Handlers (76 total)
- **What**: System logic (analysis, builds, governance)
- **Where**: Build pipeline, code analysis, governance enforcement
- **Marked as**: `scope: "orchestration", kind: "orchestration"`
- **Example**: `analysis.discovery.discoverSourceFiles`
- **Coverage threshold**: 85%+

---

## Handler Definition Structure

```json
{
  "beat": 1,
  "event": "canvas:component:copy",
  "handler": "copyToClipboard",
  "handlerDef": {
    "id": "canvas-component-copy-symphony.copytoclipboard.0",
    "scope": "plugin",           // or "orchestration"
    "kind": "plugin",            // or "orchestration"
    "stage": "feature",          // optional: for orchestration only
    "implementationRef": "..."   // optional: path to implementation
  }
}
```

---

## Quick Stats

| Metric | Count |
|--------|-------|
| Total Handlers | 195 |
| Orchestration | 76 (39%) |
| Plugin | 103 (53%) |
| Unknown | 16 (8%) |
| Sequences Covered | 51 |

---

## Key Files

| File | Purpose | Key Change |
|------|---------|-----------|
| `DOMAIN_REGISTRY.json` | Global domain registry | Added `handlerLayerIntroduction` |
| `orchestration-domains.json` | Domains registry | Added `handlerSchema` section |
| `symphonic-code-analysis-pipeline.json` | Code analysis | 16 beats with scope/kind |
| `build-pipeline-symphony.json` | Build orchestration | 39 beats with scope/kind |
| All plugin sequences | Feature handlers | Enhanced with scope/kind |

---

## Analysis Tools

```bash
# Enhance sequences with handler scope/kind
node scripts/enhance-handlers-with-scope.cjs orchestration
node scripts/enhance-handlers-with-scope.cjs plugin
node scripts/enhance-handlers-with-scope.cjs all

# Analyze and report on handlers by scope
node scripts/analyze-handlers-by-scope.cjs
# Outputs:
# - docs/generated/handler-analysis/handlers-by-scope-summary.json
# - docs/generated/handler-analysis/handlers-orchestration-list.json
# - docs/generated/handler-analysis/handlers-plugin-list.json
```

---

## Use Cases Enabled

### 1. Separate Metrics
```
Orchestration Metrics:
- 76 handlers
- X LOC
- Y% coverage
- Z complexity

Plugin Metrics:
- 103 handlers
- A LOC
- B% coverage
- C complexity
```

### 2. Registry Validation
```
Audit questions now answerable:
- "Which orchestration domains have missing handlers?"
- "Which handlers don't have implementationRef?"
- "Are all handlers properly scoped?"
```

### 3. Governance Rules
```
Rules now scope-aware:
- Orchestration: coverage >= 85%, complexity <= 10
- Plugin: coverage >= 80%, complexity <= 15
```

### 4. Targeted Fixes
```
Self-healing can now:
- Apply orchestration-specific refactoring
- Use feature-specific optimizations
- Report separately by scope
```

---

## Integration Timeline

✅ **Phase 0: COMPLETE**
- Handler schema defined
- Registries updated
- 195 handlers cataloged
- Scopes assigned

⏳ **Phase 1: Metrics Separation** (Ready)
- Update `analyze-symphonic-code.cjs`
- Report by handler scope

⏳ **Phase 2: Registry Audit** (Ready)
- Validate handler completeness
- Identify missing handlers

⏳ **Phase 3: Governance Enforcement** (Ready)
- Apply scope-specific rules

⏳ **Phase 4: Self-Healing** (Ready)
- Target fixes by scope

---

## Handler Examples

### Plugin Handler
```json
{
  "sequenceId": "canvas-component-select-symphony",
  "beatName": "Show Selection",
  "handler": "showSelectionOverlay",
  "scope": "plugin",
  "kind": "plugin"
}
```

### Orchestration Handler
```json
{
  "sequenceId": "symphonic-code-analysis-pipeline",
  "beatName": "Discover Source Code",
  "handler": "discoverSourceCode",
  "scope": "orchestration",
  "kind": "orchestration",
  "stage": "discovery"
}
```

---

## Key Principle

> **Same sequence schema, but handler-level scope/kind tells the engine whether this is orchestration-level logic (system/governance) or feature-level logic (UI/components).**

---

## Questions?

See:
- `HANDLER_SCOPE_KIND_IMPLEMENTATION.md` - Complete guide
- `HANDLER_SCOPE_KIND_INTEGRATION_MAP.md` - Architecture diagram
- `HANDLER_SCOPE_KIND_SUMMARY.md` - Executive summary
