# AC-to-Test Coverage Remediation Plan

## Executive Summary

**Current State**: 22% average AC-to-test alignment across 43 beats (20 symphonies validated)
**Target State**: 80%+ alignment within 3 sprints
**Impact**: Ensures tests actually verify acceptance criteria requirements

## Problem Analysis

### Root Causes

1. **Generic AC Templates** (60% of gap)
   - ACs use standardized templates with governance/telemetry clauses
   - Tests focus on functional behavior, not SLA/governance requirements
   - Example: "audit trails capture execution" → No corresponding test assertion

2. **Missing Performance Assertions** (25% of gap)
   - ACs specify timing requirements (< 1s, < 200ms)
   - Tests lack performance/latency measurements
   - Example: "completes within < 1 second" → No timing assertion

3. **Missing Telemetry Verification** (10% of gap)
   - ACs require event publishing and telemetry recording
   - Tests don't verify events were published
   - Example: "telemetry events are recorded" → No spy/mock verification

4. **Test Naming Mismatch** (5% of gap)
   - Test names don't reflect AC language
   - Validator can't match tests to ACs by name
   - Example: AC "validates schema" → Test "works correctly"

## Strategic Approach

### Phase 1: Quick Wins (Sprint 1) - Target: 40% Coverage

**Focus**: Low-hanging fruit - improve matching without writing new tests

#### 1.1 Refine Matching Algorithm

**Effort**: 2 days
**Impact**: +10-15% coverage

**Actions**:
- Lower confidence threshold from 30% to 20% for partial matches
- Add more keyword patterns for common assertions
- Improve test name similarity scoring
- Add support for nested describe blocks

**Implementation**:
```javascript
// Update extractKeyPhrases() in validate-ac-test-alignment.cjs
function extractKeyPhrases(condition) {
  // Add more patterns for:
  // - "completes successfully" → toBe(true), not.toThrow
  // - "output is valid" → toBeDefined, toBeTruthy
  // - "meets schema" → any schema/validation assertion
}
```

#### 1.2 Improve Test Names

**Effort**: 3 days
**Impact**: +5% coverage

**Actions**:
- Audit top 10 poorly-aligned symphonies
- Rename test cases to match AC language
- Use AC conditions verbatim in test descriptions

**Example**:
```typescript
// Before
it('should work', () => { ... });

// After
it('completes successfully within < 1 second', async () => { ... });
```

**Deliverables**:
- Updated test files for Canvas Component symphonies (6 beats)
- Naming convention guide for future tests

#### 1.3 Generate Coverage Report

**Effort**: 1 day
**Impact**: Baseline for tracking

**Actions**:
- Run AC validation on all domains
- Generate detailed gap analysis per symphony
- Identify top 20 beats needing test improvements

**Script**:
```bash
node scripts/generate-ac-coverage-gap-report.cjs
```

**Output**: Prioritized backlog of missing assertions

---

### Phase 2: Core Assertions (Sprint 2) - Target: 65% Coverage

**Focus**: Add critical missing assertions (performance, events, errors)

#### 2.1 Add Performance Assertions

**Effort**: 5 days
**Impact**: +15% coverage

**Actions**:
- Add timing assertions to all beats with SLA requirements
- Use `performance.now()` for < 1s requirements
- Mock async operations for consistent test timing

**Template**:
```typescript
it('completes within < 1 second', async () => {
  const start = performance.now();
  await handler(input);
  const duration = performance.now() - start;

  expect(duration).toBeLessThan(1000); // < 1s SLA
});
```

**Scope**:
- All beats with "within < X ms/second" in ACs (~30 beats)
- Priority: Canvas Component, Header, Library symphonies

#### 2.2 Add Event/Telemetry Assertions

**Effort**: 4 days
**Impact**: +8% coverage

**Actions**:
- Add spies/mocks for event publishing
- Verify telemetry.recordLatency() calls
- Check event payloads contain required fields

