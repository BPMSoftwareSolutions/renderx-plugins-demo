<!-- AUTO-GENERATED -->
<!-- Source: Final comprehensive repository cleanup -->
<!-- Generated: 2025-11-24T21:00:00Z -->
<!-- DO NOT EDIT - This is the master plan for complete root directory cleanup -->

# 📋 FINAL CLEANUP PLAN - Complete Root Directory Reorganization

## Current State Analysis

### Remaining Problematic Files in Root (49 files)

```
root/
├── 📝 Logs (13 files) - .logs/
│   ├── app_startup.log
│   ├── audit-output.log
│   ├── build.log
│   ├── console_output.log
│   ├── e2e_startup_test.log
│   ├── plugin_startup_output.log
│   ├── REACT_COMPONENT_VERIFICATION_TRACE.log
│   ├── test_output.log
│   ├── test-output.log
│   ├── test-run.log
│   ├── eslint-raw.txt
│   ├── eslint-raw2.txt (through eslint-raw8.txt = 8 more)
│   └── lint-output.txt
│
├── 🧪 Test Scripts & Utilities (11 files) - scripts/test/ or tests/
│   ├── capture-react-trace.cjs
│   ├── test-raw-log-parsing.js
│   ├── test-react-selection.cjs
│   ├── test-react-ws.cjs
│   ├── test-semantic-transform-live.js
│   ├── test-sequence-extraction.js
│   ├── test-sequence-parsing.js
│   ├── verify-react-dom.cjs
│   ├── verify-react-schema.cjs
│   ├── regenerate-diagnostics.js
│   └── [more...]
│
├── 🐍 Python Analysis Scripts (4 files) - scripts/analysis/
│   ├── analyze-gap.py
│   ├── log_analysis.py
│   ├── log_analysis_new.py
│   ├── theme_resource_auditor.py
│   └── validate_svg.py
│
├── ⚙️ Build/Tool Configs (6 files) - keep in root OR tools/
│   ├── cypress.config.ts
│   ├── eslint.config.js
│   ├── vite.config.js
│   ├── vitest.config.ts
│   ├── docker-compose.yml
│   └── Dockerfile
│
├── 🔧 PowerShell Scripts (1 file) - scripts/maintenance/
│   └── fix-lint-warnings.ps1
│
├── 🌐 Web Files (2 files) - public/ or tests/
│   ├── dashboard-demo.html
│   ├── index.html
│   ├── test-plugin-loading.html
│   └── sample.html
│
├── 📊 Visualization Assets (2 files) - docs/assets/ or public/
│   ├── catalog-analysis.svg
│   ├── telemetry-map.svg
│   └── RENDERX_CATALOG_ASCII_SKETCH.txt
│
├── ✅ Project Configs (2 files) - CHECK: Should stay?
│   ├── renderx-plugins-demo.sln
│   └── LICENSE
│
└── 📁 Orphaned JSON (1 file)
    └── orchestration-domains.json → Already exists in docs/governance/!
```

---

## Detailed Allocation Map

### Category 1: Logs → `.logs/`

| File | Size | Type | Action |
|------|------|------|--------|
| app_startup.log | 📄 | Log | MOVE → .logs/ |
| audit-output.log | 📄 | Log | MOVE → .logs/ |
| build.log | 📄 | Log | MOVE → .logs/ |
| console_output.log | 📄 | Log | MOVE → .logs/ |
| e2e_startup_test.log | 📄 | Log | MOVE → .logs/ |
| plugin_startup_output.log | 📄 | Log | MOVE → .logs/ |
| REACT_COMPONENT_VERIFICATION_TRACE.log | 📄 | Log | MOVE → .logs/ |
| test_output.log | 📄 | Log | MOVE → .logs/ |
| test-output.log | 📄 | Log | MOVE → .logs/ |
| test-run.log | 📄 | Log | MOVE → .logs/ |
| eslint-raw.txt | 📄 | Log | MOVE → .logs/ |
| eslint-raw2.txt through eslint-raw8.txt | 📄 | Logs | MOVE → .logs/ (8 files) |
| lint-output.txt | 📄 | Log | MOVE → .logs/ |

**Total**: 13 log files → `.logs/`

---

### Category 2: Test & Verification Scripts → `scripts/test/`

