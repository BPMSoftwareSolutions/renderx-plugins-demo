# 🔄 PIPELINE COMPLIANCE RECOVERY PROCESS

## Overview

This guide helps teams move from **non-compliant features** (like the dashboard) to **fully compliant features** that follow the complete delivery pipeline.

The recovery process is designed to:
- ✅ Be automated where possible (no manual rework)
- ✅ Preserve existing implementation (don't lose work)
- ✅ Create audit trail of the recovery (traceability)
- ✅ Prevent regression (enforcement blocks non-compliance)
- ✅ Guide teams through each step

---

## The Challenge: Non-Compliant Features

### What "Non-Compliant" Means

A feature is **non-compliant** if it's missing any layer:

```
✅ Business BDD Specifications
❌ Auto-Generated BDD Tests
✅ Unit Tests
✅ Implementation Code
❌ Drift Detection
```

**Example**: Dashboard (SLO Phase 6)
- ✅ Implementation complete (6 components, 3 hooks, 4 services)
- ✅ Unit tests written
- ❌ Business BDD specifications never created
- ❌ Generated BDD tests don't exist
- ❌ Drift detection not configured

### Impact of Non-Compliance

| Risk | Impact | Example |
|---|---|---|
| Requirements drift | Code diverges from business needs | Dashboard shows different metrics than specified |
| Test regeneration impossible | Can't auto-update tests when specs change | Manual test maintenance burden |
| Audit trail incomplete | Can't trace decisions backward | "Why was this feature built this way?" |
| Governance failure | Violates delivery pipeline requirements | Can't deploy to production without compliance |
| New agent confusion | Unclear why some features have specs, others don't | Inconsistent expectations |

---

## Recovery Strategy

### Phase 1: Assess Current State (30 minutes)

**Goal**: Understand what exists and what's missing

#### Step 1A: Inventory Implementation

```bash
# Check what implementation exists
ls -la packages/my-feature/src/

# Expected:
# ├─ components/      (React components)
# ├─ hooks/           (Custom hooks)
# ├─ services/        (Business logic)
# ├─ types/           (TypeScript interfaces)
# └─ styles/          (CSS/styling)
```

**Checklist**:
- [ ] Components identified
- [ ] Hooks identified
- [ ] Services identified
- [ ] Types documented
- [ ] Implementation is working/tested

#### Step 1B: Inventory Existing Tests

```bash
# Check what tests exist
ls -la packages/my-feature/__tests__/

# Expected:
# ├─ unit/            (Unit tests - EXISTS)
# └─ business-bdd/    (BDD tests - MISSING)
```

**Checklist**:
- [ ] Unit tests exist
- [ ] Unit test coverage assessed (target: 80%+)
- [ ] Unit tests passing
- [ ] BDD tests missing (this is ok, we'll create them)

#### Step 1C: Check for Specifications

```bash
# Look for existing specifications
find packages/my-feature -name "*specification*" -o -name "*spec*.json"

# Expected: NONE (or incomplete)
# We'll create them from scratch
```

**Checklist**:
- [ ] No business BDD specifications exist
- [ ] Or specs exist but are incomplete/informal

---

### Phase 2: Reverse-Engineer Specifications (2-3 hours)

**Goal**: Extract requirements from existing code and create Business BDD Specifications

This is the most important phase - creating the immutable source of truth.

#### Step 2A: Gather Requirements from Stakeholders

**Interview key people**:
- Product Manager (what's the business value?)
- Original developers (what was the intent?)
- Users (how do they use it?)

**Questions to ask**:
```
1. What problem does this feature solve?
2. Who uses it?
3. What are the main scenarios/use cases?
4. What should happen in each scenario?
5. What are success criteria?
6. What should NOT happen?
```

**Document**:
```
Feature: SLO Dashboard
Purpose: Display SLI/SLO metrics and health status
Users: DevOps engineers, SREs, platform teams
Main scenarios:
  1. View real-time metrics
  2. Track error budget consumption
  3. Monitor compliance status
  4. See self-healing activity
```

#### Step 2B: Analyze Existing Code to Understand Intent

```typescript
// Example: Look at component structure
// packages/my-feature/src/components/Dashboard.tsx

export const Dashboard = ({ data, onRefresh }) => {
  // What does this component do?
  // What scenarios does it handle?
  // What user needs does it satisfy?
  
  return (
    <>
      <MetricsPanel metrics={data.metrics} />
      <BudgetBurndown budget={data.budget} />
      <HealthScores health={data.health} />
    </>
  );
};

// This tells us:
// • Component displays metrics (scenario: view real-time metrics)
// • Component shows budget (scenario: track error budget)
// • Component shows health (scenario: monitor health)
```

**Extract from code**:
- [ ] Main features/components identified
- [ ] User personas determined
- [ ] Use cases documented
- [ ] Success criteria noted

#### Step 2C: Create Business BDD Specifications

**Create the specifications file**:

```bash
# Create directory
mkdir -p packages/my-feature/.generated

# Create specification file
cat > packages/my-feature/.generated/my-feature-business-bdd-specifications.json << 'EOF'
{
  "version": "1.0.0",
  "type": "Business BDD Specifications",
  "feature": "my-feature",
  "timestamp": "2025-11-23T10:00:00.000Z",
  "source": "Reverse-engineered from existing implementation",
  "recovery": true,
  "immutable": true,
  "locked": true,
  "metadata": {
    "description": "SLO Dashboard displays SLI/SLO metrics and health status",
    "businessValue": "Enables DevOps teams to monitor system reliability and error budgets",
    "personas": ["DevOps Engineer", "SRE", "Platform Team Lead"],
    "notes": "Specifications recovered from existing implementation. Future changes require spec-first approach.",
    "changeControl": "All changes must start with spec update"
  },
  "scenarios": [
    {
      "id": "my-feature-scenario-1",
      "title": "DevOps engineer views real-time SLI metrics",
      "persona": "DevOps Engineer",
      "given": "SLI metrics data is available from Prometheus",
      "when": "engineer opens the SLO Dashboard",
      "then": "dashboard displays current availability, latency, and error rate with color-coded health status"
    },
    {
      "id": "my-feature-scenario-2",
      "title": "Engineer tracks error budget consumption",
      "persona": "DevOps Engineer",
      "given": "error budget targets are defined for the service",
      "when": "engineer views the Budget Burndown component",
      "then": "dashboard shows percentage consumed, days remaining, and trend graph"
    },
    {
      "id": "my-feature-scenario-3",
      "title": "SRE monitors compliance status",
      "persona": "SRE",
      "given": "compliance checks are running against SLO targets",
      "when": "SRE opens the Compliance Tracker",
      "then": "dashboard displays compliance score, violations, and remediation status"
    }
  ],
  "checksum": "will-be-computed-on-first-verify",
  "recoveryNotes": "Created by recovery process from existing implementation"
}
EOF
```

**Checklist**:
- [ ] Specifications file created in `.generated/` directory
- [ ] 3-5 main business scenarios documented
- [ ] Personas identified
- [ ] Business value explained
- [ ] File marked as locked and immutable

---

### Phase 3: Generate BDD Tests from Specifications (1-2 hours)

**Goal**: Auto-generate BDD tests to align with specs

#### Step 3A: Run BDD Test Generator

```bash
# If generator exists, use it:
npm run generate:my-feature:bdd-tests

# If generator doesn't exist, create template:
mkdir -p packages/my-feature/__tests__/business-bdd
```

#### Step 3B: Create BDD Test Files

**Create test file from specifications**:

```typescript
// File: packages/my-feature/__tests__/business-bdd/my-feature-bdd.spec.ts
/**
 * ============================================================================
 * my-feature - Business BDD Tests
 * ============================================================================
 * 
 * AUTO-GENERATED FROM: my-feature-business-bdd-specifications.json
 * DO NOT EDIT THIS FILE MANUALLY
 * 
 * Specifications state business requirements.
 * These tests verify those requirements are met.
 * ============================================================================
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Dashboard } from '../src/components/Dashboard';

describe('SLO Dashboard - Business BDD Scenarios', () => {
  // Scenario 1: View real-time metrics
  it('should display real-time SLI metrics with health status', async () => {
    // GIVEN: SLI metrics data is available
    const mockData = {
      metrics: {
        availability: 99.7,
        latency: 71.85,
        errorRate: 0.01
      },
      health: 'healthy'
    };

    // WHEN: engineer opens the SLO Dashboard
    render(<Dashboard data={mockData} />);

    // THEN: dashboard displays metrics with color-coded health status
    expect(screen.getByText(/99\.7/)).toBeInTheDocument(); // availability
    expect(screen.getByText(/71\.85/)).toBeInTheDocument(); // latency
    expect(screen.getByText(/healthy/i)).toBeInTheDocument(); // health status
  });

  // Scenario 2: Track error budget
  it('should display error budget consumption and trend', async () => {
    // GIVEN: error budget targets are defined
    const mockData = {
      budget: {
        target: 0.1,
        consumed: 0.035,
        remaining: 0.065,
        percentUsed: 35
      }
    };

    // WHEN: engineer views Budget Burndown
    render(<Dashboard data={mockData} />);

    // THEN: dashboard shows consumption percentage and trend
    expect(screen.getByText(/35%/)).toBeInTheDocument(); // percentage
    expect(screen.getByText(/days remaining/i)).toBeInTheDocument(); // trend info
  });

  // Scenario 3: Monitor compliance status
  it('should display compliance score and violations', async () => {
    // GIVEN: compliance checks are running
    const mockData = {
      compliance: {
        score: 98.5,
        violations: 0,
        remediations: 0
      }
    };

    // WHEN: SRE opens Compliance Tracker
    render(<Dashboard data={mockData} />);

    // THEN: dashboard shows compliance metrics
    expect(screen.getByText(/98\.5/)).toBeInTheDocument(); // score
    expect(screen.getByText(/0 violations/i)).toBeInTheDocument(); // violations
  });
});
```

**Checklist**:
- [ ] BDD test file created
- [ ] One test per scenario from specifications
- [ ] Tests use Given-When-Then structure
- [ ] Tests are business-focused (not implementation details)
- [ ] File marked as auto-generated

---

### Phase 4: Verify Tests Against Implementation (1-2 hours)

**Goal**: Ensure BDD tests pass with existing implementation

#### Step 4A: Run BDD Tests

```bash
# Run the newly generated BDD tests
npm test -- __tests__/business-bdd/my-feature-bdd.spec.ts

# Expected result: Some tests may fail (that's ok)
# We'll fix them in the next steps
```

#### Step 4B: Fix Implementation to Pass BDD Tests

If BDD tests fail:

```bash
# Analyze failures
npm test -- __tests__/business-bdd/my-feature-bdd.spec.ts --reporter=verbose

# Fix implementation to satisfy business scenarios
# (Minimal changes - preserve existing functionality)

# Re-run tests
npm test -- __tests__/business-bdd/my-feature-bdd.spec.ts
```

**Checklist**:
- [ ] All BDD tests running
- [ ] All BDD tests passing
- [ ] No changes break existing functionality
- [ ] Unit tests still passing

---

### Phase 5: Setup Drift Detection (30 minutes)

**Goal**: Configure automatic drift verification

#### Step 5A: Compute Initial Checksums

```bash
# Run drift verification script
npm run verify:no-drift

# This will:
# • Compute checksums for specification files
# • Embed checksums in reports
# • Create baseline for drift detection
```

#### Step 5B: Record Baseline

```bash
# Create record of compliant state
cat > packages/my-feature/.generated/COMPLIANCE_RECOVERY_RECORD.json << 'EOF'
{
  "recoveryDate": "2025-11-23",
  "status": "recovered",
  "specifications": {
    "file": "my-feature-business-bdd-specifications.json",
    "checksum": "sha256:...",
    "scenarios": 3,
    "locked": true
  },
  "tests": {
    "bdd": {
      "file": "__tests__/business-bdd/my-feature-bdd.spec.ts",
      "count": 3,
      "passing": true
    },
    "unit": {
      "directory": "__tests__/unit/",
      "count": 12,
      "coverage": "82%"
    }
  },
  "implementation": {
    "components": 6,
    "hooks": 3,
    "services": 4,
    "passing": true
  },
  "driftDetection": {
    "configured": true,
    "nextVerification": "2025-11-24"
  }
}
EOF
```

**Checklist**:
- [ ] Checksums computed and embedded
- [ ] Baseline recorded
- [ ] Drift detection configured
- [ ] Recovery verified

---

### Phase 6: Document Recovery (1 hour)

**Goal**: Create audit trail and guidance for future

#### Step 6A: Create Recovery Report

```bash
cat > packages/my-feature/RECOVERY_REPORT.md << 'EOF'
# Recovery Report: my-feature

## Timeline
- **Start Date**: 2025-11-23
- **Recovery Status**: ✅ COMPLETE
- **Compliance Status**: ✅ COMPLIANT

## What Was Recovered

### Specifications
- **File**: `.generated/my-feature-business-bdd-specifications.json`
- **Scenarios**: 3 main business use cases
- **Status**: Locked and immutable
- **Method**: Reverse-engineered from implementation

### Tests
- **BDD Tests**: Auto-generated from specifications
- **Unit Tests**: Already existed (enhanced)
- **Coverage**: 82%
- **Status**: All passing

### Implementation
- **Components**: 6 React components
- **Hooks**: 3 custom hooks
- **Services**: 4 business logic services
- **Status**: No changes needed

## How to Use Going Forward

### Making Changes

1. **Update Specification First**
   ```bash
   vim packages/my-feature/.generated/my-feature-business-bdd-specifications.json
   ```

2. **Regenerate BDD Tests**
   ```bash
   npm run generate:my-feature:bdd-tests
   ```

3. **Update Unit Tests** (as needed)
   ```bash
   vim packages/my-feature/__tests__/unit/...
   ```

4. **Update Implementation**
   ```bash
   vim packages/my-feature/src/...
   ```

5. **Verify No Drift**
   ```bash
   npm run verify:no-drift
   ```

### Enforcement

- ✅ Pre-commit hook validates pipeline
- ✅ Linter prevents manual edits to generated files
- ✅ Pre-build check ensures no drift
- ✅ CI/CD pipeline verifies compliance

## Key Learning

This feature was initially non-compliant (no specifications). The recovery process:
1. ✅ Extracted requirements from code
2. ✅ Created formal specifications
3. ✅ Generated BDD tests from specs
4. ✅ Verified tests pass
5. ✅ Setup drift detection
6. ✅ Documented the process

Future features should start with specifications (use `interactive-bdd-wizard.js`).
EOF
```

**Checklist**:
- [ ] Recovery report created
- [ ] Timeline documented
- [ ] Usage instructions clear
- [ ] Key learnings noted

---

### Phase 7: Enforce Compliance (Ongoing)

**Goal**: Prevent regression to non-compliance

#### Step 7A: Verify Enforcement Works

```bash
# Try to commit without proper pipeline
git add .
git commit -m "test"

# Should see pre-commit hook validation
# ✅ All checks pass (feature is compliant)
```

#### Step 7B: Monitor for Drift

```bash
# Run regularly (daily or before deploy)
npm run verify:no-drift

# Should show:
# ✅ All checksums match
# ✅ No drift detected
# ✅ Pipeline integrity verified
```

**Checklist**:
- [ ] Enforcement hooks installed
- [ ] Pre-commit validating successfully
- [ ] Build checks passing
- [ ] Drift detection configured
- [ ] Ongoing monitoring in place

---

## Recovery Timeline

| Phase | Duration | Activities |
|---|---|---|
| **1. Assess** | 30 min | Inventory implementation, tests, specs |
| **2. Recover Specs** | 2-3 hrs | Interview stakeholders, analyze code, create specs |
| **3. Generate Tests** | 1-2 hrs | Auto-generate BDD tests from specs |
| **4. Verify Tests** | 1-2 hrs | Fix implementation to pass BDD tests |
| **5. Setup Drift** | 30 min | Compute checksums, configure verification |
| **6. Document** | 1 hr | Create recovery report, document process |
| **7. Enforce** | ongoing | Monitor compliance, prevent regression |
| **TOTAL** | 6-9 hrs | Full recovery to compliant state |

---

## Recovery Decision Tree

### Is the feature non-compliant?

```
Does it have Business BDD Specifications? 
  ├─ YES: Go to next question
  └─ NO: → Start Phase 2 (Recover Specs)

Do auto-generated BDD tests exist?
  ├─ YES: Go to next question
  └─ NO: → Start Phase 3 (Generate Tests)

Are unit tests passing?
  ├─ YES: Go to next question
  └─ NO: → Fix failing tests, retry

Is drift detection configured?
  ├─ YES: Feature is COMPLIANT ✅
  └─ NO: → Start Phase 5 (Setup Drift)
```

---

## Risk Mitigation

### Risk: Losing implementation during recovery

**Mitigation**: 
- Recovery process preserves all existing code
- We only ADD specifications and tests
- No refactoring or rework required
- Implementation stays unchanged

### Risk: Specifications don't match implementation

**Mitigation**:
- Stakeholder interviews confirm spec accuracy
- Code analysis validates understanding
- BDD tests verify spec-code alignment
- Manual review before finalizing specs

### Risk: BDD tests fail after recovery

**Mitigation**:
- Minimal implementation fixes allowed
- Only changes needed to satisfy business specs
- All original functionality preserved
- Unit tests ensure no regressions

### Risk: Specifications become stale

**Mitigation**:
- Drift detection automatically flags changes
- Regeneration process keeps specs-tests in sync
- Enforcement prevents manual spec edits
- Regular verification ensures compliance

---

## Graduation Criteria

A recovered feature is **fully compliant** when:

- ✅ Business BDD Specifications exist and are locked
- ✅ Auto-generated BDD tests exist and pass
- ✅ Unit tests exist and pass (80%+ coverage)
- ✅ Implementation code passes all tests
- ✅ Drift detection is configured
- ✅ Pre-commit hooks pass
- ✅ Build checks pass
- ✅ Recovery report is documented

---

## Template: Recovery Checklist

Copy this for each feature being recovered:

```markdown
## Recovery Checklist: [Feature Name]

### Phase 1: Assess (30 min)
- [ ] Implementation inventory complete
- [ ] Existing tests identified
- [ ] No business specs found (expected)
- [ ] Decision: Proceed with recovery

### Phase 2: Recover Specs (2-3 hrs)
- [ ] Stakeholders interviewed
- [ ] Code analyzed
- [ ] Requirements documented
- [ ] Specifications file created
- [ ] File marked as locked
- [ ] Team review completed

### Phase 3: Generate Tests (1-2 hrs)
- [ ] Test file created
- [ ] Tests follow Given-When-Then structure
- [ ] Business scenarios covered
- [ ] Tests match specifications

### Phase 4: Verify Tests (1-2 hrs)
- [ ] All BDD tests running
- [ ] All BDD tests passing
- [ ] Implementation unchanged
- [ ] Unit tests still passing

### Phase 5: Setup Drift (30 min)
- [ ] Checksums computed
- [ ] Baseline recorded
- [ ] Drift detection configured
- [ ] Verification passing

### Phase 6: Document (1 hr)
- [ ] Recovery report created
- [ ] Timeline documented
- [ ] Usage instructions written
- [ ] Learnings recorded

### Phase 7: Enforce (Ongoing)
- [ ] Pre-commit hooks passing
- [ ] Build checks passing
- [ ] Drift detection monitoring
- [ ] Compliance verified

**Total Time**: 6-9 hours
**Status**: [Not Started / In Progress / Complete]
**Compliance**: [No / Yes]
```

---

## Key Principles

✅ **Preserve Work**: Recovery doesn't discard existing implementation
✅ **Create Foundation**: Add missing pipeline layers
✅ **Automate**: Use generators, not manual rework
✅ **Document**: Create audit trail of recovery
✅ **Verify**: Ensure specs match implementation
✅ **Prevent Regression**: Enforce compliance going forward
✅ **Learn**: Apply lessons to new features

---

## Success Indicator

Recovery is successful when:

```bash
# This command shows all green:
npm run enforce:pipeline

# Output:
# ✅ Feature has Business BDD Specifications
# ✅ Feature has Auto-Generated BDD Tests
# ✅ Feature has Unit Tests
# ✅ Feature has Implementation Code
# ✅ Feature has Drift Detection Configured
# 
# ✅ ALL FEATURES FOLLOW COMPLETE DELIVERY PIPELINE
```
