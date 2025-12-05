/**
 * Apply suggested AC/BEAT tags to test titles. Defaults to dry-run producing patch files.
 *
 * Usage:
 *   node scripts/ac-alignment/apply-tags.cjs                 # dry-run (writes .diff files)
 *   node scripts/ac-alignment/apply-tags.cjs --write         # applies in-place edits
 */
const fs = require('fs');
const path = require('path');

const WRITE = process.argv.includes('--write');
const ROOT = process.cwd();
const SUG_FILE = path.join(ROOT, '.generated', 'ac-alignment', 'suggestions.json');
const PATCH_DIR = path.join(ROOT, '.generated', 'ac-alignment', 'patches');

function ensureDir(p) { fs.mkdirSync(p, { recursive: true }); }

function applyToContent(content, tag) {
  // Insert tag at start of first title literal if not already present
  if (content.includes(`[${tag}]`)) return { changed: false, result: content };

  const rgx = /(\b(?:describe|it|test)\s*\(\s*)([`'\"])([^\2]*?)(\2)/m;
  const m = rgx.exec(content);
  if (!m) return { changed: false, result: content };
  const [full, head, quote, title, tailQuote] = m;
  const tagged = `${head}${quote}[${tag}] ${title}${tailQuote}`;
  const result = content.replace(full, tagged);
  return { changed: result !== content, result };
}

function unifiedDiff(oldStr, newStr, filePath) {
  // Minimal unified diff for review; not intended for patch program consumption
  const oldLines = oldStr.split(/\r?\n/);
  const newLines = newStr.split(/\r?\n/);
  const max = Math.max(oldLines.length, newLines.length);
  const lines = [
    `--- a/${filePath}`,
    `+++ b/${filePath}`
  ];
  for (let i = 0; i < max; i++) {
    const a = oldLines[i] ?? '';
    const b = newLines[i] ?? '';
    if (a !== b) {
      lines.push(`- ${a}`);
      lines.push(`+ ${b}`);
    }
  }
  return lines.join('\n');
}

function main() {
  if (!fs.existsSync(SUG_FILE)) {
    console.error(`[apply-tags] Suggestions not found: ${path.relative(ROOT, SUG_FILE)}. Run suggest-tags first.`);
    process.exit(1);
  }
  const suggestions = JSON.parse(fs.readFileSync(SUG_FILE, 'utf8')).suggestions || {};
  const files = Object.keys(suggestions);
  if (!files.length) {
    console.log('[apply-tags] No suggestions to apply.');
    return;
  }
  let changedCount = 0;
  ensureDir(PATCH_DIR);

  for (const rel of files) {
    const tags = suggestions[rel];
    if (!Array.isArray(tags) || !tags.length) continue;
    const best = tags.sort((a, b) => b.score - a.score)[0];
    const tag = best.tag;
    const abs = path.join(ROOT, rel);
    if (!fs.existsSync(abs)) continue;
    const oldContent = fs.readFileSync(abs, 'utf8');
    const { changed, result } = applyToContent(oldContent, tag);
    if (!changed) continue;
    if (WRITE) {
      fs.writeFileSync(abs, result, 'utf8');
    } else {
      const diff = unifiedDiff(oldContent, result, rel.replace(/\\/g, '/'));
      const patchPath = path.join(PATCH_DIR, rel.replace(/[\\/:]/g, '__') + '.diff');
      ensureDir(path.dirname(patchPath));
      fs.writeFileSync(patchPath, diff, 'utf8');
    }
    changedCount++;
  }

  if (WRITE) {
    console.log(`[apply-tags] Applied tags to ${changedCount} file(s).`);
  } else {
    console.log(`[apply-tags] Dry-run complete. Wrote ${changedCount} patch file(s) → ${path.relative(ROOT, PATCH_DIR)}`);
  }
}

main();