| File | Type | Purpose | Action |
|------|------|---------|--------|
| capture-react-trace.cjs | Test | React trace capture | MOVE → scripts/test/ |
| test-raw-log-parsing.js | Test | Log parsing verification | MOVE → scripts/test/ |
| test-react-selection.cjs | Test | React component testing | MOVE → scripts/test/ |
| test-react-ws.cjs | Test | WebSocket testing | MOVE → scripts/test/ |
| test-semantic-transform-live.js | Test | Semantic transform verification | MOVE → scripts/test/ |
| test-sequence-extraction.js | Test | Sequence extraction testing | MOVE → scripts/test/ |
| test-sequence-parsing.js | Test | Sequence parsing testing | MOVE → scripts/test/ |
| verify-react-dom.cjs | Test | React DOM verification | MOVE → scripts/test/ |
| verify-react-schema.cjs | Test | React schema verification | MOVE → scripts/test/ |
| regenerate-diagnostics.js | Test | Diagnostics regeneration | MOVE → scripts/test/ |

**Total**: 10 test scripts → `scripts/test/`

---

### Category 3: Python Analysis Tools → `scripts/analysis/`

| File | Type | Purpose | Action |
|------|------|---------|--------|
| analyze-gap.py | Python | Gap analysis | MOVE → scripts/analysis/ |
| log_analysis.py | Python | Log analysis | MOVE → scripts/analysis/ |
| log_analysis_new.py | Python | Enhanced log analysis | MOVE → scripts/analysis/ |
| theme_resource_auditor.py | Python | Theme resource auditing | MOVE → scripts/analysis/ |
| validate_svg.py | Python | SVG validation | MOVE → scripts/analysis/ |

**Total**: 5 Python scripts → `scripts/analysis/`

---

### Category 4: Build/Tool Configurations

**Decision: Keep in Root (Standard Practice)**
- ✅ cypress.config.ts (Cypress expects root)
- ✅ eslint.config.js (ESLint expects root)
- ✅ vite.config.js (Vite expects root)
- ✅ vitest.config.ts (Vitest expects root)

**Decision: Move to tools/ or keep?**
- ⚠️ docker-compose.yml → `tools/docker/` (optional - if you use Docker frequently)
- ⚠️ Dockerfile → `tools/docker/` (optional - matches docker-compose)

---

### Category 5: Maintenance Scripts → `scripts/maintenance/`

| File | Type | Purpose | Action |
|------|------|---------|--------|
| fix-lint-warnings.ps1 | PowerShell | Lint fixes | MOVE → scripts/maintenance/ |

**Total**: 1 maintenance script → `scripts/maintenance/`

---

### Category 6: Web/Demo Files

**Decision: Move to public/ (Standard Web Project Structure)**
- 🌐 dashboard-demo.html → `public/demos/`
- 🌐 index.html → `public/`
- 🌐 test-plugin-loading.html → `public/demos/` (or tests/)
- 🌐 sample.html → `public/demos/`

---

### Category 7: Visualization Assets

**Decision: Move to docs/assets/ (Documentation Assets)**
- 📊 catalog-analysis.svg → `docs/assets/`
- 📊 telemetry-map.svg → `docs/assets/`
- 📊 RENDERX_CATALOG_ASCII_SKETCH.txt → `docs/assets/`

---

### Category 8: Project Configuration Files

**Decision: Keep in Root (Industry Standard)**
- ✅ renderx-plugins-demo.sln (Visual Studio solution - must be at root)
- ✅ LICENSE (License files always at root)

**Status**: 2 files correctly positioned, no action needed

---

### Category 9: Orphaned/Duplicated Files

| File | Status | Action |
|------|--------|--------|
| orchestration-domains.json | ⚠️ DUPLICATE | Already moved to docs/governance/ - DELETE from root |

---

## Implementation Strategy

### Phase 1: Create Directory Structure

```powershell
# Create all target directories
New-Item -ItemType Directory -Force -Path `.logs`
New-Item -ItemType Directory -Force -Path `scripts/test`
New-Item -ItemType Directory -Force -Path `scripts/analysis`
New-Item -ItemType Directory -Force -Path `scripts/maintenance`
New-Item -ItemType Directory -Force -Path `public/demos`
New-Item -ItemType Directory -Force -Path `docs/assets`
New-Item -ItemType Directory -Force -Path `tools/docker` # optional
```

### Phase 2: Move Files by Category

**Move Logs**:
```powershell
Move-Item -Path "*.log", "eslint-raw*.txt", "lint-output.txt" -Destination ".logs/" -Force
```

