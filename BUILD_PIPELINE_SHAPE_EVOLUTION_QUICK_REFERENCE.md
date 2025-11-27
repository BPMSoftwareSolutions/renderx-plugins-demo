# 🎼 Build Pipeline Shape Evolution - Quick Reference

**Last Updated**: November 26, 2025  
**Status**: Foundation Deployed (Phase 1 Complete)  
**Commits**: 1136ecf, 1264685

---

## 🎯 What You Get

```
Each beat in the build pipeline now emits:
├─ SLI (Service Level Indicator): 6 measured metrics
├─ Shape: Signature hash (SHA256) for evolution tracking
├─ SLO: Target baselines for comparison
└─ SLA: Breach detection (warning/breach/critical)
```

---

## 📊 6 SLI Metrics Per Beat

| Metric | Unit | Example | Purpose |
|--------|------|---------|---------|
| `duration_ms` | milliseconds | 12450 | Execution time |
| `status` | enum | success|failure | Did it work? |
| `artifacts_count` | count | 8 | Outputs generated |
| `errors_count` | count | 0 | Errors encountered |
| `memory_delta_mb` | MB | 145.2 | Memory consumed |
| `cache_state` | enum | hit|miss|skip | Cache effectiveness |

---

## 📈 SLO Baselines by Beat Type

```javascript
// From build-pipeline-symphony.json
beatSloBaselines: {
  validation: { duration_ms: 5000, error_count: 0 },              // 5 seconds
  generation: { duration_ms: 15000, error_count: 0, cache_hit_rate: 0.8 },  // 15 seconds
  build: { duration_ms: 120000, error_count: 0, cache_hit_rate: 0.9 },      // 2 minutes
  verification: { duration_ms: 10000, error_count: 0, cache_hit_rate: 0.85 }, // 10 seconds
  observation: { duration_ms: 5000, error_count: 0 }             // 5 seconds
}
```

---

## 🚨 SLA Thresholds

For **SLO: 10 seconds**:

```
✓ Compliant:  0-7s   (warning threshold = 70% of SLO)
⚠ Warning:   7-9s   (breach threshold = 90% of SLO)
🔴 Breach:   9-11s  (critical threshold = 110% of SLO)
🚨 Critical: >11s   (critical zone)
```

**Configuration**:
```json
"slaBreachThresholds": {
  "warning": 0.7,    // 70% of SLO
  "breach": 0.9,     // 90% of SLO
  "critical": 1.1    // 110% of SLO
}
```

---

## 🎵 Per-Beat Flow

```
┌─────────────────────────────────────────────────┐
│ BEFORE: Load metadata & SLO baseline            │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│ DURING: Execute beat handler (no changes)      │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│ AFTER: Collect SLI metrics                     │
│ - duration, status, artifacts, errors, memory │
│ - cache_state                                  │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│ Compute shape hash                             │
│ SHA256(m:b:duration_bucket:status:...)        │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│ Load previous hash from shape-evolutions.json  │
│ evolved = (currentHash !== previousHash)       │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│ Evaluate SLA compliance                        │
│ ✓ Duration check vs baseline                  │
│ ✓ Error count check                           │
│ ✓ Cache hit rate check                        │
│ → overall_status: compliant|warning|breach... │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│ Persist telemetry                              │
│ .generated/telemetry/build-xxx/movement-n/... │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│ Return result with telemetry attached          │
│ {originalResult, telemetry: {sli, shape, ...}}│
└─────────────────────────────────────────────────┘
```

---

## 📁 Telemetry Storage

```
.generated/telemetry/build-20251126-123456/
├── movement-1/
│   ├── beat-1-loadBuildContext.json
│   ├── beat-2-validateOrchestrationDomains.json
│   ├── beat-3-validateGovernanceRules.json
│   ├── beat-4-validateAgentBehavior.json
│   └── beat-5-recordValidationResults.json
├── movement-2/ (5 beats)
├── movement-3/ (15 beats - package builds)
├── movement-4/ (4 beats - host build)
├── movement-5/ (5 beats - artifacts)
├── movement-6/ (5 beats - verification)
└── build-sli-slo-sla-report.json ← Main report

Total: 6 movements × 28 beats = 28 JSON records + 1 summary
```

