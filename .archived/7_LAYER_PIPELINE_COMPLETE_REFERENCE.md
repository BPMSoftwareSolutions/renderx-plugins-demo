# 7-LAYER DELIVERY PIPELINE - COMPLETE REFERENCE

**Final Model**: 7 Layers (Clean, Business-Focused, Non-Redundant)  
**Date**: November 23, 2025  
**Status**: FINALIZED AND ENFORCED

---

## Overview

The delivery pipeline has **7 essential layers** that ensure every feature is completely implemented end-to-end.

Each layer serves a specific purpose and has specific governance rules.

---

## Layer Details

### LAYER 1: Business BDD Specifications
**Location**: `packages/<feature>/.generated/<feature>-business-bdd-specifications.json`

**What it is**:
- JSON file containing all business requirements
- Written from user/business perspective
- Given-When-Then scenarios
- Business rules

**Who creates it**:
- Product owner (initial definition)
- Or reverse-engineered from code during recovery

**Governance**:
- 🔒 **LOCKED** - Immutable
- Source of truth for business requirements
- Checksum verified in drift detection
- Cannot be modified without approval

**Example structure**:
```json
{
  "feature": "dashboard",
  "scenarios": [
    {
      "id": "SCN-001",
      "title": "Primary Workflow",
      "given": "dashboard is initialized",
      "when": "user requests metrics",
      "then": "metrics are displayed",
      "priority": "CRITICAL"
    }
  ],
  "businessRules": [
    {
      "id": "BR-001",
      "title": "Real-time updates",
      "description": "Dashboard must update every 5 seconds"
    }
  ]
}
```

**Compliance check**:
```javascript
exists(packages/<feature>/.generated/<feature>-business-bdd-specifications.json)
```

---

### LAYER 2: Business BDD Tests
**Location**: `packages/<feature>/__tests__/business-bdd-handlers/`

**What it is**:
- Auto-generated test files
- Verify business BDD scenarios work
- One test per scenario
- Business perspective testing

**Who creates it**:
- AUTO-GENERATED from Layer 1 specifications
- Never manually edited

**Governance**:
- ✅ **AUTO-GENERATED** - Regenerate when specs change
- No manual editing allowed
- Derived from source of truth (Layer 1)
- Must be in sync with Layer 1

**Example test**:
```typescript
describe('Dashboard - Business Requirements', () => {
  it('should display metrics when user requests', () => {
    // GIVEN: dashboard is initialized
    // WHEN: user requests metrics
    // THEN: metrics are displayed
    expect(dashboard.metrics).toBeDefined();
  });
});
```

**Compliance check**:
```javascript
files_exist(packages/<feature>/__tests__/business-bdd-handlers/*.test.ts)
```

---

### LAYER 3: JSON Sequences & Orchestration
**Location**: `packages/<feature>/.generated/<feature>-sequences.json`

**What it is**:
- JSON describing handler execution flow
- State machine definition
- Orchestration rules
- Error handling paths

**Who creates it**:
- Architect/Tech lead (defines workflows)
- Or reverse-engineered from code during recovery

**Governance**:
- 🔒 **LOCKED** - Immutable
- Defines how handlers coordinate
- Checksum verified
- Cannot change without approval

**Example structure**:
```json
{
  "feature": "dashboard",
  "primarySequence": {
    "id": "SEQ-001",
    "handlers": [
      { "id": "initialize", "order": 1, "onSuccess": "loadData" },
      { "id": "loadData", "order": 2, "onSuccess": "render" },
      { "id": "render", "order": 3, "onSuccess": "complete" }
    ]
  },
  "stateManagement": {
    "transitions": [
      { "from": "INIT", "to": "LOADING", "trigger": "start" },
      { "from": "LOADING", "to": "READY", "trigger": "dataLoaded" }
    ]
  }
}
```

**Compliance check**:
```javascript
exists(packages/<feature>/.generated/<feature>-sequences.json)
```

---

### LAYER 4: Handler Definitions
**Location**: `packages/<feature>/src/handlers/*.ts`

**What it is**:
- Implementation code
- Individual handler functions
- Business logic execution
- Could be many handlers (e.g., 67 in self-healing)

**Who creates it**:
- Developer implementing features

**Governance**:
- ✅ **CODE** - Standard version control
- Implements handlers referenced in Layer 3
- Must satisfy Layer 1 requirements
- Tested by Layers 2, 5, 6

**Example handler**:
```typescript
export async function loadData(context: any): Promise<any> {
  try {
    const data = await fetchMetrics();
    return {
      status: 'success',
      data,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    throw new Error(`Failed to load data: ${error.message}`);
  }
}
```

**Compliance check**:
```javascript
files_exist(packages/<feature>/src/handlers/*.ts) &&
count > 0
```

---

### LAYER 5: Unit Tests (TDD)
**Location**: `packages/<feature>/__tests__/unit/`

