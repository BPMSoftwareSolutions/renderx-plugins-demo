# Sophisticated Operation Selector - Usage Examples

## Quick Start

### Basic Usage
```jsx
import UnifiedDiagnosticsWorkbench from './unified-diagnostics-workbench.jsx';

export function App() {
  return <UnifiedDiagnosticsWorkbench />;
}
```

This provides everything: selector + analysis in an integrated UI.

---

## Analysis Scenarios

## Scenario 1: Debugging the 5.3-Second Delay ⏱️

**Problem:** After a drag-drop operation, the canvas button takes 5.3 seconds to appear.

### Step-by-Step Walkthrough

1. **Open the workbench** in split view (default)

2. **Click the "🔴 Critical Path" preset** in Operation Selector
   - Automatically selects:
     - Library Component Drop
     - React Render Block
     - Canvas Component Create
     - Gap (user release)

3. **View -> Switch to "🔗 Sequence Flow"**
   ```
   Library Component Drop (14ms)
                   ↓ (2843ms gap)
   React Render Block (2383ms)  ⚠️ CRITICAL
                   ↓ (58ms)
   Canvas Component Create (58ms)
                   ↓ (2359ms gap)
   Final UI Update
   ```

4. **Analysis Summary:**
   - Total perceived delay: 5.3s = 2843ms (user) + 2383ms (React) + 58ms (create) + 2359ms (gap)
   - **Root cause:** React synchronous rendering blocks main thread for 2.383 seconds
   - **Not** a serialization issue, but a React reconciliation issue

5. **Export findings** (in full implementation):
   ```json
   {
     "selectedOps": ["lib-drop", "react-block", "canvas-create"],
     "criticalPath": "Drop → React Block (2383ms) → Create",
     "recommendation": "Use startTransition() or useDeferredValue()"
   }
   ```

### Time Series Visualization

In **📈 Stacked Area** view, you'd see:
- Time 0-19s: Normal operations
- Time 19-21.5s: Massive spike (React block)
- Time 21.5-23.9s: Recovery and create operation
- After 23.9s: Idle waiting

---

## Scenario 2: Plugin Reliability Analysis 🔧

**Problem:** CanvasComponentPlugin reports 50% failure rate (24/48 attempts).

### Step-by-Step Walkthrough

1. **Open workbench** in split view

2. **Click the "🔧 Plugin Health Check" preset**
   - Pre-selects plugins with failures

3. **Switch Strategy to "By Frequency"**
   - Set minimum count: 1
   - See all plugins ranked by occurrence

   ```
   CanvasComponentPlugin      48 executions, 24 failures (50%)  ❌
   CanvasComponentSelectionPlugin  32 executions, 0 failures  ✅
   CanvasComponentSvgNode...   15 executions, 0 failures  ✅
   LibraryComponentPlugin      6 executions, 3 failures (50%)  ❌
   ```

4. **View -> Switch to "⚡ Performance"**
   - Check if failures correlate with slowdowns
   - Look for patterns: failures on 1st mount? After theme toggle?

5. **Refine: Add Category Filter "Plugins" only**
   - Isolate plugin events from other operations
   - See mount patterns more clearly

### Correlating Failures with Timeline

In **📊 Timeline** view, you can see:
- When each plugin mounts (X-axis: time)
- Duration of mount (Y-axis: how long it took)
- Failed mounts stand out visually

**Key Insight:** If 50% failure rate occurs consistently, consider:
- Initialization order issue
- Missing dependency resolution
- Race condition in plugin discovery

---

## Scenario 3: Comparing Initialization vs Runtime 🚀

**Problem:** System behaves differently during startup vs normal use.

### Step-by-Step Walkthrough

1. **Left Pane: Strategy "Time Window"**
   - Start: 0s
   - End: 5s
   - Filters to initialization phase only

2. **Right Pane: View -> "📉 Frequency"**
   - Shows what operations happen during boot
   - Example:
     ```
     System Init (1 op, 3073ms) - 🐢 SLOW
     Header UI Theme Get (1 op, 144ms)
     Library Load (1 op, 78ms)
     Control Panel Init (1 op, 379ms) - 🐌 SLOW
     ```

3. **Switch time window: 15s - 28s (runtime)**
   - See which operations now execute frequently
   - Example:
     ```
     Library Component Drag/Drop (repeating)
     Canvas Component Create (repeating)
     Theme Toggles (repeating)
     ```

