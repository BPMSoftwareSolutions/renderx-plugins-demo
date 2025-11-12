# OgraphX Artifact Management System

## Overview

The Artifact Management System provides a scalable, organized way to generate and store graph artifacts for multiple codebases. Each codebase gets a dedicated folder with all its artifacts organized by type.

## Architecture

### Directory Structure

```
.ographx/
├── artifacts/                          # Master artifacts directory
│   ├── renderx-web/                   # Codebase 1
│   │   ├── config.json                # Codebase configuration
│   │   ├── manifest.json              # Artifact manifest
│   │   ├── ir/
│   │   │   └── graph.json             # Intermediate representation
│   │   ├── sequences/
│   │   │   ├── sequences.json         # Conductor sequences
│   │   │   └── orchestration.json     # Pipeline orchestration
│   │   ├── visualization/
│   │   │   ├── diagrams/
│   │   │   │   ├── *.mmd              # Mermaid diagrams
│   │   │   │   └── *.svg              # SVG exports
│   │   │   └── metadata.json
│   │   └── analysis/
│   │       ├── analysis.json          # Analysis telemetry
│   │       └── metrics.json           # Metrics and coverage
│   │
│   ├── ographx-self/                  # Codebase 2 (OgraphX itself)
│   │   └── ... (same structure)
│   │
│   └── ... (more codebases)
│
└── registry.json                       # Master registry of all artifacts
```

### Key Components

#### 1. **ArtifactConfig**
Defines what to graph for a codebase:
```python
config = ArtifactConfig(
    name="renderx-web",
    root_dirs=["packages", "src/ui"],
    exclude_dirs=["robotics", "ographx", "node_modules"]
)
```

#### 2. **ArtifactManifest**
Tracks all artifacts and statistics for a codebase:
```json
{
  "codebase_name": "renderx-web",
  "generated_at": "2025-11-12T...",
  "statistics": {
    "files": 543,
    "symbols": 1010,
    "calls": 4579,
    "contracts": 927
  },
  "artifacts": {
    "ir": "path/to/graph.json",
    "sequences": ["path/to/sequences.json"],
    "visualizations": ["path/to/diagram.mmd", "path/to/diagram.svg"],
    "analysis": "path/to/analysis.json"
  }
}
```

#### 3. **ArtifactManager**
Manages folder creation, registration, and retrieval:
```python
manager = ArtifactManager()
codebase_dir = manager.create_codebase_folder("renderx-web", config)
manager.list_codebases()  # ["renderx-web", "ographx-self", ...]
```

#### 4. **CodebaseGrapher**
Orchestrates the complete pipeline for a codebase:
```python
grapher = CodebaseGrapher("renderx-web", ["packages", "src/ui"])
grapher.run()  # Executes all 7 movements
```

## Usage

### Command Line

Graph a codebase with command-line arguments:
```bash
cd packages/ographx

python generators/graph_codebase.py \
  --name renderx-web \
  --roots packages,src/ui \
  --exclude robotics,ographx,node_modules
```

### Python API

```python
from core.artifact_manager import ArtifactManager, ArtifactConfig
from generators.graph_codebase import CodebaseGrapher

# Create configuration
config = ArtifactConfig(
    name="my-codebase",
    root_dirs=["src", "lib"],
    exclude_dirs=["node_modules", "dist"]
)

# Create grapher
grapher = CodebaseGrapher("my-codebase", config.root_dirs, config.exclude_dirs)

# Run pipeline
exit_code = grapher.run()
```

### Configuration File

Create a `codebase-config.json`:
```json
{
  "name": "renderx-web",
  "root_dirs": ["packages", "src/ui"],
  "exclude_dirs": ["robotics", "ographx", "node_modules", "dist"]
}
```

Then run:
```bash
python generators/graph_codebase.py --config codebase-config.json
```

## Pipeline Movements

The graphing pipeline executes 7 movements:

