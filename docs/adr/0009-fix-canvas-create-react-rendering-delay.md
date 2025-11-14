# ADR 0009: Fix Canvas Component Create React Rendering Delay + Resize Handler Export

**Date:** 2025-11-13
**Status:** ACCEPTED
**Context:** Production issues: (1) ~500ms delay in canvas-component create sequence, (2) resize not working due to missing handler export
**Decision:** (1) Change beat 4 (renderReact) timing from `"after-beat"` to `"immediate"`, (2) Export `forwardToControlPanel` from resize.move.symphony

## Problem

In production, the canvas-component create sequence was taking ~600ms total, with ~500ms of that being an artificial delay before React rendering even started.

### Root Cause

The sequence JSON defined beat 4 (renderReact) with `"timing": "after-beat"`:

```json
{
  "beat": 4,
  "event": "canvas:component:render-react",
  "timing": "after-beat"  // ← Causes 500ms delay at 120 BPM
}
```

The `"after-beat"` timing in MusicalConductor calculates delay as:
```
delay = (60 / tempo) * 1000 = (60 / 120) * 1000 = 500ms
```

This delay was applied **before** React rendering started, blocking the entire sequence.

### Evidence from Log

From `.logs/localhost-1763041026581.log`:
- Beat 3 (createNode) completes: `13:36:56.690Z`
- MovementExecutor logs: `Waiting 500ms for beat timing (after-beat)`
- Beat 4 (renderReact) starts: `13:36:57.199Z` (500ms later)
- Total sequence time: 587ms (mostly the artificial wait)

## Solution

### Fix 1: Remove 500ms Artificial Delay from React Rendering

Changed beat 4 timing from `"after-beat"` to `"immediate"` in both:
1. `packages/canvas-component/json-sequences/canvas-component/create.json`
2. `src/RenderX.Plugins.CanvasComponent/json-sequences/canvas-component/create.json`

### Fix 2: Export Missing Handler from Resize Move Symphony

The resize.move sequence JSON defined beat 2 with handler `forwardToControlPanel`, but the symphony file wasn't exporting it:

**File:** `packages/canvas-component/src/symphonies/resize/resize.move.symphony.ts`

**Before:**
```typescript
import { updateSize } from "./resize.stage-crew";
export const handlers = { updateSize };
```

**After:**
```typescript
import { updateSize } from "./resize.stage-crew";
import { forwardToControlPanel } from "../drag/drag.stage-crew";
export const handlers = { updateSize, forwardToControlPanel };
```

This was causing the resize.move sequence to fail when beat 2 tried to execute, which blocked the entire resize operation and caused the feedback loop prevention to trigger repeatedly.

### Why This Works

- React rendering no longer waits for an artificial delay
- The DOM is already stable after beat 3 (createNode)
- React's `startTransition` handles any necessary batching
- Error handling in renderReact beat catches and displays errors inline

## Verification

Updated isolation test validates timing:
```typescript
const startTime = Date.now();
// ... execute beats ...
const elapsed = Date.now() - startTime;
expect(elapsed).toBeLessThan(100);  // No 500ms delay
```

Test results: ✅ All 4 tests pass, React rendering completes in <100ms

## Impact

- **Before:** ~600ms per component (500ms delay + 100ms actual work)
- **After:** ~100ms per component (immediate execution)
- **Improvement:** ~6x faster canvas component creation

## Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| React rendering race with DOM | React's startTransition handles batching; DOM is stable after beat 3 |
| Timing-dependent bugs surface | Isolation harness stress test (N=4 parallel) validates stability |
| Desktop version divergence | Fixed both web and desktop JSON files simultaneously |

## References

- Playbook: `packages/ographx/docs/Self-isolation for prod-only bugs — playbook.md`
- Isolation harness: `packages/canvas-component/__tests__/create.isolation.spec.ts`
- Sequence definition: `packages/canvas-component/json-sequences/canvas-component/create.json`
- MovementExecutor timing logic: `packages/musical-conductor/modules/communication/sequences/execution/MovementExecutor.ts` (lines 164-220)

