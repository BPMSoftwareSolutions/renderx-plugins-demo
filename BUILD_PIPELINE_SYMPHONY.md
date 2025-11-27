# 🎼 Build Pipeline Symphony - Architecture & Implementation Guide

## Overview

The **Build Pipeline Symphony** is a comprehensive orchestration system that transforms your linear build process into a symphonic composition with **6 movements**, **34 beats**, and **full traceability**. Every step in your build is now auditable, measurable, and governed by Symphonia's audit framework.

### Key Innovation
Instead of sequential npm scripts executed in a flat list, your build now follows a musical structure where:
- **Movements** = Major build phases (Validation → Manifests → Packages → Host → Artifacts → Verification)
- **Beats** = Discrete operations within each movement
- **Telemetry** = Complete tracking of timing, success/failure, and governance compliance
- **Governance** = 7 explicit policies ensuring quality, consistency, and auditability

---

## Architecture

### The 6-Movement Structure

```
┌─────────────────────────────────────────────────────────────┐
│  Movement 1: Validation & Verification (5 beats)          │
│  ✅ Validate domains, governance, agent behavior            │
└────────────────┬────────────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────────────────────┐
│  Movement 2: Manifest Preparation (5 beats)               │
│  📋 Generate and verify all catalogs and manifests          │
└────────────────┬────────────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────────────────────┐
│  Movement 3: Package Building (15 beats)                  │
│  📦 Build all 13 plugin packages in dependency order        │
└────────────────┬────────────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────────────────────┐
│  Movement 4: Host Application Building (4 beats)          │
│  🏠 Execute Vite build and validate artifacts               │
└────────────────┬────────────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────────────────────┐
│  Movement 5: Artifact Management (5 beats)                │
│  💾 Collect, hash, and catalog all artifacts                │
└────────────────┬────────────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────────────────────┐
│  Movement 6: Verification & Conformity (5 beats)          │
│  🔍 Run linting, governance checks, conformity validation   │
└─────────────────────────────────────────────────────────────┘
```

### Movement Details

#### Movement 1: Validation & Verification (5 beats) ✅
Pre-build validation ensuring system is ready.

| Beat | Handler | Purpose | Status |
|------|---------|---------|--------|
| 1 | `loadBuildContext` | Load config, environment, previous state | Immediate |
| 2 | `validateOrchestrationDomains` | Validate domain structure and IDs | Immediate |
| 3 | `validateGovernanceRules` | Validate governance policies | Immediate |
| 4 | `validateAgentBehavior` | Validate agent decision logic | Immediate |
| 5 | `recordValidationResults` | Record all validation metrics | Immediate |

---

#### Movement 2: Manifest Preparation (5 beats) 📋
Generate unified system view through catalogs and manifests.

| Beat | Handler | Purpose | Status |
|------|---------|---------|--------|
| 1 | `regenerateOrchestrationDomains` | Regenerate domains from sequences | Immediate |
| 2 | `syncJsonSources` | Sync JSON components from catalog | Immediate |
| 3 | `generateManifests` | Generate all manifest files | Immediate |
| 4 | `validateManifestIntegrity` | Verify manifest consistency | Immediate |
| 5 | `recordManifestState` | Record manifest checksums | Immediate |

**Generated Manifests:**
- Component manifest (all components)
- Sequence manifest (all sequences)
- Topic manifest (all event topics)
- Layout manifest (all layouts)
- Interaction manifest (all interactions)

---

#### Movement 3: Package Building (15 beats) 📦
Compile all 13 plugin packages in optimized dependency order.

| Beat | Package | Dependencies |
|------|---------|--------------|
| 1 | Initialize | - |
| 2 | @renderx-plugins/components | (base) |
| 3 | @renderx-plugins/musical-conductor | components |
| 4 | @renderx-plugins/host-sdk | components |
| 5 | @renderx-plugins/manifest-tools | components |
| 6 | @renderx-plugins/canvas | host-sdk |
| 7 | @renderx-plugins/canvas-component | canvas, musical-conductor |
| 8 | @renderx-plugins/control-panel | host-sdk, components |
| 9 | @renderx-plugins/header | host-sdk |
| 10 | @renderx-plugins/library | host-sdk |
| 11 | @renderx-plugins/library-component | library, host-sdk |
| 12 | @renderx-plugins/real-estate-analyzer | host-sdk |
| 13 | @renderx-plugins/self-healing | host-sdk |
| 14 | @renderx-plugins/slo-dashboard | host-sdk |
| 15 | Record metrics | - |