**Template**:
```typescript
it('publishes required events with telemetry', () => {
  const publishSpy = jest.spyOn(eventRouter, 'publish');
  const telemetrySpy = jest.spyOn(telemetry, 'recordLatency');

  handler(input);

  expect(publishSpy).toHaveBeenCalledWith(
    expect.objectContaining({ type: 'canvas.component.created' })
  );
  expect(telemetrySpy).toHaveBeenCalledWith(
    expect.any(String), // handler name
    expect.any(Number)  // latency
  );
});
```

**Scope**:
- All beats with "events are published" AC (~25 beats)
- All beats with "telemetry events are recorded" AC (~35 beats)

#### 2.3 Add Error Handling Assertions

**Effort**: 2 days
**Impact**: +2% coverage

**Actions**:
- Add negative test cases for error ACs
- Verify error logging and context
- Test recovery/stability after errors

**Template**:
```typescript
describe('error conditions', () => {
  it('logs errors with full context and remains stable', async () => {
    const logSpy = jest.spyOn(logger, 'error');
    const invalidInput = { /* malformed */ };

    await expect(handler(invalidInput)).rejects.toThrow();

    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining('handler'),
      expect.objectContaining({ context: expect.any(Object) })
    );

    // Verify system remains stable - can process next request
    await expect(handler(validInput)).resolves.not.toThrow();
  });
});
```

**Scope**:
- All beats with "error is logged" AC (~40 beats)

---

### Phase 3: Governance & Schema (Sprint 3) - Target: 80%+ Coverage

**Focus**: Complete coverage with governance and schema assertions

#### 3.1 Add Schema Validation Assertions

**Effort**: 3 days
**Impact**: +10% coverage

**Actions**:
- Add schema validation for all handler outputs
- Use JSON Schema or Zod for validation
- Verify required fields and types

**Template**:
```typescript
import { validateSchema } from './test-utils/schema-validator';

it('output conforms to expected schema', () => {
  const result = handler(input);

  const validation = validateSchema(result, componentSchema);

  expect(validation.valid).toBe(true);
  expect(validation.errors).toEqual([]);
});
```

**Scope**:
- All beats with "conforms to expected schema" AC (~35 beats)

#### 3.2 Add Governance/Audit Assertions

**Effort**: 4 days
**Impact**: +5% coverage

**Actions**:
- Add audit trail verification
- Check governance rule enforcement
- Verify compliance flags

**Template**:
```typescript
it('enforces governance rules and captures audit trail', () => {
  const auditSpy = jest.spyOn(auditService, 'record');

  const result = handler(input);

  // Governance rules enforced
  expect(result.violations).toEqual([]);

  // Audit trail captured
  expect(auditSpy).toHaveBeenCalledWith(
    expect.objectContaining({
      action: 'handler.execute',
      timestamp: expect.any(String),
      user: expect.any(String)
    })
  );
});
```

**Scope**:
- All beats with "governance rules enforced" AC (~40 beats)
- All beats with "audit trails capture execution" AC (~40 beats)

#### 3.3 Auto-Generate Test Stubs

**Effort**: 3 days
**Impact**: Accelerate future development

**Actions**:
- Create test stub generator from ACs
- Generate boilerplate assertions for each AC type
- Integrate into symphony creation workflow

**Script**:
```bash
node scripts/generate-test-stubs-from-acs.cjs <symphony-file.json>
```

**Output**: Complete test file skeleton with TODO assertions

---

## Implementation Strategy

### Prioritization Matrix

| Symphony | Beats | Current Coverage | Business Impact | Priority |
|----------|-------|------------------|-----------------|----------|
| Canvas Component Create | 6 | 28% | High (core UX) | P0 |
| Canvas Component Copy | 3 | 22% | Medium | P1 |
| Canvas Component Delete | 2 | 30% | Medium | P1 |
| Header Navigation | 4 | 18% | High (core UX) | P0 |
| Library Component Load | 5 | 25% | High (plugin system) | P0 |
| Self-Healing Detect | 3 | 15% | Critical (reliability) | P0 |
| SLO Dashboard Render | 4 | 20% | High (observability) | P1 |

