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

async function discoverSequenceFiles() {
  const sequencesDir = join(rootDir, "public", "json-sequences");
  const externalDirs = ["library-component", "canvas-component", "header", "library"];
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
  // Extract topic name from sequence ID
  // e.g., "library-component-drop-symphony" -> "library.component.drop.requested"
  const id = seq.sequenceId;
  if (!id) return null;
  
  // Map known sequence patterns to topic names
  const topicMappings = {
    "library-component-drag-symphony": "library.component.drag.start.requested",
    "library-component-drop-symphony": "library.component.drop.requested", 
    "library-component-container-drop-symphony": "library.container.drop.requested",
    "library-load-symphony": "library.load.requested"
  };
  
  return topicMappings[id] || null;
}

function deriveInteractionFromSequence(seq) {
  // Extract interaction route from sequence ID
  const id = seq.sequenceId;
  if (!id) return null;
  
  // Map known sequence patterns to interaction routes
  const routeMappings = {
    "library-component-drag-symphony": "library.component.drag.start",
    "library-component-drop-symphony": "library.component.drop",
    "library-component-container-drop-symphony": "library.container.drop", 
    "library-load-symphony": "library.load"
  };
  
  const route = routeMappings[id];
  return route ? {
    route,
    pluginId: seq.pluginId,
    sequenceId: seq.sequenceId
  } : null;
}

export async function generateExternalTopicsCatalog() {
  const sequences = await discoverSequenceFiles();
  const topics = {};
  
  for (const seq of sequences) {
    const topicName = deriveTopicFromSequence(seq);
    if (topicName) {
      topics[topicName] = {
        routes: [{
          pluginId: seq.pluginId,
          sequenceId: seq.sequenceId
        }],
        payloadSchema: { type: "object" },
        visibility: "public",
        notes: `Auto-derived from ${seq.file}`
      };
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
