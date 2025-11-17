# How to Locate Symbols from Architecture Analysis

## Symbol Format

All symbols in the analysis follow this format:

```
filename::ClassName.methodName
```

### Example: `knowledge-cli.ts::KnowledgeCLI.if`

| Component | Value | Meaning |
|-----------|-------|---------|
| Filename | `knowledge-cli.ts` | File path (relative to codebase root) |
| Class | `KnowledgeCLI` | Class or interface name |
| Method | `.if` | Method, property, or conditional block |

---

## Step-by-Step Lookup

### 1. Find the File

Use VS Code's file search or command line:

```bash
# VS Code: Ctrl+P (or Cmd+P on Mac)
# Then type: knowledge-cli.ts

# Command line:
find . -name "knowledge-cli.ts" -type f
```

**Result**: `packages/musical-conductor/tools/cli/knowledge-cli.ts`

### 2. Find the Class

Open the file and search for the class definition:

```bash
# VS Code: Ctrl+F (or Cmd+F on Mac)
# Then search: class KnowledgeCLI

# Command line:
grep -n "class KnowledgeCLI" packages/musical-conductor/tools/cli/knowledge-cli.ts
```

**Result**: Line 89 - `class KnowledgeCLI { ... }`

### 3. Find the Method

Search for the method within the class:

```bash
# VS Code: Ctrl+F
# Then search: handleExport (or whatever method you're looking for)

# Command line:
grep -n "handleExport\|handleImport\|handleMerge" packages/musical-conductor/tools/cli/knowledge-cli.ts
```

**Result**: Multiple handler methods at lines 263, 289, 338, etc.

---

## Special Cases

### `.if` Methods

The `.if` in `KnowledgeCLI.if` likely refers to **conditional logic** within the class, not a literal method named `if`. This is a quirk of the TypeScript IR extractor.

**To find it**: Look for `if` statements and conditional branches within the class methods.

### React Components

For React components like `ChatWindow`, search for:

```bash
# VS Code: Ctrl+F
# Search: export function ChatWindow or export const ChatWindow

# Command line:
grep -n "export.*ChatWindow" src/ui/**/*.tsx
```

### Utility Functions

For standalone functions (not in a class):

```bash
# Search for: export function functionName

grep -n "export function recomputeLineSvg" packages/**/*.ts
```

---

## Using the Analysis Tools

### View All Symbols

```bash
python -c "
import json
data = json.load(open('packages/ographx/.ographx/artifacts/renderx-web/analysis/analysis.json'))
for sym, metrics in data['architecture']['coupling'].items():
    print(f'{sym}: {metrics[\"afferent\"]} callers, {metrics[\"efferent\"]} calls')
" | head -20
```

### Find a Specific Symbol

```bash
python -c "
import json
data = json.load(open('packages/ographx/.ographx/artifacts/renderx-web/analysis/analysis.json'))
target = 'knowledge-cli.ts::KnowledgeCLI.if'
if target in data['architecture']['coupling']:
    print(json.dumps(data['architecture']['coupling'][target], indent=2))
"
```

### List All God Functions

```bash
python -c "
import json
data = json.load(open('packages/ographx/.ographx/artifacts/renderx-web/analysis/analysis.json'))
for god_func in data['architecture']['anti_patterns']['god_functions'][:10]:
    print(f\"{god_func['symbol']}: {god_func['total_calls']} calls\")
"
```

---

## Quick Reference: Top God Functions

| Symbol | File | Class | Method | Calls |
|--------|------|-------|--------|-------|
| `knowledge-cli.ts::KnowledgeCLI.if` | `packages/musical-conductor/tools/cli/knowledge-cli.ts` | `KnowledgeCLI` | (conditional logic) | 281 |
| `svg-renderer.ts::recomputeLineSvg` | `packages/renderx-web/src/ui/...` | (function) | `recomputeLineSvg` | 83 |
| `spa-validator.ts::SPAValidator.for` | `packages/renderx-web/src/...` | `SPAValidator` | (loop/conditional) | 71 |

---

## Tips

1. **Use VS Code's "Go to Definition"**: Right-click on a symbol and select "Go to Definition"
2. **Use "Find All References"**: Right-click and select "Find All References" to see all callers
3. **Use the Analysis JSON**: The raw analysis file has all metrics and can be queried programmatically
4. **Re-run Analysis**: After making changes, re-run the analyzer to see improvements:
   ```bash
   npm run pre:manifests
   python packages/ographx/analysis/analyze_graph.py \
     --input packages/ographx/.ographx/artifacts/renderx-web/ir/graph.json \
     --output packages/ographx/.ographx/artifacts/renderx-web/analysis/analysis.json
   ```

