# Business BDD Specifications - Location & Status

## For Self-Healing System ✅ (Complete)

### Specifications Files

#### 1. Business-Focused User Story Specs
```
Location: packages/self-healing/.generated/business-bdd-specifications.json
Size: 10.59 KB
Content:
├─ 7 user stories from end-user perspective
├─ 14 realistic business scenarios
├─ 3 personas: DevOps Engineer, Platform Team, Engineering Manager
└─ Format: "As a [persona], I want to [do something] so that [goal]"

Example Story:
{
  "name": "I want to automatically detect anomalies in production",
  "persona": "DevOps Engineer",
  "goal": "so that I can be alerted to issues before they become critical",
  "scenarios": [
    {
      "title": "Detect performance degradation",
      "given": [
        "telemetry shows handler latencies exceeding baseline by 20%",
        "multiple requests affected"
      ],
      "when": ["the anomaly detection sequence analyzes the telemetry"],
      "then": [
        "performance anomalies should be identified",
        "baseline for comparison provided",
        "affected components highlighted"
      ]
    }
  ]
}
```

#### 2. Technical Handler Specs (78 handlers)
```
Location: packages/self-healing/.generated/comprehensive-business-bdd-specifications.json
Size: 1,694 lines
Content:
├─ 78 handlers across 7 sequences
├─ 78 realistic scenarios (one per handler)
├─ Business context & persona for each
└─ Example handler spec:

{
  "name": "parseTelemetryRequested",
  "sequence": "telemetry",
  "businessValue": "Initiate production log analysis",
  "persona": "DevOps Engineer",
  "scenarios": [
    {
      "title": "User requests telemetry parsing to investigate recent outage",
      "given": [
        "production logs are available",
        "user suspects performance issue"
      ],
      "when": [
        "user triggers telemetry parsing"
      ],
      "then": [
        "system should validate request",
        "parsing should begin immediately",
        "user should receive confirmation"
      ]
    }
  ]
}
```

### Generated Test Files (67 Business BDD Tests)

```
Location: packages/self-healing/__tests__/business-bdd-handlers/

Structure:
├─ Telemetry Sequence (7 tests)
│  ├─ 1-parse-telemetry-requested.spec.ts
│  ├─ 2-load-log-files.spec.ts
│  ├─ 3-extract-telemetry-events.spec.ts
│  ├─ 4-normalize-telemetry-data.spec.ts
│  ├─ 5-aggregate-telemetry-metrics.spec.ts
│  ├─ 6-store-telemetry-database.spec.ts
│  └─ 7-parse-telemetry-completed.spec.ts
│
├─ Anomaly Detection (9 tests)
│  ├─ 8-detect-anomalies-requested.spec.ts
│  ├─ 9-load-telemetry-data.spec.ts
│  ├─ 10-detect-performance-anomalies.spec.ts
│  ├─ 11-detect-behavioral-anomalies.spec.ts
│  ├─ 12-detect-coverage-gaps.spec.ts
│  ├─ 13-detect-error-patterns.spec.ts
│  ├─ 14-aggregate-anomaly-results.spec.ts
│  ├─ 15-store-anomaly-results.spec.ts
│  └─ 16-detect-anomalies-completed.spec.ts
│
├─ Diagnosis (11 tests)
│  ├─ 17-analyze-requested.spec.ts
│  ├─ 18-load-anomalies.spec.ts
│  ├─ 19-load-codebase-info.spec.ts
│  ├─ 20-analyze-performance-issues.spec.ts
│  ├─ 21-analyze-behavioral-issues.spec.ts
│  ├─ 22-analyze-coverage-issues.spec.ts
│  ├─ 23-analyze-error-issues.spec.ts
│  ├─ 24-aggregate-diagnosis.spec.ts
│  ├─ 25-store-diagnosis.spec.ts
│  ├─ 26-generate-fix-recommendations.spec.ts
│  └─ 27-analyze-completed.spec.ts
│
├─ Fix Generation (9 tests)
├─ Validation (10 tests)
├─ Deployment (11 tests)
└─ Learning (10 tests)

Total: 67 business BDD test files
Each auto-generated from corresponding spec
Each tests the business scenario in Given-When-Then format
```

