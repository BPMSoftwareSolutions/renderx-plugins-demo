#!/usr/bin/env node

/**
 * AC Registry Generator
 *
 * Generates a canonical, normalized AC registry from acceptanceCriteriaStructured
 * fields across all beats in sequence JSON files.
 *
 * Output: .generated/acs/<domain-id>.registry.json
 *
 * Each AC entry includes:
 * - Stable AC ID: <domain>:<sequence>:<beat>:<acIndex>
 * - Normalized GWT (Given/When/Then/And)
 * - Beat and sequence metadata
 *
 * Usage:
 *   ANALYSIS_DOMAIN_ID=renderx-web-orchestration node scripts/generate-ac-registry.cjs
 */

const fs = require('fs');
const path = require('path');

// ============================================================================
// DOMAIN REGISTRY INTEGRATION
// ============================================================================

function loadDomainConfig(domainId) {
  try {
    const registryPath = path.join(process.cwd(), 'DOMAIN_REGISTRY.json');
    if (!fs.existsSync(registryPath)) {
      throw new Error('DOMAIN_REGISTRY.json not found in the root directory.');
    }
    const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));

    // Try to find domain in registry (exact match, domain_id match, or aliases)
    let domainConfig = null;

    // 1) Exact key match
    if (registry.domains[domainId]) {
      domainConfig = registry.domains[domainId];
    }

    // 2) domain_id field match
    if (!domainConfig) {
      domainConfig = Object.values(registry.domains).find(d => d && d.domain_id === domainId);
    }

    // 3) alias match
    if (!domainConfig) {
      domainConfig = Object.values(registry.domains).find(d => Array.isArray(d.aliases) && d.aliases.includes(domainId));
    }

    if (!domainConfig) {
      throw new Error(`Domain '${domainId}' is not registered in DOMAIN_REGISTRY.json.`);
    }

    return {
      canonicalDomainId: domainConfig.domain_id,
      sequenceFiles: domainConfig.orchestration?.sequence_files || [],
      config: domainConfig
    };
  } catch (err) {
    console.error(`❌ FATAL: ${err.message}`);
    process.exit(1);
  }
}

// ============================================================================
// AC EXTRACTION & NORMALIZATION
// ============================================================================

/**
 * Normalize structured AC (handle both object and string formats)
 * @param {Object|string} ac - Acceptance criteria (structured or string)
 * @returns {Object} Normalized AC with given/when/then/and arrays
 */
function normalizeAC(ac) {
  if (typeof ac === 'string') {
    // Legacy string format - parse Gherkin
    return parseGherkinAC(ac);
  }

  // Structured format
  const normalized = {
    given: [],
    when: [],
    then: [],
    and: []
  };

  // Handle single-item arrays by inlining
  if (ac.given) {
    normalized.given = Array.isArray(ac.given) ? ac.given : [ac.given];
  }
  if (ac.when) {
    normalized.when = Array.isArray(ac.when) ? ac.when : [ac.when];
  }
  if (ac.then) {
    normalized.then = Array.isArray(ac.then) ? ac.then : [ac.then];
  }
  if (ac.and) {
    normalized.and = Array.isArray(ac.and) ? ac.and : [ac.and];
  }

  return normalized;
}

/**
 * Parse Gherkin-style AC string
 * @param {string} acString - AC string with Given/When/Then/And
 * @returns {Object} Normalized AC object
 */
function parseGherkinAC(acString) {
  const lines = acString.split('\n').map(l => l.trim()).filter(l => l);

  const parsed = {
    given: [],
    when: [],
    then: [],
    and: []
  };

  let currentSection = null;

  lines.forEach(line => {
    if (line.startsWith('Given')) {
      currentSection = 'given';
      parsed.given.push(line.replace(/^Given\s+/i, ''));
    } else if (line.startsWith('When')) {
      currentSection = 'when';
      parsed.when.push(line.replace(/^When\s+/i, ''));
    } else if (line.startsWith('Then')) {
      currentSection = 'then';
      parsed.then.push(line.replace(/^Then\s+/i, ''));
    } else if (line.startsWith('And')) {
      // And clauses attach to the previous section
      if (currentSection) {
        parsed[currentSection].push(line.replace(/^And\s+/i, ''));
      } else {
        parsed.and.push(line.replace(/^And\s+/i, ''));
      }
    } else if (line.startsWith('-')) {
      // Bullet-style continuation
      if (currentSection) {
        parsed[currentSection].push(line.replace(/^-\s+/, ''));
      }
    }
  });

  return parsed;
}

/**
 * Generate stable AC ID
 * @param {string} domainId - Domain identifier
 * @param {string} sequenceId - Sequence identifier
 * @param {string} beatId - Beat identifier (movement.beat format)
 * @param {number} acIndex - AC index (1-based)
 * @returns {string} Stable AC ID
 */
