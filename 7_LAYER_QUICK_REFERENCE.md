# 7-LAYER PIPELINE - VISUAL GUIDE & QUICK REFERENCE

**Status**: FINALIZED ✅  
**Date**: November 23, 2025  
**Model**: Clean, Business-Focused, 7 Essential Layers

---

## The 7 Layers at a Glance

```
┌─────────────────────────────────────────────────────────────┐
│                  LAYER 1: BUSINESS BDD SPECS                │
│              packages/<feature>/.generated/                 │
│         <feature>-business-bdd-specifications.json          │
│                                                             │
│  What: Customer requirements in Given-When-Then format     │
│  Who: Product owner defines                                │
│  Governance: 🔒 LOCKED - Immutable, checksum protected     │
│  File Type: JSON                                           │
│  Backup: YES (drift detection via Layer 7)                │
│  Example: Self-healing has 67 scenarios                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              LAYER 2: BUSINESS BDD TESTS                    │
│          packages/<feature>/__tests__/                      │
│          business-bdd-handlers/*.test.ts                    │
│                                                             │
│  What: Auto-generated tests verifying business works       │
│  Who: AUTO-GENERATED from Layer 1                          │
│  Governance: ✅ AUTO - Never manually edit                 │
│  File Type: TypeScript/Jest test files                     │
│  Backup: NO (regenerate from Layer 1)                      │
│  Example: Self-healing has 67 handler tests                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│         LAYER 3: JSON SEQUENCES & ORCHESTRATION            │
│              packages/<feature>/.generated/                 │
│             <feature>-sequences.json                        │
│                                                             │
│  What: Handler execution flow, state machine               │
│  Who: Architect/Tech lead defines                          │
│  Governance: 🔒 LOCKED - Immutable, checksum protected     │
│  File Type: JSON with sequence definitions                 │
│  Backup: YES (drift detection via Layer 7)                │
│  Example: Self-healing orchestrates 67 handlers            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│            LAYER 4: HANDLER DEFINITIONS                     │
│           packages/<feature>/src/handlers/                  │
│                    *.ts                                     │
│                                                             │
│  What: Individual handler implementation code              │
│  Who: Developer writes                                     │
│  Governance: 👨‍💻 CODE - Standard git workflow             │
│  File Type: TypeScript functions                           │
│  Backup: YES (standard version control)                    │
│  Count: Many (67 in self-healing package)                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                LAYER 5: UNIT TESTS (TDD)                    │
│           packages/<feature>/__tests__/unit/                │
│                    *.test.ts                                │
│                                                             │
│  What: Component/hook/service-level tests                  │
│  Who: Developer writes (TDD)                               │
│  Governance: 👨‍💻 TDD - Developer responsibility             │
│  File Type: TypeScript/Jest test files                     │
│  Coverage Target: 80%+                                     │
│  Scope: Implementation details, edge cases                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│             LAYER 6: INTEGRATION TESTS (E2E)                │
│        packages/<feature>/__tests__/integration/            │
│                    *.test.ts                                │
│                                                             │
│  What: End-to-end workflow tests                           │
│  Who: Developer writes                                     │
│  Governance: 👨‍💻 E2E - Developer responsibility             │
│  File Type: TypeScript/Jest test files                     │
│  Scope: Multiple handlers working together                 │
│  Focus: Complete business workflows                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│          LAYER 7: DRIFT DETECTION CONFIGURATION             │
│              packages/<feature>/.generated/                 │
│              <feature>-drift-config.json                    │
│                                                             │
│  What: Checksums of locked files, monitoring rules         │
│  Who: AUTO-GENERATED during recovery                       │
│  Governance: ✅ AUTO - Build system maintains              │
│  File Type: JSON with checksums and rules                  │
│  Protects: Layers 1 & 3 (locked specifications)           │
│  Verification: Pre-commit checks + drift detection         │
└─────────────────────────────────────────────────────────────┘
```

---

## Compliance Matrix

