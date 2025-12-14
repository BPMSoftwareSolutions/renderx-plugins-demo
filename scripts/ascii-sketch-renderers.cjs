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
 * @property {number] coverageStatements
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
  const { domainId, summary, symphonies } = data || {};
  const { symphonyCount = 0, handlerCount = 0 } = summary || {};

  const sketch = new AsciiSketcher({ boxWidth: 48 });
  const lines = [];
  lines.push(`Domain : ${domainId || ''}`);
  lines.push(`Units  : ${symphonyCount} symphonies`);
  lines.push(`        ${handlerCount} handlers`);
  lines.push('');
  lines.push('SYMPHONIES');

  const sorted = Array.isArray(symphonies) ? [...symphonies].sort((a, b) => b.handlerCount - a.handlerCount) : [];
  sorted.forEach(s => lines.push(`• ${s.label} (${s.handlerCount} @ ${Number(s.avgCoverage || 0).toFixed(1)}%)`));

  sketch.addCard('SYMPHONY ORCHESTRATION', lines, { width: 48 });
  return sketch.current.join('\n');
}

/**
 * Render per-symphony handler breakdown
 * @param {SymphonyHandlers} data
 * @returns {string}
 */
function renderSymphonyHandlerBreakdown(data) {
  const { symphonyLabel, handlers } = data || {};
  const columns = [
    { key: 'name', header: 'Name', width: 24 },
    { key: 'loc', header: 'LOC', width: 4, align: 'right' },
    { key: 'cov', header: 'Cov', width: 4, align: 'right' },
    { key: 'risk', header: 'Risk', width: 8 }
  ];
  const rows = (handlers || []).map(h => [h.name || '', String(h.loc || ''), String(Math.floor(h.coverage || 0)) + '%', h.risk || '']);
  const sketch = new AsciiSketcher({ boxWidth: 44 });
  // Add a simple textual heading before the table so tests can assert on section title
  sketch.current.push(`HANDLERS: ${symphonyLabel || ''}`);
  sketch.addTable(columns, rows);
  return sketch.current.join('\n');
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
  } = data || {};

  const sketch = new AsciiSketcher({ boxWidth: 40 });
  const lines = [
    `Files           : ${String(totalFiles || '')}`,
    `Total LOC       : ${String(totalLoc || '')}`,
    `Handlers        : ${String(handlerCount || '')}`,
    `Avg LOC/Handler : ${Number(avgLocPerHandler || 0).toFixed(1)}`,
    `Coverage        : ${Number(coverageStatements || 0).toFixed(1)}%`,
    `Duplication     : ${String(duplicationBlocks || '')}`,
    `Maintainability : ${Number(maintainability || 0).toFixed(1)}`,
    `Conformity      : ${Number(conformityScore || 0).toFixed(1)}%`
  ];

  sketch.addCard('HANDLER PORTFOLIO METRICS', lines, { width: 40 });
  return sketch.current.join('\n');
}

/**
 * Render coverage heatmap by beat
 * @param {BeatCoverage[]} data
 * @returns {string}
 */
function renderCoverageHeatmapByBeat(data) {
  const columns = [
    { key: 'beat', header: 'Beat', width: 10 },
    { key: 'movement', header: 'Mov.', width: 8 },
    { key: 'cov', header: 'Cov', width: 4, align: 'right' },
    { key: 'bar', header: 'Bar', width: 11 }
  ];
  const rows = (data || []).map(b => {
    // Preserve provided movement label (e.g., 'Mov. I') so tests can assert on it
    const movementLabel = b.movement || '';
    return [
      b.beat || '',
      movementLabel,
      String(Math.round(b.coverage || 0)) + '%',
      generateBar(b.coverage || 0, 11)
    ];
  });
  const sketch = new AsciiSketcher({ boxWidth: 38 });
  sketch.current.push('COVERAGE HEATMAP BY BEAT');
  sketch.current.push('Beat       Mov.   Cov   Bar');
  sketch.addTable(columns, rows, { colSpacing: 3 });
  return sketch.current.join('\n');
}