**What it is**:
- Developer-written unit tests
- Component/hook/service level
- Implementation detail testing
- Edge case coverage

**Who creates it**:
- Developer during implementation (TDD)
- Tests own code

**Governance**:
- ✅ **DEVELOPER-WRITTEN** - TDD approach
- Target 80%+ code coverage
- Tests edge cases and errors
- Verifies implementation details

**Example unit test**:
```typescript
describe('loadData handler', () => {
  it('should handle API errors', async () => {
    const mockFetch = jest.fn().mockRejectedValue(new Error('API Down'));
    const result = await loadData({ fetch: mockFetch });
    expect(result).toEqual({ status: 'error', message: '...' });
  });

  it('should retry on timeout', async () => {
    // Test retry logic
  });

  it('should handle empty data', async () => {
    // Test edge case
  });
});
```

**Compliance check**:
```javascript
files_exist(packages/<feature>/__tests__/unit/*.test.ts) &&
count > 0
```

---

### LAYER 6: Integration Tests
**Location**: `packages/<feature>/__tests__/integration/`

**What it is**:
- End-to-end workflow tests
- Multiple handlers working together
- Complete business process verification
- Cross-handler communication

**Who creates it**:
- Developer after all handlers implemented
- Tests workflows not individual components

**Governance**:
- ✅ **DEVELOPER-WRITTEN** - E2E testing
- Tests complete sequences
- Verifies inter-handler communication
- Tests business workflows

**Example integration test**:
```typescript
describe('Dashboard - End-to-End', () => {
  it('should complete full workflow', async () => {
    const context = {};
    
    // Sequence: initialize → loadData → render
    await initialize(context);
    await loadData(context);
    await render(context);
    
    expect(context.rendered).toBe(true);
    expect(context.metricsVisible).toBe(true);
  });

  it('should handle errors across handlers', async () => {
    // Test error flows
  });
});
```

**Compliance check**:
```javascript
files_exist(packages/<feature>/__tests__/integration/*.test.ts) &&
count > 0
```

---

### LAYER 7: Drift Detection Configuration
**Location**: `packages/<feature>/.generated/<feature>-drift-config.json`

**What it is**:
- Configuration for continuous verification
- Checksums of locked files (Layers 1 & 3)
- Monitoring rules
- Build gate configuration

**Who creates it**:
- AUTO-GENERATED during recovery
- Updated by build system

**Governance**:
- ✅ **AUTO-MAINTAINED** - Build system updates
- Checksums verify Layers 1 & 3 unchanged
- Pre-commit hooks check integrity
- Blocks commits if drift detected

**Example drift config**:
```json
{
  "feature": "dashboard",
  "lockedFiles": [
    {
      "path": ".generated/dashboard-business-bdd-specifications.json",
      "type": "BUSINESS_BDD_SPECIFICATIONS",
      "checksum": "4c17712dbb8505a7...",
      "locked": true
    },
    {
      "path": ".generated/dashboard-sequences.json",
      "type": "JSON_SEQUENCES",
      "checksum": "abc123def456...",
      "locked": true
    }
  ],
  "verification": {
    "frequency": "PRE_COMMIT",
    "actions": ["BLOCK_DRIFT", "REGENERATE_AUTO"]
  }
}
```

**Compliance check**:
```javascript
exists(packages/<feature>/.generated/<feature>-drift-config.json)
```

---

## Compliance Verification

### Check Single Feature
```bash
npm run check:compliance slo-dashboard
```

Output shows:
- Compliance percentage (0-100%)
- Status of each layer (✅ or ❌)
- Missing layers
- Recovery guidance

### Check All Features
```bash
npm run check:compliance
```

Output shows:
- Compliance for each feature
- Overall pipeline health
- Summary statistics

### Enforce Pre-Commit
```bash
npm run enforce:pipeline
```

Blocks commit if:
- Any required layer missing
- Any locked file has drifted
- Any essential artifact deleted

---

## Recovery Process

### Full 7-Layer Recovery
```bash
node scripts/auto-recovery-7-layer.js <feature-name>
```

**Creates**:
- Layer 1: Business specs (from code or template)
- Layer 2: BDD tests (auto-generated from specs)
- Layer 3: JSON sequences (from code or template)
- Layer 4: Handler stubs (if missing)
- Layer 5: Unit test stubs
- Layer 6: Integration test stubs
- Layer 7: Drift detection config

**Output**:
- Recovery report
- Checksums of locked files
- File locations

---