### Documentation About BDD Specs

```
Location: packages/self-healing/.generated/

Key Files:
├─ BUSINESS_BDD_HANDLERS_LOCATION.md (227 lines)
│  └─ Exact file list for all 67 handlers
│
├─ BUSINESS_BDD_HANDLERS_GUIDE.md
│  └─ How to find and use the BDD specs
│
├─ HANDLER_IMPLEMENTATION_WORKFLOW.md (500+ lines)
│  └─ Step-by-step: Read spec → Write business test → TDD
│
├─ COMPLETE_BDD_FRAMEWORK_SUMMARY.md
│  └─ Overview of entire BDD specification framework
│
└─ DELIVERABLES_SUMMARY.md
   └─ What was created and why
```

---

## For SLO Dashboard (Phase 6) ❌ (NOT YET CREATED)

### What Exists
```
✅ Code Implementation: 1,500+ lines
   ├─ 6 React components
   ├─ 3 custom hooks
   ├─ 4 service classes
   └─ 50+ TypeScript interfaces

✅ Demo: Working with real data
   └─ Shows all features functioning

✅ Documentation: 1,000+ lines
   ├─ README.md
   ├─ PHASE_6_DASHBOARD_COMPLETION_REPORT.md
   ├─ PHASE_6_DASHBOARD_QUICK_REFERENCE.md
   └─ DASHBOARD_UX_AND_GOVERNANCE.md
```

### What's Missing (To Match Self-Healing Pattern)

#### 1. Business BDD Specification JSON (MISSING)
```
Should be at: packages/slo-dashboard/.generated/
              dashboard-business-bdd-specifications.json

Would contain:
├─ 5 features (Metrics, Budget, Compliance, Health, Activity)
├─ Business scenarios for each feature
├─ Personas: DevOps Engineer, Platform Team, SRE
└─ Example structure:

{
  "version": "1.0.0",
  "type": "Business BDD Specifications",
  "component": "SLODashboard",
  "timestamp": "2025-11-23",
  "summary": {
    "totalFeatures": 5,
    "totalScenarios": 15,
    "personas": ["DevOps Engineer", "Platform Team", "SRE"]
  },
  "features": [
    {
      "name": "Display Real-Time Metrics",
      "businessValue": "Provide visibility into current SLI status",
      "persona": "DevOps Engineer",
      "scenarios": [
        {
          "title": "DevOps views component health and availability",
          "given": ["SLI metrics data available from Phase 2"],
          "when": ["dashboard loads MetricsPanel"],
          "then": [
            "component health scores displayed (0-100 scale)",
            "availability percentages shown",
            "P95/P99 latencies visible",
            "error rates displayed",
            "data auto-refreshes every 30 seconds"
          ]
        },
        // ... more scenarios
      ]
    },
    {
      "name": "Track Error Budget Consumption",
      "businessValue": "Monitor monthly failure budget usage",
      "scenarios": [...]
    },
    {
      "name": "Monitor SLA Compliance",
      "businessValue": "Know when SLA targets are at risk",
      "scenarios": [...]
    },
    {
      "name": "View Component Health",
      "businessValue": "Understand overall system health at a glance",
      "scenarios": [...]
    },
    {
      "name": "Track Self-Healing Activity",
      "businessValue": "See what automated fixes were deployed",
      "scenarios": [...]
    }
  ]
}
```

