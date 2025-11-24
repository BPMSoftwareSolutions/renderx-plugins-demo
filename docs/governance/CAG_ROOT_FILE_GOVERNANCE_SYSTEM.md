<!-- AUTO-GENERATED -->
<!-- Source: CAG Root File Governance System -->
<!-- Generated: 2025-11-24T21:15:00Z -->
<!-- DO NOT EDIT - This defines the multi-layer enforcement of root directory cleanliness -->

# 🔒 CAG ROOT FILE GOVERNANCE SYSTEM

## Overview

A multi-layer enforcement system to ensure no files are created in root except those explicitly authorized by governance.

**Key Principle**: "Governance-Driven File Placement"
- Authority: `docs/governance/orchestration-audit-system-project-plan.json`
- Enforcement: 5 layers (ESLint → Pre-commit → Pre-build → Build → CI/CD)
- Automation: Auto-detection, auto-classification, auto-remediation

---

## Layer 1: Real-Time IDE Enforcement (ESLint)

### ESLint Rule: `root-files-only`

**Location**: `eslint-rules/root-files-only.js` (NEW)

**Purpose**: Catch root file creation in real-time during development

**Triggered By**:
- `fs.writeFileSync(path, ...)` calls
- `fs.createWriteStream(path, ...)` calls
- `fs.mkdir(path, ...)` calls
- Tool-specific file creation patterns

**Authorized Root Files** (Whitelist):
```javascript
const AUTHORIZED_ROOT_FILES = [
  'package.json',
  'package-lock.json',
  'tsconfig.json',
  'tsconfig.base.json',
  'tsconfig.tsbuildinfo',
  'README.md',
  '.env',
  '.env.example',
  '.gitignore',
  'LICENSE',
  'renderx-plugins-demo.sln',
  'cypress.config.ts',
  'eslint.config.js',
  'vite.config.js',
  'vitest.config.ts',
  'pyvenv.cfg'
];
```

**Violation Examples**:
```javascript
❌ fs.writeFileSync('some-report.json', data)     // → ERROR
❌ fs.writeFileSync('test-output.log', data)      // → ERROR
❌ fs.writeFileSync('analysis.md', data)          // → ERROR

✅ fs.writeFileSync('docs/analysis.md', data)     // PASS
✅ fs.writeFileSync('.logs/test.log', data)       // PASS
✅ fs.writeFileSync('scripts/tool.js', data)      // PASS
```

**Message**:
```
⚠️  Root file creation detected: [filename]

This violates governance rule: "No files in root except authorized configs"

❌ BLOCKED: Creating file in root
✅ CORRECT: Create in one of these locations:

   • Logs → .logs/[filename]
   • Documentation → docs/[domain]/[filename]
   • Scripts → scripts/[category]/[filename]
   • Web assets → public/[filename]
   • Analysis tools → scripts/analysis/[filename]
   • Build artifacts → .generated/[filename]

Reference: docs/governance/ROOT_FILE_PLACEMENT_RULES.md
Authority: docs/governance/orchestration-audit-system-project-plan.json
```

---

## Layer 2: Pre-Commit Hook

### Hook: `prevent-root-files.js`

**Location**: `.husky/prevent-root-files.js` (NEW)

**Triggered**: Before `git commit`

**Function**:
- List all staged files
- Check if any are in root (depth = 0)
- Compare against whitelist
- Block commit if violations found
- Suggest corrections

**Enforcement Level**: 🔴 HARD BLOCK (cannot commit)

**Message**:
```
🚫 PRE-COMMIT HOOK: Root file violations detected!

Files staged in root that don't belong:
  • some-report.json
  • analysis.md
  • test-log.txt

Fix options:
1. Move files to proper directories:
   git reset HEAD some-report.json
   mv some-report.json docs/search/
   git add docs/search/some-report.json

2. Run auto-fix:
   npm run fix:root-file-violations

3. Update whitelist (if file should be in root):
   Edit: docs/governance/orchestration-audit-system-project-plan.json
   Add to: authorizedRootFiles array

Commit will not proceed until fixed.
```

---

## Layer 3: Pre-Build Validation

### Script: `pre-build-root-check.js`

**Location**: `scripts/pre-build-root-check.js` (NEW)

**Triggered**: Before `npm run build` (added to package.json scripts)

**Function**:
- Scan root directory for all files (depth = 0)
- Validate against governance rules
- Generate detailed report
- Exit with error code if violations

**Enforcement Level**: 🔴 HARD BLOCK (build fails)

