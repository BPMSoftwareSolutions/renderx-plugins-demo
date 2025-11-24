# 🚀 DELIVERY PIPELINE ENFORCEMENT & AGENT GUIDANCE SYSTEM

## Overview

This document describes how we ensure **every new feature** follows the complete delivery pipeline, and how we prevent agents (AI or human) from skipping critical steps.

The system has **5 enforcement layers** that automatically catch and redirect incomplete work:

1. **Pre-Commit Hooks** - Blocks commits missing required pipeline layers
2. **Lint Rules** - Flags code that violates pipeline ordering
3. **Build Checks** - Refuses to build without verified specifications
4. **Runtime Guidance** - Shows error messages pointing to documentation
5. **Interactive Wizards** - Walks through pipeline step-by-step

---

## The Problem We're Solving

**Historical Gap**: Dashboard was implemented without business BDD specifications, violating the delivery pipeline that self-healing follows. This made it impossible to:
- Detect if requirements drifted
- Regenerate tests automatically
- Ensure spec-test-code alignment
- Audit the decision chain

**Root Cause**: Developers/agents skipped the BDD specification layer and jumped directly to implementation.

**Solution**: Make the pipeline unavoidable through multiple enforcement mechanisms that redirect to documentation at every step.

---

## The 5-Layer Enforcement System

### Layer 1: Pre-Commit Hooks

**File**: `.git/hooks/pre-commit` (auto-installed)

**What it does**:
```bash
# Runs before every commit
node scripts/enforce-delivery-pipeline.js --strict

# Checks all features in packages/* for:
# ✓ Business BDD Specifications exist (.generated/*-business-bdd-specifications.json)
# ✓ Auto-Generated BDD Tests exist (__tests__/business-bdd/*.spec.ts)
# ✓ Unit Tests exist (__tests__/unit/*.spec.ts)
# ✓ Implementation code exists (src/*.ts)
# ✓ Drift detection configured (.generated/*checksum*)
```

**When it fails**:
```
❌ MISSING: Business BDD Specifications
  
The Business BDD Specifications file is the immutable source of truth that 
ensures all implementation follows business requirements.

📋 REQUIRED FILE:
  packages/slo-dashboard/.generated/slo-dashboard-business-bdd-specifications.json

📚 LEARN MORE:
  • BDD_SPECS_QUICK_REFERENCE.md
  • BUSINESS_BDD_SPECS_LOCATION.md
  • DEVELOPMENT_PIPELINE_TRACEABILITY.md

✅ NEXT STEP:
  node scripts/interactive-bdd-wizard.js slo-dashboard
```

**Result**: Can't commit incomplete pipeline. Forces resolution before proceeding.

---

### Layer 2: Lint Rules

**File**: `eslint.config.js` (custom rule)

**What it does**:
```javascript
// Detects patterns like:
- Manually edited auto-generated test files
- Component code without corresponding specs
- Test files that don't follow BDD structure
- Implementation without BDD coverage

// Triggers when:
const match = filePath.match(/__tests__.*\.spec\.ts$/);
if (isInGeneratedDir && wasManuallyEdited) {
  // 🚩 Flag: "Auto-generated files should not be manually edited"
  // 📚 Link to: BDD_SPECS_QUICK_REFERENCE.md
}
```

**When it fails**:
```
/packages/slo-dashboard/__tests__/business-bdd/metrics-panel-bdd.spec.ts
  Line 15:2  error  Auto-generated test files must not be manually edited
                    If specs changed, regenerate: 
                    npm run generate:slo-dashboard:bdd-tests
                    
             📚 Read: BDD_SPECS_QUICK_REFERENCE.md#why-cant-i-edit-generated-tests
```

**Result**: Linter won't pass. Directs to correct workflow.

---

### Layer 3: Build Checks

**File**: `package.json` pre-build hooks + `scripts/pre-build-pipeline-check.js`

**What it does**:
```bash
# Runs: npm run build
  ↓
# Executes pre-build checks:
  ├─ Verify all specs are locked (not modified)
  ├─ Verify tests are auto-generated (not edited)
  ├─ Verify no manual drift detected
  └─ If any fail: REFUSE TO BUILD

# If checks pass:
  ├─ Rebuild all artifacts
  ├─ Recompute checksums
  └─ Embed checksums in build output
```

**When it fails**:
```
❌ PRE-BUILD PIPELINE CHECK FAILED

Issue: Drift detected in comprehensive-business-bdd-specifications.json
  Previous checksum: sha256:abc123...
  Current checksum:  sha256:def456...

This means the specifications changed without regenerating tests.

✅ FIX:
  # Option 1: Regenerate tests from new specs
  npm run generate:slo-dashboard:bdd-tests
  
  # Option 2: Revert spec changes
  git checkout packages/slo-dashboard/.generated/slo-dashboard-business-bdd-specifications.json
  
  # Then rebuild
  npm run build

📚 WHY: Specifications are immutable sources of truth. If they change,
   all downstream tests and implementation must be regenerated.
   See: DEVELOPMENT_PIPELINE_TRACEABILITY.md
```

