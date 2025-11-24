#!/usr/bin/env node
/**
 * validate-domain-authorities.cjs (CommonJS)
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
  const results = [];
  const roots = [path.resolve('docs','domains'), path.resolve('domains')];
  roots.forEach(root => {
    if (!fs.existsSync(root)) return;
    fs.readdirSync(root).forEach(f => {
      if (f.endsWith('.json') && !f.endsWith('-trace.json') && f !== 'DOMAIN_AUTHORITY_SCHEMA.json' && f !== 'DOMAIN_REGISTRY.json') {
        results.push(path.join(root, f));
      }
    });
  });
  return results;
}
function safeSerialize(obj) {
  if (obj === null || typeof obj !== 'object') return JSON.stringify(obj);
  if (Array.isArray(obj)) return '[' + obj.map(safeSerialize).join(',') + ']';
  const keys = Object.keys(obj).sort();
  return '{' + keys.map(k => JSON.stringify(k) + ':' + safeSerialize(obj[k])).join(',') + '}';
}
function validateDomain(domain, registry) {
  const errors = [];
  const warnings = [];
  const linkIds = new Set();
  ['domain_id','domain_type','provenance'].forEach(k => { if (!(k in domain)) errors.push(`Missing required key: ${k}`); });
  if (domain.provenance && domain.provenance.lineage_hash) {
    const computedLineageHash = sha256((domain.root_context_ref || '') + '|' + (domain.context_lineage || []).join('>') + '|' + domain.domain_id);
    if (computedLineageHash !== domain.provenance.lineage_hash) errors.push(`Lineage hash mismatch: stored=${domain.provenance.lineage_hash} computed=${computedLineageHash}`);
  } else warnings.push('No lineage_hash present (will be generated later).');
  if (domain.provenance && domain.provenance.integrity_checksum) {
    const serialized = safeSerialize(domain);
    const computedChecksum = sha256(serialized);
    if (computedChecksum !== domain.provenance.integrity_checksum) errors.push(`Integrity checksum mismatch: stored=${domain.provenance.integrity_checksum} computed=${computedChecksum}`);
  } else warnings.push('No integrity_checksum present (will be added by generator).');
  if (Array.isArray(domain.cross_domain_links)) {
    domain.cross_domain_links.forEach(link => {
      const targetId = link.target_domain_id;
      if (!targetId) { errors.push('Cross-domain link missing target_domain_id'); return; }
      const registryEntry = registry.domains[targetId];
      if (!registryEntry) errors.push(`Cross-domain link target not found in registry: ${targetId}`);
      else if (registryEntry.status === 'deprecated' && link.relation_type !== 'extends') errors.push(`Link to deprecated domain '${targetId}' must use relation_type=extends`);
      if (!link.link_id) errors.push('Cross-domain link missing link_id');
      else if (linkIds.has(link.link_id)) errors.push(`Duplicate cross-domain link_id detected: ${link.link_id}`);
      else linkIds.add(link.link_id);
      const allowedRelations = ['depends_on','provides','extends','composes','implements','observes'];
      if (link.relation_type && !allowedRelations.includes(link.relation_type)) errors.push(`Invalid relation_type '${link.relation_type}' for link_id ${link.link_id}`);
    });
  }
  return { errors, warnings };
}
function main() {
  let registry;
  try { registry = loadJSON(path.resolve('DOMAIN_REGISTRY.json')); } catch (e) {
    console.error('❌ Missing DOMAIN_REGISTRY.json');
    process.exit(1);
  }
  const domainFiles = findDomainFiles();
  if (!domainFiles.length) { console.log('ℹ️ No domain authority files found.'); process.exit(0); }
  let totalErrors = 0; let totalWarnings = 0; const report = [];
  domainFiles.forEach(file => {
    let domain; try { domain = loadJSON(file); } catch (e) { totalErrors++; report.push({ file, errors:[e.message], warnings:[] }); return; }
    const { errors, warnings } = validateDomain(domain, registry);
    totalErrors += errors.length; totalWarnings += warnings.length; report.push({ file, errors, warnings });
  });
  registry.meta.last_validation = new Date().toISOString();
  fs.writeFileSync('DOMAIN_REGISTRY.json', JSON.stringify(registry, null, 2));
  console.log('Domain Validation Report');
  report.forEach(r => {
    console.log(`\nFile: ${r.file}`);
    if (r.errors.length) { console.log('  Errors:'); r.errors.forEach(e => console.log('   - ' + e)); }
    if (r.warnings.length) { console.log('  Warnings:'); r.warnings.forEach(w => console.log('   - ' + w)); }
    if (!r.errors.length && !r.warnings.length) console.log('  ✅ Clean');
  });
  console.log(`\nSummary: ${totalErrors} errors, ${totalWarnings} warnings across ${domainFiles.length} file(s).`);
  if (totalErrors > 0) { console.error('❌ Domain validation failed.'); process.exit(1); }
  console.log('✅ Domain validation passed.');
  process.exit(0);
}
main();
