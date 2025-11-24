#!/usr/bin/env node
/**
 * Unified governance documentation generator.
 * Reads docs/governance/generated-docs-manifest.json and regenerates listed markdown artifacts.
 * JSON-first enforcement: DO NOT manually edit generated markdown outputs.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const MANIFEST_PATH = path.resolve(__dirname, '../docs/governance/generated-docs-manifest.json');

function sha256(content){
  return crypto.createHash('sha256').update(content).digest('hex');
}

function loadManifest(){
  if(!fs.existsSync(MANIFEST_PATH)){
    console.error('Manifest not found:', MANIFEST_PATH); process.exit(1);
  }
  return JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
}

function renderSloTraceabilityPlan(jsonPath){
  const plan = JSON.parse(fs.readFileSync(jsonPath,'utf8'));
  const { version, generatedDate, goals, principles, successMetrics, sprints, governanceHooks, demoCommands } = plan;
  const jsonSourceRel = path.relative(process.cwd(), jsonPath).replace(/\\/g,'/');
  const hash = sha256(JSON.stringify(plan));
  const lines=[];
  lines.push('# SLO Dashboard RenderX-Web Traceability Integration Plan');
  lines.push('');
  lines.push(`Version: ${version}`);
  if(generatedDate) lines.push(`Generated: ${generatedDate}`);
  lines.push('');
  lines.push(`<!-- GOVERNANCE: AUTO-GENERATED source=${jsonSourceRel} hash=${hash} -->`);
  lines.push('');
  if(goals && goals.length){
    lines.push('## Goal');
    goals.forEach(g=> lines.push(`- ${g}`));
    lines.push('');
  }
  if(principles && principles.length){
    lines.push('## Guiding Principles');
    principles.forEach(p=> lines.push(`- ${p}`));
    lines.push('');
  }
  if(successMetrics && successMetrics.length){
    lines.push('## Success Metrics');
    lines.push('| Metric | Target | Description |');
    lines.push('|--------|--------|-------------|');
    successMetrics.forEach(m=> lines.push(`| ${m.metric} | ${m.target} | ${m.description} |`));
    lines.push('');
  }
  if(sprints && sprints.length){
    lines.push('## Sprint Breakdown');
    sprints.forEach(s=>{
      lines.push(`### ${s.name} (${s.duration})`);
      if(s.objectives && s.objectives.length){
        lines.push('Objectives:');
        s.objectives.forEach((o,i)=> lines.push(`${i+1}. ${o}`));
      }
      if(s.deliverables && s.deliverables.length){
        lines.push('Deliverables: ' + s.deliverables.map(d=>`\`${d}\``).join(', '));
      }
      if(s.acceptance && s.acceptance.length){
        lines.push('Acceptance: ' + s.acceptance.join('; '));
      }
      lines.push('');
    });
  }
  if(governanceHooks){
    lines.push('## Governance Hooks');
    Object.entries(governanceHooks).forEach(([k,v])=> lines.push(`- ${k}: \`${v}\``));
    lines.push('');
  }
  if(demoCommands && demoCommands.length){
    lines.push('## Initial Commands (Sprint 1 Demo)');
    lines.push('```powershell');
    demoCommands.forEach(c=> lines.push(c));
    lines.push('```');
    lines.push('');
  }
  lines.push('---');
  lines.push('This markdown is generated. Update JSON and rerun generator for changes.');
  lines.push('');
  return lines.join('\n');
}

function main(){
  const manifest = loadManifest();
  const results=[];
  for(const entry of manifest.generated){
    const srcPath = path.resolve(__dirname, '..', entry.source);
    const outPath = path.resolve(__dirname, '..', entry.output);
    if(!fs.existsSync(srcPath)){
      console.warn('Source missing, skipping:', srcPath); continue;
    }
    let rendered;
    if(entry.id === 'slo-traceability-plan-md'){
      rendered = renderSloTraceabilityPlan(srcPath);
    } else {
      console.warn('Unknown generator id:', entry.id); continue;
    }
    fs.writeFileSync(outPath, rendered, 'utf8');
    results.push({ id: entry.id, output: outPath });
  }
  console.log('Generated governance docs:', results);
}

main();
