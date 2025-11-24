# Live Diagnostics Event Tap - Setup & Usage Guide

## Overview

The **live diagnostics event tap** is a CLI-driven, process-independent diagnostic streaming system that allows you to observe all conductor events in real-time while the app is running. If the app crashes or hangs, the CLI remains responsive and captures the last events.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│ Browser App (port 5173)                                             │
├─────────────────────────────────────────────────────────────────────┤
│  • UI event handlers (wiring.ts) publish topics                     │
│  • EventRouter publishes canvas.component.resize.* events           │
│  • emitDiagnostic() forwards events to HMR channel                  │
│  • Vite HMR receives diagnostics:event messages                     │
└────────────────┬────────────────────────────────────────────────────┘
                 │ HMR Channel
                 │ (Vite dev server)
                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│ Vite Dev Server (5173)                                              │
├─────────────────────────────────────────────────────────────────────┤
│  • WebSocket handler at /conductor-ws                               │
│  • Listens for diagnostics:subscribe from CLI                       │
│  • Forwards filtered diagnostics:event from HMR to CLI              │
└────────────────┬────────────────────────────────────────────────────┘
                 │ WebSocket /conductor-ws
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│ CLI Observer (Node.js separate process)                             │
├─────────────────────────────────────────────────────────────────────┤
│  • npm run conductor:observe [--source X] [--topic Y] [--verbose]   │
│  • Connects via WebSocket and subscribes to diagnostics stream      │
│  • Prints events to stdout (can be piped/logged)                    │
│  • Survives browser crashes/hangs                                   │
└─────────────────────────────────────────────────────────────────────┘
```

## Components

### 1. **Host-side Event Tap** (`src/ui/diagnostics/eventTap.ts`)

Provides a central pub-sub for diagnostic events:
- `emitDiagnostic(event)` - Broadcast an event to all listeners
- `addDiagnosticListener(listener)` - Subscribe to events
- `enableDiagnostics()` / `disableDiagnostics()` - Toggle the tap on/off

### 2. **Console Listener** (`src/ui/diagnostics/consoleListener.ts`)

Prints diagnostics to the browser console:
- Attached automatically when diagnostics are enabled
- Formats events as `[RX DIAG] <timestamp> [source] (level) message`

### 3. **Bootstrap Integration** (`src/index.tsx`)

Initializes diagnostics on app startup:
- Checks `window.__RENDERX_DEV_DIAGNOSTICS__` flag
- Enables/disables via `window.RenderX.diagnostics.enable()`
- Forwards HMR diagnostics events to Vite dev server

### 4. **Event Wiring** (`src/ui/events/wiring.ts`)

Emits diagnostics when UI events are published:
- Calls `emitDiagnostic` before publishing each topic
- Captures topic name, payload, and event ID

### 5. **Resize Handler** (`packages/canvas-component/src/symphonies/select/select.overlay.resize.stage-crew.ts`)

Emits diagnostics for resize interactions:
- Captures `canvas.component.resize.start`, `.move`, `.end` events
- Forwards through `getDiagnosticsEmitter()` helper

### 6. **Vite WebSocket Server** (`vite.config.js`)

Bridges the diagnostics stream to CLI:
- Listens for `diagnostics:subscribe` commands from CLI
- Filters events by topic/source/level
- Forwards filtered events as `diagnostics:event` messages

### 7. **CLI Observer** (`packages/musical-conductor/tools/cli/sequence-player-cli.cjs`)

Consumes the diagnostics stream:
- Subcommand: `observe` (e.g., `npm run conductor:observe`)
- Supports filtering: `--source`, `--topic`, `--level`
- Outputs JSON or human-readable format

---

## Usage

### 1. Start the Dev Server

```bash
npm run dev
```

The dev server will start on port 5173. Vite's WebSocket will be ready to receive HMR messages and CLI connections.

### 2. Enable Diagnostics in the Browser

In your app's browser DevTools Console, run:

```js
window.__RENDERX_DEV_DIAGNOSTICS__ = true;
window.location.reload();
```

After reload, you should see `[RX DIAG]` messages in the console as you interact with the app.

Alternatively, expose the API directly:

```js
window.RenderX.diagnostics.enable();
window.RenderX.diagnostics.disable();
window.RenderX.diagnostics.isEnabled(); // check status
```

### 3. Start the CLI Observer (in a separate terminal)

```bash
# Stream all diagnostics events
npm --prefix packages/musical-conductor run conductor:observe

# Filter by source (EventRouter, EventBus, Sequence, etc.)
npm --prefix packages/musical-conductor run conductor:observe -- --source EventRouter

# Filter by topic (e.g., only resize-related)
npm --prefix packages/musical-conductor run conductor:observe -- --topic canvas.component.resize

# JSON output (useful for piping to analysis scripts)
npm --prefix packages/musical-conductor run conductor:observe -- --json

# Include full data payloads
npm --prefix packages/musical-conductor run conductor:observe -- --verbose

# Combine filters
npm --prefix packages/musical-conductor run conductor:observe -- --source EventRouter --topic canvas.component.resize.move --verbose
```

### 4. Interact with the App

With the CLI observer running, resize a component in the browser:

- Select a canvas component (e.g., `rx-node-560ikt`)
- Drag-resize it

You should see output in the CLI terminal like:

```
✅ Connected to diagnostics stream on port 5173
🔍 Subscribed to diagnostics stream (Ctrl+C to exit)...
✅ Diagnostics subscription established xxxx

