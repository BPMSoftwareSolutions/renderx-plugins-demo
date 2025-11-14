# Phase 2: Mock Options - Incremental Unmocking for Performance Debugging

## Overview

Phase 2 adds **selective mocking** capabilities to the CLI Bug Detective, enabling you to:

1. **Mock entire service types** (pure, io, stage-crew, api) to isolate bottlenecks
2. **Mock specific beats** to test individual handlers
3. **Unmock selectively** to find which code causes delays
4. **Compare execution times** with different mock combinations

## New Features

### 1. Mock Handler Registry

**File**: `tools/cli/mocking/MockHandlerRegistry.ts`

Provides utilities for:
- Determining which beats should be mocked
- Getting mock delays for different beat kinds
- Parsing CLI arguments for mock options
- Formatting mock context for logging

### 2. Mock Executor

**File**: `tools/cli/mocking/MockExecutor.ts`

Executes sequences with selective mocking:
- Runs beats with or without mocking based on options
- Records timing for each beat
- Generates summary reports
- Identifies slow beats

### 3. CLI Flags

#### `--mock <services>`
Mock entire service types (comma-separated):
```bash
npm run conductor:play -- --sequence canvas-component-create --mock stage-crew
npm run conductor:play -- --sequence canvas-component-create --mock pure,io,stage-crew
```

#### `--mock-beat <numbers>`
Mock specific beats (comma-separated):
```bash
npm run conductor:play -- --sequence canvas-component-create --mock-beat 1,2,3
```

#### `--unmock <services>`
Unmock specific service types:
```bash
npm run conductor:play -- --sequence canvas-component-create --mock pure,io --unmock pure
```

#### `--unmock-beat <numbers>`
Unmock specific beats:
```bash
npm run conductor:play -- --sequence canvas-component-create --mock-beat 1,2,3,4,5,6 --unmock-beat 4
```

## Beat Kinds

- **pure**: Pure computation, no side effects (1ms mock delay)
- **io**: I/O operations (5ms mock delay)
- **stage-crew**: DOM/React rendering (2ms mock delay)
- **api**: Remote API calls (10ms mock delay)

## Usage Examples

### Example 1: Find the Slow Beat

Start with all beats mocked, then unmock one by one:

```bash
# All mocked (fast baseline)
npm run conductor:play -- --sequence canvas-component-create --mock pure,io,stage-crew,api

# Unmock stage-crew only
npm run conductor:play -- --sequence canvas-component-create --mock pure,io,api --unmock stage-crew

# If stage-crew is slow, unmock individual beats
npm run conductor:play -- --sequence canvas-component-create --mock pure,io,api --unmock-beat 4
```

### Example 2: Isolate Rendering Delay

```bash
# Mock everything except stage-crew beats
npm run conductor:play -- --sequence canvas-component-create --mock pure,io,api

# Results show if rendering is the bottleneck
```

### Example 3: Test Specific Beat

```bash
# Mock all beats except beat 4
npm run conductor:play -- --sequence canvas-component-create --mock-beat 1,2,3,5,6
```

## Output Format

```
🎵 Sequence Player Report
═══════════════════════════════════════════════════════════════
Sequence: canvas-component-create
Mode: selective-mocking
Total Duration: 588ms ⏱️

🎯 Mocking Configuration
───────────────────────────────────────────────────────────────
Mock Services: stage-crew
Mock Beats: none
Unmock Services: none
Unmock Beats: none

📊 Timing Breakdown
───────────────────────────────────────────────────────────────
Beat 1 (resolve-template)    ✨ REAL    5ms
Beat 2 (register-instance)   ✨ REAL   12ms
Beat 3 (create-node)         ✨ REAL   18ms
Beat 4 (render-react)        🎭 MOCK  512ms  ⚠️ SLOW
Beat 5 (notify-ui)           ✨ REAL    3ms
Beat 6 (enhance-line)        ✨ REAL   38ms
───────────────────────────────────────────────────────────────
Total Duration: 588ms
```

## Testing

Run the mock tests:

```bash
npm run test -- mock-handler-registry.test.ts
npm run test -- mock-executor.test.ts
```

## Files Added

- `tools/cli/mocking/MockHandlerRegistry.ts` - Mock utilities
- `tools/cli/mocking/MockExecutor.ts` - Mock execution engine
- `tests/unit/cli/mock-handler-registry.test.ts` - Registry tests
- `tests/unit/cli/mock-executor.test.ts` - Executor tests

## Files Modified

- `tools/cli/sequence-player-cli.cjs` - Added mock flag support
- `package.json` - npm scripts (no changes needed)

## Next Steps

Phase 3: Performance Reports
- Generate detailed timing breakdowns
- Identify slow beats with recommendations
- Support before/after comparison
- Create JSON report format for CI/CD integration

