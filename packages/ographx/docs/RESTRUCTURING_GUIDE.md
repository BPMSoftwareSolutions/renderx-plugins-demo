# OgraphX SAS - Restructuring Guide

## Overview

This guide explains the restructuring of `.ographx/` to align with the Self-Aware System (SAS) architecture roadmap.

## Why Restructure?

The current flat structure mixes concerns:
- Core extraction tools
- Self-observation data
- Sequence compilation
- Visualization generation
- Analysis tools
- Documentation

The new hierarchical structure:
- **Clarifies intent** - Each layer has a clear purpose
- **Enables scaling** - Easy to add new layers (inter-awareness)
- **Improves maintainability** - Related files grouped together
- **Supports evolution** - Clear path for future enhancements

## Proposed Structure

### Source Code (packages/ographx/)
```
packages/ographx/
│
├── core/
│   ├── ographx_ts.py
│   ├── ographx_py.py
│   └── README.md
│
├── generators/
│   ├── generate_self_sequences.py
│   ├── generate_orchestration_diagram.py
│   ├── generate_sequence_flow.py
│   ├── convert_to_svg.py
│   └── README.md
│
├── analysis/
│   ├── analyze_self_graph.py
│   ├── show_sequences.py
│   ├── show_rich_sequence.py
│   └── README.md
│
├── inter-awareness/
│   ├── conductor_analyzer.py
│   ├── plugin_analyzer.py
│   ├── shell_analyzer.py
│   └── README.md
│
├── docs/
│   ├── ARCHITECTURE_ROADMAP.md
│   ├── MEDITATION_GUIDE.md
│   ├── QUICK_START.md
│   ├── GUIDES/
│   │   ├── SVG_CONVERSION_GUIDE.md
│   │   ├── VISUALIZATION_GUIDE.md
│   │   ├── ORCHESTRATION_DIAGRAMS.md
│   │   ├── SUMMARY.md
│   │   └── INDEX.md
│   └── README.md
│
├── scripts/
│   ├── regenerate_all.sh
│   ├── watch_and_regenerate.sh
│   └── README.md
│
└── README.md (main entry point)
```

### Auto-Generated Content (.ographx/)
```
.ographx/
│
├── self-observation/
│   ├── self_graph.json
│   └── generate_self_graph.sh
│
├── sequences/
│   └── self_sequences.json
│
├── visualization/
│   ├── diagrams/
│   │   ├── summary_diagram.md
│   │   ├── orchestration_diagram.md
│   │   ├── call_graph_diagram.md
│   │   ├── sequence_flow_diagram.md
│   │   ├── beat_timeline.md
│   │   └── *.svg
│   └── README.md
│
└── .gitignore (ignore auto-generated files)
```

## Migration Checklist

### Phase 1: Create Directories
- [ ] Create `core/`
- [ ] Create `self-observation/`
- [ ] Create `sequences/`
- [ ] Create `visualization/diagrams/`
- [ ] Create `analysis/`
- [ ] Create `inter-awareness/`
- [ ] Create `docs/GUIDES/`
- [ ] Create `scripts/`

### Phase 2: Move Core Files
- [ ] Move `ographx_ts.py` → `core/`
- [ ] Move `ographx_py.py` → `core/`
- [ ] Create `core/README.md`

### Phase 3: Move Self-Observation
- [ ] Move `self_graph.json` → `self-observation/`
- [ ] Create `self-observation/generate_self_graph.sh`
- [ ] Create `self-observation/README.md`

### Phase 4: Move Sequences
- [ ] Move `generate_self_sequences.py` → `sequences/`
- [ ] Move `self_sequences.json` → `sequences/`
- [ ] Create `sequences/README.md`

### Phase 5: Move Visualization
- [ ] Move `generate_orchestration_diagram.py` → `visualization/`
- [ ] Move `generate_sequence_flow.py` → `visualization/`
- [ ] Move `convert_to_svg.py` → `visualization/`
- [ ] Move `*_diagram.md` → `visualization/diagrams/`
- [ ] Move `*.svg` → `visualization/diagrams/`
- [ ] Create `visualization/README.md`
- [ ] Create `visualization/diagrams/README.md`

