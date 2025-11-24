# SLO Dashboard: Next Session Handoff Guide

**Generated**: 2025-11-24T22:00:00Z  
**For**: Continuation of Phase 3 & 4  
**Status**: Ready for pickup  
**Estimated Time to Phase 6**: 4-6 hours

---

## Quick Start (5 minutes)

### 1. Verify Context
```bash
# Location
cd packages/slo-dashboard

# Check authority files exist
ls -la slo-dashboard-project-plan.json
ls -la .generated/slo-dashboard-business-bdd-specifications.json
ls -la .generated/SLO_DASHBOARD_FILE_GOVERNANCE.json

# Verify no root pollution
ls -la | grep -E '\.(log|tmp|json|md)$' | grep -v '^d' | grep -v 'slo-dashboard-project-plan'
```

### 2. Understand Current State
- ✅ Phase 1-2: COMPLETE (specs locked, tests auto-generated)
- ⏳ Phase 3-4: IN-PROGRESS (need telemetry & assertions)
- ⏱️ Phase 5-6: PENDING (will auto-complete after phases 3-4)

### 3. Read These First (15 minutes)
1. `.generated/CONTEXT_TREE_AUDIT_SESSION.md` - Full audit
2. `.generated/SLO_DASHBOARD_FILE_GOVERNANCE.json` - Authority
3. `slo-dashboard-project-plan.json` - Task list

---

## Phase 3: Telemetry Shaping Integration

### What It Is
Wire telemetry emission into handlers so dashboard operations are tracked and analyzed.

### Tasks (in order)

#### Task 1: Create Shape Contracts (SDP-2) - 30 minutes
**File**: `contracts/detect-slo-breaches.json` & `contracts/shape-budgets.json`

These define what telemetry data handlers will emit.

```bash
# Create contracts directory
mkdir -p contracts

# Contracts needed:
# 1. detect-slo-breaches.json - Shape for breach detection events
# 2. shape-budgets.json - Shape for budget tracking events
```

**Example contract structure** (from parent project):
```json
{
  "domain": "slo-dashboard",
  "feature": "telemetry-shaping",
  "events": [
    {
      "name": "slo_breach_detected",
      "fields": ["sloName", "threshold", "current", "timestamp"],
      "description": "Fired when SLO threshold breached"
    }
  ]
}
```

**Action**: Create realistic shape contracts for:
- `detect-slo-breaches.json`: Events for SLO/SLA breach detection
- `shape-budgets.json`: Events for budget consumption tracking

---

#### Task 2: Create Alignment Script (SDP-1) - 45 minutes
**File**: `scripts/verify-shape-bdd-alignment.js`

This script validates that telemetry emissions match shape contracts.

```bash
# Location
# This goes in parent scripts/ but references slo-dashboard
../../scripts/verify-shape-bdd-alignment.js
```

**Purpose**:
- Parse shape contracts from `packages/slo-dashboard/contracts/*.json`
- Parse handler code to extract telemetry emissions
- Verify all emitted events match contract definitions
- Report misalignments

**Structure**:
```javascript
// Example outline
const path = require('path');

module.exports = async function verifyShapeBddAlignment() {
  // 1. Load shape contracts
  const contracts = loadContracts('./packages/slo-dashboard/contracts/');
  
  // 2. Extract telemetry emissions from handlers
  const emissions = extractEmissions('./packages/slo-dashboard/src/handlers/metrics.ts');
  
  // 3. Validate alignment
  const results = validateAlignment(contracts, emissions);
  
  // 4. Report
  console.log(results.summary);
  return results.success ? 0 : 1;
};
```

**Action**: Create script that validates telemetry matches shape contracts.

---

#### Task 3: Add Telemetry to Handlers (SDP-3, SDP-9) - 1 hour
**File**: `src/handlers/metrics.ts`

Add telemetry emission to each handler:

```typescript
// Current structure (pseudocode)
export async function loadBudgets() {
  // Load logic here
}

// PHASE 3 ADDITION: Add telemetry
export async function loadBudgets() {
  const startTime = Date.now();
  try {
    // Existing logic
    const budgets = await fetchBudgets();
    
    // NEW: Emit telemetry
    emitTelemetry('slo_budgets_loaded', {
      count: budgets.length,
      duration: Date.now() - startTime,
      timestamp: new Date().toISOString()
    });
    
    return budgets;
  } catch (error) {
    emitTelemetry('slo_budgets_load_error', {
      error: error.message,
      duration: Date.now() - startTime
    });
    throw error;
  }
}
```

