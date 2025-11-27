#!/usr/bin/env node

/**
 * Generate Process Symphonic Compliance Governance Report
 * 
 * Converts process audit data into governance documentation
 * Creates violation registry, remediation roadmap, and compliance dashboard
 * 
 * Authority: JSON (this script generates markdown reflection)
 */

const fs = require('fs');
const path = require('path');

const auditPath = path.join(__dirname, '..', 'process-symphonic-compliance-audit.json');
const reportPath = path.join(__dirname, '..', 'PROCESS_SYMPHONIC_COMPLIANCE_REPORT.md');
const violationsPath = path.join(__dirname, '..', '.generated', 'symphonic-violations-registry.json');

// Ensure output directory exists
const genDir = path.join(__dirname, '..', '.generated');
if (!fs.existsSync(genDir)) {
  fs.mkdirSync(genDir, { recursive: true });
}

// Read audit data
if (!fs.existsSync(auditPath)) {
  console.error(`❌ Audit file not found: ${auditPath}`);
  console.error('Run: node scripts/audit-process-symphonic-compliance.cjs');
  process.exit(1);
}

const audit = JSON.parse(fs.readFileSync(auditPath, 'utf-8'));

/**
 * Generate markdown report
 */
function generateReport() {
  const summary = audit.summary;
  const violations = audit.violations;
  const byCategory = {};

  // Group violations by category
  for (const v of violations) {
    if (!byCategory[v.category]) {
      byCategory[v.category] = [];
    }
    byCategory[v.category].push(v);
  }

  let md = `# Process Symphonic Compliance Report

<!-- AUTO-GENERATED: DO NOT EDIT -->
<!-- Generated from: process-symphonic-compliance-audit.json -->
<!-- Authority: JSON | Reflection: This Markdown -->

**Generated:** ${new Date().toISOString()}

## Executive Summary

This governance report identifies processes that violate the architectural principle:

> **"All domains must be symphonic"**
> 
> Processes that govern or orchestrate operations MUST have:
> - Movements (phases)
> - Beats (discrete operations within movements)
> - Telemetry at each beat
> - Registration in orchestration-domains.json

### Compliance Metrics

| Metric | Count | Percentage |
|--------|-------|-----------|
| Total Processes Scanned | ${summary.totalProcesses} | 100% |
| ✅ Symphonic (Compliant) | ${summary.symphonic} | ${((summary.symphonic / summary.totalProcesses) * 100).toFixed(1)}% |
| ⚠️ Partial Symphonic | ${summary.partialSymphonic} | ${((summary.partialSymphonic / summary.totalProcesses) * 100).toFixed(1)}% |
| ❌ Should Be Symphonic (Violations) | ${summary.shouldBeSymphonic} | ${((summary.shouldBeSymphonic / summary.totalProcesses) * 100).toFixed(1)}% |
| ℹ️ Non-symphonic (Acceptable) | ${summary.nonSymphonic} | ${((summary.nonSymphonic / summary.totalProcesses) * 100).toFixed(1)}% |

**Compliance Score:** ${summary.complianceScore.toFixed(1)}%

---

## Violation Summary by Category

${generateCategorySummary(byCategory)}

---

## Detailed Violations

${generateDetailedViolations(byCategory)}

---

## Remediation Roadmap

### Phase 1: Critical Path (Week 1)
Priority: Generation & Orchestration processes

These are high-traffic, core infrastructure processes:

\`\`\`
- gen-orchestration-docs.js → orchestration-domains-generation-symphony
- generate-orchestration-domains-from-sequences.js → domain-registry-regeneration-symphony
- orchestrate-build-symphony.js → Already symphonic (verify registration)
- build-symphony-handlers.js → Already symphonic (verify registration)
\`\`\`

### Phase 2: High Impact (Week 2)
Priority: Validation processes

These govern integrity and compliance:

\`\`\`
- verify-orchestration-governance.js → orchestration-governance-verification-symphony
- audit-orchestration.js → orchestration-audit-symphony
- validate-orchestration-registry.js → registry-validation-symphony
\`\`\`

### Phase 3: Medium Priority (Week 3-4)
Priority: Remaining generation and validation processes

### Phase 4: Low Priority (Week 5+)
Priority: Utility and analysis processes (may not require symphonic structure)

---

## Implementation Template

For each non-symphonic process, create a symphony definition:

### 1. Create JSON Symphony Definition

File: \`packages/orchestration/json-sequences/{process}-symphony.json\`

\`\`\`json
{
  "id": "{process}-symphony",
  "sequenceId": "{process}-symphony",
  "name": "{Process Name} Symphony",
  "packageName": "orchestration",
  "title": "{Process Name}",
  "description": "Multi-movement orchestration for {process description}",
  "kind": "orchestration",
  "status": "active",
  "governance": {
    "policies": [
      "All movements must execute in strict order",
      "Each beat must record telemetry"
    ],
    "metrics": [
      "Total process duration",
      "Per-movement duration",
      "Success/failure rate"
    ]
  },
  "movements": [
    {
      "id": 1,
      "name": "Initialization",
      "description": "Initialize process state and context",
      "beats": [
        {
          "id": 1,
          "name": "Load Configuration",
          "handler": "loadProcessContext"
        }
      ]
    },
    {
      "id": 2,
      "name": "Execution",
      "description": "Execute core process logic",
      "beats": []
    },
    {
      "id": 3,
      "name": "Finalization",
      "description": "Record results and cleanup",
      "beats": []
    }
  ],
  "events": [
    "process:initiated",
    "movement-1:completed",
    "movement-2:started",
    "movement-2:completed",
    "process:completed"
  ]
}
\`\`\`

### 2. Register in orchestration-domains.json

Add domain entry pointing to symphony JSON

### 3. Update pre:manifests

Call symphony handler instead of direct script execution

### 4. Add Telemetry Handler

Create handlers that record:
- Movement start/end times
- Beat execution telemetry
- Event emissions
- Error handling

---

## Governance Enforcement

### Layer 1: Pre-commit Hook
Validate that new processes are marked as symphonic or exempted

### Layer 2: Pre-build Validation
Scan scripts for symphony indicators

### Layer 3: CI Build Validation
Run full compliance audit; fail build if violations increase

### Layer 4: Manifest Registration
Ensure all symphonic processes registered in orchestration-domains.json

---

## Exemptions & Rationale

The following process categories are exempt from symphonic requirement:

1. **Utility Processes** (${summary.nonSymphonic} processes)
   - One-off helpers
   - Setup/teardown scripts
   - Simple data transformations
   - Rationale: No orchestration required

2. **Analysis & Reporting** (subset of non-symphonic)
   - Read-only analysis
   - Report generation without orchestration
   - Rationale: No governance coordination needed

---

## Next Steps

1. ✅ **Complete:** Audit all processes (441 total)
2. ⏳ **In Progress:** Generate violation registry (this report)
3. 🔄 **Next:** Create symphony definitions for 207 violations
4. 🔄 **Then:** Register symphonies in orchestration-domains.json
5. 🔄 **Finally:** Integrate compliance checks into CI/CD

---

## Related Documentation

- [Orchestration Domains Registry](./orchestration-domains.json)
- [Build Pipeline Symphony](./packages/orchestration/json-sequences/build-pipeline-symphony.json)
- [Musical Conductor Orchestration](./packages/musical-conductor/.ographx/sequences/musical-conductor-orchestration.json)
- [Governance Principles](./docs/governance/orchestration-audit-system-project-plan.json)

---

**Generated by:** Process Symphonic Compliance Audit System  
**Authority:** process-symphonic-compliance-audit.json  
**Last Updated:** ${new Date().toISOString()}
`;

  return md;
}

