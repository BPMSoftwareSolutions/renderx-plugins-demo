# Console Logging Guide - Isolation Harness Playground

## Overview

The Isolation Harness Playground now logs detailed information to the browser console as you interact with it. This helps you understand what's happening at each step of the component creation sequence.

## How to View Console Logs

1. **Open the playground**: `http://localhost:5173/?dev=isolation-harness`
2. **Open browser DevTools**: Press `F12` or `Ctrl+Shift+I`
3. **Go to Console tab**: Click the "Console" tab
4. **Drag a component** from library to canvas
5. **Watch the logs** appear in real-time

## Console Output Example

When you drag a Button from the library and drop it on the canvas, you'll see:

```
🎨 [Playground] Drag started: btn-1
🎨 [Playground] Drop detected on canvas
📍 [Playground] Drop position: (150, 200)
✨ [Playground] Creating component: {id: "btn-1-1731600000000", type: "button", x: 150, y: 200, width: 80, height: 40, label: "Button"}
🎵 [Playground] Starting create sequence...
🎼 [Sequence] canvas-component-create-symphony starting
📦 [Input] Component: {id: "btn-1-1731600000000", type: "button", x: 150, y: 200, width: 80, height: 40, label: "Button"}
🎵 [Beat 1] resolveTemplate
   ✓ Beat 1 completed in 0ms
🎵 [Beat 2] registerInstance
   → kv.put("component:btn-1-1731600000000", ...)
   ✓ Beat 2 completed in 0ms
🎵 [Beat 3] createNode
   ✓ Beat 3 completed in 0ms
🎵 [Beat 4] renderReact (timing: immediate)
   ✓ Beat 4 completed in 50ms (React render)
🎵 [Beat 5] notifyUi
   → publish("canvas.component.created", { id: "btn-1-1731600000000" })
   ✓ Beat 5 completed in 0ms
🎵 [Beat 6] enhanceLine
   ✓ Beat 6 completed in 0ms
✅ [Sequence] Completed in 51ms
📊 [Results] {totalDuration: 51, beats: 6, kvOps: 1, events: 1}
```

## Log Categories

### 🎨 Playground Events
- `🎨 [Playground] Drag started` - Component drag initiated
- `🎨 [Playground] Drop detected on canvas` - Drop event received
- `📍 [Playground] Drop position` - Where component was dropped
- `✨ [Playground] Creating component` - Component instance created
- `🎵 [Playground] Starting create sequence` - Sequence execution starting

### 🎼 Sequence Execution
- `🎼 [Sequence] canvas-component-create-symphony starting` - Sequence begins
- `📦 [Input] Component` - Input data for the sequence
- `✅ [Sequence] Completed in XXms` - Sequence finished
- `❌ [Sequence] Error` - Sequence failed

### 🎵 Beat Execution
- `🎵 [Beat N] handler-name` - Beat starting
- `✓ Beat N completed in XXms` - Beat finished
- `→ kv.put(...)` - KV operation performed
- `→ publish(...)` - Event published

### 📊 Results Summary
- `📊 [Results]` - Final timing and operation counts

## Performance Metrics

### Expected Timing (After Fix)
```
Beat 1 (resolveTemplate):  ~0ms
Beat 2 (registerInstance): ~0ms
Beat 3 (createNode):       ~0ms
Beat 4 (renderReact):      ~50ms ✅ (was 500ms before fix)
Beat 5 (notifyUi):         ~0ms
Beat 6 (enhanceLine):      ~0ms
─────────────────────────────────
Total:                     ~51ms ✅
```

### What to Look For

1. **Beat 4 Timing**: Should be ~50ms (actual React render), NOT 500ms
2. **Total Duration**: Should be ~51ms, NOT 600ms+
3. **KV Operations**: Should show `kv.put` with component ID
4. **Events**: Should show `canvas.component.created` event

## Troubleshooting

### No Console Logs Appearing?

1. **Check DevTools is open**: Press `F12`
2. **Check Console tab**: Click "Console" tab
3. **Check filter**: Make sure filter is not hiding logs
4. **Check log level**: Make sure "All levels" is selected

### Logs Show Errors?

1. **Check component type**: Should be "button", "div", or "svg"
2. **Check drop position**: Should be positive numbers
3. **Check canvas ref**: Should be available when dropping

### Performance Issues?

1. **Beat 4 taking 500ms+?**: Indicates stale bundle or timing configuration issue
2. **Total duration > 100ms?**: Check for blocking operations
3. **Missing KV operations?**: Check registerInstance beat

## Example Workflows

### Workflow 1: Test Button Creation
```
1. Open playground
2. Open DevTools (F12)
3. Go to Console tab
4. Drag Button from library
5. Drop on canvas
6. Watch logs appear
7. Verify Beat 4 is ~50ms
8. Verify total is ~51ms
```

### Workflow 2: Test Multiple Components
```
1. Drag Button → observe logs
2. Click Clear
3. Drag Div → observe logs
4. Click Clear
5. Drag SVG → observe logs
6. Compare timing across types
```

### Workflow 3: Debug Performance Issue
```
1. Drag component
2. Check Beat 4 timing
3. If > 100ms:
   - Check for stale bundle
   - Clear Vite cache
   - Rebuild
4. Re-test and verify timing
```

## Related

- **Playground**: `http://localhost:5173/?dev=isolation-harness`
- **Source**: `src/ui/isolation-harness/IsolationHarnessPlayground.tsx`
- **ADR 0009**: `docs/adr/0009-fix-canvas-create-react-rendering-delay.md`
- **Isolation Tests**: `packages/canvas-component/__tests__/create.isolation.spec.ts`

