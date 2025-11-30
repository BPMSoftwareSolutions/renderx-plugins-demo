#!/usr/bin/env node

/**
 * Auto-Generate README.md - Domain Registry Section
 *
 * This script INSERTS/UPDATES the "Domain Registry Overview" section
 * in the existing README.md while preserving all other content.
 *
 * The section is inserted after "Related Resources" and before
 * "Governance Tooling Registry".
 *
 * Data sources:
 * - DOMAIN_REGISTRY.json (domain count, status, ownership)
 * - Latest code analysis reports from .generated/analysis/**
 *
 * Usage:
 *   node scripts/generate-readme.cjs
 *   npm run generate:readme
 */

const fs = require('fs');
const path = require('path');

const log = (msg, icon = '📝') => console.log(`${icon} ${msg}`);
const error = (msg) => console.error(`❌ ${msg}`);

// Marker comments for the auto-generated section
const START_MARKER = '<!-- AUTO-GENERATED:START - Do not modify this section manually -->';
const END_MARKER = '<!-- AUTO-GENERATED:END -->';

// Load registry
function loadRegistry() {
  const registryPath = path.join(process.cwd(), 'DOMAIN_REGISTRY.json');
  if (!fs.existsSync(registryPath)) {
    error('DOMAIN_REGISTRY.json not found');
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(registryPath, 'utf8'));
}

// Find latest analysis report for a domain
function findLatestAnalysis(domainId) {
  const analysisDir = path.join(process.cwd(), '.generated', 'analysis');

  // Check domain-specific directory first
  const domainDir = path.join(analysisDir, domainId);
  if (fs.existsSync(domainDir)) {
    const files = fs.readdirSync(domainDir)
      .filter(f => f.includes('rich-markdown') && f.endsWith('.md'))
      .sort()
      .reverse();

    if (files.length > 0) {
      return path.join(domainDir, files[0]);
    }
  }

  // Fallback to root analysis directory
  if (fs.existsSync(analysisDir)) {
    const files = fs.readdirSync(analysisDir)
      .filter(f => f.includes(domainId) && f.includes('rich-markdown') && f.endsWith('.md'))
      .sort()
      .reverse();

    if (files.length > 0) {
      return path.join(analysisDir, files[0]);
    }
  }

  return null;
}

// Extract metrics from analysis report
function extractMetrics(reportPath) {
  if (!reportPath || !fs.existsSync(reportPath)) {
    return null;
  }

  const content = fs.readFileSync(reportPath, 'utf8');
  const metrics = {
    conformity: null,
    coverage: null,
    maintainability: null,
    duplication: null,
    health: null,
    handlers: null,
    files: null,
    loc: null
  };

  // Extract conformity score
  const conformityMatch = content.match(/Conformity Score\s*\|\s*([\d.]+)%/);
  if (conformityMatch) metrics.conformity = parseFloat(conformityMatch[1]);

  // Extract test coverage
  const coverageMatch = content.match(/Test Coverage\s*\|\s*([\d.]+)%/);
  if (coverageMatch) metrics.coverage = parseFloat(coverageMatch[1]);

  // Extract maintainability
  const maintMatch = content.match(/Maintainability\s*\|\s*([\d.]+)/);
  if (maintMatch) metrics.maintainability = parseFloat(maintMatch[1]);

  // Extract duplication
  const dupMatch = content.match(/Code Duplication\s*\|\s*([\d.]+)%/);
  if (dupMatch) metrics.duplication = parseFloat(dupMatch[1]);

  // Extract overall health
  const healthMatch = content.match(/Overall Health:\s*(\w+)/);
  if (healthMatch) metrics.health = healthMatch[1];

  // Extract handler count
  const handlerMatch = content.match(/Handlers:\s*(\d+)/);
  if (handlerMatch) metrics.handlers = parseInt(handlerMatch[1]);

  // Extract file count
  const fileMatch = content.match(/Total Files:\s*(\d+)/);
  if (fileMatch) metrics.files = parseInt(fileMatch[1]);

  // Extract LOC
  const locMatch = content.match(/Total LOC:\s*(\d+)/);
  if (locMatch) metrics.loc = parseInt(locMatch[1]);

  return metrics;
}

// Generate domain summary
function generateDomainSummary(registry) {
  const domains = registry.domains || {};
  const entries = Object.entries(domains);

  const summary = {
    total: entries.length,
    active: 0,
    deprecated: 0,
    experimental: 0,
    byType: {},
    byOwnership: {},
    orchestration: [],
    capability: [],
    infrastructure: []
  };

  entries.forEach(([id, def]) => {
    // Count by status
    if (def.status === 'active') summary.active++;
    if (def.status === 'deprecated') summary.deprecated++;
    if (def.status === 'experimental') summary.experimental++;

    // Count by type
    const type = def.domain_type || 'unknown';
    summary.byType[type] = (summary.byType[type] || 0) + 1;

    // Count by ownership
    const owner = def.ownership || 'unknown';
    summary.byOwnership[owner] = (summary.byOwnership[owner] || 0) + 1;

    // Categorize - treat Platform-Infrastructure ownership as infrastructure
    const isInfrastructure = owner === 'Platform-Infrastructure' || type === 'infrastructure';

    if (type === 'orchestration') {
      summary.orchestration.push({ id, ...def });
    } else if (isInfrastructure) {
      summary.infrastructure.push({ id, ...def });
    } else if (type === 'capability') {
      summary.capability.push({ id, ...def });
    }
  });

  return summary;
}

