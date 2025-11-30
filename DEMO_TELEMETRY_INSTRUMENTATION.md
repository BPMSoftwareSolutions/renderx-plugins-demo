<!-- AUTO-GENERATED -->
<!-- Source: orchestration-audit-system-project-plan.json (governanceDocumentation.telemetryGovernance.instrumentation) -->
<!-- Generated: 2025-11-30T23:31:40.761Z -->
<!-- DO NOT EDIT - Regenerate with: npm run build -->

# Demo Telemetry Instrumentation Guide

How to emit telemetry events during demo execution for observability-first governance

---

## Overview

Developers emit telemetry markers using console.log during demo execution. Capture system validates signatures against plan baselines.

## Format Requirements

### Events

**Format**: `[TELEMETRY_EVENT] <signature> <details>`

**Example**: `[TELEMETRY_EVENT] bootstrap.registry.init Registry initialized with 60 domains`

### Metrics

**Format**: `[TELEMETRY_METRIC] <name> = <value>`

**Example**: `[TELEMETRY_METRIC] registry.size = 60`

## Integration Workflow

1. Developer reviews plan telemetry.signatures for sprint
2. Adds console.log([TELEMETRY_EVENT]) markers to demo code
3. Tests locally with npm run demo:telemetry:sample
4. Runs npm run demo:capture:telemetry <sprint-id> to validate
5. Commit after capture shows 100% coverage

## Troubleshooting

### Q: No [TELEMETRY_EVENT] markers found

**A**: Verify demo code has console.log with correct marker format on single line to stdout

### Q: Coverage not 100%

**A**: Check orchestration-telemetry-validation.md for missingSignatures array; add missing events


---

**Generated from**: `orchestration-audit-system-project-plan.json` (v1.3.0)  
**Generator**: `scripts/generate-telemetry-instrumentation.js`  
**Pattern**: JSON Authority → Auto-Generated Markdown  

<!-- DO NOT EDIT - Regenerate with: npm run build -->
<!-- AUTO-GENERATED -->
