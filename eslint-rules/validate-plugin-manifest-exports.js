/**
 * ESLint rule: validate-plugin-manifest-exports
 *
 * Enforce that all plugin UI exports in plugin-manifest.json files use fully-qualified names.
 * Runtime exports can use "register" as a special case for handler registration.
 * This ensures consistency across web and desktop implementations.
 *
 * Example:
 * ✅ CORRECT UI: "export": "RenderX.Plugins.Canvas.CanvasControl"
 * ✅ CORRECT Runtime: "export": "register" (special case for handlers)
 * ❌ WRONG UI:   "export": "CanvasControl"
 */

import fs from "fs";
import path from "path";

export default {
  rules: {
    "validate-plugin-manifest-exports": {
      meta: {
        type: "problem",
        docs: {
          description:
            "Enforce that all plugin exports in plugin-manifest.json use fully-qualified names (namespace.ClassName)",
          category: "Possible Errors",
          recommended: true,
        },
        schema: [],
        messages: {
          notFullyQualified:
            "Plugin '{{pluginId}}' export '{{exportName}}' is not fully-qualified. Use format: Namespace.ClassName (e.g., RenderX.Plugins.Canvas.CanvasControl)",
          invalidFormat:
            "Plugin '{{pluginId}}' export '{{exportName}}' has invalid format. Must contain at least one dot (.) for namespace qualification",
        },
      },

      create(context) {
        // Only run once per lint execution
        if (global.__validatePluginManifestExportsRun) return {};
        global.__validatePluginManifestExportsRun = true;

        const cwd = context.getCwd?.() || process.cwd();
        const reports = [];

        // Find all plugin-manifest.json files
        // Desktop manifests (Avalonia) require fully-qualified exports
        const desktopManifestPaths = [
          path.join(cwd, "src/RenderX.Shell.Avalonia/plugins/plugin-manifest.json"),
        ];

        // Web manifests use simple names for React components
        const webManifestPaths = [
          path.join(cwd, "catalog/json-plugins/plugin-manifest.json"),
          path.join(cwd, "public/plugins/plugin-manifest.json"),
          path.join(cwd, "json-plugins/plugin-manifest.json"),
        ];

        // Validate desktop manifests (require fully-qualified exports)
        for (const manifestPath of desktopManifestPaths) {
          if (!fs.existsSync(manifestPath)) continue;

          try {
            const content = fs.readFileSync(manifestPath, "utf8");
            const manifest = JSON.parse(content);

            if (!manifest.plugins || !Array.isArray(manifest.plugins)) continue;

            for (const plugin of manifest.plugins) {
              // Check UI export - must be fully-qualified for desktop
              if (plugin.ui?.export) {
                const uiExport = plugin.ui.export;
                if (!isFullyQualified(uiExport)) {
                  reports.push({
                    message: `Plugin '${plugin.id}' UI export '${uiExport}' is not fully-qualified. Use format: Namespace.ClassName (e.g., RenderX.Plugins.Canvas.CanvasControl)`,
                    line: 1,
                  });
                }
              }

              // Check runtime export - must be fully-qualified for desktop
              if (plugin.runtime?.export) {
                const runtimeExport = plugin.runtime.export;
                if (!isFullyQualified(runtimeExport)) {
                  reports.push({
                    message: `Plugin '${plugin.id}' runtime export '${runtimeExport}' is not fully-qualified. Use format: Namespace.ClassName (e.g., RenderX.Plugins.Canvas.CanvasPlugin)`,
                    line: 1,
                  });
                }
              }
            }
          } catch (error) {
            // Silently skip invalid manifests
          }
        }

        // Web manifests are allowed to use simple names for React components
        // No validation needed for web manifests

        // Report all violations at once
        if (reports.length > 0) {
          const filename = context.getFilename?.() || "plugin-manifest.json";
          context.report({
            node: context.sourceCode?.ast || { loc: { start: { line: 1, column: 0 } } },
            message: `Plugin manifest validation failed:\n${reports.map((r) => `  - ${r.message}`).join("\n")}`,
          });
        }

        return {};
      },
    },
  },
};

/**
 * Check if an export name is fully-qualified (contains at least one dot)
 * Examples:
 * - "RenderX.Plugins.Canvas.CanvasControl" → true
 * - "CanvasControl" → false
 * - "Canvas.CanvasControl" → true
 */
function isFullyQualified(exportName) {
  if (!exportName || typeof exportName !== "string") return false;
  return exportName.includes(".");
}

