# 🎯 Finding the Bug - Step-by-Step Workflow

## The Problem

You have a production log showing Canvas Component Create takes **588ms** when it should take ~50ms.

**Question**: Which code execution is causing the 500ms+ delay?

## The Solution: Incremental Unmocking

### Step 1: Start the Harness

```bash
npm run dev
# Open: http://localhost:5173/?dev=isolation-harness
```

### Step 2: Switch to Production Log Mode

Click the **"📊 Production Log Mode"** button

### Step 3: Load the Production Log

1. Open your production log file:
   ```
   .logs/localhost-1763041026581.log
   ```

2. Copy the entire content (Ctrl+A, Ctrl+C)

3. Paste into the textarea in the harness

4. Click **"🔍 Extract Sequence Data"**

**Expected Output in Console:**
```
🔍 [Log Extractor] Parsing production log...
✅ [Log Extractor] Extracted: { beats: 6, totalDuration: 588 }
```

### Step 4: Run Baseline (All Mocked)

**Make sure NO checkboxes are checked**

Click **"▶️ Run Sequence"**

**Expected Result:**
```
Total Duration: ~12ms
Beat 1: 2ms (🎭 MOCKED)
Beat 2: 2ms (🎭 MOCKED)
Beat 3: 2ms (🎭 MOCKED)
Beat 4: 2ms (🎭 MOCKED)
Beat 5: 2ms (🎭 MOCKED)
Beat 6: 2ms (🎭 MOCKED)
```

**Analysis**: All beats are fast when mocked. The delay is in the real code.

### Step 5: Unmock Beat 1

Check the checkbox for **"Beat 1: resolveTemplate (timing: immediate)"**

Click **"▶️ Run Sequence"**

**Expected Result:**
```
Total Duration: ~12ms
Beat 1: 10ms (✨ UNMOCKED)
Beat 2: 2ms (🎭 MOCKED)
Beat 3: 2ms (🎭 MOCKED)
Beat 4: 2ms (🎭 MOCKED)
Beat 5: 2ms (🎭 MOCKED)
Beat 6: 2ms (🎭 MOCKED)
```

**Analysis**: Beat 1 is still fast. Not the culprit.

### Step 6: Unmock Beat 2

Check the checkbox for **"Beat 2: registerInstance (timing: immediate)"**

Click **"▶️ Run Sequence"**

**Expected Result:**
```
Total Duration: ~12ms
Beat 1: 10ms (✨ UNMOCKED)
Beat 2: 10ms (✨ UNMOCKED)
Beat 3: 2ms (🎭 MOCKED)
Beat 4: 2ms (🎭 MOCKED)
Beat 5: 2ms (🎭 MOCKED)
Beat 6: 2ms (🎭 MOCKED)
```

**Analysis**: Beat 2 is still fast. Not the culprit.

### Step 7: Unmock Beat 3

Check the checkbox for **"Beat 3: createNode (timing: immediate)"**

Click **"▶️ Run Sequence"**

**Expected Result:**
```
Total Duration: ~12ms
Beat 1: 10ms (✨ UNMOCKED)
Beat 2: 10ms (✨ UNMOCKED)
Beat 3: 10ms (✨ UNMOCKED)
Beat 4: 2ms (🎭 MOCKED)
Beat 5: 2ms (🎭 MOCKED)
Beat 6: 2ms (🎭 MOCKED)
```

**Analysis**: Beat 3 is still fast. Not the culprit.

### Step 8: Unmock Beat 4 - 🎯 THE "AHA!" MOMENT

Check the checkbox for **"Beat 4: renderReact (timing: after-beat)"**

Click **"▶️ Run Sequence"**

**Expected Result:**
```
Total Duration: ~512ms ⚠️ HUGE JUMP!
Beat 1: 10ms (✨ UNMOCKED)
Beat 2: 10ms (✨ UNMOCKED)
Beat 3: 10ms (✨ UNMOCKED)
Beat 4: 510ms (✨ UNMOCKED) ← 500ms delay + 10ms execution
Beat 5: 2ms (🎭 MOCKED)
Beat 6: 2ms (🎭 MOCKED)
```

**Analysis**: 🚨 **FOUND IT!** Beat 4 causes the 500ms delay!

**Console Output:**
```
🥁 [Beat 4] renderReact (timing: after-beat)
   ⏱️ Waiting 500ms for beat timing (after-beat)
   ✨ [UNMOCKED] Executing real handler: renderReact
   ✓ Beat 4 completed in 510ms (UNMOCKED)
```

## The Root Cause

The delay is caused by this configuration in:
```
packages/canvas-component/json-sequences/canvas-component/create.json
```

**Line 43:**
```json
{
  "beat": 4,
  "event": "canvas:component:render-react",
  "title": "Render React Component",
  "handler": "renderReact",
  "timing": "after-beat",  ← THIS IS THE PROBLEM!
  "kind": "stage-crew"
}
```

The `"timing": "after-beat"` causes a 500ms delay before Beat 4 executes.

## The Fix

Change the timing from `"after-beat"` to `"immediate"`:

```json
{
  "beat": 4,
  "event": "canvas:component:render-react",
  "title": "Render React Component",
  "handler": "renderReact",
  "timing": "immediate",  ← FIXED!
  "kind": "stage-crew"
}
```

## Verify the Fix

### Step 9: Run Again with Fixed Config

1. Update the JSON file
2. Reload the harness (F5)
3. Load the production log again
4. Unmock Beat 4
5. Click **"▶️ Run Sequence"**

**Expected Result:**
```
Total Duration: ~12ms ✅ FIXED!
Beat 4: 10ms (✨ UNMOCKED) ← No more 500ms delay!
```

## Summary

| Step | Beat | Timing | Duration | Status |
|------|------|--------|----------|--------|
| 1 | All | Mocked | ~12ms | ✅ Baseline |
| 2 | 1 | Unmocked | ~12ms | ✅ Fast |
| 3 | 2 | Unmocked | ~12ms | ✅ Fast |
| 4 | 3 | Unmocked | ~12ms | ✅ Fast |
| 5 | 4 | Unmocked | ~512ms | 🚨 **FOUND IT!** |
| 6 | 4 | Fixed | ~12ms | ✅ **FIXED!** |

## Key Insight

The harness revealed that:
- **Beats 1-3**: All fast (~10ms each)
- **Beat 4**: Has a 500ms artificial delay due to `"timing": "after-beat"`
- **Beats 5-6**: All fast (~2ms each)

The delay is **not** in the React rendering code itself, but in the **timing configuration** that delays when the beat executes!

## Next Time

Use this workflow whenever you see production delays:

1. ✅ Load the production log
2. ✅ Run baseline (all mocked)
3. ✅ Unmock beats one by one
4. ✅ Find which beat causes the delay
5. ✅ Fix the root cause
6. ✅ Verify the fix

**The "aha!" moment is when you see the timing jump!** 🎯

