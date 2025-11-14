# ✅ Console Logging Added to Isolation Harness Playground

## Summary

Added comprehensive console logging to the Isolation Harness Playground so you can see exactly what's happening when you drag and drop components.

## What You'll See

When you drag a component from the library and drop it on the canvas, the browser console will show:

### 1. Drag Event
```
🎨 [Playground] Drag started: btn-1
```

### 2. Drop Event
```
🎨 [Playground] Drop detected on canvas
📍 [Playground] Drop position: (150, 200)
✨ [Playground] Creating component: {id: "btn-1-1731600000000", type: "button", ...}
🎵 [Playground] Starting create sequence...
```

### 3. Sequence Execution
```
🎼 [Sequence] canvas-component-create-symphony starting
📦 [Input] Component: {id: "btn-1-1731600000000", type: "button", ...}
```

### 4. Beat-by-Beat Execution
```
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
```

### 5. Completion Summary
```
✅ [Sequence] Completed in 51ms
📊 [Results] {totalDuration: 51, beats: 6, kvOps: 1, events: 1}
```

## How to View Logs

1. **Open playground**: `http://localhost:5173/?dev=isolation-harness`
2. **Open DevTools**: Press `F12` or `Ctrl+Shift+I`
3. **Go to Console**: Click the "Console" tab
4. **Drag a component** from library to canvas
5. **Watch logs** appear in real-time

## Log Categories

| Icon | Category | Example |
|------|----------|---------|
| 🎨 | Playground events | Drag started, drop detected |
| 📍 | Position info | Drop position coordinates |
| ✨ | Component creation | Creating component instance |
| 🎵 | Sequence/Beat events | Starting sequence, beat execution |
| 🎼 | Sequence info | Sequence name and input |
| 📦 | Input data | Component data |
| → | Side effects | kv.put, publish events |
| ✓ | Success | Beat completed |
| ✅ | Completion | Sequence finished |
| 📊 | Results | Summary statistics |
| ❌ | Errors | Execution errors |

## Performance Verification

### Expected Output
```
✓ Beat 4 completed in 50ms (React render)
✅ [Sequence] Completed in 51ms
```

### What This Means
- **Beat 4**: ~50ms (actual React render time) ✅
- **Total**: ~51ms (all 6 beats) ✅
- **Before fix**: Beat 4 was 500ms, total was 600ms ❌

## Files Modified

### `src/ui/isolation-harness/IsolationHarnessPlayground.tsx`

**Changes**:
1. Added console.log to `handleLibraryDragStart()`
2. Added console.log to `handleCanvasDrop()`
3. Added detailed logging to `runCreateSequence()`
4. Updated `IsolationHarnessState` type to support 3-element KV ops

**Logging Points**:
- Drag start event
- Drop detection
- Drop position
- Component creation
- Sequence start
- Each beat execution
- KV operations
- Event publishing
- Sequence completion
- Error handling

## Testing

✅ All tests pass:
```bash
npm run test:isolation
→ 4 tests passed (118ms)
```

## Usage Examples

### Example 1: Test Button Creation
```
1. Open http://localhost:5173/?dev=isolation-harness
2. Press F12 to open DevTools
3. Click Console tab
4. Drag Button from library
5. Drop on canvas
6. See logs showing:
   - Drag started
   - Drop position
   - 6 beats executing
   - Total time: ~51ms
```

### Example 2: Debug Performance
```
1. Drag component
2. Check Beat 4 timing in console
3. If > 100ms:
   - Indicates stale bundle or timing issue
   - Clear Vite cache
   - Rebuild and retry
4. Verify Beat 4 is now ~50ms
```

### Example 3: Verify Side Effects
```
1. Drag component
2. Look for:
   - "→ kv.put(...)" - KV operation
   - "→ publish(...)" - Event published
3. Verify component ID matches
4. Verify event topic is correct
```

## Console Output Format

Each log line includes:
- **Icon**: Visual indicator (🎨, 🎵, ✓, etc.)
- **Category**: [Playground], [Sequence], [Beat N], [Results]
- **Message**: What happened
- **Data**: Relevant values (timing, IDs, etc.)

Example:
```
🎵 [Beat 4] renderReact (timing: immediate)
   ✓ Beat 4 completed in 50ms (React render)
```

## Troubleshooting

### No logs appearing?
- Check DevTools is open (F12)
- Check Console tab is selected
- Check filter is not hiding logs
- Try dragging again

### Logs show errors?
- Check component type is valid (button, div, svg)
- Check drop position is on canvas
- Check canvas ref is available

### Performance issues?
- Check Beat 4 timing (should be ~50ms)
- Check total duration (should be ~51ms)
- If > 100ms, clear Vite cache and rebuild

## Related Documentation

- **Playground**: `http://localhost:5173/?dev=isolation-harness`
- **Console Guide**: `CONSOLE_LOGGING_GUIDE.md`
- **Source**: `src/ui/isolation-harness/IsolationHarnessPlayground.tsx`
- **ADR 0009**: `docs/adr/0009-fix-canvas-create-react-rendering-delay.md`