---

## 📋 Telemetry Record Example

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
    "duration_ms": 12450,
    "duration_bucket": "5-30s",
    "status": "success",
    "artifacts_count": 8,
    "errors_count": 0,
    "memory_delta_mb": 145.2,
    "cache_state": "hit"
  },
  
  "shape": {
    "currentHash": "a1b2c3d4e5f6...",
    "previousHash": "z9y8x7w6v5u4...",
    "evolved": true,
    "evolutionReason": null
  },
  
  "slo": {
    "targetDuration_ms": 120000,
    "targetErrorRate": 0.0,
    "targetCacheHitRate": 0.9
  },
  
  "sla": {
    "duration_exceeded": false,
    "duration_breach_percent": -24.5,
    "duration_status": "compliant",
    "error_limit_exceeded": false,
    "cache_hit_shortfall": false,
    "overall_status": "compliant"
  }
}
```

---

## 🔧 Using the Telemetry Collector

### **Basic Usage**

```javascript
const { beatTelemetryCollector } = require('./scripts/beat-telemetry-collector.cjs');

// Wrap a beat handler
const wrappedBeat = beatTelemetryCollector(
  async () => {
    // Your beat logic here
    return { artifactCount: 8, errorCount: 0, cacheState: 'hit' };
  },
  {
    movement: 3,
    beat: 5,
    beatName: 'buildMusicalConductor',
    event: 'movement-3:package:build:started'
  },
  {
    duration_ms: 120000,
    error_count: 0,
    cache_hit_rate: 0.9
  },
  {
    buildId: 'build-20251126-123456',
    correlationId: 'corr-abc123'
  }
);

// Execute
const result = await wrappedBeat();
console.log(result.telemetry.sli);      // SLI metrics
console.log(result.telemetry.sla);      // SLA status
```

### **Aggregating Results**

```javascript
const { aggregateBuildTelemetry, generateSliSloSlaReport } = require('./scripts/beat-telemetry-collector.cjs');

// Load all telemetry from a build
const aggregated = aggregateBuildTelemetry('build-20251126-123456');

// Generate report
const report = generateSliSloSlaReport('build-20251126-123456');
console.log('Total breaches:', report.breaches.length);
console.log('Success rate:', report.summary.successRate + '%');
console.log('Breach percentage:', report.summary.breachPercentage + '%');
```

---

## 🎯 Beat Types & Timing

| Movement | Beat Type | Duration SLO | Count | Total |
|----------|-----------|-------------|-------|-------|
| 1 | Validation | 5s | 5 | 25s |
| 2 | Generation | 15s | 5 | 75s |
| 3 | Build | 2m | 15 | 30m |
| 4 | Build | 2m | 4 | 8m |
| 5 | Verification | 10s | 5 | 50s |
| 6 | Verification | 10s | 5 | 50s |
| **TOTAL** | **Various** | **~46m** | **28** | **~46m** |

---

## 🔍 Shape Hash Components

```
Shape = SHA256(
  "m3:b5:" +              // Movement 3, Beat 5
  "5-30s:" +              // Duration bucket
  "success:" +            // Status
  "a2:" +                 // Artifacts bucket (0=0, 1=1-5, 2=5-10, ...)
  "eclean:" +             // Errors (e0=clean, e1=errors)
  "mem1:" +               // Memory bucket (0=<50MB, 1=50-100MB, ...)
  "hit"                   // Cache state
)
```

**Why?** Captures performance signature - same shape = same characteristics

---

## 📊 Example SLA Evaluation

**Beat**: buildMusicalConductorPackage  
**SLO**: 120 seconds  
**Actual**: 145 seconds  

```
Duration exceeded: 145 - 120 = 25 seconds over
Breach percent: (145/120 - 1) × 100 = 20.8% over