/**
 * Render risk assessment matrix
 * @param {RiskMatrix} data
 * @returns {string}
 */
function renderRiskAssessmentMatrix(data) {
  const safe = data && typeof data === 'object' ? data : {};
  const critical = Array.isArray(safe.critical) ? safe.critical : [];
  const high = Array.isArray(safe.high) ? safe.high : [];
  const medium = Array.isArray(safe.medium) ? safe.medium : [];
  const low = Array.isArray(safe.low) ? safe.low : [];

  const sketch = new AsciiSketcher({ boxWidth: 45 });
  const lines = [];
  lines.push(`CRITICAL: ${critical.length}`);
  critical.forEach(i => lines.push(`  - ${String(i)}`));
  lines.push('');
  lines.push(`HIGH    : ${high.length}`);
  high.forEach(i => lines.push(`  - ${String(i)}`));
  lines.push('');
  lines.push(`MEDIUM  : ${medium.length}`);
  medium.forEach(i => lines.push(`  - ${String(i)}`));
  lines.push('');
  lines.push(`LOW     : ${low.length}`);
  low.forEach(i => lines.push(`  - ${String(i)}`));

  sketch.addCard('RISK ASSESSMENT MATRIX', lines, { width: 45 });
  return sketch.current.join('\n');
}

/**
 * Render refactoring roadmap
 * @param {RefactorRoadmap} data
 * @returns {string}
 */
function renderRefactoringRoadmap(data) {
  if (!Array.isArray(data)) return '';
  const sketch = new AsciiSketcher({ boxWidth: 55 });
  // High-level roadmap title as a plain line so tests can look for it
  sketch.current.push('REFACTORING ROADMAP');
  data.forEach((item, idx) => {
    const lines = [];
    // Prefix items with an index to match test expectations like "1. Extract utility functions"
    const numberedTitle = `${idx + 1}. ${item.title || 'Refactor Item'}`;
    lines.push(numberedTitle);
    lines.push(`Target : ${item.target}`);
    if (item.effort) lines.push(`Effort : ${item.effort}`);
    lines.push(`Rationale: ${item.rationale}`);
    if (item.suggestedPrTitle) lines.push(`PR: ${item.suggestedPrTitle}`);
    sketch.addCard(item.title || 'REF - ITEM', lines, { width: 55 });
  });
  return sketch.current.join('\n\n');
}

function renderHistoricalTrendAnalysis(data) {
  const { periodLabel, baselineAt, current, previous } = data || {};
  const sketch = new AsciiSketcher({ boxWidth: 42 });
  const lines = [];
  lines.push(`Period  : ${periodLabel || ''}`);
  lines.push(`Baseline: ${baselineAt ? String(baselineAt).substring(0,10) : ''}`);
  lines.push('');
  lines.push('Metric        Cur   Prev  Trend');
  if (previous && current) {
    lines.push(`Handlers      ${padString(String(current.handlerCount),4,true)}  ${padString(String(previous.handlerCount),4,true)}  ${getTrendDirection(current.handlerCount, previous.handlerCount)}`);
    lines.push(`Duplication   ${padString(String(current.duplicationBlocks),4,true)}  ${padString(String(previous.duplicationBlocks),4,true)}  ${getTrendDirection(current.duplicationBlocks, previous.duplicationBlocks)}`);
    lines.push(`Coverage avg  ${padString(current.coverageAvg.toFixed(1) + '%',5,true)} ${padString(previous.coverageAvg.toFixed(1) + '%',5,true)} ${getTrendDirection(current.coverageAvg, previous.coverageAvg)}`);
    lines.push(`Conformity    ${padString(current.conformity.toFixed(1) + '%',5,true)} ${padString(previous.conformity.toFixed(1) + '%',5,true)} ${getTrendDirection(current.conformity, previous.conformity)}`);
  } else if (current) {
    lines.push(`Handlers      ${padString(String(current.handlerCount),4,true)}  N/A   –`);
    lines.push(`Duplication   ${padString(String(current.duplicationBlocks),4,true)}  N/A   –`);
    lines.push(`Coverage avg  ${padString(current.coverageAvg.toFixed(1) + '%',5,true)} N/A   –`);
    lines.push(`Conformity    ${padString(current.conformity.toFixed(1) + '%',5,true)} N/A   –`);
  }
  sketch.addCard('HISTORICAL TREND ANALYSIS', lines, { width: 42 });
  return sketch.current.join('\n');
}

