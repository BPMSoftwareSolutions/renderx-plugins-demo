#!/usr/bin/env node
/**
 * Auto-generates SLO_DASHBOARD_TRACEABILITY_PLAN.md from SLO_DASHBOARD_TRACEABILITY_PLAN.json
 * Governance: JSON-first. DO NOT manually edit the markdown output.
 */

const fs = require('fs');
const path = require('path');

const JSON_PATH = path.resolve(__dirname, '../docs/governance/SLO_DASHBOARD_TRACEABILITY_PLAN.json');
const MD_PATH = path.resolve(__dirname, '../docs/governance/SLO_DASHBOARD_TRACEABILITY_PLAN.md');

function loadPlan() {
  if (!fs.existsSync(JSON_PATH)) {
    console.error('Plan JSON not found at', JSON_PATH);
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
}

function renderMarkdown(plan) {
  const { version, generatedDate, goals, principles, successMetrics, sprints, governanceHooks, demoCommands } = plan;

  const lines = [];
  lines.push('# SLO Dashboard RenderX-Web Traceability Integration Plan');
  lines.push('');
  lines.push(`Version: ${version}`);
  if (generatedDate) lines.push(`Generated: ${generatedDate}`);
  lines.push('');
  lines.push('<!-- AUTO-GENERATED: DO NOT EDIT DIRECTLY. Edit the JSON plan and rerun script. -->');
  lines.push('');
  if (goals && goals.length) {
    lines.push('## Goal');
    lines.push(goals.map(g => `- ${g}`).join('\n'));
    lines.push('');
  }
  if (principles && principles.length) {
    lines.push('## Guiding Principles');
    principles.forEach(p => lines.push(`- ${p}`));
    lines.push('');
  }
  if (successMetrics && successMetrics.length) {
    lines.push('## Success Metrics');
    lines.push('| Metric | Target | Description |');
    lines.push('|--------|--------|-------------|');
    successMetrics.forEach(m => {
      lines.push(`| ${m.metric} | ${m.target} | ${m.description} |`);
    });
    lines.push('');
  }
  if (sprints && sprints.length) {
    lines.push('## Sprint Breakdown');
    sprints.forEach(s => {
      lines.push(`### ${s.name} (${s.duration})`);
      if (s.objectives && s.objectives.length) {
        lines.push('Objectives:');
        s.objectives.forEach((o,i)=> lines.push(`${i+1}. ${o}`));
      }
      if (s.deliverables && s.deliverables.length) {
        lines.push('Deliverables: ' + s.deliverables.map(d=>`\`${d}\``).join(', '));
      }
      if (s.acceptance && s.acceptance.length) {
        lines.push('Acceptance: ' + s.acceptance.join('; '));
      }
      lines.push('');
    });
  }
  if (governanceHooks) {
    lines.push('## Governance Hooks');
    Object.entries(governanceHooks).forEach(([k,v]) => lines.push(`- ${k}: \`${v}\``));
    lines.push('');
  }
  if (demoCommands && demoCommands.length) {
    lines.push('## Initial Commands (Sprint 1 Demo)');
    lines.push('```powershell');
    demoCommands.forEach(c => lines.push(c));
    lines.push('```');
    lines.push('');
  }
  lines.push('---');
  lines.push('This markdown is generated. Update JSON and rerun script for changes.');
  lines.push('');

  return lines.join('\n');
}

function main() {
  const plan = loadPlan();
  const md = renderMarkdown(plan);
  fs.writeFileSync(MD_PATH, md, 'utf8');
  console.log('Generated markdown at', MD_PATH);
}

main();
