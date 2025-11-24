# 🔬 Production Log Harness - User Guide

## Overview

The Isolation Harness now has a **Production Log Mode** that lets you:

1. **Load a production log** showing the actual delay
2. **Extract sequence data** (beats, handlers, timing)
3. **Unmock beats one by one** to find which code causes the delay
4. **See the "aha!" moment** when the slow beat is unmocked

## How to Use

### Step 1: Open the Harness

Go to: `http://localhost:5173/?dev=isolation-harness`

### Step 2: Switch to Production Log Mode

Click the **"📊 Production Log Mode"** button at the top

### Step 3: Load Your Production Log

1. Open the production log file (e.g., `.logs/localhost-1763041026581.log`)
2. Copy the entire log content
3. Paste it into the **"📋 Load Production Log"** textarea
4. Click **"🔍 Extract Sequence Data"**

### Step 4: Unmock Beats to Find the Delay

The harness will show all 6 beats from the Canvas Component Create sequence:

```
Beat 1: resolveTemplate (timing: immediate)
Beat 2: registerInstance (timing: immediate)
Beat 3: createNode (timing: immediate)
Beat 4: renderReact (timing: after-beat)  ← THIS ONE HAS THE 500ms DELAY!
Beat 5: notifyUi (timing: immediate)
Beat 6: enhanceLine (timing: immediate)
```

**Start with all beats MOCKED (unchecked):**
- Click **"▶️ Run Sequence"**
- You'll see: ~12ms total (all mocked)

**Then unmock Beat 4:**
- Check the checkbox for "Beat 4: renderReact (timing: after-beat)"
- Click **"▶️ Run Sequence"**
- You'll see: ~512ms total (500ms delay + 12ms execution)

**This is the "aha!" moment!** 🎯

### Step 5: Analyze the Results

The results panel shows:

- **Total Duration**: How long the sequence took
- **Beat Breakdown**: Each beat's execution time and whether it was mocked/unmocked
- **Analysis**: Highlights which beats are slow

## Expected Results

### All Mocked (Baseline)
```
Total Duration: ~12ms
Beat 1: 2ms (🎭 MOCKED)
Beat 2: 2ms (🎭 MOCKED)
Beat 3: 2ms (🎭 MOCKED)
Beat 4: 2ms (🎭 MOCKED)
Beat 5: 2ms (🎭 MOCKED)
Beat 6: 2ms (🎭 MOCKED)
```

### Beat 4 Unmocked
```
Total Duration: ~512ms
Beat 1: 2ms (🎭 MOCKED)
Beat 2: 2ms (🎭 MOCKED)
Beat 3: 2ms (🎭 MOCKED)
Beat 4: 510ms (✨ UNMOCKED) ← 500ms delay + 10ms execution
Beat 5: 2ms (🎭 MOCKED)
Beat 6: 2ms (🎭 MOCKED)
```

## The Root Cause

The delay is caused by the `"timing": "after-beat"` configuration in Beat 4:

```json
{
  "beat": 4,
  "handler": "renderReact",
  "timing": "after-beat",  ← This causes 500ms delay!
  "kind": "stage-crew"
}
```

At 120 BPM, `"after-beat"` timing = 500ms delay before the beat executes.

## Next Steps

Once you've confirmed the delay is in Beat 4:

1. **Change the timing** from `"after-beat"` to `"immediate"` in:
   - `packages/canvas-component/json-sequences/canvas-component/create.json`

2. **Verify the fix** by running the harness again with Beat 4 unmocked
   - Should now show ~12ms instead of ~512ms

3. **Test in production** to confirm the fix works

## Console Logs

The harness logs everything to the browser console. Open DevTools (F12) to see:

```
🔍 [Log Extractor] Parsing production log...
✅ [Log Extractor] Extracted: { beats: 6, totalDuration: 588 }
🎬 [Unmocking] Running sequence with unmocked beats: [4]
🥁 [Beat 1] resolveTemplate (timing: immediate)
   🎭 [MOCKED] Simulating resolveTemplate
   ✓ Beat 1 completed in 2ms (MOCKED)
...
🥁 [Beat 4] renderReact (timing: after-beat)
   ⏱️ Waiting 500ms for beat timing (after-beat)
   ✨ [UNMOCKED] Executing real handler: renderReact
   ✓ Beat 4 completed in 510ms (UNMOCKED)
...
✅ Sequence completed in 512ms
```

## Troubleshooting

**Q: The extraction doesn't find any beats**
- Make sure you copied the entire log file
- The log must contain "Canvas Component Create" entries

**Q: The timing doesn't show 500ms**
- Check that Beat 4 has `"timing": "after-beat"` in the log
- The harness simulates the timing based on the log data

**Q: I want to test with real handlers**
- The current version simulates handlers
- Real handler integration is coming next!

