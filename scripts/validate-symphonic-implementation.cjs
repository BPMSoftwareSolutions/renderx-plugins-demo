#!/usr/bin/env node
/**
 * Symphonic Implementation Validator
 * Validates all orchestration domains against SYMPHONIC-IMPLEMENTATION-STANDARD.md ("The Bible").
 *
 * Checks:
 *  - DOMAIN_REGISTRY.json entry exists and has valid analysisConfig
 *  - analysisSourcePath exists and contains implementation code (.ts/.js/.cjs/.mjs)
 *  - Preferred structure: src/symphonies/<symphony>/ with *.stage-crew.ts handlers
 *  - Sequence JSON exists under packages/orchestration/json-sequences
 *  - Every beat defines a handler and that handler is implemented (exported function)
 *
 * Outputs:
 *  - Console summary (per domain PASS/FAIL with reasons)
 *  - JSON artifact: .generated/validation/symphonic-implementation-validation-<timestamp>.json
 *  - Markdown report: docs/generated/validation/SYMPHONIC_IMPLEMENTATION_AUDIT.md
 */

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const REGISTRY_FILE = path.join(ROOT, 'DOMAIN_REGISTRY.json');
const SEQ_DIR = path.join(ROOT, 'packages', 'orchestration', 'json-sequences');
const OUT_JSON_DIR = path.join(ROOT, '.generated', 'validation');
const OUT_MD_DIR = path.join(ROOT, 'docs', 'generated', 'validation');

const exts = ['.ts', '.tsx', '.js', '.jsx', '.cjs', '.mjs'];

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function readJson(p) {
  try {
    const txt = fs.readFileSync(p, 'utf8');
    return JSON.parse(txt);
  } catch (e) {
    return null;
  }
}

function listFilesRec(root, predicate) {
  const results = [];
  function walk(dir) {
    let entries = [];
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const ent of entries) {
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) walk(full);
      else if (ent.isFile()) {
        if (!predicate || predicate(full)) results.push(full);
      }
    }
  }
  walk(root);
  return results;
}

function hasImplementationCode(dir) {
  const files = listFilesRec(dir, (f) => exts.includes(path.extname(f)));
  return files.length > 0;
}

function findSymphoniesRoot(dir) {
  // Prefer src/symphonies, but allow symphonies at root
  const candidates = [path.join(dir, 'src', 'symphonies'), path.join(dir, 'symphonies')];
  for (const c of candidates) {
    if (fs.existsSync(c) && fs.statSync(c).isDirectory()) return c;
  }
  return null;
}

function collectExportedFunctions(files) {
  // Lightweight scan: look for `export const name =` or `exports.name =` or `export function name(`
  const exports = new Set();
  for (const f of files) {
    let txt = '';
    try { txt = fs.readFileSync(f, 'utf8'); } catch { continue; }
    const reConst = /export\s+const\s+(\w+)/g;
    const reFunc = /export\s+function\s+(\w+)/g;
    const reCommon = /exports\.(\w+)\s*=\s*/g;
    let m;
    while ((m = reConst.exec(txt))) exports.add(m[1]);
    while ((m = reFunc.exec(txt))) exports.add(m[1]);
    while ((m = reCommon.exec(txt))) exports.add(m[1]);
  }
  return exports;
}

function validateBeatHandlers(sequenceJson, implDir) {
  const beats = [];
  const issues = [];

  if (!sequenceJson || !Array.isArray(sequenceJson.movements)) {
    issues.push('Invalid sequence JSON: missing movements array');
    return { beats, issues, implemented: 0, total: 0 };
  }

  // Gather all implementation files under implDir
  const implFiles = implDir ? listFilesRec(implDir, (f) => exts.includes(path.extname(f))) : [];
  const exported = collectExportedFunctions(implFiles);

  let total = 0;
  let implemented = 0;

  for (const mov of sequenceJson.movements) {
    if (!mov || !Array.isArray(mov.beats)) continue;
    for (const beat of mov.beats) {
      total += 1;
      const handler = beat && beat.handler;
      const name = handler && (handler.name || handler.handlerName || handler.id);
      if (!name) {
        issues.push(`Beat '${beat?.id || beat?.name || 'unknown'}' missing handler name`);
        continue;
      }
      const ok = exported.has(name);
      beats.push({ id: beat.id || beat.name || `beat-${total}`, handlerName: name, implemented: ok });
      if (ok) implemented += 1;
      else issues.push(`Handler not implemented: '${name}'`);
    }
  }

  return { beats, issues, implemented, total };
}

