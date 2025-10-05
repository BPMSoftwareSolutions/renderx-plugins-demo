/**
 * ESLint rule: validate-host-sdk-version-mismatch
 * 
 * Reports ERRORS for plugins using incompatible versions of @renderx-plugins/host-sdk.
 * This is a critical issue that will cause runtime errors.
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
      description: 'Report errors for plugins using incompatible host-sdk versions',
      category: 'Plugin Architecture',
      recommended: true,
    },
    messages: {
      incompatibleVersion: 
        'Plugin "{{pluginName}}" uses @renderx-plugins/host-sdk@{{pluginVersion}}, ' +
        'but host requires @renderx-plugins/host-sdk@{{hostVersion}}. ' +
        'This may cause runtime errors. Update the plugin to use a compatible version.',
      cannotReadPackage:
        'Cannot read package.json for plugin "{{pluginName}}": {{error}}',
    },
    schema: [],
  },

  create(context) {
    const filename = context.getFilename();
    if (!filename.endsWith('package.json') || filename.includes('node_modules')) {
      return {};
    }

    return {
      Program(node) {
        try {
          const repoRoot = path.resolve(__dirname, '..');
          const hostPackageJsonPath = path.join(repoRoot, 'package.json');
          
          let hostPackageJson;
          try {
            hostPackageJson = JSON.parse(fs.readFileSync(hostPackageJsonPath, 'utf8'));
          } catch {
            return;
          }

          const hostSdkVersion = hostPackageJson.dependencies?.['@renderx-plugins/host-sdk'];
          if (!hostSdkVersion) {
            return;
          }

          const normalizeVersion = (version) => {
            if (!version) return null;
            return version.replace(/^[\^~>=<]/, '');
          };

          const expectedVersion = normalizeVersion(hostSdkVersion);
          const nodeModulesPath = path.join(repoRoot, 'node_modules', '@renderx-plugins');
          
          if (!fs.existsSync(nodeModulesPath)) {
            return;
          }

          const pluginDirs = fs.readdirSync(nodeModulesPath, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name)
            .filter(name => name !== 'host-sdk');

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

            const pluginSdkVersion = 
              pluginPackageJson.dependencies?.['@renderx-plugins/host-sdk'] ||
              pluginPackageJson.peerDependencies?.['@renderx-plugins/host-sdk'];

            if (!pluginSdkVersion) {
              // Skip - missing dependencies are handled by the other rule
              continue;
            }

            const pluginVersion = normalizeVersion(pluginSdkVersion);
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
          console.error('Error in validate-host-sdk-version-mismatch rule:', error);
        }
      },
    };
  },
};

export default {
  rules: {
    'validate-host-sdk-version-mismatch': rule,
  },
};

