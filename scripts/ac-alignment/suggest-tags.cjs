/**
 * Suggest AC/BEAT tags for tests by fuzzy-matching test titles to AC text.
 *
 * Usage:
 *   node scripts/ac-alignment/suggest-tags.cjs --domain renderx-web-orchestration
 */
const fs = require('fs');
const path = require('path');

const DOMAIN =
  (process.argv.includes('--domain')
    ? process.argv[process.argv.indexOf('--domain') + 1]
    : null) || process.env.ANALYSIS_DOMAIN_ID || 'renderx-web-orchestration';

const ROOT = process.cwd();
const REG_FILE = path.join(ROOT, '.generated', 'acs', `${DOMAIN}.registry.json`);
const OUT_DIR = path.join(ROOT, '.generated', 'ac-alignment');
const OUT_FILE = path.join(OUT_DIR, 'suggestions.json');
const rootsArg = process.argv.includes('--roots') ? process.argv[process.argv.indexOf('--roots') + 1] : '';
const USER_ROOTS = rootsArg ? rootsArg.split(',').map((p) => path.resolve(ROOT, p.trim())).filter(Boolean) : [];
const minScoreArg = process.argv.includes('--minScore') ? parseInt(process.argv[process.argv.indexOf('--minScore') + 1], 10) : NaN;
const MIN_SCORE = Number.isFinite(minScoreArg) ? minScoreArg : 1;

function ensureDir(p) { fs.mkdirSync(p, { recursive: true }); }

function* walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === 'node_modules' || e.name === '.generated') continue;
      yield* walk(full);
    } else if (e.isFile()) {
      if (/\.(spec|test)\.(t|j)sx?$/.test(e.name)) {
        yield full;
      }
    }
  }
}

function loadRegistry() {
  if (!fs.existsSync(REG_FILE)) {
    console.error(`[suggest-tags] Registry not found: ${path.relative(ROOT, REG_FILE)}. Run generate-ac-registry first.`);
    process.exit(1);
  }
  const json = JSON.parse(fs.readFileSync(REG_FILE, 'utf8'));
  return json.items || [];
}

function tokenize(s) {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9_\-\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length >= 4 && !STOP.has(t));
}

const STOP = new Set(['render', 'component', 'panel', 'class', 'value', 'data', 'json', 'then', 'when', 'given', 'with']);

function scoreMatch(titleTokens, acTokens) {
  let score = 0;
  const set = new Set(acTokens);
  for (const t of titleTokens) if (set.has(t)) score += 1;
  return score;
}

function extractTitles(content) {
  const titles = [];
  const rgx = /(describe|it|test)\s*\(\s*([`'\"])\s*([^'"`]*?)\s*\2/gm;
  let m;
  while ((m = rgx.exec(content))) {
    titles.push(m[3]);
  }
  return titles;
}

function main() {
  const items = loadRegistry();
  const acTokenCache = new Map();
  for (const it of items) {
    const tokens = tokenize([...(it.given||[]), ...(it.when||[]), ...(it.then||[]), ...(it.and||[])].join(' '));
    acTokenCache.set(it.acId, tokens);
  }

  const suggestions = {};
  const testRoots = USER_ROOTS.length ? USER_ROOTS : [path.join(ROOT, 'tests'), ROOT];

  for (const root of testRoots) {
    if (!fs.existsSync(root)) continue;
    for (const f of walk(root)) {
      const rel = path.relative(ROOT, f);
      const content = fs.readFileSync(f, 'utf8');
      const titles = extractTitles(content);
      if (!titles.length) continue;
      const titleTokens = tokenize(titles.join(' '));
      let best = null;
      for (const it of items) {
        const acTokens = acTokenCache.get(it.acId) || [];
        const s = scoreMatch(titleTokens, acTokens);
        if (!best || s > best.score) best = { item: it, score: s };
      }
      if (best && best.score >= MIN_SCORE) {
        const { item } = best;
        suggestions[rel] = suggestions[rel] || [];
        suggestions[rel].push({
          tag: `AC:${item.domainId}:${item.sequenceId}:${item.beatId}:${item.acIndex}`,
          acId: item.acId,
          score: best.score
        });
      }
    }
  }

  ensureDir(OUT_DIR);
  fs.writeFileSync(OUT_FILE, JSON.stringify({ domainId: DOMAIN, suggestions }, null, 2), 'utf8');
  console.log(`[suggest-tags] Wrote suggestions → ${path.relative(ROOT, OUT_FILE)} (files: ${Object.keys(suggestions).length})`);
}

main();
