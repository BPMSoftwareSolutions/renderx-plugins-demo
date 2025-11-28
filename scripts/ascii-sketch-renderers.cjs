/**
 * @fileoverview ASCII sketch rendering patterns for analysis reports
 * @module ascii-sketch-renderers
 */

// ===== TYPE DEFINITIONS =====

/**
 * @typedef {Object} SymphonyArchitecture
 * @property {string} domainId
 * @property {Object} summary
 * @property {number} summary.symphonyCount
 * @property {number} summary.handlerCount
 * @property {number} summary.avgHandlersPerSymphony
 * @property {Array<{id: string, label: string, handlerCount: number, avgCoverage: number}>} symphonies
 */

/**
 * @typedef {Object} SymphonyHandlers
 * @property {string} symphonyId
 * @property {string} symphonyLabel
 * @property {Array<{name: string, loc: number, coverage: number, complexity: number, sizeBand: string, risk: string}>} handlers
 */

/**
 * @typedef {Object} HandlerPortfolioFoundation
 * @property {number} totalFiles
 * @property {number} totalLoc
 * @property {number} handlerCount
 * @property {number} avgLocPerHandler
 * @property {number} coverageStatements
 * @property {number} duplicationBlocks
 * @property {number} maintainability
 * @property {number} conformityScore
 */

/**
 * @typedef {Object} BeatCoverage
 * @property {string} beat
 * @property {string} movement
 * @property {number} coverage
 */

/**
 * @typedef {Object} RiskMatrix
 * @property {string[]} critical
 * @property {string[]} high
 * @property {string[]} medium
 * @property {string[]} low
 */

/**
 * @typedef {Object} RefactorItem
 * @property {string} id
 * @property {string} title
 * @property {string} target
 * @property {string} rationale
 * @property {string} [suggestedPrTitle]
 * @property {string} [suggestedPrBody]
 * @property {string} [effort]
 */

/**
 * @typedef {RefactorItem[]} RefactorRoadmap
 */

/**
 * @typedef {Object} TrendSnapshot
 * @property {string} timestamp
 * @property {number} handlerCount
 * @property {number} duplicationBlocks
 * @property {number} coverageAvg
 * @property {number} maintainability
 * @property {number} conformity
 */

/**
 * @typedef {Object} TrendAnalysis
 * @property {string} periodLabel
 * @property {string} baselineAt
 * @property {TrendSnapshot} current
 * @property {TrendSnapshot} [previous]
 */

/**
 * @typedef {Object} LegendEntry
 * @property {string} term
 * @property {string} definition
 */

/**
 * @typedef {Object} Legend
 * @property {string} domainId
 * @property {LegendEntry[]} entries
 */

// ===== UTILITY FUNCTIONS =====

/**
 * Pad string to fixed width, truncating if necessary
 * @param {string} str - String to pad
 * @param {number} width - Target width
 * @param {boolean} rightAlign - Align to right if true
 * @returns {string}
 */
function padString(str, width, rightAlign = false) {
  const truncated = str.length > width ? str.substring(0, width) : str;
  if (rightAlign) {
    return truncated.padStart(width, ' ');
  }
  return truncated.padEnd(width, ' ');
}

/**
 * Generate horizontal bar visualization
 * @param {number} value - Value (0-100)
 * @param {number} maxWidth - Maximum bar width in characters
 * @returns {string}
 */
function generateBar(value, maxWidth = 20) {
  const barLength = Math.round((value / 100) * maxWidth);
  return '█'.repeat(Math.max(0, barLength));
}

/**
 * Calculate trend direction
 * @param {number} current - Current value
 * @param {number} previous - Previous value
 * @param {number} epsilon - Minimum threshold for change
 * @returns {string} '↑' | '↓' | '–'
 */
function getTrendDirection(current, previous, epsilon = 0.1) {
  const delta = current - previous;
  if (Math.abs(delta) < epsilon) return '–';
  return delta > 0 ? '↑' : '↓';
}

// ===== RENDERING FUNCTIONS =====

/**
 * Render symphony architecture diagram
 * @param {SymphonyArchitecture} data
 * @returns {string}
 */
function renderSymphonyArchitecture(data) {
  const { domainId, summary, symphonies } = data;
  const { symphonyCount, handlerCount } = summary;

  let output = '';
  output += '╔════════ SYMPHONY ORCHESTRATION ════════╗\n';
  output += `║ Domain : ${padString(domainId, 29)}║\n`;
  output += `║ Units  : ${symphonyCount} symphonies${' '.repeat(20 - String(symphonyCount).length)}║\n`;
  output += `║         ${handlerCount} handlers${' '.repeat(22 - String(handlerCount).length)}║\n`;
  output += '╠═══════════════════════════════════════╣\n';
  output += '║ SYMPHONIES                            ║\n';

  // Sort by handler count descending
  const sorted = [...symphonies].sort((a, b) => b.handlerCount - a.handlerCount);
  
  sorted.forEach(symphony => {
    const line = `• ${symphony.label} (${symphony.handlerCount} @ ${symphony.avgCoverage.toFixed(1)}%)`;
    output += `║ ${padString(line, 38)}║\n`;
  });

  output += '╚═══════════════════════════════════════╝';
  return output;
}