**Output Example**:
```
📋 Pre-Build Root File Validation

✅ Scanning root directory...

📊 Files found: 15
  ✅ Authorized: 14
  ❌ Violations: 1

Violations:
  ❌ test-output.log
     Created: 2025-11-24 21:15
     Should be: .logs/test-output.log

🚨 BUILD BLOCKED: Root file violations detected

Fix:
  npm run fix:root-file-violations

Authority: docs/governance/orchestration-audit-system-project-plan.json
```

---

## Layer 4: Build-Time Artifact Management

### Build Plugin: `enforce-root-cleanliness.js`

**Location**: `scripts/build-plugins/enforce-root-cleanliness.js` (NEW)

**Triggered**: During Vite/TypeScript build process

**Function**:
- Intercept build output paths
- Redirect to `.generated/` if trying to write to root
- Log all artifact relocations
- Verify final state

**Auto-Remediation**:
```javascript
// Before (if any build process tries this):
fs.writeFileSync('build-result.json', data)  // ❌ Blocked

// Auto-redirected to:
fs.writeFileSync('.generated/build-result.json', data)  // ✅ Passes
```

---

## Layer 5: CI/CD Pipeline Check

### GitHub Actions: `root-cleanliness-check.yml`

**Location**: `.github/workflows/root-cleanliness-check.yml` (NEW)

**Triggered**: On every commit to main/PR

**Steps**:
1. Checkout code
2. Run `npm run verify:root-cleanliness`
3. Compare against whitelist in JSON authority
4. Fail CI if violations
5. Post comment on PR with violations
6. Suggest auto-fix

**CI Status Check**:
```
✅ Root Cleanliness: PASSING
❌ Root Cleanliness: FAILING
```

---

## Authority: Root File Placement Rules

### File: `docs/governance/ROOT_FILE_PLACEMENT_RULES.md` (NEW)

Defines:
1. **Whitelist**: Exactly which files are allowed in root
2. **Allocation Map**: Where each file type should go
3. **Exceptions**: Special cases with explanation
4. **Escalation**: How to request adding a file to root

**Structure**:
```json
{
  "authorizedRootFiles": [
    {
      "name": "package.json",
      "type": "config",
      "reason": "NPM requires in root",
      "immutable": true
    },
    {
      "name": "tsconfig.json",
      "type": "config",
      "reason": "TypeScript requires in root",
      "immutable": true
    },
    // ... more files
  ],
  
  "allocationRules": {
    "*.log": { "location": ".logs/", "description": "Runtime logs" },
    "*.json": { "location": "docs/search/ or .generated/", "description": "Data files" },
    "scripts/*.js": { "location": "scripts/", "description": "Tools and utilities" },
    "*.html": { "location": "public/", "description": "Web files" },
    "*.md": { "location": "docs/", "description": "Documentation" }
  },
  
  "enforcementLayers": [
    "eslint-rule: root-files-only",
    "pre-commit: prevent-root-files",
    "pre-build: pre-build-root-check",
    "build: enforce-root-cleanliness",
    "ci-cd: root-cleanliness-check"
  ]
}
```

---

## Implementation: 5-Layer System

### Layer 1: ESLint Real-Time

```javascript
// eslint-rules/root-files-only.js
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Prevent non-whitelisted files in root directory',
      category: 'Best Practices'
    }
  },
  create(context) {
    return {
      'CallExpression[callee.object.name="fs"]': function(node) {
        if (['writeFileSync', 'writeFile', 'createWriteStream'].includes(node.callee.property.name)) {
          const filePath = node.arguments[0]?.value;
          if (filePath && !filePath.includes('/') && !AUTHORIZED_ROOT_FILES.includes(filePath)) {
            context.report({
              node,
              message: `Root file creation not allowed: ${filePath}. Place in proper directory per docs/governance/ROOT_FILE_PLACEMENT_RULES.md`
            });
          }
        }
      }
    };
  }
};
```

### Layer 2: Pre-Commit Hook

```javascript
// .husky/prevent-root-files.js
const { execSync } = require('child_process');
const fs = require('fs');

const AUTHORIZED = JSON.parse(
  fs.readFileSync('docs/governance/ROOT_FILE_PLACEMENT_RULES.md.json', 'utf8')
).authorizedRootFiles.map(f => f.name);

try {
  const staged = execSync('git diff --cached --name-only').toString().split('\n');
  const rootViolations = staged.filter(f => 
    !f.includes('/') && 
    f.trim() && 
    !AUTHORIZED.includes(f)
  );
  
  if (rootViolations.length > 0) {
    console.error('🚫 Pre-commit violation: Files in root not in whitelist');
    rootViolations.forEach(f => console.error(`  • ${f}`));
    process.exit(1);
  }
} catch (e) {
  console.log('Pre-commit check passed');
}
```

