const fs = require("fs");
const path = require("path");

/**
 * ESLint rule to validate plugin registration consistency
 * 
 * Checks for discrepancies between:
 * 1. Plugin manifest runtime declarations
 * 2. Plugin register() function implementations  
 * 3. JSON catalog sequence expectations
 * 4. Topic route dependencies
 */

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

function loadJsonCatalogs(context) {
  try {
    const cwd = context.getCwd?.() || process.cwd();
    const catalogs = {};
    
    // Load interaction catalogs
    const interactionsDir = path.join(cwd, "catalog", "json-interactions");
    if (fs.existsSync(interactionsDir)) {
      const files = fs.readdirSync(interactionsDir).filter(f => f.endsWith('.json'));
      files.forEach(file => {
        try {
          const content = fs.readFileSync(path.join(interactionsDir, file), "utf8");
          catalogs[`interactions/${file}`] = JSON.parse(content);
        } catch (_error) {
          // Skip invalid JSON files
        }
      });
    }
    
    // Load topic catalogs
    const topicsDir = path.join(cwd, "catalog", "json-components", "json-topics");
    if (fs.existsSync(topicsDir)) {
      const files = fs.readdirSync(topicsDir).filter(f => f.endsWith('.json'));
      files.forEach(file => {
        try {
          const content = fs.readFileSync(path.join(topicsDir, file), "utf8");
          catalogs[`topics/${file}`] = JSON.parse(content);
        } catch (_error) {
          // Skip invalid JSON files
        }
      });
    }
    
    return catalogs;
  } catch (_error) {
    return {};
  }
}

function validateModuleImport(runtimeModule, runtimeExport, context) {
  try {
    // For ESLint context, we need to use require.resolve to check if module exists
    // and then try to require it to validate exports
    const cwd = context.getCwd?.() || process.cwd();

    // Try to resolve the module path
    let resolvedPath;
    try {
      resolvedPath = require.resolve(runtimeModule, { paths: [cwd] });
    } catch (resolveError) {
      return {
        canImport: false,
        hasExport: false,
        isFunction: false,
        error: `Cannot resolve module '${runtimeModule}': ${resolveError.message}`
      };
    }

    // Try to require the module
    let module;
    try {
      // Clear require cache to get fresh module
      delete require.cache[resolvedPath];
      module = require(resolvedPath);
    } catch (requireError) {
      return {
        canImport: false,
        hasExport: false,
        isFunction: false,
        error: `Cannot require module '${runtimeModule}': ${requireError.message}`
      };
    }

    // Check if the expected export exists
    const exportValue = module[runtimeExport] || module.default?.[runtimeExport];
    if (!exportValue) {
      return {
        canImport: true,
        hasExport: false,
        isFunction: false,
        error: `Module '${runtimeModule}' does not export '${runtimeExport}'`
      };
    }

    // Check if the export is a function (register functions should be functions)
    if (typeof exportValue !== 'function') {
      return {
        canImport: true,
        hasExport: true,
        isFunction: false,
        error: `Export '${runtimeExport}' in '${runtimeModule}' is not a function (got ${typeof exportValue})`
      };
    }

    return {
      canImport: true,
      hasExport: true,
      isFunction: true,
      error: null
    };
  } catch (error) {
    return {
      canImport: false,
      hasExport: false,
      isFunction: false,
      error: `Unexpected error validating module '${runtimeModule}': ${error.message}`
    };
  }
}

function analyzePluginRegistration(pluginId, manifest, catalogs) {
  const plugin = manifest.plugins?.find(p => p.id === pluginId);
  if (!plugin) return null;

  const analysis = {
    pluginId,
    hasRuntimeEntry: !!plugin.runtime,
    hasUiEntry: !!plugin.ui,
    runtimeModule: plugin.runtime?.module,
    runtimeExport: plugin.runtime?.export,
    expectedSequences: new Set(),
    issues: []
  };
  
  // Find sequences expected from this plugin in catalogs
  Object.entries(catalogs).forEach(([catalogPath, catalog]) => {
    // Check interactions
    if (catalog.routes) {
      Object.entries(catalog.routes).forEach(([route, config]) => {
        if (config.pluginId === pluginId && config.sequenceId) {
          analysis.expectedSequences.add(config.sequenceId);
        }
      });
    }
    
    // Check topics
    if (catalog.topics) {
      Object.values(catalog.topics).forEach(topic => {
        if (Array.isArray(topic.routes)) {
          topic.routes.forEach(route => {
            if (route.pluginId === pluginId && route.sequenceId) {
              analysis.expectedSequences.add(route.sequenceId);
            }
          });
        }
      });
    }
  });
  
  // Analyze consistency
  if (analysis.hasRuntimeEntry && analysis.expectedSequences.size === 0) {
    analysis.issues.push({
      type: "unused-runtime",
      message: `Plugin '${pluginId}' has runtime entry but no sequences are expected from it`
    });
  }

  if (!analysis.hasRuntimeEntry && analysis.expectedSequences.size > 0) {
    analysis.issues.push({
      type: "missing-runtime",
      message: `Plugin '${pluginId}' has no runtime entry but sequences are expected: ${Array.from(analysis.expectedSequences).join(', ')}`
    });
  }

  if (analysis.hasRuntimeEntry && analysis.expectedSequences.size > 0) {
    analysis.issues.push({
      type: "verify-implementation",
      message: `Plugin '${pluginId}' should register sequences: ${Array.from(analysis.expectedSequences).join(', ')}`
    });
  }

  // Add module validation for runtime entries
  if (analysis.hasRuntimeEntry) {
    analysis.issues.push({
      type: "validate-module",
      message: `Plugin '${pluginId}' runtime module needs validation: ${analysis.runtimeModule}`
    });
  }

  return analysis;
}