| Layer | Type | Location | Governance | Required | Coverage |
|-------|------|----------|-----------|----------|----------|
| 1 | Business Specs | `.generated/*specs.json` | 🔒 LOCKED | YES | All business requirements |
| 2 | Business Tests | `__tests__/business-bdd` | ✅ AUTO | YES | All business scenarios |
| 3 | Sequences | `.generated/*sequences.json` | 🔒 LOCKED | YES | All orchestration |
| 4 | Handlers | `src/handlers/` | 👨‍💻 CODE | YES | All referenced handlers |
| 5 | Unit Tests | `__tests__/unit/` | 👨‍💻 TDD | YES | 80%+ code coverage |
| 6 | Integration | `__tests__/integration/` | 👨‍💻 E2E | YES | All workflows |
| 7 | Drift Config | `.generated/*drift.json` | ✅ AUTO | YES | Spec checksums |

**Result**: ALL 7 REQUIRED for 100% compliance

---

## Command Reference

### Recover Feature (All 7 Layers)
```bash
node scripts/auto-recovery-7-layer.js <feature>
```
**Example**:
```bash
node scripts/auto-recovery-7-layer.js slo-dashboard
```
**Result**: All 7 layers created/recovered

---

### Check Compliance (Single Feature)
```bash
npm run check:compliance <feature>
```
**Example**:
```bash
npm run check:compliance slo-dashboard
```
**Result**: Compliance %, layers present/missing

---

### Check Compliance (All Features)
```bash
npm run check:compliance
```
**Result**: Overall pipeline health for all features

---

### Enforce Pipeline (All Features)
```bash
npm run enforce:pipeline
```
**Result**: Which features compliant/non-compliant

---

### Enforce Pipeline (Single Feature)
```bash
npm run enforce:pipeline <feature>
```
**Example**:
```bash
npm run enforce:pipeline slo-dashboard
```
**Result**: Pass/fail with violations if any

---

## Quick Troubleshooting

### Dashboard is 29% Compliant (2/7 layers)
**Problem**: Old recovery was incomplete

**Solution**: Run new complete recovery
```bash
node scripts/auto-recovery-7-layer.js slo-dashboard
```

**Result**: 100% compliant with all 7 layers

---

### Feature Missing Layers 5 & 6 (Tests)
**Problem**: Developer hasn't written tests yet

**Solution**: 
1. Recover stubs:
   ```bash
   node scripts/auto-recovery-7-layer.js <feature>
   ```
2. Implement the tests

---

### "Drift Detected in Specifications"
**Problem**: Layer 1 or Layer 3 file was modified

**Solution**:
1. Review the change
2. Either accept (update checksum) or revert
3. Re-run enforcement

---

### Enforcement Blocking Commit
**Problem**: Some layer missing before commit

**Solution**:
```bash
npm run check:compliance <feature>  # See what's missing
node scripts/auto-recovery-7-layer.js <feature>  # Recover it
npm run enforce:pipeline <feature>  # Verify it passes
```

---

## File Structure Example (Complete Feature)

```
packages/dashboard/
├── .generated/
│   ├── dashboard-business-bdd-specifications.json    (Layer 1) ✅
│   ├── dashboard-sequences.json                       (Layer 3) ✅
│   └── dashboard-drift-config.json                    (Layer 7) ✅
│
├── src/
│   └── handlers/
│       ├── initialize.ts                              (Layer 4) ✅
│       ├── loadData.ts                                (Layer 4) ✅
│       └── render.ts                                  (Layer 4) ✅
│
├── __tests__/
│   ├── business-bdd-handlers/
│   │   └── dashboard.test.ts                          (Layer 2) ✅
│   │
│   ├── unit/
│   │   ├── initialize.test.ts                         (Layer 5) ✅
│   │   ├── loadData.test.ts                           (Layer 5) ✅
│   │   └── render.test.ts                             (Layer 5) ✅
│   │
│   └── integration/
│       └── dashboard-workflow.test.ts                 (Layer 6) ✅
│
└── package.json
```

