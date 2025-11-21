#!/usr/bin/env node

/**
 * Phase 1: Analyze Catalog Manifests
 * 
 * Parses plugin-manifest.json and generates:
 * - catalog-manifest.json: All intended plugins and their registrations
 * - Validates plugin structure
 * - Extracts plugin requirements
 */

import { readFile, writeFile, mkdir } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, "..");

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

async function analyzeManifests() {
  console.log("📊 Phase 1: Analyzing Catalog Manifests");
  console.log("=" .repeat(60));

  const manifestFile = join(rootDir, "catalog", "json-plugins", "plugin-manifest.json");
  const outputDir = join(rootDir, "packages", "ographx", ".ographx", "artifacts", "renderx-web", "catalog");
  const outputFile = join(outputDir, "catalog-manifest.json");

  await ensureDir(outputDir);

  const manifestData = await readJsonFile(manifestFile);
  if (!manifestData) {
    console.error("❌ Failed to read plugin manifest");
    process.exit(1);
  }

  console.log(`✅ Loaded: ${manifestFile.replace(rootDir, "")}`);

  // Analyze plugins
  const plugins = manifestData.plugins || [];
  const uiPlugins = [];
  const runtimePlugins = [];
  const slots = new Set();
  const modules = new Set();

  plugins.forEach(plugin => {
    // UI plugins
    if (plugin.ui) {
      uiPlugins.push({
        id: plugin.id,
        slot: plugin.ui.slot,
        module: plugin.ui.module,
        export: plugin.ui.export
      });
      slots.add(plugin.ui.slot);
      modules.add(plugin.ui.module);
    }

    // Runtime plugins
    if (plugin.runtime) {
      runtimePlugins.push({
        id: plugin.id,
        module: plugin.runtime.module,
        export: plugin.runtime.export
      });
      modules.add(plugin.runtime.module);
    }
  });

  // Generate catalog
  const catalog = {
    metadata: {
      generated: new Date().toISOString(),
      phase: "Phase 1: Catalog Analysis",
      sourceFile: "catalog/json-plugins/plugin-manifest.json"
    },
    summary: {
      totalPlugins: plugins.length,
      uiPlugins: uiPlugins.length,
      runtimePlugins: runtimePlugins.length,
      totalSlots: slots.size,
      totalModules: modules.size
    },
    plugins: plugins.map(p => ({
      id: p.id,
      hasUI: !!p.ui,
      hasRuntime: !!p.runtime,
      ui: p.ui ? {
        slot: p.ui.slot,
        module: p.ui.module,
        export: p.ui.export
      } : null,
      runtime: p.runtime ? {
        module: p.runtime.module,
        export: p.runtime.export
      } : null
    })),
    uiPlugins,
    runtimePlugins,
    slots: Array.from(slots).sort(),
    modules: Array.from(modules).sort()
  };

  // Write output
  await writeFile(outputFile, JSON.stringify(catalog, null, 2));
  console.log("\n" + "=" .repeat(60));
  console.log(`📝 Output: ${outputFile.replace(rootDir, "")}`);
  console.log(`📊 Summary:`);
  console.log(`   - Total Plugins: ${plugins.length}`);
  console.log(`   - UI Plugins: ${uiPlugins.length}`);
  console.log(`   - Runtime Plugins: ${runtimePlugins.length}`);
  console.log(`   - Slots: ${slots.size}`);
  console.log(`   - Modules: ${modules.size}`);
  console.log("✅ Phase 1 Complete: Catalog Manifests Analyzed");
}

analyzeManifests().catch(err => {
  console.error("❌ Error:", err);
  process.exit(1);
});