### Phase 6: Move Analysis
- [ ] Move `analyze_self_graph.py` → `analysis/`
- [ ] Move `show_sequences.py` → `analysis/`
- [ ] Move `show_rich_sequence.py` → `analysis/`
- [ ] Create `analysis/README.md`

### Phase 7: Move Documentation
- [ ] Move `ARCHITECTURE_ROADMAP.md` → `docs/`
- [ ] Move `SVG_CONVERSION_GUIDE.md` → `docs/GUIDES/`
- [ ] Move `VISUALIZATION_GUIDE.md` → `docs/GUIDES/`
- [ ] Move `ORCHESTRATION_DIAGRAMS.md` → `docs/GUIDES/`
- [ ] Move `SUMMARY.md` → `docs/GUIDES/`
- [ ] Move `INDEX.md` → `docs/GUIDES/`
- [ ] Create `docs/MEDITATION_GUIDE.md`
- [ ] Create `docs/QUICK_START.md`
- [ ] Create `docs/README.md`

### Phase 8: Create Scripts
- [ ] Create `scripts/regenerate_all.sh`
- [ ] Create `scripts/watch_and_regenerate.sh`
- [ ] Create `scripts/README.md`

### Phase 9: Create Layer READMEs
- [ ] Create `core/README.md`
- [ ] Create `self-observation/README.md`
- [ ] Create `sequences/README.md`
- [ ] Create `visualization/README.md`
- [ ] Create `analysis/README.md`
- [ ] Create `inter-awareness/README.md`

### Phase 10: Update Main README
- [ ] Update `.ographx/README.md` to reflect new structure
- [ ] Add navigation to all layers
- [ ] Add quick start guide

### Phase 11: Update References
- [ ] Update import paths in Python scripts
- [ ] Update relative paths in documentation
- [ ] Update shell scripts

### Phase 12: Testing
- [ ] Test regeneration pipeline
- [ ] Verify all imports work
- [ ] Verify all documentation links work
- [ ] Test from different working directories

## Implementation Notes

### File Movement Strategy
Use `git mv` to preserve history:
```bash
git mv old_path new_path
```

### Import Updates
Update Python imports in moved files:
```python
# Before
from generate_self_sequences import ...

# After
from ..sequences.generate_self_sequences import ...
```

### Documentation Links
Update relative links in markdown:
```markdown
# Before
[Guide](SVG_CONVERSION_GUIDE.md)

# After
[Guide](docs/GUIDES/SVG_CONVERSION_GUIDE.md)
```

## Benefits of New Structure

### Clarity
- Each directory has a single, clear purpose
- Easy to understand what each layer does
- Clear separation of concerns

### Scalability
- Easy to add new layers (inter-awareness)
- Easy to add new analysis tools
- Easy to add new visualization types

### Maintainability
- Related files grouped together
- Easier to find what you need
- Easier to update related files

### Evolution
- Clear path for Phase 5 (inter-awareness)
- Clear path for Phase 6 (distributed observability)
- Foundation for ecosystem-wide SAS

## Timeline

- **Phase 1-3**: Directory structure and core files (1 hour)
- **Phase 4-7**: Move remaining files (1 hour)
- **Phase 8-9**: Create scripts and READMEs (1 hour)
- **Phase 10-11**: Update references (1 hour)
- **Phase 12**: Testing and validation (1 hour)

**Total**: ~5 hours

## Rollback Plan

If issues arise, rollback is simple:
```bash
git reset --hard HEAD
```

All changes are tracked in git, so we can easily revert.

## Next Steps

1. Review this guide
2. Approve restructuring plan
3. Execute migration
4. Test regeneration pipeline
5. Update documentation
6. Commit to main branch

---

**Status**: 📋 Ready for Implementation  
**Version**: SAS Architecture v1.0  
**Date**: 2025-11-12