**Execution Strategy:**
- Beat 2-5: Core infrastructure (no parallelization to ensure stability)
- Beat 6-14: Plugins (can parallelize with proper dependency coordination)
- Beat 15: Final metrics recording

---

#### Movement 4: Host Application Building (4 beats) 🏠
Build main host application using Vite.

| Beat | Handler | Purpose | Status |
|------|---------|---------|--------|
| 1 | `prepareHostBuild` | Setup Vite environment | Immediate |
| 2 | `viteHostBuild` | Execute `vite build` | Deferred |
| 3 | `validateHostArtifacts` | Verify dist/ directory | Immediate |
| 4 | `recordHostBuildMetrics` | Record bundle metrics | Immediate |

---

#### Movement 5: Artifact Management (5 beats) 💾
Verify integrity of all build artifacts.

| Beat | Handler | Purpose | Status |
|------|---------|---------|--------|
| 1 | `collectArtifacts` | Gather artifacts from dist/ and packages/ | Immediate |
| 2 | `computeArtifactHashes` | Compute SHA-256 hashes | Immediate |
| 3 | `validateArtifactSignatures` | Verify artifact signatures | Immediate |
| 4 | `generateArtifactManifest` | Create comprehensive manifest | Immediate |
| 5 | `recordArtifactMetrics` | Record artifact statistics | Immediate |

**Output:** `.generated/build-artifact-manifest.json`

---

#### Movement 6: Verification & Conformity (5 beats) 🔍
Final quality assurance and governance verification.

| Beat | Handler | Purpose | Status |
|------|---------|---------|--------|
| 1 | `runLintChecks` | Run ESLint validation | Deferred |
| 2 | `enrichDomainAuthorities` | Add build metadata to domains | Immediate |
| 3 | `generateGovernanceDocs` | Generate governance reports | Immediate |
| 4 | `validateConformityDimensions` | Check all 5 Symphonia dimensions | Immediate |
| 5 | `generateBuildReport` | Create comprehensive build report | Immediate |

**Output:** `.generated/build-symphony-report.json`

---

## Governance Policies

The Build Pipeline Symphony enforces **7 explicit policies**:

### Policy 1: Sequential Execution Order
All build phases must execute in strict order. Failure to advance to next phase on error.

### Policy 2: Comprehensive Telemetry
Each beat must record:
- ⏱️ Start timestamp
- ⏱️ End timestamp
- 📊 Duration in milliseconds
- ✅/❌ Success/failure status
- 📝 Error message (if failed)

### Policy 3: Artifact Validation
Build artifacts must be validated before advancement:
- dist/ directory exists and contains files
- All package dist/ directories populated
- Manifest files generated and consistent

### Policy 4: Rollback Capability
Failed beats must support rollback to previous stable state:
- Snapshot state before Phase 3 (package building)
- Cache state for quick rebuild
- Previous build artifacts remain accessible

### Policy 5: Build Log Archival
All build logs archived with correlation IDs:
- Unique correlation ID for each build
- All movements/beats keyed by correlation ID
- Logs accessible for post-build analysis

### Policy 6: Performance Tracking
Build performance tracked against baselines:
- Per-movement duration recorded
- Per-beat duration recorded
- Total build time calculated
- Slow beats identified for optimization

### Policy 7: Concurrent Safety
Package builds respect system capacity:
- Maximum concurrent packages = CPU count - 1
- Core packages (components, conductor, sdk) build sequentially
- Plugin packages can parallelize
- Resource limits enforced

---

## Telemetry Structure

Every build creates a comprehensive telemetry report: `.generated/build-symphony-report.json`

