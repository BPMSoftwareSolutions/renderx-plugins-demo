# 🔗 BDD Specification Files - Quick Reference

## Self-Healing System (Complete Pattern) ✅

### Master Specification File
**Location**: `packages/self-healing/.generated/comprehensive-business-bdd-specifications.json`

**Purpose**: Single source of truth for all handler requirements

**What it contains**:
- 78 handler definitions
- For each handler:
  - Handler name
  - Sequence (telemetry, anomaly, diagnosis, fix, validation, deployment, learning)
  - Business value statement
  - Persona (who uses this)
  - Realistic scenarios in Given-When-Then format

**Size**: 1,694 lines | **Format**: JSON

**How it's used**:
```
Read by: Generation scripts
    ↓
Generate: Business BDD test files (67 tests)
Generate: Unit test stubs
    ↓
Used by: Developers during implementation
    ↓
Verified by: Traceability system (checksum validation)
```

**Key guarantee**: 
- Never edited manually (is JSON, not code)
- Auto-regenerated if blueprint changes
- Checksum tracked to detect modifications
- All tests/implementation must conform to it

---

### Generated Business BDD Test Files
**Location**: `packages/self-healing/__tests__/business-bdd-handlers/`

**Structure**: 67 test files
- `1-parse-telemetry-requested.spec.ts`
- `2-load-log-files.spec.ts`
- ... (all 7 sequences, 78 total handlers)
- `67-learning-completed.spec.ts`

**How they're generated**:
```
comprehensive-business-bdd-specifications.json
    ↓ (generate-business-bdd-tests script)
Each scenario becomes a test case in Given-When-Then format
    ↓
Test file created for each handler
    ↓
Checksum recorded (to detect manual edits)
```

**Test pattern**:
```typescript
describe('parseTeelemetryRequested - Business BDD', () => {
  it('should validate request, begin parsing, confirm user', async () => {
    // GIVEN: production logs are available, user suspects issue
    const logs = setupProductionLogs();
    
    // WHEN: user triggers telemetry parsing
    const result = await parseTelemetryRequested(logs);
    
    // THEN: system validates request, parsing begins, user confirmed
    expect(result.validated).toBe(true);
    expect(result.parsingStarted).toBe(true);
    expect(result.confirmation).toBeDefined();
  });
});
```

**Guarantees**:
- Generated from spec (cannot drift from requirements)
- Auto-regenerated if spec changes
- Each test validates a business scenario
- Tests are not manually edited

---

### Documentation Files (In `.generated/` directory)

| File | Purpose | Lines |
|---|---|---|
| `BUSINESS_BDD_HANDLERS_LOCATION.md` | Lists all 67 handler tests | 227 |
| `BUSINESS_BDD_HANDLERS_GUIDE.md` | How to find and use the specs | ? |
| `HANDLER_IMPLEMENTATION_WORKFLOW.md` | Step-by-step implementation guide | 500+ |
| `COMPLETE_BDD_FRAMEWORK_SUMMARY.md` | Overview of entire framework | ? |
| `DELIVERABLES_SUMMARY.md` | What was created and why | ? |

---

## The Generation Pipeline (How It Works)

```
INPUT: Handler Blueprint (in SHAPE_EVOLUTION_PLAN.json)
│
├─ name: "parseTelemetryRequested"
├─ sequence: "telemetry"
├─ businessValue: "Initiate production log analysis"
└─ slug: "parse-telemetry-requested"

    ↓ (generate-business-bdd-specs.js)

OUTPUT 1: comprehensive-business-bdd-specifications.json
├─ Handler name ✓
├─ Business value ✓
├─ Persona ✓
├─ Scenarios with Given-When-Then ✓
└─ Checksum for integrity ✓

    ↓ (generate-business-bdd-tests.js)

OUTPUT 2: __tests__/business-bdd-handlers/
├─ 1-parse-telemetry-requested.spec.ts
├─ Test cases from scenarios ✓
├─ Given-When-Then structure ✓
└─ Checksum recorded ✓

    ↓ (Developer implements)

IMPLEMENTATION: src/handlers/telemetry/parse.requested.ts
├─ Must pass all business BDD tests
├─ Must pass unit tests
└─ Changes committed

    ↓ (verify-no-drift.js)

VERIFICATION:
├─ ✓ Spec unchanged
├─ ✓ Tests auto-generated (not manually edited)
├─ ✓ Implementation passes tests
└─ ✓ Complete lineage chain intact
```

---

## Key Commands

### Generate Specifications
```bash
npm run generate:business-bdd-specs

# Creates: packages/self-healing/.generated/
#          comprehensive-business-bdd-specifications.json
```

### Generate Tests from Specs
```bash
npm run generate:business-bdd-tests

# Creates: packages/self-healing/__tests__/business-bdd-handlers/
#          All 67 test files
```

### Run Business BDD Tests
```bash
npm test -- __tests__/business-bdd-handlers/

# Verifies: Business scenarios pass
# Checks: User experience is correct
# Output: ✓ 78 tests pass (or ✗ failures)
```

