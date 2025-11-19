# Improvement Plan Sequences - TDD/BDD Guide

## Overview

The improvement plan sequences provide a **structured, testable roadmap** for refactoring complex functions. Each sequence is a musical composition with movements (phases) and beats (test cases).

## What Was Generated

**File**: `.ographx/artifacts/renderx-web/improvement-plans/improvement-sequences.json`

**Contains**:
- 1 Master Improvement Plan (Q1 2025)
- 3 Individual Improvement Sequences
- 4 Movements per sequence (Analysis, Refactoring, Validation, Deployment)
- 3-5 Beats per movement (test cases)

## Master Improvement Plan

**Goal**: Reduce complexity in top 5 bottleneck functions by ~30%

**Current State**: 343 total calls
**Target State**: 193 total calls
**Estimated Improvement**: 50% reduction in complexity

### Functions Targeted

1. **extractPatterns** - 101 → 50 calls (50.5% improvement)
2. **updateSize** - 63 → 30 calls (52.4% improvement)
3. **ChatWindow** - 62 → 35 calls (43.5% improvement)
4. **recomputeLineSvg** - 61 → 35 calls (42.6% improvement)
5. **generatePresentationJS** - 56 → 30 calls (46.4% improvement)

## Sequence Structure

Each improvement sequence has 4 movements:

### Movement 1: Analysis & Baseline
- **Beat 1**: Measure current performance
- **Beat 2**: Profile execution time
- **Beat 3**: Verify test coverage

**Test Cases**:
```typescript
// Beat 1: Baseline
assert(extractPatterns.callCount === 101);

// Beat 2: Performance
assert(extractPatterns.executionTime < 1000ms);

// Beat 3: Coverage
assert(testCoverage > 80%);
```

### Movement 2: Refactoring
- **Beat 1-N**: One beat per refactoring step

**Example for extractPatterns**:
- Extract pattern detection logic
- Extract validation logic
- Extract transformation logic
- Add result caching

**Test Cases**:
```typescript
// Beat 1: Extract pattern detection
assert(detectPatterns.callCount < 30);
assert(extractPatterns.callCount === 90);

// Beat 2: Extract validation
assert(validatePatterns.callCount < 20);
assert(extractPatterns.callCount === 80);

// Beat 3: Extract transformation
assert(transformPatterns.callCount < 15);
assert(extractPatterns.callCount === 70);

// Beat 4: Add caching
assert(cache.hits > 50%);
assert(extractPatterns.callCount === 50);
```

### Movement 3: Validation & Verification
- **Beat 1**: Verify call reduction
- **Beat 2**: Verify performance improvement
- **Beat 3**: Run regression tests
- **Beat 4**: Integration testing

**Test Cases**:
```typescript
// Beat 1: Call reduction
assert(extractPatterns.callCount <= 50);

// Beat 2: Performance
assert(executionTime improved by >= 20%);

// Beat 3: Regression
assert(allExistingTests.pass());

// Beat 4: Integration
assert(componentWorks.inFullSystem());
```

### Movement 4: Deployment & Monitoring
- **Beat 1**: Deploy to staging
- **Beat 2**: Monitor staging metrics
- **Beat 3**: Deploy to production
- **Beat 4**: Monitor production metrics

## How to Use for TDD/BDD

### Step 1: Load the Improvement Plan

```typescript
import { readFileSync } from 'fs';

const plan = JSON.parse(
  readFileSync('.ographx/artifacts/renderx-web/improvement-plans/improvement-sequences.json', 'utf-8')
);

const extractPatternsImprovement = plan.sequences.find(s => s.id === 'imp_extractPatterns');
```

### Step 2: Create Test Suite from Movements

```typescript
describe('extractPatterns Improvement Plan', () => {
  describe('Movement 1: Analysis & Baseline', () => {
    it('Beat 1: Should measure baseline call count', () => {
      const callCount = measureCallCount(extractPatterns);
      expect(callCount).toBe(101);
    });
    
    it('Beat 2: Should profile execution time', () => {
      const time = profileExecutionTime(extractPatterns);
      expect(time).toBeLessThan(1000);
    });
    
    it('Beat 3: Should verify test coverage', () => {
      const coverage = getTestCoverage(extractPatterns);
      expect(coverage).toBeGreaterThan(0.8);
    });
  });
  
  describe('Movement 2: Refactoring', () => {
    it('Beat 1: Should extract pattern detection', () => {
      // Implement refactoring
      expect(extractPatterns.callCount).toBeLessThanOrEqual(90);
    });
    
    // ... more beats
  });
  
  describe('Movement 3: Validation & Verification', () => {
    // ... validation tests
  });
  
  describe('Movement 4: Deployment & Monitoring', () => {
    // ... deployment tests
  });
});
```

### Step 3: Implement Refactoring

For each beat in Movement 2:
1. Write failing test
2. Implement refactoring
3. Verify test passes
4. Check call count reduction
5. Move to next beat

### Step 4: Validate & Deploy

Run Movement 3 tests to verify:
- Call count reduced to target
- Performance improved by 20%+
- All regression tests pass
- Integration tests pass

Then run Movement 4 for deployment.

## Example: extractPatterns Refactoring

### Current State
```typescript
function extractPatterns(data) {
  // 101 calls total
  // - 30 calls to detectPatterns
  // - 25 calls to validatePatterns
  // - 20 calls to transformPatterns
  // - 26 other calls
}
```

### Refactoring Plan

**Beat 1**: Extract pattern detection
```typescript
function detectPatterns(data) {
  // 30 calls → 15 calls (optimized)
}

function extractPatterns(data) {
  // Now 86 calls (101 - 15)
}
```

**Beat 2**: Extract validation
```typescript
function validatePatterns(patterns) {
  // 25 calls → 12 calls (optimized)
}

function extractPatterns(data) {
  // Now 73 calls (86 - 12)
}
```

**Beat 3**: Extract transformation
```typescript
function transformPatterns(patterns) {
  // 20 calls → 10 calls (optimized)
}

function extractPatterns(data) {
  // Now 63 calls (73 - 10)
}
```

**Beat 4**: Add caching
```typescript
const patternCache = new Map();

function extractPatterns(data) {
  const cacheKey = hash(data);
  if (patternCache.has(cacheKey)) {
    return patternCache.get(cacheKey);
  }
  
  const result = /* ... */;
  patternCache.set(cacheKey, result);
  return result;
  
  // Now 50 calls (63 - 13 from cache hits)
}
```

## Metrics to Track

For each beat, measure:
- **Call Count**: Number of function calls
- **Execution Time**: Total execution time
- **Memory Usage**: Peak memory consumption
- **Test Coverage**: % of code covered by tests
- **Cache Hit Rate**: % of cache hits (if applicable)

## Integration with CI/CD

Add to your CI pipeline:

```yaml
- name: Run Improvement Plan Tests
  run: npm run test:improvement-plan
  
- name: Verify Call Count Reduction
  run: npm run verify:call-counts
  
- name: Performance Benchmarks
  run: npm run benchmark:improvements
```

## Next Steps

1. ✅ Generate improvement plan sequences
2. ⏭️ Create test suite from movements
3. ⏭️ Implement refactoring (beat by beat)
4. ⏭️ Verify improvements
5. ⏭️ Deploy to production
6. ⏭️ Monitor metrics

## Files

- `generate_improvement_plan.py` - Generator script
- `improvement-sequences.json` - Generated plan
- `IMPROVEMENT_PLAN_GUIDE.md` - This guide

