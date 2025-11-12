# OgraphX Orchestration Visualization Guide

This guide explains how to visualize OgraphX's self-observation through powerful Mermaid diagrams.

## Overview

OgraphX generates three layers of visualization:

1. **IR Layer** - Intermediate Representation (symbols, calls, contracts)
2. **Sequence Layer** - Musical Conductor sequences (movements, beats)
3. **Visualization Layer** - Mermaid diagrams showing orchestration

## Generated Diagrams

### 1. Summary Diagram (`summary_diagram.md`)

**Purpose**: High-level overview of the entire system

**Shows**:
- IR Layer: 31 Symbols, 283 Calls, 19 Contracts
- Sequence Layer: 31 Sequences, 31 Movements, 4000 Beats
- Musical Notation: Key, Tempo, Dynamics

**Use case**: Quick understanding of scale and structure

---

### 2. Orchestration Diagram (`orchestration_diagram.md`)

**Purpose**: Hierarchical view of sequences, movements, and beats

**Structure**:
```
Root (OgraphX Self-Orchestration)
  └─ Category (ANALYSIS)
      ├─ Sequence 1 (Symbol Flow)
      │   └─ Movement (calls)
      │       ├─ Beat 1: noop
      │       └─ ...
      ├─ Sequence 2 (CallEdge Flow)
      │   └─ Movement (calls)
      │       ├─ Beat 1: noop
      │       └─ ...
      └─ Sequence N (normalize_type Flow)
          └─ Movement (calls)
              ├─ Beat 1: normalize_type
              ├─ Beat 2: sub
              ├─ Beat 3: strip
              └─ ...
```

**Use case**: Understanding the complete hierarchy

---

### 3. Call Graph Diagram (`call_graph_diagram.md`)

**Purpose**: Network of symbols and function calls

**Shows**:
- Classes (📦): Symbol, CallEdge, Contract, IR, etc.
- Functions (⚙️): normalize_type, extract_imports, etc.
- Edges: Function calls with labels

**Use case**: Understanding dependencies and relationships

---

### 4. Sequence Flow Diagram (`sequence_flow_diagram.md`)

**Purpose**: Detailed beat-by-beat orchestration for key sequences

**Shows**:
- normalize_type Flow (3 beats)
- extract_imports Flow (5 beats)
- extract_symbols_and_calls Flow (53 beats)

**Use case**: Understanding the complete flow of complex sequences

---

### 5. Beat Timeline (`beat_timeline.md`)

**Purpose**: Linear timeline of all beats in a sequence

**Shows**: Complete beat sequence from start to finish

**Example**: extract_symbols_and_calls Flow
```
Start → extract_symbols_and_calls → extract_imports → extract_imports 
  → splitlines → match → strip → group → splitlines → strip → startswith 
  → match → group → basename → append → Symbol → match → group → group 
  → basename → ... (53 beats total)
```

**Use case**: Understanding the complete execution flow

---

## How to Generate Diagrams

### Generate All Diagrams

```bash
cd packages/ographx/.ographx
python generate_orchestration_diagram.py
python generate_sequence_flow.py
```

### Output Files

- `summary_diagram.md` - Summary visualization
- `orchestration_diagram.md` - Full orchestration hierarchy
- `call_graph_diagram.md` - Call graph network
- `sequence_flow_diagram.md` - Detailed sequence flows
- `beat_timeline.md` - Beat timeline

---

## Interpreting the Diagrams

### Colors

- **Green** (#4CAF50): Root/Start nodes
- **Blue** (#2196F3): Categories
- **Purple** (#9C27B0): Sequences
- **Orange** (#FF9800): Movements
- **Red** (#F44336): Beats

### Symbols

- **📦**: Classes/Data structures
- **⚙️**: Functions/Methods
- **🎵**: Sequences
- **🧘**: Root/Meditation

### Musical Notation

- **Key**: C Major (standard key)
- **Tempo**: 100 BPM (beats per minute)
- **Dynamics**: pp (pianissimo) to mf (mezzo-forte)
- **Timing**: immediate (no delay)

---

## The Meditation

These diagrams represent OgraphX's self-awareness:

1. **Observation** - See the structure (IR Layer)
2. **Awareness** - Understand the organization (Sequence Layer)
3. **Insight** - Visualize the relationships (Visualization Layer)
4. **Acceptance** - Embrace the complexity

Each diagram is a meditation on code structure—the tool observing itself.

---

## Advanced Usage

### Customize Diagrams

Edit the generation scripts to:
- Change colors and styling
- Limit depth or breadth
- Focus on specific sequences
- Add custom annotations

### Integrate with Tools

Use the generated `.md` files with:
- GitHub (renders Mermaid natively)
- Markdown viewers
- Documentation generators
- Visualization tools

### Export Diagrams

Mermaid diagrams can be exported to:
- PNG/SVG (via Mermaid CLI)
- PDF (via browser print)
- HTML (via Mermaid Live Editor)

---

## Files

- `generate_orchestration_diagram.py` - Main diagram generator
- `generate_sequence_flow.py` - Sequence flow generator
- `ORCHESTRATION_DIAGRAMS.md` - Diagram reference
- `VISUALIZATION_GUIDE.md` - This file

