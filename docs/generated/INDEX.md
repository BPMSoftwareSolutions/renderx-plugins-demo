# System Documentation Index

**Generated**: 2025-11-22T16:25:28.165Z

## 📊 System Overview

| Metric | Value |
|--------|-------|
| **Plugins** | 9 |
| **Sequences** | 54 |
| **Handlers** | 423 |
| **Test Files** | 186 |
| **Total Tests** | 1425 |
| **Test Coverage** | 66% |
| **Handlers with Tests** | 146 |
| **Handlers without Tests** | 76 |

## 📚 Documentation Files

### 1. [HANDLER_SPECS.md](./HANDLER_SPECS.md)
Complete handler specifications with test coverage details.
- All 423 handlers listed
- Test files and test descriptions for each handler
- Function parameters and async status
- **Use this to**: Find what a handler does and what tests cover it

### 2. [SEQUENCE_FLOWS.md](./SEQUENCE_FLOWS.md)
Orchestration sequences and their handler flows.
- All 54 sequences documented
- Handler beats and timing information
- Event flow and handler kinds (pure, io, stage-crew)
- **Use this to**: Understand how sequences orchestrate handlers

### 3. [TEST_SPECS.md](./TEST_SPECS.md)
Complete test specifications organized by plugin.
- 186 test files
- 1425 test descriptions
- Test organization by plugin and feature
- **Use this to**: Find tests for a specific feature or plugin

### 4. [HANDLER_TRACEABILITY.md](./HANDLER_TRACEABILITY.md)
Complete handler-to-test mapping with all test descriptions.
- Every handler with tests listed
- All test descriptions that cover each handler
- Full traceability from handler to test
- **Use this to**: Trace a handler to all its tests

### 5. [PLUGIN_COVERAGE.md](./PLUGIN_COVERAGE.md)
Test coverage analysis by plugin.
- Coverage percentage per plugin
- Handler count and test count per plugin
- **Use this to**: Identify which plugins need more tests

### 6. [UNTESTED_HANDLERS.md](./UNTESTED_HANDLERS.md)
Handlers that need test coverage.
- 76 handlers without tests
- Function signatures and parameters
- Organized by plugin
- **Use this to**: Find handlers that need tests

## 🎯 Quick Navigation

### By Task

**I want to understand a handler:**
1. Search in [HANDLER_SPECS.md](./HANDLER_SPECS.md)
2. Check [HANDLER_TRACEABILITY.md](./HANDLER_TRACEABILITY.md) for tests

**I want to understand a sequence:**
1. Look in [SEQUENCE_FLOWS.md](./SEQUENCE_FLOWS.md)
2. Check [TEST_SPECS.md](./TEST_SPECS.md) for related tests

**I want to find tests for a feature:**
1. Search in [TEST_SPECS.md](./TEST_SPECS.md)
2. Check [HANDLER_TRACEABILITY.md](./HANDLER_TRACEABILITY.md) for handler coverage

**I want to improve test coverage:**
1. Check [PLUGIN_COVERAGE.md](./PLUGIN_COVERAGE.md) for coverage by plugin
2. Review [UNTESTED_HANDLERS.md](./UNTESTED_HANDLERS.md) for priority handlers

## 📈 Coverage Summary

### By Handler Type
- **Sequence-Defined Handlers**: 87 (74% coverage)
- **Internal Implementation**: 135 (61% coverage)

### By Plugin
See [PLUGIN_COVERAGE.md](./PLUGIN_COVERAGE.md) for detailed breakdown.

## 🔍 Data Quality

This documentation is **automatically generated** from:
- ✅ Actual test files and test descriptions
- ✅ Handler implementations and signatures
- ✅ Sequence definitions and orchestration flows
- ✅ Comprehensive audit data

**Everything is traceable to source code.**

---

*Last updated: 2025-11-22T16:25:28.166Z*
