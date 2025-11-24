#!/usr/bin/env node
/**
 * Domain Document Generator
 * Reads a domain authority JSON matching DOMAIN_AUTHORITY_SCHEMA.json and outputs:
 *  - docs/domains/<domain_id>.md (auto-generated reflection)
 *  - .generated/domains/<domain_id>-trace.json (expanded lineage + integrity report)
 *
 * Policy: JSON is authority, markdown is reflection. DO NOT EDIT GENERATED OUTPUTS.
 */
const fs = require('fs');
const path = require('path');

function loadJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function sha256(content) {
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(content).digest('hex');
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function expandLineage(domain, registry) {
  const lineage = [];
  const visited = new Set();
  function dfs(id) {
    if (visited.has(id)) return;
    visited.add(id);
    const item = registry[id];
    if (!item) return;
    if (item.parent_context_refs) {
      item.parent_context_refs.forEach(dfs);
    }
    lineage.push(id);
  }
  if (domain.parent_context_refs) domain.parent_context_refs.forEach(dfs);
  lineage.push(domain.domain_id);
  return lineage;
}

function main() {
  const domainJsonPath = process.argv[2];
  if (!domainJsonPath) {
    console.error('Usage: node scripts/generate-domain-doc.js <path-to-domain-authority.json>');
    process.exit(1);
  }
  const domain = loadJson(domainJsonPath);

  // Optional registry for lineage resolution
  let registry = {};
  const registryPath = path.resolve('DOMAIN_REGISTRY.json');
  if (fs.existsSync(registryPath)) {
    try { registry = loadJson(registryPath); } catch { registry = {}; }
  }

  const lineage = expandLineage(domain, registry);
  const lineageHash = sha256(lineage.join('::'));

  // Verify stored lineage hash if present
  if (domain.provenance && domain.provenance.lineage_hash && domain.provenance.lineage_hash !== lineageHash) {
    console.warn(`⚠️ Lineage hash mismatch for ${domain.domain_id}. Expected ${domain.provenance.lineage_hash}, computed ${lineageHash}`);
  }

  // Generated markdown
  const mdLines = [];
  mdLines.push('<!-- AUTO-GENERATED DOMAIN DOCUMENT - DO NOT EDIT MANUALLY -->');
  mdLines.push(`# Domain: ${domain.title || domain.domain_id}`);
  mdLines.push('');
  mdLines.push(`ID: 
\n
` + '`' + domain.domain_id + '`');
  mdLines.push(`Type: ${domain.domain_type}`);
  if (domain.summary) mdLines.push(`\n${domain.summary}`);
  mdLines.push('\n---');
  mdLines.push('## Lineage');
  mdLines.push(lineage.map((l, i) => `${i + 1}. ${l}`).join('\n'));
  if (domain.bounded_context) {
    mdLines.push('\n## Bounded Context');
    mdLines.push('### In Scope');
    mdLines.push((domain.bounded_context.in_scope || []).map(i => `- ${i}`).join('\n') || 'None');
    mdLines.push('\n### Out of Scope');
    mdLines.push((domain.bounded_context.out_of_scope || []).map(i => `- ${i}`).join('\n') || 'None');
    if (domain.bounded_context.interfaces && domain.bounded_context.interfaces.length) {
      mdLines.push('\n### Interfaces');
      mdLines.push(domain.bounded_context.interfaces.map(i => `- ${i}`).join('\n'));
    }
  }
  if (domain.governance) {
    mdLines.push('\n## Governance Overrides');
    mdLines.push('Inherited Rules:');
    mdLines.push((domain.governance.inherited_rules || []).map(r => `- ${r}`).join('\n') || 'None');
    if (domain.governance.overrides && domain.governance.overrides.length) {
      mdLines.push('\nOverrides:');
      mdLines.push(domain.governance.overrides.map(o => `- ${JSON.stringify(o)}`).join('\n'));
    }
  }
  if (domain.cross_domain_links && domain.cross_domain_links.length) {
    mdLines.push('\n## Cross-Domain Links');
    domain.cross_domain_links.forEach(link => {
      mdLines.push(`- (${link.relation_type}) ${domain.domain_id} → ${link.target_domain_id} (${link.strength || 'n/a'})`);
    });
  }
  if (domain.lifecycle) {
    mdLines.push('\n## Lifecycle');
    mdLines.push(`Stage: ${domain.lifecycle.stage}`);
    if (domain.lifecycle.introduced) mdLines.push(`Introduced: ${domain.lifecycle.introduced}`);
    if (domain.lifecycle.last_review) mdLines.push(`Last Review: ${domain.lifecycle.last_review}`);
  }
  if (domain.metrics) {
    mdLines.push('\n## Metrics');
    ['kpis','leading_indicators','quality_gates'].forEach(section => {
      if (domain.metrics[section] && domain.metrics[section].length) {
        mdLines.push(`### ${section}`);
        mdLines.push(domain.metrics[section].map(m => `- ${m}`).join('\n'));
      }
    });
  }
  if (domain.ownership) {
    mdLines.push('\n## Ownership');
    mdLines.push(`Team: ${domain.ownership.team}`);
    mdLines.push(`Primary Contact: ${domain.ownership.primary_contact}`);
  }
  mdLines.push('\n---');
  mdLines.push('Integrity');
  const integrityChecksum = domain.provenance && domain.provenance.integrity_checksum ? domain.provenance.integrity_checksum : 'UNKNOWN';
  mdLines.push(`Stored Integrity Checksum: ${integrityChecksum}`);
  mdLines.push(`Computed Lineage Hash: ${lineageHash}`);

  const mdContent = mdLines.join('\n');

  // Paths
  const outputDir = path.resolve('docs','domains');
  const traceDir = path.resolve('.generated','domains');
  ensureDir(outputDir);
  ensureDir(traceDir);

  const mdPath = path.join(outputDir, `${domain.domain_id}.md`);
  fs.writeFileSync(mdPath, mdContent, 'utf8');

  const trace = {
    domain_id: domain.domain_id,
    generated_at: new Date().toISOString(),
    lineage,
    computed_lineage_hash: lineageHash,
    stored_lineage_hash: domain.provenance ? domain.provenance.lineage_hash : null,
    integrity_checksum: integrityChecksum,
    cross_domain_links: domain.cross_domain_links || [],
    validation: {
      lineage_hash_match: domain.provenance ? domain.provenance.lineage_hash === lineageHash : null
    }
  };
  fs.writeFileSync(path.join(traceDir, `${domain.domain_id}-trace.json`), JSON.stringify(trace, null, 2));

  console.log(`✅ Generated domain reflection: ${mdPath}`);
}

main();
