#!/usr/bin/env node

/**
 * Derive topics and interactions from external package sequence files.
 * This eliminates the need for redundant local catalog files for externalized plugins.
 * 
 * Strategy:
 * 1. Scan public/json-sequences/   // Check if plugin declares explicit interaction mapp  // Temporary compatibility layer for known transformation patterns
  // TODO: Remove once plugins declare their own mappings
  route = applyCompatibilityTransforms(route, seq);sequence?.interactionMapping?.route) {
    return {
      route: seq.sequence.interactionMapping.route,
      pluginId: seq.pluginId,
      sequenceId: seq.sequenceId
    };
  }

  // Check if plugin declares transformation rules for interactions
  if (seq.sequence?.interactionTransform) {
    const route = applyPluginInteractionTransform(seq, seq.sequence.interactionTransform);
    if (route) {
      return {
        route,
        pluginId: seq.pluginId,
        sequenceId: seq.sequenceId
      };
    }
  }les from external packages
 * 2. Extract topic routing information from sequence definitions
 * 3. Generate topic and interaction catalog entries automatically
 * 4. Merge with local catalog files for non-externalized plugins
 */

import { promises as fs } from "fs";
import { readdir } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, "..");

async function readJsonSafe(path) {
  try {
    const txt = await fs.readFile(path, "utf-8");
    return JSON.parse(txt);
  } catch {
    return null;
  }
}

function applyPluginTopicTransform(seq, transform) {
  // Apply plugin-declared topic transformation rules
  let topicName = seq.sequenceId
    .replace(/-symphony$/, '')
    .replace(/-sequence$/, '')
    .replace(/-seq$/, '')
    .replace(/-/g, '.');

  // Apply custom transformations declared by the plugin
  if (transform.patterns) {
    for (const pattern of transform.patterns) {
      if (pattern.from && pattern.to) {
        const regex = new RegExp(pattern.from, pattern.flags || 'g');
        topicName = topicName.replace(regex, pattern.to);
      }
    }
  }

  // Apply prefix/suffix transformations
  if (transform.prefix) {
    if (transform.prefix.remove && topicName.startsWith(transform.prefix.remove)) {
      topicName = topicName.substring(transform.prefix.remove.length);
    }
    if (transform.prefix.add && !topicName.startsWith(transform.prefix.add)) {
      topicName = transform.prefix.add + topicName;
    }
  }

  if (transform.suffix) {
    if (transform.suffix.remove && topicName.endsWith(transform.suffix.remove)) {
      topicName = topicName.substring(0, topicName.length - transform.suffix.remove.length);
    }
    if (transform.suffix.add && !topicName.endsWith(transform.suffix.add)) {
      topicName = topicName + transform.suffix.add;
    }
  }

  // Ensure .requested suffix if needed
  if (!topicName.endsWith('.requested')) {
    topicName = topicName + '.requested';
  }

  return topicName;
}

function applyPluginInteractionTransform(seq, transform) {
  // Apply plugin-declared interaction transformation rules
  let route = seq.sequenceId
    .replace(/-symphony$/, '')
    .replace(/-sequence$/, '')
    .replace(/-seq$/, '')
    .replace(/-/g, '.');

  // Apply custom transformations declared by the plugin
  if (transform.patterns) {
    for (const pattern of transform.patterns) {
      if (pattern.from && pattern.to) {
        const regex = new RegExp(pattern.from, pattern.flags || 'g');
        route = route.replace(regex, pattern.to);
      }
    }
  }

  // Apply prefix/suffix transformations
  if (transform.prefix) {
    if (transform.prefix.remove && route.startsWith(transform.prefix.remove)) {
      route = route.substring(transform.prefix.remove.length);
    }
    if (transform.prefix.add && !route.startsWith(transform.prefix.add)) {
      route = transform.prefix.add + route;
    }
  }

  if (transform.suffix) {
    if (transform.suffix.remove && route.endsWith(transform.suffix.remove)) {
      route = route.substring(0, route.length - transform.suffix.remove.length);
    }
    if (transform.suffix.add && !route.endsWith(transform.suffix.add)) {
      route = route + transform.suffix.add;
    }
  }

  // Remove .requested suffix for interaction routes
  route = route.replace(/\.requested$/, '');

  return route;
}

