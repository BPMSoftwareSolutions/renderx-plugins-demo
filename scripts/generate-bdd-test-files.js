#!/usr/bin/env node

/**
 * Generate behavior-driven test files from BDD specifications
 * 
 * This script:
 * 1. Reads bdd-specifications.json
 * 2. Generates Vitest test files with Gherkin-style comments
 * 3. Creates test structure that maps Given-When-Then to test code
 * 4. Organizes tests by feature/sequence
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

function generateTestFile(feature) {
  const { name, sequenceId, scenarios } = feature;

  // Group scenarios by handler
  const handlerScenarios = new Map();
  scenarios.forEach(scenario => {
    if (!handlerScenarios.has(scenario.handler)) {
      handlerScenarios.set(scenario.handler, []);
    }
    handlerScenarios.get(scenario.handler).push(scenario);
  });

  const handlerNames = Array.from(handlerScenarios.keys()).join(', ');
  const importStatement = `// import { ${handlerNames} } from '../src/handlers/index.js';`;

  let content = `import { describe, it, expect, beforeEach, afterEach } from 'vitest';
// TODO: Import handlers from @renderx-plugins/self-healing
${importStatement}

/**
 * BDD Test Suite: ${name}
 * Sequence: ${sequenceId}
 * 
 * This test suite validates behavior-driven specifications for all handlers
 * in the ${name} sequence using Gherkin Given-When-Then format.
 */

describe('Feature: ${name}', () => {
  let ctx: any;

  beforeEach(() => {
    // TODO: Initialize test context with mocks and dependencies
    ctx = {
      handlers: {},
      mocks: {},
      events: [],
      errors: []
    };
  });

  afterEach(() => {
    // TODO: Clean up test context
    ctx = null;
  });
`;

  // Generate test cases for each handler
  for (const [handler, scenarios] of handlerScenarios.entries()) {
    content += `\n  describe('Handler: ${handler}', () => {`;

    for (const scenario of scenarios) {
      content += `\n    it('${scenario.scenario}', () => {`;
      content += `\n      // Given`;
      scenario.given.forEach(given => {
        content += `\n      // - ${given}`;
      });
      content += `\n`;
      content += `\n      // When`;
      scenario.when.forEach(when => {
        content += `\n      // - ${when}`;
      });
      content += `\n`;
      content += `\n      // Then`;
      scenario.then.forEach(then => {
        content += `\n      // - ${then}`;
      });
      content += `\n`;
      content += `\n      // TODO: Implement test based on Gherkin specification`;
      content += `\n      expect(true).toBe(true);`;
      content += `\n    });`;
    }
    
    content += `\n  });`;
  }

  content += `\n});`;
  content += `\n`;

  return content;
}

async function generateBddTestFiles() {
  console.log('🧪 Generating BDD Test Files');
  console.log('='.repeat(60));

  const bddFile = path.join(rootDir, 'packages', 'self-healing', '.generated', 'bdd-specifications.json');
  
  if (!fs.existsSync(bddFile)) {
    console.error('❌ BDD specifications file not found. Run generate-bdd-specifications.js first.');
    process.exit(1);
  }

  const bdd = JSON.parse(fs.readFileSync(bddFile, 'utf-8'));
  const testDir = path.join(rootDir, 'packages', 'self-healing', '__tests__', 'bdd');

  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }

  let created = 0;
  let skipped = 0;

  for (const feature of bdd.features) {
    // Skip empty features
    if (!feature.scenarios || feature.scenarios.length === 0) {
      continue;
    }

    const filename = feature.sequenceId
      ? `${feature.sequenceId}.bdd.spec.ts`
      : `${feature.name.toLowerCase().replace(/\s+/g, '-')}.bdd.spec.ts`;
    
    const filePath = path.join(testDir, filename);

    try {
      if (fs.existsSync(filePath)) {
        console.log(`⏭️  Skipped (exists): ${filename}`);
        skipped++;
        continue;
      }

      const content = generateTestFile(feature);
      fs.writeFileSync(filePath, content, 'utf-8');
      
      console.log(`✅ Created: ${filename}`);
      created++;
    } catch (err) {
      console.error(`❌ Failed to create ${filename}: ${err.message}`);
    }
  }

  console.log(`\n📊 Summary`);
  console.log(`   ✅ Created: ${created} BDD test files`);
  console.log(`   ⏭️  Skipped: ${skipped} BDD test files (already exist)`);
  console.log(`   📂 Location: ${testDir}`);
  console.log(`   📝 Total Scenarios: ${bdd.summary.totalScenarios}`);
}

generateBddTestFiles().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});

