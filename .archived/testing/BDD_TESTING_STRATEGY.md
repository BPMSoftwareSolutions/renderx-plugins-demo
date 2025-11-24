# BDD Testing Strategy for Self-Healing System

## Overview

This document describes the behavior-driven development (BDD) testing strategy for the self-healing system plugin. Tests are organized in three layers, each serving a specific purpose.

## Three Layers of BDD Testing

### 1. Business BDD Tests (`__tests__/business-bdd/`)

**Purpose**: Validate business value and user outcomes from end-user perspective

**Personas**:
- DevOps Engineer: Wants to detect and fix production issues automatically
- Platform Team: Wants to reduce MTTR and improve system reliability  
- Engineering Manager: Wants to track effectiveness and learn from incidents

**Format**: User stories with realistic scenarios

```
As a [Persona]
I want to [do something]
So that [business goal is achieved]

Scenario: [Realistic business scenario]
  Given [preconditions from user perspective]
  When [user action]
  Then [measurable business outcome]
```

**Example**:
```
As a DevOps Engineer
I want to automatically detect anomalies in production
So that I can be alerted to issues before they become critical

Scenario: Detect performance degradation
  Given telemetry shows handler latencies exceeding baseline
  When the anomaly detection sequence analyzes the telemetry
  Then performance anomalies should be identified with severity assessment
```

**Files**: 7 test files, 14 scenarios
- `1-i-want-to-parse-production-logs-to-under.spec.ts`
- `2-i-want-to-automatically-detect-anomalies.spec.ts`
- `3-i-want-to-understand-root-causes-of-prod.spec.ts`
- `4-i-want-to-automatically-generate-fixes-f.spec.ts`
- `5-i-want-to-validate-fixes-before-deployin.spec.ts`
- `6-i-want-to-safely-deploy-validated-fixes-.spec.ts`
- `7-i-want-to-track-the-effectiveness-of-fix.spec.ts`

### 2. Technical BDD Tests (`__tests__/bdd/`)

**Purpose**: Validate handler behavior and sequence orchestration

**Format**: Handler-focused scenarios with Given-When-Then

**Files**: 7 test files, 201 scenarios (3 per handler)
- `self-healing-telemetry-parse-symphony.bdd.spec.ts`
- `self-healing-anomaly-detect-symphony.bdd.spec.ts`
- `self-healing-diagnosis-analyze-symphony.bdd.spec.ts`
- `self-healing-fix-generate-symphony.bdd.spec.ts`
- `self-healing-validation-run-symphony.bdd.spec.ts`
- `self-healing-deployment-deploy-symphony.bdd.spec.ts`
- `self-healing-learning-track-symphony.bdd.spec.ts`

### 3. Unit Tests (`__tests__/`)

**Purpose**: Validate individual handler implementation

**Files**: 7 test files (one per sequence)
- `telemetry.parse.spec.ts` (7 handlers, 14 tests)
- `anomaly.detect.spec.ts` (9 handlers, 18 tests)
- `diagnosis.analyze.spec.ts` (11 handlers, 22 tests)
- `fix.generate.spec.ts` (9 handlers, 18 tests)
- `validation.run.spec.ts` (10 handlers, 20 tests)
- `deployment.deploy.spec.ts` (11 handlers, 22 tests)
- `learning.track.spec.ts` (10 handlers, 20 tests)

## BDD Specification Documents

### Generated Specifications

1. **business-bdd-specifications.json**
   - 7 user stories
   - 14 realistic scenarios
   - Organized by persona and business goal

2. **bdd-specifications.json**
   - 67 handlers
   - 201 scenarios (3 per handler: happy path, error handling, edge case)
   - Organized by sequence

3. **proposed-tests.json**
   - 67 handlers
   - 134 test cases (2 per handler: happy path, error handling)
   - Test file structure and organization

## Testing Workflow

### Phase 1: Business Validation
1. Review business BDD specifications
2. Implement business BDD tests
3. Verify business outcomes are achievable

### Phase 2: Technical Implementation
1. Review technical BDD specifications
2. Implement handler logic
3. Verify handlers pass BDD tests

### Phase 3: Unit Testing
1. Write unit tests for each handler
2. Achieve 80%+ code coverage
3. Verify edge cases and error handling

## Running Tests

```bash
# Run all tests
npm test

# Run business BDD tests only
npm test -- __tests__/business-bdd

# Run technical BDD tests only
npm test -- __tests__/bdd

# Run unit tests only
npm test -- __tests__/*.spec.ts

# Watch mode
npm test -- --watch

# Coverage report
npm test -- --coverage
```

## Key Principles

1. **User-Centric**: Business BDD tests focus on user value, not implementation
2. **Realistic**: Scenarios use production-like data and conditions
3. **Measurable**: Tests verify quantifiable outcomes (latency, error rates, etc.)
4. **Layered**: Tests organized by abstraction level (business → technical → unit)
5. **Maintainable**: Clear structure makes tests easy to understand and update

## Next Steps

1. Implement business BDD tests first (validate business value)
2. Implement technical BDD tests (validate handler behavior)
3. Implement unit tests (validate implementation details)
4. Run full test suite and achieve 80%+ coverage
5. Validate with production logs