function applyCompatibilityTransforms(name, seq) {
  // Temporary compatibility layer for known plugin transformation patterns
  // TODO: Remove once all plugins declare their own mappings explicitly
  
  let transformed = name;
  
  // UI theme transformation: header.ui.theme.* -> app.ui.theme.*
  if (transformed.includes('ui.theme')) {
    transformed = transformed.replace(/^header\./, 'app.');
  }
  
  // Library component path normalization
  const isLibraryComponent = (seq.pluginId && /LibraryComponent/i.test(seq.pluginId)) || 
                           (seq.file && seq.file.startsWith('library-component/'));
  if (isLibraryComponent) {
    // Only transform container.drop to move it up one level
    transformed = transformed.replace(/^library\.component\.container\./, 'library.container.');
    // Leave other library.component.* topics as-is (like library.component.drop.requested)
  }
  
  // Drag operation handling: component.drag -> component.drag.start (for topics)
  if (transformed.includes('component.drag') && !transformed.includes('start') && !transformed.includes('move')) {
    transformed = transformed.replace('component.drag', 'component.drag.start');
  }
  
  // Drag interaction handling: *.drag -> *.drag.move (for interactions)
  if (/\.drag$/.test(transformed)) {
    transformed = transformed + '.move';
  }
  
  return transformed;
}

export async function discoverSequenceFiles() {
  const nodeModulesDir = join(rootDir, "node_modules");
  const sequences = [];
  const seen = new Set();

  // Discover all @renderx-plugins packages dynamically
  const renderxPluginsDir = join(nodeModulesDir, "@renderx-plugins");
  
  try {
    const packageDirs = await readdir(renderxPluginsDir);
    
    for (const packageName of packageDirs) {
      const packagePath = join(renderxPluginsDir, packageName);
      const sequencesPath = join(packagePath, "json-sequences");
      
      try {
        // Check if this package has json-sequences directory
        const sequencesDirStat = await fs.stat(sequencesPath);
        if (!sequencesDirStat.isDirectory()) continue;
        
        // Scan for subdirectories and files in json-sequences
        const items = await readdir(sequencesPath);
        
        for (const item of items) {
          const itemPath = join(sequencesPath, item);
          const itemStat = await fs.stat(itemPath);
          
          if (itemStat.isDirectory()) {
            // Scan subdirectory for sequence files
            try {
              const files = await readdir(itemPath);
              for (const file of files) {
                if (file.endsWith(".json") && file !== "index.json") {
                  const filePath = join(itemPath, file);
                  const sequence = await readJsonSafe(filePath);
                  const id = sequence?.id;
                  if (sequence && sequence.pluginId && id && !seen.has(id)) {
                    seen.add(id);
                    sequences.push({
                      pluginId: sequence.pluginId,
                      sequenceId: id,
                      file: `${packageName}/${item}/${file}`,
                      sequence,
                      sourcePath: filePath
                    });
                  }
                }
              }
            } catch {
              // Subdirectory access failed, skip
            }
          } else if (item.endsWith(".json") && item !== "index.json") {
            // Direct file in json-sequences root
            const sequence = await readJsonSafe(itemPath);
            const id = sequence?.id;
            if (sequence && sequence.pluginId && id && !seen.has(id)) {
              seen.add(id);
              sequences.push({
                pluginId: sequence.pluginId,
                sequenceId: id,
                file: `${packageName}/${item}`,
                sequence,
                sourcePath: itemPath
              });
            }
          }
        }
      } catch {
        // Package doesn't have json-sequences or access failed, skip
      }
    }
  } catch {
    // @renderx-plugins directory doesn't exist, skip
  }

  return sequences;
}

