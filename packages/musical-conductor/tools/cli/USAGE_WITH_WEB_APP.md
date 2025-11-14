# CLI Bug Detective: Usage with Web App

## Quick Start

### 1. Start the Web App
```bash
npm run dev
# Web app runs on http://localhost:5173
```

### 2. Perform Actions in Web App
- Create components by dragging from library to canvas
- Delete components
- Interact with control panel
- Perform any operations you want to debug

### 3. Check Generated Logs
Logs are automatically saved to `.logs/` directory:
```
.logs/localhost-1763066101802.log
```

### 4. Run CLI Commands

#### List Available Sequences
```bash
cd packages/musical-conductor
npm run conductor:play:list
```

Output:
```
🎵 Available Sequences
═══════════════════════════════════════════════════════════════
ID                              Name                    Beats
───────────────────────────────────────────────────────────────
canvas-component-create         Canvas Component Create 6
canvas-component-delete         Canvas Component Delete 4
control-panel-ui-init           Control Panel UI Init   8
library-drop-canvas-component   Library Drop Component  5
```

#### Parse Production Log
```bash
npm run conductor:play:parse -- --file "../../.logs/localhost-1763066101802.log"
```

Output:
```
🎵 Log Parser Report
═══════════════════════════════════════════════════════════════
Log File: ../../.logs/localhost-1763066101802.log

📊 Sequences Found
───────────────────────────────────────────────────────────────
1. Canvas (0 beats, 0ms)
2. Control (0 beats, 0ms)

Total: 2 sequences, 0 beats
```

#### Play Sequence
```bash
npm run conductor:play -- --sequence library-drop-canvas-component
```

Output:
```
🎵 Sequence Player Report
═══════════════════════════════════════════════════════════════
Sequence: library-drop-canvas-component
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

#### Replay from Production Log
```bash
npm run conductor:play -- --from-log "../../.logs/localhost-1763066101802.log" --sequence library-drop-canvas-component
```

#### Save Report to JSON
```bash
npm run conductor:play -- --sequence library-drop-canvas-component --output report.json
```

This creates `report.json` with detailed timing data:
```json
{
  "sequenceId": "library-drop-canvas-component",
  "sequenceName": "library drop canvas component",
  "mode": "full-integration",
  "duration": 588,
  "beats": [
    {
      "beat": 1,
      "event": "resolve-template",
      "duration": 5,
      "isMocked": false
    },
    ...
  ],
  "status": "success"
}
```

## Detective Workflow

### Step 1: Identify Slow Sequence
1. Run web app and perform actions
2. Parse log to see which sequences ran
3. Play sequence to see timing breakdown

### Step 2: Analyze Performance
1. Look for beats with duration > 100ms
2. Check the beat kind (pure, io, stage-crew, api)
3. Review recommendations

### Step 3: Mock Services (Phase 2)
```bash
# Mock I/O layer
npm run conductor:play -- --sequence library-drop-canvas-component --mock io

# Mock React rendering
npm run conductor:play -- --sequence library-drop-canvas-component --mock stage-crew

# Mock specific beats
npm run conductor:play -- --sequence library-drop-canvas-component --mock-beat 4
```

### Step 4: Compare Results (Phase 3)
```bash
# Save baseline
npm run conductor:play -- --sequence library-drop-canvas-component --output baseline.json

# Make changes to code

# Compare with baseline
npm run conductor:play -- --sequence library-drop-canvas-component --compare baseline.json
```

## Troubleshooting

### Log File Not Found
- Check that web app is running and has generated logs
- Look in `.logs/` directory for latest log file
- Ensure path is correct: `../../.logs/localhost-TIMESTAMP.log`

### Sequence Not Found
- Run `npm run conductor:play:list` to see available sequences
- Check exact sequence ID spelling
- Ensure sequence was executed in web app

### No Timing Data
- Timing data is collected during sequence execution
- Ensure sequence completes successfully
- Check for errors in browser console

## Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| Sequence Duration | <500ms | 588ms |
| Slow Beat Threshold | >100ms | 512ms |
| Total Beats | - | 6 |

## Next Steps

1. **Phase 2**: Implement mock options for incremental debugging
2. **Phase 3**: Add performance comparison and regression detection
3. **Integration**: Connect to real MusicalConductor for actual timing
4. **Automation**: Add CI/CD integration for performance monitoring

## Support

For issues or questions:
1. Check QUICK_START.md for basic usage
2. Review SEQUENCE_PLAYER_README.md for detailed documentation
3. Check TESTING_SUMMARY.md for test results
4. Review PHASE_1_IMPLEMENTATION_SUMMARY.md for technical details