4. **Analysis:**
   - Initialization: Heavy setup, few operations, long durations
   - Runtime: Light operations, frequent execution, short durations
   - **Conclusion:** Design is healthy (lazy loading post-init)

### Performance Differential

Use **📈 Stacked Area** to visualize:
- Boot phase (0-5s): High utilization during setup
- Idle phase (5-15s): Waiting for user
- Runtime phase (15-28s): Pattern-based execution

---

## Scenario 4: Finding React Render Bottlenecks 🎨

**Problem:** "Theme toggle is slow" - but the toggle itself is only 10ms.

### Step-by-Step Walkthrough

1. **Click "🎨 Render Operations" preset**
   - Searches for all operations with "render" in name
   - Category filters to "Event Topics"

2. **Strategy "Pattern" with search: `"^canvas:component:render"`**
   - Regex matches canvas render chain
   - Shows:
     ```
     canvas:component:render-react (most expensive)
     canvas:component:render-svg
     canvas:component:render-layout
     ```

3. **View -> "⚡ Performance"**
   - Rank by duration
   - See which render operations are slowest

4. **View -> "🔗 Sequence Flow"**
   - Trace: Theme Toggle → Render React → Render SVG → ...
   - **Aha!** Theme toggle is 10ms, but cascading renders are 200ms+

5. **Key Finding:**
   ```
   Theme Toggle (10ms) ✅ Fast
           ↓
   React State Update Queued
           ↓
   React Reconciliation (200ms) ❌ Slow
           ↓
   DOM Manipulation
           ↓
   Layout Recalculation
           ↓
   Paint
   ```

### Solution Space

The slow part is the **cascading render chain**, not the toggle itself. Consider:
- React.memo() for unaffected components
- useCallback() for event handlers
- Code splitting to defer non-critical renders

---

## Scenario 5: Identifying Dead Time Zones 💀

**Problem:** "System is only 3% utilized. Where are the gaps?"

### Step-by-Step Walkthrough

1. **Click "💀 Dead Time Analysis" preset**
   - Category filter: "Dead Time Zones" only
   - Shows:
     ```
     Gap (user idle)              2626ms
     Gap (no activity)            9771ms  ← Largest gap
     Gap (user release)           2843ms  ← Critical gap
     React Blocking (DEAD TIME)   2383ms  ← Performance issue
     ```

2. **View -> "📉 Frequency"**
   - All gaps shown by count
   - User-initiated gaps: 3 occurrences
   - System-initiated gaps: 1 occurrence

3. **Time Window 0-28.35s, Strategy "Performance"**
   - Set minimum duration: 1000ms (1 second)
   - Shows ONLY operations > 1 second
   - Reveals:
     ```
     System Init (3073ms)
     React Block (2383ms)
     3× Gaps > 2000ms
     ```

4. **Key Metrics from Statistics Panel:**
   ```
   Total Session: 28.35s
   Actual Execution: 0.86s (3%)
   Dead Time: 27.49s (97%)
   ```

### Visualization

In **📊 Timeline** (scatter plot):
- X-axis: timestamp
- Y-axis: duration
- 97% of points are "gaps" (zero work)
- 3% are actual operations

**Business Impact:**
- If session = user task
- User waiting 97% of time
- Mostly on their side (idle gaps)
- But 2.3s React block is your opportunity

---

## Scenario 6: Comparing Multiple Sessions 📊

**Problem:** "Is this a regression? Does it behave the same way in other sessions?"

### Implementation Note
*This requires extending the selector to support session comparison mode.*

### Conceptual Workflow

1. **Load Session A** (the problematic one)
   - OperationSelector displays its operations

2. **Load Session B** (baseline/previous)
   - Open in new workbench instance

3. **Side-by-side comparison**
   - Session A: Critical path 5.3s delay
   - Session B: Critical path 1.2s delay
   - **Regression confirmed:** 4.3s worse

4. **Drill down:** 
   - Session A: React block 2383ms
   - Session B: React block 180ms
   - **Root cause:** React rendering regression

### What to Compare

Using Operation Selector strategies:

| Strategy | Session A | Session B | Insight |
|----------|-----------|-----------|---------|
| By Category (Sequences) | 17 total | 17 total | Same operation set |
| By Frequency (Plugins) | 48 CanvasPlugin | 48 CanvasPlugin | Same mount count |
| By Performance (>100ms) | 6 slow ops | 3 slow ops | More bottlenecks in A |
| By Time Window (0-5s) | 1.3s boot | 0.8s boot | 500ms slower startup |
| Pattern (react-block) | 2383ms | 180ms | **4.3x worse** |