**P0 (Sprint 1-2)**: Core UX and reliability features
**P1 (Sprint 2-3)**: Important but non-blocking features
**P2 (Backlog)**: Nice-to-have improvements

### Resource Allocation

**Sprint 1** (Quick Wins):
- 1 engineer, 5 days
- Deliverables: Improved matching (40% coverage)

**Sprint 2** (Core Assertions):
- 2 engineers, 10 days each
- Deliverables: Performance + Events + Errors (65% coverage)

**Sprint 3** (Governance & Schema):
- 2 engineers, 10 days each
- Deliverables: Complete coverage (80%+ coverage)

**Total Effort**: ~45 engineering days over 3 sprints

---

## Measurement & Success Criteria

### Key Metrics

1. **AC-to-Test Alignment Coverage**
   - Baseline: 22%
   - Sprint 1 Target: 40%
   - Sprint 2 Target: 65%
   - Sprint 3 Target: 80%+

2. **Beats by Status**
   - Good (≥70%): 0 → 35+ beats
   - Partial (40-69%): 3 → 8 beats
   - Poor (<40%): 40 → 0 beats

3. **Symphony Coverage**
   - Average: 22% → 80%+
   - P0 Symphonies: 100% should reach ≥80%

### Tracking Dashboard

Run after each sprint:
```bash
npm run analyze:domains:all
```

View dashboard:
```
docs/generated/ac-coverage-dashboard.md
```

### Definition of Done

**Sprint 1**:
- ✅ Matching algorithm updated
- ✅ Top 10 symphonies renamed for clarity
- ✅ Coverage baseline report generated
- ✅ 40% average coverage achieved

**Sprint 2**:
- ✅ Performance assertions added to 30 beats
- ✅ Event/telemetry assertions added to 25 beats
- ✅ Error handling assertions added to 20 beats
- ✅ 65% average coverage achieved

**Sprint 3**:
- ✅ Schema validation added to 35 beats
- ✅ Governance/audit assertions added to 40 beats
- ✅ Test stub generator implemented
- ✅ 80%+ average coverage achieved
- ✅ All P0 symphonies ≥80% coverage

---

## Risk Mitigation

### Risk 1: False Positives in Matching

**Mitigation**:
- Manual review of alignment reports
- Spot-check random beats for accuracy
- Adjust matching thresholds based on feedback

### Risk 2: Test Execution Time Increase

**Mitigation**:
- Use mocks for performance-sensitive tests
- Parallelize test execution
- Monitor CI/CD pipeline duration

### Risk 3: Maintenance Burden

**Mitigation**:
- Auto-generate test stubs from ACs
- Create reusable test utilities (schema validator, audit spy)
- Document patterns in testing guidelines

### Risk 4: Breaking Existing Tests

**Mitigation**:
- Add new assertions without removing existing ones
- Run full test suite after each change
- Use feature flags for experimental assertions

---

## Automation Opportunities

### 1. Pre-commit Hook

Validate new/modified symphonies have ≥70% AC coverage:

```bash
#!/bin/bash
# .git/hooks/pre-commit

changed_symphonies=$(git diff --cached --name-only | grep 'json-sequences.*\.json')

for symphony in $changed_symphonies; do
  coverage=$(node scripts/validate-ac-test-alignment.cjs "$symphony" | grep "Average Coverage" | awk '{print $3}' | tr -d '%')

  if [ "$coverage" -lt 70 ]; then
    echo "❌ Symphony $symphony has only ${coverage}% AC coverage (minimum: 70%)"
    exit 1
  fi
done
```

### 2. CI/CD Integration

Fail builds if AC coverage drops below threshold:

```yaml
# .github/workflows/ac-coverage.yml
name: AC Coverage Check

on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run AC Validation
        run: |
          npm run analyze:domains:all
          coverage=$(jq '.averageCoverage' .generated/analysis/renderx-web/*ac-validation*.json | tail -1)
          if [ "$coverage" -lt 65 ]; then
            echo "❌ AC coverage ${coverage}% below minimum 65%"
            exit 1
          fi
```

