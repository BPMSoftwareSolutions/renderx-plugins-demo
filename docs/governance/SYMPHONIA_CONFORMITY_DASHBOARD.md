# Symphonia Conformity Dashboard

<!-- AUTO-GENERATED: Symphonia Auditing System -->
<!-- Generated: 2025-11-26T15:14:58.615Z -->

## 🎼 Overall Conformity Score

**20/100**

🔴 POOR

---

## 📊 Conformity by Dimension

| Dimension | Score | Artifacts | Violations |
|-----------|-------|-----------|------------|
| Orchestration Domain Conformity | 0/100 | 61 | 30 |
| Contract Schema Conformity | 100/100 | 8 | 0 |
| Sequence Flow Conformity | 0/100 | 25 | 27 |
| BDD Specification Conformity | 0/100 | 7 | 13 |
| Handler Specification Conformity | 0/100 | 263 | 15 |


## 🚨 Critical Violations (10)


### baseline.metrics.establish
- **Rule**: sequence-beats-positive
- **Issue**: Invalid beat count
- **Remediation**: Set beats to handler item count (current: undefined)

### handler-implementation.workflow
- **Rule**: sequence-beats-positive
- **Issue**: Invalid beat count
- **Remediation**: Set beats to handler item count (current: undefined)

### cag-agent-workflow.feature
- **Rule**: scenarios-complete
- **Issue**: 1 scenarios missing Given-When-Then
- **Remediation**: Ensure all scenarios have complete Given-When-Then structure

### graphing-orchestration.feature
- **Rule**: scenarios-complete
- **Issue**: 1 scenarios missing Given-When-Then
- **Remediation**: Ensure all scenarios have complete Given-When-Then structure

### musical-conductor-orchestration.feature
- **Rule**: scenarios-complete
- **Issue**: 1 scenarios missing Given-When-Then
- **Remediation**: Ensure all scenarios have complete Given-When-Then structure

### orchestration-audit-session.feature
- **Rule**: scenarios-complete
- **Issue**: 1 scenarios missing Given-When-Then
- **Remediation**: Ensure all scenarios have complete Given-When-Then structure

### orchestration-audit-system.feature
- **Rule**: scenarios-complete
- **Issue**: 1 scenarios missing Given-When-Then
- **Remediation**: Ensure all scenarios have complete Given-When-Then structure

### self-sequences.feature
- **Rule**: scenarios-complete
- **Issue**: 1 scenarios missing Given-When-Then
- **Remediation**: Ensure all scenarios have complete Given-When-Then structure

### AGENT_HANDLER_IMPLEMENTATION_WORKFLOW.feature
- **Rule**: user-story-present
- **Issue**: Missing user story format
- **Remediation**: Add: In order to ... As a ... I want ...

### AGENT_HANDLER_IMPLEMENTATION_WORKFLOW.feature
- **Rule**: scenarios-complete
- **Issue**: 1 scenarios missing Given-When-Then
- **Remediation**: Ensure all scenarios have complete Given-When-Then structure


## ⚠️  Major Violations (75)

- **cag-agent-workflow > Phase 0**: Phase has 4 items, but beats=41
- **cag-agent-workflow > Phase 1**: Phase has 4 items, but beats=41
- **cag-agent-workflow > Phase 2**: Phase has 6 items, but beats=41
- **cag-agent-workflow > Phase 3**: Phase has 7 items, but beats=41
- **cag-agent-workflow > Phase 4**: Phase has 6 items, but beats=41
- **cag-agent-workflow > Phase 5**: Phase has 4 items, but beats=41
- **cag-agent-workflow > Phase 6**: Phase has 4 items, but beats=41
- **cag-agent-workflow > Phase 7**: Phase has 6 items, but beats=41
- **orchestration-audit-session > Phase 0**: Phase has 3 items, but beats=25
- **orchestration-audit-session > Phase 1**: Phase has 3 items, but beats=25

... and 65 more


## 📋 Recommendations

- 🚨 CRITICAL: Fix all CRITICAL violations before deployment
- ⚠️  MAJOR: Address MAJOR violations in next sprint
- 🔴 Poor conformity - immediate remediation required

---

Generated: 2025-11-26T15:14:58.615Z
Total Artifacts Scanned: 364