**Result**: Build fails with clear error and remediation path.

---

### Layer 4: Runtime Guidance

**Files**:
- `scripts/enforce-delivery-pipeline.js` - Main enforcement logic
- All error messages link to documentation
- Code comments reference governance

**What it does**:
```javascript
// When any layer fails, error message includes:

// 1. PROBLEM: What's missing
// 2. REQUIRED FILE: Where it should go
// 3. WHY IT MATTERS: Business case
// 4. NEXT STEP: Exactly what to do
// 5. LEARN MORE: Links to docs

const ERROR_MESSAGE = `
❌ MISSING: Business BDD Specifications

${colors.hint('📋 REQUIRED FILE:')}
  packages/<feature>/.generated/<feature>-business-bdd-specifications.json

${colors.hint('✅ NEXT STEP:')}
  node scripts/interactive-bdd-wizard.js <feature>

${colors.hint('📚 LEARN MORE:')}
  • BDD_SPECS_QUICK_REFERENCE.md
  • DEVELOPMENT_PIPELINE_TRACEABILITY.md
`;
```

**Result**: Clear guidance at point of failure. No guessing.

---

### Layer 5: Interactive Wizards

**Files**: `scripts/interactive-bdd-wizard.js`

**What it does**:
```bash
node scripts/interactive-bdd-wizard.js slo-dashboard

# Walks through step-by-step:
# 1. Gathers feature requirements
# 2. Creates Business BDD Specifications
# 3. Auto-generates BDD Tests
# 4. Plans Unit Tests
# 5. Guides Implementation
# 6. Sets up Drift Detection

# At each step:
# - Explains why it's important
# - Shows what's being created
# - Prevents skipping to next step
# - Links to reference documentation
```

**Flow**:
```
START
  ↓
STEP 1: Gather Requirements
  [Can't proceed without answers]
  ↓
STEP 2: Create Business BDD Specs
  [Creates .generated/*-business-bdd-specifications.json]
  ↓
STEP 3: Auto-Generate BDD Tests
  [Runs generation script, shows results]
  ↓
STEP 4: Plan Unit Tests
  [Maps out what to test]
  ↓
STEP 5: Implementation Guidance
  [Shows TDD flow: Tests → Code]
  ↓
STEP 6: Drift Detection Setup
  [Explains automatic verification]
  ↓
SUMMARY
  [Shows what's done and what's next]
```

**Result**: Impossible to skip steps. Wizard is the "guardrail".

---

## How Agents Can't Bypass This

### Scenario 1: Agent tries to skip BDD specs

```bash
# Try to commit code without specs
$ git commit -m "Added dashboard component"

# Pre-commit hook runs
$ node scripts/enforce-delivery-pipeline.js --strict

# ❌ FAILS
# Hook shows error with full guidance
# Can't commit ✓ Prevents incomplete work
```

### Scenario 2: Agent manually edits generated test files

```bash
# Edit auto-generated test file
$ vim packages/slo-dashboard/__tests__/business-bdd/metrics-panel-bdd.spec.ts

# ESLint rule triggers
$ npm run lint

# ❌ FAILS
# Linter shows:
# "Auto-generated test files must not be manually edited"
# "If specs changed, regenerate: npm run generate:slo-dashboard:bdd-tests"
# Prevents wrong approach ✓
```

### Scenario 3: Agent tries to build without verified specs

```bash
# Try to build
$ npm run build

# Pre-build pipeline check runs
# Detects: Spec file changed (checksum mismatch)
# Can't regenerate: no new generated tests exist

# ❌ FAILS
# Shows: "Drift detected in specifications"
# Guidance: "Regenerate tests or revert spec changes"
# Prevents deploying unverified changes ✓
```

### Scenario 4: AI agent starts implementation without understanding pipeline

```bash
# Agent creates component without specs
$ mkdir packages/slo-dashboard/src/components
$ touch packages/slo-dashboard/src/components/NewFeature.tsx

# Try to commit
$ git commit -m "New feature implementation"

# Pre-commit hook runs
$ node scripts/enforce-delivery-pipeline.js --strict

# ❌ FAILS
# Shows: "Missing Business BDD Specifications"
# Error message includes:
#   "📚 LEARN MORE: BDD_SPECS_QUICK_REFERENCE.md"
#   "✅ NEXT STEP: node scripts/interactive-bdd-wizard.js"
# Forces reading documentation ✓
```

---

## How Guidance Works

### Documentation Injection Points

Every error message links to specific documentation:

| Error Type | Error Message | Link to Docs |
|---|---|---|
| Missing BDD Specs | Business BDD Specifications file not found | BDD_SPECS_QUICK_REFERENCE.md |
| Missing Generated Tests | Auto-Generated Business BDD Tests not found | BDD_SPECS_QUICK_REFERENCE.md#generation |
| Missing Unit Tests | Unit Tests do not exist for components | GOVERNANCE_COMPLIANCE_PHASE_6.md |
| Edited Generated Files | Auto-generated test file manually modified | BDD_SPECS_QUICK_REFERENCE.md#immutable |
| Spec Drift Detected | Specifications changed without regenerating tests | DEVELOPMENT_PIPELINE_TRACEABILITY.md |
| Build Failed | Pre-build pipeline check failed | DEVELOPMENT_PIPELINE_TRACEABILITY.md#drift |

