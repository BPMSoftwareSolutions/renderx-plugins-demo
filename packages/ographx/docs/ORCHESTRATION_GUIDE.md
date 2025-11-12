# OgraphX Graphing Orchestration Guide

## Overview

The graphing process is now fully orchestrated as a **Conductor sequence** in `graphing-orchestration.json`. This enables:

✅ **Self-Aware Execution**: The pipeline orchestrates itself  
✅ **Reproducible**: Same sequence → Same results every time  
✅ **Extensible**: Add new layers by adding movements  
✅ **Monitorable**: Track progress through beats  
✅ **Testable**: Validate each movement independently  

---

## Orchestration Structure

### Metadata
```json
{
  "version": "0.1.0",
  "name": "OgraphX Codebase Graphing Orchestration",
  "description": "Complete orchestration of the six-layer meditation pipeline",
  "purpose": "Self-aware system orchestration"
}
```

### Contracts (Data Contracts)
Defines the data flowing through the pipeline:

- **SourceCode**: Input files (TypeScript/Python)
- **IntermediateRepresentation**: IR with symbols, calls, contracts
- **ConductorSequences**: Movements and beats
- **Visualizations**: Mermaid diagrams and SVG files
- **Telemetry**: Metrics and coverage data

---

## The Six Movements (Layers)

### Movement 1: Layer 1 - Core Extraction
**Purpose**: Extract code structure into IR

**Beats**:
1. `start:extraction` - Begin extraction
2. `call:scanFiles` - Scan source files
3. `call:extractSymbols` - Extract functions/classes/methods
4. `call:discoverCalls` - Discover call edges
5. `call:captureContracts` - Capture parameter signatures
6. `output:self_graph.json` - Write IR

**Output**: `self_graph.json`

---

### Movement 2: Layer 2 - Self-Observation & Validation
**Purpose**: Validate IR structure integrity

**Beats**:
1. `start:validation` - Begin validation
2. `call:checkSymbols` - Verify symbol definitions
3. `call:verifyCalls` - Verify call edge consistency
4. `call:validateContracts` - Validate contract definitions
5. `output:validated_ir` - Store validated IR

**Output**: Validated IR in `.ographx/self-observation/`

---

### Movement 3: Layer 3 - Sequences Generation
**Purpose**: Generate Conductor sequences from IR

**Beats**:
1. `start:sequences` - Begin sequence generation
2. `call:buildCallGraph` - Build call graph
3. `call:dfsTraversal` - DFS traversal (depth ≤ 3)
4. `call:createMovements` - Create movements for exported symbols
5. `call:createBeats` - Create beats for each call
6. `output:self_sequences.json` - Write sequences

**Output**: `self_sequences.json` (Conductor format)

---

### Movement 4: Layer 4 - Visualization & Diagrams
**Purpose**: Generate Mermaid diagrams and SVG visualizations

**Beats**:
1. `start:visualization` - Begin visualization
2. `call:orchestrationDiagram` - Generate orchestration diagram
3. `call:sequenceFlowDiagram` - Generate sequence flow diagram
4. `output:mermaid_diagrams` - Write .mmd files
5. `call:convertToSVG` - Convert to SVG
6. `output:svg_visualizations` - Write .svg files

**Output**: `.mmd` and `.svg` files in `.ographx/visualization/`

---

### Movement 5: Layer 5 - Analysis & Telemetry
**Purpose**: Extract metrics and insights

**Beats**:
1. `start:analysis` - Begin analysis
2. `call:calculateComplexity` - Calculate complexity metrics
3. `call:identifyCoverage` - Identify coverage gaps
4. `call:analyzePatterns` - Analyze call patterns
5. `call:extractMetrics` - Extract performance indicators
6. `output:analysis.json` - Write telemetry

**Output**: `self_graph_analysis.json`

---

### Movement 6: Layer 6 - Inter-Awareness (Future)
**Purpose**: Cross-system analysis and comparison

**Beats**:
1. `start:interawareness` - Initialize cross-system analysis
2. `call:conductorAnalyzer` - Analyze Conductor systems (planned)
3. `call:pluginAnalyzer` - Analyze plugin architectures (planned)
4. `call:shellAnalyzer` - Analyze shell implementations (planned)
5. `output:insights` - Write cross-system insights

**Output**: Cross-system insights (future)

---