[2025-11-16T17:50:12.345Z] [EventRouter] DEBUG Topic 'canvas.component.resize.start' published from resize handler
[2025-11-16T17:50:12.346Z] [EventRouter] DEBUG Topic 'canvas.component.resize.move' published from resize handler
[2025-11-16T17:50:12.347Z] [EventRouter] DEBUG Topic 'canvas.component.resize.move' published from resize handler
[2025-11-16T17:50:12.348Z] [EventRouter] DEBUG Topic 'canvas.component.resize.move' published from resize handler
[2025-11-16T17:50:12.500Z] [EventRouter] DEBUG Topic 'canvas.component.resize.end' published from resize handler
```

---

## For the Resize Loop Bug

### Use Case 1: Capture a Burst

If you resize `rx-node-560ikt` and see a burst of `canvas.component.resize.move` events, you can:

```bash
# Observe only resize-move events
npm --prefix packages/musical-conductor run conductor:observe -- --topic "canvas.component.resize.move" --verbose

# Resize in the browser, then note the event count and frequency
# Copy the terminal output to a file for analysis
```

### Use Case 2: Verify the Fix

After we implement the host-side event guard (deduplication at the source), re-run the same command and you should see:

- **Fewer total events** (only unique geometry changes produce events)
- **More consistent timing** (no burst of identical events)
- **App stays responsive** (no hang)

---

## Implementation Details

### Diagnostics Event Shape

```typescript
interface DiagnosticEvent {
  timestamp: string;          // ISO timestamp
  level: "debug" | "info" | "warn" | "error";
  source: "EventBus" | "EventRouter" | "Sequence" | "Plugin" | "System";
  message: string;            // Human-readable message
  data?: any;                 // Structured payload (topic, event, etc.)
}
```

### How Events Flow

1. **Publish occurs** (e.g., `EventRouter.publish("canvas.component.resize.move", { ... })`)
2. **Diagnostic hook emits** → `emitDiagnostic({ source: "EventRouter", message: "...", data: { topic, payload } })`
3. **Browser HMR listener** forwards to Vite server → `server.ws.send('diagnostics:event', event)`
4. **Vite WebSocket server** receives from HMR, checks subscribers
5. **CLI client** receives filtered event via `/conductor-ws` and prints

### Filtering Logic

- **--topic**: Checks if the event's `data.topic` or `data.eventName` contains the filter string
- **--source**: Exact match on the event's `source` field
- **--level**: Exact match on the event's `level` field

---

## Troubleshooting

### Q: CLI says "Could not connect to conductor on any port (5173/5174/5175)"

**A**: Make sure the dev server is running (`npm run dev`) and Vite is listening on one of those ports.

### Q: I don't see any diagnostics events in the CLI

**A**: 

1. Confirm diagnostics are **enabled** in the browser:

   ```js
   window.RenderX.diagnostics.isEnabled()  // should return true
   ```

2. Interact with the app (resize, click, etc.) to trigger events

3. Check the browser console for `[RX DIAG]` messages to confirm events are being emitted

### Q: I see events in the browser console but not in the CLI

**A**: The HMR channel might not be forwarding. Check:

1. Browser DevTools Network tab for active WebSocket connections
2. Vite dev server logs for any WebSocket errors
3. Try resetting: reload browser, restart CLI observer

### Q: The app hangs but the CLI keeps going

**A**: Perfect! This is exactly the intended behavior. The CLI is a separate process connected via WebSocket, so it survives browser issues. The last events printed in the CLI will show you what the app was doing when it hung.

---

## Future Enhancements

- [ ] **Persistence**: Option to automatically save diagnostics stream to `.logs` file
- [ ] **Advanced filtering**: Regex patterns, time-based filtering, event source filtering
- [ ] **UI panel**: React component in the app itself showing live diagnostics overlay
- [ ] **Event correlation**: Cross-reference related events (e.g., all moves in a single drag)
- [ ] **Replay**: Save and replay a diagnostics stream to reproduce bugs
- [ ] **Performance profiling**: Annotate events with their execution time

---

## Related Files

- `src/ui/diagnostics/eventTap.ts` - Core pub-sub module
- `src/ui/diagnostics/consoleListener.ts` - Browser console integration
- `src/index.tsx` - Bootstrap and HMR forwarding
- `src/ui/events/wiring.ts` - UI event hook
- `packages/canvas-component/src/symphonies/select/select.overlay.resize.stage-crew.ts` - Resize event hook
- `vite.config.js` - WebSocket server and filtering
- `packages/musical-conductor/tools/cli/sequence-player-cli.cjs` - CLI observer command
- `packages/musical-conductor/package.json` - npm script `conductor:observe`

---

## Summary

With the live diagnostics event tap enabled and the CLI observer running, you now have a **CLI-driven, process-independent window into the conductor's event stream**. This gives you real-time visibility into what's happening during resize operations, drag-drop interactions, and any other event-driven features—and it survives app crashes and hangs.

Use this to debug the resize loop, verify fixes, and build confidence that your application's event flow is working as intended.
