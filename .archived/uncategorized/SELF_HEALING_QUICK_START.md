# 🚀 Self-Healing System - Quick Start Guide

## What Is This?

A complete, autonomous system that:
1. **Parses** production telemetry from logs
2. **Detects** anomalies (performance, behavioral, coverage, errors)
3. **Diagnoses** root causes
4. **Generates** fixes (code, tests, docs)
5. **Validates** fixes
6. **Deploys** fixes automatically
7. **Learns** from results

## Project Structure

```
packages/self-healing/
├── src/
│   ├── handlers/          ← 67 handlers to implement
│   ├── types/             ← Type definitions
│   ├── plugin.ts          ← Plugin registration
│   └── index.ts           ← Main entry point
├── __tests__/             ← Test files (to create)
├── json-sequences/        ← 7 sequences (already defined)
├── docs/                  ← Documentation
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── README.md
```

## Getting Started

### 1. Install Dependencies
```bash
cd packages/self-healing
npm install
```

### 2. Understand the Architecture
- **7 Sequences**: telemetry → anomaly → diagnosis → fix → validation → deployment → learning
- **67 Handlers**: 7-11 handlers per sequence
- **150+ Tests**: TDD approach - write tests first

### 3. Start with Phase 1: Telemetry Parsing

#### Step 1: Create Test File
```bash
touch __tests__/telemetry.parse.spec.ts
```

#### Step 2: Write Tests
Read: `docs/SELF_HEALING_TEST_SPECIFICATIONS.md`

Copy test cases for telemetry parsing:
```typescript
describe('Telemetry Parsing', () => {
  describe('parseTelemetryRequested', () => {
    it('should validate telemetry parsing request', () => {
      const input = { requestId: 'req-123' };
      const result = parseTelemetryRequested(input);
      expect(result).toEqual({
        requestId: 'req-123',
        status: 'started'
      });
    });
  });
});
```

#### Step 3: Implement Handlers
Create handler files in `src/handlers/telemetry/`:
- `parse.requested.ts`
- `load.logs.ts`
- `extract.events.ts`
- `normalize.data.ts`
- `aggregate.metrics.ts`
- `store.database.ts`
- `parse.completed.ts`

#### Step 4: Run Tests
```bash
npm run test
npm run test:coverage
```

### 4. Move to Next Phases
Repeat for each sequence:
- Phase 2: Anomaly Detection (9 handlers)
- Phase 3: Diagnosis (11 handlers)
- Phase 4: Fix Generation (9 handlers)
- Phase 5: Validation (10 handlers)
- Phase 6: Deployment (11 handlers)
- Phase 7: Learning (10 handlers)

## Key Files to Read

1. **IMPLEMENTATION_ROADMAP.md** - 8-week plan
2. **docs/SELF_HEALING_HANDLERS_SPECIFICATION.md** - Handler specs
3. **docs/SELF_HEALING_TEST_SPECIFICATIONS.md** - Test specs
4. **docs/SELF_HEALING_TDD_IMPLEMENTATION_GUIDE.md** - Implementation guide

## Commands

```bash
# Install dependencies
npm install

# Run tests
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# Type checking
npm run type-check

# Linting
npm run lint

# Build
npm run build
```

## Handler Structure

Each handler should follow this pattern:

```typescript
// src/handlers/telemetry/parse.requested.ts
import { Handler } from '@renderx-plugins/host-sdk';

export const parseTelemetryRequested: Handler = async (input) => {
  // Validate input
  if (!input.requestId) {
    throw new Error('Invalid request ID');
  }

  // Process
  return {
    requestId: input.requestId,
    status: 'started',
    timestamp: new Date().toISOString()
  };
};
```

## Test Structure

Each test file should follow this pattern:

```typescript
// __tests__/telemetry.parse.spec.ts
import { describe, it, expect } from 'vitest';
import { parseTelemetryRequested } from '../src/handlers/telemetry/parse.requested';

describe('Telemetry Parsing', () => {
  describe('parseTelemetryRequested', () => {
    it('should validate telemetry parsing request', () => {
      const input = { requestId: 'req-123' };
      const result = parseTelemetryRequested(input);
      expect(result).toEqual({
        requestId: 'req-123',
        status: 'started'
      });
    });

    it('should handle invalid request ID', () => {
      const input = { requestId: '' };
      expect(() => parseTelemetryRequested(input))
        .toThrow('Invalid request ID');
    });
  });
});
```

## Success Criteria

✅ All 67 handlers implemented
✅ 150+ tests passing
✅ 95%+ code coverage
✅ All sequences working end-to-end
✅ Real production logs processed
✅ Anomalies detected accurately
✅ Fixes generated and deployed

## Timeline

- **Week 1-2**: Telemetry Parsing
- **Week 2-3**: Anomaly Detection
- **Week 3-4**: Diagnosis
- **Week 4-5**: Fix Generation
- **Week 5-6**: Validation
- **Week 6-7**: Deployment
- **Week 7-8**: Learning

**Total**: 90-110 hours, 2-3 developers, 8 weeks

## Need Help?

1. Read the documentation in `docs/`
2. Check the handler specifications
3. Review test specifications
4. Look at existing plugin implementations in `packages/`

---

**Ready to build the future? Start with Phase 1!**

