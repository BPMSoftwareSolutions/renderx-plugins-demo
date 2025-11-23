#!/usr/bin/env node
/**
 * project-help.js
 * Interactive structural discovery.
 * Commands:
 *   list-roles
 *   explain <path>
 *   show-boundaries
 */
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const ROLES_PATH = path.join(ROOT, 'PROJECT_ROLES.json');
const BOUNDARIES_PATH = path.join(ROOT, 'PROJECT_BOUNDARIES.json');
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

function listRoles(){
  const roles = load(ROLES_PATH).roles;
  console.log('Roles:');
  for(const [role, globs] of Object.entries(roles)){
    console.log(`- ${role} -> ${globs.join(', ')}`);
  }
}

function explain(target){
  const rel = toPosix(path.relative(ROOT, path.resolve(ROOT, target)));
  const roles = load(ROLES_PATH).roles;
  const tags = load(TAGS_PATH).tags;
  const matchedRoles = Object.entries(roles).filter(([,globs])=>matchesAny(rel, globs)).map(([r])=>r);
  const matchedTags = Object.entries(tags).filter(([,globs])=>matchesAny(rel, globs)).map(([t])=>t);
  console.log(JSON.stringify({ path: rel, roles: matchedRoles, tags: matchedTags }, null, 2));
}

function showBoundaries(){
  const boundaries = load(BOUNDARIES_PATH);
  console.log('Allowed top-level directories:', boundaries.join(', '));
}

function usage(){
  console.log('Usage: node scripts/project-help.js <command> [args]');
}

function main(){
  const [,,cmd, arg] = process.argv;
  if(!cmd){ usage(); process.exit(1); }
  switch(cmd){
    case 'list-roles': return listRoles();
    case 'explain': if(!arg){ console.error('Missing path'); process.exit(2);} return explain(arg);
    case 'show-boundaries': return showBoundaries();
    default: usage(); process.exit(1);
  }
}

if (process.argv[1].endsWith('project-help.js')) main();
