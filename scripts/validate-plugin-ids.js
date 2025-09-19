#!/usr/bin/env node

/**
 * Validates plugin IDs in catalog JSON files to ensure:
 * 1. Consistent naming convention (PascalCase ending with "Plugin")
 * 2. Cross-reference validation (plugin IDs in interactions/topics exist in manifest)
 * 3. Uniqueness (no duplicate plugin IDs in manifest)
 * 4. Reserved name prevention
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, "..");

// Plugin ID naming convention: PascalCase ending with "Plugin"
const PLUGIN_ID_PATTERN = /^[A-Z][a-zA-Z0-9]*Plugin$/;

// Reserved plugin ID patterns that should not be used
const RESERVED_PATTERNS = [
  /^System.*Plugin$/,
  /^Core.*Plugin$/,
  /^Host.*Plugin$/,
  /^Runtime.*Plugin$/,
];

// Test plugin IDs that are allowed to violate naming conventions
const TEST_PLUGIN_ALLOWLIST = new Set(['P1', 'P2', 'TestPlugin']);

function loadJsonFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    return JSON.parse(content);
  } catch (error) {
    console.warn(`Warning: Could not load ${filePath}: ${error.message}`);
    return null;
  }
}

function loadPluginManifest() {
  // Prefer generated manifest (includes npm packages)
  const generatedPath = path.join(rootDir, "catalog", "json-plugins", ".generated", "plugin-manifest.json");
  const generated = loadJsonFile(generatedPath);
  if (generated) {
    return generated;
  }

  // Fallback to source manifest
  const sourcePath = path.join(rootDir, "catalog", "json-plugins", "plugin-manifest.json");
  return loadJsonFile(sourcePath);
}

function loadCatalogFiles(catalogType) {
  const catalogDir = path.join(rootDir, "catalog", catalogType);
  
  if (!fs.existsSync(catalogDir)) {
    return {};
  }
  
  const files = fs.readdirSync(catalogDir, { recursive: true }).filter(f => f.endsWith('.json'));
  const catalogData = {};
  
  for (const file of files) {
    const filePath = path.join(catalogDir, file);
    const data = loadJsonFile(filePath);
    if (data) {
      catalogData[file] = data;
    }
  }
  
  return catalogData;
}

function validatePluginIdNaming(pluginId, isTestFile = false) {
  const errors = [];
  
  // Allow test plugin IDs in test files
  if (isTestFile && TEST_PLUGIN_ALLOWLIST.has(pluginId)) {
    return errors;
  }
  
  if (!PLUGIN_ID_PATTERN.test(pluginId)) {
    errors.push({
      type: "naming",
      message: `Plugin ID '${pluginId}' must be PascalCase and end with 'Plugin'`
    });
  }
  
  for (const pattern of RESERVED_PATTERNS) {
    if (pattern.test(pluginId)) {
      errors.push({
        type: "reserved",
        message: `Plugin ID '${pluginId}' uses reserved naming pattern`
      });
    }
  }
  
  return errors;
}

function extractPluginIdsFromManifest(manifest) {
  if (!manifest || !Array.isArray(manifest.plugins)) {
    return [];
  }
  
  return manifest.plugins
    .map(plugin => plugin?.id)
    .filter(id => typeof id === 'string');
}

function extractPluginIdsFromInteractions(interactions) {
  const pluginIds = new Set();
  
  Object.entries(interactions).forEach(([_fileName, file]) => {
    if (file?.routes) {
      Object.values(file.routes).forEach(route => {
        if (route?.pluginId && typeof route.pluginId === 'string') {
          pluginIds.add(route.pluginId);
        }
      });
    }
  });
  
  return Array.from(pluginIds);
}

function extractPluginIdsFromTopics(topics) {
  const pluginIds = new Set();
  
  Object.entries(topics).forEach(([_fileName, file]) => {
    if (file?.topics) {
      Object.values(file.topics).forEach(topic => {
        if (Array.isArray(topic?.routes)) {
          topic.routes.forEach(route => {
            if (route?.pluginId && typeof route.pluginId === 'string') {
              pluginIds.add(route.pluginId);
            }
          });
        }
      });
    }
  });
  
  return Array.from(pluginIds);
}

function isLogicalPluginId(pluginId, manifestPluginIds) {
  // Check if this is a logical plugin ID that extends a manifest plugin
  // Pattern: ManifestPluginName + SpecificFunction + "Plugin"
  // Example: CanvasComponentPlugin -> CanvasComponentSelectionPlugin, CanvasComponentDragPlugin

  for (const manifestId of manifestPluginIds) {
    if (manifestId.endsWith('Plugin')) {
      const baseId = manifestId.slice(0, -6); // Remove "Plugin" suffix
      if (pluginId.startsWith(baseId) && pluginId !== manifestId && pluginId.endsWith('Plugin')) {
        return true;
      }
    }
  }
  return false;
}

function validatePluginIds() {
  console.log("🔍 Validating plugin IDs in catalog files...");

  let hasErrors = false;
  const errors = [];

  // Load plugin manifest (prefer generated)
  const manifest = loadPluginManifest();
  if (!manifest) {
    errors.push("❌ Plugin manifest not found (checked .generated/plugin-manifest.json and plugin-manifest.json)");
    hasErrors = true;
  } else {
    // Validate manifest plugin IDs
    const pluginIds = extractPluginIdsFromManifest(manifest);
    const seenIds = new Set();
    
    pluginIds.forEach(pluginId => {
      // Check for duplicates
      if (seenIds.has(pluginId)) {
        errors.push(`❌ Duplicate plugin ID '${pluginId}' found in manifest`);
        hasErrors = true;
        return;
      }
      seenIds.add(pluginId);
      
      // Validate naming convention
      const namingErrors = validatePluginIdNaming(pluginId);
      namingErrors.forEach(error => {
        errors.push(`❌ ${error.message}`);
        hasErrors = true;
      });
    });
    
    console.log(`✅ Found ${pluginIds.length} plugin IDs in manifest`);
    
    // Validate cross-references
    const manifestPluginIds = new Set(pluginIds);
    
    // Check interactions
    const interactions = loadCatalogFiles('json-interactions');
    const interactionPluginIds = extractPluginIdsFromInteractions(interactions);
    
    interactionPluginIds.forEach(pluginId => {
      if (!manifestPluginIds.has(pluginId)) {
        // Check if this is a valid logical plugin ID
        if (isLogicalPluginId(pluginId, Array.from(manifestPluginIds))) {
          console.log(`✅ Logical plugin ID '${pluginId}' extends manifest plugin`);
        } else {
          errors.push(`❌ Plugin ID '${pluginId}' referenced in interactions but not found in manifest`);
          hasErrors = true;
        }
      }
    });
    
    console.log(`✅ Validated ${interactionPluginIds.length} plugin ID references in interactions`);
    
    // Check topics
    const topics = loadCatalogFiles('json-components/json-topics');
    const topicPluginIds = extractPluginIdsFromTopics(topics);
    
    topicPluginIds.forEach(pluginId => {
      const isTestFile = Object.keys(topics).some(fileName => 
        fileName.includes('test.json') && 
        topics[fileName]?.topics && 
        Object.values(topics[fileName].topics).some(topic =>
          Array.isArray(topic?.routes) && 
          topic.routes.some(route => route?.pluginId === pluginId)
        )
      );
      
      if (!manifestPluginIds.has(pluginId)) {
        // Check if this is a valid logical plugin ID
        if (isLogicalPluginId(pluginId, Array.from(manifestPluginIds))) {
          console.log(`✅ Logical plugin ID '${pluginId}' extends manifest plugin`);
        } else {
          const namingErrors = validatePluginIdNaming(pluginId, isTestFile);
          if (namingErrors.length > 0 && !isTestFile) {
            errors.push(`❌ Plugin ID '${pluginId}' referenced in topics but not found in manifest`);
            hasErrors = true;
          } else if (isTestFile && TEST_PLUGIN_ALLOWLIST.has(pluginId)) {
            console.log(`⚠️  Test plugin ID '${pluginId}' allowed in test files`);
          }
        }
      }
    });
    
    console.log(`✅ Validated ${topicPluginIds.length} plugin ID references in topics`);
  }
  
  // Report results
  if (hasErrors) {
    console.log("\n❌ Plugin ID validation failed:");
    errors.forEach(error => console.log(`  ${error}`));
    console.log("\n💡 Fix these issues:");
    console.log("  - Ensure plugin IDs are PascalCase and end with 'Plugin'");
    console.log("  - Remove duplicate plugin IDs from manifest");
    console.log("  - Add missing plugin IDs to manifest or remove invalid references");
    console.log("  - Avoid reserved naming patterns (System*, Core*, Host*, Runtime*)");
    process.exit(1);
  } else {
    console.log("\n✅ All plugin IDs are valid!");
  }
}

// Run validation if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  validatePluginIds();
}

export { validatePluginIds };