function generateACId(domainId, sequenceId, beatId, acIndex) {
  return `${domainId}:${sequenceId}:${beatId}:${acIndex}`;
}

/**
 * Extract ACs from a sequence JSON file
 * @param {string} sequenceFilePath - Path to sequence JSON
 * @param {string} domainId - Domain identifier
 * @returns {Array} Array of AC entries
 */
function extractACsFromSequence(sequenceFilePath, domainId) {
  try {
    const sequence = JSON.parse(fs.readFileSync(sequenceFilePath, 'utf8'));
    const acs = [];

    if (!sequence.movements || !Array.isArray(sequence.movements)) {
      return acs;
    }

    sequence.movements.forEach((movement, movementIndex) => {
      if (!movement.beats || !Array.isArray(movement.beats)) {
        return;
      }

      movement.beats.forEach((beat, beatIndex) => {
        const beatId = `${movement.number || movementIndex + 1}.${beat.number || beatIndex + 1}`;

        // Check for acceptanceCriteriaStructured (new format)
        let acList = beat.acceptanceCriteriaStructured || beat.acceptanceCriteria;

        if (!acList || !Array.isArray(acList)) {
          return;
        }

        acList.forEach((ac, acIdx) => {
          const normalized = normalizeAC(ac);
          const acId = generateACId(
            domainId,
            sequence.sequenceId || sequence.id,
            beatId,
            acIdx + 1
          );

          acs.push({
            acId,
            domainId,
            sequenceId: sequence.sequenceId || sequence.id,
            sequenceName: sequence.name || sequence.title,
            movementNumber: movement.number || movementIndex + 1,
            movementName: movement.name,
            beatNumber: beat.number || beatIndex + 1,
            beatName: beat.name,
            beatId,
            handler: beat.handler?.name || beat.handler,
            acIndex: acIdx + 1,
            given: normalized.given,
            when: normalized.when,
            then: normalized.then,
            and: normalized.and,
            raw: ac
          });
        });
      });
    });

    return acs;
  } catch (error) {
    console.error(`⚠️  Error processing ${sequenceFilePath}: ${error.message}`);
    return [];
  }
}

/**
 * Generate AC registry for a domain
 * @param {string} domainId - Domain identifier
 * @returns {Object} AC registry
 */
function generateACRegistry(domainId) {
  console.log(`\n🔍 Generating AC Registry for domain: ${domainId}\n`);

  const domainConfig = loadDomainConfig(domainId);
  const canonicalDomainId = domainConfig.canonicalDomainId;
  const sequenceFiles = domainConfig.sequenceFiles;

  console.log(`   Canonical Domain ID: ${canonicalDomainId}`);
  console.log(`   Sequence Files: ${sequenceFiles.length}`);

  let allACs = [];

  sequenceFiles.forEach(sequenceFile => {
    const fullPath = path.join(process.cwd(), sequenceFile);
    console.log(`   Processing: ${sequenceFile}`);

    if (fs.existsSync(fullPath)) {
      const acs = extractACsFromSequence(fullPath, canonicalDomainId);
      allACs = allACs.concat(acs);
      console.log(`     → Extracted ${acs.length} ACs`);
    } else {
      console.log(`     ⚠️  File not found: ${fullPath}`);
    }
  });

  // Build registry
  const registry = {
    domainId: canonicalDomainId,
    generatedAt: new Date().toISOString(),
    totalACs: allACs.length,
    sequences: [...new Set(allACs.map(ac => ac.sequenceId))].length,
    beats: [...new Set(allACs.map(ac => `${ac.sequenceId}:${ac.beatId}`))].length,
    acs: allACs
  };

  return registry;
}

/**
 * Write registry to output file
 * @param {Object} registry - AC registry
 * @param {string} outputPath - Output file path
 */
function writeRegistry(registry, outputPath) {
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, JSON.stringify(registry, null, 2));
  console.log(`\n✅ AC Registry written to: ${outputPath}`);
  console.log(`   Total ACs: ${registry.totalACs}`);
  console.log(`   Sequences: ${registry.sequences}`);
  console.log(`   Beats: ${registry.beats}\n`);
}

// ============================================================================
// CLI EXECUTION
// ============================================================================

if (require.main === module) {
  const domainId = process.env.ANALYSIS_DOMAIN_ID || 'renderx-web-orchestration';

  const registry = generateACRegistry(domainId);

  const outputPath = path.join(
    process.cwd(),
    '.generated',
    'acs',
    `${registry.domainId}.registry.json`
  );

  writeRegistry(registry, outputPath);

  console.log('✨ AC Registry generation complete!\n');
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  generateACRegistry,
  extractACsFromSequence,
  normalizeAC,
  parseGherkinAC,
  generateACId,
  writeRegistry
};
