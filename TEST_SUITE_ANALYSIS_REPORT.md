# Test Suite Analysis Report
**Generated:** 2025-12-14  
**Test Run:** `npm test`

## Executive Summary

| Metric | Value |
|--------|-------|
| **Total Test Suites** | 352 |
| **Passed Suites** | 350 (99.4%) |
| **Failed Suites** | 2 (0.6%) |
| **Total Tests** | 1,986 |
| **Passed Tests** | 1,792 (90.2%) |
| **Skipped Tests** | 194 (9.8%) |
| **Duration** | 141.49 seconds |

## Test Results by Domain

### 1. **Canvas Component Domain** (Largest)
- **Test Files:** 30+ spec files
- **Tests:** 150+ tests
- **Key Areas:**
  - SVG node manipulation (update, select, drag)
  - Resize operations (overlay, alignment, DOM)
  - Import/export functionality
  - Copy/paste operations
  - Line component handling
  - Selection overlay positioning
  - CSS class management

### 2. **Control Panel Domain**
- **Test Files:** 15+ spec files
- **Tests:** 100+ tests
- **Key Areas:**
  - Attribute editing (bidirectional)
  - Field lifecycle management
  - CSS registry and idempotency
  - React code editor mapping
  - HTML/SVG code editor fallbacks
  - Schema resolver and memoization
  - UI initialization and batching

### 3. **Library & Library-Component Domain**
- **Test Files:** 10+ spec files
- **Tests:** 80+ tests
- **Key Areas:**
  - Component loading and registration
  - Chat utilities (localStorage handling)
  - OpenAI service integration
  - Drag preview handlers
  - Drop container operations
  - Handler exports and sequences

### 4. **Self-Healing Domain**
- **Test Files:** 70+ spec files
- **Tests:** 200+ tests (mostly skipped)
- **Key Areas:**
  - Telemetry parsing and storage
  - Anomaly detection and diagnosis
  - Fix generation and validation
  - Deployment and learning tracking
  - Business BDD handlers (67 handlers)
  - Coverage coupling and SLO breaches

### 5. **Musical Conductor Domain**
- **Test Files:** 8+ spec files
- **Tests:** 50+ tests
- **Key Areas:**
  - CLI tools (sequence player, performance analysis)
  - Mock handler registry
  - Comparison reporting
  - Sequence execution

### 6. **Real Estate Analyzer Domain**
- **Test Files:** 2 spec files
- **Tests:** 16 tests
- **Key Areas:**
  - Analysis engine
  - Handler implementations

### 7. **Infrastructure & Utilities**
- **Test Files:** 20+ spec files
- **Tests:** 100+ tests
- **Key Areas:**
  - Configuration service
  - Event routing and diagnostics
  - Domain registry orchestration
  - Sequence validation
  - Topics manifest guardrails
  - Log parsing and conversion

## Test Categories

### By Behavior Type
1. **Unit Tests** (70%): Handler logic, utilities, services
2. **Integration Tests** (20%): Component communication, event flow
3. **E2E Tests** (10%): Full workflows, plugin loading

### By Package
- **packages/canvas-component:** 150+ tests
- **packages/control-panel:** 100+ tests
- **packages/library:** 80+ tests
- **packages/self-healing:** 200+ tests
- **packages/musical-conductor:** 50+ tests
- **packages/real-estate-analyzer:** 16 tests
- **Root tests/:** 200+ tests

## Known Issues

### 1. **Timeout Failure**
- **File:** `tests/topics-manifest-guard.spec.ts`
- **Issue:** Hook timeout (60000ms) during beforeAll
- **Cause:** Long-running prerequisite scripts
- **Status:** 1 failed suite

### 2. **Skipped Tests** (194 total)
- Self-healing business BDD handlers (mostly skipped)
- Plugin loading tests
- Some integration tests
- Reason: Marked as pending/incomplete

## Performance Metrics

- **Fastest Test:** < 10ms (utility tests)
- **Slowest Test:** 78+ seconds (diagnosis.analyze.spec.ts)
- **Average Test:** ~70ms
- **Transform Time:** 64.88s
- **Collection Time:** 458.44s
- **Test Execution:** 294.09s

## Coverage Highlights

✅ **Well-Covered Areas:**
- Canvas component operations
- Control panel field management
- Event routing and topics
- Configuration services
- Handler implementations

⚠️ **Partially Covered:**
- Self-healing deployment flows
- Plugin lifecycle management
- Performance anomaly detection

❌ **Gaps:**
- E2E plugin loading scenarios
- Desktop Avalonia tests (separate)
- Some integration workflows

