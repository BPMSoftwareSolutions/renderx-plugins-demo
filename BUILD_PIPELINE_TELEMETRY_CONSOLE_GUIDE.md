# Build Pipeline Telemetry Console Output Guide

## Overview

The build pipeline now outputs real-time telemetry for SLI/SLO/SLA monitoring during each beat execution.

## Quick Start

Run the telemetry-enabled build:

```bash
# Standard build with telemetry (Mezzo-Forte dynamic)
npm run build:symphony:telemetry

# Development build with telemetry (Piano - validation only)
npm run build:symphony:telemetry:p

# Full build with telemetry and strict conformity (Forte)
npm run build:symphony:telemetry:f

# CI build with artifacts and telemetry (Fortissimo)
npm run build:symphony:telemetry:ff
```

## Console Output Format

### Beat Header
```
────────────────────────────────────────────────────────────────────────────
🎵 M1.B1 Load Build Context @ 14:35:22.123 PM
────────────────────────────────────────────────────────────────────────────
```

### SLI (Service Level Indicator) Metrics

Shows actual performance metrics collected during beat execution:

```
📊 SLI (Service Level Indicator)
  Duration:  245ms (49% of SLO)     <- Actual vs target
  Status:    SUCCESS                 <- Beat completion status
  Artifacts: 42                      <- Output count
  Errors:    0                       <- Error count
  Memory:    125.3MB                 <- Memory usage delta
  Cache:     HIT                     <- Cache effectiveness
```

**Color Coding:**
- **Green**: Under 70% of SLO (optimal)
- **Yellow**: 70-90% of SLO (warning range)
- **Red**: Over 90% of SLO (breach range)

### SLO (Service Level Objective) Baselines

Target performance expectations for this beat type:

```
📈 SLO (Service Level Objective)
  Duration:  5000ms
  Errors:    ≤ 0
  Cache Hit: ≥ 80%
```

**Beat Type Baselines:**
- **Validation**: 5s (fast checks)
- **Generation**: 15s (data generation)
- **Build**: 120s (compilation)
- **Verification**: 10s (validation)
- **Observation**: 5s (recording/metrics)

### SLA (Service Level Agreement) Status

Breach detection at three tiers:

```
🚨 SLA (Service Level Agreement)
  Overall:   ✓ COMPLIANT         <- ✓ COMPLIANT | ⚠ WARNING | 🔴 BREACH | 🚨 CRITICAL
  Duration:  OK (51% under)      <- Evaluation vs threshold
  Errors:    OK                  <- Error limit check
  Cache:     OK                  <- Cache hit rate check
```

**SLA Thresholds:**
- **Compliant** (✓): Under 70% over SLO
- **Warning** (⚠): 70-90% over SLO
- **Breach** (🔴): 90-110% over SLO
- **Critical** (🚨): Over 110% over SLO

### Shape Evolution

Tracks performance signature changes between beats:

```
🔄 Shape Evolution
  Status:    EVOLVED                <- EVOLVED or STABLE
  Previous:  a1f2b4c6...           <- Previous hash (first 16 chars)
  Current:   d7e3f5g8...           <- Current hash (first 16 chars)
  Reason:    Duration increased     <- Why hash changed
```

**Shape Components:**
- Movement + Beat number
- Duration bucket (under-1s, 1-5s, 5-30s, 30s-2m, over-2m)
- Completion status
- Artifact count bucket
- Error count
- Memory delta bucket
- Cache state

### Movement Summary

After all beats in a movement complete:

```
════════════════════════════════════════════════════════════════════════════
🎼 MOVEMENT 1 SUMMARY
════════════════════════════════════════════════════════════════════════════
Beats:        5
Duration:     3250ms (3.2s)
Success:      ✓ 5 / 5
Warnings:     0
Breaches:     0

Beats:
  ✓ B1: Load Build Context                         245ms
  ✓ B2: Validate Orchestration Domains             1250ms
  ✓ B3: Validate Governance Rules                  850ms
  ✓ B4: Validate Agent Behavior                    650ms
  ✓ B5: Record Validation Results                  255ms
```

### Build Summary

Final summary after all 6 movements:

```
════════════════════════════════════════════════════════════════════════════
🎭 BUILD SUMMARY
════════════════════════════════════════════════════════════════════════════
Build ID:          a1f2b4c6-d7e3-f5g8-h9i0-j1k2l3m4n5o6
Duration:          425s (7.08m)
Total Beats:       28
Success Rate:      ✓ 96.4%
Breach Percentage: 3.6%
Total Errors:      1
Overall Status:    ⚠️ WARNINGS
```

