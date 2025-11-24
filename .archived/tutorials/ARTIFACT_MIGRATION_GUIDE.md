# OgraphX Artifact System - Migration Guide

## Old System vs New System

### Old System (Before)

```
.ographx/
├── self-observation/
│   └── self_graph.json          # Only OgraphX itself
├── sequences/
│   ├── self_sequences.json
│   └── graphing-orchestration.json
├── visualization/
│   └── diagrams/
│       ├── *.mmd
│       └── *.svg
├── test-graphs/
│   ├── test_graph.mmd
│   └── test_structure.json
└── (other files)
```

**Problems**:
- ❌ Only supports OgraphX self-graphing
- ❌ No organization for multiple codebases
- ❌ Hard to track which artifacts belong where
- ❌ Not scalable
- ❌ Difficult to reproduce specific runs
- ❌ No master registry

### New System (After)

```
.ographx/
├── artifacts/
│   ├── renderx-web/
│   │   ├── config.json
│   │   ├── manifest.json
│   │   ├── ir/
│   │   │   └── graph.json
│   │   ├── sequences/
│   │   │   └── sequences.json
│   │   ├── visualization/
│   │   │   └── diagrams/
│   │   │       ├── *.mmd
│   │   │       └── *.svg
│   │   └── analysis/
│   │       └── analysis.json
│   ├── ographx-self/
│   │   └── (same structure)
│   └── ...
├── registry.json
└── (legacy files - can be archived)
```

**Benefits**:
- ✅ Supports unlimited codebases
- ✅ Clean organization per codebase
- ✅ Easy to track artifacts
- ✅ Fully scalable
- ✅ Reproducible configurations
- ✅ Master registry for all artifacts

## Migration Path

### Phase 1: Parallel Operation (Current)

Both systems can coexist:
- Old system: `.ographx/` (legacy)
- New system: `.ographx/artifacts/` (new)

**Action**: Start using new system for new codebases

```bash
# Old way (still works)
cd packages/ographx
python generators/regenerate_all.py

# New way (recommended)
python generators/graph_codebase.py --name renderx-web --roots packages,src/ui
```

### Phase 2: Migrate Existing Artifacts (Optional)

Move OgraphX self-graphing to new system:

```bash
# Create ographx-self codebase
python generators/graph_codebase.py \
  --name ographx-self \
  --roots core,generators,analysis \
  --exclude __pycache__,tests
```

### Phase 3: Archive Legacy System (Future)

Once all codebases are migrated:
- Archive old `.ographx/` files
- Keep only `.ographx/artifacts/` and `.ographx/registry.json`
- Update build scripts to use new system

## Usage Comparison

### Graphing a Codebase

**Old Way**:
```bash
# Had to modify regenerate_all.py or create custom scripts
# No built-in support for multiple codebases
```

**New Way**:
```bash
python generators/graph_codebase.py \
  --name renderx-web \
  --roots packages,src/ui \
  --exclude robotics,ographx
```

### Finding Artifacts

**Old Way**:
```bash
# All artifacts mixed in .ographx/
ls .ographx/
# Hard to know which artifacts belong to which codebase
```

**New Way**:
```bash
# Clear organization per codebase
ls .ographx/artifacts/renderx-web/
# Easy to find everything for a specific codebase
```

### Tracking Codebases

**Old Way**:
```bash
# No registry - had to manually track
# No way to know what was graphed
```

**New Way**:
```bash
# Master registry
cat .ographx/registry.json | python -m json.tool
# See all codebases, when they were created, their configs
```

### Reproducing a Run

**Old Way**:
```bash
# Configuration lost - had to remember parameters
# Hard to reproduce exact same run
```

**New Way**:
```bash
# Configuration stored with artifacts
cat .ographx/artifacts/renderx-web/config.json
# Can reproduce exact same run anytime
```

## Implementation Timeline

### Week 1: Foundation
- ✅ Create `ArtifactManager` class
- ✅ Create `ArtifactConfig` class
- ✅ Create `ArtifactManifest` class
- ✅ Create `CodebaseGrapher` orchestrator
- ✅ Create documentation

### Week 2: Integration
- [ ] Create `extract_codebase.py` wrapper
- [ ] Create `generate_sequences.py` wrapper
- [ ] Create `generate_diagrams.py` wrapper
- [ ] Create `analyze_graph.py` wrapper
- [ ] Update build pipeline

### Week 3: CLI & Tools
- [ ] Create CLI commands
- [ ] Create web dashboard (optional)
- [ ] Create comparison tools
- [ ] Create migration scripts

### Week 4: Production
- [ ] Full testing
- [ ] Documentation complete
- [ ] Archive legacy system
- [ ] Deploy to production

## Backward Compatibility

### Old Scripts Still Work

The old `regenerate_all.py` still works for OgraphX self-graphing:

```bash
cd packages/ographx
python generators/regenerate_all.py
```

This generates artifacts in the old location (`.ographx/`).

### Coexistence

Both systems can run simultaneously:
- Old system: `.ographx/` (legacy)
- New system: `.ographx/artifacts/` (new)

No conflicts or overwrites.

## Migration Checklist

- [ ] Review new system documentation
- [ ] Test graphing a codebase with new system
- [ ] Review generated artifacts
- [ ] Check registry
- [ ] Verify all artifact types generated
- [ ] Test programmatic access to artifacts
- [ ] Update build scripts (when ready)
- [ ] Archive old system (when ready)

## FAQ

### Q: Do I have to migrate?
**A**: No, both systems can coexist. Migrate when ready.

### Q: Will old artifacts be lost?
**A**: No, they remain in `.ographx/`. New system uses `.ographx/artifacts/`.

### Q: Can I use both systems?
**A**: Yes, they don't conflict. Use old for OgraphX self, new for other codebases.

### Q: How do I migrate existing artifacts?
**A**: Re-run graphing with new system. It will regenerate in new location.

### Q: What about build scripts?
**A**: Update them to use new system when ready. Old scripts still work.

### Q: Is there a performance difference?
**A**: No, same pipeline. New system just organizes artifacts better.

## Next Steps

1. **Start using new system** for new codebases
2. **Keep old system** for OgraphX self-graphing (for now)
3. **Monitor both systems** to ensure everything works
4. **Migrate gradually** as you're ready
5. **Archive legacy** when all codebases migrated

---

**Current Status**: ✅ **NEW SYSTEM READY**  
**Backward Compatibility**: ✅ **MAINTAINED**  
**Migration Path**: ✅ **DEFINED**  
**Ready to Use**: ✅ **YES**