```json
{
  "startTime": 1700000000000,
  "correlationId": "550e8400-e29b-41d4-a716-446655440000",
  "movements": {
    "Movement 1": {
      "name": "Validation & Verification",
      "beats": 5,
      "status": "complete",
      "timestamp": "2025-11-26T12:00:00.000Z"
    },
    "Movement 2": {
      "name": "Manifest Preparation",
      "beats": 5,
      "status": "complete",
      "timestamp": "2025-11-26T12:00:15.000Z"
    },
    // ... all movements
  },
  "artifacts": [
    "dist/index.html",
    "dist/assets/index.abc123.js",
    // ... all collected artifacts
  ],
  "metrics": {
    "totalDurationMs": 125000,
    "packageCount": 13,
    "artifactCount": 1450,
    "conformityScore": 95
  },
  "completedAt": "2025-11-26T12:02:05.000Z",
  "status": "SUCCESS"
}
```

---

## Usage

### Basic Build (Standard - Mezzo-Forte)
```bash
npm run build:symphony
```

Executes full 6-movement build with standard verification.

### Validation-Only Build (Piano)
```bash
npm run build:symphony:validate
```

Runs Movement 1 only - validates system state without building artifacts.

### Strict Build (Forte)
```bash
npm run build:symphony:strict
```

Full build with strict conformity validation - fails on any compliance issues.

### CI Build (Fortissimo)
```bash
npm run build:symphony:ci
```

CI-optimized build with artifact archival, strict conformity, and detailed reporting.

---

## Handler Functions

All handlers follow the signature:

```typescript
async function handlerName(data: any, ctx: any): Promise<{ success: boolean; [key: string]: any }> {
  // Implementation
  return { success: true, /* additional data */ };
}
```

### Key Handler Implementations

#### `validateOrchestrationDomains`
```javascript
// Validates:
// - orchestration-domains.json exists and is valid JSON
// - All domains have required fields (id, name, movements)
// - All movements have beats
// - No duplicate domain IDs
```

#### `buildComponentsPackage` (and similar)
```javascript
// Executes:
// npm --prefix packages/[package] run build
// Records:
// - Build duration
// - Success/failure status
// - Error messages (on failure)
```

#### `generateBuildReport`
```javascript
// Creates comprehensive telemetry JSON with:
// - All movement metrics
// - Artifact collection results
// - Total build duration
// - Conformity score
// - Status (SUCCESS/FAILED)
```

---

## Integration with Existing Build

### Current Build Command
```bash
npm run build
```

This executes: `validate:domains && generate:governance:docs && ... && build:all && ...`

### New Symphonic Integration
```bash
npm run build
# → Calls: node scripts/orchestrate-build-symphony.js --dynamic=mf
```

The orchestrator:
1. Maintains all existing build steps
2. Wraps them in symphonic movements
3. Adds telemetry and governance tracking
4. Generates comprehensive reports

---

## Dynamic Levels

The Build Pipeline supports 4 dynamic execution levels:

### Piano (p) - Development
```bash
node scripts/orchestrate-build-symphony.js --dynamic=p
```
- Validates only (Movement 1)
- No package building
- Useful for quick validation checks

### Mezzo-Forte (mf) - Standard (DEFAULT)
```bash
node scripts/orchestrate-build-symphony.js --dynamic=mf
```
- Full 6-movement build
- Standard verification
- Used for local development builds

### Forte (f) - Full
```bash
node scripts/orchestrate-build-symphony.js --dynamic=f
```
- Full build with strict conformity
- Enhanced verification
- Fails on compliance issues
- Used for release builds

### Fortissimo (ff) - CI
```bash
node scripts/orchestrate-build-symphony.js --dynamic=ff
```
- Full build with artifact archival
- Strict conformity enforcement
- Comprehensive reporting
- Used in CI/CD pipelines

---

## Error Handling

### Critical Failures (Abort)
These failures stop the build immediately:
- Domain validation failure (Beat 1.2)
- Package build failure (any Beat 3.x)
- Host build failure (Beat 4.2)
- Artifact collection failure (Beat 5.1)

### Non-Critical Warnings (Continue)
These don't stop the build:
- Governance validation issues
- Lint warnings
- Manifest sync warnings
- Documentation generation issues