| Movement | Purpose | Output |
|----------|---------|--------|
| **1. Core Extraction** | Extract IR from source code | `ir/graph.json` |
| **2. Validation** | Validate IR structure | Validated IR |
| **3. Sequences** | Generate Conductor sequences | `sequences/sequences.json` |
| **4. Visualization** | Generate Mermaid diagrams | `visualization/diagrams/*.mmd` |
| **5. SVG Export** | Convert diagrams to SVG | `visualization/diagrams/*.svg` |
| **6. Analysis** | Extract metrics and telemetry | `analysis/analysis.json` |
| **7. Finalization** | Verify and save manifest | `manifest.json` |

## Registry System

The master registry (`registry.json`) tracks all codebases:

```json
{
  "version": "0.1.0",
  "codebases": {
    "renderx-web": {
      "path": ".ographx/artifacts/renderx-web",
      "created_at": "2025-11-12T...",
      "config": { ... }
    },
    "ographx-self": {
      "path": ".ographx/artifacts/ographx-self",
      "created_at": "2025-11-12T...",
      "config": { ... }
    }
  }
}
```

### Registry Operations

```python
manager = ArtifactManager()

# List all codebases
codebases = manager.list_codebases()

# Get codebase info
info = manager.get_codebase_info("renderx-web")

# Get codebase directory
codebase_dir = manager.get_codebase_dir("renderx-web")
```

## Scalability Features

### 1. **Isolated Artifacts**
Each codebase has its own folder - no conflicts or overwrites.

### 2. **Centralized Registry**
Master registry enables:
- Quick lookup of all codebases
- Metadata tracking
- Audit trail

### 3. **Modular Pipeline**
Each movement is independent:
- Can run individual steps
- Easy to add new movements
- Parallel execution possible

### 4. **Extensible Configuration**
Support for:
- Multiple root directories
- Flexible exclusion patterns
- Custom metadata

## Examples

### Example 1: Graph RenderX Web Variant

```bash
python generators/graph_codebase.py \
  --name renderx-web \
  --roots packages,src/ui \
  --exclude robotics,ographx,node_modules,dist
```

Result:
```
.ographx/artifacts/renderx-web/
├── config.json
├── manifest.json
├── ir/graph.json (543 files, 1010 symbols, 4579 calls)
├── sequences/sequences.json
├── visualization/diagrams/ (5 diagrams + SVG)
└── analysis/analysis.json
```

### Example 2: Graph OgraphX Itself

```bash
python generators/graph_codebase.py \
  --name ographx-self \
  --roots core,generators,analysis \
  --exclude __pycache__,tests
```

### Example 3: Graph Multiple Codebases

```bash
# Create configs
cat > renderx-web.json << EOF
{
  "name": "renderx-web",
  "root_dirs": ["packages", "src/ui"],
  "exclude_dirs": ["robotics", "ographx"]
}
EOF

cat > ographx-self.json << EOF
{
  "name": "ographx-self",
  "root_dirs": ["core", "generators", "analysis"],
  "exclude_dirs": ["__pycache__", "tests"]
}
EOF

# Graph both
python generators/graph_codebase.py --config renderx-web.json
python generators/graph_codebase.py --config ographx-self.json

# View registry
cat .ographx/registry.json
```

## Benefits

✅ **Organized** - All artifacts in dedicated folders  
✅ **Scalable** - Support unlimited codebases  
✅ **Trackable** - Master registry for all artifacts  
✅ **Reproducible** - Configuration stored with artifacts  
✅ **Auditable** - Timestamps and metadata  
✅ **Modular** - Independent pipeline movements  
✅ **Extensible** - Easy to add new codebases or movements  

## Next Steps

1. Implement `extract_codebase.py` wrapper for flexible extraction
2. Create `generate_sequences.py` for codebase-agnostic sequence generation
3. Create `generate_diagrams.py` for codebase-agnostic diagram generation
4. Create `analyze_graph.py` for codebase-agnostic analysis
5. Add CLI commands for common operations
6. Integrate with build pipeline

