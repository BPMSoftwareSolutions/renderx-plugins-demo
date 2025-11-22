# Quick Start: Implement a Handler (5-Minute Overview)

## 🎯 The Workflow

```
BDD Spec → Business BDD Test → Unit Tests → Implementation → Verify → Done
```

## 📋 Quick Checklist

### 1️⃣ Understand (5 min)
```bash
# Read the business spec
cat packages/self-healing/.generated/comprehensive-business-bdd-specifications.json | grep -A 20 "parseTelemetryRequested"
```

**What to look for**:
- Handler name
- Business value
- Persona
- Realistic scenarios

### 2️⃣ Business BDD Test (15 min)
```bash
# Open the business BDD test
code packages/self-healing/__tests__/business-bdd-handlers/1-parse-telemetry-requested.spec.ts
```

**What to do**:
- Replace TODO comments with actual test code
- Set up realistic production data
- Execute handler
- Verify business outcomes

**Run it**:
```bash
npm test -- __tests__/business-bdd-handlers/1-parse-telemetry-requested.spec.ts
```

### 3️⃣ Unit Tests (30 min)
```bash
# Open the unit test file
code packages/self-healing/__tests__/telemetry.parse.spec.ts
```

**What to do**:
- Write 2 tests per handler (happy path + error handling)
- Make tests fail first (Red)
- Run tests

**Run it**:
```bash
npm test -- __tests__/telemetry.parse.spec.ts
```

### 4️⃣ Implementation (2-3 hours)
```bash
# Create handler file
code packages/self-healing/src/handlers/telemetry/parse.requested.ts
```

**What to do**:
- Implement handler logic
- Make unit tests pass (Green)
- Refactor code (Refactor)

**Run it**:
```bash
npm test -- __tests__/telemetry.parse.spec.ts
```

### 5️⃣ Verify (15 min)
```bash
# Run all tests
npm test

# Verify lint
npm run lint
```

**What to check**:
- ✅ Business BDD test passes
- ✅ Unit tests pass
- ✅ All tests pass
- ✅ Lint passes

### 6️⃣ Done (5 min)
```bash
# Commit and push
git add .
git commit -m "feat: implement parseTelemetryRequested handler"
git push origin feature/parse-telemetry-requested
```

## 📁 Key Files

| File | Purpose |
|------|---------|
| `comprehensive-business-bdd-specifications.json` | Business specs for all 67 handlers |
| `__tests__/business-bdd-handlers/` | Business BDD tests (67 files) |
| `__tests__/telemetry.parse.spec.ts` | Unit test stubs |
| `src/handlers/telemetry/parse.requested.ts` | Handler implementation |

## 🚀 Commands

```bash
# Run business BDD test for specific handler
npm test -- __tests__/business-bdd-handlers/1-parse-telemetry-requested.spec.ts

# Run unit tests for sequence
npm test -- __tests__/telemetry.parse.spec.ts

# Run all tests
npm test

# Verify lint
npm run lint

# Watch mode (auto-run tests on file change)
npm test -- --watch
```

## 🎯 Handler Structure

```typescript
import { HandlerContext, TelemetryParseRequest, TelemetryParseResponse } from '../types/index.js';

export async function parseTelemetryRequested(
  input: TelemetryParseRequest,
  ctx?: HandlerContext
): Promise<TelemetryParseResponse> {
  // 1. Validate input
  if (!input.requestId) {
    throw new Error('Invalid request ID');
  }

  // 2. Process
  const result = {
    requestId: input.requestId,
    status: 'started',
    timestamp: Date.now()
  };

  // 3. Publish event
  if (ctx?.eventBus) {
    ctx.eventBus.publish({
      event: 'self-healing:telemetry:parse:requested',
      data: result
    });
  }

  // 4. Return result
  return result;
}
```

## ✅ Quality Checklist

Before marking done:
- [ ] Business BDD test passes
- [ ] Unit tests pass (happy path + error handling)
- [ ] All tests pass (`npm test`)
- [ ] Lint passes (`npm run lint`)
- [ ] Code is reviewed
- [ ] Code is approved
- [ ] Code is merged

## 📚 Full Documentation

For detailed information, see:
- `HANDLER_IMPLEMENTATION_WORKFLOW.md` - Complete workflow guide
- `AGENT_HANDLER_IMPLEMENTATION_WORKFLOW.feature` - BDD spec of workflow
- `BUSINESS_BDD_HANDLERS_GUIDE.md` - All 67 handler specs
- `UNIT_TEST_STUBS_GUIDE.md` - Unit test structure

## 🎓 Example: Implement `parseTelemetryRequested`

### Step 1: Read Business Spec
```
Business Value: Initiate production log analysis
Persona: DevOps Engineer
Scenario: User requests telemetry parsing to investigate recent outage
```

### Step 2: Implement Business BDD Test
```typescript
it('should achieve the desired business outcome', async () => {
  ctx.input = { requestId: 'outage-2024-01-15', logsPath: '/var/logs' };
  ctx.output = await ctx.handler(ctx.input);
  expect(ctx.output.status).toBe('started');
  expect(ctx.mocks.eventBus).toHaveBeenCalled();
});
```

### Step 3: Implement Unit Tests
```typescript
it('happy path', () => {
  const result = parseTelemetryRequested({ requestId: 'test-123' });
  expect(result.status).toBe('started');
});

it('error handling', () => {
  expect(() => parseTelemetryRequested({ requestId: null })).toThrow();
});
```

### Step 4: Implement Handler
```typescript
export function parseTelemetryRequested(input) {
  if (!input.requestId) throw new Error('Invalid request ID');
  return { requestId: input.requestId, status: 'started', timestamp: Date.now() };
}
```

### Step 5: Verify
```bash
npm test
npm run lint
```

---

**Time**: ~5 hours per handler  
**Quality**: ✅ Business-focused, TDD-driven, fully tested  
**Ready**: ✅ YES

