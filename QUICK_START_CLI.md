# Quick Start: CLI → Browser Connection

## ✅ The Fix is Complete!

The CLI now connects to your running browser via WebSocket instead of creating its own isolated conductor.

## How to Use

### Step 1: Start the Dev Server

```bash
npm run dev
```

Wait for it to start on http://localhost:5173

### Step 2: Test the Connection

In a **new terminal**, run:

```bash
node scripts/test-cli-connection.js
```

**What you should see:**

1. ✅ Terminal shows: "Connected to browser conductor WebSocket"
2. ✅ Terminal shows: "Command acknowledged!"
3. ✅ **Browser shows: A button appears on the canvas at position (150, 150)**

### Step 3: Verify the Fix

Open the browser at http://localhost:5173 and you should see:
- A button labeled "CLI Test Button" on the canvas
- Console logs showing the sequence execution

## What Changed?

### Before (Broken)
```
CLI (Node.js) → Creates own conductor → ❌ Isolated, no browser interaction
```

### After (Fixed)
```
CLI (Node.js) → WebSocket → Vite Server → Browser Conductor → ✅ Real execution!
```

## Architecture

```
┌─────────────┐         WebSocket          ┌──────────────┐
│             │    ws://localhost:5173     │              │
│  CLI Tool   │ ◄─────────────────────────►│ Vite Server  │
│  (Node.js)  │      /conductor-ws          │              │
└─────────────┘                             └──────────────┘
                                                    │
                                                    │ HMR
                                                    ▼
                                            ┌──────────────┐
                                            │   Browser    │
                                            │  Conductor   │
                                            └──────────────┘
```

## Files Changed

1. **vite.config.js** - Added WebSocket server
2. **src/infrastructure/cli-bridge.ts** - Browser client to receive commands
3. **src/index.tsx** - Initialize CLI bridge
4. **packages/musical-conductor/tools/cli/engines/SequencePlayerEngine.ts** - Connect via WebSocket

## Troubleshooting

### "Connection failed"
- Make sure `npm run dev` is running
- Check that port 5173 is not blocked
- Verify no other process is using port 5173

### "Conductor not found"
- Wait a few seconds for the app to fully initialize
- Check browser console for errors
- Refresh the browser page

### Button doesn't appear
- Check browser console for errors
- Verify the canvas is visible
- Try clicking on the canvas area

## Next Steps

Now you can:
- ✅ Trigger sequences from the CLI
- ✅ See components appear on the canvas
- ✅ Debug performance issues with real timing data
- ✅ Test fixes without manual browser interaction

See **docs/CLI_BROWSER_CONNECTION_FIX.md** for technical details.

