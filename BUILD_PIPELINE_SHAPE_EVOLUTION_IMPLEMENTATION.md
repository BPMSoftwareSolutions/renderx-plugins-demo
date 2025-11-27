# 🎼 Build Pipeline Shape Evolution Implementation Guide

**Date**: November 26, 2025  
**Status**: Implementation Ready  
**Components**: 3 files deployed

---

## 📦 What's Deployed

### **1. Enhanced Build Pipeline Symphony** 
**File**: `packages/orchestration/json-sequences/build-pipeline-symphony.json`

Added to the symphony:
```json
"shapeEvolution": {
  "enabled": true,
  "telemetryStorage": ".generated/telemetry/build-{timestamp}/",
  "shapeRegistry": "shape-evolutions.json",
  "sliMetrics": [...],
  "beatSloBaselines": {...},
  "slaBreachThresholds": {...}
}
```

**What it does**:
- Defines telemetry storage location
- Specifies SLI metrics to collect (6 metrics per beat)
- Sets SLO baselines by beat type (validation, generation, build, verification)
- Configures SLA breach thresholds (warning=70%, breach=90%, critical=110%)

### **2. Beat Telemetry Collector**
**File**: `scripts/beat-telemetry-collector.cjs`

**Main exports**:
- `beatTelemetryCollector()` - Wraps beat handlers with telemetry
- `aggregateBuildTelemetry()` - Loads and aggregates telemetry from disk
- `generateSliSloSlaReport()` - Creates comprehensive SLI/SLO/SLA reports
- `getDurationBucket()` - Bucketizes duration for shape hashing
- `computeShapeHash()` - Calculates SHA256 signature per beat

**What it does**:
- Wraps each beat handler to collect SLI metrics automatically
- Computes shape hash (signature) from: movement + beat + duration_bucket + status + artifacts + errors + memory + cache
- Compares current shape hash to previous in `shape-evolutions.json`
- Evaluates SLA compliance (checks if duration/errors/cache exceed SLO)
- Persists telemetry to `.generated/telemetry/build-{id}/movement-{n}/beat-{n}.json`
- Generates SLI/SLO/SLA reports with breach detection

### **3. Strategy Documentation**
**File**: `BUILD_PIPELINE_SHAPE_EVOLUTION_STRATEGY.md`

Provides:
- Architecture overview
- Beat signature components
- SLI/SLO/SLA framework definitions
- Workflow diagrams
- Implementation phases
- Integration points

---

## 🎵 How Shape Evolution Works Per Beat

### **Before Execution**
```
1. Load previous shape hash from shape-evolutions.json
2. Set SLO baseline for this beat type
3. Start telemetry collection
```

### **During Execution**
```
1. Execute beat handler normally
2. Collect metrics continuously:
   - Elapsed time
   - Status (success/failure)
   - Artifacts generated
   - Errors encountered
   - Memory delta
   - Cache state
```

### **After Execution**
```
1. Compute current shape hash from SLI metrics
2. Compare to previous hash
3. If different: Mark as "evolved"
4. Evaluate SLA compliance:
   - Is duration > SLO? (Check warning/breach/critical thresholds)
   - Are errors > expected?
   - Is cache hit rate < target?
5. Persist telemetry record with all metrics
6. Report status: "success/warning/breach/critical"
```

### **Analysis Phase**
```
1. Aggregate SLI across all beats
2. Generate SLI/SLO/SLA report
3. Identify beat anomalies
4. Correlate shape changes with performance issues
```

---

## 📊 Telemetry Record Structure

Each beat produces a record like this:

```json
{
  "timestamp": "2025-11-26T12:34:56.789Z",
  "correlationId": "build-abc123",
  "buildId": "build-20251126-123456",
  "movement": 3,
  "beat": 5,
  "beatName": "buildMusicalConductorPackage",
  "event": "movement-3:package:build:completed",
  
  "sli": {
    "duration_ms": 12450,           // Actual execution time
    "duration_bucket": "5-30s",     // For shape hashing
    "status": "success",             // success|failure|partial
    "artifacts_count": 8,           // Outputs generated
    "errors_count": 0,              // Errors encountered
    "memory_delta_mb": 145.2,       // Heap memory change
    "cache_state": "hit"            // hit|miss|skip|expired
  },
  
  "shape": {
    "currentHash": "a1b2c3d4e5f6...",     // SHA256 of SLI + beat info
    "previousHash": "z9y8x7w6v5u4...",    // From last run
    "evolved": true,                       // Changed from last run?
    "evolutionReason": null                // Why shape changed
  },
  
  "slo": {
    "targetDuration_ms": 10000,
    "targetErrorRate": 0.0,
    "targetCacheHitRate": 0.85
  },
  
  "sla": {
    "duration_exceeded": false,
    "duration_breach_percent": -24.5,
    "duration_status": "compliant",        // compliant|warning|breach|critical
    "error_limit_exceeded": false,
    "cache_hit_shortfall": false,
    "overall_status": "compliant"          // Beat SLA status
  }
}
```

