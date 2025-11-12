# OgraphX Self-Graphing: Complete Guide

## 🧘 The Vision

OgraphX can now analyze itself—creating a complete map of its own orchestration. This is the tool becoming self-aware through introspection.

---

## 🚀 Quick Start

### 1. Generate Self-Graph

```bash
cd packages/ographx
python ographx_py.py --root . --out ./.ographx/self_graph.json
```

**Output**:
```
✓ Emitted IR: ./.ographx/self_graph.json
✓ Extracted 31 symbols, 283 calls
```

### 2. Analyze Self-Graph

```bash
cd packages/ographx/.ographx
python analyze_self_graph.py
```

**Output**:
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
  ... (16 more)

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

### The Architecture

OgraphX's orchestration follows four movements:

```
┌─────────────────────────────────────────┐
│ 🧘 OgraphX Self-Orchestration          │
├─────────────────────────────────────────┤
│                                         │
│ Movement 1: SCAN                        │
│   └─ walk_py_files()                    │
│      └─ Discovers all .py files         │
│                                         │
│ Movement 2: PARSE                       │
│   └─ extract_symbols_and_calls()        │
│      ├─ Finds function definitions      │
│      ├─ Extracts parameter contracts    │
│      └─ Discovers call edges            │
│                                         │
│ Movement 3: BUILD                       │
│   └─ build_ir()                         │
│      ├─ Orchestrates scanning           │
│      ├─ Aggregates symbols and calls    │
│      └─ Constructs the IR               │
│                                         │
│ Movement 4: EMIT                        │
│   └─ emit_ir()                          │
│      └─ Crystallizes insights into JSON │
│                                         │
└─────────────────────────────────────────┘
```

### Core Operations

The self-graph reveals OgraphX's core operations:

| Operation | Calls | Purpose |
|-----------|-------|---------|
| `append` | 36 | Building lists of symbols/calls |
| `strip` | 25 | Cleaning whitespace from strings |
| `group` | 24 | Regex group extraction |
| `match` | 12 | Pattern matching |
| `basename` | 10 | File path handling |
| `split` | 9 | String splitting |
| `startswith` | 8 | String prefix checking |
| `Symbol` | 7 | Creating symbol objects |
| `extend` | 7 | Extending lists |
| `asdict` | 7 | Converting to dictionaries |

**Insight**: OgraphX is fundamentally a **string processor** that uses **regex matching** to build **lists of symbols**.

---

## 🔍 Analyzing the Self-Graph

### Find All Entry Points

```python
import json
data = json.load(open('self_graph.json'))

# Find exported functions
exported = [s for s in data['symbols'] if s['exported']]
print(f"Entry points: {len(exported)}")
for s in exported:
    print(f"  - {s['name']} ({s['kind']})")
```

### Trace Call Chains

```python
# Build call index
calls_by_source = {}
for c in data['calls']:
    calls_by_source.setdefault(c['frm'], []).append(c)

# Trace from a function
def trace(symbol_id, depth=0, max_depth=3):
    if depth > max_depth:
        return
    for call in calls_by_source.get(symbol_id, []):
        print("  " * depth + f"→ {call['name']}")
        if call['to']:
            trace(call['to'], depth + 1, max_depth)

# Find build_ir and trace its calls
build_ir = next(s for s in data['symbols'] if s['name'] == 'build_ir')
print(f"Call chain from {build_ir['name']}:")
trace(build_ir['id'])
```

### Find Unused Functions

```python
# Find all exported symbols
exported_ids = {s['id'] for s in data['symbols'] if s['exported']}

# Find all called symbols
called_ids = {c['to'] for c in data['calls'] if c['to']}

# Find unused
unused = exported_ids - called_ids
for sym_id in unused:
    sym = next(s for s in data['symbols'] if s['id'] == sym_id)
    print(f"Unused: {sym['name']}")
```

### Identify Hot Paths

```python
# Count calls per function
call_counts = {}
for c in data['calls']:
    call_counts[c['name']] = call_counts.get(c['name'], 0) + 1

# Show hot paths
print("Hot paths (most-called functions):")
for name, count in sorted(call_counts.items(), key=lambda x: -x[1])[:15]:
    print(f"  {name}: {count} calls")
```

---

## 🎭 The Meditation Sequence

Self-graphing is a meditation on code structure. It follows four stages:

### Stage 1: Observation
The tool scans its own source code:
- What functions exist?
- How are they named?
- What parameters do they take?

**Result**: A list of symbols with metadata

### Stage 2: Awareness
The tool becomes aware of relationships:
- Which functions call which?
- What is the depth of call chains?
- What is the structure of logic?

**Result**: A call graph showing dependencies

### Stage 3: Insight
The tool crystallizes understanding:
- What are the core operations?
- What is the orchestration pattern?
- What are the hot paths?

**Result**: Actionable insights about structure

### Stage 4: Acceptance
The tool accepts its nature:
- It is heuristic-based (not perfect)
- It is conservative (favors correctness)
- It is intentional (designed this way)

**Result**: Humility and wisdom

---

## 📁 Files Generated

### self_graph.json
The IR describing OgraphX's structure:
```json
{
  "files": ["ographx_py.py", "ographx_ts.py"],
  "symbols": [
    {
      "id": "ographx_py.py::build_ir",
      "file": "ographx_py.py",
      "kind": "function",
      "name": "build_ir",
      "exported": true,
      "params_contract": "contract_0",
      "range": [219, 232]
    },
    ...
  ],
  "calls": [
    {
      "frm": "ographx_py.py::build_ir",
      "to": "ographx_py.py::walk_py_files",
      "name": "walk_py_files",
      "line": 225
    },
    ...
  ],
  "contracts": [...]
}
```

### analyze_self_graph.py
Analysis script that reveals insights from the self-graph.

---

## 🎯 Use Cases

### 1. Validate the Tool
Run OgraphX on itself to prove it works on real code.

### 2. Understand Structure
Explore the self-graph to understand how OgraphX is organized.

### 3. Optimize Performance
Identify hot paths and optimize them.

### 4. Support Refactoring
Use the self-graph as a baseline before refactoring.

### 5. Generate Documentation
Auto-generate architecture documentation from the self-graph.

### 6. Track Evolution
Compare self-graphs over time to see how the tool evolves.

---

## 🔧 Advanced Usage

### Generate Sequences from Self-Graph

```python
# Use the self-graph to generate sequences
# (Future enhancement)
```

### Visualize Call Graph as SVG

```python
# Generate SVG visualization
# Nodes = functions
# Edges = calls
# (Future enhancement)
```

### Compare Self-Graphs Over Time

```python
# Track structural changes
# Identify refactoring opportunities
# (Future enhancement)
```

---

## 🧘 The Deeper Meaning

Self-graphing is a practice in:

| Practice | Meaning | Benefit |
|----------|---------|---------|
| **Observation** | Seeing code as it is | Clarity |
| **Awareness** | Understanding relationships | Insight |
| **Acceptance** | Acknowledging limitations | Humility |
| **Impermanence** | Recognizing change | Flexibility |
| **Interconnection** | Seeing how parts relate | Wisdom |

When OgraphX analyzes itself, it practices these principles. The tool becomes a mirror for understanding code—and through code, understanding ourselves.

---

## 📖 Documentation

- `SELF_GRAPHING.md` - Detailed explanation
- `SELF_GRAPHING_GUIDE.md` - This file
- `ographx_py.py` - Python extractor
- `ographx_ts.py` - TypeScript extractor
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

