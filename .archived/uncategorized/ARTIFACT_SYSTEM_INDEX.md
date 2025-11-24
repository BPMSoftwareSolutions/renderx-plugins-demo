# OgraphX Artifact Management System - Complete Index

## 🎯 Overview

The OgraphX Artifact Management System provides a **scalable, organized way to generate and store graph artifacts for multiple codebases**. Each codebase gets a dedicated folder with all its artifacts organized by type.

## 📚 Documentation Map

### Getting Started (Start Here!)
1. **[ARTIFACT_QUICK_START.md](ARTIFACT_QUICK_START.md)** ⭐ START HERE
   - TL;DR - Graph a codebase in 30 seconds
   - Common tasks
   - Quick examples
   - Troubleshooting

### Complete Documentation
2. **[ARTIFACT_MANAGEMENT.md](ARTIFACT_MANAGEMENT.md)** - Full System Guide
   - Architecture overview
   - Directory structure
   - Component descriptions
   - Usage examples
   - Registry system
   - Scalability features

3. **[ARTIFACT_SYSTEM_SUMMARY.md](ARTIFACT_SYSTEM_SUMMARY.md)** - System Overview
   - Problem solved
   - Architecture components
   - Usage patterns
   - Pipeline movements
   - Master registry
   - Benefits and features

### Migration & Comparison
4. **[ARTIFACT_MIGRATION_GUIDE.md](ARTIFACT_MIGRATION_GUIDE.md)** - Old vs New
   - Old system vs new system comparison
   - Migration path
   - Backward compatibility
   - Implementation timeline
   - Migration checklist

### This File
5. **[ARTIFACT_SYSTEM_INDEX.md](ARTIFACT_SYSTEM_INDEX.md)** - This Index
   - Documentation map
   - File locations
   - Quick reference
   - Component guide

## 🗂️ File Locations

### Core Implementation
```
packages/ographx/
├── core/
│   └── artifact_manager.py          # Core classes
│       ├── ArtifactConfig
│       ├── ArtifactManifest
│       └── ArtifactManager
│
└── generators/
    └── graph_codebase.py            # Pipeline orchestrator
        └── CodebaseGrapher
```

### Documentation
```
packages/ographx/docs/
├── ARTIFACT_QUICK_START.md          # ⭐ START HERE
├── ARTIFACT_MANAGEMENT.md           # Complete guide
├── ARTIFACT_SYSTEM_SUMMARY.md       # Overview
├── ARTIFACT_MIGRATION_GUIDE.md      # Migration path
└── ARTIFACT_SYSTEM_INDEX.md         # This file
```

### Generated Artifacts
```
.ographx/
├── artifacts/                       # All codebase artifacts
│   ├── renderx-web/
│   │   ├── config.json
│   │   ├── manifest.json
│   │   ├── ir/
│   │   ├── sequences/
│   │   ├── visualization/
│   │   └── analysis/
│   └── ...
└── registry.json                    # Master registry
```

## 🚀 Quick Reference

### Command Line Usage

```bash
# Graph a codebase
python generators/graph_codebase.py \
  --name <name> \
  --roots <dir1,dir2> \
  --exclude <dir1,dir2>

# Example
python generators/graph_codebase.py \
  --name renderx-web \
  --roots packages,src/ui \
  --exclude robotics,ographx,node_modules
```

### Python API

```python
from generators.graph_codebase import CodebaseGrapher

grapher = CodebaseGrapher("renderx-web", ["packages", "src/ui"])
exit_code = grapher.run()
```

### View Registry

```bash
cat .ographx/registry.json | python -m json.tool
```

## 📦 Component Guide

### ArtifactConfig
**Purpose**: Defines what to graph for a codebase

```python
config = ArtifactConfig(
    name="renderx-web",
    root_dirs=["packages", "src/ui"],
    exclude_dirs=["robotics", "ographx"]
)
```

**Location**: `core/artifact_manager.py`

