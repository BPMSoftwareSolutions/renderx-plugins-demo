# Shell Upgrade - Architecture Enforcement Strategy

**Date:** 2025-11-08  
**Status:** Ready for Implementation  
**Purpose:** Ensure agents follow thin-host architecture pattern  

---

## Overview

This document outlines how the thin-host architecture pattern is enforced across all phases of the shell upgrade to prevent drift and ensure consistency.

---

## Enforcement Mechanisms

### 1. GitHub Issues (Primary Driver)

**Main Epic:** #369 - Upgrade RenderX.Shell.Avalonia from WebView2 to Thin Host

**Critical Section in Every Issue:**
```
## ⚠️ CRITICAL ARCHITECTURE CONSTRAINT

The shell MUST be a thin presentation layer that ONLY consumes SDKs as dependencies.

### ✅ REQUIRED:
- All services come from DI
- Shell contains ONLY UI controls
- All business logic delegated to SDKs

### ❌ FORBIDDEN:
- Custom SDK implementations
- Imports from RenderX.Shell.Avalonia.Core.Conductor/**
- Imports from RenderX.Shell.Avalonia.Core.Events/**
```

**Phase Issues:**
- #370: Phase 1 - Foundation (establishes pattern)
- #371: Phase 2 - UI Components (enforces pattern)
- #372: Phase 3 - Integration (maintains pattern)
- #373: Phase 4 - Cleanup (verifies pattern)

**Code Review Checklist in Every Issue:**
- [ ] No custom SDK implementations
- [ ] All services from DI
- [ ] No forbidden imports
- [ ] Roslyn analyzer passes

---

### 2. Roslyn Analyzer (Automated Enforcement)

**Project:** `src/RenderX.Shell.Avalonia.Analyzers`

**Rule:** `SHELL001` - Thin-host architecture violation

**What It Detects:**
- Imports from `RenderX.Shell.Avalonia.Core.Conductor/**`
- Imports from `RenderX.Shell.Avalonia.Core.Events/**`
- Any other forbidden patterns

**When It Runs:**
- Every build (integrated into project)
- CI/CD pipeline
- Pre-commit hooks (recommended)

**Example Violation:**
```csharp
// ❌ FORBIDDEN - Will trigger SHELL001
using RenderX.Shell.Avalonia.Core.Conductor;

public class CanvasControl
{
    private IConductor _conductor; // ERROR: SHELL001
}
```

**Correct Pattern:**
```csharp
// ✅ REQUIRED - No violation
using RenderX.HostSDK.Avalonia.Services;

public class CanvasControl
{
    private readonly IThinHostLayer _thinHost;
    
    public CanvasControl(IThinHostLayer thinHost)
    {
        _thinHost = thinHost;
        // Access Conductor via: _thinHost.Conductor
    }
}
```

---

### 3. Documentation (Clear Guidance)

**Files:**
- `SHELL_UPGRADE_README.md` - Architecture constraints section
- `SHELL_UPGRADE_IMPLEMENTATION_GUIDE.md` - Step-by-step instructions
- `SHELL_UPGRADE_QUICK_REFERENCE.md` - API reference
- `ADR-0015-SHELL-THIN-HOST-ARCHITECTURE.md` - Architecture decision

**Key Sections:**
- DO/DON'T lists
- Code examples
- Common mistakes
- Troubleshooting

---

### 4. Code Review (Human Verification)

**Checklist for Every PR:**

```markdown
## Architecture Verification

- [ ] No custom IEventRouter implementations
- [ ] No custom IConductor implementations
- [ ] All services injected via DI
- [ ] No imports from RenderX.Shell.Avalonia.Core.Conductor/**
- [ ] No imports from RenderX.Shell.Avalonia.Core.Events/**
- [ ] ThinHostLayer used for all SDK access
- [ ] No business logic in UI controls
- [ ] Roslyn analyzer passes (SHELL001)
- [ ] All tests pass
```

---

### 5. Tests (Validation)

**Analyzer Tests:**
- `ThinHostArchitectureAnalyzerTests.cs`
- Validates analyzer detects violations
- Validates analyzer allows correct patterns

**Integration Tests:**
- Verify ThinHostLayer initialization
- Verify SDK services accessible via DI
- Verify no custom implementations

**E2E Tests:**
- Verify UI functionality
- Verify event routing
- Verify conductor execution

---

## Enforcement Flow

```
Agent Starts Work
    ↓
Reads GitHub Issue
    ↓
Sees CRITICAL ARCHITECTURE CONSTRAINT
    ↓
Reads SHELL_UPGRADE_IMPLEMENTATION_GUIDE.md
    ↓
Implements Code
    ↓
Builds Project
    ↓
Roslyn Analyzer Runs (SHELL001)
    ↓
If Violations Found:
    ├─ Build Fails
    ├─ Error Message Shows Violation
    └─ Agent Fixes Code
    ↓
If No Violations:
    ├─ Build Succeeds
    └─ Code Review Checklist Verified
    ↓
PR Created
    ↓
Code Review (Human)
    ├─ Checks Architecture Checklist
    ├─ Verifies Tests Pass
    └─ Approves or Requests Changes
    ↓
Merge to Main
```

---

## What Agents Will See

### In GitHub Issue
```
## ⚠️ CRITICAL ARCHITECTURE CONSTRAINT

The shell MUST be a thin presentation layer that ONLY consumes SDKs as dependencies.

### ✅ REQUIRED:
- All services come from DI (RenderX.HostSDK.Avalonia or MusicalConductor.Avalonia)
- Shell contains ONLY UI controls and event routing
- All business logic delegated to SDKs
- Use Conductor's logging infrastructure

### ❌ FORBIDDEN:
- Custom implementations of SDK interfaces
- Duplicating logic from SDKs
- Imports from `RenderX.Shell.Avalonia.Core.Conductor/**`
- Imports from `RenderX.Shell.Avalonia.Core.Events/**`
- Custom IEventRouter, IConductor implementations
- Custom event routing or conductor logic
```

### In Build Output
```
error SHELL001: Shell code must not import from 'RenderX.Shell.Avalonia.Core.Conductor'. 
Use SDK services from DI instead.
  File: src/RenderX.Shell.Avalonia/UI/Views/CanvasControl.axaml.cs
  Line: 5
```

### In Code Review
```
## Architecture Verification

- [x] No custom IEventRouter implementations
- [x] No custom IConductor implementations
- [x] All services injected via DI
- [x] No imports from RenderX.Shell.Avalonia.Core.Conductor/**
- [x] No imports from RenderX.Shell.Avalonia.Core.Events/**
- [x] ThinHostLayer used for all SDK access
- [x] No business logic in UI controls
- [x] Roslyn analyzer passes (SHELL001)
- [x] All tests pass

✅ Approved - Architecture pattern maintained
```

---

## Success Criteria

- ✅ All agents understand thin-host pattern
- ✅ GitHub issues clearly state constraints
- ✅ Roslyn analyzer prevents violations
- ✅ Code reviews verify pattern
- ✅ Tests validate implementation
- ✅ No drift from architecture
- ✅ Consistent implementation across phases

---

## References

- GitHub Issue #369 (Main Epic)
- GitHub Issues #370-373 (Phase Issues)
- SHELL_UPGRADE_README.md
- SHELL_UPGRADE_IMPLEMENTATION_GUIDE.md
- ADR-0015-SHELL-THIN-HOST-ARCHITECTURE.md
- src/RenderX.Shell.Avalonia.Analyzers/ThinHostArchitectureAnalyzer.cs

---

**Version:** 1.0  
**Status:** Ready for Implementation  
**Last Updated:** 2025-11-08