/**
 * Render per-symphony handler breakdown
 * @param {SymphonyHandlers} data
 * @returns {string}
 */
function renderSymphonyHandlerBreakdown(data) {
  const { symphonyLabel, handlers } = data;

  let output = '';
  output += `╔════════ HANDLERS: ${padString(symphonyLabel, 20)}════════╗\n`;
  output += '║ Name                     LOC   Cov   Risk ║\n';
  output += '╠═══════════════════════════════════════════╣\n';

  handlers.forEach(handler => {
    const name = padString(handler.name, 24);
    const loc = padString(String(handler.loc), 4, true);
    const cov = padString(String(Math.floor(handler.coverage)), 3, true);
    const risk = padString(handler.risk, 8);
    output += `║ ${name} ${loc}${cov}% ${risk}║\n`;
  });

  output += '╚═══════════════════════════════════════════╝';
  return output;
}

/**
 * Render handler portfolio metrics foundation
 * @param {HandlerPortfolioFoundation} data
 * @returns {string}
 */
function renderHandlerPortfolioFoundation(data) {
  const {
    totalFiles,
    totalLoc,
    handlerCount,
    avgLocPerHandler,
    coverageStatements,
    duplicationBlocks,
    maintainability,
    conformityScore
  } = data;

  // Safely convert to numbers
  const safeMaintainability = Number(maintainability) || 0;
  const safeConformity = Number(conformityScore) || 0;

  let output = '';
  output += '╔════ HANDLER PORTFOLIO METRICS ════╗\n';
  output += `║ Files           : ${String(totalFiles).padStart(3)}    ║\n`;
  output += `║ Total LOC       : ${String(totalLoc).padStart(4)}    ║\n`;
  output += `║ Handlers        : ${String(handlerCount).padStart(3)}    ║\n`;
  output += `║ Avg LOC/Handler : ${avgLocPerHandler.toFixed(1)}    ║\n`;
  output += `║ Coverage        : ${coverageStatements.toFixed(1)}%    ║\n`;
  output += `║ Duplication     : ${String(duplicationBlocks).padStart(3)}    ║\n`;
  output += `║ Maintainability : ${safeMaintainability.toFixed(1)}    ║\n`;
  output += `║ Conformity      : ${safeConformity.toFixed(1)}%    ║\n`;
  output += '╚════════════════════════════════════╝';
  return output;
}

/**
 * Render coverage heatmap by beat
 * @param {BeatCoverage[]} data
 * @returns {string}
 */
function renderCoverageHeatmapByBeat(data) {
  let output = '';
  output += '╔════ COVERAGE HEATMAP BY BEAT ════╗\n';
  output += '║ Beat       Mov.   Cov   Bar      ║\n';
  output += '╠══════════════════════════════════╣\n';

  data.forEach(beat => {
    const beatName = padString(beat.beat, 10);
    const movement = padString(beat.movement, 6);
    const coverage = padString(Math.round(beat.coverage) + '%', 4, true);
    const bar = generateBar(beat.coverage, 15);
    output += `║ ${beatName} ${movement} ${coverage} ${padString(bar, 15)}║\n`;
  });

  output += '╚══════════════════════════════════╝';
  return output;
}

/**
 * Render risk assessment matrix
 * @param {RiskMatrix} data
 * @returns {string}
 */
function renderRiskAssessmentMatrix(data) {
  const { critical, high, medium, low } = data;

  const boxWidth = 45;
  let output = '';
  output += '╔════ RISK ASSESSMENT MATRIX ═════════════════╗\n';
  output += '║ Level    Items                               ║\n';
  output += '╠══════════════════════════════════════════════╣\n';
  
  output += `║ CRITICAL: ${String(critical.length).padEnd(boxWidth - 11)}║\n`;
  critical.forEach(item => {
    output += `║   - ${padString(item, boxWidth - 4)}║\n`;
  });

  output += `║ HIGH    : ${String(high.length).padEnd(boxWidth - 11)}║\n`;
  high.forEach(item => {
    output += `║   - ${padString(item, boxWidth - 4)}║\n`;
  });

  output += `║ MEDIUM  : ${String(medium.length).padEnd(boxWidth - 11)}║\n`;
  if (medium.length > 0 && medium.length <= 3) {
    medium.forEach(item => {
      output += `║   - ${padString(item, boxWidth - 4)}║\n`;
    });
  }

  output += `║ LOW     : ${String(low.length).padEnd(boxWidth - 11)}║\n`;
  
  output += '╚══════════════════════════════════════════════╝';
  return output;
}

/**
 * Render refactoring roadmap
 * @param {RefactorRoadmap} data
 * @returns {string}
 */
