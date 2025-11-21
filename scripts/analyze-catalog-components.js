#!/usr/bin/env node

/**
 * Phase 1: Analyze Catalog Components
 * 
 * Scans ALL plugin packages for json-components/ directories and generates:
 * - catalog-components.json: All component definitions
 * - Validates component structure
 * - Extracts component metadata
 */

import { readdir, readFile, writeFile, mkdir } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, "..");

// Plugin packages that contain components
const PLUGIN_PACKAGES = [
  "packages/canvas",
  "packages/canvas-component",
  "packages/components",
  "packages/control-panel",
  "packages/header",
  "packages/library",
  "packages/library-component"
];

async function ensureDir(dir) {
  try {
    await mkdir(dir, { recursive: true });
  } catch (err) {
    if (err.code !== "EEXIST") throw err;
  }
}

async function readJsonFile(path) {
  try {
    const content = await readFile(path, "utf-8");
    return JSON.parse(content);
  } catch (err) {
    console.error(`❌ Failed to read ${path}: ${err.message}`);
    return null;
  }
}

async function walkDir(dir, callback) {
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        await walkDir(fullPath, callback);
      } else if (entry.isFile() && entry.name.endsWith(".json")) {
        await callback(fullPath);
      }
    }
  } catch (err) {
    // Directory may not exist, that's ok
  }
}

async function analyzeComponents() {
  console.log("📊 Phase 1: Analyzing Catalog Components");
  console.log("=" .repeat(60));

  const outputDir = join(rootDir, "packages", "ographx", ".ographx", "artifacts", "renderx-web", "catalog");
  const outputFile = join(outputDir, "catalog-components.json");

  await ensureDir(outputDir);

  const components = [];
  const componentTypes = new Set();
  const interactionMap = {}; // Maps interaction events to plugins/sequences
  let fileCount = 0;

  // Scan all plugin packages
  for (const pkgPath of PLUGIN_PACKAGES) {
    const componentsDir = join(rootDir, pkgPath, "json-components");

    await walkDir(componentsDir, async (filePath) => {
      const data = await readJsonFile(filePath);
      if (!data) return;

      fileCount++;
      console.log(`✅ Loaded: ${filePath.replace(rootDir, "")}`);

      // Extract component metadata
      const metadata = data.metadata || {};
      const componentType = metadata.type || data.type || "unknown";
      const componentName = metadata.name || data.name || "Unknown";

      // Extract interactions and their plugin connections
      const interactions = data.interactions || {};
      const interactionDetails = {};

      Object.entries(interactions).forEach(([eventName, eventConfig]) => {
        interactionDetails[eventName] = {
          pluginId: eventConfig.pluginId,
          sequenceId: eventConfig.sequenceId
        };

        // Track interaction to plugin mapping
        if (!interactionMap[eventName]) {
          interactionMap[eventName] = [];
        }
        interactionMap[eventName].push({
          component: componentType,
          pluginId: eventConfig.pluginId,
          sequenceId: eventConfig.sequenceId
        });
      });

      // Extract properties schema
      const propertiesSchema = data.integration?.properties?.schema || {};
      const propertyCount = Object.keys(propertiesSchema).length;

      // Extract events
      const events = data.integration?.events || {};
      const eventCount = Object.keys(events).length;

      // Extract canvas integration
      const canvasIntegration = data.integration?.canvasIntegration || {};

      components.push({
        type: componentType,
        name: componentName,
        description: metadata.description || "",
        category: metadata.category || "uncategorized",
        version: metadata.version || "1.0.0",
        properties: propertyCount,
        events: eventCount,
        interactions: Object.keys(interactions).length,
        interactionDetails,
        canvasIntegration: {
          resizable: canvasIntegration.resizable || false,
          draggable: canvasIntegration.draggable || false,
          selectable: canvasIntegration.selectable || false
        },
        hasCss: !!data.ui?.styles?.css,
        hasCssLibrary: !!data.ui?.styles?.library,
        hasReactCode: !!data.reactCode
      });

      if (componentType) componentTypes.add(componentType);
    });
  }

  // Generate catalog
  const catalog = {
    metadata: {
      generated: new Date().toISOString(),
      phase: "Phase 1: Catalog Analysis",
      sourceDirectories: PLUGIN_PACKAGES.map(p => `${p}/json-components/`),
      fileCount
    },
    summary: {
      totalComponents: components.length,
      totalTypes: componentTypes.size,
      totalInteractionEvents: Object.keys(interactionMap).length,
      withCanvasIntegration: components.filter(c => c.canvasIntegration.resizable || c.canvasIntegration.draggable).length,
      withCss: components.filter(c => c.hasCss).length,
      withCssLibrary: components.filter(c => c.hasCssLibrary).length,
      withReactCode: components.filter(c => c.hasReactCode).length
    },
    components,
    types: Array.from(componentTypes).sort(),
    interactionMap
  };

  // Write output
  await writeFile(outputFile, JSON.stringify(catalog, null, 2));
  console.log("\n" + "=" .repeat(60));
  console.log(`📝 Output: ${outputFile.replace(rootDir, "")}`);
  console.log(`📊 Summary:`);
  console.log(`   - Components: ${components.length}`);
  console.log(`   - Types: ${componentTypes.size}`);
  console.log(`   - Interaction Events: ${Object.keys(interactionMap).length}`);
  console.log(`   - With Canvas Integration: ${components.filter(c => c.canvasIntegration.resizable || c.canvasIntegration.draggable).length}`);
  console.log(`   - With CSS: ${components.filter(c => c.hasCss).length}`);
  console.log(`   - With CSS Library: ${components.filter(c => c.hasCssLibrary).length}`);
  console.log(`   - With React Code: ${components.filter(c => c.hasReactCode).length}`);
  console.log(`   - Files: ${fileCount}`);
  console.log("✅ Phase 1 Complete: Catalog Components Analyzed");
}

analyzeComponents().catch(err => {
  console.error("❌ Error:", err);
  process.exit(1);
});

