# Self-Healing Test Generation Scripts - Quick Reference

## 📋 Overview

**3 business-focused generation scripts** for the self-healing system. These are the ONLY scripts you need.

## 🎯 The Scripts

### 1. `generate-comprehensive-business-bdd-specs.js`
**Purpose**: Generate business BDD specifications for all 67 handlers

**What it does**:
- Reads handler definitions from sequences
- Creates business context for each handler
- Assigns personas (DevOps Engineer, Platform Team, Engineering Manager)
- Generates realistic business scenarios
- Outputs: `packages/self-healing/.generated/comprehensive-business-bdd-specifications.json`

**Run it**:
```bash
node scripts/generate-comprehensive-business-bdd-specs.js
```

**Output**:
```
✅ Generated comprehensive business BDD specifications
📊 Summary: 67 handlers with business context
📂 Output: packages/self-healing/.generated/comprehensive-business-bdd-specifications.json
```

---

### 2. `generate-handler-business-bdd-tests.js`
**Purpose**: Generate business BDD test files for all 67 handlers

**What it does**:
- Reads comprehensive business BDD specifications
- Creates individual test file for each handler
- Includes user story, business scenario, Given-When-Then structure
- Adds TODO comments for implementation
- Outputs: 67 test files in `packages/self-healing/__tests__/business-bdd-handlers/`

**Run it**:
```bash
node scripts/generate-handler-business-bdd-tests.js
```

**Output**:
```
✅ Created: 67 business BDD test files for handlers
📂 Location: packages/self-healing/__tests__/business-bdd-handlers
🎯 Coverage: 67/67 handlers (100%)
```

---

### 3. `generate-business-bdd-test-files.js`
**Purpose**: Generate business BDD test files for 7 sequences

**What it does**:
- Reads business BDD specifications
- Creates test file for each sequence/user story
- Groups handlers by sequence
- Includes realistic business scenarios
- Outputs: 7 test files in `packages/self-healing/__tests__/business-bdd/`

**Run it**:
```bash
node scripts/generate-business-bdd-test-files.js
```

**Output**:
```
✅ Created: 7 business BDD test files for sequences
📂 Location: packages/self-healing/__tests__/business-bdd
🎯 Coverage: 7/7 sequences (100%)
```

---

## 🔄 Typical Workflow

### Initial Setup
```bash
# 1. Generate business specs for all handlers
node scripts/generate-comprehensive-business-bdd-specs.js

# 2. Generate business BDD test files for handlers
node scripts/generate-handler-business-bdd-tests.js

# 3. Generate business BDD test files for sequences
node scripts/generate-business-bdd-test-files.js
```

### Regenerate After Changes
If you update handler definitions or business context:
```bash
# Regenerate specs
node scripts/generate-comprehensive-business-bdd-specs.js

# Regenerate handler tests
node scripts/generate-handler-business-bdd-tests.js

# Regenerate sequence tests
node scripts/generate-business-bdd-test-files.js
```

---

## 📊 What Gets Generated

| Script | Input | Output | Files |
|--------|-------|--------|-------|
| `generate-comprehensive-business-bdd-specs.js` | Handler definitions | JSON specs | 1 file |
| `generate-handler-business-bdd-tests.js` | JSON specs | Test files | 67 files |
| `generate-business-bdd-test-files.js` | JSON specs | Test files | 7 files |

---

## ✅ Quality Checks

After running scripts:

```bash
# Verify lint passes
npm run lint

# Verify tests exist
ls packages/self-healing/__tests__/business-bdd-handlers/ | wc -l
# Should output: 67

# Verify specs exist
ls packages/self-healing/.generated/comprehensive-business-bdd-specifications.json
```

---

## 🚫 What Was Removed

The following non-business scripts were **removed** because they generated generic/technical specs that are not useful for this project:

- ❌ `generate-self-healing-tests.js`
- ❌ `generate-self-healing-test-stubs.js`
- ❌ `generate-bdd-specifications.js`
- ❌ `generate-bdd-test-files.js`

**Why?** They generated non-business-focused specs that created confusion. We only need business-first BDD tests.

---

## 📁 Output Locations

**Business Specs**:
```
packages/self-healing/.generated/comprehensive-business-bdd-specifications.json
```

**Business BDD Handler Tests** (67 files):
```
packages/self-healing/__tests__/business-bdd-handlers/
```

**Business BDD Sequence Tests** (7 files):
```
packages/self-healing/__tests__/business-bdd/
```

---

## 🎯 Key Principle

**Business-First BDD Only**

All test generation focuses on:
- ✅ User stories with personas
- ✅ Realistic business scenarios
- ✅ Measurable business outcomes
- ✅ End-user perspective

No generic/technical specs. No confusion. Just business value.

---

**Status**: ✅ Clean & Simple  
**Scripts**: 3 (business-focused only)  
**Coverage**: 100% (67 handlers + 7 sequences)