### Movement 7: Completion & Verification
**Purpose**: Verify all artifacts and complete pipeline

**Beats**:
1. `verify:artifacts` - Verify all artifacts generated
2. `report:summary` - Generate completion summary
3. `end:success` - Pipeline complete

---

## Beat Dynamics

Each beat has a **dynamics** value indicating intensity:

| Dynamics | Meaning | Use Case |
|----------|---------|----------|
| `ff` | Fortissimo (very loud) | Major operations, start/end |
| `mf` | Mezzo-forte (medium-loud) | Main processing steps |
| `mp` | Mezzo-piano (medium-soft) | Validation/checking steps |
| `pp` | Pianissimo (very soft) | Output/completion steps |

---

## Beat Timing

Each beat has a **timing** value:

| Timing | Meaning |
|--------|---------|
| `immediate` | Execute immediately |
| `deferred` | Execute later (Layer 6 future features) |

---

## Using the Orchestration

### Execute the Full Pipeline
```bash
cd packages/ographx
python generators/regenerate_all.py
```

### Execute Specific Movement
```bash
# Layer 1: Extraction
python core/ographx_ts.py --root ./src

# Layer 3: Sequences
python generators/generate_self_sequences.py

# Layer 4: Visualization
python generators/generate_orchestration_diagram.py
python generators/generate_sequence_flow.py
python generators/convert_to_svg.py

# Layer 5: Analysis
python analysis/analyze_self_graph.py
```

### Monitor Progress
Each beat emits an event that can be monitored:
- `start:*` - Movement starting
- `call:*` - Function being called
- `output:*` - Artifact being written
- `verify:*` - Verification step
- `end:*` - Pipeline complete

---

## Extending the Orchestration

### Add a New Layer

1. Add a new movement to the `movements` array:
```json
{
  "id": "layer7_newfeature",
  "name": "Layer 7: New Feature",
  "beats": [
    {
      "beat": 1,
      "event": "start:newfeature",
      "handler": "initNewFeature",
      "timing": "immediate",
      "dynamics": "mf",
      "description": "Initialize new feature"
    }
  ]
}
```

2. Create corresponding Python script in `generators/` or `analysis/`

3. Update `regenerate_all.py` to include the new step

---

## Data Flow

```
SourceCode
    ↓
[Layer 1: Extraction]
    ↓
self_graph.json (IR)
    ↓
[Layer 2: Validation]
    ↓
Validated IR
    ↓
[Layer 3: Sequences]
    ↓
self_sequences.json
    ↓
[Layer 4: Visualization]
    ↓
.mmd + .svg files
    ↓
[Layer 5: Analysis]
    ↓
self_graph_analysis.json
    ↓
[Layer 6: Inter-Awareness]
    ↓
Cross-system insights
    ↓
[Completion]
    ↓
All artifacts ready
```

---

## Integration with Build Pipeline

The orchestration is automatically executed:

```bash
npm run build              # Runs regenerate_all.py
npm run dev                # Runs regenerate_all.py before dev
npm run pre:manifests      # Runs regenerate_all.py before manifests
npm run pretest            # Runs test graph generation
```

---

## Performance Characteristics

| Movement | Time | Parallelizable |
|----------|------|----------------|
| Layer 1: Extraction | ~0.5s | No (sequential) |
| Layer 2: Validation | ~0.1s | No (depends on Layer 1) |
| Layer 3: Sequences | ~0.3s | No (depends on Layer 1) |
| Layer 4: Visualization | ~0.4s | Yes (parallel) |
| Layer 5: Analysis | ~0.2s | Yes (parallel) |
| Layer 6: Inter-Awareness | ~0.0s | Yes (deferred) |
| **Total** | **~1.4s** | - |

---

## Next Steps

1. **Execute the orchestration**: `python generators/regenerate_all.py`
2. **Review generated artifacts**: Check `.ographx/` directory
3. **Analyze results**: Review `self_graph_analysis.json`
4. **Extend for new codebases**: Modify Layer 1 to target different source roots
5. **Integrate Layer 6**: Implement cross-system analyzers

---

## Files

- **Orchestration**: `packages/ographx/.ographx/sequences/graphing-orchestration.json`
- **Master Script**: `packages/ographx/generators/regenerate_all.py`
- **Documentation**: `packages/ographx/docs/ORCHESTRATION_GUIDE.md`