### Recovery Strategy
For critical failures:
1. Build exits with status code 1
2. Error details logged to console
3. Telemetry saved to `.generated/build-symphony-report.json`
4. Previous build artifacts remain intact (for rollback)

---

## Performance Optimization

### Parallel Execution Strategy

**Movement 3 - Package Building:**
```
Serial (Beats 1-5):          Core infrastructure
components → conductor → sdk → manifest-tools → canvas

Parallel (Beats 6-14):        Plugins
canvas-component, control-panel, header, library
library-component, real-estate-analyzer, self-healing, slo-dashboard
(respect dependency graph)

Serial (Beat 15):             Final metrics
```

### Caching Strategy
- Vite caches in `node_modules/.vite`
- Package caches in individual `dist/` directories
- Manifest files checksummed for change detection
- Previous build state preserved for quick rebuilds

---

## File Organization

### New Files Created

```
scripts/
├── build-symphony-handlers.js              # 30+ handler implementations
├── orchestrate-build-symphony.js           # Orchestration engine
└── [existing build scripts]

packages/orchestration/
├── json-sequences/
│   └── build-pipeline-symphony.json        # Sequence definition
└── bdd/
    └── build-pipeline-symphony.feature     # BDD specifications

.generated/
├── build-symphony-report.json              # Build telemetry report
└── build-artifact-manifest.json            # Artifact catalog
```

### Updated Files

```
package.json                                 # New npm scripts added:
                                            # - build:symphony
                                            # - build:symphony:validate
                                            # - build:symphony:strict
                                            # - build:symphony:ci
```

---

## Troubleshooting

### Build Fails at Movement 1
**Symptom:** Domain validation fails
**Cause:** `orchestration-domains.json` missing or invalid
**Fix:** Run `npm run pre:manifests` to regenerate

### Build Fails at Movement 3
**Symptom:** A package build fails
**Cause:** Package dependencies not installed or code errors
**Fix:** 
```bash
npm install
npm run rebuild:mc
npm run build:symphony
```

### Slow Build Performance
**Symptom:** Build takes significantly longer than usual
**Solution:** 
1. Check Movement 3 beat durations in report
2. Identify slow packages
3. Clean cache: `npm run clean:all`
4. Rebuild: `npm run build:symphony`

### Missing Build Report
**Symptom:** No `.generated/build-symphony-report.json`
**Cause:** Permissions or filesystem issues
**Fix:** Ensure `.generated` directory exists and is writable

---

## Next Steps

### Phase 2: Enhanced Capabilities
- [ ] Parallel package building orchestration
- [ ] Incremental builds (skip unchanged packages)
- [ ] Performance profiling and optimization
- [ ] Build history and trending
- [ ] Automated rollback on failure

### Phase 3: Deep Integration
- [ ] CI/CD pipeline orchestration
- [ ] Build artifact signing and verification
- [ ] Multi-environment build support
- [ ] Build caching strategy optimization
- [ ] Distributed build coordination

### Phase 4: Advanced Features
- [ ] ML-based build prediction
- [ ] Automatic build time estimation
- [ ] Smart cache invalidation
- [ ] Parallel build strategy optimization
- [ ] Build timeline visualization

---

## Key Metrics to Track

After each build, review:

1. **Total Build Time**
   - Target: < 2 minutes
   - Previous: Baseline from last build
   - Trend: Average over last 10 builds

2. **Movement Breakdown**
   - Movement 3 should be ~60% of total time
   - Movement 1 & 2 should be ~10% each
   - Movement 4 should be ~15%

3. **Conformity Score**
   - Target: 100%
   - Minimum acceptable: 95%
   - Trending toward 100%

4. **Artifact Count**
   - Track total artifacts produced
   - Monitor growth in artifact size
   - Alert on unexpected increases

---

## Related Documentation

- **Symphonia Pipeline Guide:** `SYMPHONIA_PIPELINE_CDP_GUIDE.md`
- **Orchestration Domains:** `orchestration-domains.json`
- **Handler Tests:** `packages/orchestration/tests/build-symphony.spec.ts`
- **BDD Specifications:** `packages/orchestration/bdd/build-pipeline-symphony.feature`

---

Generated: November 26, 2025