const rule = {
  meta: {
    type: "problem",
    docs: {
      description: "Validate plugin registration consistency between manifest, implementations, and catalog expectations",
      category: "Possible Errors",
      recommended: true
    },
    fixable: null,
    schema: [],
    messages: {
      manifestNotFound: "Plugin manifest not found (checked .generated/plugin-manifest.json and plugin-manifest.json)",
      unusedRuntime: "Plugin '{{pluginId}}' has runtime entry but no sequences are expected from it",
      missingRuntime: "Plugin '{{pluginId}}' has no runtime entry but sequences are expected: {{sequences}}",
      verifyImplementation: "Plugin '{{pluginId}}' should register sequences: {{sequences}}. Verify register() function implementation.",
      moduleImportFailed: "Plugin '{{pluginId}}' runtime module cannot be imported: {{module}} - {{error}}",
      moduleExportMissing: "Plugin '{{pluginId}}' runtime module '{{module}}' does not export '{{export}}'",
      moduleExportNotFunction: "Plugin '{{pluginId}}' runtime export '{{export}}' in '{{module}}' is not a function",
      inconsistentRegistration: "Plugin registration inconsistency detected for '{{pluginId}}'"
    }
  },

  create(context) {
    // Only apply to JSON imports in catalog directories
    const filename = context.getFilename();
    if (!filename.includes("catalog") || !filename.includes(".json")) {
      return {};
    }

    return {
      Program(node) {
        const manifest = loadPluginManifest(context);
        if (!manifest) {
          context.report({
            node,
            messageId: "manifestNotFound"
          });
          return;
        }

        const catalogs = loadJsonCatalogs(context);
        const pluginIds = new Set(manifest.plugins?.map(p => p.id) || []);
        
        // Analyze each plugin for registration consistency
        pluginIds.forEach(pluginId => {
          const analysis = analyzePluginRegistration(pluginId, manifest, catalogs);
          if (!analysis || analysis.issues.length === 0) return;

          analysis.issues.forEach(issue => {
            switch (issue.type) {
              case "unused-runtime":
                context.report({
                  node,
                  messageId: "unusedRuntime",
                  data: { pluginId }
                });
                break;
              case "missing-runtime":
                context.report({
                  node,
                  messageId: "missingRuntime",
                  data: {
                    pluginId,
                    sequences: Array.from(analysis.expectedSequences).join(', ')
                  }
                });
                break;
              case "verify-implementation":
                context.report({
                  node,
                  messageId: "verifyImplementation",
                  data: {
                    pluginId,
                    sequences: Array.from(analysis.expectedSequences).join(', ')
                  }
                });
                break;
              case "validate-module":
                // Perform module validation
                if (analysis.runtimeModule && analysis.runtimeExport) {
                  const validation = validateModuleImport(analysis.runtimeModule, analysis.runtimeExport, context);

                  if (!validation.canImport) {
                    context.report({
                      node,
                      messageId: "moduleImportFailed",
                      data: {
                        pluginId,
                        module: analysis.runtimeModule,
                        error: validation.error
                      }
                    });
                  } else if (!validation.hasExport) {
                    context.report({
                      node,
                      messageId: "moduleExportMissing",
                      data: {
                        pluginId,
                        module: analysis.runtimeModule,
                        export: analysis.runtimeExport
                      }
                    });
                  } else if (!validation.isFunction) {
                    context.report({
                      node,
                      messageId: "moduleExportNotFunction",
                      data: {
                        pluginId,
                        module: analysis.runtimeModule,
                        export: analysis.runtimeExport
                      }
                    });
                  }
                }
                break;
            }
          });
        });
      }
    };
  }
};

module.exports = {
  rules: {
    "validate-plugin-registration": rule,
  },
};
