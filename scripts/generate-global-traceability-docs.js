#!/usr/bin/env node

/**
 * Generate Documentation from Global Traceability Map JSON
 * 
 * Pattern: JSON (source of truth) → Script-generated Markdown (derivative)
 * 
 * Consumes: .generated/global-traceability-map.json
 * Produces: Multiple markdown guides for different audiences
 * 
 * Usage: node scripts/generate-global-traceability-docs.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load the global traceability map
const traceabilityMapPath = path.join(__dirname, '..', '.generated', 'global-traceability-map.json');
const map = JSON.parse(fs.readFileSync(traceabilityMapPath, 'utf8'));

/**
 * Generate Component Topology Guide
 */
function generateComponentTopologyGuide() {
  let content = `# RenderX Plugins - Component Topology Guide

*Generated from: \`.generated/global-traceability-map.json\`*
*Last Updated: ${new Date().toISOString()}*

## Overview

This guide maps all components, their roles, health status, and integration points in the RenderX plugins monorepo.

## Active Components

| Component | Type | Role | Status | Health Score | Risk Level |
|-----------|------|------|--------|--------------|-----------|
`;

  map.packages.active_packages.forEach(pkg => {
    const health = pkg.health_score || 'N/A';
    const risk = pkg.risk_level || 'UNKNOWN';
    content += `| ${pkg.name} | ${pkg.type} | ${pkg.role} | ${pkg.status} | ${health} | ${risk} |\n`;
  });

  content += `

## Critical Components (Requires Immediate Attention)

`;

  const critical = map.packages.active_packages.filter(p => p.risk_level === 'CRITICAL');
  critical.forEach(pkg => {
    content += `### ${pkg.name}

- **Path:** \`${pkg.path}\`
- **Health Score:** ${pkg.health_score}
- **Risk Level:** CRITICAL
- **Issues:**\n`;
    if (pkg.known_issues) {
      pkg.known_issues.forEach(issue => {
        content += `  - ${issue}\n`;
      });
    }
    if (pkg.self_healing_ready) {
      content += `- **Self-Healing:** Ready (can be auto-remediated)\n`;
    }
    content += '\n';
  });

  content += `## Standalone Tools

These packages are NOT runtime components but provide value through analysis:

`;

  map.packages.standalone_tools.forEach(tool => {
    content += `### ${tool.name}

- **Role:** ${tool.role}
- **Description:** ${tool.description}
- **Note:** ${tool.note}
- **Outputs:**\n`;
    Object.entries(tool.outputs).forEach(([key, value]) => {
      content += `  - ${key}: ${value}\n`;
    });
    content += '\n';
  });

  content += `## Deprecated Packages

`;

  map.packages.deprecated_packages.forEach(pkg => {
    content += `### ${pkg.name}

- **Status:** ${pkg.status}
- **Reason:** ${pkg.reason}
- **Recommendation:** ${pkg.recommendation}
- **Action Required:** ${pkg.action_required}

`;
  });

  return content;
}

/**
 * Generate Data Pipeline Guide
 */
function generateDataPipelineGuide() {
  let content = `# Data Transformation Pipeline Guide

*Generated from: \`.generated/global-traceability-map.json\`*
*Last Updated: ${new Date().toISOString()}*

## Complete Pipeline: OGraphX → Self-Healing → Traceability → SLO/SLA → Dashboard

This guide traces data transformations from code analysis through visualization.

`;

  const pipeline = map.data_transformation_pipelines.pipeline_ographx_to_self_healing_to_traceability;
  
  content += `## Pipeline Stages (${pipeline.stages.length} total)\n\n`;

  pipeline.stages.forEach((stage, idx) => {
    content += `### Stage ${stage.stage}: ${stage.name}\n\n`;
    content += `**From:** \`${stage.from}\`\n\n`;
    content += `**To:** \`${stage.to}\`\n\n`;
    if (stage.script) {
      content += `**Script:** \`${stage.script}\`\n\n`;
    }
    if (stage.sequence) {
      content += `**Sequence:** ${stage.sequence}\n\n`;
    }
    content += `**Purpose:** ${stage.purpose}\n\n`;
    if (stage.artifacts && stage.artifacts.length > 0) {
      content += `**Artifacts:**\n`;
      stage.artifacts.forEach(artifact => {
        content += `- ${artifact}\n`;
      });
      content += '\n';
    }
    if (stage.trigger_on_breach) {
      content += `🚨 **CRITICAL:** ${stage.trigger_on_breach}\n\n`;
    }
  });

  return content;
}

