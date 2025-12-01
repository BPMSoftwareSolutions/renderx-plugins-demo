<!-- AUTO-GENERATED -->
<!-- Source: orchestration-audit-system-project-plan.json (governanceDocumentation.framework.governanceRules) -->
<!-- Generated: 2025-12-01T02:54:27.533Z -->
<!-- DO NOT EDIT - Regenerate with: npm run build -->

# Documentation Auto-Generation Governance Framework

**Status**: Architecture Pattern Enforcement  
**Version**: 1.0.0  
**Enforced Since**: 2025-01-09

---

## Core Principle

**"JSON is Authority, Markdown is Reflection"**

All documentation must be auto-generated from JSON source-of-truth to prevent documentation/architecture drift

---

## Governance Rule Set

### Single Source of Truth (SSoT)
- **Level**: CRITICAL
- **Requirement**: Every system has exactly ONE authoritative JSON file as source-of-truth
- **Reflection**: All documentation generated FROM that JSON
- **Enforcement**: CI/CD blocks commits with manually-edited generated docs

### Auto-Generation Pipeline
- **Level**: CRITICAL
- **Requirement**: Every JSON authority file MUST have a corresponding generation script
- **Pipeline**: All generation scripts run in pre:manifests pipeline before build
- **Order**: Registry generation (creates JSON) → Documentation generation (reads JSON)
- **Enforcement**: Automatically enforced on every npm run build

### Generated Document Marking
- **Level**: HIGH
- **Header**: All auto-generated markdown files MUST have <!-- AUTO-GENERATED -->
- **Footer**: All auto-generated files MUST have <!-- DO NOT EDIT - Regenerate with: npm run build -->
- **Audit**: Scripts scan for manually-edited marked files and fail build

### No Manual Documentation
- **Level**: CRITICAL
- **Prohibition**: Developers MUST NOT hand-write documentation marked as auto-generated
- **Alternative**: Update the JSON source → script regenerates the markdown
- **Enforcement**: Pre-commit hook blocks commits that edit auto-generated files

---

## Current Implementation Status

### ✅ Implemented Patterns

| Pattern | Source JSON | Generation Script | Status |
|---------|------------|-------------------|--------|
| Orchestration Domains | `orchestration-domains.json` | `scripts/generate-orchestration-domains-from-sequences.js` | ✅ active |
| Orchestration Audit | `orchestration-audit-system-project-plan.json` | `scripts/gen-orchestration-docs.js` | ✅ active |
| Telemetry Governance | `orchestration-audit-system-project-plan.json` | `scripts/generate-telemetry-*.js (4 scripts)` | ✅ active |

---

## Enforcement Mechanisms

### Pre-Commit Hook
- **Purpose**: Prevent committing edited auto-generated files
- **Action**: Blocks commits if ANY auto-generated file modified

### CI Validation Script
- **Purpose**: Fail build if governance violations detected
- **Checks**:
  - All auto-generated files marked with <!-- AUTO-GENERATED -->
  - No manually-edited marked files
  - All JSON authorities have generation scripts

### Audit Script
- **Purpose**: Report governance compliance status

---

## Architecture Enforcement

The pattern is self-enforcing:
1. **JSON is Authority** - All rules stored in orchestration-audit-system-project-plan.json
2. **Markdown is Reflection** - This file is generated FROM the JSON
3. **Auto-Marked** - This file itself displays `<!-- AUTO-GENERATED -->` proving compliance
4. **Build-Time** - On every `npm run build`, this document regenerates from JSON
5. **Anti-Drift** - Impossible to edit this file without editing the JSON source

---

**Framework generated successfully. Documentation is now drift-proof.**

<!-- DO NOT EDIT - Regenerate with: npm run build -->