Threshold check:
- ratio = 145/120 = 1.208
- critical threshold = 1.1
- 1.208 > 1.1 → CRITICAL breach

Status: 🚨 CRITICAL
severity_level: critical
duration_status: critical
overall_status: critical
```

---

## 🚀 Integration Timeline

### **Now** ✅
- ✅ Shape evolution framework defined
- ✅ SLO baselines configured
- ✅ SLA thresholds configured
- ✅ Telemetry collector built

### **This Week**
- [ ] Wrap 28 beats with telemetry
- [ ] Test with real builds
- [ ] Validate metrics

### **Next Week**
- [ ] Feed to slo-dashboard
- [ ] Display per-beat metrics
- [ ] Create alerts

### **Week After**
- [ ] Auto-remediation on breaches
- [ ] Historical analysis
- [ ] Predictive alerts

---

## 📚 Key Files

| File | Purpose |
|------|---------|
| `BUILD_PIPELINE_SHAPE_EVOLUTION_STRATEGY.md` | Strategic overview & architecture |
| `BUILD_PIPELINE_SHAPE_EVOLUTION_IMPLEMENTATION.md` | Implementation details & quick start |
| `BUILD_PIPELINE_SHAPE_EVOLUTION_COMPLETE.md` | Full summary & roadmap |
| `scripts/beat-telemetry-collector.cjs` | Telemetry collector implementation |
| `packages/orchestration/json-sequences/build-pipeline-symphony.json` | Enhanced with shape/SLI/SLO/SLA config |
| `shape-evolutions.json` | Evolution registry (updated per build) |
| `.generated/telemetry/` | Telemetry storage (runtime) |

---

## ✅ Checklist for Implementation

### **Phase 1: Foundation** ✅ DONE
- [x] Design SLI/SLO/SLA framework
- [x] Create beat telemetry collector
- [x] Define SLO baselines
- [x] Configure SLA thresholds
- [x] Document strategy & implementation

### **Phase 2: Integration** (Next)
- [ ] Wrap beat 1 (loadBuildContext)
- [ ] Wrap beats 2-5 (Movement 1)
- [ ] Wrap beats 1-5 (Movement 2)
- [ ] Wrap beats 1-15 (Movement 3 - packages)
- [ ] Wrap beats 1-4 (Movement 4 - host)
- [ ] Wrap beats 1-5 (Movement 5 - artifacts)
- [ ] Wrap beats 1-5 (Movement 6 - verification)
- [ ] Test with real build
- [ ] Validate telemetry collection

### **Phase 3: Dashboard**
- [ ] Feed telemetry to slo-dashboard
- [ ] Display per-beat SLI metrics
- [ ] Show SLO compliance
- [ ] Alert on SLA breaches
- [ ] Visualize shape evolution

### **Phase 4: Automation**
- [ ] Correlate shape changes to performance
- [ ] Implement auto-remediation triggers
- [ ] Build historical analysis
- [ ] Create predictive SLA alerts
- [ ] Integration with conformity pipeline

---

## 💡 Key Insights

1. **Shape = Signature**: Same shape = same performance characteristics
2. **Three Thresholds**: Warning (prepare) → Breach (fix) → Critical (emergency)
3. **Per-Beat SLOs**: Different beats have different requirements
4. **Automatic Collection**: No changes needed to beat handlers
5. **Full Traceability**: Every metric persisted with correlation ID

---

## 🎯 Success Criteria

✅ Observe SLI - Watch 6 metrics per beat in real-time  
✅ Compare SLO - See beats meet/miss targets  
✅ Detect SLA - Get alerts on performance degradation  
✅ Track Evolution - See shape changes over time  
✅ Correlate Issues - Link shapes to SLA breaches  
✅ Analyze Trends - Historical view of performance  
✅ Remediate - Trigger fixes on breaches  
✅ Report - Governance reports on build health  

---

**Ready to integrate with your 28 build beats!**

