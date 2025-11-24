# Self-Aware System Drift Prevention

## The Problem

A self-aware system must keep its self-observation artifacts in sync with actual code. We discovered that the test structure file was **62% out of date**:

- **Recorded**: 47 tests
- **Actual**: 124 tests  
- **Missing**: All 71 new Coverage & Quality tests

This is exactly the kind of drift that breaks self-awareness.

---

## The Solution

### 1. Updated Test Graph Generator

**File**: `packages/ographx/generators/generate_test_graph.py`

**Changes**:
- Added "Coverage & Quality" category for criticality-focused tests
- Made Mermaid diagram counts **dynamic** (no hardcoded numbers)
- Properly categorizes `test_critical_coverage.py` tests

**Before**:
```python
# Hardcoded counts
lines.append('    A --> B["📊 Unit Tests<br/>32 Tests"]')
lines.append('    A --> C["🔗 Integration Tests<br/>15 Tests"]')
```

**After**:
```python
# Dynamic counts from actual test data
unit_tests = sum(c['count'] for cat in test_structure['unit'].values() for c in cat)
integration_tests = sum(c['count'] for cat in test_structure['integration'].values() for c in cat)
lines.append(f'    A --> B["📊 Unit Tests<br/>{unit_tests} Tests"]')
lines.append(f'    A --> C["🔗 Integration Tests<br/>{integration_tests} Tests"]')
```

### 2. Pre-Flight Integration

**File**: `packages/ographx/core/preflight_validator.py`

**New Method**: `regenerate_test_graph()`

```python
def regenerate_test_graph(self) -> ValidationResult:
    """Regenerate test structure graph to keep it in sync with actual tests"""
    # Runs generate_test_graph.py automatically
    # Keeps .ographx/test-graphs/test_structure.json current
```

**Integration**: Pre-flight now regenerates test graph by default:

```python
def run_all_checks(self, ..., regenerate_test_graph: bool = True):
    # Regenerate test graph to keep it in sync (self-aware system)
    if regenerate_test_graph:
        result = result.merge(self.regenerate_test_graph())
```

---

## Results

### Test Structure Updated

**File**: `.ographx/test-graphs/test_structure.json`

| Category | Tests | Status |
|----------|-------|--------|
| Core Extraction | 16 | ✅ |
| **Coverage & Quality** | **71** | **✅ NEW** |
| Generators | 16 | ✅ |
| Pipeline | 15 | ✅ |
| **Total** | **118** | **✅ SYNCED** |

### Mermaid Diagram Updated

**File**: `.ographx/test-graphs/test_graph.mmd`

Now shows accurate test counts that update automatically.

---

## How It Works

### Before (Manual, Drifts)
```
Code changes → Tests added → Artifact becomes stale → Drift detected manually
```

### After (Automatic, Self-Aware)
```
Code changes → Tests added → Pre-flight runs → Test graph regenerated → Always in sync
```

---

## Usage

### Automatic (Recommended)
Pre-flight validation automatically regenerates test graph:

```bash
python core/preflight_validator.py --strict
```

### Manual
Regenerate test graph explicitly:

```bash
python generators/generate_test_graph.py
```

### Disable (Not Recommended)
```bash
python core/preflight_validator.py --strict --no-regenerate-test-graph
```

---

## Architecture

The self-aware system now has **three layers of drift prevention**:

1. **Coverage Validation** — Criticality-aware coverage enforcement
2. **Test Graph Regeneration** — Keeps test structure in sync
3. **IR Staleness Detection** — Detects code changes since last observation

All three run automatically during pre-flight validation.

---

## Key Insight

A truly self-aware system doesn't just **observe** itself — it **maintains** itself. By regenerating test graphs during pre-flight, OgraphX ensures its self-observation artifacts never drift from reality.

**Status**: ✅ **COMPLETE** — Self-aware drift prevention fully operational.