function renderRefactoringRoadmap(data) {
  let output = '';
  const boxWidth = 55;
  output += '╔════ REFACTORING ROADMAP ══════════════════════════════╗\n';

  data.forEach((item, index) => {
    const num = index + 1;
    const titleLine = `${num}. ${item.title}`;
    output += `║ ${padString(titleLine, boxWidth)}║\n`;
    
    const targetLine = `  Target : ${item.target}`;
    output += `║ ${padString(targetLine, boxWidth)}║\n`;
    
    if (item.effort) {
      const effortLine = `  Effort : ${item.effort}`;
      output += `║ ${padString(effortLine, boxWidth)}║\n`;
    }
    
    const rationaleLine = `  Rationale: ${item.rationale}`;
    output += `║ ${padString(rationaleLine, boxWidth)}║\n`;
    
    if (item.suggestedPrTitle) {
      const prLine = `  PR: ${item.suggestedPrTitle}`;
      output += `║ ${padString(prLine, boxWidth)}║\n`;
    }
    
    if (index < data.length - 1) {
      output += `║ ${' '.repeat(boxWidth)}║\n`;
    }
  });

  output += '╚' + '═'.repeat(boxWidth + 2) + '╝';
  return output;
}

/**
 * Render historical trend analysis
 * @param {TrendAnalysis} data
 * @returns {string}
 */
function renderHistoricalTrendAnalysis(data) {
  const { periodLabel, baselineAt, current, previous } = data;

  let output = '';
  output += '╔════ HISTORICAL TREND ANALYSIS ════╗\n';
  output += `║ Period  : ${padString(periodLabel, 24)}║\n`;
  output += `║ Baseline: ${padString(baselineAt.substring(0, 10), 24)}║\n`;
  output += '╠════════ METRIC TRENDS ═══════════╣\n';
  output += '║ Metric        Cur   Prev  Trend  ║\n';

  if (previous) {
    // Handlers
    const handlersTrend = getTrendDirection(current.handlerCount, previous.handlerCount);
    output += `║ Handlers      ${padString(String(current.handlerCount), 4, true)}  ${padString(String(previous.handlerCount), 4, true)}  ${handlersTrend}     ║\n`;

    // Duplication
    const dupTrend = getTrendDirection(current.duplicationBlocks, previous.duplicationBlocks);
    output += `║ Duplication   ${padString(String(current.duplicationBlocks), 4, true)}  ${padString(String(previous.duplicationBlocks), 4, true)}  ${dupTrend}     ║\n`;

    // Coverage
    const covTrend = getTrendDirection(current.coverageAvg, previous.coverageAvg);
    output += `║ Coverage avg  ${padString(current.coverageAvg.toFixed(1) + '%', 5, true)} ${padString(previous.coverageAvg.toFixed(1) + '%', 5, true)} ${covTrend}     ║\n`;

    // Conformity
    const confTrend = getTrendDirection(current.conformity, previous.conformity);
    output += `║ Conformity    ${padString(current.conformity.toFixed(1) + '%', 5, true)} ${padString(previous.conformity.toFixed(1) + '%', 5, true)} ${confTrend}     ║\n`;
  } else {
    // No previous data - show current only
    output += `║ Handlers      ${padString(String(current.handlerCount), 4, true)}  N/A   –     ║\n`;
    output += `║ Duplication   ${padString(String(current.duplicationBlocks), 4, true)}  N/A   –     ║\n`;
    output += `║ Coverage avg  ${padString(current.coverageAvg.toFixed(1) + '%', 5, true)} N/A   –     ║\n`;
    output += `║ Conformity    ${padString(current.conformity.toFixed(1) + '%', 5, true)} N/A   –     ║\n`;
  }

  output += '╚══════════════════════════════════╝';
  return output;
}

/**
 * Render legend and domain terminology
 * @param {Legend} data
 * @returns {string}
 */
function renderLegendAndTerminology(data) {
  const { domainId, entries } = data;

  const boxWidth = 70;
  let output = '';
  output += '╔════ LEGEND & DOMAIN TERMINOLOGY ════' + '═'.repeat(boxWidth - 36) + '╗\n';
  output += `║ Domain: ${padString(domainId, boxWidth - 9)}║\n`;
  output += '╠' + '═'.repeat(boxWidth + 2) + '╣\n';

  entries.forEach(entry => {
    const termLine = `• ${entry.term}: ${entry.definition}`;
    output += `║ ${padString(termLine, boxWidth)}║\n`;
  });

  output += `║ ${' '.repeat(boxWidth)}║\n`;
  output += '╚' + '═'.repeat(boxWidth + 2) + '╝';
  return output;
}

// ===== EXPORTS =====

module.exports = {
  renderSymphonyArchitecture,
  renderSymphonyHandlerBreakdown,
  renderHandlerPortfolioFoundation,
  renderCoverageHeatmapByBeat,
  renderRiskAssessmentMatrix,
  renderRefactoringRoadmap,
  renderHistoricalTrendAnalysis,
  renderLegendAndTerminology
};
