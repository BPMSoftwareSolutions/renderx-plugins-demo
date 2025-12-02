#!/usr/bin/env node
/**
 * Scan Existing Tags
 * Scans all test files for existing AC/BEAT tags and reports coverage
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = process.cwd();
const REGISTRY = path.join(ROOT, '.generated', 'acs', 'renderx-web-orchestration.registry.json');
const OUTPUT = path.join(ROOT, '.generated', 'ac-alignment', 'tag-scan-results.json');

function scanExistingTags() {
  const registry = JSON.parse(fs.readFileSync(REGISTRY, 'utf8'));
  const acs = registry.acs || [];
  
  const result = execSync('npx glob "tests/**/*.spec.ts"', { 
    cwd: ROOT, encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] 
  });
  
  const files = result.split('\n').filter(Boolean);
  const scanResults = {
    filesWithACTags: [],
    filesWithBeatTags: [],
    coveredACs: new Set(),
    coveredBeats: new Set(),
    totalFiles: files.length,
    totalACs: acs.length
  };
  
  files.forEach(file => {
    const content = fs.readFileSync(path.join(ROOT, file), 'utf8');
    
    // Find AC tags
    const acMatches = content.matchAll(/\[AC:([^\]]+)\]/g);
    for (const match of acMatches) {
      scanResults.filesWithACTags.push(file);
      scanResults.coveredACs.add(match[1]);
    }
    
    // Find BEAT tags
    const beatMatches = content.matchAll(/\[BEAT:([^\]]+)\]/g);
    for (const match of beatMatches) {
      scanResults.filesWithBeatTags.push(file);
      scanResults.coveredBeats.add(match[1]);
    }
  });
  
  scanResults.filesWithACTags = [...new Set(scanResults.filesWithACTags)];
  scanResults.filesWithBeatTags = [...new Set(scanResults.filesWithBeatTags)];
  scanResults.coveredACs = Array.from(scanResults.coveredACs);
  scanResults.coveredBeats = Array.from(scanResults.coveredBeats);
  
  scanResults.acCoverage = Math.floor((scanResults.coveredACs.length / scanResults.totalACs) * 100);
  scanResults.filesCovered = scanResults.filesWithACTags.length;
  
  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, JSON.stringify(scanResults, null, 2));
  
  console.log(`\nTag Scan Results:`);
  console.log(`  Files with AC tags: ${scanResults.filesWithACTags.length}`);
  console.log(`  Files with BEAT tags: ${scanResults.filesWithBeatTags.length}`);
  console.log(`  Unique ACs covered: ${scanResults.coveredACs.length}/${scanResults.totalACs}`);
  console.log(`  AC Coverage: ${scanResults.acCoverage}%`);
  console.log(`  Output: ${OUTPUT}\n`);
  
  return scanResults;
}

if (require.main === module) scanExistingTags();
module.exports = { scanExistingTags };
