/**
 * ESLint rule: validate-host-sdk-version
 * 
 * Ensures that all external plugins use compatible versions of @renderx-plugins/host-sdk.
 * This rule checks package.json files in node_modules to detect version mismatches that
 * could cause runtime errors.
 * 
 * The rule:
 * 1. Reads the host's package.json to get the expected host-sdk version
 * 2. Checks all @renderx-plugins/* packages in node_modules
 * 3. Verifies their host-sdk dependencies match the host's version
 * 4. Reports errors for any mismatches
 * 
 * This prevents issues like:
 * - Plugins calling deprecated/removed API methods (e.g., hasValue vs has)
 * - Type mismatches between host and plugin expectations
 * - Runtime errors from API incompatibilities
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Validate that external plugins use compatible host-sdk versions',
      category: 'Plugin Architecture',
      recommended: true,
    },
    messages: {
      incompatibleVersion:
        'Plugin "{{pluginName}}" uses @renderx-plugins/host-sdk@{{pluginVersion}}, ' +
        'but host requires @renderx-plugins/host-sdk@{{hostVersion}}. ' +
        'This may cause runtime errors. Update the plugin to use a compatible version.',
      missingDependency:
        'Plugin "{{pluginName}}" does not declare @renderx-plugins/host-sdk as a dependency. ' +
        'If this plugin uses host SDK APIs, it should declare the dependency.',
      cannotReadPackage:
        'Cannot read package.json for plugin "{{pluginName}}": {{error}}',
    },
    schema: [],
  },

  create(context) {
    // Only run this rule once per lint run, on the root package.json
    const filename = context.getFilename();
    if (!filename.endsWith('package.json') || filename.includes('node_modules')) {
      return {};
    }

    return {
      Program(node) {
        try {
          const repoRoot = path.resolve(__dirname, '..');
          const hostPackageJsonPath = path.join(repoRoot, 'package.json');

          // Read host's package.json
          let hostPackageJson;
          try {
            hostPackageJson = JSON.parse(fs.readFileSync(hostPackageJsonPath, 'utf8'));
          } catch {
            // If we can't read the host package.json, skip validation
            return;
          }

          const hostSdkVersion = hostPackageJson.dependencies?.['@renderx-plugins/host-sdk'];
          if (!hostSdkVersion) {
            // Host doesn't use host-sdk, nothing to validate
            return;
          }

          // Normalize version (remove range operators like ^, ~, >=, >, <, <= for comparison)
          const normalizeVersion = (version) => {
            if (!version) return null;
            // Remove common semver range operators
            return version.replace(/^[~^><=]+/, '').trim();
          };

          const expectedVersion = normalizeVersion(hostSdkVersion);

          // Find all @renderx-plugins/* packages in node_modules
          const nodeModulesPath = path.join(repoRoot, 'node_modules', '@renderx-plugins');
          
          if (!fs.existsSync(nodeModulesPath)) {
            return;
          }

          const pluginDirs = fs.readdirSync(nodeModulesPath, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name)
            .filter(name => name !== 'host-sdk'); // Skip the host-sdk itself

          // Check each plugin's host-sdk dependency
          for (const pluginName of pluginDirs) {
            const pluginPackageJsonPath = path.join(
              nodeModulesPath,
              pluginName,
              'package.json'
            );

            let pluginPackageJson;
            try {
              pluginPackageJson = JSON.parse(fs.readFileSync(pluginPackageJsonPath, 'utf8'));
            } catch (err) {
              context.report({
                node,
                messageId: 'cannotReadPackage',
                data: {
                  pluginName: `@renderx-plugins/${pluginName}`,
                  error: err.message,
                },
              });
              continue;
            }

            // Check if plugin declares host-sdk dependency
            const pluginSdkVersion =
              pluginPackageJson.dependencies?.['@renderx-plugins/host-sdk'] ||
              pluginPackageJson.peerDependencies?.['@renderx-plugins/host-sdk'];

            if (!pluginSdkVersion) {
              // Report as warning - not all plugins need host-sdk
              context.report({
                node,
                messageId: 'missingDependency',
                data: {
                  pluginName: `@renderx-plugins/${pluginName}`,
                },
                // Note: severity is controlled by the rule configuration in eslint.config.js
              });
              continue;
            }

            // Compare versions
            const pluginVersion = normalizeVersion(pluginSdkVersion);
            
            // Check for major version compatibility
            const expectedMajor = expectedVersion.split('.')[0];
            const pluginMajor = pluginVersion.split('.')[0];

            if (expectedMajor !== pluginMajor) {
              context.report({
                node,
                messageId: 'incompatibleVersion',
                data: {
                  pluginName: `@renderx-plugins/${pluginName}`,
                  pluginVersion: pluginSdkVersion,
                  hostVersion: hostSdkVersion,
                },
              });
            }
          }
        } catch (error) {
          // Silently skip if there's any unexpected error
          // This prevents the lint rule from breaking the build
          console.error('Error in validate-host-sdk-version rule:', error);
        }
      },
    };
  },
};

export default {
  rules: {
    'validate-host-sdk-version': rule,
  },
};