**Result**: ✅ 100% Compliant (All 7 Layers)

---

## Compliance Scores Explained

```
0-20%   : Most layers missing - Run recovery
20-40%  : About half missing - Run recovery to complete
40-60%  : Good start - Developer needs to add tests
60-80%  : Almost there - Missing final integration tests
80-99%  : Nearly complete - Minor gaps remain
100%    : COMPLIANT - All 7 layers present ✅
```

---

## The "Why" Behind Each Layer

| Layer | Why It Exists | What It Prevents |
|-------|---------------|-----------------|
| 1 | Single source of truth | Confusion about requirements |
| 2 | Verify requirements work | Feature not meeting business needs |
| 3 | Define orchestration | Unclear handler dependencies |
| 4 | Implement business | Incomplete implementation |
| 5 | Test implementation | Bugs in handler code |
| 6 | Test workflows | Workflow failures |
| 7 | Detect drift | Specs changed without notice |

**All 7 needed for complete solution**

---

## Implementation Timeline

### Phase 1: Discovery (Immediate)
```bash
npm run check:compliance slo-dashboard
```
**Output**: See what's missing

### Phase 2: Recovery (Immediate)
```bash
node scripts/auto-recovery-7-layer.js slo-dashboard
```
**Output**: All layers recovered

### Phase 3: Verification (Immediate)
```bash
npm run check:compliance slo-dashboard
npm run enforce:pipeline slo-dashboard
```
**Output**: Should show 100% compliant

### Phase 4: Enforcement (Ongoing)
```bash
npm run enforce:pipeline
```
**Output**: Enforced on every commit

---

## Before & After

### BEFORE (Old 9-Layer, Confusing)
- 9 layers
- Technical BDD redundant
- Confusion about specs
- Incomplete recovery
- 5-layer enforcement

### AFTER (New 7-Layer, Clean)
- 7 essential layers
- No redundancy
- Clear business focus
- Complete recovery
- 7-layer enforcement

---

## Key Takeaways

✅ **All 7 layers required** - No exceptions  
✅ **Clear governance** - Each layer has rules  
✅ **Auto-generated where possible** - Layers 2 & 7  
✅ **Locked specs** - Layers 1 & 3 protected  
✅ **Developer tests** - Layers 5 & 6 developer-owned  
✅ **Fully enforceable** - Pre-commit checks all 7  
✅ **Business focused** - All trace to requirements  

---

## Getting Started

### For New Feature
```bash
node scripts/auto-recovery-7-layer.js my-feature
# Creates all 7 layers
# Then implement the handlers (Layer 4) and tests (Layers 5 & 6)
```

### For Non-Compliant Feature
```bash
npm run check:compliance my-feature  # See what's missing
node scripts/auto-recovery-7-layer.js my-feature  # Recover it
npm run enforce:pipeline my-feature  # Verify it passes
```

### For Ongoing Compliance
```bash
npm run enforce:pipeline  # Runs on every commit
```

---

## Success Criteria

| Criteria | Status |
|----------|--------|
| All 7 layers documented | ✅ |
| Recovery script covers all 7 | ✅ |
| Enforcement checks all 7 | ✅ |
| Compliance reporting covers all 7 | ✅ |
| Technical BDD removed | ✅ |
| No redundancy | ✅ |
| Dashboard recoverable | ✅ |
| Production ready | ✅ |

---

## Support References

- **Complete Reference**: `7_LAYER_PIPELINE_COMPLETE_REFERENCE.md`
- **Implementation Details**: `CORRECTED_7_LAYER_PIPELINE.md`
- **Technical Details**: `TECHNICAL_BDD_REMOVAL_COMPLETE.md`
- **Quick Start**: `COMPLETE_REMOVAL_SUMMARY.md`

---

**Status**: ✅ READY TO USE  
**All Commands Working**: ✅  
**All Documentation Complete**: ✅  
**All Scripts Created**: ✅