**Handlers to enhance**:
1. `loadBudgets()` → emit `slo_budgets_loaded`
2. `loadMetrics()` → emit `slo_metrics_loaded`
3. `computeCompliance()` → emit `slo_compliance_computed`, `slo_breach_detected`
4. `triggerExportDownload()` → emit `slo_export_triggered`

**Action**: Add telemetry emission to all 4 core handlers using shape contracts.

---

#### Task 4: Add Telemetry Assertions (SDP-13) - 45 minutes
**Files**: `__tests__/business-bdd-handlers/*.spec.ts`

Update test files to assert telemetry was emitted correctly.

```typescript
// Example test enhancement
describe('Load Budgets Handler', () => {
  it('should load budgets and emit telemetry', async () => {
    const telemetrySpy = jest.spyOn(telemetry, 'emit');
    
    const result = await loadBudgets();
    
    expect(result).toEqual(expectedBudgets);
    
    // NEW: Assert telemetry
    expect(telemetrySpy).toHaveBeenCalledWith('slo_budgets_loaded', {
      count: expectedBudgets.length,
      duration: expect.any(Number),
      timestamp: expect.any(String)
    });
  });
});
```

**Action**: Update 5 test files to assert telemetry emissions.

---

### Phase 3 Verification
```bash
# 1. Run tests
npm test

# 2. Run shape alignment script (when created)
npm run verify:shape-bdd-alignment

# 3. Check handler code has telemetry
grep -n "emitTelemetry" src/handlers/metrics.ts

# 4. Verify contracts present
ls -la contracts/
```

---

## Phase 4: Assertion Enrichment

### What It Is
Make test assertions concrete and comprehensive - verify not just that code runs, but that it works correctly.

### Tasks (in order)

#### Task 1: Implement Concrete Assertions (SDP-4) - 1 hour
**Files**: `__tests__/business-bdd-handlers/*.spec.ts`

Replace stub assertions with real logic verification:

**Before** (current stubs):
```typescript
it('should compute compliance', async () => {
  const result = await computeCompliance();
  expect(result).toBeDefined(); // Too weak!
});
```

**After** (concrete assertions):
```typescript
it('should compute compliance with weighted scoring', async () => {
  const result = await computeCompliance(testBudgets, testMetrics);
  
  expect(result).toHaveProperty('overallCompliance');
  expect(result.overallCompliance).toBeGreaterThanOrEqual(0);
  expect(result.overallCompliance).toBeLessThanOrEqual(100);
  
  expect(result).toHaveProperty('breaches');
  expect(Array.isArray(result.breaches)).toBe(true);
  
  // Verify weighted calculation
  const expectedScore = calculateExpectedCompliance(testMetrics);
  expect(result.overallCompliance).toBeCloseTo(expectedScore, 2);
});
```

**Assertion Areas**:
1. **Weighted Compliance**: Verify scoring algorithm
2. **Sorting**: Verify budgets sorted by risk
3. **Color Tiers**: Verify color assignment based on thresholds
4. **Projection**: Verify breach prediction logic

**Action**: Replace stub assertions with concrete, measurable tests.

---

#### Task 2: Add Export Hashing (SDP-10) - 45 minutes
**File**: `__tests__/business-bdd-handlers/05-trigger-export-download.spec.ts`

Test export artifact hashing and signing:

```typescript
it('should generate hash and signature for export', async () => {
  const reportData = {
    budgets: testBudgets,
    metrics: testMetrics,
    compliance: testCompliance
  };
  
  const result = await triggerExportDownload(reportData);
  
  // Assert hash exists and is valid
  expect(result).toHaveProperty('hash');
  expect(result.hash).toMatch(/^[a-f0-9]{64}$/); // SHA256
  
  // Assert signature exists
  expect(result).toHaveProperty('signature');
  expect(result.signature).toBeTruthy();
  
  // Verify hash matches data
  const recalculatedHash = calculateHash(reportData);
  expect(result.hash).toBe(recalculatedHash);
});
```

**Action**: Implement export hashing and signature verification.

---

#### Task 3: Add Accessibility Labels (SDP-11) - 30 minutes
**File**: `src/types.ts` and `__tests__/business-bdd-handlers/03-compute-compliance.spec.ts`

Define and verify accessibility labels:

```typescript
// In types.ts
export interface ComplianceResult {
  // Existing fields
  overallCompliance: number;
  
  // NEW: Accessibility labels
  accessibilityLabels: {
    'aria-label': string;      // For screen readers
    'data-testid': string;     // For testing
    'role': string;            // ARIA role
    'aria-live': string;       // Updates announced
  };
}

// In test
it('should include accessibility labels', async () => {
  const result = await computeCompliance(testBudgets, testMetrics);
  
  expect(result).toHaveProperty('accessibilityLabels');
  expect(result.accessibilityLabels['aria-label']).toContain('Overall');
  expect(result.accessibilityLabels['role']).toBe('region');
  expect(result.accessibilityLabels['aria-live']).toBe('polite');
});
```

