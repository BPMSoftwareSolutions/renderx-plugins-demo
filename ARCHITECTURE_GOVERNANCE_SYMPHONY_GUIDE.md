# Architecture Governance Enforcement Symphony - Implementation Guide

**Version:** 1.0.0  
**Date:** November 27, 2025  
**Authority:** Senior Architect  
**Status:** Active

---

## Overview

The **Architecture Governance Enforcement Symphony** is a 6-movement orchestration that automatically enforces the principle: **JSON is the single source of truth**.

This symphony validates that:
- ✅ JSON definitions are the authoritative source
- ✅ Code implementations conform to JSON specs
- ✅ Tests verify JSON → Code mapping
- ✅ Markdown is consistent with JSON
- ✅ Complete auditability chain exists (JSON → Code → Tests → Markdown)

---

## What It Does

### The 6-Movement Pipeline

| Movement | Purpose | Validates |
|----------|---------|-----------|
| **1. JSON Schema Validation** | Ensure all JSON files are valid and well-formed | JSON schema, required fields, structure |
| **2. Handler-to-Beat Mapping** | Verify every beat has a handler; no orphaned handlers | Code ↔ JSON consistency |
| **3. Test Coverage Verification** | Ensure every beat has test coverage | Tests ↔ JSON mapping |
| **4. Markdown Consistency** | Verify documentation matches JSON facts | Markdown ↔ JSON consistency |
| **5. Auditability Chain** | Verify complete JSON → Code → Tests → Markdown chain | Full traceability |
| **6. Overall Conformity** | Aggregate results and make governance decision | PASS or FAIL |

### Example Output

```
════════════════════════════════════════════════════════════════════════════════
🎼 ARCHITECTURE GOVERNANCE ENFORCEMENT SYMPHONY
════════════════════════════════════════════════════════════════════════════════

📋 Loaded Symphony: Architecture Governance Enforcement Symphony
📊 Movements: 6
🎵 Total Beats: 32

════════════════════════════════════════════════════════════════════════════════
🎼 MOVEMENT 1: JSON Schema Validation 📋
════════════════════════════════════════════════════════════════════════════════
Purpose: Validate all JSON files against schema; ensure structure is correct and complete

🎵 [MOVEMENT 1, BEAT 1] Validating JSON Schema Structure
   ✅ Validated: 6 files
   ❌ Failed: 0 files

🎵 [MOVEMENT 1, BEAT 2] Validating Orchestration Domains Registry
   ✅ Registry has all required sections
   📊 Categories: 2
   📊 Domains: 55+

[... continues through all movements ...]

════════════════════════════════════════════════════════════════════════════════
🎵 GOVERNANCE SYMPHONY EXECUTION SUMMARY
════════════════════════════════════════════════════════════════════════════════
⏱️  Total Duration: 2345ms
✅ Successful Beats: 32/32
❌ Failed Beats: 0

════════════════════════════════════════════════════════════════════════════════
✅ ✅ ✅ GOVERNANCE ENFORCEMENT SUCCESSFUL ✅ ✅ ✅
════════════════════════════════════════════════════════════════════════════════
   JSON → Code → Tests → Markdown chain is valid
   Changes are APPROVED and ready for merge
```

---

## How to Run

### 1. Manual Invocation

```bash
# Run governance enforcement
node scripts/orchestrate-architecture-governance.js

# Run with strict mode (fail on any violation, not just critical)
node scripts/orchestrate-architecture-governance.js --strict

# Run and display detailed report
node scripts/orchestrate-architecture-governance.js --report
```

### 2. NPM Script

Add to `package.json`:

```json
{
  "scripts": {
    "governance:enforce": "node scripts/orchestrate-architecture-governance.js",
    "governance:enforce:strict": "node scripts/orchestrate-architecture-governance.js --strict",
    "governance:enforce:report": "node scripts/orchestrate-architecture-governance.js --report --strict"
  }
}
```

Then run:
```bash
npm run governance:enforce
npm run governance:enforce:strict
npm run governance:enforce:report
```

### 3. Pre-Commit Hook

Create `.git/hooks/pre-commit`:

