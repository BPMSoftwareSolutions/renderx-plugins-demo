# OgraphX - Self-Aware System (SAS)

## 🧘 What is OgraphX?

OgraphX is a **Self-Aware System** that enables code to understand and analyze itself and other systems.

It's the foundation for ecosystem-wide observability and inter-system awareness.

## 🎯 Quick Start

```bash
cd packages/ographx

# 1. Generate IR (Intermediate Representation)
python core/ographx_ts.py . > .ographx/self-observation/self_graph.json

# 2. Generate sequences
python generators/generate_self_sequences.py

# 3. Generate diagrams
python generators/generate_orchestration_diagram.py
python generators/generate_sequence_flow.py

# 4. Convert to SVG
python generators/convert_to_svg.py --all --method api

# 5. Extract telemetry
python analysis/analyze_self_graph.py
```

## 📂 Directory Structure

```
packages/ographx/
│
├── core/                    # Layer 1: Core Extraction
│   ├── ographx_ts.py       # TypeScript extractor
│   ├── ographx_py.py       # Python extractor
│   └── README.md
│
├── generators/              # Layers 3-4: Sequences & Visualization
│   ├── generate_self_sequences.py
│   ├── generate_orchestration_diagram.py
│   ├── generate_sequence_flow.py
│   ├── convert_to_svg.py
│   └── README.md
│
├── analysis/                # Layer 5: Analysis & Telemetry
│   ├── analyze_self_graph.py
│   ├── show_sequences.py
│   ├── show_rich_sequence.py
│   └── README.md
│
├── inter-awareness/         # Layer 6: Inter-System Awareness
│   ├── conductor_analyzer.py (planned)
│   ├── plugin_analyzer.py (planned)
│   ├── shell_analyzer.py (planned)
│   └── README.md
│
├── docs/                    # Documentation
│   ├── ARCHITECTURE_ROADMAP.md
│   ├── MEDITATION_GUIDE.md
│   ├── QUICK_START.md
│   ├── GUIDES/
│   └── README.md
│
├── scripts/                 # Utility Scripts
│   ├── regenerate_all.sh (planned)
│   ├── watch_and_regenerate.sh (planned)
│   └── README.md
│
└── README.md (this file)
```

## 🧘 The Six Layers

| Layer | Purpose | Question | Status |
|-------|---------|----------|--------|
| 1: Core | Extraction | "What is my structure?" | ✅ Complete |
| 2: Self-Observation | IR Generation | "How do I work?" | ✅ Complete |
| 3: Sequences | Compilation | "What does my structure mean?" | ✅ Complete |
| 4: Visualization | Diagrams & SVG | "How do I explain myself?" | ✅ Complete |
| 5: Analysis | Telemetry | "What do I learn about myself?" | ✅ Complete |
| 6: Inter-Awareness | Other Systems | "How do I understand others?" | 📋 Planned |

## 📊 Key Metrics

- **31 Symbols** - Functions, classes, methods
- **283 Calls** - Function invocations
- **19 Contracts** - Parameter signatures
- **31 Sequences** - One per exported symbol
- **4000 Beats** - Total function calls

## 🔄 Data Flow

```
Source Code
    ↓
core/ographx_ts.py
    ↓
.ographx/self-observation/self_graph.json (IR)
    ↓
generators/generate_self_sequences.py
    ↓
.ographx/sequences/self_sequences.json
    ↓
generators/generate_orchestration_diagram.py
    ↓
.ographx/visualization/diagrams/*.md
    ↓
generators/convert_to_svg.py
    ↓
.ographx/visualization/diagrams/*.svg
    ↓
analysis/analyze_self_graph.py
    ↓
Insights & Metrics
```

## 📚 Documentation

### Getting Started
- **[docs/QUICK_START.md](docs/QUICK_START.md)** - Start here (5 min)
- **[docs/MEDITATION_GUIDE.md](docs/MEDITATION_GUIDE.md)** - Philosophy (10 min)

### Architecture
- **[docs/ARCHITECTURE_ROADMAP.md](docs/ARCHITECTURE_ROADMAP.md)** - Complete vision (15 min)
- **[docs/ARCHITECTURE_CLARIFICATION.md](docs/ARCHITECTURE_CLARIFICATION.md)** - Source vs auto-generated (10 min)

### Restructuring
- **[docs/RESTRUCTURING_GUIDE.md](docs/RESTRUCTURING_GUIDE.md)** - Implementation (20 min)
- **[docs/RESTRUCTURING_RATIONALE.md](docs/RESTRUCTURING_RATIONALE.md)** - Why restructure (10 min)

### Guides
- **[docs/GUIDES/](docs/GUIDES/)** - Detailed guides and references

## 🚀 Usage

### Extract Structure
```bash
python core/ographx_ts.py <source_file_or_directory>
```

### Generate Sequences
```bash
python generators/generate_self_sequences.py
```

### Generate Diagrams
```bash
python generators/generate_orchestration_diagram.py
python generators/generate_sequence_flow.py
```

### Convert to SVG
```bash
python generators/convert_to_svg.py --all --method api
```

### Analyze
```bash
python analysis/analyze_self_graph.py
python analysis/show_sequences.py
python analysis/show_rich_sequence.py
```

## 🎯 Architecture Principles

### 1. Source vs Auto-Generated
- **Source**: `packages/ographx/` (version controlled)
- **Auto-Generated**: `.ographx/` (in .gitignore)

### 2. Layered Architecture
Each layer has a single, clear purpose and feeds into the next layer.

### 3. Regeneration Pipeline
All artifacts are regenerable from source code.

### 4. Self-Awareness
OgraphX analyzes itself to demonstrate its capabilities.

### 5. Extensibility
Easy to add new layers (inter-awareness) and new analyzers.

## 🔮 Future Phases

### Phase 5: Inter-Awareness (Planned)
- Analyze Musical Conductor
- Analyze RenderX plugins
- Analyze desktop shell
- Create unified IR format

### Phase 6: Distributed Observability (Vision)
- Real-time system monitoring
- Cross-system dependency analysis
- Automated optimization suggestions
- Ecosystem-wide insights

## 🧘 The Meditation

> "The observer observes the observer observing the observer."

OgraphX's journey from observation to insight to inter-awareness.

## 📞 Getting Help

1. Read [docs/QUICK_START.md](docs/QUICK_START.md)
2. Read [docs/MEDITATION_GUIDE.md](docs/MEDITATION_GUIDE.md)
3. Read [docs/ARCHITECTURE_ROADMAP.md](docs/ARCHITECTURE_ROADMAP.md)
4. Check layer-specific READMEs:
   - [core/README.md](core/README.md)
   - [generators/README.md](generators/README.md)
   - [analysis/README.md](analysis/README.md)
   - [inter-awareness/README.md](inter-awareness/README.md)

## 📋 Status

- ✅ **Layers 1-5**: Complete
- 📋 **Layer 6**: Planned (Phase 5)
- 📋 **Scripts**: Planned
- ✅ **Documentation**: Complete

---

**Version**: SAS Architecture v1.1
**Date**: 2025-11-12
**Status**: ✅ Ready for Use

