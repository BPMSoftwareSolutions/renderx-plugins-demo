/**
 * Symphonic Code Analysis - Metric Classifiers
 * Centralized classification functions for consistent reporting
 */

/**
 * Classify maintainability score (0-100)
 * Returns: { grade, label, emoji, color }
 */
function classifyMaintainability(score) {
  if (score >= 80) {
    return {
      grade: 'A',
      label: 'EXCELLENT',
      emoji: '🟢',
      color: 'green',
      threshold: '≥80',
      guidance: 'Maintain current practices. Consider as reference implementation.'
    };
  } else if (score >= 60) {
    return {
      grade: 'B',
      label: 'FAIR',
      emoji: '🟡',
      color: 'yellow',
      threshold: '60-80',
      guidance: 'Address technical debt in next sprint. Schedule refactoring review.'
    };
  } else {
    return {
      grade: 'C',
      label: 'POOR',
      emoji: '🔴',
      color: 'red',
      threshold: '<60',
      guidance: 'Critical refactoring needed. High priority for next cycle.'
    };
  }
}

/**
 * Classify coverage percentage
 */
function classifyCoverage(percentage) {
  const p = parseFloat(percentage);
  if (p >= 90) return { status: '✅ EXCELLENT', emoji: '🟢', riskLevel: 'LOW' };
  if (p >= 80) return { status: '✅ GOOD', emoji: '🟢', riskLevel: 'LOW' };
  if (p >= 70) return { status: '⚠️  FAIR', emoji: '🟡', riskLevel: 'MEDIUM' };
  if (p >= 60) return { status: '⚠️  NEEDS WORK', emoji: '🟡', riskLevel: 'MEDIUM' };
  return { status: '❌ CRITICAL', emoji: '🔴', riskLevel: 'HIGH' };
}

/**
 * Classify duplication percentage
 */
function classifyDuplication(percentage) {
  const p = parseFloat(percentage);
  if (p <= 10) return { status: '✅ EXCELLENT', emoji: '🟢' };
  if (p <= 20) return { status: '✅ GOOD', emoji: '🟢' };
  if (p <= 30) return { status: '⚠️  ACCEPTABLE', emoji: '🟡' };
  if (p <= 50) return { status: '⚠️  HIGH', emoji: '🟡' };
  return { status: '❌ VERY HIGH', emoji: '🔴' };
}

/**
 * Classify complexity score
 */
function classifyComplexity(avgComplexity) {
  const c = parseFloat(avgComplexity);
  if (c <= 1.5) return { status: '✅ LOW', emoji: '🟢' };
  if (c <= 3) return { status: '✅ MODERATE', emoji: '🟢' };
  if (c <= 5) return { status: '⚠️  ELEVATED', emoji: '🟡' };
  return { status: '❌ HIGH', emoji: '🔴' };
}

/**
 * Classify conformity score
 */
function classifyConformity(conformityScore) {
  const c = parseFloat(conformityScore);
  if (c >= 95) return { status: '✅ EXCELLENT', emoji: '🟢', govStatus: 'PASS' };
  if (c >= 90) return { status: '✅ GOOD', emoji: '🟢', govStatus: 'PASS' };
  if (c >= 80) return { status: '⚠️  FAIR', emoji: '🟡', govStatus: 'CONDITIONAL' };
  if (c >= 70) return { status: '⚠️  NEEDS WORK', emoji: '🟡', govStatus: 'FAIL' };
  return { status: '❌ POOR', emoji: '🔴', govStatus: 'FAIL' };
}

/**
 * Calculate risk score per beat (0-100)
 * Combines complexity, coverage, and handler completeness
 */
function calculateBeatRisk(complexity, coverage, handlerCount, expectedHandlers = 1) {
  const complexityRisk = Math.min(complexity * 10, 40); // 0-40 points
  const coverageRisk = Math.max(0, 40 - (parseFloat(coverage) / 2.5)); // 0-40 points
  const handlerRisk = (1 - (handlerCount / expectedHandlers)) * 20; // 0-20 points
  
  const totalRisk = Math.min(complexityRisk + coverageRisk + handlerRisk, 100);
  
  if (totalRisk <= 20) return { score: totalRisk, level: 'LOW', emoji: '🟢' };
  if (totalRisk <= 40) return { score: totalRisk, level: 'MEDIUM', emoji: '🟡' };
  if (totalRisk <= 60) return { score: totalRisk, level: 'ELEVATED', emoji: '🟠' };
  return { score: totalRisk, level: 'HIGH', emoji: '🔴' };
}

/**
 * Determine if beat passes governance requirements
 */
function beatPassesGovernance(coverage, complexity, hasHandler) {
  const coveragePasses = parseFloat(coverage) >= 75;
  const complexityPasses = parseFloat(complexity) <= 3.0;
  const handlerPasses = hasHandler === true;
  
  return coveragePasses && complexityPasses && handlerPasses;
}

/**
 * Handler completeness assessment
 */
function classifyHandlerCompleteness(implemented, total) {
  const percent = (implemented / total) * 100;
  
  if (percent >= 90) return { status: '✅ COMPLETE', emoji: '🟢', pct: percent };
  if (percent >= 70) return { status: '⚠️  MOSTLY COMPLETE', emoji: '🟡', pct: percent };
  if (percent >= 50) return { status: '⚠️  PARTIAL', emoji: '🟡', pct: percent };
  if (percent > 0) return { status: '⚠️  MINIMAL', emoji: '🟠', pct: percent };
  return { status: '❌ NOT IMPLEMENTED', emoji: '🔴', pct: percent };
}

/**
 * CI/CD Readiness assessment
 */
function assessCIReadiness(conformityScore, coverage, handlerCompleteness) {
  const conformityReady = parseFloat(conformityScore) >= 85;
  const coverageReady = parseFloat(coverage) >= 80;
  const handlersReady = parseFloat(handlerCompleteness) >= 50;
  
  const passCount = [conformityReady, coverageReady, handlersReady].filter(Boolean).length;
  
  if (passCount === 3) return { ready: true, status: 'READY', emoji: '✅', gatingLevel: 'PASS' };
  if (passCount === 2) return { ready: true, status: 'READY WITH CAUTION', emoji: '⚠️', gatingLevel: 'CONDITIONAL' };
  return { ready: false, status: 'NOT READY', emoji: '❌', gatingLevel: 'FAIL' };
}

module.exports = {
  classifyMaintainability,
  classifyCoverage,
  classifyDuplication,
  classifyComplexity,
  classifyConformity,
  calculateBeatRisk,
  beatPassesGovernance,
  classifyHandlerCompleteness,
  assessCIReadiness
};
