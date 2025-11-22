# Quick Win #1: Handler Performance Heatmap

## Objective
Extract handler execution times from production logs and create a heatmap showing which handlers are slowest.

## What We'll Build

A script that:
1. **Parses** production logs (`.logs/*.log`)
2. **Extracts** beat execution events with timing
3. **Maps** beats to handlers using codebase knowledge
4. **Calculates** performance statistics
5. **Generates** heatmap visualization

## Data Source

Production logs contain entries like:
```
EventBus.ts:56 2025-11-17T20:22:33.840Z 📡 EventBus: Subscribed to "musical-conductor:beat:started"
EventBus.ts:56 2025-11-17T20:22:33.840Z 📡 EventBus: Subscribed to "musical-conductor:beat:completed"
```

Canvas telemetry shows:
```
**Beat 1: canvas:component:resolve-template**
- **Duration**: 8.00ms
- **Handler**: resolveTemplate (CanvasComponentPlugin)
```

## Implementation Plan

### Step 1: Log Parser
- Read all `.logs/*.log` files
- Extract beat-started and beat-completed events
- Calculate duration between events
- Map to handler names

### Step 2: Handler Mapper
- Use comprehensive audit data to map beats to handlers
- Extract handler names from sequence definitions
- Link to source code locations

### Step 3: Statistics Calculator
- Min/max/avg execution time per handler
- Percentile analysis (p50, p95, p99)
- Frequency of execution
- Total time spent in handler

### Step 4: Heatmap Generator
- Create HTML/SVG visualization
- Color code by performance (green=fast, red=slow)
- Show top 20 slowest handlers
- Interactive drill-down to see individual executions

## Output Format

```json
{
  "handlers": [
    {
      "name": "renderReact",
      "plugin": "CanvasComponentPlugin",
      "executions": 42,
      "timing": {
        "min": 5.2,
        "max": 12.8,
        "avg": 8.1,
        "p95": 11.5,
        "p99": 12.7
      },
      "totalTime": 340.2,
      "sourceFile": "packages/canvas-component/src/symphonies/create/create.react.stage-crew.ts"
    }
  ],
  "summary": {
    "totalHandlers": 87,
    "totalExecutions": 1247,
    "totalTime": 8934.5,
    "slowestHandler": "renderReact",
    "fastestHandler": "notifyUi"
  }
}
```

## Heatmap Visualization

```
Handler Performance Heatmap
═══════════════════════════════════════════════════════════

🔴 renderReact          ████████░░ 8.1ms avg (42 executions)
🔴 createNode           ███████░░░ 7.8ms avg (38 executions)
🟠 deleteComponent      ██████░░░░ 6.5ms avg (35 executions)
🟠 updatePosition       ██████░░░░ 6.2ms avg (41 executions)
🟡 resolveTemplate      █████░░░░░ 5.1ms avg (39 executions)
🟢 notifyUi             ████░░░░░░ 4.2ms avg (44 executions)
🟢 publishDeleted       ███░░░░░░░ 3.8ms avg (37 executions)

Legend:
🔴 Slow (>7ms)
🟠 Medium (5-7ms)
🟡 Fast (3-5ms)
🟢 Very Fast (<3ms)
```

## Benefits

✅ **Identify bottlenecks** - See which handlers are slowest
✅ **Validate performance** - Confirm fixes are working
✅ **Optimize targets** - Know where to focus optimization efforts
✅ **Regression detection** - Spot performance degradation
✅ **Production insights** - Real data, not synthetic benchmarks

## Estimated Effort

- **Log Parser**: 30 minutes
- **Handler Mapper**: 20 minutes
- **Statistics**: 20 minutes
- **Visualization**: 30 minutes
- **Testing**: 20 minutes
- **Total**: ~2 hours

## Success Criteria

✅ Parse all production logs without errors
✅ Extract 100+ handler executions
✅ Calculate accurate timing statistics
✅ Generate heatmap visualization
✅ Identify top 10 slowest handlers
✅ Show performance distribution

## Next Steps

1. Create `scripts/analyze-handler-performance.js`
2. Add to `package.json` as `npm run analyze:performance`
3. Generate heatmap for all production logs
4. Create performance baseline
5. Track performance over time

---

**This quick win gives us production-backed performance insights in ~2 hours.**

