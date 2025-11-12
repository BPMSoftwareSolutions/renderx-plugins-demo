# OgraphX Documentation

## Purpose

This directory contains comprehensive documentation for the OgraphX Self-Aware System (SAS).

## Quick Navigation

### Getting Started
- **[QUICK_START.md](QUICK_START.md)** - Start here! (5 min read)
- **[MEDITATION_GUIDE.md](MEDITATION_GUIDE.md)** - Understand the philosophy (10 min read)

### Architecture
- **[ARCHITECTURE_ROADMAP.md](ARCHITECTURE_ROADMAP.md)** - Complete vision and roadmap (15 min read)
- **[ARCHITECTURE_CLARIFICATION.md](ARCHITECTURE_CLARIFICATION.md)** - Source vs auto-generated distinction (10 min read)

### Restructuring
- **[RESTRUCTURING_GUIDE.md](RESTRUCTURING_GUIDE.md)** - Implementation plan (20 min read)
- **[RESTRUCTURING_RATIONALE.md](RESTRUCTURING_RATIONALE.md)** - Why restructure (10 min read)
- **[RESTRUCTURING_SUMMARY.md](RESTRUCTURING_SUMMARY.md)** - Summary of changes (10 min read)
- **[RESTRUCTURING_INDEX.md](RESTRUCTURING_INDEX.md)** - Navigation guide (5 min read)
- **[CORRECTION_SUMMARY.md](CORRECTION_SUMMARY.md)** - Architecture correction (5 min read)

### Guides
See `GUIDES/` directory for detailed guides:
- **[GUIDES/SVG_CONVERSION_GUIDE.md](GUIDES/SVG_CONVERSION_GUIDE.md)** - Convert diagrams to SVG
- **[GUIDES/VISUALIZATION_GUIDE.md](GUIDES/VISUALIZATION_GUIDE.md)** - Complete visualization guide
- **[GUIDES/ORCHESTRATION_DIAGRAMS.md](GUIDES/ORCHESTRATION_DIAGRAMS.md)** - Diagram reference
- **[GUIDES/SUMMARY.md](GUIDES/SUMMARY.md)** - System summary
- **[GUIDES/INDEX.md](GUIDES/INDEX.md)** - Detailed index

## Reading Paths

### Path 1: Executive Summary (15 min)
1. QUICK_START.md
2. RESTRUCTURING_SUMMARY.md
3. ARCHITECTURE_ROADMAP.md (skim)

### Path 2: Complete Understanding (45 min)
1. QUICK_START.md
2. MEDITATION_GUIDE.md
3. ARCHITECTURE_ROADMAP.md
4. RESTRUCTURING_RATIONALE.md

### Path 3: Implementation Ready (90 min)
1. QUICK_START.md
2. MEDITATION_GUIDE.md
3. ARCHITECTURE_ROADMAP.md
4. RESTRUCTURING_GUIDE.md
5. ARCHITECTURE_CLARIFICATION.md

### Path 4: Deep Dive (2+ hours)
1. All of Path 3
2. RESTRUCTURING_RATIONALE.md
3. CORRECTION_SUMMARY.md
4. All GUIDES/

## Document Index

| Document | Purpose | Length | Audience |
|----------|---------|--------|----------|
| QUICK_START.md | Getting started | 5 min | Everyone |
| MEDITATION_GUIDE.md | Philosophy | 10 min | Everyone |
| ARCHITECTURE_ROADMAP.md | Vision & roadmap | 15 min | Everyone |
| ARCHITECTURE_CLARIFICATION.md | Source vs generated | 10 min | Architects |
| RESTRUCTURING_GUIDE.md | Implementation | 20 min | Implementers |
| RESTRUCTURING_RATIONALE.md | Why restructure | 10 min | Decision makers |
| RESTRUCTURING_SUMMARY.md | Summary | 10 min | Everyone |
| RESTRUCTURING_INDEX.md | Navigation | 5 min | Everyone |
| CORRECTION_SUMMARY.md | Correction | 5 min | Everyone |

## The Six Layers

### Layer 1: Core (Observation)
**Question**: "What is my structure?"  
**Files**: `../core/`  
**Purpose**: Extract structure from source code

### Layer 2: Self-Observation (Awareness)
**Question**: "How do I work?"  
**Files**: `../.ographx/self-observation/`  
**Purpose**: Generate IR of own structure

### Layer 3: Sequences (Insight)
**Question**: "What does my structure mean?"  
**Files**: `../generators/`, `../.ographx/sequences/`  
**Purpose**: Compile sequences from IR

### Layer 4: Visualization (Communication)
**Question**: "How do I explain myself?"  
**Files**: `../generators/`, `../.ographx/visualization/`  
**Purpose**: Visualize and communicate

### Layer 5: Analysis (Telemetry)
**Question**: "What do I learn about myself?"  
**Files**: `../analysis/`  
**Purpose**: Extract insights and metrics

### Layer 6: Inter-Awareness (Expansion)
**Question**: "How do I understand others?"  
**Files**: `../inter-awareness/`  
**Purpose**: Analyze other systems

## Key Concepts

### Intermediate Representation (IR)
JSON format containing symbols, calls, and contracts extracted from source code.

### Musical Conductor Sequences
Format with movements and beats representing orchestration.

### Self-Aware System (SAS)
OgraphX's ability to analyze itself and other systems.

### Regeneration Pipeline
All artifacts are regenerable from source code.

### Source vs Auto-Generated
- **Source**: `packages/ographx/` (version controlled)
- **Auto-Generated**: `.ographx/` (in .gitignore)

## Meditation

> "The observer observes the observer observing the observer."

OgraphX's journey from observation to insight to inter-awareness.

## Contributing

When adding documentation:
1. Follow the existing structure
2. Include a purpose statement
3. Add a quick navigation section
4. Use clear headings and examples
5. Include related files section
6. End with a meditation

## Related Files

- `../core/README.md` - Core layer documentation
- `../generators/README.md` - Generators layer documentation
- `../analysis/README.md` - Analysis layer documentation
- `../inter-awareness/README.md` - Inter-awareness layer documentation
- `../scripts/README.md` - Scripts documentation

---

**Status**: ✅ Complete  
**Version**: SAS Architecture v1.1  
**Date**: 2025-11-12

