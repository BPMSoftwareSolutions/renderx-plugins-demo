# Acceptance Criteria to Test Alignment Validation

## Overview

The AC-to-Test Alignment Validation system validates that each acceptance criteria (AC) in symphony beats has corresponding test assertions that match the AC requirements. This ensures that the tests actually verify what the acceptance criteria specify.

## Features

### 1. Test Assertion Extraction

Extracts all test assertions from linked test files:
- **Vitest/Jest**: `expect(...).toBe(...)`, `expect(...).toHaveBeenCalled()`, etc.
- **Chai**: `assert.equal(...)`, `assert.isTrue(...)`, etc.
- **Performance**: Timing/latency assertions
- **Schema**: Validation and conformance assertions
- **Events**: Telemetry and event publish assertions
- **Errors**: Exception and error handling assertions

### 2. Gherkin AC Parsing

Parses acceptance criteria into testable conditions:
- **Given**: Pre-conditions
- **When**: Actions
- **Then**: Expected outcomes
- **And**: Additional conditions

### 3. Intelligent Matching

Matches AC conditions to test assertions using:
- **Keyword extraction**: Performance, validation, events, errors, etc.
- **Similarity scoring**: Confidence-based matching (30% threshold)
- **Context awareness**: Test names and assertion context

### 4. Coverage Metrics

Calculates alignment coverage:
- **Beat-level**: Coverage per beat
- **Symphony-level**: Coverage per symphony
- **Domain-level**: Aggregate coverage across all symphonies

### 5. Status Classification

- **GOOD (≥70%)**: Strong alignment between ACs and tests
- **PARTIAL (40-69%)**: Some alignment, gaps exist
- **POOR (<40%)**: Weak alignment, significant gaps

## Integration with Code Analysis Pipeline

The validation is integrated into Movement 4 of the symphonic code analysis pipeline:

```javascript
// Movement 4: Architecture Conformity & Reporting
const acValidation = validateAcceptanceCriteriaAlignment();
```

### Analysis Artifacts

The pipeline generates:

1. **Aggregate Report** (`.generated/analysis/<domain>/<domain>-ac-validation-<timestamp>.json`)
   - Domain-wide AC alignment metrics
   - Summary statistics
   - All symphony validations

2. **Detailed Reports** (`.generated/analysis/<domain>/<domain>-<symphony>-ac-validation-<timestamp>.json`)
   - Per-symphony validation results
   - Beat-by-beat AC coverage
   - Matched/unmatched conditions

3. **Markdown Report Section** (in main code analysis report)
   - Summary table
   - Top validated symphonies
   - Recommendations for improvement

## Usage

### Standalone Validation

Validate a single symphony:

```bash
node scripts/validate-ac-test-alignment.cjs packages/canvas-component/json-sequences/canvas-component/create.json
```

### Domain Analysis

Run full domain analysis with AC validation:

```bash
ANALYSIS_DOMAIN_ID=renderx-web node scripts/analyze-domain.cjs renderx-web
```

### Continuous Integration

Add to CI pipeline:

```bash
npm run analyze:symphonic:code:domain:renderx-web
```

The AC validation runs automatically as part of Movement 4.

## Understanding the Results

### Example Output

```markdown
### Acceptance Criteria-to-Test Alignment

**Purpose**: Validate that each acceptance criteria condition has a matching test assertion

**Summary**:
- **Alignment Status**: ⚠️ PARTIAL (52% average coverage)
- **Symphonies Validated**: 129/129
- **Total Beats**: 395
- **Good Alignment** (≥70%): 105 beats
- **Partial Alignment** (40-69%): 200 beats
- **Poor Alignment** (<40%): 90 beats
```

### Coverage Interpretation

- **100%**: All AC conditions have matching test assertions
- **70-99%**: Most AC conditions covered, minor gaps
- **40-69%**: Partial coverage, needs improvement
- **0-39%**: Poor coverage, significant testing gaps

### Beat-Level Results

For each beat:

```markdown
### ✅ Resolve Template (85%)

- **Handler:** `resolveTemplate`
- **Test File:** schema-resolver.memo.spec.ts
- **Test Case:** "dedupes schema fetches across multiple calls and instances"
- **Status:** GOOD
- **Matched:** 13/15 conditions

#### Acceptance Criteria Coverage

**AC 1** (100%):
  ✓ it completes successfully within < 1 second
    → Assertion: `expect(duration).toBeLessThan(1000)`
    → Test: "completes within SLA"
  ✓ the output is valid and meets schema
    → Assertion: `expect(result).toMatchSchema(schema)`
  ✓ any required events are published
    → Assertion: `expect(eventRouter.publish).toHaveBeenCalled()`
```

