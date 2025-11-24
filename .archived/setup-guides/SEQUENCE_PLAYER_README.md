# CLI Bug Detective: Sequence Replay and Performance Debugging

A comprehensive CLI tool for replaying sequences, debugging performance issues, and incrementally unmocking services to identify bottlenecks.

## Quick Start

### Play a Sequence (Full Integration)

```bash
npm run conductor:play -- --sequence canvas-component-create-symphony
```

### Play from Production Log

```bash
npm run conductor:play -- --from-log .logs/localhost-1763041026581.log --sequence canvas-component-create-symphony
```

### Mock Services (Detective Work)

```bash
# Mock I/O layer
npm run conductor:play -- --sequence canvas-component-create-symphony --mock io

# Mock React rendering
npm run conductor:play -- --sequence canvas-component-create-symphony --mock stage-crew

# Mock multiple services
npm run conductor:play -- --sequence canvas-component-create-symphony --mock io,stage-crew

# Mock specific beats
npm run conductor:play -- --sequence canvas-component-create-symphony --mock-beat 4,5
```

### Generate Reports

```bash
# Save JSON report
npm run conductor:play -- --sequence canvas-component-create-symphony --output report.json

# Compare with previous run
npm run conductor:play -- --sequence canvas-component-create-symphony --compare previous-report.json
```

## Commands

### play

Play a sequence and measure performance.

**Options:**
- `-s, --sequence <id>` - Sequence ID to play
- `-l, --from-log <file>` - Load sequence from production log
- `-m, --mock <types>` - Mock service types (pure,io,stage-crew)
- `-b, --mock-beat <beats>` - Mock specific beats (comma-separated)
- `-o, --output <file>` - Output report file (JSON)
- `--analyze-beat <beat>` - Analyze specific beat in detail
- `--compare <file>` - Compare with previous run
- `--json` - Output in JSON format

### list

List available sequences.

```bash
npm run conductor:play:list
npm run conductor:play:list -- --json
```

### parse-log

Parse production log and extract sequences.

```bash
npm run conductor:play:parse -- --file .logs/localhost-1763041026581.log
npm run conductor:play:parse -- --file .logs/localhost-1763041026581.log --output sequences.json
```

## Detective Workflow

### Step 1: Baseline (Full Integration)

```bash
$ npm run conductor:play -- --from-log .logs/localhost-1763041026581.log --sequence canvas-component-create-symphony

🎵 Sequence Player Report
═══════════════════════════════════════════════════════════════
Sequence: canvas-component-create-symphony
Mode: Full Integration
Total Duration: 588ms ⏱️
```

### Step 2: Mock I/O Layer

```bash
$ npm run conductor:play -- --from-log .logs/localhost-1763041026581.log --sequence canvas-component-create-symphony --mock io

🎵 Sequence Player Report
Sequence: canvas-component-create-symphony
Mode: Mocked
Mocked Services: io
Total Duration: 588ms ⏱️ (Still slow - not I/O)
```

### Step 3: Mock Stage-Crew (DOM/React)

```bash
$ npm run conductor:play -- --from-log .logs/localhost-1763041026581.log --sequence canvas-component-create-symphony --mock stage-crew

🎵 Sequence Player Report
Sequence: canvas-component-create-symphony
Mode: Mocked
Mocked Services: stage-crew
Total Duration: 45ms ⏱️ (FAST! Found it!)
```

### Step 4: Narrow Down to Specific Beat

```bash
$ npm run conductor:play -- --from-log .logs/localhost-1763041026581.log --sequence canvas-component-create-symphony --mock-beat 4

🎵 Sequence Player Report
Sequence: canvas-component-create-symphony
Mode: Mocked
Mocked Beats: 4
Total Duration: 88ms ⏱️ (Confirms Beat 4 is culprit)
```

## Report Format

### Console Output

```
🎵 Sequence Player Report
═══════════════════════════════════════════════════════════════

Sequence: canvas-component-create-symphony
Mode: Full Integration

📊 Timing Breakdown
───────────────────────────────────────────────────────────────
Beat 1 (resolve-template)    ✨ REAL    5ms
Beat 2 (register-instance)   ✨ REAL   12ms
Beat 3 (create-node)         ✨ REAL   18ms
Beat 4 (render-react)        ✨ REAL  512ms  ⚠️ SLOW
Beat 5 (notify-ui)           ✨ REAL    3ms
Beat 6 (enhance-line)        ✨ REAL   38ms
───────────────────────────────────────────────────────────────
Total Duration: 588ms

🔍 Analysis
───────────────────────────────────────────────────────────────
⚠️ Beat 4 (render-react) is slow: 512ms
   Timing: "after-beat"
   Kind: "stage-crew"

💡 Recommendations
───────────────────────────────────────────────────────────────
  - Beat 4: Consider changing timing from "after-beat" to "immediate"

═══════════════════════════════════════════════════════════════
```

### JSON Output

```json
{
  "sequenceId": "canvas-component-create-symphony",
  "sequenceName": "Canvas Component Create",
  "mode": "full-integration",
  "mockServices": [],
  "mockBeats": [],
  "startTime": 1700000000000,
  "endTime": 1700000000588,
  "duration": 588,
  "beats": [
    {
      "beat": 1,
      "event": "canvas:component:resolve-template",
      "handler": "resolveTemplate",
      "kind": "pure",
      "timing": "immediate",
      "duration": 5,
      "isMocked": false
    }
  ],
  "totalBeats": 6,
  "errors": [],
  "status": "success"
}
```

## Architecture

### Components

- **SequencePlayerEngine** - Core execution engine
- **LogParser** - Parse production logs
- **PerformanceReporter** - Generate reports
- **sequence-player.ts** - CLI entry point

### Beat Kinds

- `pure` - No side effects, just data transformation
- `io` - I/O operations (KV store, database, file system)
- `stage-crew` - DOM/React rendering, UI updates

## Performance Thresholds

- **Slow Beat**: > 100ms
- **Very Slow Beat**: > 500ms

## Next Steps

- Phase 2: Mock Options (incremental unmocking)
- Phase 3: Performance Reports (detailed analysis)