**Move Test Scripts**:
```powershell
Move-Item -Path "capture-react-trace.cjs", "test-*.js", "test-*.cjs", "verify-*.cjs", "regenerate-diagnostics.js" -Destination "scripts/test/" -Force
```

**Move Python Scripts**:
```powershell
Move-Item -Path "*.py" -Destination "scripts/analysis/" -Force
```

**Move Maintenance Scripts**:
```powershell
Move-Item -Path "*.ps1" -Destination "scripts/maintenance/" -Force
```

**Move Web Files**:
```powershell
Move-Item -Path "dashboard-demo.html", "test-plugin-loading.html", "sample.html" -Destination "public/demos/" -Force
Move-Item -Path "index.html" -Destination "public/" -Force
```

**Move Visualization Assets**:
```powershell
Move-Item -Path "catalog-analysis.svg", "telemetry-map.svg", "RENDERX_CATALOG_ASCII_SKETCH.txt" -Destination "docs/assets/" -Force
```

**Move Docker Files (optional)**:
```powershell
Move-Item -Path "docker-compose.yml", "Dockerfile" -Destination "tools/docker/" -Force
```

**Delete Duplicate**:
```powershell
Remove-Item "orchestration-domains.json" -Force
```

---

## Expected Final Root State

```
root/
├── ✅ README.md
├── ✅ package.json
├── ✅ package-lock.json
├── ✅ tsconfig.json
├── ✅ tsconfig.base.json
├── ✅ LICENSE
├── ✅ renderx-plugins-demo.sln
│
├── ✅ cypress.config.ts
├── ✅ eslint.config.js
├── ✅ vite.config.js
├── ✅ vitest.config.ts
│
├── .logs/                    (13 log files)
├── .archived/                (228 orphaned docs)
├── .generated/               (build artifacts)
├── docs/                     (documentation)
├── public/                   (web assets)
├── scripts/                  (all scripts organized)
├── src/                      (source code)
├── tests/                    (test code)
├── node_modules/             (dependencies)
└── .venv/                    (Python env)

TOTAL IN ROOT: 12 files (very clean!)
```

---

## Risk Assessment

### 🟢 LOW RISK Operations

- Moving `.log` files (non-critical runtime artifacts)
- Moving test scripts (build not affected)
- Moving Python analysis tools (not imported by build)
- Moving web demo files (can update references in docs)
- Moving SVG assets (documentation only)

### ⚠️ VERIFY BEFORE MOVING

- Test scripts that might be referenced in package.json
- Any Python scripts called by build process
- HTML files that might be served by web server

### 🔴 DO NOT MOVE (Industry Standard)

- cypress.config.ts (Cypress tool expects root)
- eslint.config.js (ESLint expects root)
- vite.config.js (Vite expects root)
- vitest.config.ts (Vitest expects root)
- renderx-plugins-demo.sln (Visual Studio expects root)
- LICENSE (Convention: always at root)

---

## Verification Steps

### After Moving Files:

1. **Check package.json scripts**: Do they reference moved files?
   ```bash
   grep -n "test\|py\|log\|html" package.json
   ```

2. **Run build**: Ensure no broken references
   ```bash
   npm run build
   ```

3. **Verify configs work**: Tool-specific configs still accessible
   ```bash
   npm run test
   npm run lint
   ```

4. **Check CI/CD**: Any pipeline configs reference moved files?

---

## Summary Table

