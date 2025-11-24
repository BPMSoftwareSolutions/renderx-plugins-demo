#!/usr/bin/env node
/**
 * Generate Orchestration Audit Session Context Documentation (Markdown)
 *
 * Data-driven: Reads .generated/context-tree-orchestration-audit-session.json
 * and produces a single human-readable markdown reference summarizing
 * session metadata, architecture phases, artifacts, governance, integrity,
 * and forward roadmap.
 *
 * OUTPUT: docs/generated/orchestration-audit-session-context.md
 *
 * DO NOT EDIT the generated markdown manually; JSON is the authority.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONTEXT_JSON = path.join(__dirname, '..', '.generated', 'context-tree-orchestration-audit-session.json');
const OUTPUT_DIR = path.join(__dirname, '..', 'docs', 'generated');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'orchestration-audit-session-context.md');

function loadJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf-8'));
}

function ensureDir(d) {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
}

function section(title) {
  return `## ${title}\n\n`;
}

function bullet(items) {
  return items.map(i => `- ${i}`).join('\n') + '\n\n';
}

function renderPhases(workCompleted) {
  const phases = Object.entries(workCompleted)
    .map(([key, val]) => ({ key, ...val }));
  phases.sort((a,b) => a.key.localeCompare(b.key));
  let md = section('Phases');
  md += '| Phase | Name | Status | Key Tasks |\n|-------|------|--------|-----------|\n';
  phases.forEach(p => {
    const tasks = Array.isArray(p.tasks) ? p.tasks.slice(0,4).join('; ') : '';
    md += `| ${p.key} | ${p.name} | ${p.status} | ${tasks} |\n`;
  });
  md += '\n';
  return md;
}

function renderArtifacts(data) {
  let md = section('Artifacts');
  md += 'Source of Truth:\n\n';
  data.artifacts.sourceOfTruth.forEach(src => {
    md += `- ${src.file} (${src.type}) — ${src.description} (domains: ${src.domains})\n`;
  });
  md += '\nGeneration Scripts:\n\n';
  data.artifacts.generationScripts.forEach(s => {
    md += `- ${s.file} (${s.role}) — ${s.description || ''}`;
    if (s.features) md += `\n  Features: ${s.features.join(', ')}`;
    if (s.pipelineIntegration) md += `\n  Pipeline: ${s.pipelineIntegration}`;
    md += '\n';
  });
  md += '\nDocumentation:\n\n';
  data.artifacts.generatedDocumentation.forEach(doc => {
    md += `- ${doc.file} (${doc.type}) — ${doc.description || ''}\n`;
  });
  md += '\nDiagrams:\n\n';
  (data.artifacts.generatedDiagrams || []).forEach(diag => {
    md += `- ${diag.file} (${diag.type}) — ${diag.description || ''}\n`;
  });
  md += '\n';
  return md;
}

function renderIntegrity(data) {
  if (!data.integrity) return '';
  let md = section('Integrity');
  md += 'Embedded integrity block (hash-based anti-drift metadata).\n\n';
  md += '| Field | Value |\n|-------|-------|\n';
  Object.entries(data.integrity).forEach(([k,v]) => {
    md += `| ${k} | ${v} |\n`;
  });
  md += '\n';
  return md;
}

function renderStrategy(data) {
  if (!data.strategyMapping) return '';
  const s = data.strategyMapping;
  let md = section('Strategy Mapping');
  md += `Root Goal: ${s.rootGoal}\n\n`; 
  md += `Domain Goal: ${s.domainGoal}\n\n`; 
  md += `Current Goal: ${s.currentGoal}\n\n`; 
  md += `Current Sub-Goal: ${s.currentSubGoal}\n\n`; 
  md += `Rationale: ${s.rationale}\n\n`; 
  md += `Approach: ${s.approach}\n\n`; 
  md += 'Success Criteria:\n\n';
  md += bullet(s.successCriteria || []);
  return md;
}

function renderNextSteps(data) {
  if (!data.nextSteps) return '';
  let md = section('Next Steps & Roadmap');
  const completed = data.nextSteps.filter(x => x.startsWith('✅'));
  const future = data.nextSteps.filter(x => x.startsWith('FUTURE'));
  const pending = data.nextSteps.filter(x => x.startsWith('NEXT'));
  if (completed.length) { md += 'Completed:\n\n' + bullet(completed); }
  if (pending.length) { md += 'Pending:\n\n' + bullet(pending); }
  if (future.length) { md += 'Future:\n\n' + bullet(future); }
  return md;
}

function renderDomainsSummary(data) {
  const dom = data.orchestrationDomains;
  if (!dom) return '';
  let md = section('Domains Summary');
  md += `Total Domains: ${dom.total}\n\n`;
  md += 'Plugin Categories:\n\n';
  md += bullet(dom.pluginSequences?.categories || []);
  md += 'Orchestration Sequences:\n\n';
  md += bullet(dom.orchestrationSequences?.sequences || []);
  return md;
}

function renderKeyInsights(data) {
  if (!data.keyInsights) return '';
  let md = section('Key Insights');
  md += bullet(data.keyInsights);
  return md;
}

function renderAuditResults(data) {
  if (!data.auditResults) return '';
  const a = data.auditResults;
  let md = section('Audit Results');
  md += '| Metric | Value |\n|--------|-------|\n';
  Object.entries(a).forEach(([k,v]) => {
    if (typeof v !== 'object') md += `| ${k} | ${v} |\n`;
  });
  md += '\nStatus: ' + a.status + '\n\n';
  return md;
}

function renderTraceability(data) {
  if (!data.traceability) return '';
  const t = data.traceability;
  let md = section('Traceability');
  md += `Files Created: ${t.filesCreated} | Modified: ${t.filesModified} | Deleted: ${t.filesDeleted}\n\n`;
  md += 'Modified In Session:\n\n';
  md += bullet(t.filesModifiedInSession || []);
  if (t.newScriptsCreated) {
    md += 'New Scripts:\n\n' + bullet(t.newScriptsCreated);
  }
  if (t.functionsAdded) {
    md += 'Functions Added:\n\n' + bullet(t.functionsAdded);
  }
  return md;
}

function generateMarkdown(data) {
  let md = '# Orchestration Audit Session Context\n\n';
  md += '**Generated from:** `.generated/context-tree-orchestration-audit-session.json`\n';
  md += `**Last Generated:** ${new Date().toISOString()}\n`;
  md += '**DO NOT EDIT — GENERATED**\n\n';

  md += section('Session Overview');
  md += `Title: ${data.sessionTitle}\n\nDescription: ${data.sessionDescription}\n\nSession Phase: ${data.sessionPhase}\nCoherence Score: ${data.coherenceScore}\n\n`;
  md += 'Goals:\n\n';
  md += bullet([
    `Root: ${data.rootGoal}`,
    `Level 2: ${data.goalHierarchy?.level2_domainGoal}`,
    `Current: ${data.goalHierarchy?.level3_currentGoal}`,
    `Sub-Goal: ${data.goalHierarchy?.level4_subGoal}`
  ]);

  md += renderStrategy(data);
  md += renderPhases(data.workCompleted || {});
  md += renderArtifacts(data);
  md += renderDomainsSummary(data);
  md += renderAuditResults(data);
  md += renderKeyInsights(data);
  md += renderTraceability(data);
  md += renderIntegrity(data);
  md += renderNextSteps(data);

  md += section('Governance');
  if (data.governance) {
    md += bullet([
      `Evolution Phase: ${data.governance.evolutionPhase}`,
      `Telemetry Required: ${data.governance.telemetryRequired}`,
      `Contracts: ${(data.governance.contractsApply || []).join(', ')}`
    ]);
  }

  md += section('Boundaries');
  if (data.contextLayers?.boundaries) {
    md += 'In Scope:\n\n' + bullet(data.contextLayers.boundaries.inScope || []);
    md += 'Out of Scope:\n\n' + bullet(data.contextLayers.boundaries.outOfScope || []);
  }

  md += '\n---\n\nGenerated automatically. JSON is the authority; this document is a reflection.\n';
  return md;
}

function main() {
  console.log('📝 Generating orchestration audit session context documentation...');
  if (!fs.existsSync(CONTEXT_JSON)) {
    console.error('Source JSON not found:', CONTEXT_JSON);
    process.exit(1);
  }
  const data = loadJson(CONTEXT_JSON);
  ensureDir(OUTPUT_DIR);
  const md = generateMarkdown(data);
  fs.writeFileSync(OUTPUT_FILE, md, 'utf-8');
  console.log('✅ Generated:', path.relative(process.cwd(), OUTPUT_FILE));
  console.log('📍 Source:', path.relative(process.cwd(), CONTEXT_JSON));
  console.log('✨ Done');
}

if (import.meta.url === `file://${__filename}`) {
  try { main(); } catch (e) { console.error('❌ Generation failed', e); process.exit(1); }
}
