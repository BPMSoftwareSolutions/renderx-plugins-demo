/**
 * ESLint rule: validate-plugin-ids
 *
 * Validates plugin IDs in catalog JSON files to ensure:
 * 1. Consistent naming convention (PascalCase ending with "Plugin")
 * 2. Cross-reference validation (plugin IDs in interactions/topics exist in manifest)
 * 3. Uniqueness (no duplicate plugin IDs in manifest)
 * 4. Reserved name prevention
 *
 * This rule operates on JSON imports and validates the structure at runtime.
 */

import fs from "node:fs";
import path from "node:path";

// Plugin ID naming convention: PascalCase ending with "Plugin"
const PLUGIN_ID_PATTERN = /^[A-Z][a-zA-Z0-9]*Plugin$/;

// Reserved plugin ID patterns that should not be used
const RESERVED_PATTERNS = [
  /^System.*Plugin$/,
  /^Core.*Plugin$/,
  /^Host.*Plugin$/,
  /^Runtime.*Plugin$/,
];

function loadPluginManifest(context) {
  try {
    const cwd = context.getCwd?.() || process.cwd();

    // Prefer generated manifest (includes npm packages)
    const generatedPath = path.join(cwd, "catalog", "json-plugins", ".generated", "plugin-manifest.json");
    if (fs.existsSync(generatedPath)) {
      const content = fs.readFileSync(generatedPath, "utf8");
      return JSON.parse(content);
    }

    // Fallback to source manifest
    const sourcePath = path.join(cwd, "catalog", "json-plugins", "plugin-manifest.json");
    if (fs.existsSync(sourcePath)) {
      const content = fs.readFileSync(sourcePath, "utf8");
      return JSON.parse(content);
    }

    return null;
  } catch (_error) {
    return null;
  }
}

function loadCatalogFiles(context, catalogType) {
  try {
    const cwd = context.getCwd?.() || process.cwd();
    const catalogDir = path.join(cwd, "catalog", catalogType);
    
    if (!fs.existsSync(catalogDir)) {
      return {};
    }
    
    const files = fs.readdirSync(catalogDir).filter(f => f.endsWith('.json'));
    const catalogData = {};
    
    for (const file of files) {
      try {
        const filePath = path.join(catalogDir, file);
        const content = fs.readFileSync(filePath, "utf8");
        catalogData[file] = JSON.parse(content);
      } catch (_error) {
        // Skip invalid JSON files
      }
    }
    
    return catalogData;
  } catch (_error) {
    return {};
  }
}

function validatePluginIdNaming(pluginId) {
  const errors = [];
  
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
  
  Object.values(interactions).forEach(file => {
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
  
  Object.values(topics).forEach(file => {
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

const rule = {
  meta: {
    type: "problem",
    docs: {
      description: "Validate plugin IDs in catalog JSON files for naming conventions and cross-references",
      category: "Best Practices",
      recommended: true,
    },
    schema: [],
    messages: {
      invalidNaming: "{{message}}",
      duplicateId: "Duplicate plugin ID '{{pluginId}}' found in manifest",
      missingReference: "Plugin ID '{{pluginId}}' referenced in {{fileType}} but not found in manifest",
      manifestNotFound: "Plugin manifest not found (checked .generated/plugin-manifest.json and plugin-manifest.json)",
    },
  },

  create(context) {
    const filename = context.getFilename?.() || "";
    
    // Only validate JSON imports in specific catalog directories
    const isCatalogFile = /[/\\]catalog[/\\](json-plugins|json-interactions|json-components[/\\]json-topics)[/\\]/.test(filename);
    if (!isCatalogFile) {
      return {};
    }

    return {
      ImportDeclaration(node) {
        // Only process JSON imports
        if (!node.source?.value?.endsWith?.('.json')) {
          return;
        }
        
        const importPath = node.source.value;
        
        // Check if this is a plugin manifest import
        if (importPath.includes('plugin-manifest.json')) {
          // Validate plugin manifest
          const manifest = loadPluginManifest(context);
          if (!manifest) {
            context.report({
              node,
              messageId: "manifestNotFound"
            });
            return;
          }
          
          const pluginIds = extractPluginIdsFromManifest(manifest);
          const seenIds = new Set();
          
          // Validate each plugin ID
          pluginIds.forEach(pluginId => {
            // Check for duplicates
            if (seenIds.has(pluginId)) {
              context.report({
                node,
                messageId: "duplicateId",
                data: { pluginId }
              });
              return;
            }
            seenIds.add(pluginId);
            
            // Validate naming convention
            const namingErrors = validatePluginIdNaming(pluginId);
            namingErrors.forEach(error => {
              context.report({
                node,
                messageId: "invalidNaming",
                data: { message: error.message }
              });
            });
          });
        }
        
        // Validate cross-references for interaction and topic files
        if (importPath.includes('json-interactions/') || importPath.includes('json-topics/')) {
          const manifest = loadPluginManifest(context);
          if (!manifest) return;
          
          const manifestPluginIds = new Set(extractPluginIdsFromManifest(manifest));
          
          let referencedPluginIds = [];
          let fileType = '';
          
          if (importPath.includes('json-interactions/')) {
            const interactions = loadCatalogFiles(context, 'json-interactions');
            referencedPluginIds = extractPluginIdsFromInteractions(interactions);
            fileType = 'interactions';
          } else if (importPath.includes('json-topics/')) {
            const topics = loadCatalogFiles(context, 'json-components/json-topics');
            referencedPluginIds = extractPluginIdsFromTopics(topics);
            fileType = 'topics';
          }
          
          // Check for missing references
          referencedPluginIds.forEach(pluginId => {
            if (!manifestPluginIds.has(pluginId)) {
              context.report({
                node,
                messageId: "missingReference",
                data: { pluginId, fileType }
              });
            }
          });
        }
      }
    };
  },
};

export default {
  rules: {
    "validate-plugin-ids": rule,
  },
};
