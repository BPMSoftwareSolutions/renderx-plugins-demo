# Unit Test Stubs - Complete Guide

## 📍 Location

All unit test stubs are located in: `packages/self-healing/__tests__/`

## 📋 Test Files (7 Total)

| File | Handlers | Tests | Status |
|------|----------|-------|--------|
| `telemetry.parse.spec.ts` | 7 | 14 | ✅ Ready |
| `anomaly.detect.spec.ts` | 9 | 18 | ✅ Ready |
| `diagnosis.analyze.spec.ts` | 11 | 22 | ✅ Ready |
| `fix.generate.spec.ts` | 9 | 18 | ✅ Ready |
| `validation.run.spec.ts` | 10 | 20 | ✅ Ready |
| `deployment.deploy.spec.ts` | 11 | 22 | ✅ Ready |
| `learning.track.spec.ts` | 10 | 20 | ✅ Ready |
| **TOTAL** | **67** | **134** | **✅ Ready** |

## 🏗️ Test Structure

Each unit test file follows this structure:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
// TODO: Import handlers from @renderx-plugins/self-healing
// import { handler1, handler2, ... } from '../src/handlers/index.js';

/**
 * Test suite for [Sequence Name]
 * 
 * Handlers: [N]
 * Tests: [N*2]
 */

describe('[Sequence Name] (self-healing-[sequence]-symphony)', () => {
  // TODO: Set up test context and mocks
  let ctx: any;

  beforeEach(() => {
    // TODO: Initialize context with required handlers and mocks
    ctx = {};
  });

  // For each handler:
  it('[handlerName] - happy path', () => {
    // TODO: Implement test for [handlerName] ([kind])
    // This test should verify happy path behavior
    expect(true).toBe(true);
  });
  
  it('[handlerName] - error handling', () => {
    // TODO: Implement test for [handlerName] ([kind])
    // This test should verify error handling and edge cases
    expect(true).toBe(true);
  });
});
```

## 📝 Test Pattern

Each handler has **2 tests**:

### 1. Happy Path Test
- Tests normal, successful execution
- Verifies expected output
- Confirms event publishing
- Validates state changes

### 2. Error Handling Test
- Tests error conditions
- Verifies error handling
- Confirms error events
- Validates graceful degradation

## 🔍 Example: telemetry.parse.spec.ts

```typescript
describe('Parse Production Telemetry (self-healing-telemetry-parse-symphony)', () => {
  let ctx: any;

  beforeEach(() => {
    ctx = {};
  });

  // Handler 1: parseTelemetryRequested (pure)
  it('parseTelemetryRequested - happy path', () => {
    // TODO: Test successful request validation
    expect(true).toBe(true);
  });
  
  it('parseTelemetryRequested - error handling', () => {
    // TODO: Test invalid request handling
    expect(true).toBe(true);
  });

  // Handler 2: loadLogFiles (stage-crew)
  it('loadLogFiles - happy path', () => {
    // TODO: Test successful log file loading
    expect(true).toBe(true);
  });
  
  it('loadLogFiles - error handling', () => {
    // TODO: Test missing/corrupted log handling
    expect(true).toBe(true);
  });

  // ... 5 more handlers with 2 tests each
});
```

## 🎯 Implementation Guide

### Step 1: Import Handlers
Uncomment and update the import statement:
```typescript
import { 
  parseTelemetryRequested, 
  loadLogFiles, 
  extractTelemetryEvents,
  // ... other handlers
} from '../src/handlers/index.js';
```

### Step 2: Set Up Context
Initialize test context with mocks:
```typescript
beforeEach(() => {
  ctx = {
    handlers: {
      parseTelemetryRequested,
      loadLogFiles,
      // ...
    },
    mocks: {
      database: { /* mock */ },
      fileSystem: { /* mock */ },
      // ...
    }
  };
});
```

### Step 3: Implement Happy Path
Test successful execution:
```typescript
it('parseTelemetryRequested - happy path', () => {
  const input = { requestId: 'test-123' };
  const result = ctx.handlers.parseTelemetryRequested(input);
  
  expect(result).toEqual({
    requestId: 'test-123',
    status: 'started'
  });
});
```

### Step 4: Implement Error Handling
Test error conditions:
```typescript
it('parseTelemetryRequested - error handling', () => {
  const input = { requestId: null }; // Invalid
  
  expect(() => {
    ctx.handlers.parseTelemetryRequested(input);
  }).toThrow();
});
```

## 📊 Handler Types

Each handler is marked with its type:

### Pure Handlers
- Synchronous, deterministic
- No side effects
- Example: `parseTelemetryRequested`, `normalizeTelemetryData`

### Stage-Crew Handlers
- Asynchronous I/O operations
- May have side effects
- Example: `loadLogFiles`, `storeTelemetryDatabase`

## 🧪 Test Coverage Goals

- **Happy Path**: 50% of tests
- **Error Handling**: 50% of tests
- **Overall Coverage**: 80%+
- **Critical Paths**: 100%

## 📚 Related Documentation

- `BDD_TESTING_STRATEGY.md` - Testing strategy
- `comprehensive-business-bdd-specifications.json` - Business specs
- `bdd-specifications.json` - Technical specs
- `proposed-tests.json` - Test structure

## 🚀 Next Steps

1. **Review** the test stubs in `__tests__/`
2. **Understand** the handler specifications in `src/handlers/`
3. **Implement** each test following the pattern
4. **Run** tests with `npm test`
5. **Verify** coverage with `npm test -- --coverage`

## ✅ Checklist for Implementation

- [ ] Import all handlers
- [ ] Set up test context and mocks
- [ ] Implement happy path tests (7 handlers × 7 sequences = 67 tests)
- [ ] Implement error handling tests (67 tests)
- [ ] Verify all tests pass
- [ ] Achieve 80%+ coverage
- [ ] Verify lint passes

## 📞 Quick Reference

**Run all tests**:
```bash
npm test
```

**Run specific test file**:
```bash
npm test -- telemetry.parse.spec.ts
```

**Run with coverage**:
```bash
npm test -- --coverage
```

**Watch mode**:
```bash
npm test -- --watch
```

---

**Total Unit Tests**: 134  
**Total Handlers**: 67  
**Test Files**: 7  
**Status**: ✅ Ready for Implementation