#### 2. Generated Business BDD Tests (MISSING)
```
Should be at: packages/slo-dashboard/__tests__/business-bdd/

Would contain:
├─ metrics-panel.spec.tsx
├─ budget-burndown.spec.tsx
├─ compliance-tracker.spec.tsx
├─ health-scores.spec.tsx
└─ self-healing-activity.spec.tsx

Example test:
describe('MetricsPanel - Business BDD', () => {
  it('displays component health, availability, latency, error rate', async () => {
    // GIVEN: SLI metrics data available
    const metricsData = {
      componentMetrics: {
        'canvas-component': {
          healthScore: 49.3,
          availability: { current_percent: 99.712 },
          latency: { p95_ms: 71.85, p99_ms: 215 },
          errorRate: { current_percent: 1.0 }
        }
      }
    };
    
    // WHEN: dashboard loads MetricsPanel
    const { getByText } = render(
      <MetricsPanel data={metricsData} />
    );
    
    // THEN: all metrics displayed
    expect(getByText(/49\.3/)).toBeInTheDocument(); // health
    expect(getByText(/99\.712/)).toBeInTheDocument(); // availability
    expect(getByText(/71\.85ms/)).toBeInTheDocument(); // latency
    expect(getByText(/1\.0%/)).toBeInTheDocument(); // error rate
  });
});
```

#### 3. Traceability Integration (MISSING)
```
Would track:
├─ Blueprint → Specs generation
├─ Specs → Tests generation
├─ Tests → Implementation verification
└─ Implementation → Deployment

Would verify:
✓ Specs match blueprint
✓ Tests match specs
✓ Implementation passes tests
✓ No manual drift detected
```

---

## Generation Scripts Used (For Self-Healing)

These can be adapted for the dashboard:

### 1. Generate Business BDD Specs
```javascript
// Location: scripts/generate-business-bdd-specs.js
// 
// Usage: npm run generate:business-bdd-specs
// 
// What it does:
// ├─ Reads handler blueprints
// ├─ Generates business user stories
// ├─ Creates comprehensive spec JSON
// └─ Outputs to .generated/ directory

// For Dashboard: 
// Adapt to read dashboard features from blueprint
// Generate dashboard-business-bdd-specifications.json
```

### 2. Generate Business BDD Tests from Specs
```javascript
// Location: scripts/generate-test-files.js (inferred)
// 
// Usage: npm run generate:business-bdd-tests
// 
// What it does:
// ├─ Reads comprehensive-business-bdd-specifications.json
// ├─ Generates test file for each handler
// ├─ Creates Given-When-Then test structure
// └─ Outputs to __tests__/business-bdd-handlers/

// For Dashboard:
// Adapt to read dashboard-business-bdd-specifications.json
// Generate dashboard tests from specs
// Ensure tests are linked to React component behavior
```

### 3. Verify No Drift
```javascript
// Location: scripts/verify-no-drift.js
// 
// Usage: npm run verify:no-drift
// 
// What it does:
// ├─ Computes checksums of specs
// ├─ Verifies tests are auto-generated
// ├─ Checks implementation matches tests
// └─ Reports any drift detected

// For Dashboard:
// Extend to track dashboard-business-bdd-specifications.json
// Verify dashboard tests are auto-generated
// Check implementations conform to specs
```

---

## Comparison: Self-Healing vs. Dashboard

| Aspect | Self-Healing | Dashboard |
|--------|---|---|
| **Business Specs** | ✅ comprehensive-business-bdd-specifications.json | ❌ Missing |
| **Business BDD Tests** | ✅ 67 auto-generated test files | ❌ Missing |
| **BDD Workflow Docs** | ✅ HANDLER_IMPLEMENTATION_WORKFLOW.md | ❌ Missing |
| **Traceability Specs** | ✅ Included in spec JSON | ❌ Missing |
| **Drift Detection** | ✅ verify:no-drift script | ❌ Missing |
| **Implementation** | ✅ 67 handlers implemented | ✅ 6 components implemented |
| **Unit Tests** | ⏳ Stubs generated | ⏳ Pending |
| **Code Review** | ✅ Process defined | ⏳ Pending |

