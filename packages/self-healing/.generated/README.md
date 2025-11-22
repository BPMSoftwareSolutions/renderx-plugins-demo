# Self-Healing System BDD Testing Framework

## 🎯 Overview

This directory contains comprehensive BDD (Behavior-Driven Development) specifications and test files for the self-healing system plugin. Tests are organized in three layers, each focusing on a different aspect of the system.

## 📊 What's Included

### Specifications (JSON)

1. **business-bdd-specifications.json** (10.59 KB)
   - 7 user stories from end-user perspective
   - 14 realistic business scenarios
   - 3 personas: DevOps Engineer, Platform Team, Engineering Manager
   - Format: "As a [persona], I want to [do something] so that [goal]"

2. **bdd-specifications.json** (116.88 KB)
   - 67 handlers across 7 sequences
   - 201 scenarios (3 per handler)
   - Technical focus: happy path, error handling, edge cases

3. **proposed-tests.json** (26.96 KB)
   - Test file structure and organization
   - 134 test cases (2 per handler)
   - Ready for implementation

### Test Files

#### Business BDD Tests (`__tests__/business-bdd/`)
- 7 test files with user story format
- 14 scenarios with realistic business context
- Focus: User value and measurable outcomes

#### Technical BDD Tests (`__tests__/bdd/`)
- 7 test files organized by sequence
- 201 scenarios with handler-level detail
- Focus: Handler behavior and orchestration

#### Unit Tests (`__tests__/`)
- 7 test files (one per sequence)
- 134 test cases with TODO comments
- Focus: Implementation details

## 🚀 Quick Start

### View Specifications
```bash
# Business perspective
cat .generated/business-bdd-specifications.json

# Technical perspective
cat .generated/bdd-specifications.json

# Test structure
cat .generated/proposed-tests.json
```

### Run Tests
```bash
# All tests
npm test

# Business BDD only
npm test -- __tests__/business-bdd

# Technical BDD only
npm test -- __tests__/bdd

# Unit tests only
npm test -- __tests__/*.spec.ts

# Watch mode
npm test -- --watch

# Coverage
npm test -- --coverage
```

## 📋 Test Organization

### Layer 1: Business BDD (User Perspective)
```
As a DevOps Engineer
I want to automatically detect anomalies in production
So that I can be alerted to issues before they become critical

Scenario: Detect performance degradation
  Given telemetry shows handler latencies exceeding baseline
  When the anomaly detection sequence analyzes the telemetry
  Then performance anomalies should be identified with severity
```

### Layer 2: Technical BDD (Handler Perspective)
```
Handler: detectAnomaliesRequested
Scenario: happy path
  Given detectAnomaliesRequested is invoked with valid input
  When handler executes with correct context
  Then handler should process successfully
```

### Layer 3: Unit Tests (Implementation Perspective)
```
describe('detectAnomaliesRequested', () => {
  it('should validate request and emit event', () => {
    // TODO: Implement test
  });
});
```

## 📈 Coverage Summary

| Layer | Files | Scenarios | Focus |
|-------|-------|-----------|-------|
| Business BDD | 7 | 14 | User value |
| Technical BDD | 7 | 201 | Handler behavior |
| Unit Tests | 7 | 134 | Implementation |
| **Total** | **21** | **349** | **Complete** |

## 🔧 Generation Scripts

Located in `scripts/`:

1. `generate-business-bdd-specs.js` - Business specifications
2. `generate-business-bdd-test-files.js` - Business test files
3. `generate-bdd-specifications.js` - Technical specifications
4. `generate-bdd-test-files.js` - Technical test files
5. `generate-self-healing-tests.js` - Test structure
6. `generate-self-healing-test-stubs.js` - Unit test stubs

## 📚 Documentation

- **BDD_TESTING_STRATEGY.md** - Complete testing strategy
- **DELIVERABLES_SUMMARY.md** - What was created
- **This README** - Quick reference

## ✅ Key Principles

1. **User-Centric**: Tests focus on user value, not implementation
2. **Realistic**: Scenarios use production-like data
3. **Measurable**: Tests verify quantifiable outcomes
4. **Layered**: Tests organized by abstraction level
5. **Maintainable**: Clear structure and documentation
6. **Automated**: Generated from JSON specifications
7. **TDD-Ready**: All tests ready for implementation

## 🎯 Next Steps

1. Implement business BDD tests (validate business value)
2. Implement technical BDD tests (validate handler behavior)
3. Implement unit tests (validate implementation)
4. Run full test suite (achieve 80%+ coverage)
5. Validate with production logs

## 📞 Support

For questions about the BDD testing strategy, see:
- `BDD_TESTING_STRATEGY.md` - Testing approach
- `DELIVERABLES_SUMMARY.md` - What was created
- `business-bdd-specifications.json` - User stories
- `bdd-specifications.json` - Technical specs