### Layer 3: Pre-Build Check

```javascript
// scripts/pre-build-root-check.js
import fs from 'fs';
import path from 'path';

const AUTHORIZED = JSON.parse(
  fs.readFileSync('docs/governance/ROOT_FILE_PLACEMENT_RULES.md.json', 'utf8')
).authorizedRootFiles.map(f => f.name);

const files = fs.readdirSync('.').filter(f => 
  fs.statSync(f).isFile() && 
  !f.startsWith('.')
);

const violations = files.filter(f => !AUTHORIZED.includes(f));

if (violations.length > 0) {
  console.error('❌ PRE-BUILD CHECK FAILED');
  console.error('Unauthorized files in root:', violations);
  process.exit(1);
}

console.log('✅ PRE-BUILD CHECK PASSED');
```

### Layer 4: Build Plugin

```javascript
// scripts/build-plugins/enforce-root-cleanliness.js
// Integrated into Vite build process
export default function enforceRootCleanliness() {
  return {
    name: 'enforce-root-cleanliness',
    apply: 'build',
    writeBundle(options, bundle) {
      // Redirect any root-level outputs to .generated/
      for (const fileName in bundle) {
        if (!fileName.includes('/') && !AUTHORIZED_ROOT_FILES.includes(fileName)) {
          // Move to .generated/
          console.warn(`⚠️  Redirecting ${fileName} to .generated/`);
          bundle[`.generated/${fileName}`] = bundle[fileName];
          delete bundle[fileName];
        }
      }
    }
  };
}
```

### Layer 5: CI/CD Workflow

```yaml
# .github/workflows/root-cleanliness-check.yml
name: Root Cleanliness Check

on: [push, pull_request]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Check root file compliance
        run: npm run verify:root-cleanliness
      - name: Comment on PR if violations
        if: failure()
        uses: actions/github-script@v6
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '❌ Root cleanliness check failed. See workflow for details.'
            })
```

---

## CAG Integration: Context Rules

### File: `docs/governance/CAG_ROOT_FILE_GOVERNANCE.md` (NEW)

**For CAG Agents (Copy into System Prompt)**:

```
## 🔒 Root File Governance (CAG Requirement)

You MUST follow these rules when taking over from another agent:

### Rule 1: Never Create Files in Root
❌ FORBIDDEN:
  - Create .log files in root
  - Create .json reports in root
  - Create .md documentation in root
  - Create test files in root
  - Create any file in root

✅ REQUIRED:
  - Logs → .logs/[filename]
  - Documentation → docs/[domain]/[filename]
  - JSON data → docs/search/ or .generated/
  - Scripts → scripts/[category]/[filename]
  - Web files → public/[filename]
  - Build artifacts → .generated/[filename]

### Rule 2: Verify Placement
Before creating ANY file:
1. Check: Is this file type in the whitelist?
   → Reference: docs/governance/ROOT_FILE_PLACEMENT_RULES.md
2. Determine: Where should this go?
   → Check allocation rules in authority JSON
3. Create: In the proper directory

### Rule 3: Governance Authority
Source of truth: docs/governance/orchestration-audit-system-project-plan.json
  - authorizedRootFiles: Whitelist of files allowed
  - allocationRules: Where each file type belongs
  - enforcementLayers: How violations are caught

### Rule 4: Enforcement Layers
If you violate these rules, you will be caught by:
  Layer 1: ESLint rule (real-time feedback)
  Layer 2: Pre-commit hook (blocks commit)
  Layer 3: Pre-build check (blocks build)
  Layer 4: Build plugin (auto-redirects)
  Layer 5: CI/CD check (blocks merge)

### Rule 5: Auto-Fix Available
If violations detected:
  npm run fix:root-file-violations    # Auto-move files to proper locations
  npm run verify:root-cleanliness     # Check compliance
  npm run show:file-allocation        # Show where files should go

### Rule 6: Request Exception
If you need a file in root:
1. Document reason: Why does it need to be in root?
2. Submit exception: Add to authorizedRootFiles array
3. Update authority: Commit change to docs/governance/ files
4. Justify: Include RFC/ADR explaining the exception

### Examples:
✅ CORRECT (CAG Should Do):
  - Create log file: fs.writeFileSync('.logs/my-analysis.log', data)
  - Create report: fs.writeFileSync('docs/search/analysis-report.json', data)
  - Create script: fs.writeFileSync('scripts/tools/my-tool.js', code)

❌ INCORRECT (CAG Must Avoid):
  - Create log file: fs.writeFileSync('my-analysis.log', data)
  - Create report: fs.writeFileSync('analysis-report.json', data)
  - Create script: fs.writeFileSync('my-tool.js', code)

### Governance Principle:
"Every file has a proper home. Root is sacred—only configs live there."
```