// Generate the domain registry section content
function generateDomainRegistrySection(registry) {
  const summary = generateDomainSummary(registry);
  const generatedAt = new Date().toISOString();

  let section = `${START_MARKER}

## 📊 Domain Registry Overview

> **Auto-generated on ${generatedAt}**
> This section is automatically maintained. To update: \`npm run generate:readme\`

**Total Domains**: ${summary.total} (${summary.active} active, ${summary.deprecated} deprecated, ${summary.experimental} experimental)

### By Type
${Object.entries(summary.byType)
  .sort((a, b) => b[1] - a[1])
  .map(([type, count]) => `- **${type}**: ${count} domains`)
  .join('\n')}

### By Ownership
${Object.entries(summary.byOwnership)
  .sort((a, b) => b[1] - a[1])
  .map(([owner, count]) => `- **${owner}**: ${count} domains`)
  .join('\n')}

### 🎼 Key Orchestration Domains

${summary.orchestration.length > 0 ?
  summary.orchestration
    .filter(d => d.status === 'active' || d.status === 'experimental')
    .slice(0, 8) // Top 8
    .map(d => {
      const analysisPath = findLatestAnalysis(d.id);
      const metrics = extractMetrics(analysisPath);

      let metricsText = '';
      if (metrics && metrics.handlers) {
        const parts = [];
        if (metrics.handlers) parts.push(`${metrics.handlers} handlers`);
        if (metrics.coverage) parts.push(`${metrics.coverage}% coverage`);
        if (metrics.conformity) parts.push(`${metrics.conformity}% conformity`);
        metricsText = ` (${parts.join(', ')})`;
      }

      return `- **[${d.id}](${analysisPath ? path.relative(process.cwd(), analysisPath).replace(/\\/g, '/') : '#'})**${metricsText}${d.description ? `: ${d.description}` : ''}`;
    })
    .join('\n')
  : '_No orchestration domains found_'
}

${summary.orchestration.length > 8 ? `\n<details>\n<summary>View all ${summary.orchestration.length} orchestration domains</summary>\n\n${summary.orchestration.map(d => `- **${d.id}**: ${d.description || 'No description'}`).join('\n')}\n</details>\n` : ''}

### ⚙️ Infrastructure Domains

${summary.infrastructure.length > 0 ?
  summary.infrastructure
    .filter(d => d.status === 'active')
    .map(d => `- **${d.id}**: ${d.description || 'Core infrastructure component'}`)
    .join('\n')
  : '_No infrastructure domains found_'
}

### 🔧 Capability Domains

**${summary.capability.length} capability domains** providing UI features, plugin sequences, and user interactions.

${summary.capability.length > 5 ? `
<details>
<summary>View capability domains</summary>

Top capabilities:
${summary.capability.slice(0, 10).map(d => `- **${d.id}**: ${d.description || 'Feature capability'}`).join('\n')}

_...and ${summary.capability.length - 10} more_
</details>
` : summary.capability.map(d => `- **${d.id}**: ${d.description || 'Feature capability'}`).join('\n')}

### 📈 Analysis Status

- **${summary.orchestration.filter(d => d.analysisConfig).length}** orchestration domains have analysis configuration
- **Latest Validation**: ${registry.meta?.last_validation || 'Never'}
- **Analysis Reports**: [View all](.generated/analysis/)

${END_MARKER}`;

  return section;
}

// Update README with the new section
function updateReadme(registry) {
  const readmePath = path.join(process.cwd(), 'README.md');

  if (!fs.existsSync(readmePath)) {
    error('README.md not found');
    process.exit(1);
  }

  let readme = fs.readFileSync(readmePath, 'utf8');
  const newSection = generateDomainRegistrySection(registry);

  // Check if markers already exist
  if (readme.includes(START_MARKER) && readme.includes(END_MARKER)) {
    // Replace existing section
    const regex = new RegExp(`${START_MARKER}[\\s\\S]*?${END_MARKER}`, 'g');
    readme = readme.replace(regex, newSection);
    log('Updated existing Domain Registry Overview section');
  } else {
    // Insert new section after "Related Resources" and before "Governance Tooling Registry"
    const insertionPoint = readme.indexOf('## Governance Tooling Registry');

    if (insertionPoint === -1) {
      error('Could not find insertion point in README.md');
      error('Please ensure "## Governance Tooling Registry" section exists');
      process.exit(1);
    }

    readme = readme.slice(0, insertionPoint) + newSection + '\n\n' + readme.slice(insertionPoint);
    log('Inserted new Domain Registry Overview section');
  }

  fs.writeFileSync(readmePath, readme, 'utf8');
  return readmePath;
}

// Main function
function main() {
  log('Starting README Domain Registry section generation...');

  try {
    const registry = loadRegistry();
    log(`Loaded registry with ${Object.keys(registry.domains || {}).length} domains`);

    const readmePath = updateReadme(registry);
    log(`✅ README.md updated successfully at ${readmePath}`, '✅');

  } catch (err) {
    error(`Failed to update README: ${err.message}`);
    console.error(err);
    process.exit(1);
  }
}

main();