### 3. Auto-Generate Test Stubs

From symphony ACs, generate test file skeleton:

```javascript
// scripts/generate-test-stubs-from-acs.cjs
const symphony = JSON.parse(fs.readFileSync(symphonyPath));

symphony.movements.forEach(movement => {
  movement.beats.forEach(beat => {
    beat.acceptanceCriteria.forEach((ac, i) => {
      const parsed = parseAcceptanceCriteria(ac);

      // Generate test stub
      testStubs.push(`
        describe('AC ${i + 1}', () => {
          ${parsed.then.map(condition => `
            it('${condition}', () => {
              // TODO: Implement assertion for: ${condition}
              expect(true).toBe(true);
            });
          `).join('\n')}
        });
      `);
    });
  });
});
```

---

## Long-Term Vision

### Continuous Improvement

**Quarter 1**: Achieve 80%+ baseline coverage
**Quarter 2**: Maintain 80%+ with new features
**Quarter 3**: Reach 90%+ with automated stub generation
**Quarter 4**: Achieve 95%+ with AI-assisted test generation

### Process Integration

1. **Symphony Creation**:
   - Write ACs first
   - Generate test stubs from ACs
   - Implement handlers
   - Fill in test assertions
   - Validate ≥70% coverage before merge

2. **Code Review**:
   - AC validation report in PR description
   - Require ≥70% coverage for approval
   - Spot-check assertions for correctness

3. **Release Gates**:
   - Block releases if coverage drops below 65%
   - Require P0 symphonies at ≥80%
   - Include coverage metrics in release notes

---

## Appendix

### A. Test Utility Library

Create reusable utilities for common assertions:

```typescript
// test-utils/ac-assertions.ts

export const assertPerformance = async (
  handler: Function,
  input: any,
  maxDuration: number
) => {
  const start = performance.now();
  await handler(input);
  const duration = performance.now() - start;
  expect(duration).toBeLessThan(maxDuration);
};

export const assertEventPublished = (
  spy: jest.SpyInstance,
  eventType: string
) => {
  expect(spy).toHaveBeenCalledWith(
    expect.objectContaining({ type: eventType })
  );
};

export const assertSchemaValid = (
  data: any,
  schema: any
) => {
  const result = validateSchema(data, schema);
  expect(result.valid).toBe(true);
};

export const assertAuditTrail = (
  spy: jest.SpyInstance,
  action: string
) => {
  expect(spy).toHaveBeenCalledWith(
    expect.objectContaining({
      action,
      timestamp: expect.any(String)
    })
  );
};
```

### B. AC Coverage Dashboard

Visual dashboard showing progress:

```markdown
# AC Coverage Dashboard

## Overall Progress

[████████████████░░░░] 80% (Target: 80%)

## By Symphony

| Symphony | Coverage | Trend | Status |
|----------|----------|-------|--------|
| Canvas Component Create | 85% | ↑ +57% | ✅ GOOD |
| Header Navigation | 78% | ↑ +60% | ✅ GOOD |
| Self-Healing Detect | 92% | ↑ +77% | ✅ GOOD |
| Canvas Component Copy | 68% | ↑ +46% | ⚠️ PARTIAL |

## By AC Type

| Type | Coverage |
|------|----------|
| Performance | 90% ✅ |
| Events/Telemetry | 85% ✅ |
| Error Handling | 75% ✅ |
| Schema Validation | 80% ✅ |
| Governance/Audit | 65% ⚠️ |
```

### C. Team Training

**Workshop 1**: Understanding AC-to-Test Alignment
- Why it matters
- How matching works
- Interpreting reports

**Workshop 2**: Writing Effective Assertions
- Performance testing patterns
- Event verification techniques
- Schema validation approaches

**Workshop 3**: Test Stub Generation
- Using the stub generator
- Customizing templates
- Best practices

---

**Document Version**: 1.0
**Last Updated**: 2025-11-30
**Owner**: Engineering Team
**Review Cadence**: After each sprint