---

## How to Create Dashboard BDD Specs (Template)

### Step 1: Create Dashboard Feature Blueprint

```json
{
  "dashboard": {
    "features": [
      {
        "name": "MetricsPanel",
        "businessValue": "Display real-time SLI metrics",
        "scenarios": [
          "DevOps views component health",
          "DevOps sees availability percentage",
          "DevOps sees latency metrics",
          "DevOps sees error rates"
        ]
      },
      {
        "name": "BudgetBurndown",
        "businessValue": "Track monthly error budget consumption",
        "scenarios": [
          "See budget consumption percentage",
          "See burndown projection",
          "Get warning if budget low",
          "Export budget data"
        ]
      },
      {
        "name": "ComplianceTracker",
        "businessValue": "Monitor SLA compliance status",
        "scenarios": [
          "See compliance status per component",
          "See which components breach",
          "Get alerts for breaches",
          "View compliance trend"
        ]
      },
      {
        "name": "HealthScores",
        "businessValue": "Understand overall system health",
        "scenarios": [
          "See system health gauge (0-100)",
          "See health per component",
          "See health history",
          "Understand health scoring"
        ]
      },
      {
        "name": "SelfHealingActivity",
        "businessValue": "Know what automated fixes were deployed",
        "scenarios": [
          "See recent fix deployments",
          "See fix status (deployed/failed/reverted)",
          "See fix timeline",
          "See effectiveness of fixes"
        ]
      }
    ]
  }
}
```

### Step 2: Use Generation Script (to be created)

```bash
npm run generate:dashboard-specs

Output:
packages/slo-dashboard/.generated/
  dashboard-business-bdd-specifications.json
```

### Step 3: Generate Tests from Specs

```bash
npm run generate:dashboard-tests

Output:
packages/slo-dashboard/__tests__/business-bdd/
  metrics-panel.spec.tsx
  budget-burndown.spec.tsx
  compliance-tracker.spec.tsx
  health-scores.spec.tsx
  self-healing-activity.spec.tsx
```

### Step 4: Verify No Drift

```bash
npm run verify:no-drift

Output:
✅ NO DRIFT DETECTED
✅ Dashboard specs match implementation
✅ Tests are auto-generated
✅ Ready for deployment
```

---

## Key Files to Review

### For Understanding Self-Healing Pattern:
1. `packages/self-healing/.generated/comprehensive-business-bdd-specifications.json` (1,694 lines)
2. `packages/self-healing/.generated/BUSINESS_BDD_HANDLERS_LOCATION.md` (227 lines)
3. `packages/self-healing/.generated/HANDLER_IMPLEMENTATION_WORKFLOW.md` (500+ lines)
4. `packages/self-healing/__tests__/business-bdd-handlers/` (67 test files)

### For Understanding Traceability System:
1. `DEVELOPMENT_PIPELINE_TRACEABILITY.md` (This system explained)
2. `TRACEABILITY_WORKFLOW_GUIDE.md` (How to use it)
3. `scripts/verify-no-drift.js` (Implementation)

---

## Recommendation

To achieve full governance compliance for Phase 6 Dashboard:

1. ✅ **Existing**: Code implementation complete
2. ✅ **Existing**: Demo working with real data
3. ⏳ **Pending** (2-3 hours): Create dashboard-business-bdd-specifications.json
4. ⏳ **Pending** (1 hour): Adapt generation scripts for dashboard
5. ⏳ **Pending** (1 hour): Generate business BDD tests
6. ⏳ **Pending** (2-3 hours): Implement unit tests
7. ⏳ **Pending** (1-2 hours): Code review & merge
8. ⏳ **Pending** (1 hour): Set up traceability verification

**Total Time**: 8-12 hours to full governance compliance with self-healing pattern

This ensures the dashboard follows the same proven delivery pipeline that prevents drift and enables confident deployment.
