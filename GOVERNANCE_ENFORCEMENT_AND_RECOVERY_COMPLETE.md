# Symphonia Architecture Governance: Complete Enforcement & Recovery System

## Executive Summary

The Symphonia Architecture Governance System is a **fully orchestrated, self-enforcing governance pipeline** that maintains JSON as the single source of truth while enabling automatic recovery from out-of-process violations. The system implements a 6-movement symphony that validates governance at every level and can automatically reconstruct the system from detected violations.

### Key Capabilities

✅ **JSON Authority**: JSON is always the single source of truth  
✅ **Automatic Enforcement**: 32 governance beats validate every aspect  
✅ **Auto-Recovery**: Reconstructs system from orphan handlers  
✅ **Full Traceability**: Every change tracked through governance chain  
✅ **Conflict Resolution**: Systematic rules applied in JSON's favor  
✅ **Agent-Ready**: Architects and agents can run recovery autonomously  

## The Governance Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│ 1. JSON (Authoritative Source of Truth)                    │
│    - orchestration-domains.json                             │
│    - architecture-governance-enforcement-symphony.json       │
│    - All JSON sequence definitions                           │
└────────────────────┬────────────────────────────────────────┘
                     ↓ Drives all changes
┌─────────────────────────────────────────────────────────────┐
│ 2. Code (Must Conform to JSON)                              │
│    - Handler implementations                                │
│    - Orchestrator scripts                                   │
│    - All executable code                                    │
└────────────────────┬────────────────────────────────────────┘
                     ↓ Must be verified by
┌─────────────────────────────────────────────────────────────┐
│ 3. Tests (Validate JSON → Code Mapping)                     │
│    - Beat handler coverage tests                            │
│    - Integration test suites                                │
│    - Governance validation tests                            │
└────────────────────┬────────────────────────────────────────┘
                     ↓ Documented in
┌─────────────────────────────────────────────────────────────┐
│ 4. Markdown (Derived from JSON)                             │
│    - System documentation                                   │
│    - Usage guides                                           │
│    - Architecture diagrams                                  │
└─────────────────────────────────────────────────────────────┘
```

## The 6-Movement Enforcement Symphony

### Movement 1: JSON Schema Validation 📋
**Purpose**: Establish JSON as authoritative by verifying structure

- Beat 1.1: Load and validate JSON schema structure
- Beat 1.2: Validate orchestration-domains.json registry
- Beat 1.3: Validate all symphony JSON files
- Beat 1.4: Validate schema section integrity
- Beat 1.5: Report JSON validation results

**Enforcement**: Ensures JSON conforms to expected structure

### Movement 2: Handler-to-Beat Mapping Verification 🔗
**Purpose**: Verify that code implementations map to JSON definitions

- Beat 2.1: Load all handler implementations
- Beat 2.2: Index beats from JSON
- Beat 2.3: Verify handler-to-beat mapping
- Beat 2.4: Detect orphan handlers (code without JSON)
- Beat 2.5: Detect orphan beats (JSON without implementation)
- Beat 2.6: Report handler mapping status

**Enforcement**: No handlers exist without beats; no beats without handlers

### Movement 3: Test Coverage Verification ✅
**Purpose**: Verify that JSON→Code mapping is tested

- Beat 3.1: Load test files and extract coverage
- Beat 3.2: Map tests to handlers
- Beat 3.3: Identify uncovered handlers
- Beat 3.4: Identify uncovered beats
- Beat 3.5: Report handler test coverage
- Beat 3.6: Report beat test coverage

**Enforcement**: All critical handlers and beats must have tests

### Movement 4: Markdown Consistency Verification 📄
**Purpose**: Ensure documentation is derived from JSON

- Beat 4.1: Load markdown documentation
- Beat 4.2: Extract marked claims
- Beat 4.3: Verify claims against JSON
- Beat 4.4: Check for stale documentation
- Beat 4.5: Detect documentation contradictions
- Beat 4.6: Report markdown consistency

**Enforcement**: Markdown must match JSON; contradictions are errors

### Movement 5: Auditability Chain Verification 🔍
**Purpose**: Ensure full traceability from JSON through all layers

- Beat 5.1: Verify JSON has version and timestamp
- Beat 5.2: Verify code changes are attributed
- Beat 5.3: Verify tests have provenance
- Beat 5.4: Verify markdown has reconciliation notes
- Beat 5.5: Verify event traceability
- Beat 5.6: Verify metrics tracking
- Beat 5.7: Report auditability chain status

**Enforcement**: Every change must be traceable back to JSON

### Movement 6: Overall Governance Conformity 🎼
**Purpose**: Calculate overall conformity score and report governance health

- Beat 6.1: Aggregate all movement results
- Beat 6.2: Calculate conformity metrics

**Enforcement**: System-wide governance score and compliance status

## Enforcement NPM Commands

### Governance Validation

```bash
# Standard governance enforcement
npm run governance:enforce

