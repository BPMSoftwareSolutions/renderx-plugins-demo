#!/usr/bin/env node
// CommonJS fallback generator for Orchestration Audit Session Context Documentation
const fs = require('fs');
const path = require('path');

const CONTEXT_JSON = path.join(__dirname, '..', '.generated', 'context-tree-orchestration-audit-session.json');
const OUTPUT_DIR = path.join(__dirname, '..', 'docs', 'generated');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'orchestration-audit-session-context.md');

function loadJson(p){ return JSON.parse(fs.readFileSync(p,'utf-8')); }
function ensureDir(d){ if(!fs.existsSync(d)) fs.mkdirSync(d,{recursive:true}); }
const section = t => `## ${t}\n\n`;
const bullet = items => items.map(i=>`- ${i}`).join('\n') + '\n\n';

function renderPhases(workCompleted){
  const phases = Object.entries(workCompleted||{}).map(([key,val])=>({key,...val})).sort((a,b)=>a.key.localeCompare(b.key));
  let md = section('Phases');
  md += '| Phase | Name | Status | Key Tasks |\n|-------|------|--------|-----------|\n';
  for(const p of phases){ const tasks = Array.isArray(p.tasks)? p.tasks.slice(0,4).join('; '):''; md+=`| ${p.key} | ${p.name} | ${p.status} | ${tasks} |\n`; }
  md+='\n';
  return md;
}
function renderArtifacts(data){
  if(!data.artifacts) return '';
  const a = data.artifacts;
  let md = section('Artifacts');
  if(a.sourceOfTruth){ md+='Source of Truth:\n\n'; for(const s of a.sourceOfTruth){ md+=`- ${s.file} (${s.type}) — ${s.description} (domains: ${s.domains})\n`; } md+='\n'; }
  if(a.generationScripts){ md+='Generation Scripts:\n\n'; for(const s of a.generationScripts){ md+=`- ${s.file} (${s.role}) — ${s.description||''}`; if(s.features) md+=`\n  Features: ${s.features.join(', ')}`; if(s.pipelineIntegration) md+=`\n  Pipeline: ${s.pipelineIntegration}`; md+='\n'; } md+='\n'; }
  if(a.generatedDocumentation){ md+='Documentation:\n\n'; for(const s of a.generatedDocumentation){ md+=`- ${s.file} (${s.type}) — ${s.description||''}\n`; } md+='\n'; }
  if(a.generatedDiagrams){ md+='Diagrams:\n\n'; for(const s of a.generatedDiagrams){ md+=`- ${s.file} (${s.type}) — ${s.description||''}\n`; } md+='\n'; }
  return md;
}
function renderIntegrity(data){ if(!data.integrity) return ''; let md=section('Integrity'); md+='| Field | Value |\n|-------|-------|\n'; for(const [k,v] of Object.entries(data.integrity)) md+=`| ${k} | ${v} |\n`; md+='\n'; return md; }
function renderDomainsSummary(data){ const dom=data.orchestrationDomains; if(!dom) return ''; let md=section('Domains Summary'); md+=`Total Domains: ${dom.total}\n\nPlugin Categories:\n\n`+bullet(dom.pluginSequences?.categories||[])+ 'Orchestration Sequences:\n\n'+bullet(dom.orchestrationSequences?.sequences||[]); return md; }
function renderAuditResults(data){ const a=data.auditResults; if(!a) return ''; let md=section('Audit Results'); md+='| Metric | Value |\n|--------|-------|\n'; for(const [k,v] of Object.entries(a)) if(typeof v!=='object') md+=`| ${k} | ${v} |\n`; md+='\nStatus: '+a.status+'\n\n'; return md; }
function renderKeyInsights(data){ if(!data.keyInsights) return ''; return section('Key Insights')+bullet(data.keyInsights); }
function renderTraceability(data){ const t=data.traceability; if(!t) return ''; let md=section('Traceability'); md+=`Files Created: ${t.filesCreated} | Modified: ${t.filesModified} | Deleted: ${t.filesDeleted}\n\nModified In Session:\n\n`+bullet(t.filesModifiedInSession||[]); if(t.newScriptsCreated) md+='New Scripts:\n\n'+bullet(t.newScriptsCreated); if(t.functionsAdded) md+='Functions Added:\n\n'+bullet(t.functionsAdded); return md; }
function renderStrategy(data){ const s=data.strategyMapping; if(!s) return ''; let md=section('Strategy Mapping'); md+=`Root Goal: ${s.rootGoal}\n\nDomain Goal: ${s.domainGoal}\n\nCurrent Goal: ${s.currentGoal}\n\nCurrent Sub-Goal: ${s.currentSubGoal}\n\nRationale: ${s.rationale}\n\nApproach: ${s.approach}\n\nSuccess Criteria:\n\n`+bullet(s.successCriteria||[]); return md; }
function renderNextSteps(data){ const arr=data.nextSteps||[]; let md=section('Next Steps & Roadmap'); const completed=arr.filter(x=>x.startsWith('✅')); const future=arr.filter(x=>x.startsWith('FUTURE')); const pending=arr.filter(x=>x.startsWith('NEXT')); if(completed.length) md+='Completed:\n\n'+bullet(completed); if(pending.length) md+='Pending:\n\n'+bullet(pending); if(future.length) md+='Future:\n\n'+bullet(future); return md; }
function generateMarkdown(data){ let md='# Orchestration Audit Session Context\n\n**Generated from:** `.generated/context-tree-orchestration-audit-session.json`\n**Last Generated:** '+new Date().toISOString()+'\n**DO NOT EDIT — GENERATED**\n\n'; md+=section('Session Overview'); md+=`Title: ${data.sessionTitle}\n\nDescription: ${data.sessionDescription}\n\nSession Phase: ${data.sessionPhase}\nCoherence Score: ${data.coherenceScore}\n\nGoals:\n\n`+bullet([`Root: ${data.rootGoal}`,`Level 2: ${data.goalHierarchy?.level2_domainGoal}`,`Current: ${data.goalHierarchy?.level3_currentGoal}`,`Sub-Goal: ${data.goalHierarchy?.level4_subGoal}`]); md+=renderStrategy(data)+renderPhases(data.workCompleted)+renderArtifacts(data)+renderDomainsSummary(data)+renderAuditResults(data)+renderKeyInsights(data)+renderTraceability(data)+renderIntegrity(data)+renderNextSteps(data); md+=section('Governance'); if(data.governance) md+=bullet([`Evolution Phase: ${data.governance.evolutionPhase}`,`Telemetry Required: ${data.governance.telemetryRequired}`,`Contracts: ${(data.governance.contractsApply||[]).join(', ')}`]); md+=section('Boundaries'); if(data.contextLayers?.boundaries){ md+='In Scope:\n\n'+bullet(data.contextLayers.boundaries.inScope||[]); md+='Out of Scope:\n\n'+bullet(data.contextLayers.boundaries.outOfScope||[]);} md+='\n---\n\nGenerated automatically. JSON is the authority; this document is a reflection.\n'; return md; }
function main(){ console.log('📝 (CJS) Generating orchestration audit session context documentation...'); if(!fs.existsSync(CONTEXT_JSON)){ console.error('Source JSON not found:', CONTEXT_JSON); process.exit(1);} const data=loadJson(CONTEXT_JSON); ensureDir(OUTPUT_DIR); const md=generateMarkdown(data); fs.writeFileSync(OUTPUT_FILE,md,'utf-8'); console.log('✅ Generated:', path.relative(process.cwd(), OUTPUT_FILE)); }
if(require.main===module){ try{ main(); }catch(e){ console.error('❌ Generation failed',e); process.exit(1);} }
