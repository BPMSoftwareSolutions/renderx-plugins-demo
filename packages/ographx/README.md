# OgraphX TS - TypeScript Flow Extractor (MVP+)

## What is OgraphX?

OgraphX is a **minimal, heuristic-based TypeScript flow extractor** that analyzes your codebase and generates:

1. **graph.json** - Intermediate Representation (IR) with symbols, calls, and contracts
2. **sequences.json** - Conductor-compatible sequences for visualization

## Quick Start

### Installation

No external dependencies! Just Python 3.6+

```bash
cd packages/ographx
```

### Usage

```bash
# Generate IR and sequences
python ographx_ts.py --root ./src --out ./.ographx/graph.json --emit-sequences ./.ographx/sequences.json
```

### Output

```
.ographx/
├── graph.json (IR with symbols, calls, contracts)
└── sequences.json (Conductor-compatible format)
```

## What It Extracts

### Symbols
Functions, methods, and classes with:
- Name and location
- Export status
- Parameter contracts
- Line range

### Calls
Function invocations with:
- Source symbol
- Target symbol (if resolved)
- Called function name
- Line number

### Contracts
Parameter signatures with:
- Parameter names
- Type annotations (including generics and unions)

### Sequences
Musical representation of function flows:
- Movements (groups of beats)
- Beats (function calls)
- Dynamics (execution characteristics)

## MVP+ Enhancements

### 1. Scope-Aware Resolution ✅

Prioritizes symbol resolution:
1. Same file first
2. Imported symbols second
3. Global matches last

**Benefit**: Reduces false matches in multi-file codebases

### 2. Import Graph Awareness ✅

Parses import statements to resolve cross-file targets:

```typescript
import { foo, bar } from './utils'
import { baz as qux } from '../helpers'
```

**Benefit**: Correctly resolves symbols across files

### 3. Generics/Union Types ✅

Properly handles complex TypeScript types:

```typescript
function process<T>(data: T): T { ... }
function handle(value: string | number): void { ... }
function config(opts: Partial<Config>): void { ... }
```

**Benefit**: Type information is preserved and readable

### 4. Enriched Sequences ✅

Uses DFS to build deeper call chains:

```
Before: handler() → [process(), log()]
After:  handler() → [process(), validate(), transform(), log(), format()]
```

**Benefit**: Sequences show complete execution paths

## Features

✅ **Heuristic-based** - Fast, no external dependencies  
✅ **Conservative** - Favors correctness over completeness  
✅ **Scope-aware** - Handles multi-file codebases  
✅ **Import-aware** - Resolves cross-file targets  
✅ **Type-safe** - Preserves generics and unions  
✅ **Enriched sequences** - DFS call chains  
✅ **Backward compatible** - Same IR and sequence formats  

## Limitations

⚠️ **Regex-based** - Not a full TypeScript parser  
⚠️ **Local only** - Doesn't handle node_modules  
⚠️ **No re-exports** - Doesn't track `export { foo } from './bar'`  
⚠️ **No barrel exports** - Doesn't expand `export * from './utils'`  
⚠️ **No dynamic imports** - Doesn't parse `import(path)`  
⚠️ **No dynamic calls** - Doesn't track `obj[name]()`  

## Patterns Supported

### Functions
```typescript
function foo(a: T, b: U) { ... }
export function foo(...) { ... }
const foo = (...) => { ... }
const foo = function(...) { ... }
```

### Classes
```typescript
class C { 
  method(a: T) { ... }
  constructor() { ... }
}
export class C { ... }
```

### Imports
```typescript
import { foo, bar } from './utils'
import foo from './utils'
import { foo as bar } from './utils'
```

### Types
```typescript
T<U>                    // Generics
T<U, V>                 // Multiple generics
T | U                   // Union types
Partial<T>              // Generic utilities
T[]                     // Arrays
```

## JSON Formats

### graph.json

