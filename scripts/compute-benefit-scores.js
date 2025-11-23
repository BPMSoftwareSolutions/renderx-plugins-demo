#!/usr/bin/env node
/**
 * compute-benefit-scores.js
 * 
 * Computes benefitScore for each recommendation in diagnosis-results.json.
 * benefitScore = (estimatedUsers * severityMultiplier) / estimatedEffort
 * 
 * Ranks recommendations by descending benefitScore (highest ROI first).
 * 
 * Usage: node scripts/compute-benefit-scores.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SELF_HEALING_DIR = path.join(__dirname, '..', 'packages', 'self-healing');
const GENERATED_DIR = path.join(SELF_HEALING_DIR, '.generated');
const DIAGNOSIS_FILE = path.join(GENERATED_DIR, 'diagnosis-results.json');

/**
 * Map severity to multiplier for impact calculation.
 */
function getSeverityMultiplier(severity) {
  switch (severity) {
    case 'critical':
      return 4;
    case 'high':
      return 2;
    case 'medium':
      return 1;
    case 'low':
      return 0.5;
    default:
      return 1;
  }
}

/**
 * Compute benefit score for a recommendation.
 * @param {object} recommendation - the recommendation object
 * @param {number} estimatedUsers - number of affected users
 * @param {string} overallSeverity - overall issue severity
 * @returns {number} benefitScore = (estimatedUsers * severityMultiplier) / estimatedEffort
 */
function computeBenefitScore(recommendation, estimatedUsers, overallSeverity) {
  const severityMultiplier = getSeverityMultiplier(overallSeverity);
  const effort = recommendation.estimatedEffort || 1;
  const benefitScore = (estimatedUsers * severityMultiplier) / effort;
  return Math.round(benefitScore * 100) / 100; // round to 2 decimals
}

/**
 * Main logic.
 */
function enhanceDiagnosisWithBenefitScores() {
  try {
    if (!fs.existsSync(DIAGNOSIS_FILE)) {
      console.warn(`[compute-benefit-scores] WARNING: ${DIAGNOSIS_FILE} not found.`);
      return;
    }

    const diagnosisData = JSON.parse(fs.readFileSync(DIAGNOSIS_FILE, 'utf8'));
    const slice = diagnosisData.slice || {};

    if (!slice.recommendations || slice.recommendations.length === 0) {
      console.log('[compute-benefit-scores] No recommendations to score.');
      return;
    }

    const estimatedUsers = slice.impact?.estimatedUsers || 1000;
    const overallSeverity = slice.impact?.overallSeverity || 'medium';

    // Compute benefitScore for each recommendation
    slice.recommendations.forEach(rec => {
      rec.benefitScore = computeBenefitScore(rec, estimatedUsers, overallSeverity);
    });

    // Sort by benefitScore descending (highest ROI first)
    slice.recommendations.sort((a, b) => b.benefitScore - a.benefitScore);

    // Update priority based on benefitScore ranking (optional: re-rank priority)
    slice.recommendations.forEach((rec, idx) => {
      // Keep original priority but add rank field
      rec.benefitRank = idx + 1;
    });

    // Write back
    fs.writeFileSync(
      DIAGNOSIS_FILE,
      JSON.stringify(diagnosisData, null, 2) + '\n'
    );

    console.log(`[compute-benefit-scores] SUCCESS`);
    console.log(`  - Computed benefitScore for ${slice.recommendations.length} recommendations`);
    console.log(`  - Sorted by descending benefitScore (highest ROI first)`);
    console.log(`  - Top 3 by ROI:`);
    slice.recommendations.slice(0, 3).forEach((rec, idx) => {
      console.log(
        `    ${idx + 1}. ${rec.description.substring(0, 50)}... (score: ${rec.benefitScore}, effort: ${rec.estimatedEffort})`
      );
    });
  } catch (error) {
    console.error('[compute-benefit-scores] ERROR:', error.message);
    process.exit(1);
  }
}

// Run computation
enhanceDiagnosisWithBenefitScores();