---

## 🔄 Integration With slo-dashboard

The telemetry feeds directly into slo-dashboard:

```
Beat Execution
    ↓
SLI Collection (6 metrics)
    ↓
Shape Hash Computation
    ↓
SLO Comparison
    ↓
SLA Evaluation
    ↓
Telemetry Persisted
    ↓
Build Report Generated
    ↓
slo-dashboard reads reports
    ↓
Display SLI/SLO/SLA metrics per beat
    ↓
Show SLA breaches (warnings/alerts)
    ↓
Track shape evolution over time
```

---

## 📁 Telemetry Storage Structure

After a build, you'll have:

```
.generated/telemetry/
├── build-20251126-123456/           (One per build run)
│   ├── movement-1/
│   │   ├── beat-1-loadBuildContext.json
│   │   ├── beat-2-validateOrchestrationDomains.json
│   │   ├── beat-3-validateGovernanceRules.json
│   │   ├── beat-4-validateAgentBehavior.json
│   │   └── beat-5-recordValidationResults.json
│   ├── movement-2/
│   │   ├── beat-1-regenerateOrchestrationDomains.json
│   │   ├── beat-2-syncJsonSources.json
│   │   ├── beat-3-generateManifests.json
│   │   ├── beat-4-validateManifestIntegrity.json
│   │   └── beat-5-recordManifestState.json
│   ├── movement-3/
│   │   ├── beat-1-initializePackageBuild.json
│   │   ├── beat-2-buildComponentsPackage.json
│   │   ├── ... (13 package builds)
│   │   └── beat-15-recordPackageBuildMetrics.json
│   ├── movement-4/
│   │   ├── beat-1-prepareHostBuild.json
│   │   ├── beat-2-viteHostBuild.json
│   │   ├── beat-3-validateHostArtifacts.json
│   │   └── beat-4-recordHostBuildMetrics.json
│   ├── movement-5/
│   │   ├── beat-1-collectArtifacts.json
│   │   ├── beat-2-computeArtifactHashes.json
│   │   ├── beat-3-validateArtifactSignatures.json
│   │   ├── beat-4-generateArtifactManifest.json
│   │   └── beat-5-recordArtifactMetrics.json
│   ├── movement-6/
│   │   ├── beat-1-runLintChecks.json
│   │   ├── beat-2-enrichDomainAuthorities.json
│   │   ├── beat-3-generateGovernanceDocs.json
│   │   ├── beat-4-validateConformityDimensions.json
│   │   └── beat-5-generateBuildReport.json
│   └── build-sli-slo-sla-report.json  ← **Main report**
```

---

## 🎯 SLO Baselines by Beat Type

These are set in the symphony:

| Beat Type | Duration SLO | Error SLO | Cache Hit SLO | Examples |
|-----------|-------------|-----------|--------------|----------|
| **validation** | 5s | 0 errors | N/A | Load context, validate domains, governance |
| **generation** | 15s | 0 errors | 80% | Generate manifests, orchestration docs |
| **build** | 120s (2m) | 0 errors | 90% | Package builds, Vite host build |
| **verification** | 10s | 0 errors | 85% | Lint checks, conformity validation |
| **observation** | 5s | 0 errors | N/A | Record metrics, reports |

---

## 🚨 SLA Breach Thresholds

```
SLO Target: 10 seconds

Threshold Levels:
├─ Compliant: ≤ 10s (0-100% of SLO)
├─ Warning: 10-15s (100-150% of SLO) — 70% of breach limit
├─ Breach: 15-20s (150-200% of SLO) — 90% of breach limit
└─ Critical: > 20s (>200% of SLO) — >110% of SLO

Default thresholds in symphony:
{
  "warning": 0.7,    // 70% of SLO
  "breach": 0.9,     // 90% of SLO
  "critical": 1.1    // 110% of SLO
}
```

---

## 🔍 Understanding Shape Hash

The shape hash captures the **signature** of a beat execution:

```
Shape = SHA256(
  "m3:b5:" +                          // Movement 3, Beat 5
  "5-30s:" +                          // Duration bucket
  "success:" +                        // Status
  "a2:" +                             // Artifacts bucket (2 = 5-10 files)
  "eclean:" +                         // Errors (clean = 0 errors)
  "mem1:" +                           // Memory bucket (1 = 50-100 MB)
  "hit"                               // Cache state
)
```

**Why?** This lets you track:
- ✅ Performance stability: Same hash = consistent performance
- ✅ Regressions: Hash changed = performance changed
- ✅ Evolution: Annotate why hash changed (optimization, new code, etc)
- ✅ Correlation: Link shape changes to SLA breaches