**Action**: Add accessibility metadata and verify in tests.

---

#### Task 4: Tighten TODO Threshold (SDP-12) - 10 minutes
**File**: `package.json`

Update test assertion completeness threshold:

```json
{
  "jest": {
    "coverageThresholds": {
      "global": {
        "statements": 80,
        "branches": 75,
        "functions": 80,
        "lines": 80,
        "assertionCompleteness": {
          "maxTodoRatio": 0.40
        }
      }
    }
  }
}
```

**Action**: Update package.json to enforce 40% max TODO ratio in assertions.

---

### Phase 4 Verification
```bash
# 1. Run all tests with coverage
npm test -- --coverage

# 2. Check TODO ratio
grep -r "TODO\|FIXME\|SKIP" __tests__/business-bdd-handlers/ | wc -l

# 3. Verify accessibility labels
grep -r "accessibilityLabels\|aria-label" src/

# 4. Verify hashing present
grep -r "calculateHash\|hash" __tests__/business-bdd-handlers/05-trigger-export-download.spec.ts
```

---

## Phase 5: Project Plan Enforcement

### What It Is
Create scripts to verify project plan compliance and integrate into build pipeline.

### Task 1: Create Enforcement Script (SDP-5) - 45 minutes
**File**: `scripts/verify-slo-dashboard-project-plan.js`

This script validates:
- All phases have correct status
- Artifacts referenced in plan exist
- No unauthorized files in package root
- Drift config is current

```bash
# Create in parent scripts/
../../scripts/verify-slo-dashboard-project-plan.js
```

**Validation checks**:
1. Phase 1-2 status = "done"
2. Phase 3-4 status = "in-progress" 
3. Phase 5-6 status = "pending"
4. All artifacts exist and are readable
5. Root has only authorized files
6. Specifications locked (checksums match)

---

### Task 2: Add to Knowledge Index (SDP-6) - 15 minutes
**File**: `knowledge-index.json` (in parent project root)

Add slo-dashboard entry:

```json
{
  "projects": [
    {
      "id": "slo-dashboard",
      "name": "@slo-shape/dashboard",
      "path": "packages/slo-dashboard/",
      "authority": "packages/slo-dashboard/slo-dashboard-project-plan.json",
      "contextTree": "packages/slo-dashboard/.generated/CONTEXT_TREE_AUDIT_SESSION.md",
      "phases": 6,
      "completionPercent": 33,
      "lastUpdated": "2025-11-24T22:00:00Z"
    }
  ]
}
```

---

### Task 3: Integrate into Pretest Pipeline (SDP-7) - 15 minutes
**File**: Parent `package.json` scripts

Add pretest checks:

```json
{
  "scripts": {
    "pretest": "npm run verify:shape-bdd-alignment && npm run verify:slo-dashboard-project-plan",
    "verify:shape-bdd-alignment": "node scripts/verify-shape-bdd-alignment.js",
    "verify:slo-dashboard-project-plan": "node scripts/verify-slo-dashboard-project-plan.js"
  }
}
```

---

## Phase 6: End-to-End Compliance Audit

### What It Is
Run final comprehensive audit and generate completion report.

### Task 1: Run Full Audit (SDP-8) - 1 hour
```bash
cd packages/slo-dashboard

# Run everything
npm run build
npm run type-check
npm test -- --coverage
npm run lint

# Run shape alignment
npm run verify:shape-bdd-alignment

# Run project plan verification
npm run verify:slo-dashboard-project-plan

# Generate audit report
npm run audit:full
```

### Audit Report Should Include
- ✅ All 6 phases documented
- ✅ All artifacts present and versioned
- ✅ No root file violations
- ✅ Test coverage >80%
- ✅ Zero TODO ratio violations
- ✅ Telemetry fully integrated
- ✅ Project plan enforced
- ✅ Build passing
- ✅ Types passing
- ✅ Lint passing

---

## File Locations Reference