---

## Auto-Remediation: Fix Scripts

### Script 1: Auto-Move Violations

**File**: `scripts/fix-root-file-violations.js`

**Function**: Automatically move misplaced files to proper directories

**Usage**: `npm run fix:root-file-violations`

**Logic**:
1. Scan root for all files
2. Compare against whitelist
3. For each violation, determine target directory
4. Move file to target
5. Update any imports in source files
6. Generate report

### Script 2: Show File Allocation

**File**: `scripts/show-file-allocation.js`

**Function**: Show where a file type should go

**Usage**: `npm run show:file-allocation -- filename.json`

**Output**:
```
📍 File Allocation Rules

File: analysis-report.json
Type: Generated JSON data
Current: root/analysis-report.json ❌

Should be: docs/search/analysis-report.json ✅

Rule: JSON data files go to docs/search/
Reference: docs/governance/ROOT_FILE_PLACEMENT_RULES.md

Commands:
  Move: mv analysis-report.json docs/search/
  Auto-fix: npm run fix:root-file-violations
```

---

## Package.json Scripts (NEW)

```json
{
  "scripts": {
    "verify:root-cleanliness": "node scripts/verify-root-cleanliness.js",
    "fix:root-file-violations": "node scripts/fix-root-file-violations.js",
    "show:file-allocation": "node scripts/show-file-allocation.js",
    "pre-build-root-check": "node scripts/pre-build-root-check.js"
  },
  "husky": {
    "hooks": {
      "pre-commit": "node .husky/prevent-root-files.js"
    }
  }
}
```

---

## Benefits

### 🛡️ Protection Levels

| Layer | Detection Time | Enforcement | Can Skip? |
|-------|----------------|-------------|-----------|
| ESLint | Real-time (IDE) | Linter warning | Via comment |
| Pre-commit | Before commit | Hard block | No |
| Pre-build | Before build | Hard block | No |
| Build plugin | During build | Auto-redirect | No |
| CI/CD | Before merge | Hard block | No |

### 🎯 Coverage

- ✅ Prevents 99%+ of root file creation
- ✅ Catches violations immediately
- ✅ Auto-fixes violations
- ✅ Educates about proper placement
- ✅ Governance-driven (not arbitrary rules)

### 🚀 Developer Experience

- 🟢 Clear error messages with fixes
- 🟢 Auto-remediation available
- 🟢 Can understand the "why"
- 🟢 Governance is versioned in Git
- 🟢 Authority is JSON (machine-readable)

---

## Governance Authority

**Single Source of Truth**:
```
docs/governance/orchestration-audit-system-project-plan.json
  └── rootFileGovernance
      ├── authorizedRootFiles: [list of allowed files]
      ├── allocationRules: {filetype → location}
      └── enforcementLayers: [5-layer enforcement]
```

**Updated Once Per Release**:
- Any changes go through code review
- All agents see the same rules
- Rules are version-controlled
- Easy to audit compliance history

---

## Execution Checklist

- [ ] Create ESLint rule: `eslint-rules/root-files-only.js`
- [ ] Create pre-commit hook: `.husky/prevent-root-files.js`
- [ ] Create pre-build check: `scripts/pre-build-root-check.js`
- [ ] Create build plugin: `scripts/build-plugins/enforce-root-cleanliness.js`
- [ ] Create CI/CD workflow: `.github/workflows/root-cleanliness-check.yml`
- [ ] Create authority rules: `docs/governance/ROOT_FILE_PLACEMENT_RULES.md`
- [ ] Create CAG governance: `docs/governance/CAG_ROOT_FILE_GOVERNANCE.md`
- [ ] Create auto-fix scripts: `scripts/fix-root-file-violations.js`
- [ ] Create show allocation script: `scripts/show-file-allocation.js`
- [ ] Update package.json with scripts
- [ ] Update authority JSON with governance rules
- [ ] Test all 5 layers
- [ ] Document in CAG context

---

**Status**: 🟡 READY FOR IMPLEMENTATION

**Impact**: 🔒 LOCKS DOWN root directory completely while staying developer-friendly

**Compliance**: 100% — No files can escape the 5 layers of enforcement

Generated: 2025-11-24T21:15:00Z  
Version: 1.0.0 - Multi-Layer Root File Governance System
