#!/usr/bin/env node
/**
 * validate-domain-authorities.js
 *
 * Performs validation across all domain authority JSON files:
 *  - Schema shape (lightweight key presence check)
 *  - Lineage hash integrity
 *  - Cross-domain link resolution against DOMAIN_REGISTRY.json
 *  - Deprecation rules (links must not target deprecated unless relation_type = 'extends')
 *  - Integrity checksum recomputation (if present)
 *
 * Exit codes:
 *  0 = success (no blocking issues)
 *  1 = validation failures found
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function sha256(content) {
  return crypto.createHash('sha256').update(content).digest('hex');
}

function loadJSON(p, optional = false) {
  if (!fs.existsSync(p)) {
    if (optional) return null;
    throw new Error(`Missing required file: ${p}`);
  }
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function findDomainFiles() {
  // Search in docs/domains and packages/*/domains for authority files (*.domain.json or *-domain.json or explicit suffix)
  const results = [];
  const roots = [path.resolve('docs','domains'), path.resolve('domains')];
  roots.forEach(root => {
    if (!fs.existsSync(root)) return;
    const entries = fs.readdirSync(root);
    entries.forEach(f => {
      if (f.endsWith('.json') && !f.endsWith('-trace.json') && f !== 'DOMAIN_AUTHORITY_SCHEMA.json' && f !== 'DOMAIN_REGISTRY.json') {
        results.push(path.join(root, f));
      }
    });
  });
  return results;
}

function safeSerialize(obj) {
  // Deterministic serialization (sorted keys) for hashing
  if (obj === null || typeof obj !== 'object') return JSON.stringify(obj);
  if (Array.isArray(obj)) return '[' + obj.map(safeSerialize).join(',') + ']';
  const keys = Object.keys(obj).sort();
  return '{' + keys.map(k => JSON.stringify(k) + ':' + safeSerialize(obj[k])).join(',') + '}';
}

function validateDomain(domain, registry) {
  const errors = [];
  const warnings = [];
  const linkIds = new Set();

  // Basic required keys
  const required = ['domain_id','domain_type','provenance'];
  required.forEach(k => { if (!(k in domain)) errors.push(`Missing required key: ${k}`); });

  // lineage hash check
  if (domain.provenance && domain.provenance.lineage_hash) {
    const computedLineageHash = sha256((domain.root_context_ref || '') + '|' + (domain.context_lineage || []).join('>') + '|' + domain.domain_id);
    if (computedLineageHash !== domain.provenance.lineage_hash) {
      errors.push(`Lineage hash mismatch: stored=${domain.provenance.lineage_hash} computed=${computedLineageHash}`);
    }
  } else {
    warnings.push('No lineage_hash present (will be generated later).');
  }

  // integrity checksum check
  if (domain.provenance && domain.provenance.integrity_checksum) {
    const serialized = safeSerialize(domain);
    const computedChecksum = sha256(serialized);
    if (computedChecksum !== domain.provenance.integrity_checksum) {
      errors.push(`Integrity checksum mismatch: stored=${domain.provenance.integrity_checksum} computed=${computedChecksum}`);
    }
  } else {
    warnings.push('No integrity_checksum present (will be added by generator).');
  }

  // cross-domain links check
  if (Array.isArray(domain.cross_domain_links)) {
    domain.cross_domain_links.forEach(link => {
      const targetId = link.target_domain_id;
      if (!targetId) {
        errors.push('Cross-domain link missing target_domain_id');
        return;
      }
      const registryEntry = registry.domains[targetId];
      if (!registryEntry) {
        errors.push(`Cross-domain link target not found in registry: ${targetId}`);
      } else if (registryEntry.status === 'deprecated' && link.relation_type !== 'extends') {
        errors.push(`Link to deprecated domain '${targetId}' must use relation_type=extends`);
      }
      if (!link.link_id) {
        errors.push('Cross-domain link missing link_id');
      } else if (linkIds.has(link.link_id)) {
        errors.push(`Duplicate cross-domain link_id detected: ${link.link_id}`);
      } else {
        linkIds.add(link.link_id);
      }
      const allowedRelations = ['depends_on','provides','extends','composes','implements','observes'];
      if (link.relation_type && !allowedRelations.includes(link.relation_type)) {
        errors.push(`Invalid relation_type '${link.relation_type}' for link_id ${link.link_id}`);
      }
    });
  }

  return { errors, warnings };
}

function main() {
  const registry = loadJSON(path.resolve('DOMAIN_REGISTRY.json'));
  const domainFiles = findDomainFiles();
  if (!domainFiles.length) {
    console.log('ℹ️ No domain authority files found. Validation passes (nothing to validate).');
    process.exit(0);
  }

  let totalErrors = 0;
  let totalWarnings = 0;
  const report = [];

  domainFiles.forEach(file => {
    let domain;
    try { domain = loadJSON(file); } catch (e) {
      totalErrors++; report.push({ file, errors: [e.message], warnings: [] }); return;
    }
    const { errors, warnings } = validateDomain(domain, registry);
    totalErrors += errors.length;
    totalWarnings += warnings.length;
    report.push({ file, errors, warnings });
  });

  // Update registry meta
  registry.meta.last_validation = new Date().toISOString();
  fs.writeFileSync('DOMAIN_REGISTRY.json', JSON.stringify(registry, null, 2));

  // Output report
  console.log('Domain Validation Report');
  report.forEach(r => {
    console.log(`\nFile: ${r.file}`);
    if (r.errors.length) {
      console.log('  Errors:');
      r.errors.forEach(e => console.log('   - ' + e));
    }
    if (r.warnings.length) {
      console.log('  Warnings:');
      r.warnings.forEach(w => console.log('   - ' + w));
    }
    if (!r.errors.length && !r.warnings.length) console.log('  ✅ Clean');
  });

  console.log(`\nSummary: ${totalErrors} errors, ${totalWarnings} warnings across ${domainFiles.length} domain file(s).`);

  if (totalErrors > 0) {
    console.error('❌ Domain validation failed.');
    process.exit(1);
  }
  console.log('✅ Domain validation passed.');
  process.exit(0);
}

main();