| Category | Files | Current | Target | Status |
|----------|-------|---------|--------|--------|
| Logs | 13 | root/ | .logs/ | ✅ Ready |
| Test Scripts | 10 | root/ | scripts/test/ | ✅ Ready |
| Python Tools | 5 | root/ | scripts/analysis/ | ✅ Ready |
| Maintenance | 1 | root/ | scripts/maintenance/ | ✅ Ready |
| Web Files | 4 | root/ | public/ | ✅ Ready |
| Assets | 3 | root/ | docs/assets/ | ✅ Ready |
| Build Configs | 4 | root/ | root/ (KEEP) | ✅ Correct |
| Project Configs | 2 | root/ | root/ (KEEP) | ✅ Correct |
| Orphaned | 1 | root/ | DELETE | ✅ Duplicate |
| **TOTAL** | **43** | **root/** | **organized** | **Ready** |

---

## Final Root State Comparison

### Before Cleanup (This Phase)
```
❌ 49 problematic files
   - 13 log files scattered
   - 10 test scripts in root
   - 5 Python tools at top level
   - 1 maintenance script
   - 4 web demo files
   - 3 visualization assets
   - 1 orphaned duplicate JSON
   - 4 build configs (correct)
   - 2 project configs (correct)
```

### After This Cleanup
```
✅ 12 files in root only
   ✅ 5 npm/TypeScript configs (essential)
   ✅ 2 project configs (LICENSE, .sln)
   ✅ 4 build tool configs (cypress, eslint, vite, vitest)
   ✅ 1 readme

🗂️ Organized:
   .logs/ → 13 log files
   scripts/test/ → 10 test utilities
   scripts/analysis/ → 5 Python tools
   scripts/maintenance/ → 1 maintenance script
   public/ → 4 web files
   docs/assets/ → 3 visualization files
```

---

## Complete Repository Structure (Final)

```
root/
├── 📄 README.md
├── 📦 package.json
├── 📦 package-lock.json
├── ⚙️ tsconfig.json
├── ⚙️ tsconfig.base.json
├── 📋 LICENSE
├── 🔷 renderx-plugins-demo.sln
├── 🔧 cypress.config.ts
├── 🔧 eslint.config.js
├── 🔧 vite.config.js
├── 🔧 vitest.config.ts
│
├── 📁 .logs/
│   ├── app_startup.log
│   ├── build.log
│   ├── test-run.log
│   └── [... 10 more log files]
│
├── 📁 .archived/                        ← Phase 1
│   └── [228 orphaned documentation files]
│
├── 📁 .generated/                       ← Phase 2
│   ├── json-allocation-report.json
│   ├── json-relocation-report.json
│   └── [... other artifacts]
│
├── 📁 docs/
│   ├── governance/                      ← Phase 2
│   │   └── [13 md + 6 json governance files]
│   ├── telemetry/                       ← Phase 2
│   │   └── [5 telemetry files]
│   ├── assets/                          ← Phase 3
│   │   ├── catalog-analysis.svg
│   │   ├── telemetry-map.svg
│   │   └── RENDERX_CATALOG_ASCII_SKETCH.txt
│   └── [... other docs]
│
├── 📁 public/                           ← Phase 3
│   ├── index.html
│   └── demos/
│       ├── dashboard-demo.html
│       ├── test-plugin-loading.html
│       └── sample.html
│
├── 📁 scripts/
│   ├── test/                            ← Phase 3
│   │   ├── capture-react-trace.cjs
│   │   ├── test-react-selection.cjs
│   │   └── [... 8 more test scripts]
│   ├── analysis/                        ← Phase 3
│   │   ├── analyze-gap.py
│   │   ├── log_analysis.py
│   │   └── [... 3 more Python tools]
│   ├── maintenance/                     ← Phase 3
│   │   └── fix-lint-warnings.ps1
│   └── [... other scripts from earlier]
│
├── 📁 src/
│   └── [source code - unchanged]
│
├── 📁 tests/
│   └── [test code - unchanged]
│
├── 📁 tools/                           ← Optional Phase 3
│   └── docker/
│       ├── Dockerfile
│       └── docker-compose.yml
│
├── 📁 node_modules/
│   └── [dependencies]
│
└── 📁 .venv/
    └── [Python environment]
```

---

## Implementation Timeline

**Phase 3 (This Phase)**: Final Root Cleanup

- ✅ Step 1: Create directory structure (.logs, scripts/*, public/*, docs/assets/, tools/)
- ✅ Step 2: Move log files → .logs/
- ✅ Step 3: Move test scripts → scripts/test/
- ✅ Step 4: Move Python tools → scripts/analysis/
- ✅ Step 5: Move maintenance scripts → scripts/maintenance/
- ✅ Step 6: Move web files → public/
- ✅ Step 7: Move visualization assets → docs/assets/
- ✅ Step 8: Move Docker files → tools/docker/ (optional)
- ✅ Step 9: Delete orphaned duplicate JSON
- ✅ Step 10: Build and verify
- ✅ Step 11: Document final state

---

**Status**: 🟡 READY FOR EXECUTION

**Next Command**: `npm run cleanup:final` (to be created)

**Estimated Time**: 5-10 minutes

**Risk Level**: 🟢 LOW

Generated: 2025-11-24T21:00:00Z  
Version: 1.0.0 - Complete Final Cleanup Plan
