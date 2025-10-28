/**
 * ESLint rule: validate-host-sdk-missing
 * 
 * Reports WARNINGS for plugins that don't declare @renderx-plugins/host-sdk as a dependency.
 * This is informational - not all plugins need the host SDK.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Report warnings for plugins that don\'t declare host-sdk dependency',
      category: 'Plugin Architecture',
      recommended: false,
    },
    messages: {
      missingDependency:
        'Plugin "{{pluginName}}" does not declare @renderx-plugins/host-sdk as a dependency. ' +
        'If this plugin uses host SDK APIs, it should declare the dependency.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          ignore: {
            type: 'array',
            items: { type: 'string' },
            description: 'List of plugin names to ignore (without @renderx-plugins/ prefix)',
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    const filename = context.getFilename();
    if (!filename.endsWith('package.json') || filename.includes('node_modules')) {
      return {};
    }

    const options = context.options[0] || {};
    const ignoreList = options.ignore || [];

    return {
      Program(node) {
        try {
          const repoRoot = path.resolve(__dirname, '..');
          const nodeModulesPath = path.join(repoRoot, 'node_modules', '@renderx-plugins');

          if (!fs.existsSync(nodeModulesPath)) {
            return;
          }

          const pluginDirs = fs.readdirSync(nodeModulesPath, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name)
            .filter(name => name !== 'host-sdk' && !ignoreList.includes(name));

          for (const pluginName of pluginDirs) {
            const pluginPackageJsonPath = path.join(
              nodeModulesPath,
              pluginName,
              'package.json'
            );

            let pluginPackageJson;
            try {
              pluginPackageJson = JSON.parse(fs.readFileSync(pluginPackageJsonPath, 'utf8'));
            } catch {
              // Skip if we can't read the package.json
              continue;
            }

            const pluginSdkVersion = 
              pluginPackageJson.dependencies?.['@renderx-plugins/host-sdk'] ||
              pluginPackageJson.peerDependencies?.['@renderx-plugins/host-sdk'];

            if (!pluginSdkVersion) {
              context.report({
                node,
                messageId: 'missingDependency',
                data: {
                  pluginName: `@renderx-plugins/${pluginName}`,
                },
              });
            }
          }
        } catch (error) {
          console.error('Error in validate-host-sdk-missing rule:', error);
        }
      },
    };
  },
};

export default {
  rules: {
    'validate-host-sdk-missing': rule,
  },
};

