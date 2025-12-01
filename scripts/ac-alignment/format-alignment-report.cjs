/**
 * Format a minimal AC alignment report from registry + suggestions.
 *
 * Usage:
 *   node scripts/ac-alignment/format-alignment-report.cjs --domain renderx-web-orchestration
 */
const fs = require('fs');
const path = require('path');

const DOMAIN =
  (process.argv.includes('--domain')
    ? process.argv[process.argv.indexOf('--domain') + 1]
    : null) || process.env.ANALYSIS_DOMAIN_ID || 'renderx-web-orchestration';

const ROOT = process.cwd();
const REG_FILE = path.join(ROOT, '.generated', 'acs', `${DOMAIN}.registry.json`);
const SUG_FILE = path.join(ROOT, '.generated', 'ac-alignment', 'suggestions.json');
const OUT_MD = path.join(ROOT, 'docs', 'generated', DOMAIN, 'ac-alignment-report.md');
const OUT_DIR = path.dirname(OUT_MD);

function ensureDir(p) { fs.mkdirSync(p, { recursive: true }); }

function readJson(p, fallback = null) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return fallback; }
}

function main() {
  const reg = readJson(REG_FILE, { items: [], acs: [], totalACs: 0, domainId: DOMAIN });
  const totalACs = reg.totalACs || (reg.items?.length || reg.acs?.length || 0);

  const sug = readJson(SUG_FILE, { suggestions: {} });
  const suggestionFiles = Object.keys(sug.suggestions || {});
  const uniqueACs = new Set();
  for (const file of suggestionFiles) {
    const arr = sug.suggestions[file] || [];
    for (const s of arr) if (s.acId) uniqueACs.add(s.acId);
  }
  const proposedCovered = uniqueACs.size;
  const proposedCoveragePct = totalACs ? Math.round((proposedCovered / totalACs) * 100) : 0;

  const lines = [];
  lines.push('# AC-to-Test Alignment Report');
  lines.push('');
  lines.push(`Domain: ${DOMAIN}`);
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push(`- Total ACs: ${totalACs}`);
  lines.push(`- Files with tag suggestions: ${suggestionFiles.length}`);
  lines.push(`- Proposed covered ACs: ${proposedCovered}`);
  lines.push(`- Proposed coverage (presence): ${proposedCoveragePct}%`);
  lines.push('');
  lines.push('## Details');
  lines.push('');
  if (suggestionFiles.length === 0) {
    lines.push('_No tag suggestions were generated. Consider adjusting the suggester roots or threshold._');
  } else {
    lines.push('Suggested tags by file:');
    lines.push('');
    for (const file of suggestionFiles) {
      const arr = sug.suggestions[file] || [];
      const top = arr.sort((a,b)=>b.score-a.score)[0];
      lines.push(`- ${file} → [${top.tag}] (score ${top.score})`);
    }
  }

  ensureDir(OUT_DIR);
  fs.writeFileSync(OUT_MD, lines.join('\n'), 'utf8');

  // Emit a tiny JSON summary for other tools
  const summary = {
    domainId: DOMAIN,
    totalACs,
    suggestionFiles: suggestionFiles.length,
    proposedCovered,
    proposedCoveragePct
  };
  const outJson = path.join(ROOT, '.generated', 'ac-alignment', 'summary.json');
  ensureDir(path.dirname(outJson));
  fs.writeFileSync(outJson, JSON.stringify(summary, null, 2), 'utf8');

  console.log(`[format-alignment-report] Wrote report → ${path.relative(ROOT, OUT_MD)}`);
  console.log(`[format-alignment-report] Wrote summary → ${path.relative(ROOT, outJson)}`);
}

main();