## Matching Algorithm

### Key Phrase Extraction

The validator extracts testable phrases from AC conditions:

1. **Performance**: `< 200ms`, `within 1 second`, etc.
2. **Success**: `completes successfully`, `success rate`
3. **Validation**: `valid`, `schema`, `conform`
4. **Events**: `publish`, `emit`, `event`, `telemetry`
5. **Errors**: `error`, `exception`, `throw`
6. **Stability**: `stable`, `recover`
7. **Governance**: `audit`, `compliance`, `governance`

### Scoring

Each assertion is scored against AC conditions:

- **Direct match** (timing value): +0.8
- **Keyword match**: +0.4-0.5
- **Context match** (test name): +0.3

**Threshold**: 30% (0.3) minimum for match

### Example

**AC Condition**: "Then latency is consistently within target < 200ms"

**Matching Assertions**:
- `expect(latency).toBeLessThan(200)` → **80%** (exact value + timing keyword)
- `expect(duration).toBeLessThan(1000)` → **50%** (timing keyword)
- `expect(result.time).toBeDefined()` → **20%** (below threshold, no match)

## Improvement Recommendations

### 1. Add Missing Assertions

For unmatched AC conditions, add corresponding test assertions:

```typescript
// AC: "Then latency is consistently within target < 200ms"
it('executes within 200ms SLA', async () => {
  const start = performance.now();
  await handler();
  const duration = performance.now() - start;
  expect(duration).toBeLessThan(200);
});
```

### 2. Align Test Names

Use test names that reflect AC conditions:

```typescript
// Before
it('works correctly', () => { ... });

// After
it('completes successfully within < 1 second', () => { ... });
```

### 3. Add Telemetry Verification

Include event/telemetry assertions:

```typescript
it('publishes telemetry events with latency metrics', () => {
  const spy = jest.spyOn(telemetry, 'recordLatency');
  handler();
  expect(spy).toHaveBeenCalledWith(expect.any(Number));
});
```

### 4. Add Governance Checks

Include audit/compliance assertions:

```typescript
it('enforces all governance rules', () => {
  const result = handler();
  expect(result.auditTrail).toBeDefined();
  expect(result.complianceFlags).toEqual([]);
});
```

## Integration Points

### 1. Domain Registry

Configured in `DOMAIN_REGISTRY.json`:

```json
{
  "domains": {
    "renderx-web": {
      "analysisConfig": {
        "analysisSourcePath": "packages/",
        "analysisOutputPath": ".generated/analysis/renderx-web"
      }
    }
  }
}
```

### 2. Symphony JSON

Each beat must have:

```json
{
  "beat": 1,
  "handler": "resolveTemplate",
  "testFile": "schema-resolver.memo.spec.ts",
  "testCase": "dedupes schema fetches across multiple calls and instances",
  "acceptanceCriteria": [
    "Given the resolveTemplate operation is triggered\nWhen the handler executes\nThen it completes successfully within < 1 second\nAnd the output is valid and meets schema\nAnd any required events are published"
  ]
}
```

### 3. Test Files

Test files must be accessible and contain standard assertion patterns.

## Metrics Tracked

### Domain-Level

- Total symphonies validated
- Average AC coverage across all beats
- Distribution: Good/Partial/Poor beats

### Symphony-Level

- Total beats
- Good/Partial/Poor beat counts
- Average coverage
- Matched/unmatched conditions

### Beat-Level

- Per-AC coverage percentage
- Matched/unmatched conditions
- Assertion details

## Limitations

### 1. Heuristic Matching

The matching algorithm uses heuristics and may:
- **False negatives**: Miss valid matches with unusual naming
- **False positives**: Match unrelated assertions (rare due to 30% threshold)

### 2. Complex Logic

Cannot validate:
- Multi-step test logic
- Conditional assertions
- Dynamic test generation

### 3. Test File Access

Requires:
- Test files to be accessible at runtime
- Standard test frameworks (Vitest/Jest/Chai)

## Future Enhancements

1. **AST-based analysis**: Parse test files for more accurate matching
2. **Custom matchers**: Support domain-specific assertion patterns
3. **Coverage tracking**: Track improvements over time
4. **Auto-generation**: Generate test stubs for unmatched ACs
5. **Integration testing**: Validate AC alignment in CI/CD

## References

- [Test Discovery & Linking](../discover-and-link-tests.cjs)
- [Symphonic Code Analysis Pipeline](../scripts/analyze-symphonic-code.cjs)
- [Domain Registry](../DOMAIN_REGISTRY.json)
- [BDD Specifications](./BDD-SPECIFICATIONS.md)

---

**Generated**: 2025-11-30
**Version**: 1.0.0
**Status**: Active