# Strict enforcement (fails on any warning)
npm run governance:enforce:strict

# Enforcement with detailed report
npm run governance:enforce:report
```

### Auto-Recovery

```bash
# Automatically fix all out-of-process violations
npm run governance:recover

# Analyze orphan handlers without fixing
npm run governance:recover:analyze

# Analyze governance violations from report
npm run governance:recover:report
```

### Integration

```bash
# Add to pre-commit hook
npm run governance:enforce

# Add to CI/CD pipeline
npm run governance:enforce:strict && npm run governance:recover

# Add to build process
npm run governance:enforce:report && npm run build
```

## Out-of-Process Recovery Flow

```
┌──────────────────────────────────────────────────────┐
│ Developer creates code/docs without JSON             │
│ (Out-of-process violation)                           │
└────────────────┬─────────────────────────────────────┘
                 ↓
┌──────────────────────────────────────────────────────┐
│ Run: npm run governance:enforce                      │
│ → Detects orphan handlers                            │
│ → Reports violations                                 │
│ → Fails (as expected)                                │
└────────────────┬─────────────────────────────────────┘
                 ↓
┌──────────────────────────────────────────────────────┐
│ Run: npm run governance:recover                      │
│ → Detects orphan handlers                            │
│ → Reconstructs missing beats from code               │
│ → Updates symphony JSON                              │
│ → Resolves conflicts (JSON wins)                     │
│ → Reconciles markdown                                │
│ → Re-validates governance                            │
└────────────────┬─────────────────────────────────────┘
                 ↓
┌──────────────────────────────────────────────────────┐
│ Run: npm run governance:enforce                      │
│ → All beats have handlers                            │
│ → All handlers have beats                            │
│ → Passes (recovery successful)                       │
└──────────────────────────────────────────────────────┘
```

## System Components

### Core Files

| File | Purpose |
|------|---------|
| `packages/orchestration/json-sequences/architecture-governance-enforcement-symphony.json` | 6-movement symphony definition with 32 beats |
| `scripts/architecture-governance-handlers.js` | 32 handler implementations (400+ lines) |
| `scripts/orchestrate-architecture-governance.js` | Orchestrator that executes symphony |
| `scripts/governance-auto-recovery.js` | Recovery system (700+ lines) |

### Output Files

| File | Purpose |
|------|---------|
| `.generated/governance-report.json` | Detailed enforcement report |
| `.generated/recovery-report.json` | Recovery execution report |

### Documentation

| File | Purpose |
|------|---------|
| `ARCHITECTURE_GOVERNANCE_SYMPHONY_GUIDE.md` | How to use enforcement |
| `GOVERNANCE_AUTO_RECOVERY_GUIDE.md` | How to use recovery |
| `ARCHITECTURE_GOVERNANCE_COMPLETE.md` | Implementation summary |
| `ENTITY_TERMINOLOGY_MAPPING.md` | Entity definitions and conflations |

## Enforcement Rules

### 1. JSON Authority Rule
- JSON is always the single source of truth
- Code must conform to JSON
- In conflicts, JSON definition wins
- No manual overrides without JSON update first

### 2. Handler Coverage Rule
- Every handler in code must have a corresponding beat in JSON
- Every beat in JSON must have a corresponding handler in code
- Orphan handlers are detected and reported
- Orphan beats are detected and reported

### 3. Test Coverage Rule
- Critical handlers must have tests
- Beat definitions must be verified by tests
- Test coverage is tracked and reported
- Uncovered code/beats are flagged

### 4. Markdown Consistency Rule
- Documentation must be derived from JSON
- Contradictions between markdown and JSON are violations
- Markdown must not claim something JSON doesn't define
- Stale documentation is flagged

### 5. Auditability Chain Rule
- Every change must be traceable to JSON
- Code changes must reference beat definitions
- Tests must reference handlers/beats
- Markdown must have reconciliation notes

### 6. Conflict Resolution Rule
- JSON definitions always win
- When conflict detected, keep JSON, discard other
- Record conflict in audit trail
- Report resolution for visibility

## Recovery Mechanisms

### Orphan Handler Detection
```javascript
// Find handlers in code but not in JSON
handlers = extractFromCode()
referenced = extractFromJSON()
orphans = handlers - referenced
```

### Beat Reconstruction
```javascript
// For each orphan handler:
// 1. Analyze implementation
// 2. Infer kind (validation, testing, auditing, etc.)
// 3. Create beat definition
// 4. Add to appropriate movement
```

### JSON Update
```javascript
// Merge reconstructed beats into symphony
// Apply conflict resolution (JSON wins)
// Write updated symphony
```

### Markdown Reconciliation
```javascript
// Add reconciliation note to documentation
// Mark with timestamp and recovery system attribution
// Record in audit trail
```

### Verification
```javascript
// Re-run governance enforcement
// If passes: recovery successful
// If fails: report remaining violations
```

## Metrics & Reporting

### Governance Report Includes

- **Validation Results**: JSON schema validation status
- **Handler Coverage**: Percentage of beats with handlers
- **Test Coverage**: Percentage of handlers with tests
- **Markdown Consistency**: Documentation alignment score
- **Auditability Score**: Traceability completeness
- **Overall Conformity**: System-wide governance health
- **Violations Found**: Detailed list with severity

### Recovery Report Includes

- **Orphans Detected**: Number and list
- **Beats Reconstructed**: Definitions created from code
- **Conflicts Resolved**: Conflicts found and handled
- **Recovery Chain**: Each step of recovery process
- **Actions Taken**: What was changed
- **Verification Result**: Final governance status

## Integration Examples

### Pre-Commit Hook

```bash
#!/bin/bash
# .git/hooks/pre-commit

