#!/usr/bin/env node

/**
 * Auto-Generate README.md - Fully Data-Driven
 *
 * This script generates the ENTIRE README from DOMAIN_REGISTRY.json
 * using the readme_metadata section as the single source of truth.
 *
 * Only sections listed in preserve_sections are kept from the existing README.
 * All other content is generated from the domain registry metadata.
 *
 * Data sources:
 * - DOMAIN_REGISTRY.json (readme_metadata + domain data)
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

// Load registry
function loadRegistry() {
  const registryPath = path.join(process.cwd(), 'DOMAIN_REGISTRY.json');
  if (!fs.existsSync(registryPath)) {
    error('DOMAIN_REGISTRY.json not found');
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(registryPath, 'utf8'));
}

// Extract preserved sections from existing README
function extractPreservedSections(existingReadme, sectionTitles) {
  const preserved = {};

  sectionTitles.forEach(title => {
    // Find section by matching "## Title"
    const regex = new RegExp(`^##\\s+${title.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}\\s*$`, 'gm');
    const match = regex.exec(existingReadme);

    if (match) {
      const startIndex = match.index;
      // Find next ## heading or end of file
      const nextHeadingRegex = /^##\s+/gm;
      nextHeadingRegex.lastIndex = startIndex + match[0].length;
      const nextMatch = nextHeadingRegex.exec(existingReadme);

      const endIndex = nextMatch ? nextMatch.index : existingReadme.length;
      const sectionContent = existingReadme.substring(startIndex, endIndex).trim();

      preserved[title] = sectionContent;
    }
  });

  return preserved;
}

// Find latest analysis report for a domain
function findLatestAnalysis(domainId) {
  const analysisDir = path.join(process.cwd(), '.generated', 'analysis');

  // If there is a subdirectory exactly matching the domainId, look there first
  const domainDir = path.join(analysisDir, domainId);
  if (fs.existsSync(domainDir) && fs.statSync(domainDir).isDirectory()) {
    const files = fs.readdirSync(domainDir)
      .filter(f => f.includes('rich-markdown') && f.endsWith('.md'))
      .map(f => ({ name: f, full: path.join(domainDir, f) }))
      .sort((a, b) => b.name.localeCompare(a.name));

    if (files.length > 0) {
      return files[0].full;
    }
  }

  // Walk the analysisDir recursively and collect candidate files that include the domainId
  if (fs.existsSync(analysisDir)) {
    const candidates = [];

    function walk(dir) {
      const entries = fs.readdirSync(dir);
      for (const entry of entries) {
        const full = path.join(dir, entry);
        try {
          const stat = fs.statSync(full);
          if (stat.isDirectory()) walk(full);
          else if (stat.isFile()) {
            const lower = entry.toLowerCase();
            if (lower.includes(domainId.toLowerCase()) && lower.includes('rich-markdown') && lower.endsWith('.md')) {
              candidates.push({ full, mtime: stat.mtimeMs, name: entry });
            }
          }
        } catch (e) {
          // ignore unreadable entries
        }
      }
    }

    walk(analysisDir);

    if (candidates.length > 0) {
      // prefer the most recently modified file
      candidates.sort((a, b) => b.mtime - a.mtime);
      return candidates[0].full;
    }

    // fallback: look for files at top-level of analysisDir whose name contains the domainId
    const topFiles = fs.readdirSync(analysisDir)
      .filter(f => f.includes(domainId) && f.includes('rich-markdown') && f.endsWith('.md'))
      .sort()
      .reverse();

    if (topFiles.length > 0) return path.join(analysisDir, topFiles[0]);
  }

  return null;
}

// Extract metrics from analysis report
function extractMetrics(reportPath) {
  if (!reportPath || !fs.existsSync(reportPath)) {
    return null;
  }

  const content = fs.readFileSync(reportPath, 'utf8');
  const metrics = {};

  const patterns = {
    conformity: /Conformity Score\s*\|\s*([\d.]+)%/,
    coverage: /Test Coverage\s*\|\s*([\d.]+)%/,
    maintainability: /Maintainability\s*\|\s*([\d.]+)/,
    duplication: /Code Duplication\s*\|\s*([\d.]+)%/,
    health: /Overall Health:\s*(\w+)/,
    handlers: /Handlers:\s*(\d+)/,
    files: /Total Files:\s*(\d+)/,
    loc: /Total LOC:\s*(\d+)/
  };

  Object.entries(patterns).forEach(([key, pattern]) => {
    const match = content.match(pattern);
    if (match) {
      metrics[key] = key === 'health' ? match[1] : parseFloat(match[1]);
    }
  });

  return Object.keys(metrics).length > 0 ? metrics : null;
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
    if (def.status === 'active') summary.active++;
    if (def.status === 'deprecated') summary.deprecated++;
    if (def.status === 'experimental') summary.experimental++;

    const type = def.domain_type || 'unknown';
    summary.byType[type] = (summary.byType[type] || 0) + 1;

    const owner = def.ownership || 'unknown';
    summary.byOwnership[owner] = (summary.byOwnership[owner] || 0) + 1;

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

// Generate the complete README
function generateReadme(registry, preservedSections) {
  const meta = registry.readme_metadata || {};
  const summary = generateDomainSummary(registry);
  const generatedAt = new Date().toISOString();

  let readme = `# ${meta.title || 'RenderX Plugins Demo'}

${meta.subtitle || ''}

## Overview

This repository is organized as a **${meta.overview?.architecture || 'monorepo'}** that consolidates all RenderX architecture components and dependencies. This structure:

${(meta.overview?.benefits || []).map(b => `- ${b}`).join('\n')}

### Repository Contents

${(meta.overview?.contents || []).map(c => `- ${c}`).join('\n')}

For detailed monorepo development guidelines, see [${meta.overview?.monorepo_doc || 'MONOREPO.md'}](./${meta.overview?.monorepo_doc || 'MONOREPO.md'}).

## Related Resources

Check out these supporting projects for more detail on the underlying architecture:

${(meta.related_resources || []).map(r => `- **${r.name}** — ${r.description}:
  ${r.url}`).join('\n\n')}

## 📊 Domain Registry Overview

> **Auto-generated on ${generatedAt}**
> This section is automatically maintained. To update: \`npm run generate:readme\`

**Total Domains**: ${summary.total} (${summary.active} active, ${summary.deprecated} deprecated, ${summary.experimental} experimental)

### By Type
${Object.entries(summary.byType)
  .sort((a, b) => b[1] - a[1])
  .map(([k, v]) => `- ${k}: ${v}`)
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
    .slice(0, 8)
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

${summary.orchestration.length > 8 ? `
<details>
<summary>View all ${summary.orchestration.length} orchestration domains</summary>

${summary.orchestration.map(d => `- **${d.id}**: ${d.description || 'No description'}`).join('\n')}
</details>
` : ''}

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

`;

  // Insert preserved sections
  const preserveOrder = meta.preserve_sections || [];
  preserveOrder.forEach(sectionTitle => {
    if (preservedSections[sectionTitle]) {
      readme += `${preservedSections[sectionTitle]}\n\n`;
    }
  });

  // Add data-driven sections that aren't in preserve list
  if (!preserveOrder.includes('Getting Started')) {
    readme += `## 🚀 Getting Started

### Prerequisites
${(meta.getting_started?.prerequisites || []).map(p => `- ${p}`).join('\n')}

### Installation

\`\`\`bash
${(meta.getting_started?.installation_steps || []).join('\n')}
\`\`\`

### Development

\`\`\`bash
${(meta.getting_started?.development_commands || []).map(cmd => `# ${cmd.description}\n${cmd.command}`).join('\n\n')}
\`\`\`

---

`;
  }

  if (!preserveOrder.includes('Documentation')) {
    readme += `## 📚 Documentation

### Core Documentation
${(meta.documentation_links?.core || []).map(doc => `- [${doc.title}](${doc.path})`).join('\n')}

### Governance & Tooling
- **Governance Tooling Registry**: \`${meta.documentation_links?.governance?.registry || 'docs/governance/tools-registry.json'}\`
- **Generated Registry Docs**: Auto-generated via \`${meta.documentation_links?.governance?.generated_docs || 'npm run generate:governance:registry'}\`
- **Validation**: \`${meta.documentation_links?.governance?.validation || 'npm run validate:governance:registry'}\`

### Related Projects
${(meta.related_resources || []).map(r => `- [${r.name}](${r.url}) - ${r.description.charAt(0).toUpperCase() + r.description.slice(1)}`).join('\n')}

---

`;
  }

  if (!preserveOrder.includes('Testing & Quality')) {
    readme += `## 🧪 Testing & Quality

\`\`\`bash
${(meta.testing_commands || []).map(cmd => `# ${cmd.description}\n${cmd.command}`).join('\n\n')}
\`\`\`

---

`;
  }

  if (!preserveOrder.includes('Packages')) {
    readme += `## 📦 Packages

This monorepo contains the following packages:

${(meta.packages || []).map(p => `- \`${p}\``).join('\n')}

---

`;
  }

  if (!preserveOrder.includes('Domain Analysis')) {
    readme += `## 🔍 Domain Analysis

To analyze a specific domain:

\`\`\`bash
${(meta.domain_analysis_commands || []).map(cmd => `# ${cmd.description}\n${cmd.command}`).join('\n\n')}
\`\`\`

---

`;
  }

  if (!preserveOrder.includes('Contributing')) {
    readme += `## 🤝 Contributing

${meta.contributing?.note || 'Contribution guidelines coming soon.'}${meta.contributing?.main_repo_link ? ` For contribution guidelines, please see the main [renderx-plugins](${meta.contributing.main_repo_link}) repository.` : ''}

---

`;
  }

  if (!preserveOrder.includes('License')) {
    readme += `## 📄 License

${meta.license || 'See LICENSE file for details'}

---

`;
  }

  readme += `## 🔄 Auto-Generation

This README is automatically generated from:
- \`DOMAIN_REGISTRY.json\` - Single source of truth for all metadata
- \`.generated/analysis/**\` - Code analysis reports
- Domain analysis configuration

**Last Generated**: ${generatedAt}

To update this README, run:
\`\`\`bash
npm run generate:readme
\`\`\`
`;

  return readme;
}

// Export helper for tests and programmatic use
module.exports = {
  findLatestAnalysis,
  extractMetrics,
  generateReadme,
  loadRegistry,
  extractPreservedSections
};

// If invoked directly, run the generator (existing behavior preserved)
if (require.main === module) {
  try {
    log('Generating README from DOMAIN_REGISTRY.json', '📝');
    const registry = loadRegistry();
    const readme = generateReadme(registry, {});
    fs.writeFileSync(path.join(process.cwd(), 'README.md'), readme, 'utf8');
    log('README.md written', '✅');
  } catch (e) {
    error(e.message || String(e));
    process.exit(1);
  }
}
