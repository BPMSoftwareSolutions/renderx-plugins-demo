#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

/**
 * Generate human-readable description from beat properties
 * @param {Object} beat - Beat object with event, handler, kind, timing
 * @returns {string} Human-readable description
 */
function generateBeatDescription(beat) {
  if (beat.description) return beat.description;

  // Extract human-readable parts from event name
  // e.g., "canvas:component:copy:serialize" -> "Serialize"
  if (beat.event) {
    const parts = beat.event.split(':');
    const action = parts[parts.length - 1];
    const humanized = action
      .replace(/([A-Z])/g, ' $1') // Add space before capitals
      .replace(/([a-z])([A-Z])/g, '$1 $2') // camelCase to space-separated
      .trim()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    // Add kind indicator
    const kindLabel = beat.kind ? ` (${beat.kind})` : '';
    return `${humanized}${kindLabel}`;
  }

  // Fallback to handler name
  if (beat.handler) {
    const humanized = beat.handler
      .replace(/([A-Z])/g, ' $1')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .trim()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    const kindLabel = beat.kind ? ` (${beat.kind})` : '';
    return `${humanized}${kindLabel}`;
  }

  return `Beat ${beat.beat}`;
}

async function generateOrchestrationDomains() {
  console.log('🔄 Generating orchestration-domains.json from audit catalog\n');

  const domains = [];
  let placeholderCounter = 0;

  // Load audit catalog (55 plugin sequences)
  const catalogPath = path.join(
    rootDir,
    'packages/ographx/.ographx/artifacts/renderx-web/catalog/catalog-sequences.json'
  );
  const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf-8'));

  // Add all plugin sequences from audit catalog
  catalog.sequences.forEach(seq => {
    // Repair invalid entries lacking an id by generating placeholder identifiers
    if (!seq.id) {
      placeholderCounter += 1;
      const generatedId = `catalog-placeholder-${placeholderCounter}`;
      const generatedName = `Catalog Placeholder ${placeholderCounter}`;
      console.warn(`⚠️  Repairing sequence with missing id -> ${generatedId}`);
      seq.id = generatedId;
      if (!seq.name) seq.name = generatedName;
      if (!seq.movements) seq.movements = []; // ensure array
    }

    // Fallback sequence name to id when name is missing (prevents "undefined" names)
    const sequenceName = seq.name || seq.id;
    const beats = seq.movements?.reduce((sum, m) => sum + (m.beatCount || 0), 0) || 0;
    const movements = seq.movements || [];

    // Generate complete MusicalSequence structure with sketch data
    const sketch = {
      title: sequenceName,
      sequence: {
        id: seq.id,
        name: sequenceName,
        tempo: seq.tempo || 120,
        key: seq.key || 'C Major',
        timeSignature: seq.timeSignature || '4/4',
        category: 'plugin'
      },
      phases: movements.map((m, idx) => ({
        name: `Movement ${idx + 1}: ${m.name || 'Unnamed'}`,
        items: m.beats?.map(b => generateBeatDescription(b)) || []
      }))
    };

    domains.push({
      id: seq.id,
      name: sequenceName,
      emoji: '🔌',
      description: `Plugin sequence: ${sequenceName}`,
      category: 'plugin',
      purpose: 'Feature implementation',
      relatedDomains: [],
      status: 'active',
      pluginId: seq.pluginId,
      movements: movements.length,
      beats: beats,
      tempo: seq.tempo || 120,
      key: seq.key || 'C Major',
      timeSignature: seq.timeSignature || '4/4',
      sketch: sketch
    });
  });

  console.log(`✅ Added ${catalog.sequences.length} plugin sequences from audit catalog`);

  // Add orchestration domain sequences from packages/ographx/.ographx/sequences/
  const orchestrationSeqDir = path.join(rootDir, 'packages/ographx/.ographx/sequences');
  if (fs.existsSync(orchestrationSeqDir)) {
    fs.readdirSync(orchestrationSeqDir)
      .filter(f => f.endsWith('.json') && !f.includes('index.json'))
      .forEach(file => {
        try {
          const content = JSON.parse(fs.readFileSync(path.join(orchestrationSeqDir, file), 'utf-8'));
          const id = content.id || file.replace('.json', '');
          const movements = content.movements || [];
          const beats = movements.reduce((sum, m) => sum + (m.beats?.length || 0), 0);

          // Generate complete MusicalSequence structure with sketch data
          const sketch = {
            title: content.name || id,
            sequence: {
              id: id,
              name: content.name || id,
              tempo: content.tempo || 120,
              key: content.key || 'C Major',
              timeSignature: content.timeSignature || '4/4',
              category: 'orchestration'
            },
            phases: movements.map((m, idx) => ({
              name: `Movement ${idx + 1}: ${m.name || 'Unnamed'}`,
              items: m.beats?.map(b => generateBeatDescription(b)) || []
            }))
          };

          domains.push({
            id: id,
            name: content.name || id,
            emoji: '🎼',
            description: content.description || `Orchestration domain: ${content.name || id}`,
            category: 'orchestration',
            purpose: 'System orchestration',
            relatedDomains: [],
            status: 'active',
            sequenceFile: `packages/ographx/.ographx/sequences/${file}`,
            movements: movements.length,
            beats: beats,
            tempo: content.tempo || 120,
            key: content.key || 'C Major',
            timeSignature: content.timeSignature || '4/4',
            sketch: sketch
          });

          console.log(`✅ ${content.name || id} (${movements.length} movements, ${beats} beats)`);
        } catch (err) {
          console.warn(`⚠️  Could not parse ${file}: ${err.message}`);
        }
      });
  }

  // Auto-detect orchestration sequences from all packages/*/ographx/sequences/ and packages/*/.ographx/sequences/
  const packageDirs = fs.readdirSync(path.join(rootDir, 'packages')).filter(f => 
    fs.statSync(path.join(rootDir, 'packages', f)).isDirectory()
  );

  packageDirs.forEach(pkgName => {
    // Check both patterns: packages/{pkg}/ographx/sequences/ and packages/{pkg}/.ographx/sequences/
    const seqPaths = [
      path.join(rootDir, 'packages', pkgName, 'ographx', 'sequences'),
      path.join(rootDir, 'packages', pkgName, '.ographx', 'sequences')
    ];

    seqPaths.forEach(seqPath => {
      if (!fs.existsSync(seqPath)) return;

      fs.readdirSync(seqPath)
        .filter(f => f.endsWith('.json') && !f.includes('index.json'))
        .forEach(file => {
          try {
            const content = JSON.parse(fs.readFileSync(path.join(seqPath, file), 'utf-8'));
            const id = content.id || file.replace('.json', '');
            // Support both 'movements' and 'phases' field names for backwards compatibility
            const movements = content.movements || content.phases || [];
            const beats = movements.reduce((sum, m) => sum + (m.items?.length || m.beats?.length || 0), 0);

            // Skip if already added (avoid duplicates)
            if (domains.some(d => d.id === id)) return;

            // Generate complete MusicalSequence structure with sketch data
            const sketch = {
              title: content.name || id,
              sequence: {
                id: id,
                name: content.name || id,
                tempo: content.tempo || 120,
                key: content.key || 'C Major',
                timeSignature: content.timeSignature || '4/4',
                category: 'orchestration'
              },
              phases: movements.map((m, idx) => ({
                name: `Movement ${idx + 1}: ${m.name || 'Unnamed'}`,
                items: m.items || m.beats || []
              }))
            };

            domains.push({
              id: id,
              name: content.name || id,
              emoji: '🎼',
              description: content.description || `Orchestration domain: ${content.name || id}`,
              category: 'orchestration',
              purpose: 'System orchestration',
              relatedDomains: content.relatedDomains || [],
              status: content.status || 'active',
              sequenceFile: path.relative(rootDir, path.join(seqPath, file)),
              movements: movements.length,
              beats: beats,
              tempo: content.tempo || 120,
              key: content.key || 'C Major',
              timeSignature: content.timeSignature || '4/4',
              sketch: sketch
            });

            console.log(`✅ Auto-detected: ${pkgName}/${file} - ${content.name || id} (${movements.length} movements, ${beats} beats)`);
          } catch (err) {
            console.warn(`⚠️  Could not parse ${seqPath}/${file}: ${err.message}`);
          }
        });
    });
  });

  const registry = {
    metadata: {
      description: 'Complete registry of all orchestration domains and plugin sequences',
      version: '1.0.0',
      generated: new Date().toISOString()
    },
    unifiedInterface: {
      name: 'MusicalSequence',
      source: 'packages/musical-conductor/modules/communication/sequences/SequenceTypes.ts',
      fields: [
        'id',
        'name',
        'description',
        'key',
        'tempo',
        'timeSignature',
        'category',
        'movements',
        'metadata'
      ]
    },
    executionFlow: [
      { step: 1, name: 'Load Context', description: 'Load governance and context' },
      { step: 2, name: 'Validate', description: 'Validate inputs and state' },
      { step: 3, name: 'Execute', description: 'Execute movements and beats' },
      { step: 4, name: 'Monitor', description: 'Monitor execution and telemetry' },
      { step: 5, name: 'Report', description: 'Report results and metrics' }
    ],
    categories: [
      { id: 'plugin', name: 'Plugin Sequences', description: 'Feature-level sequences' },
      { id: 'orchestration', name: 'Orchestration Domains', description: 'System-level sequences' }
    ],
    dynamics: [
      { symbol: 'pp', name: 'Pianissimo', description: 'Very soft' },
      { symbol: 'p', name: 'Piano', description: 'Soft' },
      { symbol: 'mp', name: 'Mezzo-piano', description: 'Medium soft' },
      { symbol: 'mf', name: 'Mezzo-forte', description: 'Medium loud' },
      { symbol: 'f', name: 'Forte', description: 'Loud' },
      { symbol: 'ff', name: 'Fortissimo', description: 'Very loud' }
    ],
    timing: [
      { id: 'immediate', description: 'Execute immediately' },
      { id: 'deferred', description: 'Execute after current phase' },
      { id: 'async', description: 'Execute asynchronously' }
    ],
    domains
  };

  const registryPath = path.join(rootDir, 'orchestration-domains.json');
  fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2));

  console.log(`\n✅ Generated ${domains.length} total domains`);
  console.log(`   - ${catalog.sequences.length} plugin sequences`);
  console.log(`   - ${domains.length - catalog.sequences.length} orchestration domains`);
  console.log(`📝 Wrote to: orchestration-domains.json`);
}

generateOrchestrationDomains().catch(console.error);