```
packages/slo-dashboard/
├── .generated/
│   ├── CONTEXT_TREE_AUDIT_SESSION.md         ← READ THIS FIRST
│   ├── SLO_DASHBOARD_FILE_GOVERNANCE.json    ← AUTHORITY
│   ├── slo-dashboard-business-bdd-specifications.json (LOCKED)
│   ├── slo-dashboard-demo-plan.json
│   ├── slo-dashboard-drift-config.json
│   └── AUDIT_COMPLETION_REPORT.md            ← CREATE IN PHASE 6
├── src/
│   ├── handlers/
│   │   └── metrics.ts                        ← ADD TELEMETRY (Phase 3)
│   ├── types.ts                              ← ADD ACCESSIBILITY (Phase 4)
│   └── index.ts
├── __tests__/
│   ├── business-bdd-handlers/
│   │   ├── 01-load-budgets.spec.ts           ← UPDATE (Phase 3, 4)
│   │   ├── 02-load-metrics.spec.ts           ← UPDATE (Phase 3, 4)
│   │   ├── 03-compute-compliance.spec.ts     ← UPDATE (Phase 3, 4)
│   │   ├── 04-serialize-dashboard-state.spec.ts ← UPDATE (Phase 3, 4)
│   │   └── 05-trigger-export-download.spec.ts ← UPDATE (Phase 3, 4)
│   ├── unit/
│   │   └── compliance.spec.ts
│   └── handlers.handlers.spec.ts
├── json-sequences/
│   ├── index.json
│   ├── dashboard.load.json
│   ├── dashboard.refresh.metrics.json
│   └── dashboard.export.report.json
├── contracts/                                 ← CREATE (Phase 3 SDP-2)
│   ├── detect-slo-breaches.json
│   └── shape-budgets.json
├── package.json                              ← UPDATE (Phase 4 SDP-12)
├── tsconfig.json
├── README.md
├── RECOVERY_REPORT.md
└── slo-dashboard-project-plan.json (AUTHORITY)

Parent location for scripts:
../../scripts/
├── verify-shape-bdd-alignment.js             ← CREATE (Phase 3 SDP-1)
└── verify-slo-dashboard-project-plan.js      ← CREATE (Phase 5 SDP-5)
```

---

## Commands Quick Reference

```bash
# Build & Test
npm run build                 # TypeScript + Rollup
npm test                      # All tests
npm test:watch               # Watch mode
npm run lint                  # ESLint
npm run type-check           # Type checking

# Verification (when created)
npm run verify:shape-bdd-alignment
npm run verify:slo-dashboard-project-plan

# Development
npm run dev                   # TypeScript watch
```

---

## Success Criteria Checklist

### Phase 3: Telemetry Integration ✅
- [ ] `contracts/detect-slo-breaches.json` created
- [ ] `contracts/shape-budgets.json` created
- [ ] `scripts/verify-shape-bdd-alignment.js` created
- [ ] `src/handlers/metrics.ts` has telemetry emission
- [ ] All 5 test files have telemetry assertions
- [ ] `npm test` passes
- [ ] `npm run verify:shape-bdd-alignment` passes

### Phase 4: Assertion Enrichment ✅
- [ ] Concrete assertions in 01-05 test files
- [ ] Export hashing implemented and tested
- [ ] Accessibility labels added to types and tests
- [ ] TODO ratio threshold set to 0.40
- [ ] Coverage >80%
- [ ] No lint warnings
- [ ] `npm test` passes all suites

### Phase 5: Project Plan Enforcement ✅
- [ ] `scripts/verify-slo-dashboard-project-plan.js` created
- [ ] Knowledge index updated with slo-dashboard entry
- [ ] Pretest pipeline includes both verification scripts
- [ ] All phases marked complete/in-progress/pending correctly

### Phase 6: Compliance Audit ✅
- [ ] Full audit passes (build, test, lint, type-check)
- [ ] `AUDIT_COMPLETION_REPORT.md` generated
- [ ] All 6 phases documented in audit report
- [ ] Zero governance violations
- [ ] Ready for production use

---

## Troubleshooting

### Tests Fail With Shape Mismatch
→ Check `contracts/` match actual emissions in handlers

### Coverage Below 80%
→ Add tests for uncovered branches in handlers

### TODO Ratio Too High
→ Convert TODO comments to actual test implementations

### Build Fails After Changes
→ Run `npm run type-check` to find type errors
→ Run `npm run lint` to find linting issues

### Root File Violation Detected
→ Move file to correct directory per `SLO_DASHBOARD_FILE_GOVERNANCE.json`
→ Run `npm run verify:root-cleanliness` (when available)

---

## Contact & Questions

**Project Authority**: `slo-dashboard-project-plan.json`  
**Governance**: `SLO_DASHBOARD_FILE_GOVERNANCE.json`  
**Context**: `CONTEXT_TREE_AUDIT_SESSION.md`  
**Recovery Info**: `RECOVERY_REPORT.md`

All questions answer by consulting these documents first.

---

**Generated**: 2025-11-24T22:00:00Z  
**For**: Immediate continuation (next session)  
**Time to Complete**: 4-6 hours for Phase 3-6  
**Status**: ✅ READY TO START

Good luck! 🚀
