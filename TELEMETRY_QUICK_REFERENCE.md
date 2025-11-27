# Telemetry Quick Reference Guide

## Running the Build with Telemetry

```bash
# Standard telemetry build
npm run build:symphony:telemetry

# With debug logging
DEBUG_TELEMETRY=1 npm run build:symphony:telemetry

# Different dynamic levels
node scripts/orchestrate-build-symphony-with-telemetry.js --dynamic=p    # Piano (Development)
node scripts/orchestrate-build-symphony-with-telemetry.js --dynamic=mf   # Mezzo-Forte (Standard)
node scripts/orchestrate-build-symphony-with-telemetry.js --dynamic=f    # Forte (Full)
node scripts/orchestrate-build-symphony-with-telemetry.js --dynamic=ff   # Fortissimo (CI)
```

## Output Interpretation

### Console Output Format
```
[BEAT N] Starting: Beat Name
🎵 [timestamp] Movement M, Beat N: Description
📍 EVENT: event:name { data }
[BEAT N] Completed: XXXms | Status: success | SLA: compliant | Shape: stable
```

### Status Codes
- ✅ **success** - Beat completed successfully
- ❌ **failure** - Beat failed with error
- ⚠️ **warning** - Non-critical issue
- 🟢 **compliant** - SLA threshold met
- 🟡 **degraded** - SLA threshold exceeded (1-2x)
- 🔴 **critical** - SLA threshold severely exceeded (3x+)

### Shape Indicators
- **stable** - No behavioral change detected
- **evolved** - Behavioral change detected
- **unstable** - Significant variance in timing

## 6 Movements Explained

| Movement | Purpose | Beats | Duration |
|----------|---------|-------|----------|
| 1 | Validation & Verification | 5 | ~10-20ms |
| 2 | Manifest Preparation | 5 | ~500-1000ms |
| 3 | Package Building | 5 | ~5-10s |
| 4 | Host Application Building | 5 | ~15-20s |
| 5 | Artifact Management | 3 | ~1-2s |
| 6 | Verification & Conformity | 5 | ~5-10s |

## Key Files

| File | Purpose |
|------|---------|
| `scripts/orchestrate-build-symphony-with-telemetry.js` | Main entry point |
| `scripts/beat-telemetry-collector.cjs` | Core telemetry logic |
| `scripts/build-symphony-telemetry-integration.js` | Handler wrapping |
| `scripts/build-telemetry-console-formatter.cjs` | Output formatting |
| `.generated/build-symphony-report.json` | Metrics report |
| `package.json` (npm script) | `build:symphony:telemetry` |

## Understanding Metadata

Each beat is tracked with this metadata:

```javascript
{
  beat: 1,                    // Beat number within movement
  beatName: 'Load Build Context',
  handler: 'loadBuildContext',
  movement: 1,                // Movement number (1-6)
  timestamp: '2025-11-27T02:51:56.924Z'
}
```

This metadata enables:
- Precise beat identification
- Movement-level aggregation
- Time-series analysis
- Correlation tracking

## SLO Baselines

Default SLO targets (ms):

| Beat Type | Target | Warning | Critical |
|-----------|--------|---------|----------|
| Validation | 500ms | 1s | 3s |
| Loading | 100ms | 200ms | 500ms |
| Building | 30s | 60s | 90s |
| Linting | 10s | 20s | 30s |
| Standard | 1s | 2s | 3s |

## Troubleshooting

### Issue: `[BEAT undefined]` in output
**Cause:** Metadata object missing `beat` property
**Fix:** Verify metadata structure in `build-symphony-telemetry-integration.js`

### Issue: Script not found errors
**Cause:** Path resolution issues
**Fix:** Check `rootDir` calculation - should point to project root

### Issue: Domain validation failures
**Cause:** Missing or malformed domain definitions
**Fix:** Verify `orchestration-domains.json` has required fields

## Metrics Explained

### Per-Beat Metrics
- **Duration:** Total execution time in milliseconds
- **Status:** success/failure outcome
- **SLA:** compliance/degraded/critical status
- **Shape:** stable/evolved indicator

### Build-Level Metrics
- **Total Duration:** Sum of all beat durations
- **Successful Beats:** Count of ✅ completions
- **Failed Beats:** Count of ❌ completions
- **Correlation ID:** UUID for tracing
- **Dynamic Level:** Orchestration intensity

## Accessing the Report

The build report is generated in JSON format:

```bash
cat .generated/build-symphony-report.json
```

Contains:
- All beat metrics (timing, status, SLA)
- Movement summaries
- Event log
- Build statistics
- Error details (if any)

## Integration Examples

### GitHub Actions
```yaml
- name: Build with Telemetry
  run: npm run build:symphony:telemetry
  env:
    DEBUG_TELEMETRY: ${{ secrets.DEBUG_BUILDS }}

- name: Parse Metrics
  run: cat .generated/build-symphony-report.json | jq '.'
```

### Local Development
```bash
# Watch build output while working
npm run build:symphony:telemetry | tee build-output.log

# Compare two builds
diff <(npm run build:symphony:telemetry 2>&1) previous-output.log
```

## Advanced Usage

### Custom Dynamic Levels
Edit `scripts/orchestrate-build-symphony-with-telemetry.js`:

```javascript
const DYNAMICS = {
  'custom': { 
    name: 'Custom Level',
    validateOnly: false,
    strictConformity: true
  }
};
```

### Extending Telemetry
Add custom events in handlers:

```javascript
recordEvent('custom:event', { 
  data: 'value',
  timestamp: new Date().toISOString()
});
```

## Performance Tips

- Build typically takes **30-40 seconds**
- Fastest beat: ~1ms (simple tasks)
- Slowest beat: ~13s (linting/conformity)
- Run during CI/CD for production builds
- Use `--dynamic=p` (Piano) for quick validation

## Support

For telemetry issues:
1. Check console output for error messages
2. Review `.generated/build-symphony-report.json`
3. Enable DEBUG_TELEMETRY for verbose output
4. Check path resolution in handlers
5. Verify all required scripts exist

---

*Quick Reference | Updated: November 27, 2025*
