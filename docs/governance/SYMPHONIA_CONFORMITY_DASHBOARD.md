# Symphonia Conformity Dashboard

<!-- AUTO-GENERATED: Symphonia Auditing System -->
<!-- Generated: 2025-11-27T02:51:57.168Z -->

## 🎼 Overall Conformity Score

**62/100**

🔴 POOR

---

## 📊 Conformity by Dimension

| Dimension | Score | Artifacts | Violations |
|-----------|-------|-----------|------------|
| Orchestration Domain Conformity | 80/100 | 61 | 2 |
| Contract Schema Conformity | 100/100 | 8 | 0 |
| Sequence Flow Conformity | 90/100 | 29 | 1 |
| BDD Specification Conformity | 40/100 | 9 | 6 |
| Handler Specification Conformity | 0/100 | 264 | 17 |


## 🚨 Critical Violations (2)


### build-pipeline-symphony
- **Rule**: sequence-beats-positive
- **Issue**: Invalid beat count
- **Remediation**: Set beats to handler item count (current: undefined)

### build-pipeline-symphony.feature
- **Rule**: scenarios-complete
- **Issue**: 5 scenarios missing Given-When-Then
- **Remediation**: Ensure all scenarios have complete Given-When-Then structure


## ⚠️  Major Violations (24)

- **orchestration-audit-session**: Invalid key: C
- **orchestration-audit-system**: Invalid key: G
- **cag-agent-workflow.feature**: Only 1 scenarios (need >= 2)
- **graphing-orchestration.feature**: Only 1 scenarios (need >= 2)
- **orchestration-audit-session.feature**: Only 1 scenarios (need >= 2)
- **orchestration-audit-system.feature**: Only 1 scenarios (need >= 2)
- **self-sequences.feature**: Only 1 scenarios (need >= 2)
- **CanvasDrop.container-route.spec.ts**: Missing test cases
- **drop.spec.ts**: Missing test cases
- **select.overlay.helpers.spec.ts**: Missing proper context setup

... and 14 more


## 📋 Recommendations

- 🚨 CRITICAL: Fix all CRITICAL violations before deployment
- ⚠️  MAJOR: Address MAJOR violations in next sprint
- 🔴 Poor conformity - immediate remediation required

---

Generated: 2025-11-27T02:51:57.168Z
Total Artifacts Scanned: 371
