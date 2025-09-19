import { RuleTester } from "eslint";
import { describe, it, beforeEach, afterEach } from "vitest";
import tsparser from "@typescript-eslint/parser";
import fs from "node:fs";
import ruleModule from "../../eslint-rules/validate-plugin-registration.cjs";

const ruleTester = new RuleTester({
  languageOptions: {
    parser: tsparser,
    ecmaVersion: 2024,
    sourceType: "module",
  },
});

describe("validate-plugin-registration ESLint rule", () => {
  const rule = (ruleModule as any).rules["validate-plugin-registration"];

  // Mock file system for testing
  const originalReadFileSync = fs.readFileSync;
  const originalExistsSync = fs.existsSync;
  const originalReaddirSync = fs.readdirSync;

  let mockFiles: Record<string, string> = {};

  beforeEach(() => {
    mockFiles = {};

    // Mock fs.readFileSync
    (fs as any).readFileSync = (filePath: string, _encoding?: string) => {
      const normalizedPath = filePath.replace(/\\/g, "/");
      if (mockFiles[normalizedPath]) {
        return mockFiles[normalizedPath];
      }
      throw new Error(`File not found: ${filePath}`);
    };

    // Mock fs.existsSync
    (fs as any).existsSync = (filePath: string) => {
      const normalizedPath = filePath.replace(/\\/g, "/");
      return normalizedPath in mockFiles;
    };

    // Mock fs.readdirSync
    (fs as any).readdirSync = (dirPath: string) => {
      const normalizedDir = dirPath.replace(/\\/g, "/");
      return Object.keys(mockFiles)
        .filter(path => path.startsWith(normalizedDir + "/"))
        .map(path => path.substring(normalizedDir.length + 1))
        .filter(name => !name.includes("/"))
        .filter(name => name.endsWith(".json"));
    };
  });

  afterEach(() => {
    // Restore original fs functions
    (fs as any).readFileSync = originalReadFileSync;
    (fs as any).existsSync = originalExistsSync;
    (fs as any).readdirSync = originalReaddirSync;
  });

  it("detects plugins with unused runtime entries", () => {
    // Setup mock filesystem
    mockFiles = {
      "/project/catalog/json-plugins/.generated/plugin-manifest.json": JSON.stringify({
        plugins: [
          {
            id: "HeaderPlugin",
            ui: { slot: "header", module: "@renderx-plugins/header", export: "Header" },
            runtime: { module: "@renderx-plugins/header", export: "register" }
          }
        ]
      }),
      "/project/catalog/json-interactions/header.json": JSON.stringify({
        plugin: "HeaderPlugin",
        routes: {
          // No routes that use HeaderPlugin sequences
        }
      }),
      "/project/catalog/json-components/json-topics/header.json": JSON.stringify({
        topics: {
          // No topics that use HeaderPlugin sequences
        }
      })
    };

    ruleTester.run("unused runtime entry", rule, {
      valid: [],
      invalid: [
        {
          filename: "/project/catalog/json-plugins/plugin-manifest.json",
          code: `import manifest from "./plugin-manifest.json" with { type: "json" };`,
          errors: [
            {
              messageId: "unusedRuntime"
            }
          ]
        }
      ]
    });
  });

  it("detects module import failures", () => {
    mockFiles = {
      "/project/catalog/json-plugins/.generated/plugin-manifest.json": JSON.stringify({
        plugins: [
          {
            id: "MissingModulePlugin",
            runtime: { module: "@missing/plugin-package", export: "register" }
          }
        ]
      }),
      "/project/catalog/json-interactions/missing.json": JSON.stringify({
        plugin: "MissingModulePlugin",
        routes: {
          "missing.action": {
            pluginId: "MissingModulePlugin",
            sequenceId: "missing-action-symphony"
          }
        }
      })
    };

    ruleTester.run("module import failure", rule, {
      valid: [],
      invalid: [
        {
          filename: "/project/catalog/json-interactions/missing.json",
          code: `import interactions from "./missing.json" with { type: "json" };`,
          errors: [
            {
              messageId: "verifyImplementation"
            },
            {
              messageId: "moduleImportFailed"
            }
          ]
        }
      ]
    });
  });

  it("handles missing manifest gracefully", () => {
    // No manifest file in filesystem
    mockFiles = {};

    ruleTester.run("missing manifest", rule, {
      valid: [],
      invalid: [
        {
          filename: "/project/catalog/json-plugins/plugin-manifest.json",
          code: `import manifest from "./plugin-manifest.json" with { type: "json" };`,
          errors: [
            {
              messageId: "manifestNotFound"
            }
          ]
        }
      ]
    });
  });
});
