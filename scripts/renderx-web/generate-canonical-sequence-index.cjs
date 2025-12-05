#!/usr/bin/env node
/*
  Generate a canonical sequence index for the renderx-web domain by
  traversing DOMAIN_REGISTRY.json and collecting all sequence files
  belonging to the renderx-web-orchestration domain and its child capability domains.
*/

const fs = require('fs');
const path = require('path');

function loadJson(p) {
  const content = fs.readFileSync(p, 'utf-8');
  return JSON.parse(content);
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function collectSequenceFilesForDomain(domain) {
  const files = new Set();
  if (!domain) return files;
  // Common location
  if (domain.orchestration && Array.isArray(domain.orchestration.sequence_files)) {
    for (const f of domain.orchestration.sequence_files) files.add(f);
  }
  // Some domains may also list sequence_files at top-level (defensive)
  if (Array.isArray(domain.sequence_files)) {
    for (const f of domain.sequence_files) files.add(f);
  }
  return files;
}

function main() {
  const repoRoot = process.cwd();
  const registryPath = path.join(repoRoot, 'DOMAIN_REGISTRY.json');
  if (!fs.existsSync(registryPath)) {
    console.error('DOMAIN_REGISTRY.json not found at repo root');
    process.exit(1);
  }

  const registry = loadJson(registryPath);
  const domains = registry.domains || {};
  const targetDomainId = 'renderx-web-orchestration';

  // Collect the target domain and all children that list it as a parent
  const sequenceFiles = new Set();
  const includedDomains = new Set();

  for (const [key, dom] of Object.entries(domains)) {
    const domainId = dom.domain_id || key;
    const parentRefs = dom.parent_refs || [];
    if (domainId === targetDomainId || parentRefs.includes(targetDomainId)) {
      includedDomains.add(domainId);
      for (const f of collectSequenceFilesForDomain(dom)) sequenceFiles.add(f);
    }
  }

  // Resolve to absolute and verify existence
  const missing = [];
  const present = [];
  for (const rel of sequenceFiles) {
    const abs = path.join(repoRoot, rel);
    if (fs.existsSync(abs)) {
      present.push(rel);
    } else {
      missing.push(rel);
    }
  }

  // Emit manifest
  const outDir = path.join(repoRoot, '.generated', 'analysis', targetDomainId);
  ensureDir(outDir);
  const manifestPath = path.join(outDir, 'canonical-sequences.manifest.json');
  const manifest = {
    version: '1.0.0',
    generatedAt: new Date().toISOString(),
    domainId: targetDomainId,
    source: 'DOMAIN_REGISTRY.json',
    includedDomains: Array.from(includedDomains).sort(),
    totals: {
      domains: includedDomains.size,
      sequences: present.length,
      missing: missing.length
    },
    sequenceFiles: present.sort(),
    missingFiles: missing.sort()
  };
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

  // Also emit a brief markdown summary for humans
  const reportDir = path.join(repoRoot, 'docs', 'generated', targetDomainId);
  ensureDir(reportDir);
  const mdPath = path.join(reportDir, 'canonical-sequences.md');
  const md = [
    `# Canonical Sequence Index for ${targetDomainId}`,
    '',
    `- Generated: ${manifest.generatedAt}`,
    `- Included Domains: ${manifest.totals.domains}`,
    `- Sequence Files: ${manifest.totals.sequences}`,
    `- Missing Files: ${manifest.totals.missing}`,
    '',
    '## Included Domains',
    ...manifest.includedDomains.map(d => `- ${d}`),
    '',
    '## Sequence Files',
    ...manifest.sequenceFiles.map(f => `- ${f}`),
    '',
    manifest.missingFiles.length ? '## Missing Files' : '',
    ...manifest.missingFiles.map(f => `- ${f}`),
    ''
  ].filter(Boolean).join('\n');
  fs.writeFileSync(mdPath, md);

  console.log(`Canonical sequence manifest written to ${manifestPath}`);
  if (missing.length) {
    console.warn(`Warning: ${missing.length} listed sequence files are missing on disk.`);
  }
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