function renderLegendAndTerminology(data) {
  const { domainId, entries } = data || {};
  const sketch = new AsciiSketcher({ boxWidth: 70 });
  const lines = [];
  lines.push(`Domain: ${domainId || ''}`);
  lines.push('');
  (entries || []).forEach(e => lines.push(`• ${e.term}: ${e.definition}`));
  sketch.addCard('LEGEND & DOMAIN TERMINOLOGY', lines, { width: 70 });
  return sketch.current.join('\n');
}

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
  } = data || {};

  const TABLE_COLUMNS = [
    { key: 'beat', header: 'Beat', width: 4, align: 'left', getValue: h => h.beat },
    { key: 'movement', header: 'Mov', width: 3, align: 'left', getValue: h => h.movement },
    { key: 'handler', header: 'Handler', width: 27, align: 'left', getValue: h => h.handler },
    { key: 'loc', header: 'LOC', width: 3, align: 'right', getValue: h => String(h.loc) },
    { key: 'sizeBand', header: 'Sz', width: 2, align: 'left', getValue: h => h.sizeBand },
    { key: 'coverage', header: 'Cov', width: 4, align: 'right', getValue: h => h.coverage + '%' },
    { key: 'risk', header: 'Risk', width: 4, align: 'left', getValue: h => h.risk },
    { key: 'hasAcGwt', header: 'AC', width: 2, align: 'left', getValue: h => h.hasAcGwt ? 'Y' : 'N' },
    { key: 'hasSourcePath', header: 'Src', width: 3, align: 'left', getValue: h => h.hasSourcePath ? 'Y' : 'N' },
    { key: 'baton', header: 'Baton', width: 8, align: 'left', getValue: h => h.baton }
  ];

  const COLUMN_SPACING = [1, 1, 1, 2, 2, 1, 1, 2, 1];

  const tableContentWidth = TABLE_COLUMNS.reduce((sum, col) => sum + col.width, 0) +
                            COLUMN_SPACING.reduce((sum, space) => sum + space, 0);

  const boxWidth = Math.max(68, tableContentWidth);

  const sketch = new AsciiSketcher({ boxWidth });
  sketch._pushTopBorder();
  sketch._pushLine(`HANDLER SYMPHONY: ${symphonyName ? symphonyName.toUpperCase() : ''}`);
  sketch._pushLine(`Domain : ${domainId || ''}`);
  sketch._pushLine(`Package: ${packageName || ''}`);
  sketch._pushLine(`Scope : ${symphonyCount || 0} Symphony · ${movementCount || 0} Movements · ${beatCount || 0} Beats · ${handlerCount || 0} Handlers`);
  sketch._pushLine(`Health: ${totalLoc || 0} LOC · Avg Cov ${avgCoverage || 0}% · Size Band: ${sizeBand || ''} · Risk: ${riskLevel || ''}`);

  sketch._pushSeparator();
  sketch._pushLine('MOVEMENT MAP');
  const movementLine = (movements || []).map(m => m.name).join('   →   ');
  sketch._pushLine('  ' + movementLine);
  const beatsLine = (movements || []).map(m => m.beats).join('      ');
  sketch._pushLine('  ' + beatsLine);
  const focusLine = (movements || []).map(m => m.description).join('     ');
  sketch._pushLine('  ' + focusLine);

  const portfolioTitle = ' BEAT / HANDLER PORTFOLIO ';
  const leftPadding = 24;
  const rightPadding = boxWidth - leftPadding - portfolioTitle.length;
  sketch.current.push('╠' + '═'.repeat(leftPadding) + portfolioTitle + '═'.repeat(Math.max(0, rightPadding)) + '╣');

  let tableHeader = '';
  TABLE_COLUMNS.forEach((col, idx) => {
    tableHeader += padString(col.header, col.width, col.align === 'right');
    if (idx < TABLE_COLUMNS.length - 1) tableHeader += ' '.repeat(COLUMN_SPACING[idx]);
  });
  sketch._pushLine(tableHeader);
  sketch._pushLine('─'.repeat(boxWidth - 1));

  (handlers || []).forEach((handler, idx) => {
    let row = '';
    TABLE_COLUMNS.forEach((col, colIdx) => {
      const value = col.getValue(handler);
      row += padString(value, col.width, col.align === 'right');
      if (colIdx < TABLE_COLUMNS.length - 1) row += ' '.repeat(COLUMN_SPACING[colIdx]);
    });
    sketch._pushLine(row);

    if (handler && (handler.baton === 'metrics' || handler.baton === 'dom' || handler.baton === 'payload')) {
      const nextHandler = (handlers || [])[idx + 1];
      if (nextHandler && nextHandler.baton !== handler.baton) {
        let batonDesc = '';
        if (handler.baton === 'metrics') batonDesc = 'handoff: template + CSS metrics';
        else if (handler.baton === 'dom') batonDesc = 'handoff: DOM + styling coverage';
        else if (handler.baton === 'payload') batonDesc = 'handoff: import + payload data';
        sketch._pushLine(`     🎭 Data Baton ▸ ${batonDesc}`);
      }
    }
  });

  const metricsTitle = ' HANDLER PORTFOLIO METRICS ';
  const metricsLeftPadding = 24;
  const metricsRightPadding = boxWidth - metricsLeftPadding - metricsTitle.length;
  sketch.current.push('╠' + '═'.repeat(metricsLeftPadding) + metricsTitle + '═'.repeat(Math.max(0, metricsRightPadding)) + '╣');

  const sizeLine = `Size Bands    : Tiny ${(metrics && metrics.sizeBands ? metrics.sizeBands.tiny : 0)} · Small ${(metrics && metrics.sizeBands ? metrics.sizeBands.small : 0)} · Medium ${(metrics && metrics.sizeBands ? metrics.sizeBands.medium : 0)} · Large ${(metrics && metrics.sizeBands ? metrics.sizeBands.large : 0)} · XL ${(metrics && metrics.sizeBands ? metrics.sizeBands.xl : 0)}`;
  sketch._pushLine(sizeLine);
  const covLine = `Coverage Dist.: 0–30% ${(metrics && metrics.coverageDist ? metrics.coverageDist.low : 0)} · 30–60% ${(metrics && metrics.coverageDist ? metrics.coverageDist.medLow : 0)} · 60–80% ${(metrics && metrics.coverageDist ? metrics.coverageDist.medHigh : 0)} · 80–100% ${(metrics && metrics.coverageDist ? metrics.coverageDist.high : 0)}`;
  sketch._pushLine(covLine);
  const riskLine = `Risk Summary  : CRITICAL ${(metrics && metrics.riskSummary ? metrics.riskSummary.critical : 0)} · HIGH ${(metrics && metrics.riskSummary ? metrics.riskSummary.high : 0)} · MEDIUM ${(metrics && metrics.riskSummary ? metrics.riskSummary.medium : 0)} · LOW ${(metrics && metrics.riskSummary ? metrics.riskSummary.low : 0)}`;
  sketch._pushLine(riskLine);

  sketch.current.push('╚' + '═'.repeat(boxWidth) + '╝');
  return sketch.current.join('\n');
}