function deriveTopicFromSequence(seq) {
  // Data-driven topic derivation - plugins can declare their own topic names and transformations
  const id = seq.sequenceId;
  if (!id) return null;

  // Check if plugin declares explicit topic mapping
  if (seq.sequence?.topicMapping?.canonical) {
    return seq.sequence.topicMapping.canonical;
  }

  // Check if plugin declares transformation rules
  if (seq.sequence?.topicTransform) {
    return applyPluginTopicTransform(seq, seq.sequence.topicTransform);
  }

  // Default transformation: remove suffixes and convert to dot notation
  let topicName = id
    .replace(/-symphony$/, '')
    .replace(/-sequence$/, '')
    .replace(/-seq$/, '')
    .replace(/-/g, '.');

  // Temporary compatibility layer for known transformation patterns
  // TODO: Remove once plugins declare their own mappings
  topicName = applyCompatibilityTransforms(topicName, seq);

  // Ensure .requested suffix for routed topics
  if (!topicName.endsWith('.requested')) {
    topicName = topicName + '.requested';
  }

  return topicName;
}

function deriveInteractionFromSequence(seq) {
  // Auto-derive interaction route from sequence ID
  const id = seq.sequenceId;
  if (!id) return null;

  // Skip "requested" orchestration sequences for interaction routes to avoid circular mappings
  // These should only produce topics (e.g., canvas.component.select.requested), not interactions
  if (/\.requested(-|\.|$)/.test(id) || /requested/.test(id)) return null;

  // Remove common symphony suffixes and convert to dot notation
  let route = id
    .replace(/-symphony$/, '')
    .replace(/-sequence$/, '')
    .replace(/-seq$/, '')
    .replace(/-/g, '.');

  // Handle special cases for better route naming
  if (route.includes('ui.theme')) {
    // Convert header.ui.theme.* to app.ui.theme.*
    route = route.replace(/^header\./, 'app.');
  }

  // Normalize library-component 2 library.* (drop .component segment)
  if ((seq.pluginId && /LibraryComponent/i.test(seq.pluginId)) || (seq.file && seq.file.startsWith('library-component/'))) {
    route = route.replace(/^library\.component\./, 'library.');
  }

  // Drag interactions are keyed as *.drag.move for the drag symphony
  if (/\.drag$/.test(route)) {
    route = route + '.move';
  }

  // Remove .requested suffix for interaction routes (topics have it, interactions don't)
  route = route.replace(/\.requested$/, '');

  return {
    route,
    pluginId: seq.pluginId,
    sequenceId: seq.sequenceId
  };
}

function extractTopicsFromSequenceBeats(seq) {
  const topics = [];
  
  if (!seq.sequence?.movements) return topics;
  
  for (const movement of seq.sequence.movements) {
    if (!movement.beats) continue;
    
    for (const beat of movement.beats) {
      if (beat.event) {
        // Convert colon-based event names to dot notation topic names
        let topicName = beat.event.replace(/:/g, '.');
        
        // Check if sequence declares beat event transformations
        if (seq.sequence?.beatEventTransforms) {
          for (const transform of seq.sequence.beatEventTransforms) {
            if (transform.pattern && transform.replacement) {
              const regex = new RegExp(transform.pattern, transform.flags || 'g');
              topicName = topicName.replace(regex, transform.replacement);
            }
          }
        }
        
        topics.push({
          name: topicName,
          notes: `Auto-derived from beat event "${beat.event}" in ${seq.file}`,
          pluginId: seq.pluginId,
          sequenceId: seq.sequenceId
        });
      }
    }
  }
  
  return topics;
}

