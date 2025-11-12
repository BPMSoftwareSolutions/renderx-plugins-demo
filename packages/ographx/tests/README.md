# OgraphX Testing Suite

Comprehensive testing framework for OgraphX's Self-Aware System (SAS), ensuring self-testing capabilities throughout the continuous delivery pipeline.

## Directory Structure

```
tests/
├── unit/                          # Unit tests per layer
│   ├── test_core_extraction.py    # Layer 1: Core extraction tests
│   ├── test_generators.py         # Layers 3-4: Generator tests
│   └── test_analysis.py           # Layer 5: Analysis tests
├── integration/                   # End-to-end pipeline tests
│   └── test_pipeline.py           # Full regeneration pipeline
├── fixtures/                      # Test data
│   ├── typescript/                # TypeScript fixtures
│   │   ├── simple.ts              # Basic TypeScript
│   │   ├── with_imports.ts        # Cross-file imports
│   │   └── expected_simple_ir.json # Expected IR output
│   └── python/                    # Python fixtures (planned)
├── conftest.py                    # Shared fixtures & config
└── README.md                      # This file
```

## Quick Start

### Install Test Dependencies

```bash
cd packages/ographx
pip install -r requirements-test.txt
```

### Run All Tests

```bash
# Run all tests with verbose output
pytest tests/ -v

# Run with coverage report
pytest tests/ --cov=. --cov-report=html

# Run specific test file
pytest tests/unit/test_core_extraction.py -v

# Run specific test class
pytest tests/unit/test_core_extraction.py::TestTypeScriptSymbolExtraction -v

# Run specific test
pytest tests/unit/test_core_extraction.py::TestTypeScriptSymbolExtraction::test_extract_function_declarations -v
```

### Run Tests by Category

```bash
# Unit tests only
pytest tests/unit/ -v

# Integration tests only
pytest tests/integration/ -v

# Contract validation tests
pytest -m contract -v

# Extraction tests
pytest -m extraction -v

# Slow tests (with timeout)
pytest -m slow -v --timeout=60
```

## Test Coverage

### Layer 1: Core Extraction

**File**: `tests/unit/test_core_extraction.py`

Tests for `ographx_ts.py` and `ographx_py.py`:

- ✅ Function declaration extraction
- ✅ Arrow function extraction
- ✅ Class and method extraction
- ✅ Export detection
- ✅ Parameter contract extraction
- ✅ Call resolution (same-file and cross-file)
- ✅ Import graph building
- ✅ Generic type handling
- ✅ Union type handling
- ✅ IR schema validation

**Coverage Goal**: 90%+

### Layers 3-4: Generators

**File**: `tests/unit/test_generators.py`

Tests for sequence and diagram generation:

- ✅ Sequence structure validation
- ✅ Beat generation
- ✅ DFS depth limiting
- ✅ Mermaid diagram generation
- ✅ Node and edge creation
- ✅ SVG conversion
- ✅ Data contract validation
- ✅ Error handling

**Coverage Goal**: 85%+

### Layer 5: Analysis

**File**: `tests/unit/test_analysis.py` (planned)

Tests for telemetry extraction:

- ⏳ Metrics extraction
- ⏳ Data aggregation
- ⏳ Complexity analysis
- ⏳ Contract validation

**Coverage Goal**: 85%+

### Integration Tests

**File**: `tests/integration/test_pipeline.py`

End-to-end pipeline validation:

- ✅ Full extraction phase
- ✅ IR generation
- ✅ Sequence generation
- ✅ Diagram generation
- ✅ SVG conversion
- ✅ Analysis extraction
- ✅ Data flow validation
- ✅ Error handling
- ✅ Pipeline consistency

**Coverage Goal**: 80%+

## Test Fixtures

### TypeScript Fixtures

- **simple.ts**: Basic TypeScript with functions, classes, and methods
- **with_imports.ts**: Cross-file imports and generic/union types
- **expected_simple_ir.json**: Expected IR output for validation

### Shared Fixtures (conftest.py)

- `sample_ir`: Sample IR for testing
- `sample_sequences`: Sample sequences for testing
- `sample_mermaid_diagram`: Sample Mermaid diagram
- `sample_svg`: Sample SVG output
- `temp_dir`: Temporary directory for test files
- `fixture_dir`: Path to fixtures directory

## Running Tests in CI/CD

### GitHub Actions Example

```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.10'
      - run: pip install -r packages/ographx/requirements-test.txt
      - run: pytest packages/ographx/tests/ --cov --cov-report=xml
      - uses: codecov/codecov-action@v3
```

## Coverage Reports

Generate HTML coverage report:

```bash
pytest tests/ --cov=. --cov-report=html
open htmlcov/index.html
```

## Test Markers

Run tests by marker:

```bash
pytest -m unit              # Unit tests
pytest -m integration       # Integration tests
pytest -m contract          # Contract validation
pytest -m extraction        # Extraction tests
pytest -m generation        # Generation tests
pytest -m analysis          # Analysis tests
pytest -m slow              # Slow tests
```

## Continuous Improvement

### Adding New Tests

1. Create test file in appropriate directory
2. Use descriptive test names: `test_<feature>_<scenario>`
3. Add docstrings explaining what is tested
4. Use fixtures from `conftest.py`
5. Mark tests with appropriate markers

### Test Quality

- Aim for 85%+ coverage
- Test both happy path and error cases
- Validate data contracts between layers
- Use fixtures for reusable test data
- Keep tests focused and independent

## Troubleshooting

### Import Errors

If you get import errors, ensure:
1. You're in the `packages/ographx` directory
2. Python path includes core, generators, analysis directories
3. Virtual environment is activated

### Fixture Not Found

If fixtures are not found:
1. Check fixture path in test file
2. Ensure fixture files exist in `tests/fixtures/`
3. Use `fixture_dir` fixture to get correct path

### Slow Tests

If tests are slow:
1. Use `pytest -m "not slow"` to skip slow tests
2. Run tests in parallel: `pytest -n auto`
3. Profile slow tests: `pytest --durations=10`

---

**Status**: 📋 In Progress  
**Version**: SAS Architecture v1.1  
**Date**: 2025-11-12

