# CLI → Browser Connection Fix

## Problem

The CLI Bug Detective was creating its own isolated conductor instance in Node.js instead of connecting to the running browser conductor. This meant:

- ❌ CLI commands didn't actually trigger sequences in the live browser
- ❌ No way to see components appear on the canvas from CLI
- ❌ The stub implementation returned fake timing data (588ms hardcoded)

## Solution

Implemented a WebSocket bridge between the CLI and the browser conductor:

### 1. WebSocket Server (Vite Plugin)
**File**: `vite.config.js`

Added a WebSocket server that listens on `/conductor-ws` endpoint. The CLI connects to this to send commands to the browser.

```javascript
{
  name: 'conductor-websocket',
  configureServer(server) {
    const wss = new WebSocketServer({ noServer: true });
    // Handles CLI connections and forwards commands to browser
  }
}
```

### 2. Browser Client (CLI Bridge)
**File**: `src/infrastructure/cli-bridge.ts`

Listens for CLI commands via Vite's HMR WebSocket and executes them on the browser conductor.

```typescript
import.meta.hot.on('conductor:cli-command', async (message) => {
  const conductor = window.RenderX?.conductor;
  await conductor.play(pluginId, sequenceId, context);
});
```

### 3. CLI Engine (WebSocket Client)
**File**: `packages/musical-conductor/tools/cli/engines/SequencePlayerEngine.ts`

Connects to the browser via WebSocket instead of creating its own conductor.

```typescript
private async connectWebSocket(): Promise<void> {
  this.ws = new WebSocket('ws://localhost:5173/conductor-ws');
  // Sends commands to browser conductor
}
```

## Usage

### 1. Start the dev server
```bash
npm run dev
```

### 2. Test the connection
```bash
node scripts/test-cli-connection.js
```

This will:
- ✅ Connect to the running browser
- ✅ Send a `canvas.component.create` command
- ✅ Create a button on the canvas
- ✅ You should see "CLI Test Button" appear at position (150, 150)

### 3. Use the CLI
```bash
npm --prefix packages/musical-conductor run conductor:play -- --sequence canvas-component-create-symphony
```

This will now:
- ✅ Connect to the live browser at localhost:5173
- ✅ Execute the sequence in the actual running app
- ✅ Show the component on the canvas
- ✅ Generate a real log file with actual timing data

## Architecture

```
┌─────────────────┐         WebSocket          ┌──────────────────┐
│                 │    ws://localhost:5173     │                  │
│  CLI (Node.js)  │ ◄─────────────────────────►│  Vite Dev Server │
│                 │      /conductor-ws          │                  │
└─────────────────┘                             └──────────────────┘
                                                         │
                                                         │ HMR WebSocket
                                                         ▼
                                                ┌──────────────────┐
                                                │                  │
                                                │  Browser Client  │
                                                │  (Conductor)     │
                                                │                  │
                                                └──────────────────┘
```

## Benefits

✅ **Real execution**: CLI commands run in the actual browser environment
✅ **Visual feedback**: See components appear on the canvas immediately
✅ **Accurate timing**: Get real performance data, not fake stubs
✅ **Live debugging**: Test fixes without manual browser interaction
✅ **Reproducible**: Same environment as production logs

## Next Steps

1. **Enhance response data**: Return actual beat timings from browser to CLI
2. **Add sequence listing**: Get registered sequences from browser
3. **Support mocking**: Implement mock options for detective work
4. **Error handling**: Better error messages and retry logic
5. **Multiple browsers**: Support connecting to different ports/instances

