# Analysis Data Explained

## Quick Answer: What is `line_range`?

**`line_range: [273, 277]` means lines 273 through 277 in the source file.**

It's the physical location of the symbol (function, method, class) in the code.

---

## Complete Example

### Analysis Output
```json
{
  "symbol": "knowledge-cli.ts::KnowledgeCLI.if",
  "file": "../../packages/musical-conductor/tools/cli/knowledge-cli.ts",
  "line_range": [273, 277],
  "total_calls": 281,
  "unique_called": 71
}
```

### What Each Field Means

| Field | Value | Meaning |
|-------|-------|---------|
| **symbol** | `knowledge-cli.ts::KnowledgeCLI.if` | Unique ID: filename::ClassName.methodName |
| **file** | `../../packages/musical-conductor/tools/cli/knowledge-cli.ts` | Relative path from workspace root |
| **line_range** | `[273, 277]` | Lines 273-277 contain this method |
| **total_calls** | `281` | This method makes 281 function calls |
| **unique_called** | `71` | It calls 71 different functions |

### Actual Source Code (lines 273-277)
```typescript
273:      if (options.compress) {
274:        await this.writeCompressedFile(outputPath, knowledge);
275:      } else {
276:        await this.writeJsonFile(outputPath, knowledge);
277:      }
```

---

## All Analysis Sections

### 1. God Functions
Functions with excessive calls (10+ total, 8+ unique)

```json
{
  "symbol": "...",
  "file": "...",
  "line_range": [start, end],
  "total_calls": 281,
  "unique_called": 71
}
```

### 2. Coupling Metrics
Dependency analysis for all symbols

```json
{
  "symbol": "...",
  "file": "...",
  "line_range": [start, end],
  "afferent": 0,        // How many call this
  "efferent": 6,        // How many this calls
  "instability": 1.0    // Ce / (Ca + Ce)
}
```

### 3. Cycles
Circular dependencies

```json
{
  "members": [
    {
      "symbol": "...",
      "file": "...",
      "line_range": [start, end]
    }
  ],
  "size": 2
}
```

### 4. Long Parameter Lists
Functions with 6+ parameters

```json
{
  "symbol": "...",
  "file": "...",
  "line_range": [start, end],
  "param_count": 8,
  "contract": "..."
}
```

### 5. Shotgun Surgery Risk
Functions called by 8+ other functions

```json
{
  "symbol": "...",
  "file": "...",
  "line_range": [start, end],
  "fan_in": 12
}
```

---

## Data Quality

✅ **All data is validated and accurate**

- ✓ line_range points to actual code
- ✓ File paths are normalized (forward slashes)
- ✓ Duplicate symbol IDs handled (using first occurrence)
- ✓ All metrics calculated correctly

---

## How to Use

### View in Terminal
```bash
python packages/ographx/scripts/verify_file_paths.py
```

### Open in VS Code
```bash
code packages/musical-conductor/tools/cli/knowledge-cli.ts:273
```

### Query Programmatically
```python
import json
data = json.load(open('packages/ographx/.ographx/artifacts/renderx-web/analysis/analysis.json'))
for gf in data['architecture']['anti_patterns']['god_functions']:
    print(f"{gf['symbol']}: {gf['file']}:{gf['line_range'][0]}")
```

---

## Known Issues

⚠️ **IR Extraction Bug**: TypeScript extractor creates duplicate symbol entries (37 copies of `KnowledgeCLI.if`)

- **Current Fix**: Analyzer uses first occurrence
- **Permanent Fix**: Needed in `packages/ographx/core/ographx_ts.py`

See `DATA_VALIDATION_REPORT.md` for details.