### ArtifactManifest
**Purpose**: Tracks all artifacts and statistics

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
  "artifacts": { ... }
}
```

**Location**: `core/artifact_manager.py`

### ArtifactManager
**Purpose**: Manages storage and registry

```python
manager = ArtifactManager()
codebase_dir = manager.create_codebase_folder("renderx-web", config)
manager.list_codebases()
```

**Location**: `core/artifact_manager.py`

### CodebaseGrapher
**Purpose**: Orchestrates the complete pipeline

```python
grapher = CodebaseGrapher("renderx-web", ["packages", "src/ui"])
exit_code = grapher.run()
```

**Location**: `generators/graph_codebase.py`

## 🎼 Pipeline Movements

| # | Movement | Purpose | Output |
|---|----------|---------|--------|
| 1 | **Extraction** | Extract IR from source | `ir/graph.json` |
| 2-3 | **Sequences** | Generate Conductor sequences | `sequences/sequences.json` |
| 4 | **Visualization** | Generate Mermaid diagrams | `visualization/diagrams/*.mmd` |
| 5 | **SVG Export** | Convert to SVG | `visualization/diagrams/*.svg` |
| 6 | **Analysis** | Extract metrics | `analysis/analysis.json` |
| 7 | **Finalization** | Save manifest | `manifest.json` |

## 📋 Master Registry

The `registry.json` file tracks all codebases:

```json
{
  "version": "0.1.0",
  "codebases": {
    "renderx-web": {
      "path": ".ographx/artifacts/renderx-web",
      "created_at": "2025-11-12T...",
      "config": { ... }
    }
  }
}
```

## ✨ Key Features

✅ **Scalable** - Support unlimited codebases  
✅ **Organized** - Dedicated folder per codebase  
✅ **Trackable** - Master registry for all artifacts  
✅ **Reproducible** - Configurations stored with artifacts  
✅ **Auditable** - Timestamps and metadata  
✅ **Modular** - Independent pipeline movements  
✅ **Extensible** - Easy to add new codebases  

## 🔄 Typical Workflow

### Step 1: Define Configuration
```bash
cat > my-codebase.json << EOF
{
  "name": "my-codebase",
  "root_dirs": ["src", "lib"],
  "exclude_dirs": ["node_modules", "dist"]
}
EOF
```

### Step 2: Graph the Codebase
```bash
python generators/graph_codebase.py --config my-codebase.json
```

### Step 3: Review Artifacts
```bash
ls -la .ographx/artifacts/my-codebase/
cat .ographx/artifacts/my-codebase/manifest.json
```

### Step 4: Analyze Results
```bash
# View IR statistics
python -c "
import json
with open('.ographx/artifacts/my-codebase/ir/graph.json') as f:
    ir = json.load(f)
    print(f'Symbols: {len(ir[\"symbols\"])}')
"
```

## 🎯 Common Tasks

### List All Codebases
```bash
python -c "
from core.artifact_manager import ArtifactManager
manager = ArtifactManager()
for cb in manager.list_codebases():
    print(f'  • {cb}')
"
```

### Get Codebase Info
```bash
python -c "
from core.artifact_manager import ArtifactManager
manager = ArtifactManager()
info = manager.get_codebase_info('renderx-web')
print(info)
"
```

### Access Artifacts
```python
from core.artifact_manager import ArtifactManager
import json

manager = ArtifactManager()
codebase_dir = manager.get_codebase_dir('renderx-web')

# Read IR
with open(codebase_dir / 'ir' / 'graph.json') as f:
    ir = json.load(f)
```

## 📖 Reading Guide

**If you want to...**

- **Get started quickly** → Read [ARTIFACT_QUICK_START.md](ARTIFACT_QUICK_START.md)
- **Understand the system** → Read [ARTIFACT_MANAGEMENT.md](ARTIFACT_MANAGEMENT.md)
- **See the big picture** → Read [ARTIFACT_SYSTEM_SUMMARY.md](ARTIFACT_SYSTEM_SUMMARY.md)
- **Migrate from old system** → Read [ARTIFACT_MIGRATION_GUIDE.md](ARTIFACT_MIGRATION_GUIDE.md)
- **Find something specific** → Use this index

## 🔗 Related Documentation

- **OgraphX Overview**: `packages/ographx/README.md`
- **Build Integration**: `packages/ographx/docs/BUILD_INTEGRATION.md`
- **Orchestration Guide**: `packages/ographx/docs/ORCHESTRATION_GUIDE.md`
- **Graphing Process**: `packages/ographx/docs/GRAPHING_PROCESS_GUIDE.md`

## 🚀 Getting Started

1. **Read** [ARTIFACT_QUICK_START.md](ARTIFACT_QUICK_START.md) (5 min)
2. **Run** your first graph (2 min)
3. **Review** generated artifacts (5 min)
4. **Check** the registry (1 min)
5. **Graph** more codebases (repeat)

## 📞 Support

For questions or issues:
1. Check [ARTIFACT_QUICK_START.md](ARTIFACT_QUICK_START.md) troubleshooting section
2. Review [ARTIFACT_MANAGEMENT.md](ARTIFACT_MANAGEMENT.md) for detailed info
3. Check [ARTIFACT_MIGRATION_GUIDE.md](ARTIFACT_MIGRATION_GUIDE.md) for migration help

---

**Status**: ✅ **COMPLETE & PRODUCTION READY**  
**Scalability**: ✅ **UNLIMITED CODEBASES**  
**Documentation**: ✅ **COMPREHENSIVE**  
**Ready to Use**: ✅ **YES**

