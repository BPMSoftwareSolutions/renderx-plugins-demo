#!/usr/bin/env node
/**
 * Audit coverage of user stories across JSON sequences.
 * Reports per domain: files with matching symphony stories, missing stories, and beat handler matches.
 */

const fs = require('fs');
const path = require('path');

const workspaceRoot = path.resolve(__dirname, '..');

function readStories(domain) {
  const p = path.join(workspaceRoot, 'packages', domain, 'stories.txt');
  if (!fs.existsSync(p)) return null;
  const text = fs.readFileSync(p, 'utf8');
  const lines = text.split(/\r?\n/);
  const result = {};
  let current = null;
  for (let raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const sect = line.match(/^\[symphony:([^\]]+)\]/i);
    if (sect) { current = sect[1].trim(); result[current] = { beats: {} }; continue; }
    if (!current) continue;
    const kv = line.match(/^([a-zA-Z]+):\s*(.*)$/);
    if (kv) {
      const key = kv[1];
      const value = kv[2];
      if (key === 'role' || key === 'movementStory') { result[current][key] = value; }
      else if (key === 'beat') {
        const bm = value.match(/^([^\s]+)\s*->\s*(.*)$/);
        if (bm) { result[current].beats[bm[1].trim()] = bm[2].trim(); }
      }
    }
  }
  return result;
}

function listDomains() {
  const packagesDir = path.join(workspaceRoot, 'packages');
  return fs.readdirSync(packagesDir).filter((d) => fs.statSync(path.join(packagesDir, d)).isDirectory());
}

function listJsonSequences(domain) {
  const dir = path.join(workspaceRoot, 'packages', domain, 'json-sequences');
  const files = [];
  function walk(p) {
    if (!fs.existsSync(p)) return;
    const entries = fs.readdirSync(p);
    for (const e of entries) {
      const full = path.join(p, e);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) walk(full);
      else if (stat.isFile() && e.endsWith('.json')) files.push(full);
    }
  }
  walk(dir);
  return files;
}

function getBeatsHandlers(file) {
  try {
    const obj = JSON.parse(fs.readFileSync(file, 'utf8'));
    const handlers = [];
    if (obj.movements) {
      for (const mv of obj.movements) {
        if (Array.isArray(mv.beats)) {
          for (const b of mv.beats) handlers.push(b.handler);
        }
      }
    }
    return handlers;
  } catch { return []; }
}

function auditDomain(domain) {
  const stories = readStories(domain) || {};
  const files = listJsonSequences(domain);
  const coverage = [];
  for (const f of files) {
    const base = path.basename(f).toLowerCase().replace(/\.json$/, '');
    const sym = stories[base];
    const handlers = getBeatsHandlers(f);
    const beatMatches = handlers.filter((h) => sym && sym.beats[h]);
    coverage.push({ file: f, symphonySection: !!sym, handlers, beatMatches });
  }
  return coverage;
}

function main() {
  const domains = listDomains();
  const report = {};
  for (const d of domains) {
    report[d] = auditDomain(d);
  }
  // Summarize
  const summary = {};
  for (const [d, cov] of Object.entries(report)) {
    const total = cov.length;
    const withSym = cov.filter((c) => c.symphonySection).length;
    const withBeatMatches = cov.filter((c) => c.beatMatches.length > 0).length;
    summary[d] = { total, withSym, withBeatMatches };
  }
  console.log(JSON.stringify({ summary, report }, null, 2));
}

if (require.main === module) main();
