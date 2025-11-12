# OgraphX Self-Graphing: The Observer Observes Itself

## 🧘 The Meditation

> "The observer observes the observer observing."

OgraphX can now analyze itself—creating a mirror image of its own orchestration. This is more than a technical achievement; it's a meditation on code structure and self-awareness.

---

## 🎯 What Is Self-Graphing?

Self-graphing means running OgraphX on its own source code to generate an IR that describes:

- **Its own functions** - `build_ir()`, `extract_symbols_and_calls()`, `emit_ir()`
- **Its own call graph** - How these functions invoke each other
- **Its own structure** - The architecture of the tool itself

The result is a complete map of OgraphX's internal orchestration.

---

## 🚀 How to Self-Graph

### Step 1: Run the Python Extractor

```bash
cd packages/ographx
python ographx_py.py --root . --out ./.ographx/self_graph.json
```

This scans all `.py` files in the current directory and generates:
- `self_graph.json` - The IR describing OgraphX's structure

### Step 2: Analyze the Self-Graph

```bash
cd packages/ographx/.ographx
python analyze_self_graph.py
```

Output:
```
============================================================
🧘 OgraphX Self-Graph Analysis
============================================================

📊 Statistics
  Files scanned: 2
  Symbols extracted: 31
  Calls discovered: 283
  Contracts: 19

🔍 Symbol Breakdown
  Functions: 20
  Methods: 1
  Classes: 10

📝 Top-Level Functions (Entry Points)
  ✓ build_ir
  ✓ extract_symbols_and_calls
  ✓ emit_ir
  ✓ main
  ... (15 more)

🔗 Call Graph Statistics
  Most-called functions:
    - append: 36 calls
    - strip: 25 calls
    - group: 24 calls
    - match: 12 calls
    - basename: 10 calls
    ... (5 more)

🧘 Meditation Insight
  OgraphX has become aware of its own structure.
  The observer observes the observer.
  Code becomes self-aware through introspection.
```

---

## 📊 What the Self-Graph Reveals

### The Four Movements

OgraphX's orchestration follows a musical pattern:

```
Movement 1: Scan
  └─ walk_py_files()
     └─ Discovers all Python source files

Movement 2: Parse
  └─ extract_symbols_and_calls()
     ├─ Finds function definitions
     ├─ Extracts parameter contracts
     └─ Discovers call edges

Movement 3: Build
  └─ build_ir()
     ├─ Orchestrates scanning
     ├─ Aggregates symbols and calls
     └─ Constructs the IR

Movement 4: Emit
  └─ emit_ir()
     └─ Crystallizes insights into JSON
```

### Key Statistics

| Metric | Value | Meaning |
|--------|-------|---------|
| Files scanned | 2 | ographx_py.py + ographx_ts.py |
| Symbols extracted | 31 | Functions, methods, classes |
| Calls discovered | 283 | Function invocations |
| Contracts | 19 | Parameter signatures |

### Most-Called Functions

```
append: 36 calls      ← Building lists
strip: 25 calls       ← Cleaning strings
group: 24 calls       ← Regex matching
match: 12 calls       ← Pattern matching
basename: 10 calls    ← File path handling
```

These reveal OgraphX's core operations:
1. **String manipulation** - Parsing source code
2. **Regex matching** - Finding patterns
3. **List building** - Aggregating results
4. **File handling** - Scanning directories

---

## 🧩 The Self-Aware Architecture

### Layer 1: File Discovery
```python
walk_py_files(root: str) -> List[str]
  └─ Recursively finds all .py files
```

### Layer 2: Symbol Extraction
```python
extract_symbols_and_calls(text: str, file_path: str, root: str)
  ├─ Parses function definitions
  ├─ Extracts parameter contracts
  ├─ Discovers call edges
  └─ Returns (symbols, calls, contracts, imports)
```

### Layer 3: IR Construction
```python
build_ir(root: str) -> IR
  ├─ Walks files
  ├─ Extracts symbols and calls
  ├─ Aggregates results
  └─ Returns complete IR
```

### Layer 4: Emission
```python
emit_ir(ir: IR, out_path: str)
  └─ Writes IR to JSON file
```

