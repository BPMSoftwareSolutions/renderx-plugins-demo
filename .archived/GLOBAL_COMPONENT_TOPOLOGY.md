# RenderX Plugins - Component Topology Guide

*Generated from: `.generated/global-traceability-map.json`*
*Last Updated: 2025-11-23T21:09:45.429Z*

## Overview

This guide maps all components, their roles, health status, and integration points in the RenderX plugins monorepo.

## Active Components

| Component | Type | Role | Status | Health Score | Risk Level |
|-----------|------|------|--------|--------------|-----------|
| Canvas | plugin | runtime-component | active | 49.31 | CRITICAL |
| Canvas Component | plugin | runtime-component | active | 49.31 | CRITICAL |
| Library Component | plugin | runtime-component | active | 46.8 | MEDIUM |
| Control Panel | plugin | runtime-component | active | 51.45 | MEDIUM |
| Host SDK | library | runtime-library | active | 56.08 | MEDIUM |
| Library | plugin | runtime-component | active | 46.8 | MEDIUM |
| Musical Conductor | library | runtime-library | active | N/A | UNKNOWN |
| Self-Healing System | plugin | automation-engine | active | N/A | UNKNOWN |
| Real Estate Analyzer | analysis-tool | example-plugin | active | N/A | UNKNOWN |
| Manifest Tools | library | build-tool | active | N/A | UNKNOWN |
| Components | library | runtime-library | active | N/A | UNKNOWN |
| Header | plugin | runtime-component | active | 56.04 | UNKNOWN |
| Digital Assets | asset-library | build-artifact | active | N/A | UNKNOWN |
| Telemetry Workbench | tool | development-tool | active | N/A | UNKNOWN |


## Critical Components (Requires Immediate Attention)

### Canvas

- **Path:** `packages/canvas`
- **Health Score:** 49.31
- **Risk Level:** CRITICAL
- **Issues:**

### Canvas Component

- **Path:** `packages/canvas-component`
- **Health Score:** 49.31
- **Risk Level:** CRITICAL
- **Issues:**
  - Render throttle missing (187 occurrences)
  - Concurrent canvas creation race condition (34 occurrences)
- **Self-Healing:** Ready (can be auto-remediated)

## Standalone Tools

These packages are NOT runtime components but provide value through analysis:

### OGraphX

- **Role:** standalone-analysis-tool
- **Description:** Standalone tool that generates sequence flows, self-awareness artifacts, symbol extraction, and call graphs
- **Note:** NOT part of runtime host; produces static analysis artifacts consumed by telemetry system
- **Outputs:**
  - sequences: .ographx/artifacts/renderx-web/catalog/
  - symbol_graph: .ographx/artifacts/renderx-web/ir/graph.json
  - analysis: .ographx/artifacts/renderx-web/analysis/

## Deprecated Packages

### Robotics

- **Status:** deprecated
- **Reason:** Orphaned CAD/STEP file processing - unrelated to RenderX core mission
- **Recommendation:** Remove in next major version
- **Action Required:** DO NOT INTEGRATE INTO SLO/SLA/DASHBOARD SYSTEMS

