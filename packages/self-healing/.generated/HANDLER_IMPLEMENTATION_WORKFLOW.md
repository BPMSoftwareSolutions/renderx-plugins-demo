# Handler Implementation Workflow - BDD → TDD → Done

## 🎯 Overview

This document describes the **complete workflow for implementing new handlers** using Test-Driven Development (TDD) driven by Business-Driven Development (BDD) specifications.

**Workflow**: BDD Spec → Business BDD Test → Unit Test → Implementation → Done

## 📋 Step 1: Understand the Business BDD Spec

### Location
`packages/self-healing/.generated/comprehensive-business-bdd-specifications.json`

### What to Look For
Each handler has:
- **Handler Name**: The function to implement
- **Sequence**: Which sequence it belongs to
- **Business Value**: What business problem it solves
- **Persona**: Who uses this handler
- **Scenarios**: Realistic business scenarios with Given-When-Then

### Example: `parseTelemetryRequested`
```json
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

## 🧪 Step 2: Review the Business BDD Test

### Location
`packages/self-healing/__tests__/business-bdd-handlers/1-parse-telemetry-requested.spec.ts`

### What You'll Find
```typescript
describe('Business BDD: parseTelemetryRequested', () => {
  describe('Scenario: User requests telemetry parsing to investigate recent outage', () => {
    it('should achieve the desired business outcome', async () => {
      // GIVEN (Preconditions - Business Context)
      // - production logs are available
      // - user suspects performance issue

      // TODO: Set up preconditions

      // WHEN (Action - User/System Action)
      // - user triggers telemetry parsing

      // TODO: Execute handler

      // THEN (Expected Outcome - Business Value)
      // - system should validate request
      // - parsing should begin immediately
      // - user should receive confirmation

      // TODO: Verify business outcomes
      expect(true).toBe(true);
    });
  });
});
```

### Your Task
1. Replace TODO comments with actual test code
2. Set up realistic production data
3. Execute the handler
4. Verify business outcomes (not just technical correctness)

## 🧬 Step 3: Implement Unit Tests (TDD)

### Location
`packages/self-healing/__tests__/telemetry.parse.spec.ts`

### Pattern
Each handler has 2 unit tests:
1. **Happy Path** - Normal successful execution
2. **Error Handling** - Error conditions and edge cases

### Example Structure
```typescript
describe('parseTelemetryRequested', () => {
  it('happy path - should validate and accept valid request', () => {
    // Arrange
    const input = { requestId: 'test-123', logsPath: '/var/logs' };
    
    // Act
    const result = parseTelemetryRequested(input);
    
    // Assert
    expect(result).toEqual({
      requestId: 'test-123',
      status: 'started',
      timestamp: expect.any(Number)
    });
  });

  it('error handling - should reject invalid request', () => {
    // Arrange
    const input = { requestId: null }; // Invalid
    
    // Act & Assert
    expect(() => {
      parseTelemetryRequested(input);
    }).toThrow('Invalid request ID');
  });
});
```

### TDD Approach
1. **Red** - Write failing unit tests
2. **Green** - Implement handler to make tests pass
3. **Refactor** - Clean up code while keeping tests green

## 💻 Step 4: Implement the Handler

### Location
`packages/self-healing/src/handlers/telemetry/parse.requested.ts`

### Handler Structure
```typescript
import { HandlerContext, TelemetryParseRequest, TelemetryParseResponse } from '../types/index.js';

/**
 * Parse Telemetry Requested Handler
 * 
 * Business Value: Initiate production log analysis
 * Persona: DevOps Engineer
 * 
 * Validates the telemetry parsing request and initiates the process.
 */