```bash
#!/bin/bash
echo "🎼 Running Architecture Governance Enforcement..."
node scripts/orchestrate-architecture-governance.js

if [ $? -ne 0 ]; then
  echo "❌ Governance enforcement failed - commit blocked"
  exit 1
fi

echo "✅ Governance enforcement passed"
exit 0
```

Make executable:
```bash
chmod +x .git/hooks/pre-commit
```

### 4. CI/CD Integration

Add to `.github/workflows/governance.yml`:

```yaml
name: Architecture Governance Enforcement

on: [pull_request, push]

jobs:
  governance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Run Governance Enforcement
        run: npm run governance:enforce:strict
        
      - name: Generate Report
        if: always()
        run: npm run governance:enforce:report
        
      - name: Upload Report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: governance-report
          path: .generated/governance-report.json
```

---

## Files Involved

### 1. Symphony Definition (JSON)

**File:** `packages/orchestration/json-sequences/architecture-governance-enforcement-symphony.json`

- Defines the 6-movement orchestration
- 32 beats representing each validation step
- Events and handlers for auditability

### 2. Handler Implementations

**File:** `scripts/architecture-governance-handlers.js`

Contains implementations for:
- JSON schema validation (5 beats)
- Handler-to-beat mapping (6 beats)
- Test coverage verification (6 beats)
- Markdown consistency (6 beats)
- Auditability chain (7 beats)
- Overall conformity (2 beats)

### 3. Orchestrator Script

**File:** `scripts/orchestrate-architecture-governance.js`

- Loads the symphony definition
- Executes each movement sequentially
- Tracks execution metrics
- Generates reports
- Sets appropriate exit codes

### 4. Output Report

**File:** `.generated/governance-report.json`

Contains:
- Conformity score (0-100)
- Governance decision (PASS/FAIL)
- Detailed metrics from each movement
- Violation details

---

## What Gets Validated

### Movement 1: JSON Schema Validation

Checks that:
- ✅ All symphony JSON files are valid JSON
- ✅ Required fields exist (id, name, movements, events)
- ✅ orchestration-domains.json has expected structure
- ✅ All symphony files have movements and beats
- ✅ Schema section is complete (if present)

**Failure if:**
- ❌ JSON parsing fails
- ❌ Required fields missing
- ❌ Invalid structure

### Movement 2: Handler Mapping

Checks that:
- ✅ Every beat has a corresponding handler function
- ✅ No orphaned handlers (code without JSON reference)
- ✅ Handler names match exactly
- ✅ All handlers are imported/exported

**Failure if:**
- ❌ Beat references non-existent handler
- ❌ Orphaned handlers found (warning level)

### Movement 3: Test Coverage

Checks that:
- ✅ Every beat has test coverage
- ✅ Test files exist
- ✅ Coverage percentage meets threshold (80%)

**Failure if:**
- ❌ Beats lack test coverage
- ❌ Coverage below threshold (warning level)

### Movement 4: Markdown Consistency

Checks that:
- ✅ Key facts from JSON are mentioned in markdown
- ✅ No contradictions between markdown and JSON
- ✅ Movement counts, beat counts are accurate

**Failure if:**
- ❌ Markdown contradicts JSON facts

### Movement 5: Auditability

Checks that:
- ✅ JSON → Code mapping is complete
- ✅ JSON → Tests mapping is complete
- ✅ JSON → Markdown mapping is complete
- ✅ Traceability chain is unbroken

**Failure if:**
- ❌ Any link in the chain is missing

### Movement 6: Conformity

Synthesizes results and decides:
- ✅ **PASS** if no critical violations and score ≥ 60
- ❌ **FAIL** if critical violations exist or score < 60

---

## Scoring

### Conformity Score Calculation

```
Initial Score: 100

Deductions:
  - Each critical violation:    -30 points
  - Each warning:              -5 points

Final Score: max(0, min(100, adjusted score))

Pass Threshold:
  - No critical violations AND
  - Score ≥ 60
```

### Examples