function extractLifecycleTopicsFromSequence(seq) {
  const lifecycleTopics = [];
  const sequence = seq.sequence;
  
  if (!sequence) return lifecycleTopics;
  
  // Check if sequence declares lifecycle topics explicitly
  if (sequence.lifecycleTopics) {
    for (const lifecycleTopic of sequence.lifecycleTopics) {
      lifecycleTopics.push({
        name: lifecycleTopic.name || lifecycleTopic,
        routes: lifecycleTopic.routed ? [{ pluginId: seq.pluginId, sequenceId: seq.sequenceId }] : [],
        notes: lifecycleTopic.notes || `Declared lifecycle topic from ${seq.file}`,
        type: lifecycleTopic.type || 'notify-only'
      });
    }
    return lifecycleTopics; // If explicitly declared, don't apply defaults
  }
  
  // Check if sequence declares notification topics explicitly  
  if (sequence.notificationTopics) {
    for (const notifyTopic of sequence.notificationTopics) {
      lifecycleTopics.push({
        name: notifyTopic.name || notifyTopic,
        routes: [],
        notes: notifyTopic.notes || `Declared notification topic from ${seq.file}`,
        type: 'notify-only'
      });
    }
    return lifecycleTopics; // If explicitly declared, don't apply defaults
  }
  
  // Fallback: Apply conventional lifecycle patterns for backward compatibility
  // This will be deprecated once plugins migrate to explicit declarations
  const topicName = deriveTopicFromSequence(seq);
  if (!topicName) return lifecycleTopics;
  
  const baseTopic = topicName.replace('.requested', '');
  
  // Default lifecycle topics for .requested sequences
  if (topicName.endsWith('.requested')) {
    lifecycleTopics.push(
      { name: baseTopic, routes: [], notes: `Auto-generated base topic for ${baseTopic}`, type: 'notify-only' },
      { name: `${baseTopic}.started`, routes: [], notes: `Auto-generated lifecycle topic (started) for ${baseTopic}`, type: 'notify-only' },
      { name: `${baseTopic}.completed`, routes: [], notes: `Auto-generated lifecycle topic (completed) for ${baseTopic}`, type: 'notify-only' },
      { name: `${baseTopic}.failed`, routes: [], notes: `Auto-generated lifecycle topic (failed) for ${baseTopic}`, type: 'notify-only' }
    );
  }
  
  // Default notification topics based on sequence patterns
  if (baseTopic.includes('create')) {
    const createdTopic = baseTopic.replace('create', 'created');
    lifecycleTopics.push({ name: createdTopic, routes: [], notes: `Auto-generated notification topic for ${baseTopic}`, type: 'notify-only' });
  }
  
  if (baseTopic.includes('drag')) {
    const dragBaseTopic = baseTopic.replace('.start', '');
    lifecycleTopics.push({ name: `${dragBaseTopic}.end`, routes: [], notes: `Auto-generated lifecycle topic (end) for ${dragBaseTopic}`, type: 'notify-only' });
  }
  
  if (baseTopic.includes('select')) {
    const selectionBaseTopic = baseTopic.replace('.select', '.selection');
    lifecycleTopics.push({ name: `${selectionBaseTopic}.changed`, routes: [], notes: `Auto-generated operational topic (changed) for ${selectionBaseTopic}`, type: 'notify-only' });
  }
  
  return lifecycleTopics;
}