export async function parseTelemetryRequested(
  input: TelemetryParseRequest,
  ctx?: HandlerContext
): Promise<TelemetryParseResponse> {
  // Validate input
  if (!input.requestId) {
    throw new Error('Invalid request ID');
  }

  // Process
  const result = {
    requestId: input.requestId,
    status: 'started',
    timestamp: Date.now()
  };

  // Publish event
  if (ctx?.eventBus) {
    ctx.eventBus.publish({
      event: 'self-healing:telemetry:parse:requested',
      data: result
    });
  }

  return result;
}
```

### Key Principles
- ✅ Pure functions when possible (deterministic, no side effects)
- ✅ Stage-crew handlers for I/O operations (async, side effects)
- ✅ Validate input
- ✅ Publish events
- ✅ Return clear results
- ✅ Handle errors gracefully

## ✅ Step 5: Verify All Tests Pass

### Run Business BDD Test
```bash
npm test -- __tests__/business-bdd-handlers/1-parse-telemetry-requested.spec.ts
```

### Run Unit Tests
```bash
npm test -- __tests__/telemetry.parse.spec.ts
```

### Run All Tests
```bash
npm test
```

### Verify Lint
```bash
npm run lint
```

## 📊 Complete Workflow Checklist

### Phase 1: Understand (30 min)
- [ ] Read business BDD spec in `comprehensive-business-bdd-specifications.json`
- [ ] Understand business value and persona
- [ ] Review realistic scenarios
- [ ] Understand expected outcomes

### Phase 2: Business BDD Test (1 hour)
- [ ] Open business BDD test file
- [ ] Replace TODO comments with actual test code
- [ ] Set up realistic production data
- [ ] Execute handler
- [ ] Verify business outcomes
- [ ] Run test (should fail - handler doesn't exist yet)

### Phase 3: Unit Tests (1 hour)
- [ ] Open unit test file
- [ ] Write failing unit tests (Red)
- [ ] Run tests (should fail)

### Phase 4: Implementation (2-3 hours)
- [ ] Create handler file
- [ ] Implement handler logic (Green)
- [ ] Run unit tests (should pass)
- [ ] Refactor code (Refactor)
- [ ] Run unit tests again (should still pass)

### Phase 5: Verification (30 min)
- [ ] Run business BDD test (should pass)
- [ ] Run unit tests (should pass)
- [ ] Run all tests (should pass)
- [ ] Verify lint (should pass)
- [ ] Code review

### Phase 6: Done (5 min)
- [ ] Commit changes
- [ ] Create PR
- [ ] Get approval
- [ ] Merge

## 🎯 Key Principles

### Business-First
- Start with business BDD spec
- Understand user value
- Verify business outcomes

### TDD
- Write tests first
- Red → Green → Refactor
- Tests drive implementation

### Clean Code
- Pure functions when possible
- Clear error handling
- Event publishing
- Type safety

### Quality
- All tests pass
- Lint passes
- Code review approved
- Ready for production

## 📚 Related Documentation

- `BUSINESS_BDD_HANDLERS_GUIDE.md` - All 67 handler specs
- `BUSINESS_BDD_HANDLERS_LOCATION.md` - Where to find tests
- `UNIT_TEST_STUBS_GUIDE.md` - Unit test structure
- `comprehensive-business-bdd-specifications.json` - Business specs

## 🚀 Example: Implementing `parseTelemetryRequested`

### 1. Read Business Spec
```
Business Value: Initiate production log analysis
Persona: DevOps Engineer
Scenario: User requests telemetry parsing to investigate recent outage
```

### 2. Implement Business BDD Test
```typescript
it('should achieve the desired business outcome', async () => {
  // GIVEN
  ctx.input = {
    requestId: 'outage-2024-01-15',
    logsPath: '/var/logs/production'
  };

  // WHEN
  ctx.output = await ctx.handler(ctx.input);

  // THEN
  expect(ctx.output.status).toBe('started');
  expect(ctx.mocks.eventBus).toHaveBeenCalledWith(
    expect.objectContaining({
      event: 'self-healing:telemetry:parse:requested'
    })
  );
});
```

### 3. Implement Unit Tests
```typescript
it('happy path', () => {
  const result = parseTelemetryRequested({ requestId: 'test-123' });
  expect(result.status).toBe('started');
});

it('error handling', () => {
  expect(() => {
    parseTelemetryRequested({ requestId: null });
  }).toThrow();
});
```

### 4. Implement Handler
```typescript
export function parseTelemetryRequested(input) {
  if (!input.requestId) throw new Error('Invalid request ID');
  return { requestId: input.requestId, status: 'started' };
}
```

### 5. Verify
```bash
npm test -- __tests__/business-bdd-handlers/1-parse-telemetry-requested.spec.ts
npm test -- __tests__/telemetry.parse.spec.ts
npm run lint
```

---

**Workflow**: BDD Spec → Business BDD Test → Unit Tests → Implementation → Verification → Done  
**Time**: ~5 hours per handler  
**Quality**: ✅ Business-focused, TDD-driven, fully tested

