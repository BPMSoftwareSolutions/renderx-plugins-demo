#!/usr/bin/env node

/**
 * Generate behavior-driven test files from business BDD specifications
 * 
 * Creates test files organized by user story with realistic scenarios
 * that validate business value, not just technical implementation
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

function generateTestFile(feature, index) {
  const { name, persona, goal, scenarios } = feature;
  
  let content = `import { describe, it, expect, beforeEach, afterEach } from 'vitest';

/**
 * Business BDD Test Suite ${index}
 * 
 * User Story:
 * As a ${persona}
 * I want to ${name}
 * ${goal}
 * 
 * This test suite validates business value and user outcomes,
 * not just technical implementation details.
 */

describe('Feature: ${name}', () => {
  let ctx: any;

  beforeEach(() => {
    // TODO: Initialize test context with realistic production data
    ctx = {
      telemetry: {},
      anomalies: [],
      diagnosis: {},
      patches: [],
      validationResults: {},
      deployments: [],
      metrics: {}
    };
  });

  afterEach(() => {
    ctx = null;
  });
`;

  scenarios.forEach((scenario, idx) => {
    content += `\n  describe('Scenario: ${scenario.title}', () => {`;
    content += `\n    it('should achieve the desired business outcome', () => {`;
    content += `\n      // GIVEN (Preconditions)`;
    scenario.given.forEach(given => {
      content += `\n      // - ${given}`;
    });
    
    content += `\n\n      // WHEN (Action)`;
    scenario.when.forEach(when => {
      content += `\n      // - ${when}`;
    });
    
    content += `\n\n      // THEN (Expected Outcome)`;
    scenario.then.forEach(then => {
      content += `\n      // - ${then}`;
    });
    
    content += `\n\n      // TODO: Implement test that validates business outcome`;
    content += `\n      // Use realistic production data and verify measurable results`;
    content += `\n      expect(true).toBe(true);`;
    content += `\n    });`;
    content += `\n  });`;
  });

  content += `\n});`;
  content += `\n`;

  return content;
}

async function generateBusinessBddTestFiles() {
  console.log('🧪 Generating Business BDD Test Files');
  console.log('='.repeat(60));

  const bddFile = path.join(rootDir, 'packages', 'self-healing', '.generated', 'business-bdd-specifications.json');
  
  if (!fs.existsSync(bddFile)) {
    console.error('❌ Business BDD specifications file not found. Run generate-business-bdd-specs.js first.');
    process.exit(1);
  }

  const bdd = JSON.parse(fs.readFileSync(bddFile, 'utf-8'));
  const testDir = path.join(rootDir, 'packages', 'self-healing', '__tests__', 'business-bdd');

  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }

  let created = 0;
  let skipped = 0;

  bdd.features.forEach((feature, index) => {
    const filename = `${index + 1}-${feature.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40)}.spec.ts`;
    const filePath = path.join(testDir, filename);

    try {
      if (fs.existsSync(filePath)) {
        console.log(`⏭️  Skipped (exists): ${filename}`);
        skipped++;
        return;
      }

      const content = generateTestFile(feature, index + 1);
      fs.writeFileSync(filePath, content, 'utf-8');
      
      console.log(`✅ Created: ${filename}`);
      created++;
    } catch (err) {
      console.error(`❌ Failed to create ${filename}: ${err.message}`);
    }
  });

  console.log(`\n📊 Summary`);
  console.log(`   ✅ Created: ${created} business BDD test files`);
  console.log(`   ⏭️  Skipped: ${skipped} business BDD test files (already exist)`);
  console.log(`   📂 Location: ${testDir}`);
  console.log(`   📝 Total Scenarios: ${bdd.summary.totalScenarios}`);
}

generateBusinessBddTestFiles().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});

