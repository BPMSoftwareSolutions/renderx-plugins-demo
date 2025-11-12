# OgraphX Testing Strategy

## Overview

This document outlines the comprehensive testing strategy for OgraphX's Self-Aware System (SAS), ensuring self-testing capabilities throughout the continuous delivery pipeline.

## Testing Pyramid

```
        ┌─────────────────┐
        │  E2E Tests      │  (1-2 tests)
        │  Full Pipeline  │
        ├─────────────────┤
        │ Integration     │  (5-10 tests)
        │ Tests           │
        ├─────────────────┤
        │ Unit Tests      │  (50+ tests)
        │ Per Layer       │
        └─────────────────┘
```

## Layer-Specific Testing

### Layer 1: Core (Extraction)

**Unit Tests** for `ographx_ts.py` and `ographx_py.py`:

1. **Symbol Extraction**
   - Function declarations (regular, arrow, const)
   - Class declarations
   - Method extraction
   - Export detection
   - Parameter contracts

2. **Call Resolution**
   - Same-file calls
   - Cross-file calls (via imports)
   - Scope-aware resolution
   - Unresolved calls

3. **Type Handling**
   - Generics (T<U>, T<U,V>)
   - Union types (T | U)
   - Complex types (Partial<T>, T[])
   - Type normalization

4. **Import Graph**
   - Import parsing
   - Alias resolution
   - Cross-file mapping
   - Circular imports

**Test Data**: Fixture files with known structure

### Layer 3: Sequences (Compilation)

**Unit Tests** for `generate_self_sequences.py`:

1. **Call Graph Building**
   - Graph construction from IR
   - Edge creation
   - Cycle detection

2. **DFS Traversal**
   - Depth limiting (max 3)
   - Visited tracking
   - Chain building

3. **Sequence Generation**
   - Movement creation
   - Beat generation
   - Dynamics assignment
   - Tempo calculation

**Contract Validation**:
- Input: Valid IR (self_graph.json)
- Output: Valid sequences (self_sequences.json)
- Schema validation

### Layer 4: Visualization (Diagrams)

**Unit Tests** for diagram generators:

1. **Mermaid Generation**
   - Diagram structure
   - Node creation
   - Edge creation
   - Syntax validation

2. **SVG Conversion**
   - API conversion
   - CLI conversion
   - File I/O
   - Error handling

**Contract Validation**:
- Input: Valid Mermaid markdown
- Output: Valid SVG files
- Diagram completeness

### Layer 5: Analysis (Telemetry)

**Unit Tests** for analysis tools:

1. **Metrics Extraction**
   - Symbol counting
   - Call counting
   - Contract analysis
   - Complexity metrics

2. **Data Aggregation**
   - Grouping
   - Sorting
   - Filtering
   - Summarization

**Contract Validation**:
- Input: Valid IR
- Output: Accurate metrics
- Consistency checks

## Integration Tests

**End-to-End Pipeline**:

1. **Full Regeneration**
   - Extract IR from source
   - Generate sequences
   - Generate diagrams
   - Convert to SVG
   - Extract telemetry
   - Validate all outputs

2. **Data Flow Validation**
   - IR → Sequences
   - Sequences → Diagrams
   - Diagrams → SVG
   - All → Telemetry

3. **Contract Chaining**
   - Each layer's output matches next layer's input
   - No data loss
   - Consistency maintained

## Test Execution

### Local Testing

```bash
# Run all tests
pytest packages/ographx/tests/ -v

# Run specific layer tests
pytest packages/ographx/tests/test_core.py -v
pytest packages/ographx/tests/test_generators.py -v
pytest packages/ographx/tests/test_analysis.py -v

# Run with coverage
pytest packages/ographx/tests/ --cov=packages/ographx --cov-report=html
```

### CI/CD Testing

- Run on every commit
- Run on every PR
- Generate coverage reports
- Block merge if coverage < 80%

## Test Coverage Goals

- **Core Layer**: 90%+ coverage
- **Generators**: 85%+ coverage
- **Analysis**: 85%+ coverage
- **Overall**: 85%+ coverage

## Self-Testing Capabilities

1. **Self-Validation**: OgraphX tests itself
2. **Contract Enforcement**: Data contracts validated
3. **Regression Detection**: Changes caught immediately
4. **Performance Tracking**: Metrics monitored
5. **Quality Gates**: Coverage enforced

## Test Data Strategy

### Fixture Files

- `fixtures/simple_ts.ts` - Basic TypeScript
- `fixtures/complex_ts.ts` - Advanced features
- `fixtures/with_imports.ts` - Cross-file imports
- `fixtures/with_generics.ts` - Generic types
- `fixtures/expected_ir.json` - Expected IR output
- `fixtures/expected_sequences.json` - Expected sequences

### Golden Files

- Reference outputs for comparison
- Updated when behavior intentionally changes
- Validated in code review

## Continuous Improvement

1. **Coverage Tracking**: Monitor over time
2. **Flaky Test Detection**: Identify unreliable tests
3. **Performance Benchmarks**: Track execution time
4. **Mutation Testing**: Validate test quality

---

**Status**: 📋 Planned  
**Version**: SAS Architecture v1.1  
**Date**: 2025-11-12