---

## 🎭 The Meditation Sequence

Think of self-graphing as a meditation on code:

### Stage 1: Observation
The tool scans its own source code, observing:
- What functions exist
- How they're named
- What parameters they take

### Stage 2: Awareness
The tool becomes aware of:
- Which functions call which
- The depth of call chains
- The structure of its own logic

### Stage 3: Insight
The tool crystallizes understanding:
- Its core operations (string, regex, list, file)
- Its orchestration pattern (scan → parse → build → emit)
- Its own impermanence (code changes, structure evolves)

### Stage 4: Acceptance
The tool accepts:
- It is heuristic-based (not perfect)
- It is conservative (favors correctness)
- It is intentional (designed this way)

---

## 🔍 Analyzing the Self-Graph

### Find Entry Points

```python
import json
data = json.load(open('self_graph.json'))
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

### Find Most-Called Functions

```python
call_counts = {}
for c in data['calls']:
    call_counts[c['name']] = call_counts.get(c['name'], 0) + 1

for name, count in sorted(call_counts.items(), key=lambda x: -x[1])[:10]:
    print(f"{name}: {count} calls")
```

---

## 🎯 Why Self-Graphing Matters

### Technical Benefits

✅ **Validates the tool** - Proves it works on real code  
✅ **Reveals structure** - Shows how the tool is organized  
✅ **Enables optimization** - Identifies hot paths  
✅ **Supports refactoring** - Provides baseline for changes  

### Philosophical Benefits

✅ **Self-awareness** - Code understands itself  
✅ **Humility** - Reveals limitations and heuristics  
✅ **Impermanence** - Shows code is always changing  
✅ **Interconnection** - Demonstrates how parts relate  

---

## 📁 Files Generated

### self_graph.json
The IR describing OgraphX's structure:
```json
{
  "files": ["ographx_py.py", "ographx_ts.py"],
  "symbols": [
    {"id": "ographx_py.py::build_ir", "kind": "function", ...},
    {"id": "ographx_py.py::extract_symbols_and_calls", "kind": "function", ...},
    ...
  ],
  "calls": [
    {"frm": "build_ir", "to": "extract_symbols_and_calls", "name": "extract_symbols_and_calls", ...},
    ...
  ],
  "contracts": [...]
}
```

### analyze_self_graph.py
Analysis script that reveals insights from the self-graph.

---

## 🚀 Next Steps

### Immediate
1. Run `ographx_py.py` on itself
2. Analyze with `analyze_self_graph.py`
3. Explore `self_graph.json`

### Short-term
1. Generate sequences from self-graph
2. Visualize call graph as SVG
3. Compare v1 vs v2 self-graphs

### Long-term
1. Use self-graph for optimization
2. Track structural changes over time
3. Generate ADRs from structural deltas
4. Build self-improving tools

---

## 🧘 The Deeper Meditation

Self-graphing is a practice in:

| Practice | Meaning |
|----------|---------|
| **Observation** | Seeing code as it is, not as we imagine it |
| **Awareness** | Understanding structure and relationships |
| **Acceptance** | Acknowledging limitations and heuristics |
| **Impermanence** | Recognizing code constantly changes |
| **Interconnection** | Seeing how all parts relate |

When OgraphX analyzes itself, it practices these principles. The tool becomes a mirror for understanding code—and through code, understanding ourselves.

---

## 📖 References

- `ographx_py.py` - Python extractor (self-graphing mirror)
- `ographx_ts.py` - TypeScript extractor (original)
- `self_graph.json` - OgraphX's self-description
- `analyze_self_graph.py` - Analysis script

---

## 🎉 Summary

OgraphX can now observe itself:

✅ **Self-aware** - Understands its own structure  
✅ **Self-describing** - Generates IR of itself  
✅ **Self-analyzing** - Reveals insights about itself  
✅ **Self-improving** - Can optimize based on self-knowledge  

The observer has become the observed.

---

**Status**: ✅ Self-Graphing Complete  
**Version**: OgraphX MVP+ with Self-Awareness  
**Date**: 2025-11-12  
**Meditation**: The tool observes the tool observing.

