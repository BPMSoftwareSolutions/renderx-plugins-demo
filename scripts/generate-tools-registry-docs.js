#!/usr/bin/env node
/**
 * Generates docs/governance/TOOLS_REGISTRY.md from the JSON registry.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const REGISTRY_PATH = path.join(ROOT, 'docs', 'governance', 'tools-registry.json');
const OUTPUT_PATH = path.join(ROOT, 'docs', 'governance', 'TOOLS_REGISTRY.md');

function loadRegistry() {
  if (!fs.existsSync(REGISTRY_PATH)) {
    throw new Error(`Registry not found at ${REGISTRY_PATH}`);
  }
  return JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf-8'));
}

function formatPrimaryCommand(tool) {
  if (tool.commands?.npmScript) {
    return `npm run ${tool.commands.npmScript}`;
  }
  if (tool.commands?.direct) {
    return tool.commands.direct;
  }
  return '—';
}

function formatOutputs(tool) {
  const outputs = tool.artifacts?.outputs ?? [];
  if (!outputs.length) {
    return '—';
  }
  return outputs.map((entry) => `\`${entry}\``).join('<br>');
}

function sortTools(tools = []) {
  return [...tools].sort((a, b) => {
    const orderA = Number.isFinite(a?.pipeline?.order) ? a.pipeline.order : Number.MAX_SAFE_INTEGER;
    const orderB = Number.isFinite(b?.pipeline?.order) ? b.pipeline.order : Number.MAX_SAFE_INTEGER;
    if (orderA !== orderB) {
      return orderA - orderB;
    }
    return a.id.localeCompare(b.id);
  });
}

function renderDomainSection(domainId, domainData) {
  const header = `### ${domainData.name} (\`${domainId}\`)`;
  const meta = [domainData.description || ''];
  if (domainData.owningTeam) {
    meta.push(`**Owning team:** ${domainData.owningTeam}`);
  }

  const rows = sortTools(domainData.tools).map((tool) => {
    const fileCell = `\`${tool.file}\``;
    const roleCell = tool.role || '—';
    const cmdCell = formatPrimaryCommand(tool);
    const stageCell = tool.pipeline?.stage ?? '—';
    const outputsCell = formatOutputs(tool);
    return `| \`${tool.id}\` | ${fileCell} | ${roleCell} | ${cmdCell} | ${stageCell} | ${outputsCell} |`;
  });

  const table = [
    '| ID | File | Role | Primary Command | Pipeline Stage | Primary Outputs |',
    '| --- | --- | --- | --- | --- | --- |',
    ...rows
  ].join('\n');

  return [header, meta.join('\n\n'), table].join('\n\n');
}

function buildMarkdown(registry) {
  const domains = Object.entries(registry.domains || {}).sort((a, b) => a[0].localeCompare(b[0]));
  const overview = domains
    .map(([domainId, domainData]) => `- **${domainId}** · ${domainData.name} · ${domainData.tools?.length ?? 0} tools`)
    .join('\n');

  const sections = domains
    .map(([domainId, domainData]) => renderDomainSection(domainId, domainData))
    .join('\n\n---\n\n');

  const parts = [
    '<!-- GOVERNANCE: AUTO-GENERATED source=docs/governance/tools-registry.json -->',
    '# Tools Registry',
    `**Version:** ${registry.version}  `,
    `**Generated:** ${new Date().toISOString()}`,
    '',
    '> DO NOT EDIT. Run `node scripts/generate-tools-registry-docs.js` after updating tools-registry.json.',
    '',
    '## Domain Overview',
    overview,
    '',
    '---',
    '',
    sections
  ];

  return parts.join('\n');
}

function main() {
  const registry = loadRegistry();
  const markdown = buildMarkdown(registry);
  fs.writeFileSync(OUTPUT_PATH, `${markdown}\n`, 'utf-8');
  console.log(`✅ Wrote ${OUTPUT_PATH}`);
}

main();