---

## Advanced Usage: Custom Filter Combinations

### Creating a Custom Analysis

```jsx
// Manual filter application (without preset)
const analyzeEarlyAdoption = () => {
  // User onboarding phase: first 30 seconds, focus on UI
  setTimeWindowStart(0);
  setTimeWindowEnd(30);
  setCategoryFilters(new Set(['sequences', 'topics']));
  setSearchPattern('ui|render|load');
  setActiveStrategy('pattern');
  // Result: All UI-related operations during onboarding
};

const analyzeRenderPerformance = () => {
  // All render operations over 50ms
  setDurationThreshold(50);
  setSearchPattern('render');
  setActiveStrategy('performance');
  // Result: Slow render operations ranked by duration
};

const analyzePluginReliability = () => {
  // Plugins with highest failure rates
  setCategoryFilters(new Set(['plugins']));
  setActiveStrategy('frequency');
  // Result: Plugins ranked by occurrence (high count = high usage = high reliability risk)
};
```

---

## Tips & Tricks 💡

### Tip 1: Start with Presets
- Presets are curated for common scenarios
- Gives you 80% of analysis without thinking
- Refine from there

### Tip 2: Combine Strategies
- Start with Category filter (narrow scope)
- Add Pattern search (exact matching)
- Apply Time Window (focus period)
- Switch view mode (different perspective)

### Tip 3: Use Regex for Complex Patterns
```
"^canvas:component:(?!select)" // All canvas ops except select
"(render|reconcil)" // Render-related operations
"React|Theme" // Operations about React or theme
```

### Tip 4: Export Selected Operations
```json
{
  "selection": {
    "operations": ["lib-drop", "react-block", "canvas-create"],
    "strategy": "pattern",
    "pattern": "critical.*path",
    "timeWindow": [19, 21.5],
    "timestamp": "2025-11-10T21:56:16.932Z"
  },
  "findings": {
    "issue": "React blocking main thread",
    "duration": "2383ms",
    "recommendation": "Use concurrent features"
  }
}
```

### Tip 5: Track Analysis Sessions
- Save filter configurations for future use
- Document which filters revealed which insights
- Build personal playbook of analysis patterns

---

## Troubleshooting

**Q: "Preset is selected but nothing happens"**
- A: Check that telemetry data is loaded
- Verify operation IDs in preset match your data
- Look for console errors

**Q: "Pattern search returns empty results"**
- A: Try simpler pattern first (no regex special chars)
- Enable regex mode if using `.*`, `^`, `$`
- Verify operation names in raw telemetry

**Q: "Time window shows operations outside range"**
- A: Ensure timestamps are in same units (seconds vs milliseconds)
- Check that `timestamp` field exists on operations
- Verify time window values are within session duration

**Q: "Sequence flow shows no dependencies"**
- A: May indicate operations don't overlap
- Check if operations are truly sequential
- View in "Stacked Area" to see timing

---

## Real-World Analysis Report Example

### Session Analysis: Canvas Component Drag-Drop

**Selected Operations:** 4
- Library Component Drag (10ms)
- Library Component Drop (14ms)
- React Render Block (2383ms)
- Canvas Component Create (58ms)

**Key Finding:** 5.3-second perceived delay, 2.3-second wasted on React reconciliation

**Time Breakdown:**
```
0ms:   Drag starts
10ms:  Drag completes
+2843ms: User releases (thinking time)
19.1s: Drop fires
+14ms: Drop handler finishes
+2383ms: React blocks entire main thread ⚠️
21.5s: Canvas creation finally starts
+58ms: Canvas mounted
+2359ms: Idle
23.9s: User sees result (5.3s total)
```

**Visualizations Generated:**
1. Timeline scatter: Shows 2383ms spike
2. Stacked area: Illustrates React dominance
3. Sequence flow: Traces dependency chain
4. Statistics: 97% main thread utilization by React

**Recommendation:** Replace synchronous `renderRootSync` with `startTransition()` or `useDeferredValue()` to make renders interruptible. Target improvement: <100ms perceived delay.

---

## Next Session Setup

When analyzing a new session:

1. Load telemetry data
2. Apply "💀 Dead Time Analysis" first (understand overall structure)
3. Identify critical path (longest blocking operation)
4. Create custom filter around critical path
5. Export findings for team review

This standard workflow takes 5-10 minutes and typically surfaces the main bottleneck.