echo "🎼 Running Architecture Governance..."
npm run governance:enforce

if [ $? -ne 0 ]; then
  echo "❌ Governance failed. Running auto-recovery..."
  npm run governance:recover
  
  echo "✅ Auto-recovery complete. Re-validating..."
  npm run governance:enforce
  
  if [ $? -ne 0 ]; then
    echo "❌ Governance still failing. Manual intervention required."
    exit 1
  fi
fi

echo "✅ Governance passed. Proceeding with commit."
exit 0
```

### CI/CD Pipeline

```yaml
# In your CI/CD workflow
- name: Validate Architecture Governance
  run: npm run governance:enforce:strict

- name: Run Auto-Recovery (if needed)
  run: npm run governance:recover
  continue-on-error: true

- name: Final Validation
  run: npm run governance:enforce:report
```

### Build Process

```json
// In package.json
"build": "npm run governance:enforce && npm run build:packages && npm run governance:report"
```

## When to Use Each Command

| Scenario | Command |
|----------|---------|
| Check if system conforms | `npm run governance:enforce` |
| Fail on any warning | `npm run governance:enforce:strict` |
| Get detailed compliance report | `npm run governance:enforce:report` |
| Find orphan handlers | `npm run governance:recover:analyze` |
| Automatically fix violations | `npm run governance:recover` |
| Analyze specific violations | `npm run governance:recover:report` |

## Success Criteria

### Governance Passes When

✅ All handlers have corresponding beats  
✅ All beats have corresponding handlers  
✅ All critical handlers have tests  
✅ Markdown is consistent with JSON  
✅ Full auditability chain is intact  
✅ No violations remain  

### Recovery Succeeds When

✅ All orphans detected and reported  
✅ Beats reconstructed from orphans  
✅ Symphony JSON updated with new beats  
✅ Markdown reconciled with JSON  
✅ Re-validation passes  
✅ Recovery report generated  

## Troubleshooting

### "Governance enforcement failed"
→ Run `npm run governance:enforce:report` to see detailed violations

### "Orphan handlers detected"
→ Run `npm run governance:recover:analyze` to see which handlers

### "Recovery failed"
→ Check `.generated/recovery-report.json` for error details

### "Conflicts still exist after recovery"
→ Manually review conflicts and delete incorrect definitions

## Architecture Principles Enforced

1. **JSON First**: Changes begin with JSON definitions
2. **Code Conforms**: Implementation follows JSON specs
3. **Tests Validate**: Code→JSON mapping is tested
4. **Docs Derived**: Markdown documents the JSON
5. **Full Traceability**: Every change is auditable
6. **JSON Wins**: Conflicts resolved in JSON's favor

## Next Steps

1. ✅ **Governance enforcement**: `npm run governance:enforce`
2. ✅ **Check for orphans**: `npm run governance:recover:analyze`
3. ✅ **Run auto-recovery**: `npm run governance:recover`
4. ✅ **Verify success**: `npm run governance:enforce:report`
5. ✅ **Integrate to CI/CD**: Add commands to pipeline
6. ✅ **Document in README**: Link to governance guides

## Architecture Principle

> The governance system itself is orchestrated as a symphony, demonstrating the principle it enforces: everything flows through defined, traceable, measurable beats. The system is self-describing—the symphony describes itself, the handlers implement the symphony, the tests validate the handlers, and the documentation derives from the symphony.

---

**System Status**: ✅ OPERATIONAL  
**Recovery Enabled**: ✅ YES  
**JSON Authority**: ✅ ENFORCED  
**Last Updated**: November 26, 2025  
**Version**: 1.0.0  

---

### Related Documentation

- [Governance Enforcement Symphony Guide](./ARCHITECTURE_GOVERNANCE_SYMPHONY_GUIDE.md)
- [Auto-Recovery System Guide](./GOVERNANCE_AUTO_RECOVERY_GUIDE.md)
- [Entity Terminology Mapping](./ENTITY_TERMINOLOGY_MAPPING.md)
