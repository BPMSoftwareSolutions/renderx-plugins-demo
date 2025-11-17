# God Function Analysis: updateSize

## Overview
**Function**: `updateSize`  
**File**: `packages/canvas-component/src/symphonies/resize/resize.stage-crew.ts`  
**Lines**: 81-280 (200 lines)  
**Rank**: #2 most complex god function  

## Metrics
- **Total Calls**: 63 (calls made TO other functions)
- **Unique Callees**: 17 (different functions called)
- **Complexity Ratio**: 0.27 (27% unique) ⚠️ **WORST RATIO** - 73% repetition!
- **Interpretation**: 63 calls spread across only 17 unique functions = EXTREME REPETITION

## What This Function Does
Handles canvas component resizing with directional constraints (n/s/e/w), proportional line scaling, and layout synchronization.

## Call Pattern Analysis

### Top Callees (What it calls most)
```
1. parseFloat()           - 12x  (Parse numeric values from strings)
2. String()               - 11x  (Convert values to strings)
3. writeCssNumber()       - 6x   (Write CSS custom properties)
4. isFinite()             - 6x   (Validate numeric values)
5. clamp()                - 4x   (Constrain values to min/max)
6. round()                - 4x   (Round pixel values)
7. getBoundingClientRect()- 4x   (Get element dimensions)
8. includes()             - 4x   (Check direction string)
9. getElementById()       - 2x   (Find DOM elements)
10. Error()               - 2x   (Throw errors)
```

## Problems Identified

### 🚨 Problem #1: Extreme Type Conversion Repetition
- **12 calls to `parseFloat()`** - Parsing dataset values, style values, base metrics
- **11 calls to `String()`** - Converting numbers to strings for dataset/style
- **Pattern**: Constant back-and-forth between string and number types
- **Impact**: Unnecessary conversions, hard to track data types, performance overhead

### 🚨 Problem #2: Scattered Numeric Validation
- **6 calls to `isFinite()`** - Checking if values are valid numbers
- **Pattern**: Validation logic scattered throughout function
- **Impact**: Defensive programming without clear strategy, hard to maintain

### 🚨 Problem #3: Multiple Early Returns with Duplicated Payload Logic
- **Lines 103-119**: Return with payload setup
- **Lines 143-159**: Return with payload setup (identical)
- **Lines 166-182**: Return with payload setup (identical)
- **Pattern**: Same result object and payload logic repeated 3+ times
- **Impact**: Code duplication, maintenance burden, inconsistency risk

### 🚨 Problem #4: Mixed Concerns in Single Function
- **Resize calculation** (direction parsing, delta application, clamping)
- **Style mutation** (reading/writing inline styles)
- **Line scaling** (proportional endpoint scaling)
- **Overlay synchronization** (applyOverlayRectForEl)
- **Callback invocation** (onResize)
- **Payload mutation** (ctx.payload updates)
- **Pattern**: 6+ distinct concerns in one 200-line function
- **Impact**: Violates SRP, hard to test, hard to reuse

### 🚨 Problem #5: Repeated Dataset Access Pattern
- **Lines 48-70**: Read dataset values in startResize
- **Lines 236-252**: Read same dataset values in updateSize
- **Pattern**: Dataset reading logic duplicated across functions
- **Impact**: Maintenance burden, inconsistency risk

### 🚨 Problem #6: Inefficient Style Caching
- **Lines 206-209**: Read current inline styles
- **Lines 211-215**: Validate all 4 values are finite
- **Lines 217**: Compare all 4 values
- **Pattern**: Multiple parseFloat calls to read same styles
- **Impact**: Repeated DOM access, could be cached

## Refactoring Strategy

### Step 1: Extract ResizeCalculator Class
**Goal**: Consolidate all resize calculation logic

**Extract**:
- Direction parsing (includes checks)
- Delta application (dx/dy)
- Clamping logic
- Proportional scaling for lines

**Expected Impact**:
- Reduce 20+ calls → 3 calls (-85%)
- Centralize resize math for easier testing
- Enable reuse in other resize handlers

### Step 2: Extract StyleManager Class
**Goal**: Consolidate style reading/writing with type conversion

**Extract**:
- parseFloat calls for style reading
- String conversions for style writing
- Inline style caching
- Style comparison logic

**Expected Impact**:
- Reduce 15+ calls → 2 calls (-87%)
- Centralize type conversion
- Improve performance (cache styles)

### Step 3: Extract LineScaler Class
**Goal**: Consolidate proportional line endpoint scaling

**Extract**:
- Dataset reading (lineBaseW, lineBaseH, lineBaseX1, etc.)
- Scale factor calculation (sx, sy)
- Proportional scaling math
- writeCssNumber calls

**Expected Impact**:
- Reduce 12+ calls → 1 call (-92%)
- Reusable for other line operations
- Clearer scaling logic

### Step 4: Extract ResultBuilder Function
**Goal**: Consolidate result object and payload creation

**Extract**:
- Result object creation
- Payload mutation logic
- Early return patterns

**Expected Impact**:
- Reduce 9+ calls → 1 call (-89%)
- Eliminate code duplication
- Consistent result format

### Step 5: Simplify Main Function Flow
**Goal**: Orchestrate extracted components

**New structure**:
```typescript
export const updateSize = (data: any, ctx?: any) => {
  // 1. Validate and get element
  // 2. Get resize config
  // 3. Early exit if disabled
  // 4. Calculate new dimensions
  // 5. Check if styles changed
  // 6. Apply styles
  // 7. Scale line endpoints
  // 8. Sync overlay
  // 9. Invoke callbacks
  // 10. Return result
}
```

## Expected Outcome

### Before Refactoring
- **Total Calls**: 63
- **Unique Callees**: 17
- **Complexity Ratio**: 0.27 (worst!)
- **Concerns**: 6+ mixed together
- **Testability**: Very low

### After Refactoring
- **Total Calls**: ~15 (76% reduction)
- **Unique Callees**: ~8 (53% reduction)
- **Complexity Ratio**: ~0.53 (improvement)
- **Concerns**: Separated into focused classes
- **Testability**: High (each concern independently testable)

## Implementation Checklist

- [ ] Create `ResizeCalculator` class
- [ ] Create `StyleManager` class
- [ ] Create `LineScaler` class
- [ ] Create `ResultBuilder` function
- [ ] Update `updateSize` to use extracted components
- [ ] Add unit tests for each extracted component
- [ ] Add integration tests for `updateSize`
- [ ] Verify behavior unchanged
- [ ] Regenerate god functions analysis
- [ ] Document new classes/functions

