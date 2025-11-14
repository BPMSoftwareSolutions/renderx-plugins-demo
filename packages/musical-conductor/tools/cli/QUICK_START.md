# CLI Bug Detective: Quick Start Guide

## Installation

The CLI is already integrated into the project. No additional installation needed.

## Basic Commands

### 1. List Available Sequences

```bash
npm run conductor:play:list
```

Output:
```
🎵 Available Sequences
═══════════════════════════════════════════════════════════════
ID                              Name                    Beats
canvas-component-create         Canvas Component Create 6
canvas-component-delete         Canvas Component Delete 4
control-panel-ui-init           Control Panel UI Init   8
...
```

### 2. Play a Sequence (Full Integration)

```bash
npm run conductor:play -- --sequence canvas-component-create
```

Output:
```
🎵 Sequence Player Report
═══════════════════════════════════════════════════════════════
Sequence: Canvas Component Create
Mode: Full Integration
Total Duration: 588ms ⏱️

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
```

### 3. Parse Production Log

```bash
npm run conductor:play:parse -- --file .logs/localhost-1763041026581.log
```

Output:
```
🎵 Log Parser Report
═══════════════════════════════════════════════════════════════
Log File: .logs/localhost-1763041026581.log

📊 Sequences Found
───────────────────────────────────────────────────────────────
1. canvas-component-create (6 beats, 588ms)
2. control-panel-ui-init (8 beats, 245ms)
3. canvas-component-delete (4 beats, 156ms)

Total: 3 sequences, 18 beats
```

### 4. Play from Production Log

```bash
npm run conductor:play -- --from-log .logs/localhost-1763041026581.log --sequence canvas-component-create
```

This replays the exact sequence from the production log with timing measurements.

### 5. Save Report to JSON

```bash
npm run conductor:play -- --sequence canvas-component-create --output report.json
```

Output file: `report.json`
```json
{
  "sequenceId": "canvas-component-create",
  "sequenceName": "Canvas Component Create",
  "mode": "full-integration",
  "duration": 588,
  "beats": [
    {
      "beat": 1,
      "event": "canvas:component:resolve-template",
      "duration": 5,
      "isMocked": false
    }
  ]
}
```

## Detective Workflow

### Step 1: Identify Slow Sequence
```bash
npm run conductor:play -- --from-log .logs/localhost-1763041026581.log --sequence canvas-component-create
```

### Step 2: Mock I/O Layer
```bash
npm run conductor:play -- --sequence canvas-component-create --mock io
```

### Step 3: Mock React Rendering
```bash
npm run conductor:play -- --sequence canvas-component-create --mock stage-crew
```

### Step 4: Mock Specific Beat
```bash
npm run conductor:play -- --sequence canvas-component-create --mock-beat 4
```

## Options Reference

| Option | Description | Example |
|--------|-------------|---------|
| `--sequence <id>` | Sequence ID to play | `--sequence canvas-component-create` |
| `--from-log <file>` | Load from production log | `--from-log .logs/localhost.log` |
| `--mock <types>` | Mock service types | `--mock io,stage-crew` |
| `--mock-beat <beats>` | Mock specific beats | `--mock-beat 1,2,3` |
| `--output <file>` | Save JSON report | `--output report.json` |
| `--compare <file>` | Compare with previous run | `--compare previous.json` |
| `--json` | Output in JSON format | `--json` |

## Troubleshooting

### Sequence Not Found
```bash
npm run conductor:play:list
```
Check the exact sequence ID from the list.

### Log File Not Found
Ensure the log file path is correct and the file exists.

### No Timing Data
Timing data is collected during sequence execution. Ensure the sequence completes successfully.

## Next Steps

- Read [SEQUENCE_PLAYER_README.md](./SEQUENCE_PLAYER_README.md) for detailed documentation
- Read [PHASE_1_IMPLEMENTATION_SUMMARY.md](./PHASE_1_IMPLEMENTATION_SUMMARY.md) for technical details
- Check [COMPLETION_REPORT.md](./COMPLETION_REPORT.md) for implementation status

