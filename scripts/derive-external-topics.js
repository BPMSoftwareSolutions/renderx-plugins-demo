#!/usr/bin/env node

/**
 * Derive topics and interactions from external package sequence files.
 * This eliminates the need for redundant local catalog files for externalized plugins.
 * 
 * Strategy:
 * 1. Scan public/json-sequences/ for sequence files from external packages
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
  // Auto-derive topic name from sequence ID by removing common suffixes and converting to dot notation
  const id = seq.sequenceId;
  if (!id) return null;

  // Remove common symphony suffixes
  let topicName = id
    .replace(/-symphony$/, '')
    .replace(/-sequence$/, '')
    .replace(/-seq$/, '');

  // Convert kebab-case to dot notation
  topicName = topicName.replace(/-/g, '.');

  // Handle special cases for better topic naming
  if (topicName.includes('ui.theme')) {
    // Keep app.ui.theme.* as-is since it's already well-formed
    return topicName.replace(/^header\./, 'app.');
  }

  const isLibraryComponent = (seq.pluginId && /LibraryComponent/i.test(seq.pluginId)) || (seq.file && seq.file.startsWith('library-component/'));

  // Special handling for drag operations - enforce .start.requested
  if (topicName.includes('component.drag') && !topicName.includes('start')) {
    topicName = topicName.replace('component.drag', 'component.drag.start');
  }

  // Ensure .requested suffix
  if (!topicName.endsWith('.requested')) {
    topicName = topicName + '.requested';
  }

  // Final normalization rules for library-component topics
  if (isLibraryComponent) {
    // Only collapse the container path: library.component.container.* -> library.container.*
    topicName = topicName.replace(/^library\.component\.container\./, 'library.container.');
    // Keep other library.component.* topics (drag, drop, etc.) as-is
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
        const topicName = beat.event.replace(/:/g, '.');
        
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

      // Special handling to ensure resize.move follows drag.move pattern
      // Both should route on the base topic, not .requested variants
      let routedTopicName = topicName;
      if (topicName.includes('resize.move') || topicName.includes('drag.move')) {
        // For move operations, always route to the base topic
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