### Verify No Drift
```bash
npm run verify:no-drift

# Checks:
# ├─ Spec checksums unchanged
# ├─ Tests are auto-generated
# ├─ No manual edits detected
# └─ Lineage chain intact

# Output: ✅ NO DRIFT DETECTED (or issues found)
```

---

## For SLO Dashboard - What Needs Creating

### 1. Dashboard Feature Blueprint
```
Should be in: SHAPE_EVOLUTION_PLAN.json or new file
Example:
{
  "dashboard": {
    "features": [
      {
        "name": "MetricsPanel",
        "businessValue": "Display real-time SLI metrics",
        "scenarios": ["Display health", "Display availability", ...]
      },
      {
        "name": "BudgetBurndown",
        "businessValue": "Track error budget consumption",
        "scenarios": ["Show consumption %", "Show projection", ...]
      },
      // ... more features
    ]
  }
}
```

### 2. Generate Dashboard Business Specs
```
To create: npm run generate:dashboard-specs

Would produce: packages/slo-dashboard/.generated/
               dashboard-business-bdd-specifications.json

Example content:
{
  "version": "1.0.0",
  "component": "SLODashboard",
  "timestamp": "2025-11-23",
  "summary": {
    "totalFeatures": 5,
    "totalScenarios": 15,
    "personas": ["DevOps Engineer", "Platform Team", "SRE"]
  },
  "features": [
    {
      "name": "MetricsPanel",
      "businessValue": "Display real-time SLI metrics",
      "scenarios": [
        {
          "title": "DevOps views component health and metrics",
          "given": ["SLI metrics data available"],
          "when": ["dashboard loads MetricsPanel"],
          "then": ["health scores displayed", "availability shown", ...]
        }
      ]
    }
    // ... more features
  ]
}
```

### 3. Generate Dashboard Business BDD Tests
```
To create: npm run generate:dashboard-tests

Would produce: packages/slo-dashboard/__tests__/business-bdd/
├─ metrics-panel.spec.tsx
├─ budget-burndown.spec.tsx
├─ compliance-tracker.spec.tsx
├─ health-scores.spec.tsx
└─ self-healing-activity.spec.tsx

Example test file content:
describe('MetricsPanel - Business BDD', () => {
  it('displays real-time SLI metrics', () => {
    // GIVEN: SLI metrics data available
    const data = loadMetricsData();
    
    // WHEN: MetricsPanel component renders
    render(<MetricsPanel data={data} />);
    
    // THEN: health scores, availability, latency, error rates shown
    expect(screen.getByText(/Health:/)).toBeInTheDocument();
    expect(screen.getByText(/99\.7/)).toBeInTheDocument(); // availability
    expect(screen.getByText(/71\.85ms/)).toBeInTheDocument(); // latency
  });
});
```

---

## Why This Matters for Governance

### Without BDD Specs:
```
Requirements (unclear)
    ↓
Implementation (assumed)
    ↓
Tests (after-thought)
    ↓
Result: Mismatch, drift, confusion
```

### With BDD Specs (Current Pattern):
```
Business Requirements (clear, JSON)
    ↓
Auto-Generated Tests (from specs)
    ↓
Implementation (driven by tests)
    ↓
Drift Detection (automatic)
    ↓
Result: Aligned, auditable, confident
```

---

## Quick Links

### For Self-Healing Reference:
- Main specs: `packages/self-healing/.generated/comprehensive-business-bdd-specifications.json`
- Business tests: `packages/self-healing/__tests__/business-bdd-handlers/`
- Location guide: `packages/self-healing/.generated/BUSINESS_BDD_HANDLERS_LOCATION.md`
- Workflow: `packages/self-healing/.generated/HANDLER_IMPLEMENTATION_WORKFLOW.md`

### For Understanding the System:
- Development pipeline: `DEVELOPMENT_PIPELINE_TRACEABILITY.md` (NEW!)
- Business specs location: `BUSINESS_BDD_SPECS_LOCATION.md` (NEW!)
- Traceability workflow: `TRACEABILITY_WORKFLOW_GUIDE.md`

### For Dashboard (Next Steps):
- Governance compliance: `GOVERNANCE_COMPLIANCE_PHASE_6.md`
- UX & governance: `DASHBOARD_UX_AND_GOVERNANCE.md`
- Demo guide: `DASHBOARD_DEMO_GUIDE.md`

---

## Summary

| Item | Location | Status |
|---|---|---|
| **Self-Healing Specs** | `.generated/comprehensive-business-bdd-specifications.json` | ✅ 1,694 lines |
| **Self-Healing Tests** | `__tests__/business-bdd-handlers/` | ✅ 67 files |
| **Dashboard Specs** | Not yet created | ❌ Need to create |
| **Dashboard Tests** | Not yet created | ❌ Need to generate |
| **Drift Verification** | Dashboard | ⏳ Pending setup |

To match self-healing's governance level, dashboard needs:
1. Create feature blueprint (2 hours)
2. Create generation scripts (2 hours)
3. Generate specs JSON (30 minutes)
4. Generate BDD tests (30 minutes)
5. Write unit tests (3 hours)
6. Setup traceability verification (1 hour)

**Total**: 8-9 hours to full governance compliance