/**
 * Generate category summary
 */
function generateCategorySummary(byCategory) {
  let md = '';

  const categoryOrder = ['GENERATION', 'VALIDATION', 'ORCHESTRATION', 'BUILD', 'TESTING', 'ANALYSIS', 'UTILITY'];

  for (const cat of categoryOrder) {
    const violations = byCategory[cat] || [];
    if (violations.length === 0) continue;

    md += `### ${cat} (${violations.length} violations)\n\n`;
    md += `**Impact:** `;
    
    switch(cat) {
      case 'GENERATION':
        md += 'HIGH - Generates manifests, documentation, and registry data\n\n';
        break;
      case 'VALIDATION':
        md += 'HIGH - Validates integrity and governance compliance\n\n';
        break;
      case 'ORCHESTRATION':
        md += 'CRITICAL - Orchestrates multi-step build and deployment processes\n\n';
        break;
      case 'BUILD':
        md += 'HIGH - Controls build pipeline and artifact production\n\n';
        break;
      case 'TESTING':
        md += 'MEDIUM - Test execution and validation\n\n';
        break;
      default:
        md += 'MEDIUM\n\n';
    }

    md += `**Processes:** ${violations.map(v => `\`${v.process}\``).join(', ')}\n\n`;
  }

  return md;
}

/**
 * Generate detailed violations list
 */
function generateDetailedViolations(byCategory) {
  let md = '';

  const categoryOrder = ['ORCHESTRATION', 'GENERATION', 'VALIDATION', 'BUILD'];

  for (const cat of categoryOrder) {
    const violations = byCategory[cat] || [];
    if (violations.length === 0) continue;

    md += `### ${cat}\n\n`;

    // Show first 10, then summarize
    const shown = violations.slice(0, 10);
    const hidden = violations.length - shown.length;

    for (const v of shown) {
      md += `- **${v.process}** (Severity: ${v.severity})\n`;
      md += `  - Reason: ${v.reason}\n`;
    }

    if (hidden > 0) {
      md += `\n... and ${hidden} more ${cat.toLowerCase()} processes\n`;
    }

    md += '\n';
  }

  return md;
}

/**
 * Generate violations registry (JSON)
 */
function generateViolationsRegistry() {
  const registry = {
    generatedAt: audit.generatedAt,
    totalViolations: audit.violations.length,
    complianceScore: audit.summary.complianceScore,
    violations: audit.violations,
    recommendations: audit.recommendations,
    categories: {}
  };

  // Group by category with stats
  for (const violation of audit.violations) {
    if (!registry.categories[violation.category]) {
      registry.categories[violation.category] = {
        count: 0,
        severity: 'high',
        processes: []
      };
    }
    registry.categories[violation.category].count++;
    registry.categories[violation.category].processes.push(violation.process);
  }

  return registry;
}

// Generate outputs
console.log('📋 Generating Process Symphonic Compliance Report...\n');

const report = generateReport();
const registry = generateViolationsRegistry();

fs.writeFileSync(reportPath, report, 'utf-8');
fs.writeFileSync(violationsPath, JSON.stringify(registry, null, 2), 'utf-8');

console.log('✅ Report generated:', path.relative(process.cwd(), reportPath));
console.log('✅ Registry generated:', path.relative(process.cwd(), violationsPath));

console.log(`\n📊 Summary:`);
console.log(`  - Total violations: ${audit.violations.length}`);
console.log(`  - Compliance score: ${audit.summary.complianceScore.toFixed(1)}%`);
console.log(`  - By category: ${Object.keys(registry.categories).map(k => `${k}(${registry.categories[k].count})`).join(', ')}`);
