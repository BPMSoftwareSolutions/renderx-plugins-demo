# Isolation Harness Playground

Interactive UI for testing canvas-component sequences in isolation, without needing the full dev server.

## Purpose

The isolation harness solves **prod-only anomalies** that are hard to reproduce locally:
- Stale bundles / caching issues
- Race conditions / timing issues
- Data-shape drift

Instead of trying to reproduce these in a dev server (which is brittle), the harness:
1. **Drag components from library** to canvas
2. **Automatically runs the create sequence** in isolation
3. **Stubs all side-effects** (DOM, IO, EventRouter) so inputs are deterministic
4. **Visualizes execution** with beat-by-beat timing and results
5. **Keeps a permanent regression test** once the bug is fixed

## Access

Open the playground in dev mode:
```
http://localhost:5173/?dev=isolation-harness
```

## Usage

### 1. Drag from Library
- Left panel shows test components: **Button**, **Div**, **SVG**
- Click and drag any component to the canvas

### 2. Drop on Canvas
- Drop the component anywhere on the canvas
- The isolation harness automatically runs the **create sequence**

### 3. Watch Execution
- **Canvas panel** shows the created component with position
- **Results panel** displays:
  - ⏱️ **Total Duration** - How long the sequence took
  - 📋 **Beats** - Each beat with handler name, duration, and status
  - 💾 **KV Operations** - Persistence calls (e.g., `kv.put`)
  - 📤 **Events** - Published events (e.g., `canvas.component.created`)

### 4. Inspect Results
- Click on individual beats to see details
- Check timing to identify bottlenecks
- Review KV operations to verify persistence
- Inspect published events to validate side-effects

### 5. Clear and Retry
- Click **Clear** to reset the canvas
- Drag another component to test again

## Example Workflow

### Scenario: Test Canvas Component Create Performance

1. **Open playground**: `http://localhost:5173/?dev=isolation-harness`

2. **Drag Button from library** to canvas at position (100, 50)

3. **Observe results**:
   - Beat 1: `resolveTemplate` - 0ms
   - Beat 2: `registerInstance` - 1ms (stores in KV)
   - Beat 3: `createNode` - 0ms
   - Beat 4: `renderReact` - 50ms (actual React render)
   - Beat 5: `notifyUi` - 0ms (publishes event)
   - Beat 6: `enhanceLine` - 0ms
   - **Total: ~51ms** ✅

4. **Verify KV operations**:
   - `kv.put` called with component ID and data

5. **Verify events**:
   - `canvas.component.created` published with component ID

## Architecture

### Components

- **IsolationHarnessPlayground.tsx**: Main UI component
- **isolation-harness.css**: Styling (3-panel layout)
- **index.ts**: Exports

### Integration

- Accessible via `?dev=isolation-harness` URL parameter
- Mounted in `src/ui/App/App.tsx`
- No dependencies on main app state or plugins

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

## Testing

The isolation harness is tested via:
- `packages/canvas-component/__tests__/create.isolation.spec.ts` (4 tests)
- Tests validate:
  - Div creation with correct DOM structure
  - SVG rx-line with non-scaling stroke
  - React template rendering via startTransition
  - Stress test (N=4 parallel runs)

Run tests:
```bash
npm run test:isolation
```

## Related

- **ADR 0009**: Fix Canvas Component Create React Rendering Delay
- **OgraphX Playbook**: Self-isolation for prod-only bugs
- **Extraction Spec**: `scripts/extract-extraction-spec.js`

