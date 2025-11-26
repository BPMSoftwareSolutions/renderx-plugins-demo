#!/usr/bin/env node

/**
 * SAFe Pipeline - Enhanced Continuous Integration with Lint Quality Gate
 * 
 * This script updates the SAFe pipeline to include a new "Quality Assurance" beat
 * in the Continuous Integration movement that enforces lint compliance.
 */

const fs = require('fs');
const path = require('path');

const PIPELINE_PATH = path.join(__dirname, '../packages/orchestration/json-sequences/safe-continuous-delivery-pipeline.json');

function updatePipelineWithQualityBeat() {
  // Read pipeline
  const pipelineContent = fs.readFileSync(PIPELINE_PATH, 'utf8');
  const pipeline = JSON.parse(pipelineContent);

  // Add lint quality gate handler if not exists
  const lintHandler = {
    "id": "lint-quality-gate",
    "name": "Enforce Lint Quality Gate",
    "description": "Detect, categorize, and remediate linting issues; enforce quality standards",
    "type": "integration",
    "framework": "SAFe Continuous Integration",
    "activity": "Quality Assurance (4.5)",
    "relatedActivities": ["Static Analysis", "Code Quality", "Automated Inspection", "Quality Gates"]
  };

  if (!pipeline.handlers.find(h => h.id === 'lint-quality-gate')) {
    pipeline.handlers.push(lintHandler);
  }

  // Update integration movement beats
  const integrationMovement = pipeline.movements.find(m => m.id === 'continuous-integration');
  if (integrationMovement) {
    // Update beat 4 to include quality
    const stageBeat = integrationMovement.sequence.find(b => b.id === 'stage');
    if (stageBeat) {
      stageBeat.beat = 5;
      stageBeat.name = 'Stage, Validate & Quality Gate';
      stageBeat.handlers.push('lint-quality-gate');
      if (!stageBeat.success_criteria.includes('Lint quality gate verified')) {
        stageBeat.success_criteria.push(
          'Lint quality gate passed (0 errors, < 150 warnings)',
          'Trend analysis shows improvement or stable',
          'All recommendations addressed'
        );
      }
    }

    // Update beats count
    integrationMovement.beats = 5;
  }

  // Update global beats count
  pipeline.beats = pipeline.movements.reduce((sum, m) => sum + m.beats, 0);

  // Update metadata
  pipeline.metadata.updated = new Date().toISOString();
  pipeline.metadata.lint_quality_gate_integrated = true;

  // Write back
  fs.writeFileSync(PIPELINE_PATH, JSON.stringify(pipeline, null, 2));
  
  console.log('✓ Pipeline updated with Lint Quality Gate beat');
  console.log(`  - Added "Quality Assurance" beat to Continuous Integration`);
  console.log(`  - Updated total beats: ${pipeline.beats}`);
  console.log(`  - Integration movement now has: ${integrationMovement.beats} beats`);
}

updatePipelineWithQualityBeat();