---

## 📈 Implementation Phases

### **Phase 1: Foundation** (Now - Deployed)
- ✅ Enhanced symphony with shape/SLI/SLO/SLA config
- ✅ Beat telemetry collector created
- ✅ Strategy documentation complete

### **Phase 2: Integration** (This Week)
- **TODO**: Wrap build pipeline beats with telemetry
- **TODO**: Test with real build runs
- **TODO**: Validate telemetry collection

### **Phase 3: Dashboard** (Next Week)
- **TODO**: Feed telemetry to slo-dashboard
- **TODO**: Display per-beat metrics
- **TODO**: Show SLA breach alerts

### **Phase 4: Automation** (Week After)
- **TODO**: Auto-remediation on SLA breaches
- **TODO**: Historical trend analysis
- **TODO**: Predictive SLA alerts

---

## 🚀 Quick Start: Using the Collector

### **Wrapping a Beat**

```javascript
const { beatTelemetryCollector } = require('./scripts/beat-telemetry-collector.cjs');

// Original beat handler
async function buildMusicalConductor() {
  // Build logic
  return { artifactCount: 8, errorCount: 0, cacheState: 'hit' };
}

// Wrap with telemetry
const wrappedBeat = beatTelemetryCollector(
  buildMusicalConductor,
  {
    movement: 3,
    beat: 5,
    beatName: 'buildMusicalConductorPackage',
    event: 'movement-3:package:build:started'
  },
  {
    duration_ms: 120000,    // 2-minute SLO
    error_count: 0,
    cache_hit_rate: 0.9
  },
  {
    buildId: 'build-20251126-123456',
    correlationId: 'corr-xyz'
  }
);

// Execute
const result = await wrappedBeat();
// result.telemetry contains all SLI/SLO/SLA metrics
```

### **Generating Reports After Build**

```javascript
const { generateSliSloSlaReport } = require('./scripts/beat-telemetry-collector.cjs');

const report = generateSliSloSlaReport('build-20251126-123456');
console.log('Build breaches:', report.breaches.length);
console.log('Success rate:', report.summary.successRate + '%');
```

---

## 🔗 Integration Points

### **With Symphonia Conformity**
If SLA breaches detected → Can trigger Movement 4 remediation:
```
SLA Breach Detected (beat duration > critical threshold)
    ↓
Phase 4 Process Symphonic Remediation triggered
    ↓
Analyze cause of performance regression
    ↓
Apply optimization/fix
    ↓
Rerun build with new shape baseline
```

### **With shape-evolutions.json**
When shape evolves:
```
{
  "feature": "movement-3-beat-5",
  "previousHash": "z9y8x7w6v5u4...",
  "newHash": "a1b2c3d4e5f6...",
  "annotatedAt": "2025-11-26T12:34:56.789Z",
  "reason": "Package optimization reduced build time by 25%"
}
```

---

## ✅ Success Criteria

When fully integrated, you'll be able to:

1. ✅ **Observe SLI**: Watch duration/errors/cache metrics per beat in real-time
2. ✅ **Compare to SLO**: See which beats meet/miss targets
3. ✅ **Detect SLA Breaches**: Get alerts on performance degradation
4. ✅ **Track Evolution**: See shape changes correlate with performance
5. ✅ **Correlate Issues**: Link shape changes to SLA breaches
6. ✅ **Analyze Trends**: Historical view of beat performance
7. ✅ **Remediate**: Trigger fixes when breaches occur
8. ✅ **Report**: Generate governance reports on build health

---

## 📚 Files Reference

| File | Purpose | Status |
|------|---------|--------|
| `BUILD_PIPELINE_SHAPE_EVOLUTION_STRATEGY.md` | Strategic overview | ✅ Created |
| `packages/orchestration/json-sequences/build-pipeline-symphony.json` | Enhanced with shape/SLI/SLO/SLA config | ✅ Enhanced |
| `scripts/beat-telemetry-collector.cjs` | Telemetry collection & reporting | ✅ Created |
| `shape-evolutions.json` | Shape registry (updated per build) | ✅ Ready |
| `.generated/telemetry/` | Telemetry storage (created at runtime) | ✅ Ready |

---

## 🎯 Next Steps

1. **This week**: Integrate telemetry collector into build pipeline handler
2. **Run test build** with telemetry collection
3. **Verify telemetry** in `.generated/telemetry/`
4. **Test SLO comparison** against baselines
5. **Generate report** and verify SLA breach detection
6. **Connect to slo-dashboard** for visualization

---

**The foundation is now in place. Each beat will emit telemetry signatures that let you observe SLI, compare to SLO, and detect SLA breaches!**

