#!/usr/bin/env node

/**
 * Symphonia Auditing System - Conformity Audit Generator
 * 
 * Audits all orchestration pipeline artifacts against conformity rules:
 * - Orchestration domains
 * - Contracts
 * - Sequence flows
 * - BDD specifications
 * - Handler specifications
 * 
 * Generates:
 * 1. symphonia-audit-report.json (raw conformity data)
 * 2. SYMPHONIA_CONFORMITY_DASHBOARD.md (visual report)
 * 3. SYMPHONIA_REMEDIATION_PLAN.md (action items)
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const WORKSPACE_ROOT = process.cwd();
const GOVERNANCE_DIR = path.join(WORKSPACE_ROOT, 'docs', 'governance');
const AUDIT_CONFIG = path.join(GOVERNANCE_DIR, 'symphonia-auditing-system.json');

// Load audit configuration
const auditConfig = JSON.parse(fs.readFileSync(AUDIT_CONFIG, 'utf8'));

// Initialize audit state
const auditState = {
  timestamp: new Date().toISOString(),
  version: '1.0.0',
  dimensions: {},
  totalArtifacts: 0,
  violations: {
    CRITICAL: [],
    MAJOR: [],
    MINOR: []
  },
  conformityScore: 100,
  recommendations: [],
  scanDetails: {}
};

// ====== ORCHESTRATION DOMAINS AUDITING ======
function auditOrchestrationDomains() {
  console.log('\n🔍 Auditing orchestration domains...');
  const domainsFile = path.join(WORKSPACE_ROOT, 'orchestration-domains.json');
  const domains = JSON.parse(fs.readFileSync(domainsFile, 'utf8'));
  
  const dimensionAudit = {
    name: 'Orchestration Domain Conformity',
    artifactsScanned: domains.domains?.length || 0,
    violations: [],
    score: 100
  };

  const rules = auditConfig.auditDimensions.find(d => d.id === 'orchestration-domains')?.rules || [];

  domains.domains?.forEach((domain, idx) => {
    // Check domain-id-required
    if (!domain.id) {
      const violation = {
        level: 'CRITICAL',
        rule: 'domain-id-required',
        artifact: `Domain[${idx}]`,
        message: 'Missing domain ID',
        remediation: `Auto-generate from name: ${domain.name?.replace(/\s+/g, '-').toLowerCase()}`
      };
      dimensionAudit.violations.push(violation);
      auditState.violations.CRITICAL.push(violation);
    }

    // Check domain-metadata-complete
    const requiredFields = ['id', 'name', 'category', 'description', 'purpose', 'status'];
    const missing = requiredFields.filter(f => !domain[f]);
    if (missing.length > 0) {
      const violation = {
        level: 'CRITICAL',
        rule: 'domain-metadata-complete',
        artifact: domain.id || `Domain[${idx}]`,
        message: `Missing fields: ${missing.join(', ')}`,
        remediation: `Populate: ${missing.join(', ')}`
      };
      dimensionAudit.violations.push(violation);
      auditState.violations.CRITICAL.push(violation);
    }

    // Check domain-movement-structure
    if (domain.movements && domain.beats && domain.movements > domain.beats) {
      const violation = {
        level: 'MAJOR',
        rule: 'domain-movement-structure',
        artifact: domain.id,
        message: `Movements (${domain.movements}) exceed beats (${domain.beats})`,
        remediation: `Adjust: movements should be <= beats/5 (current: ${domain.movements} > ${domain.beats})`
      };
      dimensionAudit.violations.push(violation);
      auditState.violations.MAJOR.push(violation);
    }

    // Check domain-key-signature
    const validKeys = ['C Major', 'D Major', 'E Major', 'F Major', 'G Major', 'A Major', 'B Major',
                      'C Minor', 'D Minor', 'E Minor', 'F Minor', 'G Minor', 'A Minor', 'B Minor'];
    if (domain.key && !validKeys.includes(domain.key)) {
      const violation = {
        level: 'MAJOR',
        rule: 'domain-key-signature',
        artifact: domain.id,
        message: `Invalid key: ${domain.key}`,
        remediation: `Use valid key, e.g., 'C Major' (current: '${domain.key}')`
      };
      dimensionAudit.violations.push(violation);
      auditState.violations.MAJOR.push(violation);
    }

    // Check domain-time-signature
    if (domain.timeSignature && !domain.timeSignature.match(/^\d+\/\d+$/)) {
      const violation = {
        level: 'MAJOR',
        rule: 'domain-time-signature',
        artifact: domain.id,
        message: `Invalid time signature: ${domain.timeSignature}`,
        remediation: `Use format like '4/4' (current: '${domain.timeSignature}')`
      };
      dimensionAudit.violations.push(violation);
      auditState.violations.MAJOR.push(violation);
    }

    // Check domain-handler-beats-present
    if (domain.sketch?.phases) {
      let totalItems = 0;
      domain.sketch.phases.forEach((phase, pIdx) => {
        if (phase.items) {
          totalItems += phase.items.length;
        }
      });
      
      // Only flag if total items is significantly different from beats (allow ±1 variance per phase)
      const maxVariance = domain.sketch.phases.length * 2; // Allow reasonable variance
      if (totalItems > 0 && Math.abs(totalItems - domain.beats) > maxVariance) {
        const violation = {
          level: 'MAJOR',
          rule: 'domain-handler-beats-present',
          artifact: `${domain.id}`,
          message: `Total phase items (${totalItems}) don't match beats (${domain.beats}) - variance: ${Math.abs(totalItems - domain.beats)}`,
          remediation: `Align total phase items to beat count`
        };
        dimensionAudit.violations.push(violation);
        auditState.violations.MAJOR.push(violation);
      }
    }
  });

  // Calculate dimension score
  dimensionAudit.score = Math.max(0, 100 - (dimensionAudit.violations.length * 10));
  auditState.dimensions['orchestration-domains'] = dimensionAudit;
  auditState.totalArtifacts += dimensionAudit.artifactsScanned;

  console.log(`  ✓ Scanned ${dimensionAudit.artifactsScanned} domains, found ${dimensionAudit.violations.length} violations`);
  console.log(`    Score: ${dimensionAudit.score}/100`);
}

// ====== CONTRACTS AUDITING ======
function auditContracts() {
  console.log('\n🔍 Auditing contracts...');
  const contractsDir = path.join(WORKSPACE_ROOT, 'contracts');
  const contractFiles = fs.readdirSync(contractsDir).filter(f => f.endsWith('.contract.json'));

  const dimensionAudit = {
    name: 'Contract Schema Conformity',
    artifactsScanned: contractFiles.length,
    violations: [],
    score: 100
  };

  contractFiles.forEach(file => {
    const contract = JSON.parse(fs.readFileSync(path.join(contractsDir, file), 'utf8'));

    // Check contract-feature-required
    if (!contract.feature) {
      const violation = {
        level: 'CRITICAL',
        rule: 'contract-feature-required',
        artifact: file,
        message: 'Missing feature identifier',
        remediation: `Infer from filename: ${file.replace('.contract.json', '')}`
      };
      dimensionAudit.violations.push(violation);
      auditState.violations.CRITICAL.push(violation);
    }

    // Check contract-required-fields
    if (!contract.required || contract.required.length === 0) {
      const violation = {
        level: 'CRITICAL',
        rule: 'contract-required-fields',
        artifact: file,
        message: 'Missing required fields definition',
        remediation: 'Set required: ["feature", "event", "beats", "status", "shapeHash"]'
      };
      dimensionAudit.violations.push(violation);
      auditState.violations.CRITICAL.push(violation);
    }

    // Check contract-hash-strategy
    if (!contract.hashStrategy) {
      const violation = {
        level: 'MAJOR',
        rule: 'contract-hash-strategy',
        artifact: file,
        message: 'Missing hash strategy',
        remediation: 'Set hashStrategy: "sha256(serializedWithoutMeta)"'
      };
      dimensionAudit.violations.push(violation);
      auditState.violations.MAJOR.push(violation);
    }

    // Check contract-optional-fields-defined
    if (!contract.optional) {
      const violation = {
        level: 'MAJOR',
        rule: 'contract-optional-fields-defined',
        artifact: file,
        message: 'Missing optional fields documentation',
        remediation: 'Add optional: ["durationMs", "correlationId", "coverageId"]'
      };
      dimensionAudit.violations.push(violation);
      auditState.violations.MAJOR.push(violation);
    }

    // Check contract-version-monotonic
    if (typeof contract.version !== 'number' || contract.version < 1) {
      const violation = {
        level: 'MAJOR',
        rule: 'contract-version-monotonic',
        artifact: file,
        message: 'Invalid or missing version',
        remediation: 'Set version: 1 (or increment from previous)'
      };
      dimensionAudit.violations.push(violation);
      auditState.violations.MAJOR.push(violation);
    }
  });

  dimensionAudit.score = Math.max(0, 100 - (dimensionAudit.violations.length * 10));
  auditState.dimensions['contracts'] = dimensionAudit;
  auditState.totalArtifacts += dimensionAudit.artifactsScanned;

  console.log(`  ✓ Scanned ${dimensionAudit.artifactsScanned} contracts, found ${dimensionAudit.violations.length} violations`);
  console.log(`    Score: ${dimensionAudit.score}/100`);
}

// ====== SEQUENCE FLOWS AUDITING ======
function auditSequences() {
  console.log('\n🔍 Auditing sequence flows...');
  
  let sequenceCount = 0;
  const dimensionAudit = {
    name: 'Sequence Flow Conformity',
    artifactsScanned: 0,
    violations: [],
    score: 100
  };

  // Find all json-sequences directories
  const findSequences = (dir) => {
    if (!fs.existsSync(dir)) return [];
    const files = fs.readdirSync(dir);
    let results = [];
    
    files.forEach(file => {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) {
        if (file === 'json-sequences') {
          const seqFiles = fs.readdirSync(fullPath)
            .filter(f => f.endsWith('.json') && f !== 'package.json' && f !== 'tsconfig.json' && f !== 'index.json');
          results.push(...seqFiles.map(f => path.join(fullPath, f)));
        }
        results.push(...findSequences(fullPath));
      }
    });
    return results;
  };

  const sequenceFiles = findSequences(path.join(WORKSPACE_ROOT, 'packages'));
  dimensionAudit.artifactsScanned = sequenceFiles.length;

  sequenceFiles.forEach(file => {
    try {
      const sequence = JSON.parse(fs.readFileSync(file, 'utf8'));
      const filename = path.basename(file, '.json');

      // Check sequence-id-required
      if (!sequence.id) {
        const violation = {
          level: 'CRITICAL',
          rule: 'sequence-id-required',
          artifact: filename,
          message: 'Missing sequence ID',
          remediation: `Set id: "${filename}"`
        };
        dimensionAudit.violations.push(violation);
        auditState.violations.CRITICAL.push(violation);
      }

      // Check sequence-name-required
      if (!sequence.name || sequence.name.length < 3) {
        const violation = {
          level: 'CRITICAL',
          rule: 'sequence-name-required',
          artifact: sequence.id || filename,
          message: 'Missing or short sequence name',
          remediation: `Set name: "${filename.replace(/[-_.]/g, ' ')}"`
        };
        dimensionAudit.violations.push(violation);
        auditState.violations.CRITICAL.push(violation);
      }

      // Check sequence-beats-positive
      if (!sequence.beats || sequence.beats <= 0) {
        const violation = {
          level: 'CRITICAL',
          rule: 'sequence-beats-positive',
          artifact: sequence.id || filename,
          message: 'Invalid beat count',
          remediation: `Set beats to handler item count (current: ${sequence.beats})`
        };
        dimensionAudit.violations.push(violation);
        auditState.violations.CRITICAL.push(violation);
      }

      // Check sequence-tempo-valid
      if (!sequence.tempo || sequence.tempo < 60 || sequence.tempo > 240) {
        const violation = {
          level: 'MAJOR',
          rule: 'sequence-tempo-valid',
          artifact: sequence.id || filename,
          message: `Invalid tempo: ${sequence.tempo}`,
          remediation: 'Set tempo between 60-240 (standard: 120)'
        };
        dimensionAudit.violations.push(violation);
        auditState.violations.MAJOR.push(violation);
      }
    } catch (e) {
      const violation = {
        level: 'CRITICAL',
        rule: 'sequence-parse-error',
        artifact: path.basename(file),
        message: `Failed to parse: ${e.message}`,
        remediation: 'Fix JSON syntax'
      };
      dimensionAudit.violations.push(violation);
      auditState.violations.CRITICAL.push(violation);
    }
  });

  dimensionAudit.score = Math.max(0, 100 - (dimensionAudit.violations.length * 10));
  auditState.dimensions['sequences'] = dimensionAudit;
  auditState.totalArtifacts += dimensionAudit.artifactsScanned;

  console.log(`  ✓ Scanned ${dimensionAudit.artifactsScanned} sequences, found ${dimensionAudit.violations.length} violations`);
  console.log(`    Score: ${dimensionAudit.score}/100`);
}

// ====== BDD SPECS AUDITING ======
function auditBddSpecs() {
  console.log('\n🔍 Auditing BDD specifications...');

  let bddCount = 0;
  const dimensionAudit = {
    name: 'BDD Specification Conformity',
    artifactsScanned: 0,
    violations: [],
    score: 100
  };

  // Find all .feature files
  const findFeatures = (dir) => {
    if (!fs.existsSync(dir)) return [];
    const files = fs.readdirSync(dir);
    let results = [];
    
    files.forEach(file => {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) {
        results.push(...findFeatures(fullPath));
      } else if (file.endsWith('.feature')) {
        results.push(fullPath);
      }
    });
    return results;
  };

  const featureFiles = findFeatures(path.join(WORKSPACE_ROOT, 'packages'));
  dimensionAudit.artifactsScanned = featureFiles.length;

  featureFiles.forEach(file => {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');
      const filename = path.basename(file);

      // Check feature-declaration-present
      if (!content.includes('Feature:')) {
        const violation = {
          level: 'CRITICAL',
          rule: 'feature-declaration-present',
          artifact: filename,
          message: 'Missing Feature declaration',
          remediation: 'Add Feature: [Feature Name] at top'
        };
        dimensionAudit.violations.push(violation);
        auditState.violations.CRITICAL.push(violation);
      }

      // Check user-story-present
      if (!content.includes('In order to') || !content.includes('As a') || !content.includes('I want')) {
        const violation = {
          level: 'CRITICAL',
          rule: 'user-story-present',
          artifact: filename,
          message: 'Missing user story format',
          remediation: 'Add: In order to ... As a ... I want ...'
        };
        dimensionAudit.violations.push(violation);
        auditState.violations.CRITICAL.push(violation);
      }

      // Check background-defined
      if (!content.includes('Background:')) {
        const violation = {
          level: 'MAJOR',
          rule: 'background-defined',
          artifact: filename,
          message: 'Missing Background section',
          remediation: 'Add Background: with common Given steps'
        };
        dimensionAudit.violations.push(violation);
        auditState.violations.MAJOR.push(violation);
      }

      // Check scenarios-complete
      const scenarioMatches = content.match(/Scenario:/g) || [];
      let incompleteScenarios = 0;
      let currentScenario = '';
      
      lines.forEach((line, idx) => {
        if (line.includes('Scenario:')) {
          currentScenario = line;
        }
        if (line.includes('Scenario:') && idx > 0) {
          // Check previous scenario was complete
          const scenarioBlock = lines.slice(0, idx).join('\n').split('Scenario:').pop();
          if (!scenarioBlock.includes('Then')) {
            incompleteScenarios++;
          }
        }
      });

      if (incompleteScenarios > 0) {
        const violation = {
          level: 'CRITICAL',
          rule: 'scenarios-complete',
          artifact: filename,
          message: `${incompleteScenarios} scenarios missing Given-When-Then`,
          remediation: 'Ensure all scenarios have complete Given-When-Then structure'
        };
        dimensionAudit.violations.push(violation);
        auditState.violations.CRITICAL.push(violation);
      }

      // Check scenario-count-minimum
      if (scenarioMatches.length < 2) {
        const violation = {
          level: 'MAJOR',
          rule: 'scenario-count-minimum',
          artifact: filename,
          message: `Only ${scenarioMatches.length} scenarios (need >= 2)`,
          remediation: 'Add scenario for alternative path or edge case'
        };
        dimensionAudit.violations.push(violation);
        auditState.violations.MAJOR.push(violation);
      }
    } catch (e) {
      const violation = {
        level: 'CRITICAL',
        rule: 'bdd-parse-error',
        artifact: path.basename(file),
        message: `Failed to parse: ${e.message}`,
        remediation: 'Fix Gherkin syntax'
      };
      dimensionAudit.violations.push(violation);
      auditState.violations.CRITICAL.push(violation);
    }
  });

  dimensionAudit.score = Math.max(0, 100 - (dimensionAudit.violations.length * 10));
  auditState.dimensions['bdd-specs'] = dimensionAudit;
  auditState.totalArtifacts += dimensionAudit.artifactsScanned;

  console.log(`  ✓ Scanned ${dimensionAudit.artifactsScanned} feature files, found ${dimensionAudit.violations.length} violations`);
  console.log(`    Score: ${dimensionAudit.score}/100`);
}

// ====== HANDLER SPECS AUDITING ======
function auditHandlerSpecs() {
  console.log('\n🔍 Auditing handler specifications...');

  const dimensionAudit = {
    name: 'Handler Specification Conformity',
    artifactsScanned: 0,
    violations: [],
    score: 100
  };

  // Find all .spec.ts files in __tests__
  const findSpecs = (dir) => {
    if (!fs.existsSync(dir)) return [];
    const files = fs.readdirSync(dir);
    let results = [];
    
    files.forEach(file => {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) {
        results.push(...findSpecs(fullPath));
      } else if (file.endsWith('.spec.ts')) {
        results.push(fullPath);
      }
    });
    return results;
  };

  const specFiles = findSpecs(path.join(WORKSPACE_ROOT, 'packages'));
  dimensionAudit.artifactsScanned = specFiles.length;

  specFiles.forEach(file => {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const filename = path.basename(file);

      // Check handler-context-setup
      if (!content.includes('beforeEach') || !content.includes('handler') || !content.includes('mocks')) {
        const violation = {
          level: 'MAJOR',
          rule: 'handler-context-setup',
          artifact: filename,
          message: 'Missing proper context setup',
          remediation: 'Add beforeEach hook with handler, mocks, input, output, error initialization'
        };
        dimensionAudit.violations.push(violation);
        auditState.violations.MAJOR.push(violation);
      }

      // Check handler-happy-path-test
      if (!content.includes('it(') || !content.includes('expect(')) {
        const violation = {
          level: 'MAJOR',
          rule: 'handler-happy-path-test',
          artifact: filename,
          message: 'Missing test cases',
          remediation: 'Add at least one happy path test with it() and expect()'
        };
        dimensionAudit.violations.push(violation);
        auditState.violations.MAJOR.push(violation);
      }

      // Check handler-error-handling-test
      const hasErrorHandling = content.includes('error') || content.includes('throw') || content.includes('catch');
      if (!hasErrorHandling) {
        const violation = {
          level: 'MAJOR',
          rule: 'handler-error-handling-test',
          artifact: filename,
          message: 'Missing error handling test',
          remediation: 'Add test for error scenarios and exception handling'
        };
        dimensionAudit.violations.push(violation);
        auditState.violations.MAJOR.push(violation);
      }
    } catch (e) {
      const violation = {
        level: 'CRITICAL',
        rule: 'handler-parse-error',
        artifact: path.basename(file),
        message: `Failed to parse: ${e.message}`,
        remediation: 'Fix TypeScript/JavaScript syntax'
      };
      dimensionAudit.violations.push(violation);
      auditState.violations.CRITICAL.push(violation);
    }
  });

  dimensionAudit.score = Math.max(0, 100 - (dimensionAudit.violations.length * 10));
  auditState.dimensions['handler-specs'] = dimensionAudit;
  auditState.totalArtifacts += dimensionAudit.artifactsScanned;

  console.log(`  ✓ Scanned ${dimensionAudit.artifactsScanned} handler specs, found ${dimensionAudit.violations.length} violations`);
  console.log(`    Score: ${dimensionAudit.score}/100`);
}

// ====== CALCULATE OVERALL CONFORMITY ======
function calculateConformity() {
  const dimensionScores = Object.values(auditState.dimensions).map(d => d.score);
  auditState.conformityScore = dimensionScores.length > 0 
    ? Math.round(dimensionScores.reduce((a, b) => a + b, 0) / dimensionScores.length)
    : 100;

  // Generate recommendations
  if (auditState.violations.CRITICAL.length > 0) {
    auditState.recommendations.push('🚨 CRITICAL: Fix all CRITICAL violations before deployment');
  }
  if (auditState.violations.MAJOR.length > 0) {
    auditState.recommendations.push('⚠️  MAJOR: Address MAJOR violations in next sprint');
  }
  if (auditState.violations.MINOR.length > 0) {
    auditState.recommendations.push('ℹ️  MINOR: Minor issues can be deferred for future maintenance');
  }

  if (auditState.conformityScore >= 90) {
    auditState.recommendations.push('✅ Excellent conformity - maintain current standards');
  } else if (auditState.conformityScore >= 70) {
    auditState.recommendations.push('⚠️  Good conformity - focus on CRITICAL and MAJOR issues');
  } else {
    auditState.recommendations.push('🔴 Poor conformity - immediate remediation required');
  }
}

// ====== GENERATE REPORTS ======
function generateAuditReport() {
  const reportPath = path.join(GOVERNANCE_DIR, 'symphonia-audit-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(auditState, null, 2));
  console.log(`\n✅ Audit report saved: ${reportPath}`);
  return auditState;
}

function generateConformityDashboard(auditData) {
  const dashboardPath = path.join(GOVERNANCE_DIR, 'SYMPHONIA_CONFORMITY_DASHBOARD.md');
  
  let markdown = `# Symphonia Conformity Dashboard

<!-- AUTO-GENERATED: Symphonia Auditing System -->
<!-- Generated: ${auditData.timestamp} -->

## 🎼 Overall Conformity Score

**${auditData.conformityScore}/100**

${auditData.conformityScore >= 90 ? '✅ EXCELLENT' : auditData.conformityScore >= 70 ? '⚠️  GOOD' : '🔴 POOR'}

---

## 📊 Conformity by Dimension

| Dimension | Score | Artifacts | Violations |
|-----------|-------|-----------|------------|
`;

  Object.entries(auditData.dimensions).forEach(([key, dim]) => {
    const vCount = dim.violations?.length || 0;
    markdown += `| ${dim.name} | ${dim.score}/100 | ${dim.artifactsScanned} | ${vCount} |\n`;
  });

  markdown += `

## 🚨 Critical Violations (${auditData.violations.CRITICAL.length})

`;
  if (auditData.violations.CRITICAL.length === 0) {
    markdown += `✅ No critical violations\n`;
  } else {
    auditData.violations.CRITICAL.forEach(v => {
      markdown += `
### ${v.artifact}
- **Rule**: ${v.rule}
- **Issue**: ${v.message}
- **Remediation**: ${v.remediation}
`;
    });
  }

  markdown += `

## ⚠️  Major Violations (${auditData.violations.MAJOR.length})

`;
  if (auditData.violations.MAJOR.length === 0) {
    markdown += `✅ No major violations\n`;
  } else {
    auditData.violations.MAJOR.slice(0, 10).forEach(v => {
      markdown += `- **${v.artifact}**: ${v.message}\n`;
    });
    if (auditData.violations.MAJOR.length > 10) {
      markdown += `\n... and ${auditData.violations.MAJOR.length - 10} more\n`;
    }
  }

  markdown += `

## 📋 Recommendations

${auditData.recommendations.map(r => `- ${r}`).join('\n')}

---

Generated: ${auditData.timestamp}
Total Artifacts Scanned: ${auditData.totalArtifacts}
`;

  fs.writeFileSync(dashboardPath, markdown);
  console.log(`✅ Conformity dashboard saved: ${dashboardPath}`);
}

function generateRemediationPlan(auditData) {
  const planPath = path.join(GOVERNANCE_DIR, 'SYMPHONIA_REMEDIATION_PLAN.md');
  
  let markdown = `# Symphonia Remediation Plan

<!-- AUTO-GENERATED: Symphonia Auditing System -->
<!-- Generated: ${auditData.timestamp} -->

## 🎯 Prioritized Violations

### Priority 1: CRITICAL (${auditData.violations.CRITICAL.length})

Must be fixed before production deployment.

`;

  auditData.violations.CRITICAL.forEach((v, idx) => {
    markdown += `
#### ${idx + 1}. ${v.artifact}
- **Rule**: ${v.rule}
- **Issue**: ${v.message}
- **Remediation**: ${v.remediation}
- **Effort**: Immediate
`;
  });

  markdown += `

### Priority 2: MAJOR (${auditData.violations.MAJOR.length})

Should be addressed in next sprint.

`;

  auditData.violations.MAJOR.slice(0, 15).forEach((v, idx) => {
    markdown += `- **${v.artifact}**: ${v.message}\n  → ${v.remediation}\n`;
  });

  if (auditData.violations.MAJOR.length > 15) {
    markdown += `\n... and ${auditData.violations.MAJOR.length - 15} more\n`;
  }

  markdown += `

## 📈 Success Criteria

- [ ] All CRITICAL violations resolved
- [ ] Overall conformity score >= 90
- [ ] All artifacts scanned without parse errors
- [ ] All dimensions score >= 80
- [ ] No new violations introduced

---

Generated: ${auditData.timestamp}
`;

  fs.writeFileSync(planPath, markdown);
  console.log(`✅ Remediation plan saved: ${planPath}`);
}

// ====== MAIN EXECUTION ======
function main() {
  console.log('\n╔════════════════════════════════════════════╗');
  console.log('║   Symphonia Auditing System - Audit Run   ║');
  console.log('║   Conformity Enforcement for All Pipelines║');
  console.log('╚════════════════════════════════════════════╝');

  try {
    auditOrchestrationDomains();
    auditContracts();
    auditSequences();
    auditBddSpecs();
    auditHandlerSpecs();

    calculateConformity();

    const auditData = generateAuditReport();
    generateConformityDashboard(auditData);
    generateRemediationPlan(auditData);

    console.log(`
╔════════════════════════════════════════════╗
║           AUDIT COMPLETE                  ║
╚════════════════════════════════════════════╝

📊 Overall Conformity: ${auditData.conformityScore}/100
📈 Total Artifacts: ${auditData.totalArtifacts}
🚨 Critical Violations: ${auditData.violations.CRITICAL.length}
⚠️  Major Violations: ${auditData.violations.MAJOR.length}

✨ Reports generated in docs/governance/
`);

    process.exit(auditData.violations.CRITICAL.length > 0 ? 1 : 0);
  } catch (error) {
    console.error('\n❌ Audit failed:', error.message);
    process.exit(1);
  }
}

main();
