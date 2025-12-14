#!/usr/bin/env node
/**
 * Post-Conversion Projection
 * Estimates coverage after applying suggested tags
 */
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const SUGGESTIONS = path.join(ROOT, '.generated', 'ac-alignment', 'suggestions.json');
const CANONICAL = path.join(ROOT, '.generated', 'ac-alignment', 'canonical.json');
const CURRENT = path.join(ROOT, '.generated', 'ac-alignment', 'summary.json');
const OUTPUT = path.join(ROOT, '.generated', 'ac-alignment', 'projection.json');

function computeProjection() {
  const suggestions = JSON.parse(fs.readFileSync(SUGGESTIONS, 'utf8'));
  const canonical = JSON.parse(fs.readFileSync(CANONICAL, 'utf8'));
  const current = JSON.parse(fs.readFileSync(CURRENT, 'utf8'));

  const suggestedCoverage = suggestions.proposedCovered || suggestions.suggestionsGenerated || 0;
  const currentCoverage = current.presenceCoverage || 0;
  const totalACs = canonical.totalACs;

  const projection = {
    current: {
      coverage: currentCoverage,
      coveredACs: Math.floor(totalACs * currentCoverage / 100)
    },
    projected: {
      coverage: Math.min(100, Math.floor((currentCoverage + suggestedCoverage) / totalACs * 100)),
      coveredACs: currentCoverage + suggestedCoverage
    },
    delta: {
      coverageIncrease: suggestedCoverage,
      percentIncrease: Math.floor(suggestedCoverage / totalACs * 100)
    },
    canonical: {
      totalACs,
      minimumTests: canonical.canonicalMinimumTests
    }
  };

  fs.writeFileSync(OUTPUT, JSON.stringify(projection, null, 2));
  
  console.log('Current coverage:', projection.current.coverage + '%');
  console.log('Projected coverage:', projection.projected.coverage + '%');
  console.log('Increase:', '+' + projection.delta.percentIncrease + '%');
  console.log('Output:', OUTPUT);

  return projection;
}

if (require.main === module) computeProjection();
module.exports = { computeProjection };
