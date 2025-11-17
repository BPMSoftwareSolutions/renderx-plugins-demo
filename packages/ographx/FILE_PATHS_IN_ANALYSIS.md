# File Paths in Architecture Analysis

## Problem Solved ✓

**Question**: Why can't the JSON file have a reference to the path?

**Answer**: It now does! The analysis output now includes file paths and line ranges for all symbols.

---

## What Changed

The analyzer now includes file path information in all analysis sections:

### 1. God Functions

**Before**:
```json
{
  "symbol": "knowledge-cli.ts::KnowledgeCLI.if",
  "total_calls": 281,
  "unique_called": 71
}
```

**After**:
```json
{
  "symbol": "knowledge-cli.ts::KnowledgeCLI.if",
  "file": "../../packages/musical-conductor/tools/cli/knowledge-cli.ts",
  "line_range": [89, 1178],
  "total_calls": 281,
  "unique_called": 71
}
```

### 2. Cycles

**Before**:
```json
{
  "members": ["CinematicPresentation.nextScene", "CinematicPresentation.scheduleNextScene"],
  "size": 2
}
```

**After**:
```json
{
  "members": [
    {
      "symbol": "cinematic-renderer.ts::CinematicPresentation.nextScene",
      "file": "../../packages/digital-assets/src/cinematic-renderer.ts",
      "line_range": [347, 357]
    },
    {
      "symbol": "cinematic-renderer.ts::CinematicPresentation.scheduleNextScene",
      "file": "../../packages/digital-assets/src/cinematic-renderer.ts",
      "line_range": [334, 345]
    }
  ],
  "size": 2
}
```

### 3. Coupling Metrics

**Before**:
```json
{
  "symbol": {
    "afferent": 0,
    "efferent": 6,
    "instability": 1.0
  }
}
```

**After**:
```json
{
  "symbol": {
    "file": "../../packages/canvas-component/src/symphonies/resize/resize.stage-crew.ts",
    "line_range": [45, 120],
    "afferent": 0,
    "efferent": 6,
    "instability": 1.0
  }
}
```

### 4. Long Parameter Lists

**Before**:
```json
{
  "symbol": "MyClass.method",
  "param_count": 8,
  "contract": "..."
}
```

**After**:
```json
{
  "symbol": "MyClass.method",
  "file": "../../packages/path/to/file.ts",
  "line_range": [100, 150],
  "param_count": 8,
  "contract": "..."
}
```

### 5. Shotgun Surgery Risk

**Before**:
```json
{
  "symbol": "commonFunction",
  "fan_in": 12
}
```

**After**:
```json
{
  "symbol": "commonFunction",
  "file": "../../packages/path/to/file.ts",
  "line_range": [50, 75],
  "fan_in": 12
}
```

---

## How to Use

### View God Functions with Paths

```bash
python -c "
import json
data = json.load(open('packages/ographx/.ographx/artifacts/renderx-web/analysis/analysis.json'))
for gf in data['architecture']['anti_patterns']['god_functions'][:5]:
    print(f\"{gf['symbol']}\")
    print(f\"  File: {gf['file']}\")
    print(f\"  Lines: {gf['line_range']}\")
"
```

### Quick Lookup Script

```bash
python packages/ographx/scripts/verify_file_paths.py
```

### Open in VS Code

You can now create a script to open files directly:

```bash
# Example: Open the first god function in VS Code
code packages/canvas/src/ui/CanvasHeader.tsx:9
```

---

## Implementation Details

**Modified Functions**:
- `_detect_god_functions()` - Now includes file and line_range
- `_detect_long_parameter_list()` - Now includes file and line_range
- `_detect_shotgun_surgery()` - Now includes file and line_range
- `_detect_cycles()` - Now includes file and line_range for each cycle member
- `analyze_architecture_ir()` - Builds symbol_map and passes to all detectors

**Symbol Map**:
The analyzer now builds a `symbol_map` dictionary that maps symbol IDs to their metadata:
```python
symbol_map = {
    "symbol_id": {
        "file": "path/to/file.ts",
        "range": [start_line, end_line],
        "kind": "function" | "method",
        "name": "symbolName"
    }
}
```

---

## Benefits

✓ **Direct Navigation**: Click or copy file paths to jump to code  
✓ **Line Numbers**: Know exactly where to look in the file  
✓ **Automation**: Scripts can now open files programmatically  
✓ **IDE Integration**: Works with VS Code's `code` command  
✓ **Better Reporting**: Analysis reports are now self-contained and actionable  

---

## Files Updated

- `packages/ographx/analysis/analyze_graph.py` - Added file path tracking
- `packages/ographx/.ographx/artifacts/renderx-web/analysis/analysis.json` - Regenerated with paths
- `packages/ographx/tests/unit/test_architecture_analysis.py` - Tests still passing ✓

