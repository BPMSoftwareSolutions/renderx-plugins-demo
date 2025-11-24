# God Functions: Data Interpretation Guide

## What the Metrics Mean

### `total_calls` (81)
- **Definition**: Total number of function calls made inside this function
- **Includes**: Repeated calls to the same function
- **Interpretation**: Higher = function is doing more work
- **Benchmarks**:
  - < 10 calls = simple function ✓
  - 10-30 calls = moderate complexity ⚠
  - 30-60 calls = complex function ⚠⚠
  - > 60 calls = god function 🚨

### `unique_called` (31)
- **Definition**: Count of different functions called
- **Does NOT include**: Repeated calls to same function
- **Interpretation**: Higher = function is more coupled
- **Benchmarks**:
  - < 5 unique = focused function ✓
  - 5-15 unique = moderate coupling ⚠
  - 15-30 unique = high coupling ⚠⚠
  - > 30 unique = god function 🚨

### `complexity_ratio` (0.38)
- **Formula**: `unique_called / total_calls`
- **Range**: 0.0 to 1.0
- **Interpretation**:
  - 1.0 = All calls are to different functions (no repetition)
  - 0.5 = 50% unique, 50% repeated
  - 0.0 = All calls are to same function (100% repetition)
- **Benchmarks**:
  - > 0.7 = Good (mostly unique calls) ✓
  - 0.4-0.7 = Moderate (some repetition) ⚠
  - < 0.4 = Poor (lots of repetition) 🚨

## What Top Callees Reveal

### Pattern Recognition

| Callee | Count | Pattern | Suggests |
|--------|-------|---------|----------|
| `round()` | 8x | Lots of numeric calculations | Extract math logic |
| `parseFloat()` | 8x | Parsing same data multiple times | Parse once, cache |
| `querySelector()` | 6x | Querying DOM multiple times | Cache DOM refs |
| `createElement()` | 5x | DOM setup scattered | Consolidate setup |
| `appendChild()` | 5x | DOM manipulation scattered | Consolidate setup |
| `getAttribute()` | 5x | Reading attributes multiple times | Read once, cache |
| `getPropertyValue()` | 4x | Reading CSS multiple times | Cache styles |
| `readVar()` | 4x | Reading CSS vars multiple times | Cache styles |

## Refactoring Strategy

### Step 1: Identify Patterns
- Group similar callees (e.g., all DOM operations)
- Look for repeated calls to same function
- Find functions called in multiple places

### Step 2: Extract Concerns
- Create separate classes/functions for each concern
- Move related calls into extracted functions
- Replace repeated calls with single call

### Step 3: Measure Improvement
- Regenerate analysis after refactoring
- Compare metrics:
  - `total_calls` should decrease 50-75%
  - `unique_called` should decrease 30-50%
  - `complexity_ratio` should increase toward 1.0

### Step 4: Validate
- Run existing tests
- Add new tests for extracted functions
- Verify behavior unchanged

## Example: ensureAdvancedLineOverlayFor

### Current State
- 81 total calls
- 31 unique callees
- 0.38 complexity ratio
- **Problem**: Doing too many things

### After Refactoring
- ~20 total calls (75% reduction)
- ~15 unique callees (52% reduction)
- ~0.75 complexity ratio (improvement)
- **Benefit**: Clear separation of concerns

### Extraction Plan
1. **CoordinateConverter** - Handle all math (round, parseFloat, toPx)
2. **createOverlayStructure** - Handle DOM setup (createElement, appendChild)
3. **EndpointResolver** - Handle endpoint logic (getAttribute, getPropertyValue)
4. **CachedStyles** - Cache computed styles (getPropertyValue, readVar)

## Using god-functions.json

The generated `god-functions.json` file contains:
- All 98 god functions ranked by complexity
- Metrics for each function
- Top 10 callees with frequency counts
- File paths and line ranges for navigation

### Use Cases
- Identify refactoring priorities
- Understand call patterns
- Track complexity metrics
- Generate reports and visualizations
- Feed into IDE plugins for navigation

