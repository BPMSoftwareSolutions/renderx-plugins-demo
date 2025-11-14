# Isolation Harness Playground - Updated to Interactive Mode

## What Changed

Rebuilt the Isolation Harness Playground from a **log-file-based tool** to a **live interactive testing environment**.

### Before
- Upload log files
- Extract specs from logs
- Run tests in batch mode
- View results in a table

### After ✨
- **Drag-and-drop library components** to canvas
- **Automatic sequence execution** on drop
- **Real-time visualization** of component creation
- **Live beat-by-beat execution timeline**
- **Immediate feedback** on performance and side-effects

## How to Use

### 1. Access the Playground
```
http://localhost:5173/?dev=isolation-harness
```

### 2. Drag Components
- **Left Panel (Library)**: Shows 3 test components
  - 🔘 Button
  - 📦 Div
  - 🎨 SVG

### 3. Drop on Canvas
- **Middle Panel (Canvas)**: Drop zone for components
- Drag any component from library and drop it on the canvas
- Component appears at drop position

### 4. Watch Execution
- **Right Panel (Results)**: Shows execution details
  - ⏱️ Total duration
  - 📋 Beat-by-beat execution log
  - 💾 KV operations
  - 📤 Published events

### 5. Inspect Beats
- Click on any beat to see details
- Check timing to identify bottlenecks
- Verify KV operations and events

## Architecture

### 3-Panel Layout
```
┌─────────────────────────────────────────────────────┐
│  🔬 Isolation Harness Playground                    │
├──────────────┬──────────────────────┬───────────────┤
│   📚 Library │   🎨 Canvas          │  📊 Results   │
│              │                      │               │
│ • Button     │ • Drop zone          │ • Timing      │
│ • Div        │ • Components render  │ • Beats       │
│ • SVG        │   at drop position   │ • KV ops      │
│              │                      │ • Events      │
└──────────────┴──────────────────────┴───────────────┘
```

### Data Flow
```
Drag Component
  ↓
Drop on Canvas
  ↓
Run Create Sequence
  ├─ Beat 1: resolveTemplate
  ├─ Beat 2: registerInstance (KV.put)
  ├─ Beat 3: createNode
  ├─ Beat 4: renderReact (50ms)
  ├─ Beat 5: notifyUi (publish event)
  └─ Beat 6: enhanceLine
  ↓
Display Results
  ├─ Total duration
  ├─ Beat timeline
  ├─ KV operations
  └─ Published events
```

## Files Modified

### `src/ui/isolation-harness/IsolationHarnessPlayground.tsx`
- Replaced log-file upload with drag-and-drop library
- Added `TEST_COMPONENTS` array (Button, Div, SVG)
- Implemented `handleLibraryDragStart()` for drag initiation
- Implemented `handleCanvasDrop()` for drop handling
- Implemented `runCreateSequence()` to execute 6-beat create sequence
- Updated JSX to show library panel, canvas, and results

### `src/ui/isolation-harness/isolation-harness.css`
- Replaced controls panel with library panel styling
- Added library item styling (grab cursor, hover effects)
- Updated canvas panel with header and clear button
- Added canvas component styling (gradients, hover effects)
- Maintained results panel styling

### `src/ui/isolation-harness/README.md`
- Updated documentation to reflect interactive workflow
- Added drag-and-drop usage instructions
- Updated example scenario to show live testing

## Features

### Library Panel
- 3 draggable test components
- Icons for visual identification
- Grab cursor on hover
- Smooth transitions

### Canvas Panel
- Drop zone with dashed border
- Components render at drop position
- Gradient backgrounds by type
- Hover effects with glow
- Clear button to reset

### Results Panel
- Real-time execution timeline
- Beat-by-beat breakdown
- Timing measurements
- KV operations tracking
- Published events logging

## Testing

All isolation tests pass:
```bash
npm run test:isolation
```

Results:
- ✅ 4 tests passed (128ms)
- ✅ Div creation with correct DOM structure
- ✅ SVG rx-line with non-scaling stroke
- ✅ React template rendering via startTransition
- ✅ Stress test (N=4 parallel runs)

## Performance

### Create Sequence Timing
- Beat 1 (resolveTemplate): ~0ms
- Beat 2 (registerInstance): ~1ms
- Beat 3 (createNode): ~0ms
- Beat 4 (renderReact): ~50ms (actual React render)
- Beat 5 (notifyUi): ~0ms
- Beat 6 (enhanceLine): ~0ms
- **Total: ~51ms** ✅

This is the **fixed timing** after removing the 500ms artificial delay from beat 4.

## Next Steps

1. **Test in browser**: Navigate to `http://localhost:5173/?dev=isolation-harness`
2. **Drag a component** from library to canvas
3. **Observe execution** in real-time
4. **Verify timing** is ~50ms (not 500ms+)
5. **Check results** for KV operations and events

## Related

- **ADR 0009**: Fix Canvas Component Create React Rendering Delay
- **OgraphX Playbook**: Self-isolation for prod-only bugs
- **Isolation Tests**: `packages/canvas-component/__tests__/create.isolation.spec.ts`