/**
 * Generate SLO/SLI System Integration Guide
 */
function generateSLOIntegrationGuide() {
  let content = `# SLO/SLI/SLA System Integration Guide

*Generated from: \`.generated/global-traceability-map.json\`*
*Last Updated: ${new Date().toISOString()}*

## System Architecture: 8-Phase SLO/SLI/SLA Implementation

### Phase Progress

`;

  const phases = map.next_phases;
  content += `
| Phase | Task | Status | Trigger | Output |
|-------|------|--------|---------|--------|
| 1 | SLI Framework | ✅ COMPLETE | — | sli-framework.json |
| 2 | SLI Metrics | ✅ COMPLETE | Real telemetry | sli-metrics.json |
| 3 | SLO Targets | 🟡 QUEUED | Phase 2 output | slo-targets.json |
| 4 | Error Budgets | 🟡 PLANNED | Phase 3 output | error-budgets.json |
| 5 | SLA Compliance | 🟡 PLANNED | Phase 4 output | sla-compliance-report.json |
| 6 | Dashboard | 🟡 PLANNED | Phase 5 output | packages/slo-dashboard/ |
| 7 | Workflow Engine | 🟡 PLANNED | All phases | slo-workflow-state.json |
| 8 | Documentation | 🟡 PLANNED | All phases | Guides + specifications |

### Self-Healing Integration

**Critical Loop:**

1. **Phase 5 (SLA Compliance)** detects SLO breach
2. **Automatically triggers** packages/self-healing
3. **Self-healing** performs: diagnose → fix → test → deploy
4. **Feedback loop** recalculates Phase 2 metrics
5. **Dashboard shows** improvement in real-time

### Component Health Status

`;

  const health = map.component_health_status;
  content += `| Component | Health Score | Risk | Availability | SLO Target | Status |\n`;
  content += `|-----------|--------------|------|--------------|-----------|--------|\n`;
  
  health.components.forEach(comp => {
    const availability = comp.availability || '—';
    const target = comp.slo_target || '—';
    const status = comp.compliance || comp.status || '—';
    content += `| ${comp.id} | ${comp.health_score} | ${comp.risk_level} | ${availability} | ${target} | ${status} |\n`;
  });

  return content;
}

/**
 * Generate Dashboard Architecture Guide
 */
function generateDashboardArchitectureGuide() {
  let content = `# SLO Dashboard - Architecture & Implementation Guide

*Generated from: \`.generated/global-traceability-map.json\`*
*Last Updated: ${new Date().toISOString()}*

## Design Principles

- **Generic:** Works with ANY SLI/SLO system, not RenderX-specific
- **Reusable:** Published to npm as @slo-shape/dashboard
- **Self-contained:** All logic in React hooks and services
- **Real-time:** Updates stream from JSON sources
- **Integrated:** Shows self-healing activity and improvements

## Package Structure

\`\`\`
packages/slo-dashboard/
├── src/
│   ├── components/
│   │   ├── MetricsPanel.tsx
│   │   ├── BudgetBurndown.tsx
│   │   ├── ComplianceTracker.tsx
│   │   ├── HealthScores.tsx
│   │   ├── SelfHealingActivity.tsx
│   │   └── Dashboard.tsx
│   ├── services/
│   │   ├── metricsLoader.ts
│   │   ├── budgetEngine.ts
│   │   ├── complianceTracker.ts
│   │   └── dataUpdater.ts
│   ├── hooks/
│   │   ├── useSLOMetrics.ts
│   │   ├── useErrorBudget.ts
│   │   └── useComplianceStatus.ts
│   ├── types/
│   │   └── slo.types.ts
│   └── styles/
├── tests/
└── package.json
\`\`\`

## Components

`;

  const dashboard = map.proposed_dashboard_architecture;
  
  if (dashboard.codebase_structure && dashboard.codebase_structure.src && dashboard.codebase_structure.src.components) {
    dashboard.codebase_structure.src.components.forEach(comp => {
      content += `### ${comp.name}\n\n`;
      content += `**Purpose:** ${comp.purpose}\n\n`;
      if (comp.inputs) {
        content += `**Inputs:**\n${comp.inputs.map(i => `- ${i}`).join('\n')}\n\n`;
      }
      if (comp.displays) {
        content += `**Displays:**\n${comp.displays.map(d => `- ${d}`).join('\n')}\n\n`;
      }
    });
  }

  content += `\n## Data Inputs by Source\n\n`;

  Object.entries(dashboard.data_inputs).forEach(([source, details]) => {
    content += `### From ${source}

**File:** \`${details.file}\`

**Fields:**
${details.fields.map(f => `- ${f}`).join('\n')}

`;
  });

  return content;
}

