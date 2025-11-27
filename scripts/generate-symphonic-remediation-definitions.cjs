#!/usr/bin/env node

/**
 * Generate Symphonic Remediation Definitions
 * 
 * Converts non-symphonic processes into symphonic domain definitions
 * Creates symphony JSON files for each violation with template structure
 * 
 * Input: process-symphonic-compliance-audit.json (violations)
 * Output: .generated/symphonic-remediation-plan.json
 *         + individual symphony templates
 */

const fs = require('fs');
const path = require('path');

const auditPath = path.join(__dirname, '..', 'process-symphonic-compliance-audit.json');
const orchDomainsPath = path.join(__dirname, '..', 'orchestration-domains.json');
const remediationPath = path.join(__dirname, '..', '.generated', 'symphonic-remediation-plan.json');
const templatesDir = path.join(__dirname, '..', '.generated', 'symphony-templates');

// Create templates directory
if (!fs.existsSync(templatesDir)) {
  fs.mkdirSync(templatesDir, { recursive: true });
}

// Read data
if (!fs.existsSync(auditPath)) {
  console.error('❌ Audit file not found. Run: node scripts/audit-process-symphonic-compliance.cjs');
  process.exit(1);
}

const audit = JSON.parse(fs.readFileSync(auditPath, 'utf-8'));
const orchDomains = fs.existsSync(orchDomainsPath) 
  ? JSON.parse(fs.readFileSync(orchDomainsPath, 'utf-8'))
  : { domains: [] };

/**
 * Determine typical movements for a process category
 */
function getMovementsForCategory(category, processName) {
  const movements = [];

  switch (category) {
    case 'generation':
      movements.push(
        {
          id: 1,
          name: 'Initialization',
          description: 'Load configuration, validate inputs, prepare state',
          beats: [
            { id: 1, name: 'Load Configuration', handler: `${processName}:loadConfig` },
            { id: 2, name: 'Validate Inputs', handler: `${processName}:validateInputs` }
          ]
        },
        {
          id: 2,
          name: 'Generation',
          description: 'Execute generation logic, process data, create outputs',
          beats: [
            { id: 1, name: 'Process Data', handler: `${processName}:processData` },
            { id: 2, name: 'Generate Output', handler: `${processName}:generateOutput` }
          ]
        },
        {
          id: 3,
          name: 'Validation',
          description: 'Validate generated outputs, verify structure',
          beats: [
            { id: 1, name: 'Validate Output', handler: `${processName}:validateOutput` }
          ]
        },
        {
          id: 4,
          name: 'Finalization',
          description: 'Write outputs, record telemetry, cleanup',
          beats: [
            { id: 1, name: 'Write Outputs', handler: `${processName}:writeOutputs` },
            { id: 2, name: 'Record Telemetry', handler: `${processName}:recordTelemetry` }
          ]
        }
      );
      break;

    case 'validation':
      movements.push(
        {
          id: 1,
          name: 'Preparation',
          description: 'Load data and initialize validation context',
          beats: [
            { id: 1, name: 'Load Data', handler: `${processName}:loadData` },
            { id: 2, name: 'Initialize Validator', handler: `${processName}:initValidator` }
          ]
        },
        {
          id: 2,
          name: 'Validation',
          description: 'Execute validation checks and assertions',
          beats: [
            { id: 1, name: 'Run Checks', handler: `${processName}:runChecks` },
            { id: 2, name: 'Collect Results', handler: `${processName}:collectResults` }
          ]
        },
        {
          id: 3,
          name: 'Reporting',
          description: 'Generate validation report and emit events',
          beats: [
            { id: 1, name: 'Generate Report', handler: `${processName}:generateReport` },
            { id: 2, name: 'Emit Events', handler: `${processName}:emitEvents` }
          ]
        }
      );
      break;

    case 'orchestration':
      movements.push(
        {
          id: 1,
          name: 'Initialization',
          description: 'Load orchestration context and dependencies',
          beats: [
            { id: 1, name: 'Load Context', handler: `${processName}:loadContext` },
            { id: 2, name: 'Initialize Dependencies', handler: `${processName}:initDependencies` }
          ]
        },
        {
          id: 2,
          name: 'Orchestration',
          description: 'Coordinate and execute orchestrated operations',
          beats: [
            { id: 1, name: 'Coordinate Operations', handler: `${processName}:coordinateOps` },
            { id: 2, name: 'Execute Sequence', handler: `${processName}:executeSequence` }
          ]
        },
        {
          id: 3,
          name: 'Synchronization',
          description: 'Wait for completion and synchronize state',
          beats: [
            { id: 1, name: 'Wait for Completion', handler: `${processName}:waitCompletion` },
            { id: 2, name: 'Synchronize State', handler: `${processName}:syncState` }
          ]
        },
        {
          id: 4,
          name: 'Finalization',
          description: 'Record results and emit completion events',
          beats: [
            { id: 1, name: 'Record Results', handler: `${processName}:recordResults` },
            { id: 2, name: 'Emit Events', handler: `${processName}:emitEvents` }
          ]
        }
      );
      break;

    case 'build':
      movements.push(
        {
          id: 1,
          name: 'Validation',
          description: 'Validate build prerequisites and configuration',
          beats: [
            { id: 1, name: 'Validate Config', handler: `${processName}:validateConfig` },
            { id: 2, name: 'Check Dependencies', handler: `${processName}:checkDeps` }
          ]
        },
        {
          id: 2,
          name: 'Preparation',
          description: 'Prepare build environment',
          beats: [
            { id: 1, name: 'Setup Environment', handler: `${processName}:setupEnv` }
          ]
        },
        {
          id: 3,
          name: 'Compilation',
          description: 'Compile and build artifacts',
          beats: [
            { id: 1, name: 'Compile', handler: `${processName}:compile` }
          ]
        },
        {
          id: 4,
          name: 'Verification',
          description: 'Verify build outputs',
          beats: [
            { id: 1, name: 'Verify Artifacts', handler: `${processName}:verifyArtifacts` }
          ]
        }
      );
      break;

    default:
      movements.push(
        {
          id: 1,
          name: 'Initialization',
          beats: [
            { id: 1, name: 'Initialize', handler: `${processName}:init` }
          ]
        },
        {
          id: 2,
          name: 'Execution',
          beats: [
            { id: 1, name: 'Execute', handler: `${processName}:execute` }
          ]
        },
        {
          id: 3,
          name: 'Finalization',
          beats: [
            { id: 1, name: 'Finalize', handler: `${processName}:finalize` }
          ]
        }
      );
  }

  return movements;
}

