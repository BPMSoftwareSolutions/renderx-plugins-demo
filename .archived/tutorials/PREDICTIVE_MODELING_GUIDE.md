# Predictive Modeling for Sequences (ographx)

This guide explains how to express a *future / intended* evolution of a workflow using a predictive overlay JSON. The overlay attaches design intent, planned beats, and target performance metrics directly to sequence artifacts without changing production code yet.

## Why Predictive Modeling?
Instead of static documentation, a predictive sequence becomes an executable design asset:
- Communicates intent (optimizations, instrumentation plans) near the actual symbol.
- Enables diffing: current vs future state (beats, metrics expectations, IO summaries).
- Feeds tooling: can scaffold code (add missing beats, logging), or validate that targets were met post-implementation.

## Core Concepts
| Field | Purpose |
|-------|---------|
| `intent` | Human-readable objective (e.g., "Batch logger pushes"). |
| `plannedBeats[]` | Declarative list of beats to add (metrics, optimization markers, return summaries). |
| `targetMetrics` | Expected performance / scale boundaries to validate later. |
| `designNotes[]` | Deeper architectural considerations. |

## Overlay File Structure
```
{
  "overrides": {
    "<symbolId>": {
      "future": {
        "intent": "...",
        "plannedBeats": [ { "event": "metric:loop:iterations", "details": { ... } } ],
        "targetMetrics": { "sequenceDurationMs": { "p50": 5.0 } },
        "designNotes": ["...", "..."]
      }
    }
  }
}
```
Symbol IDs match those derived from IR (e.g. `animation-coordinator.ts::generateBusKeyframes`).

## Generating Enhanced Sequences with Predictive Overlay
```
python generators/generate_sequences_enhanced.py \
  --input path/to/ir.json \
  --output .ographx/artifacts/renderx-web/sequences/enhanced.sequences.json \
  --predictive packages/ographx/.ographx/predictive/predictive-overlay.json
```
Produces schema v0.2.0 including `future` blocks where overlays apply.

## Workflow Integration
1. Author / update overlay with new optimization ideas.
2. Generate enhanced sequences artifact (`enhanced.sequences.json`).
3. Review diff: current beats vs `plannedBeats` (tooling can show missing ones).
4. Implement code changes (instrumentation, batching, algorithm improvements).
5. Regenerate sequences; tooling marks achieved vs remaining.
6. CI gate: ensure `targetMetrics` not regressed.

## Instrumentation Guide

### Adding Metrics Collection to Code

Instrumentation stubs have been added to key workflows (renderReact, compileReactCode) to collect timing and event data:

```typescript
// Metrics collector is exposed globally during test execution
const collector = (window as any).__metricsCollector;

// Record timing metrics
if (collector) {
  const startTime = performance.now();
  // ... do work ...
  collector.record_timing("metric:compile:duration", performance.now() - startTime);
}

// Record structured events
if (collector) {
  collector.record_event("publish:react.component.mounted", {
    componentId: nodeId,
    timestamp: new Date().toISOString()
  });
}

// Record errors
if (collector) {
  collector.record_error("compileFailure", {
    reason: "babel_transform",
    message: errorMsg
  });
}
```

### Planned Beats Naming Convention

Planned beats follow these patterns:
- **Metrics**: `metric:<phase>:<measurement>` (e.g., `metric:compile:duration`, `metric:render:duration`)
- **Events**: `publish:<domain>.<event>` (e.g., `publish:react.component.mounted`)
- **Errors**: `error:<type>` (e.g., `error:compileFailure`)

## Validation & Reporting

### Running Validators

Three scripts are available for Phase 1 validation:

```bash
# Validate coverage and guardrails
npm run predictive:validate

# Generate diff report (planned vs actual beats)
npm run predictive:diff

# Generate Mermaid diagrams showing shape
npm run predictive:diagrams

# Run all three
npm run predictive:all
```

### Validator Output

The validator generates:
1. **Validation Report** (`validation-report.json`): Coverage %, guardrail violations, phase status
2. **Diff Report** (`sequence-diff-report.md`): Markdown showing implemented vs missing beats
3. **Shape Diagrams** (`diagrams/*.md`): Mermaid diagrams with ✅/❌ for each planned beat

### Phase 1 Guardrails (Non-blocking)

| Metric | Threshold | Status |
|--------|-----------|--------|
| Coverage | ≥60% | Warning if below |
| Compile p95 | ≤20ms | Warning if exceeded |
| Render p95 | ≤35ms | Warning if exceeded |
| Error Rate | ≤1% | Warning if exceeded |

### Phase 2 Guardrails (Blocking)

Phase 2 will enforce stricter thresholds and fail CI if violated.

## Best Practices
- Keep overlays small and focused; avoid speculative entries without a clear follow-up plan.
- Use `expectedMax` conservatively—exceeding it should trigger investigation, not immediate failure.
- Link to profiling reports or tickets in `designNotes` for traceability.
- Instrument code incrementally; start with hot paths (compile, render, validation).
- Review diff reports regularly to track progress toward coverage targets.

## Next Steps
- Phase 2: Enforce strict guardrails in CI (blocking violations).
- Phase 3: Auto-generate instrumentation stubs from overlay.
- Phase 4: Integrate with profiling tools for continuous optimization.

---
Maintainer: ographx team
Version: 0.3.0 predictive modeling guide (Phase 1 complete)
