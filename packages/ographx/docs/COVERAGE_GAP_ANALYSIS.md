# Coverage Gap Analysis: Criticality-Aware Validation

## Executive Summary

OgraphX now uses **criticality-aware coverage validation** instead of a flat percentage threshold. This ensures we test what matters most: the core IR extraction engine.

**Current Status**: 78.8% overall coverage, but **CRITICAL functions are at 77.5%** (need 100%).

---

## Criticality Tiers

### 🔴 CRITICAL (100% required)
Core IR extraction — the heart of self-awareness. **Must be fully tested.**

**Functions**:
- `parse_params()` — Parse function parameters into contracts
- `extract_symbols_and_calls()` — Extract symbols and call edges from TS files
- `build_ir()` — Orchestrate IR generation across all files
- `validate_criticality_coverage()` — Validate coverage against tiers (new)

**Current Coverage**: 77.5% (ographx_ts.py)
**Gap**: 22.5% — **MUST CLOSE THIS**

---

### 🟡 IMPORTANT (90%+ required)
Scope-aware resolution — enables accurate call graph. **Should be well-tested.**

**Functions**:
- `extract_imports()` — Map imports to source files for scope resolution

**Current Coverage**: 77.5% (ographx_ts.py)
**Gap**: 12.5% — **SHOULD CLOSE THIS**

---

### 🟢 OPTIONAL (70%+ required)
Error handling, file discovery — edge cases. **Basic coverage acceptable.**

**Functions**:
- `find_blocks()` — Find matching closing braces
- `walk_ts_files()` — Discover TS files in directory

**Current Coverage**: 77.5% (ographx_ts.py)
**Status**: ✅ PASS (exceeds 70% threshold)

---

## What's Untested in ographx_ts.py (22.5% gap)

From coverage report, these lines are NOT covered:

```
111, 119, 151-152, 168, 175-176, 191-193, 204, 211, 284-286, 430-431,
448-453, 456-474, 477-484, 497-500, 509-524, 529-590, 593-605, 708-709,
717-719, 725-728, 733
```

**Key untested areas**:
1. **Multi-line function declarations** (lines 284-286, 448-453)
2. **Class method extraction** (lines 456-474, 477-484)
3. **Error handling in build_ir** (lines 509-524)
4. **Edge cases in import resolution** (lines 191-193, 204, 211)
5. **Call resolution fallbacks** (lines 430-431, 497-500)

---

## How to Close the Gap

### Option 1: Write Targeted Unit Tests (Recommended)
Focus on the untested paths in `extract_symbols_and_calls()` and `build_ir()`:

1. **Multi-line function declarations** — Test functions split across lines
2. **Class methods** — Test method extraction from exported classes
3. **Import resolution edge cases** — Test relative paths, named imports, defaults
4. **Call resolution** — Test same-file, cross-file, and fallback resolution
5. **Error handling** — Test graceful handling of malformed TS files

**Effort**: ~2-3 hours to write comprehensive tests
**Payoff**: 100% CRITICAL coverage → prevents drift

### Option 2: Lower CRITICAL Threshold
Change `@critical` functions to `@important` (90% required).

**Effort**: 5 minutes
**Payoff**: Unblocks CI immediately
**Risk**: Allows untested paths in core IR extraction

---

## Running Criticality Validation

**Print current coverage by tier**:
```bash
python packages/ographx/core/criticality_coverage.py --coverage-xml packages/ographx/coverage.xml --source-dir packages/ographx
```

**Enforce in pre-flight (strict mode)**:
```bash
python packages/ographx/core/preflight_validator.py --strict
```

**Enforce in CI** (already configured):
```yaml
python core/preflight_validator.py --strict
```

---

## Next Steps

1. **Write tests** for untested paths in ographx_ts.py (Option 1)
2. **Run coverage** to verify 100% CRITICAL coverage
3. **Commit** with PR linking to this analysis
4. **CI gates** on criticality tiers automatically

---

## Architecture

The criticality system is self-aware:
- Markers (`@critical`, `@important`, `@optional`) live in docstrings
- `criticality_coverage.py` parses markers and enforces thresholds
- `preflight_validator.py` integrates criticality validation
- CI runs pre-flight with `--strict` to gate on criticality tiers

This ensures **the system knows what matters** and prevents drift on core functionality.