### Code Comment Guidance

Every critical file has inline comments:

```typescript
/**
 * ============================================================================
 * DELIVERY PIPELINE ENFORCEMENT
 * ============================================================================
 * 
 * This script ensures every feature follows the complete pipeline:
 * 1. Business BDD Specifications (immutable source)
 * 2. Auto-Generated Business BDD Tests
 * 3. Unit Tests (TDD)
 * 4. Implementation
 * 5. Drift Detection
 * 
 * Pipeline violations trigger automatic remediation guidance.
 * See: DEVELOPMENT_PIPELINE_TRACEABILITY.md
 * ============================================================================
 */
```

### Error Message Structure

Every enforcement error follows this pattern:

```
❌ PROBLEM: [What's missing]

[Explanation of why it matters]

📋 REQUIRED FILE:
  [File path and structure]

🔄 HOW IT WORKS:
  [Brief explanation]

✅ NEXT STEP:
  [Exact command to fix]

📚 LEARN MORE:
  [Links to comprehensive docs]
```

---

## Integration with Existing Systems

### Pre-Build (`npm run build`)

```json
{
  "scripts": {
    "pretest": "node scripts/verify-bdd-spec.js && npm run regenerate:ographx:test-graph",
    "prebuild": "node scripts/enforce-delivery-pipeline.js --strict",
    "build": "npm run build:all && npm run regenerate:ographx"
  }
}
```

### CI/CD Pipeline

```yaml
# GitHub Actions / CI
name: Enforce Pipeline
on: [pull_request, push]
jobs:
  enforce:
    runs-on: ubuntu-latest
    steps:
      - run: npm run enforce:pipeline
      - run: npm run verify:no-drift
      - run: npm test
      - run: npm run build
```

### Pre-Commit Hook Installation

```bash
# Auto-installed when cloning
$ npm install

# Installs hooks to .git/hooks/
$ node scripts/setup-git-hooks.js
```

---

## Key Principles

### 1. Make Compliance Automatic

Rather than asking developers to remember rules, make the tools enforce them:
- ✓ Pre-commit hooks block bad commits
- ✓ Linter catches violations
- ✓ Build checks verify pipeline
- ✓ Wizards guide through process

### 2. Give Clear Guidance at Point of Failure

When something fails, the error message includes:
- ✓ What's missing
- ✓ Why it matters
- ✓ Exactly how to fix it
- ✓ Links to detailed documentation

### 3. Make Skipping Steps Impossible

The pipeline can't be bypassed:
- ✓ Pre-commit blocks incomplete work
- ✓ Linter flags violations
- ✓ Build fails without verified specs
- ✓ Drift detection prevents manual edits

### 4. Document Everything Inline

Every piece of guidance includes references:
- ✓ Code comments link to external docs
- ✓ Error messages link to guides
- ✓ Wizard shows documentation links
- ✓ Git hooks reference external resources

### 5. Make the Pipeline Self-Explanatory

New agents don't need to ask:
- ✓ Error messages explain the violation
- ✓ Documentation is comprehensive
- ✓ Wizards walk through each step
- ✓ Examples (self-healing) show the pattern

---

## For New AI Agents

When an agent encounters a pipeline error, they see:

```
❌ MISSING: Business BDD Specifications

The Business BDD Specifications file is the immutable source of truth...

📚 LEARN MORE:
  • BDD_SPECS_QUICK_REFERENCE.md
  • BUSINESS_BDD_SPECS_LOCATION.md
  • DEVELOPMENT_PIPELINE_TRACEABILITY.md

✅ NEXT STEP:
  node scripts/interactive-bdd-wizard.js slo-dashboard
```

**The agent will**:
1. See the error is clear and actionable
2. Find documentation links in the message
3. Read the referenced docs to understand pipeline
4. Run the wizard to complete the work
5. Never skip steps because tools won't allow it

This creates a **self-documenting system** that teaches through enforcement.

---

## Implementation Checklist

- [ ] Install `scripts/enforce-delivery-pipeline.js`
- [ ] Install `scripts/interactive-bdd-wizard.js`
- [ ] Create pre-commit hooks (`.git/hooks/pre-commit`)
- [ ] Add lint rules for generated files
- [ ] Add `prebuild` check to `package.json`
- [ ] Document all error messages
- [ ] Link all docs from error messages
- [ ] Test all enforcement paths
- [ ] Onboard team with wizard walkthrough

---

## Result

With these 5 layers of enforcement:

✅ **No agent can skip the BDD specifications layer**
✅ **Every feature follows complete delivery pipeline**
✅ **Compliance is automatic, not manual**
✅ **New agents are guided through system**
✅ **Documentation is always in reach**
✅ **Specifications never drift silently**
✅ **Tests are always generated from specs**
✅ **Implementation quality is guaranteed**

The system becomes **self-enforcing and self-documenting**.