/**
 * Create symphony definition
 */
function createSymphonyDef(violation) {
  const processName = violation.process.replace(/\.(js|cjs)$/, '');
  const symphonyId = `${processName}-symphony`;

  const movements = getMovementsForCategory(violation.category, processName);

  const symphony = {
    id: symphonyId,
    sequenceId: symphonyId,
    name: `${processName} Symphony`,
    packageName: 'orchestration',
    title: processName.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    description: `Multi-movement orchestration for ${violation.category} process: ${processName}`,
    purpose: `Orchestrate ${violation.category} as symphonic composition with clear movements and beats`,
    trigger: `npm run ${processName.replace(/-/g, ':')}`,
    kind: 'orchestration',
    status: 'active',
    governance: {
      policies: [
        'All movements must execute in order',
        'Each beat must record telemetry',
        'Failed beats trigger rollback',
        'All events must be emitted'
      ],
      metrics: [
        'Total process duration',
        'Per-movement duration',
        'Per-beat duration',
        'Success/failure rate',
        'Telemetry completeness'
      ]
    },
    movements,
    events: [
      `process:initiated`,
      ...movements.flatMap((m) => [
        `movement-${m.id}:started`,
        `movement-${m.id}:completed`
      ])
    ]
  };

  return symphony;
}

/**
 * Create domain entry for orchestra
 */
