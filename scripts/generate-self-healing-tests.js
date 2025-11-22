#!/usr/bin/env node

/**
 * Generate proposed test specifications for self-healing system from JSON sequences
 * 
 * This script:
 * 1. Reads all 7 JSON sequences from packages/self-healing/json-sequences/
 * 2. Extracts handlers from each sequence
 * 3. Generates test specifications (JSON) for each handler
 * 4. Creates proposed test files structure
 * 
 * Output: packages/self-healing/.generated/proposed-tests.json
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

async function generateSelfHealingTests() {
  console.log('🧪 Generating Self-Healing System Test Specifications');
  console.log('='.repeat(60));

  const sequencesDir = path.join(rootDir, 'packages', 'self-healing', 'json-sequences');
  const outputDir = path.join(rootDir, 'packages', 'self-healing', '.generated');
  const outputFile = path.join(outputDir, 'proposed-tests.json');

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Read all sequence files
  const sequenceFiles = fs.readdirSync(sequencesDir)
    .filter(f => f.endsWith('.json') && f !== 'index.json' && f !== 'package.json' && f !== 'tsconfig.json');

  console.log(`📂 Found ${sequenceFiles.length} sequences`);

  const testFiles = [];
  const allHandlers = [];

  for (const file of sequenceFiles) {
    const filePath = path.join(sequencesDir, file);
    const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    
    const sequenceId = content.id;
    const sequenceName = content.name;
    const handlers = [];

    // Extract handlers from all movements and beats
    if (content.movements && Array.isArray(content.movements)) {
      for (const movement of content.movements) {
        if (movement.beats && Array.isArray(movement.beats)) {
          for (const beat of movement.beats) {
            if (beat.handler) {
              handlers.push({
                name: beat.handler,
                beat: beat.beat,
                event: beat.event,
                kind: beat.kind || 'pure',
                timing: beat.timing || 'immediate'
              });
            }
          }
        }
      }
    }

    allHandlers.push(...handlers);

    // Create test file entry
    const testFileName = `${file.replace('.json', '')}.spec.ts`;
    const testPath = `packages/self-healing/__tests__/${testFileName}`;

    const tests = [];
    tests.push({ type: 'describe', name: `${sequenceName} (${sequenceId})` });
    
    for (const handler of handlers) {
      tests.push({ 
        type: 'it', 
        name: `${handler.name} - happy path`,
        handler: handler.name,
        kind: handler.kind
      });
      tests.push({ 
        type: 'it', 
        name: `${handler.name} - error handling`,
        handler: handler.name,
        kind: handler.kind
      });
    }

    testFiles.push({
      path: testPath,
      sequence: sequenceId,
      sequenceName,
      handlers: handlers.map(h => h.name),
      tests,
      testCount: handlers.length * 2
    });

    console.log(`✅ ${sequenceName}: ${handlers.length} handlers → ${handlers.length * 2} tests`);
  }

  // Generate summary
  const proposed = {
    timestamp: new Date().toISOString(),
    plugin: 'SelfHealingPlugin',
    summary: {
      totalSequences: sequenceFiles.length,
      totalHandlers: allHandlers.length,
      totalTestFiles: testFiles.length,
      totalTests: testFiles.reduce((sum, f) => sum + f.testCount, 0)
    },
    testFiles
  };

  fs.writeFileSync(outputFile, JSON.stringify(proposed, null, 2));
  console.log(`\n✅ Generated: ${outputFile}`);
  console.log(`   📊 Sequences: ${proposed.summary.totalSequences}`);
  console.log(`   🎯 Handlers: ${proposed.summary.totalHandlers}`);
  console.log(`   📝 Test Files: ${proposed.summary.totalTestFiles}`);
  console.log(`   🧪 Total Tests: ${proposed.summary.totalTests}`);
}

generateSelfHealingTests().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});

