#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, '.generated');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const extsTs = new Set(['.ts', '.tsx', '.js', '.jsx', '.cjs', '.mjs', '.mts']);
const extsRegex = new Set(['.cs']);
const ignoredDirs = new Set(['node_modules', '.git', 'dist', 'build', '.vscode', '.generated']);

const report = { scannedFiles: 0, findings: [] };

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    if (ignoredDirs.has(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full);
    else {
      const ext = path.extname(e.name).toLowerCase();
      if (extsTs.has(ext) || extsRegex.has(ext)) {
        analyzeFile(full, ext);
      }
    }
  }
}

function analyzeFile(filePath, ext) {
  report.scannedFiles++;
  try {
    const src = fs.readFileSync(filePath, 'utf8');
    if (extsTs.has(ext)) return analyzeWithTypescript(filePath, src);
    if (extsRegex.has(ext)) return analyzeWithRegex(filePath, src);
  } catch (err) {
    // ignore unreadable files
  }
}

function analyzeWithTypescript(filePath, src) {
  const sf = ts.createSourceFile(filePath, src, ts.ScriptTarget.Latest, true);
  function visit(node) {
    try {
      if (node.kind === ts.SyntaxKind.StringLiteral || node.kind === ts.SyntaxKind.NoSubstitutionTemplateLiteral) {
        const parent = node.parent || {};
        if (parent.kind === ts.SyntaxKind.ImportDeclaration || parent.kind === ts.SyntaxKind.ExportDeclaration) return;
        if (parent.kind === ts.SyntaxKind.CallExpression) {
          const callExpr = parent;
          const exprText = callExpr.expression && callExpr.expression.getText && callExpr.expression.getText(sf);
          if (exprText === 'require' || exprText === 'define' || exprText === 'import') return;
        }
        const { line, character } = sf.getLineAndCharacterOfPosition(node.getStart(sf));
        report.findings.push({
          file: path.relative(ROOT, filePath),
          line: line + 1,
          column: character + 1,
          kind: 'string',
          text: node.text
        });
      } else if (node.kind === ts.SyntaxKind.NumericLiteral) {
        const { line, character } = sf.getLineAndCharacterOfPosition(node.getStart(sf));
        report.findings.push({
          file: path.relative(ROOT, filePath),
          line: line + 1,
          column: character + 1,
          kind: 'number',
          text: node.getText(sf)
        });
      }
    } catch (e) {
      // swallow per-node errors
    }
    ts.forEachChild(node, visit);
  }
  visit(sf);
}

function analyzeWithRegex(filePath, src) {
  const lines = src.split(/\r?\n/);
  const stringRegex = /"([^"\\]|\\.)*"/g;
  const numberRegex = /\b\d+(?:\.\d+)?\b/g;
  lines.forEach((line, idx) => {
    let m;
    while ((m = stringRegex.exec(line))) {
      report.findings.push({ file: path.relative(ROOT, filePath), line: idx + 1, column: m.index + 1, kind: 'string', text: m[0] });
    }
    while ((m = numberRegex.exec(line))) {
      report.findings.push({ file: path.relative(ROOT, filePath), line: idx + 1, column: m.index + 1, kind: 'number', text: m[0] });
    }
  });
}

// run
console.log('Starting hard-coded values audit...');
walk(ROOT);
const outPath = path.join(OUT_DIR, 'hardcoded-values-report.json');
fs.writeFileSync(outPath, JSON.stringify(report, null, 2), 'utf8');
console.log(`Scan complete. Files scanned: ${report.scannedFiles}. Findings: ${report.findings.length}.`);
console.log(`Report written to ${path.relative(ROOT, outPath)}`);

if (report.findings.length > 0) process.exitCode = 0;
