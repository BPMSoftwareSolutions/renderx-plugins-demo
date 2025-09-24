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
  const sequencesDir = join(rootDir, "public", "json-sequences");
  const externalDirs = ["library-component", "canvas-component", "header", "library", "control-panel"];
  const sequences = [];

  for (const dir of externalDirs) {
    const dirPath = join(sequencesDir, dir);
    try {
      const files = await readdir(dirPath);
      for (const file of files) {
        if (file.endsWith(".json") && file !== "index.json") {
          const filePath = join(dirPath, file);
          const sequence = await readJsonSafe(filePath);
          if (sequence && sequence.pluginId) {
            sequences.push({
              pluginId: sequence.pluginId,
              sequenceId: sequence.id,
              file: `${dir}/${file}`,
              sequence
            });
          }
        }
      }
    } catch {
      // Directory doesn't exist, skip
    }
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


  // Special handling for drag operations - enforce .start.requested
  if (topicName.includes('component.drag') && !topicName.includes('start')) {
    topicName = topicName.replace('component.drag', 'component.drag.start');
  }

  // Ensure .requested suffix
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

export async function generateExternalTopicsCatalog() {
  const sequences = await discoverSequenceFiles();
  const topics = {};

  for (const seq of sequences) {
    const topicName = deriveTopicFromSequence(seq);
    if (!topicName) continue;

    const isRequested = /\.requested(-|\.|$)/.test(seq.sequenceId) || /requested/.test(seq.sequenceId);
    const existing = topics[topicName]?.routes?.[0]?.sequenceId;
    const existingIsRequested = existing ? (/\.requested(-|\.|$)/.test(existing) || /requested/.test(existing)) : false;

    if (!existing || (isRequested && !existingIsRequested)) {
      topics[topicName] = {
        routes: [{ pluginId: seq.pluginId, sequenceId: seq.sequenceId }],
        payloadSchema: { type: "object" },
        visibility: "public",
        notes: `Auto-derived from ${seq.file}`
      };
    }
  }

  // Add notify-only topics that are published by the host but have no routes
  const notifyOnly = [
    "canvas.component.drag.start",
    "canvas.component.drag.move",
    "canvas.component.drag.end",
    "library.component.drag.start",
    "library.component.drag.end",
    "canvas.component.resize.start",
    "canvas.component.resize.move",
    "canvas.component.resize.end",
    "canvas.component.selections.cleared",
    "canvas.component.created",
    // Control Panel publishes selection updates to inform UI; no routes
    "control.panel.selection.updated"
  ];
  for (const t of notifyOnly) {
    if (!topics[t]) {
      topics[t] = {
        routes: [],
        payloadSchema: { type: "object" },
        visibility: "public",
        notes: "Notify-only (no routes); required for runtime publishes"
      };
    }
  }

  // Bridge host-published selection topic to Control Panel selection.show
  try {
    const cpSelectionShow = sequences.find(
      (s) => s.pluginId === "ControlPanelPlugin" && s.sequenceId === "control-panel-selection-show-symphony"
    );
    if (cpSelectionShow) {
      topics["canvas.component.selection.changed"] = {
        routes: [
          { pluginId: cpSelectionShow.pluginId, sequenceId: cpSelectionShow.sequenceId }
        ],
        payloadSchema: { type: "object" },
        visibility: "public",
        notes: "Bridged: canvas.component.selection.changed -> ControlPanel selection.show"
      };
    }
  } catch {}

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

  console.log("🔍 Derived from external sequences:");
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
