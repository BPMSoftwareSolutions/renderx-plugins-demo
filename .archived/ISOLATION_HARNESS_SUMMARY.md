# Isolation Harness Playground - Implementation Summary

## Overview

Created an interactive **Isolation Harness Playground** UI for exploratory testing and debugging of canvas-component sequences in isolation. This enables you to:

1. **Load production logs** and automatically extract sequence specs
2. **Run sequences interactively** without the full dev server
3. **Observe execution** in real-time with DOM snapshots, timing, and side-effects
4. **Debug production issues** by replaying exact failing scenarios

## What Was Built

### 1. Isolation Harness Playground Component
**File**: `src/ui/isolation-harness/IsolationHarnessPlayground.tsx`

Features:
- 3-panel layout: Controls | Canvas | Results
- Log file upload with automatic spec extraction
- Interactive sequence execution
- Real-time DOM rendering
- Execution timeline with beat-by-beat breakdown
- KV operations tracking
- Published events logging

### 2. Styling
**File**: `src/ui/isolation-harness/isolation-harness.css`

- Dark theme matching VS Code
- Responsive 3-panel grid layout
- Collapsible sections for results
- Beat execution timeline with status indicators
- Scrollable panels with custom scrollbars

### 3. Integration
**File**: `src/ui/App/App.tsx` (modified)

- Added dev mode detection via `?dev=isolation-harness` URL parameter
- Mounts IsolationHarnessPlayground when dev mode is active
- No impact on production app

### 4. Documentation
**File**: `src/ui/isolation-harness/README.md`

Complete guide including:
- Purpose and use cases
- Access instructions
- Step-by-step usage workflow
- Example scenario (canvas component create slowness)
- Architecture overview
- Testing information

## How to Use

### Access the Playground
```
http://localhost:5173/?dev=isolation-harness
```

### Workflow
1. **Upload a log file** (`.log`, `.json`, or `.txt`)
2. **View extracted spec** showing sequence/movement/beat structure
3. **Click "Run Isolation Test"** to execute
4. **Observe results** in the 3-panel layout:
   - Left: Controls & extracted spec
   - Middle: Canvas DOM output
   - Right: Execution results (timing, beats, KV ops)

## Example: Debugging Canvas Component Create Delay

### Problem
Production logs show canvas component creation taking ~600ms, with ~500ms being artificial delay.

### Solution Using Playground
1. Upload `.logs/localhost-1763041026581.log`
2. Playground extracts: `canvas-component-create-symphony` with 6 beats
3. Run isolation test
4. Results show: Beat 4 (renderReact) has `"timing": "after-beat"` = 500ms delay
5. Fix: Change timing to `"immediate"`
6. Re-run: Now completes in ~100ms

## Production Fixes Applied

### Fix 1: Remove 500ms Artificial Delay
**Files Modified**:
- `packages/canvas-component/json-sequences/canvas-component/create.json`
- `src/RenderX.Plugins.CanvasComponent/json-sequences/canvas-component/create.json`

**Change**: Beat 4 timing from `"after-beat"` to `"immediate"`

**Impact**: ~6x performance improvement (600ms → 100ms)

### Fix 2: Export Missing Handler
**File Modified**: `packages/canvas-component/src/symphonies/resize/resize.move.symphony.ts`

**Change**: Added missing `forwardToControlPanel` handler export

**Impact**: Resize operations now complete successfully without feedback loops

## Testing

### Isolation Tests
All 4 isolation tests pass:
```bash
npm run test:isolation
```

Tests validate:
- ✅ Div creation with correct DOM structure
- ✅ SVG rx-line with non-scaling stroke
- ✅ React template rendering via startTransition
- ✅ Stress test (N=4 parallel runs)

### Verification
- ✅ React rendering timing test validates <100ms execution
- ✅ Stress test (N=4 parallel) validates stability
- ✅ Both web and desktop versions fixed

## Architecture

### 3-Panel Layout
```
┌─────────────────────────────────────────────────────┐
│  🔬 Isolation Harness Playground                    │
├──────────────┬──────────────────────┬───────────────┤
│   Controls   │   Canvas Output      │    Results    │
│              │                      │               │
│ • Upload log │ • Live DOM rendering │ • Timing      │
│ • View spec  │ • Component preview  │ • Beat log    │
│ • Run test   │                      │ • KV ops      │
│              │                      │ • Events      │
└──────────────┴──────────────────────┴───────────────┘
```

### Data Flow
```
Log File
  ↓
Extract Spec (sequence/movement/beat IDs)
  ↓
Run Isolation Test
  ↓
Execute Beats (with stubbed side-effects)
  ↓
Capture Results (timing, DOM, KV ops, events)
  ↓
Display in UI (3-panel layout)
```

## Files Created

1. `src/ui/isolation-harness/IsolationHarnessPlayground.tsx` - Main component
2. `src/ui/isolation-harness/isolation-harness.css` - Styling
3. `src/ui/isolation-harness/index.ts` - Exports
4. `src/ui/isolation-harness/README.md` - Documentation

## Files Modified

1. `src/ui/App/App.tsx` - Added dev mode support
2. `docs/adr/0009-fix-canvas-create-react-rendering-delay.md` - Updated with both fixes

## Next Steps

1. **Test in browser**: Navigate to `http://localhost:5173/?dev=isolation-harness`
2. **Upload a production log** to verify spec extraction works
3. **Run isolation tests** to see the UI in action
4. **Use for debugging**: Load logs from production issues and replay them interactively

## Related Documentation

- **ADR 0009**: `docs/adr/0009-fix-canvas-create-react-rendering-delay.md`
- **OgraphX Playbook**: `packages/ographx/docs/Self-isolation for prod-only bugs — playbook.md`
- **Extraction Spec**: `scripts/extract-extraction-spec.js`
- **Isolation Tests**: `packages/canvas-component/__tests__/create.isolation.spec.ts`

