#!/usr/bin/env node

/**
 * Test the semantic transformation WITH the rebuilt code
 * This shows the BEFORE and AFTER of the transformation
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the diagnostics file
const diagnosticsFile = path.join(__dirname, '.logs/telemetry-diagnostics-1762869682895.json');
const diagnostics = JSON.parse(fs.readFileSync(diagnosticsFile, 'utf8'));

console.log('\n' + '='.repeat(70));
console.log('SEMANTIC TRANSFORMATION TEST');
console.log('='.repeat(70));

console.log('\n📊 STAGE 2 (Raw from analyzer):');
console.log('--------');
console.log('Sample raw topics (first 5):');
const topics = Object.keys(diagnostics.stage2_analyzerJson.topics || {}).slice(0, 5);
topics.forEach((t) => {
  console.log(`  • ${t}`);
});

console.log('\n🎯 STAGE 3 (After semantic transformation):');
console.log('--------');
console.log('Sample transformed events (first 5):');
const events = diagnostics.stage3_timelineData.events || [];
events.slice(0, 5).forEach((e, i) => {
  console.log(`  ${i + 1}. name: "${e.name}"`);
  console.log(`     type: ${e.type} (should be semantic: ui, render, data, create, etc.)`);
  console.log(`     color: ${e.color}`);
});

console.log('\n📈 Event Type Distribution in Stage 3:');
console.log('--------');
const typeCounts = {};
events.forEach(e => {
  typeCounts[e.type] = (typeCounts[e.type] || 0) + 1;
});
Object.entries(typeCounts).forEach(([type, count]) => {
  console.log(`  ${type}: ${count} events`);
});

console.log('\n✨ ANALYSIS:');
console.log('--------');
if (events.some(e => e.type === 'topic' || e.type === 'plugin')) {
  console.log('❌ PROBLEM: Events still have raw types (topic, plugin)');
  console.log('   This means semantic transformation is NOT being applied!');
  console.log('\n   SOLUTION: The exported diagnostics were created with old code.');
  console.log('   You need to UPLOAD A NEW LOG FILE in the UI to trigger the');
  console.log('   semantic transformation with the rebuilt code.');
} else if (events.some(e => ['ui', 'render', 'data', 'create', 'init', 'gap', 'blocked'].includes(e.type))) {
  console.log('✅ SUCCESS: Events have semantic types!');
  console.log('   Transformation is working correctly.');
  console.log('   Real log now displays like sample data.');
} else {
  console.log('⚠️  UNKNOWN: Event types are different than expected');
  console.log('   Types found:', Object.keys(typeCounts).join(', '));
}

console.log('\n' + '='.repeat(70) + '\n');