/**
 * Generate Robotics Deprecation Guide
 */
function generateRoboticsDeprecationGuide() {
  let content = `# Robotics Package Deprecation Plan

*Generated from: \`.generated/global-traceability-map.json\`*
*Last Updated: ${new Date().toISOString()}*

## Overview

The \`packages/robotics\` package is deprecated and should be removed in the next major version.

### Reason

${map.robotics_deprecation_plan.reason}

### Current Status

${map.robotics_deprecation_plan.status}

## Action Items

`;

  map.robotics_deprecation_plan.action_items.forEach((item, idx) => {
    content += `### ${idx + 1}. ${item.action}\n\n`;
    if (item.file) content += `**File:** \`${item.file}\`\n\n`;
    if (item.field) content += `**Field:** ${item.field}\n\n`;
    if (item.scripts) content += `**Scripts:** ${item.scripts.join(', ')}\n\n`;
    if (item.section) content += `**Section:** ${item.section}\n\n`;
    if (item.recommendation) content += `**Recommendation:** ${item.recommendation}\n\n`;
    content += `**Impact:** ${item.impact}\n\n`;
  });

  content += `## Validation

\`\`\`bash
# Ensure no other packages depend on robotics
grep -r 'packages/robotics' packages/*/package.json
\`\`\`

**Expected Output:** Empty (no dependencies found)

`;

  return content;
}

/**
 * Generate Traceability Governance Rules
 */
function generateGovernanceGuide() {
  let content = `# Traceability Governance Rules

*Generated from: \`.generated/global-traceability-map.json\`*
*Last Updated: ${new Date().toISOString()}*

## Traceability Requirements

All artifacts and transformations must satisfy:

`;

  map.governance_rules.traceability_requirements.forEach(req => {
    content += `- ${req}\n`;
  });

  content += `\n## Deprecation Handling\n\n`;

  map.governance_rules.deprecation_handling.forEach(rule => {
    content += `- ${rule}\n`;
  });

  content += `\n## Self-Healing Triggers\n\n`;

  map.governance_rules.self_healing_triggers.forEach(trigger => {
    content += `- ${trigger}\n`;
  });

  return content;
}

/**
 * Main: Generate all documents
 */
function main() {
  console.log('\n📊 Generating Global Traceability Documentation...\n');

  const docs = [
    {
      filename: 'GLOBAL_COMPONENT_TOPOLOGY.md',
      generator: generateComponentTopologyGuide,
      title: 'Component Topology'
    },
    {
      filename: 'GLOBAL_DATA_PIPELINES.md',
      generator: generateDataPipelineGuide,
      title: 'Data Pipelines'
    },
    {
      filename: 'GLOBAL_SLO_INTEGRATION.md',
      generator: generateSLOIntegrationGuide,
      title: 'SLO/SLA Integration'
    },
    {
      filename: 'GLOBAL_DASHBOARD_ARCHITECTURE.md',
      generator: generateDashboardArchitectureGuide,
      title: 'Dashboard Architecture'
    },
    {
      filename: 'GLOBAL_ROBOTICS_DEPRECATION.md',
      generator: generateRoboticsDeprecationGuide,
      title: 'Robotics Deprecation'
    },
    {
      filename: 'GLOBAL_GOVERNANCE_RULES.md',
      generator: generateGovernanceGuide,
      title: 'Governance Rules'
    }
  ];

  const rootPath = path.join(__dirname, '..');

  docs.forEach(doc => {
    const content = doc.generator();
    const filepath = path.join(rootPath, doc.filename);
    fs.writeFileSync(filepath, content, 'utf8');
    console.log(`✅ Generated: ${doc.filename}`);
  });

  console.log(`\n✨ All ${docs.length} documentation files generated successfully!\n`);
  console.log('📑 Generated Files:');
  docs.forEach(doc => {
    console.log(`   - ${doc.filename}`);
  });
  console.log('\n💡 Pattern: JSON source of truth → Script-generated markdown\n');
}

// Run
main();
