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
 * @typedef {Object} CleanSymphonyHandler
 * @property {string} symphonyName - Name of the symphony
 * @property {string} domainId - Domain identifier
 * @property {string} packageName - Package name (e.g., renderx-orchestration)
 * @property {number} symphonyCount - Number of symphonies
 * @property {number} movementCount - Number of movements
 * @property {number} beatCount - Number of beats
 * @property {number} handlerCount - Number of handlers
 * @property {number} totalLoc - Total lines of code
 * @property {number} avgCoverage - Average coverage percentage
 * @property {string} sizeBand - Size classification (TINY/SMALL/MEDIUM/LARGE/XL)
 * @property {string} riskLevel - Overall risk (LOW/MEDIUM/HIGH/CRITICAL)
 * @property {Array<{name: string, description: string, beats: string}>} movements - Movement descriptions
 * @property {Array<{beat: string, movement: string, handler: string, loc: number, sizeBand: string, coverage: number, risk: string, baton: string}>} handlers - Handler details
 * @property {Object} metrics - Portfolio metrics
 * @property {Object} metrics.sizeBands - Size band distribution
 * @property {Object} metrics.coverageDist - Coverage distribution
 * @property {Object} metrics.riskSummary - Risk level summary
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
  output += `║ Files           : ${padString(String(totalFiles), 14)}║\n`;
  output += `║ Total LOC       : ${padString(String(totalLoc), 14)}║\n`;
  output += `║ Handlers        : ${padString(String(handlerCount), 14)}║\n`;
  output += `║ Avg LOC/Handler : ${padString(avgLocPerHandler.toFixed(1), 14)}║\n`;
  output += `║ Coverage        : ${padString(coverageStatements.toFixed(1) + '%', 14)}║\n`;
  output += `║ Duplication     : ${padString(String(duplicationBlocks), 14)}║\n`;
  output += `║ Maintainability : ${padString(safeMaintainability.toFixed(1), 14)}║\n`;
  output += `║ Conformity      : ${padString(safeConformity.toFixed(1) + '%', 14)}║\n`;
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
  // Header spacing aligned to tests: 'Beat       Mov.   Cov   Bar'
  output += '║ Beat       Mov.   Cov   Bar       ║\n';
  output += '╠═══════════════════════════════════╣\n';

  data.forEach(beat => {
    const beatName = padString(beat.beat, 10);
    const movement = padString(beat.movement, 6);
    const coverage = padString(Math.round(beat.coverage) + '%', 3, true);
    const bar = padString(generateBar(beat.coverage, 11), 11);
    output += `║ ${beatName} ${movement} ${coverage} ${bar} ║\n`;
  });

  output += '╚═══════════════════════════════════╝';
  return output;
}

/**
 * Render risk assessment matrix
 * @param {RiskMatrix} data
 * @returns {string}
 */
function renderRiskAssessmentMatrix(data) {
  // Accept a RiskMatrix object with string arrays for each level
  const safe = data && typeof data === 'object' ? data : {};
  const critical = Array.isArray(safe.critical) ? safe.critical : [];
  const high = Array.isArray(safe.high) ? safe.high : [];
  const medium = Array.isArray(safe.medium) ? safe.medium : [];
  const low = Array.isArray(safe.low) ? safe.low : [];

  const boxWidth = 45;
  let output = '';
  output += '╔════ RISK ASSESSMENT MATRIX ═════════════════╗\n';
  output += '║ Level    Items                               ║\n';
  output += '╠══════════════════════════════════════════════╣\n';
  
  output += `║ CRITICAL: ${String(critical.length).padEnd(boxWidth - 11)}║\n`;
  critical.forEach(item => {
    output += `║   - ${padString(String(item), boxWidth - 4)}║\n`;
  });

  output += `║ HIGH    : ${String(high.length).padEnd(boxWidth - 11)}║\n`;
  high.forEach(item => {
    output += `║   - ${padString(String(item), boxWidth - 4)}║\n`;
  });

  output += `║ MEDIUM  : ${String(medium.length).padEnd(boxWidth - 11)}║\n`;
  medium.forEach(item => {
    output += `║   - ${padString(String(item), boxWidth - 4)}║\n`;
  });

  output += `║ LOW     : ${String(low.length).padEnd(boxWidth - 11)}║\n`;
  low.forEach(item => {
    output += `║   - ${padString(String(item), boxWidth - 4)}║\n`;
  });
  
  output += '╚══════════════════════════════════════════════╝';
  return output;
}

/**
 * Render refactoring roadmap
 * @param {RefactorRoadmap} data
 * @returns {string}
 */
