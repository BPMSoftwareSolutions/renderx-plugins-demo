#!/usr/bin/env node
/**
 * Semantic Transformation Test
 * Shows how raw analyzer data is converted to high-level operations
 */

import fs from 'fs';

// Load diagnostics file
const json = JSON.parse(fs.readFileSync('.logs/telemetry-diagnostics-1762869682895.json', 'utf8'));
const stage2 = json.stage2_analyzerJson;
const stage3 = json.stage3_timelineData;

console.log('📊 Semantic Transformation: Raw Data → High-Level Operations\n');

// Count event types at each stage
console.log('Stage 2 (Raw Analyzer):');
const stage2types = {};
if (stage2.pluginMounts?.byPlugin) {
  Object.keys(stage2.pluginMounts.byPlugin).forEach(p => {
    stage2types['plugin'] = (stage2types['plugin'] || 0) + 1;
  });
}
if (stage2.topics) {
  Object.keys(stage2.topics).forEach(t => {
    stage2types['topic'] = (stage2types['topic'] || 0) + 1;
  });
}
if (stage2.sequences) {
  Object.keys(stage2.sequences).forEach(s => {
    stage2types['sequence'] = (stage2types['sequence'] || 0) + 1;
  });
}
Object.entries(stage2types).forEach(([type, count]) => {
  console.log(`  ${type}: ${count}`);
});

console.log('\nStage 3 (Semantic Timeline):');
const stage3types = {};
stage3.events.forEach(e => {
  stage3types[e.type] = (stage3types[e.type] || 0) + 1;
});
Object.entries(stage3types)
  .sort((a, b) => b[1] - a[1])
  .forEach(([type, count]) => {
    console.log(`  ${type}: ${count}`);
  });

console.log('\n🔍 Sample Semantic Mappings (First 15 Events):');
console.log('═'.repeat(80));
stage3.events.slice(0, 15).forEach((e, i) => {
  const typeColor = {
    init: '🟦',
    ui: '🟨',
    data: '🟪',
    render: '🟩',
    interaction: '🟦',
    create: '🟦',
    gap: '🔴',
    blocked: '🔴',
    sequence: '🔴',
    plugin: '⚫',
  };
  console.log(`${i + 1}. [${String(e.time).padStart(5)}ms] ${typeColor[e.type] || '⭕'} ${e.type.padEnd(11)} ${e.name.substring(0, 50)}`);
});

console.log('\n✅ Semantic Types in Timeline:');
console.log('  🟦 init     → System initialization events');
console.log('  🟨 ui       → UI rendering and theme operations');
console.log('  🟪 data     → Data loading and library operations');
console.log('  🟩 render   → React render events');
console.log('  🟦 create   → Component/manager creation');
console.log('  🟦 interact → User interactions');
console.log('  🔴 gap      → Performance gaps (2-5 seconds)');
console.log('  🔴 blocked  → Major blocking events (>5 seconds)');
console.log('  ⚫ plugin   → Raw plugin events (fallback)');

console.log('\n✨ Result: Real log now displays with semantic meaning like sample data!');