function validateDomain(domain) {
  const problems = [];
  const notes = [];

  if (!domain || domain.domain_type !== 'orchestration') {
    return { status: 'skipped', problems: ['Not an orchestration domain'], notes, result: null };
  }

  const domainId = domain.domain_id || domain.id || 'unknown-domain';
  const analysisConfig = domain.analysisConfig || {};
  const analysisSourcePath = analysisConfig.analysisSourcePath ? path.join(ROOT, analysisConfig.analysisSourcePath) : null;
  const seqId = (domain.sequenceId || domainId).replace(/\s+/g, '-');

  // Sequence file heuristic: by convention: <domainId>-symphony.json
  let seqFile = null;
  // Prefer explicit sequence_files from registry when available
  const seqFiles = (domain.orchestration && Array.isArray(domain.orchestration.sequence_files)) ? domain.orchestration.sequence_files : null;
  if (seqFiles && seqFiles.length) {
    const candidate = path.join(ROOT, seqFiles[0]);
    if (fs.existsSync(candidate)) seqFile = candidate;
  }
  if (!seqFile) {
    const seqCandidates = [
      path.join(SEQ_DIR, `${domainId}-symphony.json`),
      path.join(SEQ_DIR, `${seqId}.json`),
    ];
    seqFile = seqCandidates.find((p) => fs.existsSync(p)) || null;
  }
  const seqJson = seqFile ? readJson(seqFile) : null;

  if (!analysisSourcePath) problems.push('Missing analysisSourcePath in analysisConfig');
  else if (!fs.existsSync(analysisSourcePath)) problems.push(`analysisSourcePath does not exist: ${analysisSourcePath}`);
  else if (!hasImplementationCode(analysisSourcePath)) problems.push(`analysisSourcePath contains no implementation code (*.ts/*.js): ${analysisSourcePath}`);
  else notes.push(`Implementation code found under: ${analysisSourcePath}`);

  if (!seqJson) {
    const tried = seqFiles && seqFiles.length ? [path.relative(ROOT, path.join(ROOT, seqFiles[0]))] : [
      path.relative(ROOT, path.join(SEQ_DIR, `${domainId}-symphony.json`)),
      path.relative(ROOT, path.join(SEQ_DIR, `${seqId}.json`)),
    ];
    problems.push(`Sequence JSON not found for domain '${domainId}' (checked: ${tried.join(', ')})`);
  }
  else notes.push(`Sequence JSON: ${path.relative(ROOT, seqFile)}`);

  const symRoot = analysisSourcePath ? findSymphoniesRoot(analysisSourcePath) : null;
  if (!symRoot) {
    problems.push('Symphonies folder not found (expected src/symphonies or symphonies)');
  } else {
    notes.push(`Symphonies root: ${path.relative(ROOT, symRoot)}`);
  }

  const beatCheck = validateBeatHandlers(seqJson, symRoot || analysisSourcePath);

  const passBible = problems.length === 0 && beatCheck.issues.length === 0 && beatCheck.total > 0 && beatCheck.implemented === beatCheck.total;
  const status = passBible ? 'pass' : 'fail';

  return {
    status,
    domainId,
    problems,
    notes,
    sequenceFile: seqFile ? path.relative(ROOT, seqFile) : null,
    analysisSourcePath: analysisSourcePath ? path.relative(ROOT, analysisSourcePath) : null,
    symphoniesRoot: symRoot ? path.relative(ROOT, symRoot) : null,
    beats: beatCheck.beats,
    beatSummary: { implemented: beatCheck.implemented, total: beatCheck.total },
    beatIssues: beatCheck.issues,
  };
}

