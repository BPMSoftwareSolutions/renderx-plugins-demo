#!/usr/bin/env node
/**
 * import-policy-check.js
 * Enforces allowedImports graph in PROJECT_TAGS.json.
 */
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const TAGS_PATH = path.join(ROOT, 'PROJECT_TAGS.json');

function load(p){ return JSON.parse(fs.readFileSync(p,'utf-8')); }
function toPosix(p){ return p.replace(/\\/g,'/'); }
function globToRegex(glob){
  let re = glob.replace(/[.+^${}()|\\]/g,'\\$&');
  re = re.replace(/\*\*\//g,'(?:.+/)?');
  re = re.replace(/\*\*/g,'.+');
  re = re.replace(/\*/g,'[^/]*');
  return new RegExp('^' + re + '$');
}
function matchesAny(p, globs){ return globs.some(g=>globToRegex(g).test(p)); }
function walk(dir){
  let results = [];
  for(const entry of fs.readdirSync(dir)){
    if(entry === 'node_modules') continue;
    const full = path.join(dir, entry);
    const stat = fs.statSync(full);
    if(stat.isDirectory()) results = results.concat(walk(full));
    else if(/\.(ts|js|mjs|cjs)$/i.test(entry)) results.push(full);
  }
  return results;
}
function assignTags(rel, tags){
  return Object.entries(tags).filter(([,globs])=>matchesAny(rel, globs)).map(([t])=>t);
}

function parseImports(content){
  const lines = content.split(/\r?\n/);
  const imports = [];
  for(const l of lines){
    const m = l.match(/^\s*import[^'";]+['\"]([^'\"]+)['\"];?/);
    if(m) imports.push(m[1]);
  }
  return imports;
}

function resolveRelative(fromFile, imp){
  const base = path.dirname(fromFile);
  const target = path.resolve(base, imp);
  const candidates = [target, target + '.ts', target + '.js', target + '.mjs', target + '.cjs', path.join(target,'index.ts'), path.join(target,'index.js')];
  for(const c of candidates){ if(fs.existsSync(c) && fs.statSync(c).isFile()) return c; }
  return null;
}

function main(){
  const { tags, allowedImports } = load(TAGS_PATH);
  const files = walk(ROOT);
  const violations = [];
  for(const file of files){
    const rel = toPosix(path.relative(ROOT,file));
    const sourceTags = assignTags(rel, tags);
    if(!sourceTags.length) continue; // untagged skip
    const content = fs.readFileSync(file,'utf-8');
    const imports = parseImports(content);
    for(const imp of imports){
      if(!imp.startsWith('.') && !imp.startsWith('/')) continue; // external/module skip
      const resolved = resolveRelative(file, imp);
      if(!resolved) continue;
      const targetRel = toPosix(path.relative(ROOT, resolved));
      const targetTags = assignTags(targetRel, tags);
      for(const sTag of sourceTags){
        const allowed = allowedImports[sTag] || [];
        for(const tTag of targetTags){
          if(!allowed.includes(tTag)){
            violations.push({ sourceFile: rel, import: imp, sourceTag: sTag, targetTag: tTag, targetFile: targetRel });
          }
        }
      }
    }
  }
  if(violations.length){
    console.error('[import-policy-check] Violations:', JSON.stringify(violations,null,2));
    console.error(`[import-policy-check] Total: ${violations.length}`);
    process.exit(5);
  } else {
    console.log('[import-policy-check] OK');
  }
}

if (process.argv[1].endsWith('import-policy-check.js')) main();