## Pipeline Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    CUSTOMER/BUSINESS                             │
│                    Defines Requirements                           │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │ LAYER 1: Business BDD Specs (LOCKED) │
        │ packages/<feature>/.generated/        │
        │ <feature>-business-bdd-specs.json    │
        └────────────────┬─────────────────────┘
                         │ (Defines business requirements)
                         ▼
      ┌─────────────────────────────────────────────┐
      │ LAYER 2: Business BDD Tests (AUTO-GEN)     │
      │ packages/<feature>/__tests__/business-bdd- │
      │ handlers/*.test.ts                         │
      │ (Verifies business requirements work)      │
      └─────────────────┬──────────────────────────┘
                        │
                        ▼
       ┌────────────────────────────────────────┐
       │ LAYER 3: JSON Sequences (LOCKED)       │
       │ packages/<feature>/.generated/          │
       │ <feature>-sequences.json                │
       │ (Defines handler orchestration)         │
       └────────────────┬───────────────────────┘
                        │
                        ▼
        ┌──────────────────────────────────────┐
        │ LAYER 4: Handler Definitions (CODE)  │
        │ packages/<feature>/src/handlers/      │
        │ *.ts                                  │
        │ (Implements business logic)           │
        └────────────────┬─────────────────────┘
                         │
        ┌────────────────┴─────────────────┐
        │                                  │
        ▼                                  ▼
 ┌────────────────────┐           ┌──────────────────────┐
 │ LAYER 5: Unit     │           │ LAYER 6: Integration │
 │ Tests (TDD)       │           │ Tests (E2E)          │
 │ __tests__/unit/   │           │ __tests__/integration│
 │ (Component-level) │           │ (Workflow-level)     │
 └────────────────────┘           └──────────────────────┘
        │                                  │
        └────────────────┬─────────────────┘
                         │
                         ▼
        ┌────────────────────────────────────────┐
        │ LAYER 7: Drift Detection (AUTO)        │
        │ packages/<feature>/.generated/          │
        │ <feature>-drift-config.json             │
        │ (Continuous verification)              │
        └────────────────────────────────────────┘
                         │
                         ▼
        ┌────────────────────────────────────────┐
        │        PRE-COMMIT ENFORCEMENT          │
        │ Blocks commit if any layer missing     │
        │ or locked files have drifted           │
        └────────────────────────────────────────┘
```

---

## Governance Rules

### LOCKED Layers (1 & 3)
- 🔒 **Immutable after creation**
- Source of truth
- Checksums verified
- Changes require approval
- Build gates protect them

### Auto-Generated Layers (2 & 7)
- ✅ **Regenerated when source changes**
- Never manually edited
- Derived from locked layers
- Keep in sync automatically
- Should never need manual updates

### Developer Layers (4, 5, 6)
- 👨‍💻 **Written by developers**
- Standard code governance
- Subject to code review
- Version controlled
- Tested by CI/CD

---

## Complete Example: Self-Healing Package

The `packages/self-healing/` package demonstrates a feature with all 7 layers complete:

```
packages/self-healing/
├── .generated/
│   ├── comprehensive-business-bdd-specifications.json (Layer 1) ✅
│   ├── sequences/ (Layer 3) ✅
│   └── <feature>-drift-config.json (Layer 7) ✅
│
├── __tests__/
│   ├── business-bdd-handlers/ (Layer 2) ✅
│   │   └── [67 handler tests, auto-generated]
│   ├── business-bdd/ (Layer 2) ✅
│   │   └── [7 sequence tests, auto-generated]
│   ├── unit/ (Layer 5) ✅
│   │   └── [Unit tests for implementation]
│   └── integration/ (Layer 6) ✅
│       └── [End-to-end workflow tests]
│
└── src/
    ├── handlers/ (Layer 4) ✅
    │   ├── parseTelemetryRequested.ts
    │   ├── extractMetrics.ts
    │   ├── analyzePatterns.ts
    │   └── [67 total handlers]
    └── ...
```

**Result**: 100% compliant with all 7 layers

---

## Summary

| Layer | Type | Location | Governance | Owner |
|-------|------|----------|------------|-------|
| 1 | Business Specs | `.generated/*-business-bdd-specs.json` | 🔒 LOCKED | Product Owner |
| 2 | Business Tests | `__tests__/business-bdd-handlers/` | ✅ AUTO | Generator |
| 3 | JSON Sequences | `.generated/*-sequences.json` | 🔒 LOCKED | Architect |
| 4 | Handler Code | `src/handlers/` | 👨‍💻 CODE | Developer |
| 5 | Unit Tests | `__tests__/unit/` | 👨‍💻 TDD | Developer |
| 6 | Integration Tests | `__tests__/integration/` | 👨‍💻 E2E | Developer |
| 7 | Drift Config | `.generated/*-drift-config.json` | ✅ AUTO | Build System |

**All 7 layers required for 100% compliance**

---

## Key Principles

✅ **Single Source of Truth**: Business specs (Layer 1)  
✅ **Automation**: Auto-generate what can be auto-generated (Layers 2, 7)  
✅ **Immutability**: Lock specifications (Layers 1, 3)  
✅ **Business Focus**: All layers verify business value  
✅ **Developer Responsibility**: Code and tests (Layers 4, 5, 6)  
✅ **Continuous Verification**: Drift detection (Layer 7)  
✅ **Complete Coverage**: All layers required, none optional
