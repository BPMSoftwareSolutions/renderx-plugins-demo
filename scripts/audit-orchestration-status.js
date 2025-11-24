#!/usr/bin/env node
/**
 * Audit Orchestration Status
 * 
 * Shows complete orchestration landscape:
 * - Orchestration domain sequences (2 implemented)
 * - Plugin sequences by category (55 total)
 * - Planned domains (14)
 * - Relationships between layers
 * 
 * Uses audit system as source of truth.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

async function auditStatus() {
  try {
    console.log('\n🎼 ORCHESTRATION STATUS REPORT\n');
    console.log('═'.repeat(70));

    // Load registry
    const registryPath = path.join(rootDir, 'orchestration-domains.json');
    console.log(`Loading registry from: ${registryPath}`);
    const registry = JSON.parse(fs.readFileSync(registryPath, 'utf-8'));

    // Load audit catalog
    const catalogPath = path.join(rootDir, 'packages/ographx/.ographx/artifacts/renderx-web/catalog/catalog-sequences.json');
    console.log(`Loading catalog from: ${catalogPath}`);
    const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf-8'));

    // Count by status
    const implemented = registry.domains.filter(d => d.sequenceFile && d.status === 'active').length;
    const planned = registry.domains.filter(d => !d.sequenceFile).length;

    console.log('\n📊 ORCHESTRATION DOMAINS\n');
    console.log(`Total Domains:        ${registry.domains.length}`);
    console.log(`  ✅ Implemented:     ${implemented}`);
    console.log(`  ⏳ Planned:         ${planned}`);

    console.log('\n🎯 IMPLEMENTED DOMAINS\n');
    registry.domains
      .filter(d => d.sequenceFile && d.status === 'active')
      .forEach(d => {
        console.log(`  ${d.emoji} ${d.name}`);
        console.log(`     ID: ${d.id}`);
        console.log(`     Movements: ${d.movements}, Beats: ${d.beats}`);
      });

    console.log('\n⏳ PLANNED DOMAINS\n');
    registry.domains
      .filter(d => !d.sequenceFile)
      .forEach(d => {
        console.log(`  ${d.emoji} ${d.name}`);
      });

    console.log('\n📦 PLUGIN SEQUENCES (Audit System)\n');
    console.log(`Total Sequences:      ${catalog.summary.totalSequences}`);
    console.log(`Total Handlers:       ${catalog.summary.totalHandlers}`);
    console.log(`Total Topics:         ${catalog.summary.totalTopics}`);

    // Group by plugin
    const byPlugin = {};
    catalog.sequences.forEach(seq => {
      const plugin = seq.pluginId || 'unknown';
      if (!byPlugin[plugin]) byPlugin[plugin] = 0;
      byPlugin[plugin]++;
    });

    console.log('\nSequences by Plugin:\n');
    Object.entries(byPlugin)
      .sort((a, b) => b[1] - a[1])
      .forEach(([plugin, count]) => {
        console.log(`  ${plugin.padEnd(40)} ${count} sequences`);
      });
  
    console.log('\n' + '═'.repeat(70));
    console.log('\n💡 KEY INSIGHTS\n');
    console.log('1. Orchestration domains are SYSTEM-level sequences');
    console.log('2. Plugin sequences are FEATURE-level sequences');
    console.log('3. Audit system automatically catalogs all plugin sequences');
    console.log('4. Orchestration domains must be manually created');
    console.log('5. No duplication between layers\n');
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

auditStatus();