function createDomainEntry(violation) {
  const processName = violation.process.replace(/\.(js|cjs)$/, '');
  const symphonyId = `${processName}-symphony`;

  const movements = getMovementsForCategory(violation.category, processName);
  const totalBeats = movements.reduce((sum, m) => sum + (m.beats?.length || 0), 0);

  return {
    id: symphonyId,
    name: processName.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    emoji: getCategoryEmoji(violation.category),
    description: `Orchestration domain: ${processName}`,
    category: 'orchestration',
    purpose: 'System orchestration',
    relatedDomains: [],
    status: 'active',
    movements: movements.length,
    beats: totalBeats,
    tempo: 120,
    key: 'C Major',
    timeSignature: '4/4',
    sequenceFile: `packages/orchestration/json-sequences/${symphonyId}.json`,
    sketch: {
      title: processName,
      sequence: {
        id: symphonyId,
        name: processName,
        tempo: 120,
        key: 'C Major',
        timeSignature: '4/4',
        category: 'orchestration'
      },
      phases: movements.map(m => ({
        name: `Movement ${m.id}: ${m.name}`,
        items: m.beats?.map(b => `${b.name} (${b.handler})`) || []
      }))
    }
  };
}

function getCategoryEmoji(category) {
  const emojis = {
    generation: '📝',
    validation: '✅',
    orchestration: '🎼',
    build: '🔨',
    testing: '🧪',
    analysis: '📊',
    utility: '🔧'
  };
  return emojis[category] || '⚙️';
}

// Generate remediation plan
console.log('🔧 Generating Symphonic Remediation Definitions...\n');

const remediationPlan = {
  generatedAt: audit.generatedAt,
  totalViolations: audit.violations.length,
  symphonyTemplates: [],
  domainDefinitions: [],
  implementationPhases: {
    phase1_critical: { label: 'Week 1', categories: ['orchestration', 'generation'] },
    phase2_high: { label: 'Week 2', categories: ['validation'] },
    phase3_medium: { label: 'Weeks 3-4', categories: ['build'] },
    phase4_low: { label: 'Week 5+', categories: ['testing', 'analysis'] }
  },
  summary: {
    total: audit.violations.length,
    byCategory: {}
  }
};

// Create templates for each violation
for (const violation of audit.violations) {
  const category = violation.category;
  if (!remediationPlan.summary.byCategory[category]) {
    remediationPlan.summary.byCategory[category] = 0;
  }
  remediationPlan.summary.byCategory[category]++;

  const symphony = createSymphonyDef(violation);
  const domain = createDomainEntry(violation);

  remediationPlan.symphonyTemplates.push(symphony);
  remediationPlan.domainDefinitions.push(domain);

  // Also save individual template (sanitize filename)
  const safeId = symphony.id.replace(/[:<>"|?*]/g, '-');
  const templatePath = path.join(
    templatesDir,
    `${safeId}-template.json`
  );
  fs.writeFileSync(templatePath, JSON.stringify(symphony, null, 2), 'utf-8');
}

// Save remediation plan
fs.writeFileSync(remediationPath, JSON.stringify(remediationPlan, null, 2), 'utf-8');

console.log(`✅ Remediation plan created: ${path.relative(process.cwd(), remediationPath)}`);
console.log(`✅ Symphony templates generated: ${remediationPlan.symphonyTemplates.length}`);
console.log(`✅ Domain definitions prepared: ${remediationPlan.domainDefinitions.length}\n`);

// Print implementation roadmap
console.log('📋 Implementation Roadmap:\n');

for (const [phase, config] of Object.entries(remediationPlan.implementationPhases)) {
  const violations = audit.violations.filter(v => config.categories.includes(v.category));
  if (violations.length === 0) continue;

  console.log(`${config.label}: ${violations.length} processes`);
  for (const cat of config.categories) {
    const count = violations.filter(v => v.category === cat).length;
    if (count > 0) {
      console.log(`  - ${cat}: ${count}`);
    }
  }
  console.log();
}

console.log('📊 Summary:');
console.log(`  Generation violations: ${remediationPlan.summary.byCategory.generation || 0}`);
console.log(`  Validation violations: ${remediationPlan.summary.byCategory.validation || 0}`);
console.log(`  Orchestration violations: ${remediationPlan.summary.byCategory.orchestration || 0}`);