// ===== ASCII SKETCH BUILDER =====

class AsciiSketcher {
  constructor(options = {}) {
    this.boxWidth = options.boxWidth || 80;
    this.pages = [];
    this.current = [];
    this.pageTitle = '';
  }

  setWidth(w) {
    this.boxWidth = Math.max(20, Math.floor(w));
  }

  newPage(title = '') {
    if (this.current.length) {
      this.pages.push(this.current.join('\n'));
    }
    this.current = [];
    this.pageTitle = title;
    this._pushTopBorder();
    if (title) {
      this._pushLine(` ${title.toUpperCase()}`);
      this._pushSeparator();
    }
  }

  build() {
    if (this.current.length) this.pages.push(this.current.join('\n'));
    const doc = this.pages.join('\n\n');
    this.pages = [];
    this.current = [];
    this.pageTitle = '';
    return doc;
  }

  addCard(title, lines = [], opts = {}) {
    const innerWidth = Math.min(this.boxWidth, opts.width || this.boxWidth);
    const box = [];
    box.push('╔' + '═'.repeat(innerWidth) + '╗');
    box.push(`║ ${padString(title, innerWidth - 1)}║`);
    box.push('╠' + '═'.repeat(innerWidth) + '╣');
    lines.forEach(line => {
      const parts = String(line).split('\n');
      parts.forEach(p => box.push(`║ ${padString(p, innerWidth - 1)}║`));
    });
    box.push('╚' + '═'.repeat(innerWidth) + '╝');
    this.current.push(box.join('\n'));
  }

