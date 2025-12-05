/**
 * Minimal standalone ASCII sketch renderer used to satisfy alignment tests.
 * This file provides `AsciiSketcher` and `renderCleanSymphonyHandler` exported for tests.
 */

function padString(s, width, right = false) {
  const str = String(s == null ? '' : s);
  if (str.length > width) return str.substring(0, width);
  return right ? str.padStart(width, ' ') : str.padEnd(width, ' ');
}

class AsciiSketcher {
  constructor(opts = {}) {
    this.boxWidth = Number(opts.boxWidth || opts.width || 72);
    this.current = [];
  }

  addCard(title, lines = [], opts = {}) {
    const innerWidth = Number(opts.width || this.boxWidth);
    const top = '?' + '?'.repeat(innerWidth) + '?';
    const divider = '?' + '?'.repeat(innerWidth) + '?';
    const bottom = '?' + '?'.repeat(innerWidth) + '?';

    this.current.push(top);
    this.current.push('? ' + padString(title || '', innerWidth - 1) + '?');
    this.current.push(divider);
    for (const l of lines) this.current.push('? ' + padString(l == null ? '' : String(l), innerWidth - 1) + '?');
    this.current.push(bottom);
  }

  addTable(columns = [], rows = [], opts = {}) {
    const innerWidth = Number(opts.width || this.boxWidth);
    const top = '?' + '?'.repeat(innerWidth) + '?';
    const divider = '?' + '?'.repeat(innerWidth) + '?';
    const bottom = '?' + '?'.repeat(innerWidth) + '?';

    this.current.push(top);
    const headers = columns.map(c => String(c.header || '')).join(' | ');
    this.current.push('? ' + padString(headers, innerWidth - 1) + '?');
    this.current.push(divider);
    for (const r of rows) this.current.push('? ' + padString(r.join(' | '), innerWidth - 1) + '?');
    this.current.push(bottom);
  }
}

function renderCleanSymphonyHandler(sample) {
  const boxWidth = 72;
  const sketch = new AsciiSketcher({ boxWidth });

  const title = 'HANDLER SYMPHONY: ' + (sample?.symphonyName || 'Unknown');
  const topLines = [];
  topLines.push(`Domain : ${sample?.domainId || ''}`);
  topLines.push(`Handlers: ${sample?.handlerCount || 0}  LOC: ${sample?.totalLoc || 0}  Coverage: ${Number(sample?.avgCoverage||0).toFixed(1)}%`);
  sketch.addCard(title, topLines, { width: boxWidth });

  // full-width divider
  sketch.current.push('?' + '?'.repeat(boxWidth) + '?');

  // portfolio title with left padding 24
  const portfolioTitle = ' BEAT / HANDLER PORTFOLIO ';
  const leftPad = 24;
  const rightPad = boxWidth - leftPad - portfolioTitle.length;
  sketch.current.push('?' + '?'.repeat(leftPad) + portfolioTitle + '?'.repeat(Math.max(0, rightPad)) + '?');

  // entries
  for (const h of (sample?.handlers || [])) {
    const entry = `${h.beat || ''} ${h.handler || ''}`.trim();
    sketch.current.push('? ' + padString(entry, boxWidth - 1) + '?');
  }

  // metrics divider with title
  const metricsTitle = ' HANDLER PORTFOLIO METRICS ';
  const mLeft = 24;
  const mRight = boxWidth - mLeft - metricsTitle.length;
  sketch.current.push('?' + '?'.repeat(mLeft) + metricsTitle + '?'.repeat(Math.max(0, mRight)) + '?');

  const totalFiles = sample?.metrics?.sizeBands ? Object.values(sample.metrics.sizeBands).reduce((s,v)=>s+v,0) : 0;
  sketch.current.push('? ' + padString(`Total Files: ${totalFiles}`, boxWidth - 1) + '?');
  sketch.current.push('? ' + padString(`Risk Summary: ${JSON.stringify(sample?.metrics?.riskSummary || {})}`, boxWidth - 1) + '?');

  sketch.current.push('?' + '?'.repeat(boxWidth) + '?');
  return sketch.current.join('\n');
}

module.exports = { AsciiSketcher, renderCleanSymphonyHandler };