export async function generateExternalTopicsCatalog() {
  const sequences = await discoverSequenceFiles();
  const topics = {};

  for (const seq of sequences) {
    // Process main sequence topic
    const topicName = deriveTopicFromSequence(seq);
    if (topicName) {
      const isRequested = /\.requested(-|\.|$)/.test(seq.sequenceId) || /requested/.test(seq.sequenceId);
      const existing = topics[topicName]?.routes?.[0]?.sequenceId;
      const existingIsRequested = existing ? (/\.requested(-|\.|$)/.test(existing) || /requested/.test(existing)) : false;

      // Check if sequence declares custom routing behavior
      let routedTopicName = topicName;
      if (seq.sequence?.topicMapping?.routeToBase || 
          (seq.sequence?.topicTransform?.routeToBase && topicName.match(seq.sequence.topicTransform.routeToBase))) {
        // Route to base topic instead of .requested variant
        routedTopicName = topicName.replace('.requested', '');
      } else if (topicName.includes('resize.move') || topicName.includes('drag.move')) {
        // Temporary compatibility: resize.move and drag.move route to base topics
        // TODO: Remove once plugins declare routeToBase explicitly
        routedTopicName = topicName.replace('.requested', '');
      }

      if (!existing || (isRequested && !existingIsRequested)) {
        topics[routedTopicName] = {
          routes: [{ pluginId: seq.pluginId, sequenceId: seq.sequenceId }],
          payloadSchema: { type: "object" },
          visibility: "public",
          notes: `Auto-derived from ${seq.file}`
        };
      }
    }
    
    // Process declared lifecycle and notification topics
    const lifecycleTopics = extractLifecycleTopicsFromSequence(seq);
    for (const lifecycleTopic of lifecycleTopics) {
      if (!topics[lifecycleTopic.name]) {
        topics[lifecycleTopic.name] = {
          routes: lifecycleTopic.routes,
          payloadSchema: { type: "object" },
          visibility: "public",
          notes: lifecycleTopic.notes
        };
      }
    }
    
    // Process beat event topics (these become routed topics)
    const beatTopics = extractTopicsFromSequenceBeats(seq);
    for (const beatTopic of beatTopics) {
      if (!topics[beatTopic.name]) {
        topics[beatTopic.name] = {
          routes: [{ pluginId: beatTopic.pluginId, sequenceId: beatTopic.sequenceId }],
          payloadSchema: { type: "object" },
          visibility: "public",
          notes: beatTopic.notes
        };
      }
    }
  }

  // Add backward compatibility aliases from sequence declarations
  const aliasesToAdd = {};
  for (const seq of sequences) {
    if (seq.sequence?.topicAliases) {
      for (const alias of seq.sequence.topicAliases) {
        const canonicalTopic = alias.canonical || alias.from;
        const aliasName = alias.alias || alias.to;
        
        if (topics[canonicalTopic] && !topics[aliasName]) {
          aliasesToAdd[aliasName] = {
            ...topics[canonicalTopic],
            notes: `Backward compatibility alias for ${canonicalTopic} (declared by ${seq.pluginId})`
          };
        }
      }
    }
  }
  
  // Add legacy svg-node aliases if no explicit aliases were declared (temporary fallback)
  for (const [topicName, topicData] of Object.entries(topics)) {
    if (topicName.includes('svg.node')) {
      const aliasName = topicName.replace(/svg\.node/g, 'svg-node');
      if (aliasName !== topicName && !topics[aliasName] && !aliasesToAdd[aliasName]) {
        aliasesToAdd[aliasName] = {
          ...topicData,
          notes: `Legacy backward compatibility alias for ${topicName} (auto-generated)`
        };
      }
    }
  }
  
  // Add the aliases to the topics catalog
  Object.assign(topics, aliasesToAdd);

  return { version: "1.0.0", topics };
}

export async function generateExternalInteractionsCatalog() {
  const sequences = await discoverSequenceFiles();
  const routes = {};
  
  for (const seq of sequences) {
    const interaction = deriveInteractionFromSequence(seq);
    if (interaction) {
      routes[interaction.route] = {
        pluginId: interaction.pluginId,
        sequenceId: interaction.sequenceId
      };
    }
  }
  
  return { routes };
}

// CLI usage
async function main() {
  const topics = await generateExternalTopicsCatalog();
  const interactions = await generateExternalInteractionsCatalog();

  console.log("🔍 Derived from external sequences (node_modules):");
  console.log("Topics:", Object.keys(topics.topics).length);
  console.log("Interactions:", Object.keys(interactions.routes).length);

  // Write to temp files for inspection
  await fs.writeFile(
    join(rootDir, "derived-external-topics.json"),
    JSON.stringify(topics, null, 2)
  );
  await fs.writeFile(
    join(rootDir, "derived-external-interactions.json"),
    JSON.stringify(interactions, null, 2)
  );

  console.log("✅ Written derived catalogs to temp files");
}

// Always run when called directly
main().catch(console.error);
