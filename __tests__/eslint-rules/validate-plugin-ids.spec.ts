import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { RuleTester } from "eslint";
import tsparser from "@typescript-eslint/parser";
import fs from "node:fs";
import path from "node:path";
import ruleModule from "../../eslint-rules/validate-plugin-ids.js";

const ruleTester = new RuleTester({
  languageOptions: {
    parser: tsparser,
    ecmaVersion: 2024,
    sourceType: "module",
  },
});

describe("validate-plugin-ids ESLint rule", () => {
  const rule = (ruleModule as any).rules["validate-plugin-ids"];
  
  // Mock file system for testing
  const originalReadFileSync = fs.readFileSync;
  const originalExistsSync = fs.existsSync;
  const originalReaddirSync = fs.readdirSync;
  
  let mockFiles: Record<string, string> = {};
  
  beforeEach(() => {
    mockFiles = {};
    
    // Mock fs.readFileSync
    (fs as any).readFileSync = (filePath: string, encoding?: string) => {
      const normalizedPath = filePath.replace(/\\/g, '/');
      if (mockFiles[normalizedPath]) {
        return mockFiles[normalizedPath];
      }
      throw new Error(`File not found: ${filePath}`);
    };
    
    // Mock fs.existsSync
    (fs as any).existsSync = (filePath: string) => {
      const normalizedPath = filePath.replace(/\\/g, '/');
      return !!mockFiles[normalizedPath] || Object.keys(mockFiles).some(p => p.startsWith(normalizedPath));
    };
    
    // Mock fs.readdirSync
    (fs as any).readdirSync = (dirPath: string) => {
      const normalizedPath = dirPath.replace(/\\/g, '/');
      return Object.keys(mockFiles)
        .filter(p => p.startsWith(normalizedPath + '/'))
        .map(p => path.basename(p))
        .filter((name, index, arr) => arr.indexOf(name) === index);
    };
  });
  
  afterEach(() => {
    fs.readFileSync = originalReadFileSync;
    fs.existsSync = originalExistsSync;
    fs.readdirSync = originalReaddirSync;
  });

  it("validates plugin ID naming conventions", () => {
    // Setup mock manifest with invalid plugin IDs
    mockFiles[process.cwd().replace(/\\/g, '/') + '/catalog/json-plugins/plugin-manifest.json'] = JSON.stringify({
      plugins: [
        { id: "ValidPlugin" },
        { id: "invalid-plugin" }, // Invalid: not PascalCase
        { id: "InvalidName" },     // Invalid: doesn't end with Plugin
        { id: "SystemCorePlugin" } // Invalid: reserved pattern
      ]
    });

    ruleTester.run("validate-plugin-ids", rule, {
      valid: [],
      invalid: [
        {
          filename: "catalog/json-plugins/plugin-manifest.json",
          code: "import manifest from './plugin-manifest.json' with { type: 'json' };",
          errors: [
            { messageId: "invalidNaming" },
            { messageId: "invalidNaming" },
            { messageId: "invalidNaming" }
          ],
        },
      ],
    });
  });

  it("detects duplicate plugin IDs", () => {
    mockFiles[process.cwd().replace(/\\/g, '/') + '/catalog/json-plugins/plugin-manifest.json'] = JSON.stringify({
      plugins: [
        { id: "TestPlugin" },
        { id: "TestPlugin" }, // Duplicate
        { id: "AnotherPlugin" }
      ]
    });

    ruleTester.run("validate-plugin-ids", rule, {
      valid: [],
      invalid: [
        {
          filename: "catalog/json-plugins/plugin-manifest.json",
          code: "import manifest from './plugin-manifest.json' with { type: 'json' };",
          errors: [
            { messageId: "duplicateId" }
          ],
        },
      ],
    });
  });

  it("validates cross-references in interaction files", () => {
    // Setup manifest with known plugins
    mockFiles[process.cwd().replace(/\\/g, '/') + '/catalog/json-plugins/plugin-manifest.json'] = JSON.stringify({
      plugins: [
        { id: "ValidPlugin" },
        { id: "AnotherPlugin" }
      ]
    });
    
    // Setup interaction file with missing plugin reference
    mockFiles[process.cwd().replace(/\\/g, '/') + '/catalog/json-interactions/test.json'] = JSON.stringify({
      plugin: "ValidPlugin",
      routes: {
        "test.action": {
          pluginId: "MissingPlugin", // This plugin doesn't exist in manifest
          sequenceId: "test-sequence"
        }
      }
    });

    ruleTester.run("validate-plugin-ids", rule, {
      valid: [],
      invalid: [
        {
          filename: "catalog/json-interactions/test.json",
          code: "import interactions from './test.json' with { type: 'json' };",
          errors: [
            { messageId: "missingReference" }
          ],
        },
      ],
    });
  });

  it("validates cross-references in topic files", () => {
    // Setup manifest with known plugins
    mockFiles[process.cwd().replace(/\\/g, '/') + '/catalog/json-plugins/plugin-manifest.json'] = JSON.stringify({
      plugins: [
        { id: "ValidPlugin" }
      ]
    });
    
    // Setup topic file with missing plugin reference
    mockFiles[process.cwd().replace(/\\/g, '/') + '/catalog/json-components/json-topics/test.json'] = JSON.stringify({
      version: "1.0.0",
      topics: {
        "test.topic": {
          routes: [
            {
              pluginId: "UnknownPlugin", // This plugin doesn't exist in manifest
              sequenceId: "test-sequence"
            }
          ]
        }
      }
    });

    ruleTester.run("validate-plugin-ids", rule, {
      valid: [],
      invalid: [
        {
          filename: "catalog/json-components/json-topics/test.json",
          code: "import topics from './test.json' with { type: 'json' };",
          errors: [
            { messageId: "missingReference" }
          ],
        },
      ],
    });
  });

  it("allows valid plugin configurations", () => {
    // Setup valid manifest
    mockFiles[process.cwd().replace(/\\/g, '/') + '/catalog/json-plugins/plugin-manifest.json'] = JSON.stringify({
      plugins: [
        { id: "LibraryPlugin" },
        { id: "CanvasPlugin" },
        { id: "ControlPanelPlugin" }
      ]
    });
    
    // Setup valid interaction file
    mockFiles[process.cwd().replace(/\\/g, '/') + '/catalog/json-interactions/library.json'] = JSON.stringify({
      plugin: "LibraryPlugin",
      routes: {
        "library.load": {
          pluginId: "LibraryPlugin",
          sequenceId: "library-load-symphony"
        }
      }
    });

    ruleTester.run("validate-plugin-ids", rule, {
      valid: [
        {
          filename: "catalog/json-plugins/plugin-manifest.json",
          code: "import manifest from './plugin-manifest.json' with { type: 'json' };",
        },
        {
          filename: "catalog/json-interactions/library.json",
          code: "import interactions from './library.json' with { type: 'json' };",
        },
      ],
      invalid: [],
    });
  });

  it("ignores non-catalog files", () => {
    ruleTester.run("validate-plugin-ids", rule, {
      valid: [
        {
          filename: "src/components/test.ts",
          code: "import data from './some-file.json' with { type: 'json' };",
        },
        {
          filename: "public/config.json",
          code: "import config from './config.json' with { type: 'json' };",
        },
      ],
      invalid: [],
    });
  });
});
