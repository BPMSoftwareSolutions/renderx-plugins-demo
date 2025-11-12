# OgraphX Artifact Management - Quick Start Guide

## TL;DR - Graph a Codebase in 30 Seconds

```bash
cd packages/ographx

# Graph RenderX web variant
python generators/graph_codebase.py \
  --name renderx-web \
  --roots packages,src/ui \
  --exclude robotics,ographx,node_modules

# Done! All artifacts are in: .ographx/artifacts/renderx-web/
```

## What Gets Generated?

For each codebase, you get:

```
.ographx/artifacts/renderx-web/
├── config.json                    # Your configuration
├── manifest.json                  # Artifact metadata
├── ir/
│   └── graph.json                # 543 files, 1010 symbols, 4579 calls
├── sequences/
│   └── sequences.json            # Conductor format sequences
├── visualization/
│   └── diagrams/
│       ├── orchestration_diagram.mmd + .svg
│       ├── sequence_flow_diagram.mmd + .svg
│       ├── call_graph_diagram.mmd + .svg
│       ├── beat_timeline.mmd + .svg
│       └── summary_diagram.mmd + .svg
└── analysis/
    └── analysis.json             # Metrics and telemetry
```

## Common Tasks

### 1. Graph a New Codebase

```bash
python generators/graph_codebase.py \
  --name my-codebase \
  --roots src,lib \
  --exclude node_modules,dist,tests
```

### 2. List All Graphed Codebases

```bash
python -c "
from core.artifact_manager import ArtifactManager
manager = ArtifactManager()
for cb in manager.list_codebases():
    print(f'  • {cb}')
"
```

### 3. View Codebase Info

```bash
python -c "
from core.artifact_manager import ArtifactManager
manager = ArtifactManager()
info = manager.get_codebase_info('renderx-web')
print(info)
"
```

### 4. Access Artifacts Programmatically

```python
from core.artifact_manager import ArtifactManager
import json

manager = ArtifactManager()
codebase_dir = manager.get_codebase_dir('renderx-web')

# Read IR
with open(codebase_dir / 'ir' / 'graph.json') as f:
    ir = json.load(f)
    print(f"Symbols: {len(ir['symbols'])}")
    print(f"Calls: {len(ir['calls'])}")

# Read manifest
with open(codebase_dir / 'manifest.json') as f:
    manifest = json.load(f)
    print(f"Generated: {manifest['generated_at']}")
```

### 5. View Master Registry

```bash
cat .ographx/registry.json | python -m json.tool
```

## Directory Structure

```
.ographx/
├── artifacts/                    # All codebase artifacts
│   ├── renderx-web/             # Codebase 1
│   ├── ographx-self/            # Codebase 2
│   └── ...
├── registry.json                # Master registry
└── (legacy files from old system)
```

## Pipeline Movements

Each codebase goes through 7 movements:

| # | Movement | What It Does | Output |
|---|----------|-------------|--------|
| 1 | **Extraction** | Scans source code, extracts symbols & calls | `ir/graph.json` |
| 2 | **Validation** | Validates IR structure | Validated IR |
| 3 | **Sequences** | Generates Conductor sequences | `sequences/sequences.json` |
| 4 | **Visualization** | Creates Mermaid diagrams | `visualization/diagrams/*.mmd` |
| 5 | **SVG Export** | Converts diagrams to SVG | `visualization/diagrams/*.svg` |
| 6 | **Analysis** | Extracts metrics & telemetry | `analysis/analysis.json` |
| 7 | **Finalization** | Saves manifest & verifies | `manifest.json` |

## Configuration Options

### Command Line

```bash
python generators/graph_codebase.py \
  --name <codebase-name>           # Required: unique name
  --roots <dir1,dir2,dir3>         # Required: directories to graph
  --exclude <dir1,dir2>            # Optional: directories to skip
  --base-dir <path>                # Optional: artifacts base directory
```

### Configuration File

Create `my-codebase.json`:
```json
{
  "name": "my-codebase",
  "root_dirs": ["src", "lib"],
  "exclude_dirs": ["node_modules", "dist", "tests"]
}
```

Then run:
```bash
python generators/graph_codebase.py --config my-codebase.json
```

## Examples

### Example 1: Graph RenderX Web

```bash
python generators/graph_codebase.py \
  --name renderx-web \
  --roots packages,src/ui \
  --exclude robotics,ographx,node_modules,dist
```

### Example 2: Graph OgraphX Itself

```bash
python generators/graph_codebase.py \
  --name ographx-self \
  --roots core,generators,analysis \
  --exclude __pycache__,tests,.pytest_cache
```

### Example 3: Graph Multiple Codebases

```bash
# Create config files
echo '{
  "name": "renderx-web",
  "root_dirs": ["packages", "src/ui"],
  "exclude_dirs": ["robotics", "ographx"]
}' > renderx-web.json

echo '{
  "name": "ographx-self",
  "root_dirs": ["core", "generators", "analysis"],
  "exclude_dirs": ["__pycache__", "tests"]
}' > ographx-self.json

# Graph both
python generators/graph_codebase.py --config renderx-web.json
python generators/graph_codebase.py --config ographx-self.json

# View all
cat .ographx/registry.json | python -m json.tool
```

## Troubleshooting

### Q: Where are my artifacts?
**A:** Check `.ographx/artifacts/<codebase-name>/`

### Q: How do I see all codebases?
**A:** Run `cat .ographx/registry.json | python -m json.tool`

### Q: Can I re-graph a codebase?
**A:** Yes! Just run the command again. It will overwrite the previous artifacts.

### Q: How do I exclude more directories?
**A:** Use `--exclude dir1,dir2,dir3` (comma-separated, no spaces)

### Q: Can I use absolute paths?
**A:** Yes, both relative and absolute paths work for `--roots`

## Next Steps

1. **Graph your first codebase** - Use the TL;DR command above
2. **Review the artifacts** - Check the generated diagrams and IR
3. **Analyze the data** - Use the JSON IR for programmatic analysis
4. **Integrate with CI/CD** - Add to your build pipeline
5. **Graph more codebases** - Repeat for other projects

## Files

- **Main Script**: `packages/ographx/generators/graph_codebase.py`
- **Artifact Manager**: `packages/ographx/core/artifact_manager.py`
- **Documentation**: `packages/ographx/docs/ARTIFACT_MANAGEMENT.md`
- **Registry**: `.ographx/registry.json`