function generateMarkdown(results) {
  const lines = [];
  lines.push('# Symphonic Implementation Audit');
  lines.push('');
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push('');
  const passCount = results.filter(r=>r.status==='pass').length;
  const failCount = results.filter(r=>r.status==='fail').length;
  const skipCount = results.filter(r=>r.status==='skipped').length;
  lines.push(`- Domains inspected: ${results.length}`);
  lines.push(`- Pass: ${passCount}`);
  lines.push(`- Fail: ${failCount}`);
  lines.push(`- Skipped: ${skipCount}`);
  lines.push('');
  for (const r of results) {
    lines.push(`## ${r.domainId} — ${r.status.toUpperCase()}`);
    if (r.analysisSourcePath) lines.push(`- analysisSourcePath: ${r.analysisSourcePath}`);
    if (r.symphoniesRoot) lines.push(`- symphoniesRoot: ${r.symphoniesRoot}`);
    if (r.sequenceFile) lines.push(`- sequenceFile: ${r.sequenceFile}`);
    if (r.beatSummary) lines.push(`- Beats implemented: ${r.beatSummary.implemented}/${r.beatSummary.total}`);
    if (r.notes && r.notes.length) {
      lines.push('- Notes:');
      for (const n of r.notes) lines.push(`  - ${n}`);
    }
    if (r.problems && r.problems.length) {
      lines.push('- Problems:');
      for (const p of r.problems) lines.push(`  - ${p}`);
    }
    if (r.beatIssues && r.beatIssues.length) {
      lines.push('- Beat Issues:');
      for (const p of r.beatIssues) lines.push(`  - ${p}`);
    }
    lines.push('');
  }
  return lines.join('\n');
}

function main() {
  console.log('╔════════════════════════════════════════════════════╗');
  console.log('║ SYMPHONIC IMPLEMENTATION VALIDATOR                ║');
  console.log('╚════════════════════════════════════════════════════╝');

  const registry = readJson(REGISTRY_FILE);
  if (!registry || (!Array.isArray(registry.domains) && typeof registry.domains !== 'object')) {
    console.error(`✖ Invalid DOMAIN_REGISTRY.json at ${REGISTRY_FILE}`);
    process.exitCode = 2;
    return;
  }

  const rawDomains = Array.isArray(registry.domains) ? registry.domains : Object.values(registry.domains);
  const orchestrationDomains = rawDomains.filter(d=>d && d.domain_type==='orchestration');
  const results = [];

  for (const d of orchestrationDomains) {
    const r = validateDomain(d);
    results.push(r);
    const tag = r.status === 'pass' ? '✓ PASS' : r.status === 'fail' ? '✖ FAIL' : '↷ SKIP';
    console.log(`${tag} — ${r.domainId}`);
    if (r.problems && r.problems.length) {
      for (const p of r.problems) console.log(`   • ${p}`);
    }
    if (r.beatIssues && r.beatIssues.length) {
      for (const p of r.beatIssues) console.log(`   • ${p}`);
    }
  }

  ensureDir(OUT_JSON_DIR);
  ensureDir(OUT_MD_DIR);
  const ts = new Date().toISOString().replace(/[:.]/g,'-');
  const outJson = path.join(OUT_JSON_DIR, `symphonic-implementation-validation-${ts}.json`);
  const outMd = path.join(OUT_MD_DIR, 'SYMPHONIC_IMPLEMENTATION_AUDIT.md');
  fs.writeFileSync(outJson, JSON.stringify({ generatedAt: new Date().toISOString(), results }, null, 2));
  fs.writeFileSync(outMd, generateMarkdown(results));
  console.log('');
  console.log(`✓ Saved JSON: ${path.relative(ROOT, outJson)}`);
  console.log(`✓ Saved Report: ${path.relative(ROOT, outMd)}`);
}

main();
