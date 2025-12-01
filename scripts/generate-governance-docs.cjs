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

function renderBddPipelineAnalysis(jsonPath){
  const doc = JSON.parse(fs.readFileSync(jsonPath,'utf8'));
  const jsonSourceRel = path.relative(process.cwd(), jsonPath).replace(/\\/g,'/');
  const hash = sha256(JSON.stringify(doc));
  const lines=[];
  
  lines.push('# BDD Pipeline Architecture & Orchestration Integration');
  lines.push('');
  lines.push(`Version: ${doc.version}`);
  lines.push(`Generated: ${doc.generatedAt}`);
  lines.push('');
  lines.push(`<!-- GOVERNANCE: AUTO-GENERATED source=${jsonSourceRel} hash=${hash} -->`);
  lines.push('');
  
  // Program Overview
  if(doc.program){
    lines.push('## Program Overview');
    lines.push(`**${doc.program.name}**`);
    lines.push('');
    lines.push(doc.program.goal);
    lines.push('');
    
    if(doc.program.principles && doc.program.principles.length){
      lines.push('### Principles');
      doc.program.principles.forEach(p=> lines.push(`- ${p}`));
      lines.push('');
    }
    
    if(doc.program.successMetrics){
      lines.push('### Success Metrics');
      lines.push('| Metric | Target | Description |');
      lines.push('|--------|--------|-------------|');
      Object.entries(doc.program.successMetrics).forEach(([k,v])=> {
        lines.push(`| ${k} | ${v.target} | ${v.description} |`);
      });
      lines.push('');
    }
  }
  
  // Architecture
  if(doc.architecture && doc.architecture.layers){
    lines.push('## Architecture');
    lines.push('');
    doc.architecture.layers.forEach(layer=>{
      lines.push(`### Layer: ${layer.name}`);
      lines.push(`*${layer.id}*`);
      lines.push('');
      if(layer.components && layer.components.length){
        layer.components.forEach(comp=>{
          lines.push(`- **${comp.name}**: ${comp.role}`);
          if(comp.path) lines.push(`  - Path: \`${comp.path}\``);
          if(comp.trigger) lines.push(`  - Trigger: \`${comp.trigger}\``);
          if(comp.interface) lines.push(`  - Interface: \`${comp.interface}\``);
        });
      }
      lines.push('');
    });
  }
  
  // Sprints
  if(doc.sprints && doc.sprints.length){
    lines.push('## Sprints');
    lines.push('');
    doc.sprints.forEach(sprint=>{
      lines.push(`### Sprint ${sprint.id}: ${sprint.name}`);
      lines.push(`**Status**: ${sprint.status} | **Duration**: ${sprint.durationWeeks}w`);
      lines.push('');
      if(sprint.objectives && sprint.objectives.length){
        lines.push('**Objectives**:');
        sprint.objectives.forEach(obj=> lines.push(`- ${obj}`));
        lines.push('');
      }
      // Prefer structured acceptance criteria if present; fallback to legacy
      const structured = sprint.acceptanceCriteriaStructured;
      if(Array.isArray(structured) && structured.length){
        lines.push('**Acceptance Criteria (Structured GWT)**:');
        structured.forEach(block=>{
          // Each block may contain given/when/then/and arrays; render compactly
          const parts = [];
          if(block.given) parts.push(`Given ${block.given.join(' & ')}`);
          if(block.when) parts.push(`When ${block.when.join(' & ')}`);
          if(block.then) parts.push(`Then ${block.then.join(' & ')}`);
          if(block.and) parts.push(`And ${block.and.join(' & ')}`);
          lines.push(`- ${parts.join(' | ')}`);
        });
        lines.push('');
      } else if(sprint.acceptanceCriteria && sprint.acceptanceCriteria.length){
        lines.push('**Acceptance Criteria (Legacy)**:');
        sprint.acceptanceCriteria.forEach(ac=> lines.push(`- ${ac}`));
        lines.push('');
      }
    });
  }
  
  // Key Insights
  if(doc.keyInsights && doc.keyInsights.length){
    lines.push('## Key Insights');
    doc.keyInsights.forEach(insight=> lines.push(`- ${insight}`));
    lines.push('');
  }
  
  lines.push('---');
  lines.push('This markdown is auto-generated from JSON. Do not edit directly.');
  lines.push('');
  
  return lines.join('\n');
}

function renderBddPipelineVisualArchitecture(jsonPath){
  const doc = JSON.parse(fs.readFileSync(jsonPath,'utf8'));
  const jsonSourceRel = path.relative(process.cwd(), jsonPath).replace(/\\/g,'/');
  const hash = sha256(JSON.stringify(doc));
  const lines=[];
  
  lines.push('# BDD Pipeline Visual Architecture & Integration Patterns');
  lines.push('');
  lines.push(`Version: ${doc.version}`);
  lines.push(`Generated: ${doc.generatedAt}`);
  lines.push('');
  lines.push(`<!-- GOVERNANCE: AUTO-GENERATED source=${jsonSourceRel} hash=${hash} -->`);
  lines.push('');
  
  // Overview
  if(doc.overview){
    lines.push('## Overview');
    lines.push(doc.overview.description);
    lines.push('');
    lines.push(`**Scope**: ${doc.overview.scope}`);
    lines.push('');
  }
  
  // Diagrams
  if(doc.architectureDiagrams && doc.architectureDiagrams.length){
    lines.push('## Architecture Diagrams');
    lines.push('');
    doc.architectureDiagrams.forEach(diagram=>{
      lines.push(`### ${diagram.name}`);
      lines.push(`*${diagram.description}*`);
      lines.push('');
      if(diagram.asciiDiagram){
        lines.push('```');
        lines.push(diagram.asciiDiagram);
        lines.push('```');
        lines.push('');
      }
    });
  }
  
  // Integration Patterns
  if(doc.integrationPatterns && doc.integrationPatterns.length){
    lines.push('## Integration Patterns');
    lines.push('');
    doc.integrationPatterns.forEach(pattern=>{
      lines.push(`### ${pattern.name}`);
      lines.push(pattern.description);
      lines.push('');
      if(pattern.trigger) lines.push(`**Trigger**: \`${pattern.trigger}\``);
      if(pattern.process && pattern.process.length){
        lines.push('**Process**:');
        pattern.process.forEach((step,i)=> lines.push(`${i+1}. ${step}`));
      }
      lines.push('');
    });
  }
  
  // Key Concepts
  if(doc.keyTechnicalConcepts && doc.keyTechnicalConcepts.length){
    lines.push('## Key Technical Concepts');
    lines.push('');
    doc.keyTechnicalConcepts.forEach(concept=>{
      lines.push(`- **${concept.concept}**: ${concept.explanation}`);
    });
    lines.push('');
  }
  
  lines.push('---');
  lines.push('This markdown is auto-generated from JSON. Do not edit directly.');
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
    } else if(entry.id === 'bdd-pipeline-analysis-md'){
      rendered = renderBddPipelineAnalysis(srcPath);
    } else if(entry.id === 'bdd-pipeline-visual-architecture-md'){
      rendered = renderBddPipelineVisualArchitecture(srcPath);
    } else {
      console.warn('Unknown generator id:', entry.id); continue;
    }
    fs.writeFileSync(outPath, rendered, 'utf8');
    results.push({ id: entry.id, output: outPath });
  }
  console.log('Generated governance docs:', results);
}

main();