function renderRefactoringRoadmap(data) {
  if (!Array.isArray(data)) {
    return ''; // Return empty string if data is not an array
  }
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

/**
 * Render clean symphony handler portfolio view
 * @param {CleanSymphonyHandler} data
 * @returns {string}
 */
function renderCleanSymphonyHandler(data) {
  const {
    symphonyName,
    domainId,
    packageName,
    symphonyCount,
    movementCount,
    beatCount,
    handlerCount,
    totalLoc,
    avgCoverage,
    sizeBand,
    riskLevel,
    movements,
    handlers,
    metrics
  } = data;

  const boxWidth = 68;
  let output = '';

  // Header
  output += '╔' + '═'.repeat(boxWidth) + '╗\n';
  output += `║ ${padString(`HANDLER SYMPHONY: ${symphonyName.toUpperCase()}`, boxWidth)}║\n`;
  output += `║ ${padString(`Domain : ${domainId}`, boxWidth)}║\n`;
  output += `║ ${padString(`Package: ${packageName}`, boxWidth)}║\n`;
  output += `║ ${padString(`Scope : ${symphonyCount} Symphony · ${movementCount} Movements · ${beatCount} Beats · ${handlerCount} Handlers`, boxWidth)}║\n`;
  output += `║ ${padString(`Health: ${totalLoc} LOC · Avg Cov ${avgCoverage}% · Size Band: ${sizeBand} · Risk: ${riskLevel}`, boxWidth)}║\n`;

  // Movement Map
  output += '╠' + '═'.repeat(boxWidth) + '╣\n';
  output += `║ ${padString('MOVEMENT MAP', boxWidth)}║\n`;
  
  // Build movement flow line
  const movementLine = movements.map(m => m.name).join('   →   ');
  output += `║ ${padString('  ' + movementLine, boxWidth)}║\n`;
  
  // Build beats line
  const beatsLine = movements.map(m => m.beats).join('      ');
  output += `║ ${padString('  ' + beatsLine, boxWidth)}║\n`;
  
  // Build focus line
  const focusLine = movements.map(m => m.description).join('     ');
  output += `║ ${padString('  ' + focusLine, boxWidth)}║\n`;

  // Handler Portfolio Section
  output += '╠' + '═'.repeat(24) + ' BEAT / HANDLER PORTFOLIO ' + '═'.repeat(boxWidth - 50) + '╣\n';
  output += `║ ${padString('Beat Mov Handler                    LOC  Sz  Cov  Risk AC  Baton', boxWidth)}║\n`;
  output += `║ ${padString('─'.repeat(boxWidth - 1), boxWidth)}║\n`;

  // Handler rows
  handlers.forEach((handler, idx) => {
    const beat = padString(handler.beat, 4);
    const mov = padString(handler.movement, 3);
    const name = padString(handler.handler, 27);
    const loc = padString(String(handler.loc), 3, true);
    const sz = padString(handler.sizeBand, 2);
    const cov = padString(handler.coverage + '%', 4, true);
    const risk = padString(handler.risk, 4);
    const ac = padString(handler.hasAcGwt ? 'Y' : 'N', 2);
    const baton = padString(handler.baton, 8);

    output += `║ ${beat} ${mov} ${name} ${loc}  ${sz}  ${cov} ${risk} ${ac} ${baton} ║\n`;
    
    // Add data baton handoff after movement boundaries
    if (handler.baton === 'metrics' || handler.baton === 'dom' || handler.baton === 'payload') {
      const nextHandler = handlers[idx + 1];
      if (nextHandler && nextHandler.baton !== handler.baton) {
        let batonDesc = '';
        if (handler.baton === 'metrics') batonDesc = 'handoff: template + CSS metrics';
        else if (handler.baton === 'dom') batonDesc = 'handoff: DOM + styling coverage';
        else if (handler.baton === 'payload') batonDesc = 'handoff: import + payload data';
        
        output += `║ ${padString(`     🎭 Data Baton ▸ ${batonDesc}`, boxWidth)}║\n`;
      }
    }
  });

  // Metrics Summary
  output += '╠' + '═'.repeat(24) + ' HANDLER PORTFOLIO METRICS ' + '═'.repeat(boxWidth - 51) + '╣\n';
  
  // Size bands
  const sizeLine = `Size Bands    : Tiny ${metrics.sizeBands.tiny} · Small ${metrics.sizeBands.small} · Medium ${metrics.sizeBands.medium} · Large ${metrics.sizeBands.large} · XL ${metrics.sizeBands.xl}`;
  output += `║ ${padString(sizeLine, boxWidth)}║\n`;
  
  // Coverage distribution
  const covLine = `Coverage Dist.: 0–30% ${metrics.coverageDist.low} · 30–60% ${metrics.coverageDist.medLow} · 60–80% ${metrics.coverageDist.medHigh} · 80–100% ${metrics.coverageDist.high}`;
  output += `║ ${padString(covLine, boxWidth)}║\n`;
  
  // Risk summary
  const riskLine = `Risk Summary  : CRITICAL ${metrics.riskSummary.critical} · HIGH ${metrics.riskSummary.high} · MEDIUM ${metrics.riskSummary.medium} · LOW ${metrics.riskSummary.low}`;
  output += `║ ${padString(riskLine, boxWidth)}║\n`;

  output += '╚' + '═'.repeat(boxWidth) + '╝';
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
  renderLegendAndTerminology,
  renderCleanSymphonyHandler
};
