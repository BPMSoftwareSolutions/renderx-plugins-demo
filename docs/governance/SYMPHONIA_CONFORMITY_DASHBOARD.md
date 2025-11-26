# Symphonia Conformity Dashboard

<!-- AUTO-GENERATED: Symphonia Auditing System -->
<!-- Generated: 2025-11-26T18:44:53.123Z -->

## 🎼 Overall Conformity Score

**50/100**

🔴 POOR

---

## 📊 Conformity by Dimension

| Dimension | Score | Artifacts | Violations |
|-----------|-------|-----------|------------|
| Orchestration Domain Conformity | 100/100 | 61 | 0 |
| Contract Schema Conformity | 100/100 | 8 | 0 |
| Sequence Flow Conformity | 0/100 | 27 | 31 |
| BDD Specification Conformity | 50/100 | 8 | 5 |
| Handler Specification Conformity | 0/100 | 263 | 15 |


## 🚨 Critical Violations (4)


### symphonia-conformity-alignment-pipeline
- **Rule**: sequence-beats-positive
- **Issue**: Invalid beat count
- **Remediation**: Set beats to handler item count (current: undefined)

### symphony-report-pipeline
- **Rule**: sequence-beats-positive
- **Issue**: Invalid beat count
- **Remediation**: Set beats to handler item count (current: undefined)

### baseline.metrics.establish
- **Rule**: sequence-beats-positive
- **Issue**: Invalid beat count
- **Remediation**: Set beats to handler item count (current: 0)

### handler-implementation.workflow
- **Rule**: sequence-beats-positive
- **Issue**: Invalid beat count
- **Remediation**: Set beats to handler item count (current: 0)


## ⚠️  Major Violations (47)

- **control-panel-classes-add-symphony**: Invalid tempo: undefined
- **control-panel-classes-remove-symphony**: Invalid tempo: undefined
- **control-panel-css-create-symphony**: Invalid tempo: undefined
- **control-panel-css-delete-symphony**: Invalid tempo: undefined
- **control-panel-css-edit-symphony**: Invalid tempo: undefined
- **control-panel-selection-show-symphony**: Invalid tempo: undefined
- **control-panel-ui-field-change-symphony**: Invalid tempo: undefined
- **control-panel-ui-field-validate-symphony**: Invalid tempo: undefined
- **control-panel-ui-init-batched-symphony**: Invalid tempo: undefined
- **control-panel-ui-init-symphony**: Invalid tempo: undefined

... and 37 more


## 📋 Recommendations

- 🚨 CRITICAL: Fix all CRITICAL violations before deployment
- ⚠️  MAJOR: Address MAJOR violations in next sprint
- 🔴 Poor conformity - immediate remediation required

---

Generated: 2025-11-26T18:44:53.123Z
Total Artifacts Scanned: 367