## Telemetry Storage

All telemetry records are persisted to:

```
.generated/telemetry/build-{buildId}/
├── movement-1/
│   ├── beat-1.json
│   ├── beat-2.json
│   └── ...
├── movement-2/
│   └── ...
└── ...
```

Each beat JSON file contains complete telemetry including SLI, SLO, SLA, and shape evolution data.

## Interpreting Results

### Good Performance
- Duration: Green (under 70% of SLO)
- Status: COMPLIANT (✓)
- Shape: STABLE
- Success Rate: > 95%

### Warning State
- Duration: Yellow (70-90% of SLO)
- Status: WARNING (⚠)
- Shape: Starting to evolve
- Action: Monitor next runs

### Breach State
- Duration: Red (90-110% over SLO)
- Status: BREACH (🔴)
- Shape: Significant changes
- Action: Investigate root cause

### Critical State
- Duration: Red (over 110% over SLO)
- Status: CRITICAL (🚨)
- Build may fail
- Action: Stop and fix

## Examples

### Example 1: Healthy Build

```
✓ M3.B1 Initialize Package Build
📊 SLI: Duration 2500ms (21% of SLO) | Status: SUCCESS | Cache: HIT
📈 SLO: 120000ms
🚨 SLA: ✓ COMPLIANT (75% under) | Duration: OK | Errors: OK | Cache: OK
🔄 Shape: STABLE (hash: a1f2b4c6...)
```

### Example 2: Performance Degradation

```
⚠️ M3.B3 Build Components
📊 SLI: Duration 95000ms (79% of SLO) | Status: SUCCESS | Cache: MISS
📈 SLO: 120000ms
🚨 SLA: ⚠ WARNING (79% of SLO) | Duration: at threshold | Errors: OK | Cache: SHORTFALL
🔄 Shape: EVOLVED - Duration increased from 5-30s to 30s-2m bucket
```

### Example 3: Critical Breach

```
🚨 M3.B5 Build Library
📊 SLI: Duration 135000ms (112% of SLO) | Status: FAILURE | Errors: 2
📈 SLO: 120000ms
🚨 SLA: 🚨 CRITICAL (112% over SLO) | Duration: EXCEEDED | Errors: EXCEEDED | Cache: MISS
🔄 Shape: EVOLVED - Signature changed significantly
Action: Review logs and fix compilation issues
```

## Debugging Telemetry

### Check stored telemetry
```bash
# View a specific beat's telemetry
cat .generated/telemetry/build-{buildId}/movement-{n}/beat-{n}.json | jq .

# View all breaches for a movement
ls .generated/telemetry/build-{buildId}/movement-{n}/ | while read f; do
  jq 'select(.sla.overall_status | test("breach|critical"))' ".generated/telemetry/build-{buildId}/movement-{n}/$f"
done
```

### Regenerate summaries
```bash
# After build completes, manually generate summaries
node -e "
const { generateMovementSummary, generateBuildSummary, printMovementSummary, printBuildSummary } = require('./scripts/build-symphony-telemetry-integration.js');
for (let i = 1; i <= 6; i++) {
  const s = generateMovementSummary('{buildId}', i);
  if (s) printMovementSummary(i, s.beats);
}
const b = generateBuildSummary('{buildId}');
if (b) printBuildSummary(b);
"
```

## Troubleshooting

### Telemetry not appearing
1. Check that `.generated/telemetry/` directory exists
2. Verify beat handlers are wrapped with `beatTelemetryCollector`
3. Check handler returns properly (errors prevent telemetry)
4. Ensure `--persist` flag is not disabled in options

### Inaccurate SLO baselines
1. Check `BEAT_TYPE_MAP` in `build-symphony-telemetry-integration.js`
2. Verify beat handler name matches the map
3. Adjust baseline in `SLO_BASELINES` if needed
4. Re-run build to collect new baseline

### Missing shape evolution
1. Ensure `shape-evolutions.json` exists in project root
2. Check `.generated/telemetry/` has proper JSON structure
3. Verify `crypto` module is available (should be built-in)
4. Shape hashing only triggers on 2nd and subsequent runs

## Integration with SLO Dashboard

Telemetry feeds into `packages/slo-dashboard`:

1. Dashboard reads telemetry JSON files
2. Displays SLI metrics per beat
3. Compares against SLO baselines
4. Highlights SLA breaches
5. Tracks shape evolution over time

Access dashboard after build:
```bash
npm run telemetry:dev
# or visit http://localhost:5173/slo-dashboard
```