```json
{
  "files": ["list of scanned files"],
  "symbols": [
    {
      "id": "filename::symbolName",
      "file": "path/to/file.ts",
      "kind": "function|method",
      "name": "symbolName",
      "class_name": "ClassName (if method)",
      "exported": true|false,
      "params_contract": "contractId",
      "range": [startLine, endLine]
    }
  ],
  "calls": [
    {
      "frm": "source_symbol_id",
      "to": "target_symbol_id",
      "name": "calledFunctionName",
      "line": 42
    }
  ],
  "contracts": [
    {
      "id": "contractId",
      "kind": "params",
      "props": [
        {"name": "paramName", "raw": "TypeAnnotation"}
      ]
    }
  ]
}
```

### sequences.json

```json
{
  "version": "0.1.0",
  "contracts": [...],
  "sequences": [
    {
      "id": "unique_sequence_id",
      "name": "Sequence Name",
      "category": "analysis",
      "key": "C Major",
      "tempo": 100,
      "movements": [
        {
          "id": "calls",
          "beats": [
            {
              "beat": 1,
              "event": "call:functionName",
              "handler": "functionName",
              "timing": "immediate",
              "dynamics": "mf",
              "in": ["contractId"]
            }
          ]
        }
      ]
    }
  ]
}
```

## Performance

- **Processing time**: <1 second for typical codebases
- **Memory usage**: Minimal (import graph is small)
- **File sizes**: Same IR, slightly smaller sequences (deduplication)

## Documentation

- **ENHANCEMENTS.md** - Detailed explanation of MVP+ features
- **NEXT_BREATHS_COMPLETE.md** - Implementation summary
- **README.md** - This file

## Examples

### Find Entry Points

```python
import json
data = json.load(open('graph.json'))
exported = [s for s in data['symbols'] if s['exported']]
for s in exported:
    print(f"{s['name']} ({s['kind']})")
```

### Trace Call Chains

```python
calls_by_source = {}
for c in data['calls']:
    calls_by_source.setdefault(c['frm'], []).append(c)

def trace(symbol_id, depth=0):
    if depth > 3:
        return
    for call in calls_by_source.get(symbol_id, []):
        print("  " * depth + f"→ {call['name']}")
        if call['to']:
            trace(call['to'], depth + 1)
```

### Find Unused Exports

```python
exported_ids = {s['id'] for s in data['symbols'] if s['exported']}
called_ids = {c['to'] for c in data['calls'] if c['to']}
unused = exported_ids - called_ids
for sym_id in unused:
    sym = next(s for s in data['symbols'] if s['id'] == sym_id)
    print(f"Unused: {sym['name']}")
```

## Testing

Compare v1 (MVP) vs v2 (MVP+):

```bash
cd packages/musical-conductor/.ographx
python compare_versions.py
```

## Future Enhancements

Potential next steps:

1. Re-export tracking
2. Barrel export expansion
3. Dynamic import detection
4. Type-aware resolution (TypeScript compiler API)
5. Async/await tracking
6. Data flow analysis
7. Circular dependency detection
8. Performance metrics

## Contributing

To enhance OgraphX:

1. Add new regex patterns for unsupported syntax
2. Improve type normalization
3. Add new analysis examples
4. Optimize performance
5. Add more comprehensive tests

## License

Same as parent project

## Summary

OgraphX is a **lightweight, heuristic-based tool** for analyzing TypeScript codebases. It's perfect for:

✅ Quick architecture reviews  
✅ Understanding call dependencies  
✅ Generating flow visualizations  
✅ Extracting type information  
✅ Building analysis tools  

**Not suitable for**:
❌ Full type checking (use TypeScript compiler)  
❌ Refactoring tools (use IDE)  
❌ Production code generation (use proper parsers)  

---

**Version**: MVP+ (Enhanced MVP)  
**Status**: ✅ Ready for Use  
**Last Updated**: 2025-11-12