| Scenario | Score | Decision |
|----------|-------|----------|
| No violations | 100 | PASS ✅ |
| 1 warning | 95 | PASS ✅ |
| 1 critical | 70 | FAIL ❌ |
| 2 warnings, 1 critical | 55 | FAIL ❌ |
| 3 warnings | 85 | PASS ✅ |

---

## Integration with Development Workflow

### When to Run

| Scenario | Command | Purpose |
|----------|---------|---------|
| Before committing | `npm run governance:enforce` | Verify changes conform |
| Before pushing | `npm run governance:enforce:strict` | Strict validation |
| Before PR merge | CI/CD (auto) | Final governance check |
| Debugging violations | `npm run governance:enforce:report` | Detailed diagnostics |

### Typical Workflow

```
1. Developer makes code change
2. Developer runs: npm run governance:enforce
3. If PASS → commit and push
4. If FAIL → see detailed report, fix violations, retry
5. CI/CD runs again as backup validation
```

---

## Violation Resolution

### If Validation Fails

#### Problem: "Handler not implemented for beat: X"

**Solution:**
1. Add handler to `scripts/build-symphony-handlers.js`
2. Export handler in module
3. Re-run governance check

#### Problem: "Beat lacks test coverage: X"

**Solution:**
1. Add test case for beat event
2. Test should verify handler behavior
3. Re-run governance check

#### Problem: "Markdown contradicts JSON: movement count"

**Solution:**
1. Update markdown to match JSON facts
2. Re-run governance check

#### Problem: "Orphan handler: X"

**Solution:**
1. Either: Use handler in JSON beat
2. Or: Remove unused handler from code
3. Re-run governance check

---

## Examples

### Example 1: Adding a New Beat

```
JSON Change:
├─ Update: symphonia-conformity-alignment-pipeline.json
└─ Add new beat to movement 3

Code Change:
├─ Update: scripts/build-symphony-handlers.js
└─ Add handler implementation

Test Addition:
├─ Update: tests/conformity-pipeline.spec.ts
└─ Add test for new beat

Markdown Update:
├─ Update: relevant documentation
└─ Update beat count

Run Governance:
└─ npm run governance:enforce (should PASS)
```

### Example 2: Fixing a Violation

```
Violation: "Handler 'validateSymphonyStructure' not implemented"

Action 1: Add handler to architecture-governance-handlers.js
Action 2: Verify beat references this handler
Action 3: Add test for this handler
Action 4: Run governance enforcement

Result: ✅ PASS
```

---

## Architecture Enforced

This symphony enforces the strict hierarchy:

```
TIER 1: JSON (Authoritative)
   ↓ DEFINES ↓
TIER 2: Code (Must Conform)
   ↓ VALIDATED BY ↓
TIER 3: Tests (Executable Specs)
   ↓ DOCUMENTED IN ↓
TIER 4: Markdown (Derived Only)
```

**Rule:** Any conflict → JSON wins. Always.

---

## Troubleshooting

### Q: Governance fails with "JSON file not found"

**A:** Ensure symphony JSON files are in `packages/orchestration/json-sequences/`

### Q: Governance fails with "Handler not found"

**A:** Run `grep handlers. scripts/build-symphony-handlers.js` to see all handlers

### Q: Governance passes but tests still fail

**A:** Governance validates structure only. Tests validate behavior. Fix test implementations.

### Q: How do I see the governance report?

**A:** Run `npm run governance:enforce:report` or check `.generated/governance-report.json`

### Q: Can I disable governance enforcement?

**A:** Not recommended. Remove from pre-commit hook only if explicitly authorized.

---

## Summary

The **Architecture Governance Enforcement Symphony** is a self-enforcing validation pipeline that ensures:

1. ✅ JSON is always the source of truth
2. ✅ Code conforms to JSON specifications
3. ✅ Tests verify the JSON → Code mapping
4. ✅ Markdown is derived from and consistent with JSON
5. ✅ Complete auditability chain exists

**Status:** Ready to integrate into development workflow

---

**Next Steps:**
1. Add npm scripts to package.json
2. Create pre-commit hook
3. Add to CI/CD pipeline
4. Run first validation: `npm run governance:enforce`
5. Review .generated/governance-report.json for any issues
