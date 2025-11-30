#!/usr/bin/env node
/**
 * Parse domain stories from plain text files and apply to JSON sequences.
 * Skips `create.json` (already updated).
 */

const fs = require('fs');
const path = require('path');

const workspaceRoot = path.resolve(__dirname, '..');

function findStoryFiles() {
  const packagesDir = path.join(workspaceRoot, 'packages');
  const domains = fs.readdirSync(packagesDir).filter((d) => {
    const full = path.join(packagesDir, d);
    return fs.statSync(full).isDirectory();
  });
  const files = [];
  for (const domain of domains) {
    const storyPath = path.join(packagesDir, domain, 'stories.txt');
    if (fs.existsSync(storyPath)) files.push({ domain, storyPath });
  }
  return files;
}

function parseStories(text) {
  // Simple INI-like sections: [symphony:<name>] then key: value; beat: <handler> -> story
  const lines = text.split(/\r?\n/);
  const result = {};
  let current = null;
  for (let raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const sect = line.match(/^\[symphony:([^\]]+)\]/i);
    if (sect) {
      current = sect[1].trim();
      if (!result[current]) result[current] = { role: null, movementStory: null, beats: {} };
      continue;
    }
    if (!current) continue;
    const kv = line.match(/^([a-zA-Z]+):\s*(.*)$/);
    if (kv) {
      const key = kv[1];
      const value = kv[2];
      if (key === 'role') {
        result[current].role = value;
      } else if (key === 'movementStory') {
        result[current].movementStory = value;
      } else if (key === 'beat') {
        const bm = value.match(/^([^\s]+)\s*->\s*(.*)$/);
        if (bm) {
          const handler = bm[1].trim();
          const story = bm[2].trim();
          result[current].beats[handler] = story;
        }
      }
    }
  }
  return result;
}

function findJsonSequences(domain) {
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

function loadJson(file) {
  const text = fs.readFileSync(file, 'utf8');
  return JSON.parse(text);
}

function saveJson(file, obj) {
  const text = JSON.stringify(obj, null, 2) + '\n';
  fs.writeFileSync(file, text, 'utf8');
}

function applyStoriesToFile(file, domainStories) {
  const base = path.basename(file).toLowerCase();
  if (base === 'create.json') return { skipped: true, reason: 'create.json already updated' };
  const symphonyKey = base.replace(/\.json$/, '');
  // Map file names like `import.json` -> section `import`
  const stories = domainStories[symphonyKey];
  if (!stories) return { skipped: true, reason: 'no stories for symphony ' + symphonyKey };

  const obj = loadJson(file);

  // Apply movement-level userStory & persona if provided
  if (obj.movements && Array.isArray(obj.movements)) {
    for (const mv of obj.movements) {
      if (stories.movementStory) mv.userStory = stories.movementStory;
      if (stories.role) mv.persona = stories.role;
      // Apply beat-level stories by matching handler names
      if (Array.isArray(mv.beats)) {
        for (const beat of mv.beats) {
          const handler = beat.handler || '';
          const bStory = stories.beats[handler];
          if (bStory) beat.userStory = bStory;
        }
      }
    }
  }
  // Apply root-level userStory/persona mirroring movement if present
  if (stories.movementStory) obj.userStory = stories.movementStory;
  if (stories.role) obj.persona = stories.role;

  saveJson(file, obj);
  return { updated: true };
}

function main() {
  const storyFiles = findStoryFiles();
  let updated = 0, skipped = 0;
  for (const { domain, storyPath } of storyFiles) {
    const text = fs.readFileSync(storyPath, 'utf8');
    const stories = parseStories(text);
    const seqFiles = findJsonSequences(domain);
    for (const f of seqFiles) {
      const res = applyStoriesToFile(f, stories);
      if (res.updated) updated++;
      else skipped++;
    }
  }
  console.log(JSON.stringify({ updated, skipped }, null, 2));
}

if (require.main === module) {
  try { main(); }
  catch (err) {
    console.error('apply-user-stories failed:', err);
    process.exit(1);
  }
}
