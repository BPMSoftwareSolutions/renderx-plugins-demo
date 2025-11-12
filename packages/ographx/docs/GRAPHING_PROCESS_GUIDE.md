# OgraphX Codebase Graphing Process Guide

## Overview

OgraphX uses a **six-layer meditation pipeline** to graph any codebase. Each layer builds on the previous one, creating a complete understanding of code structure, relationships, and behavior.

## The Six Meditation Layers

### Layer 1: Core Extraction (Observation)
**What it does**: Extracts raw code structure into an Intermediate Representation (IR)

**Tools**:
- `ographx_ts.py` - TypeScript/JavaScript extractor
- `ographx_py.py` - Python extractor

**Process**:
1. Scans source files using regex patterns (heuristic-based, not AST)
2. Identifies symbols: functions, classes, methods
3. Discovers call edges: which functions call which
4. Captures contracts: parameter signatures and types
5. Outputs: `self_graph.json` (IR with symbols, calls, contracts)

**Input**: Source code files (`.ts`, `.tsx`, `.py`)  
**Output**: `self_graph.json` (JSON IR)

---

### Layer 2: Self-Observation (Awareness)
**What it does**: Validates and analyzes the extracted IR

**Process**:
1. Validates IR structure integrity
2. Checks symbol definitions
3. Verifies call edge consistency
4. Validates contract definitions
5. Stores validated IR in `.ographx/self-observation/`

**Input**: `self_graph.json`  
**Output**: Validated IR in `.ographx/self-observation/`

---

### Layer 3: Sequences (Insight)
**What it does**: Converts IR into Conductor sequences (movements & beats)

**Tool**: `generate_self_sequences.py`

**Process**:
1. Builds call graph from IR
2. Performs DFS traversal (depth-limited to 3)
3. Creates movements for each exported symbol
4. Creates beats for each call in the chain
5. Outputs: `self_sequences.json`

**Input**: `self_graph.json`  
**Output**: `self_sequences.json` (Conductor format)

---

### Layer 4: Visualization (Communication)
**What it does**: Generates Mermaid diagrams and SVG visualizations

**Tools**:
- `generate_orchestration_diagram.py` - Symbol relationships
- `generate_sequence_flow.py` - Sequence flows and timelines
- `convert_to_svg.py` - Mermaid to SVG conversion

**Process**:
1. Generates orchestration diagram (call graph structure)
2. Generates sequence flow diagram (beat timelines)
3. Converts Mermaid diagrams to SVG
4. Stores in `.ographx/visualization/`

**Input**: `self_graph.json`, `self_sequences.json`  
**Output**: `.mmd` files and `.svg` files

---

### Layer 5: Analysis (Telemetry)
**What it does**: Extracts metrics and insights from the graph

**Tool**: `analyze_self_graph.py`

**Process**:
1. Calculates complexity metrics
2. Identifies coverage gaps
3. Analyzes call patterns
4. Extracts performance indicators
5. Outputs: `self_graph_analysis.json`

**Input**: `self_graph.json`, `self_sequences.json`  
**Output**: `self_graph_analysis.json` (telemetry)

---

### Layer 6: Inter-Awareness (Expansion)
**What it does**: Cross-system analysis and comparison

**Tools** (planned):
- `conductor_analyzer.py` - Analyze Conductor systems
- `plugin_analyzer.py` - Analyze plugin architectures
- `shell_analyzer.py` - Analyze shell implementations

**Process**:
1. Compares multiple graphs
2. Identifies patterns across systems
3. Validates architectural consistency
4. Generates cross-system insights

---

## Typical Workflow

### Quick Start: Graph a New Codebase

```bash
# 1. Navigate to ographx
cd packages/ographx

# 2. Run the complete pipeline
python generators/regenerate_all.py

# 3. View outputs
ls -la .ographx/
```

### Step-by-Step Process

```bash
# Step 1: Extract IR (Layer 1)
python core/ographx_ts.py --root /path/to/code --out .ographx/self_graph.json

# Step 2: Generate Sequences (Layer 3)
python generators/generate_self_sequences.py

# Step 3: Generate Diagrams (Layer 4)
python generators/generate_orchestration_diagram.py
python generators/generate_sequence_flow.py

# Step 4: Convert to SVG (Layer 4)
python generators/convert_to_svg.py

# Step 5: Extract Analysis (Layer 5)
python analysis/analyze_self_graph.py
```

### Integrated into Build Pipeline

The pipeline is automatically triggered during:

```bash
npm run build              # Regenerates all graphs after build
npm run dev                # Regenerates graphs before dev server
npm run pre:manifests      # Regenerates graphs before manifest generation
npm run pretest            # Regenerates test graph before tests
```

---

## Output Structure

```
.ographx/
├── self-observation/           # Layer 2: Validated IR
│   └── self_graph_validated.json
├── sequences/                  # Layer 3: Conductor sequences
│   └── self_sequences.json
├── visualization/              # Layer 4: Diagrams & SVG
│   ├── orchestration_diagram.mmd
│   ├── orchestration_diagram.svg
│   ├── sequence_flow_diagram.mmd
│   └── sequence_flow_diagram.svg
└── analysis/                   # Layer 5: Telemetry
    └── self_graph_analysis.json
```

---

## Key Concepts

### Intermediate Representation (IR)
- JSON format containing symbols, calls, and contracts
- Single source of truth for code structure
- Language-agnostic (can be extended for any language)

### Symbols
- Functions, classes, methods
- Includes metadata: file, line range, exported status
- Contracts capture parameter signatures

### Call Edges
- Represents function calls
- Includes caller, callee, call name, line number
- Used to build call graphs

### Sequences
- Conductor format (movements & beats)
- Movements = exported functions/methods
- Beats = calls within the sequence

### Contracts
- Parameter signatures and types
- Used for data flow analysis
- Enables validation between layers

---

## When to Use Each Layer

| Layer | Use Case |
|-------|----------|
| 1 | Extract code structure for any analysis |
| 2 | Validate code integrity |
| 3 | Generate orchestration sequences |
| 4 | Visualize code relationships |
| 5 | Extract metrics and insights |
| 6 | Compare multiple systems |

---

## Extending for New Codebases

To graph a new codebase:

1. **Identify the language** (TypeScript, Python, etc.)
2. **Use appropriate extractor** (ographx_ts.py or ographx_py.py)
3. **Run the pipeline** (regenerate_all.py)
4. **Review outputs** in `.ographx/`
5. **Analyze results** using Layer 5 telemetry

---

## Performance

Typical regeneration times:
- Extract IR: ~0.5s
- Generate Sequences: ~0.3s
- Generate Diagrams: ~0.4s
- Convert to SVG: ~0.2s
- Extract Analysis: ~0.2s
- **Total: ~1.4s**

---

## Next Steps

- Use Layer 4 visualizations for documentation
- Use Layer 5 analysis for quality gates
- Use Layer 6 for architectural validation
- Integrate into CI/CD pipelines