  addSummary(kv = {}, opts = {}) {
    const innerWidth = Math.min(this.boxWidth, opts.width || this.boxWidth);
    const lines = Object.keys(kv).map(k => `${k}: ${kv[k]}`);
    this.addCard(opts.title || 'SUMMARY', lines, { width: innerWidth });
  }

  addTable(columns, rows, opts = {}) {
    const colCount = columns.length;
    const normalizedRows = rows.map(r => Array.isArray(r) ? r.map(c => String(c)) : columns.map(c => String(r[c.key] != null ? r[c.key] : '')));
    const natural = columns.map((col, i) => {
      const headerLen = String(col.header || '').length;
      const maxCell = Math.max(...normalizedRows.map(r => String(r[i] || '').length), 0);
      const specified = col.width ? Number(col.width) : 0;
      return Math.max(headerLen, maxCell, specified);
    });
    const spacingTotal = (colCount - 1) * (opts.colSpacing || 1);
    const contentTotal = natural.reduce((s, v) => s + v, 0) + spacingTotal;
    const available = Math.max(10, this.boxWidth - 4);
    let widths = [...natural];
    if (contentTotal > available) {
      const scale = available / contentTotal;
      widths = widths.map(w => Math.max(1, Math.floor(w * scale)));
    }
    const used = widths.reduce((s, v) => s + v, 0) + spacingTotal;
    if (used < available) widths[widths.length - 1] += (available - used);
    const innerWidth = Math.min(this.boxWidth, available);
    const box = [];
    box.push('╔' + '═'.repeat(innerWidth) + '╗');
    const headerLine = columns.map((col, i) => padString(String(col.header || ''), widths[i], col.align === 'right')).join(' '.repeat(opts.colSpacing || 1));
    box.push(`║ ${padString(headerLine, innerWidth - 1)}║`);
    box.push('╠' + '═'.repeat(innerWidth) + '╣');
    normalizedRows.forEach(row => {
      const cells = row.map((cell, i) => padString(String(cell || ''), widths[i], columns[i].align === 'right'));
      const line = cells.join(' '.repeat(opts.colSpacing || 1));
      box.push(`║ ${padString(line, innerWidth - 1)}║`);
    });
    box.push('╚' + '═'.repeat(innerWidth) + '╝');
    this.current.push(box.join('\n'));
  }

  _pushTopBorder() { this.current.push('╔' + '═'.repeat(this.boxWidth) + '╗'); }
  _pushSeparator() { this.current.push('╠' + '═'.repeat(this.boxWidth) + '╣'); }
  _pushLine(content) { this.current.push(`║ ${padString(content, this.boxWidth - 1)}║`); }
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
  renderCleanSymphonyHandler,
  AsciiSketcher
};
