import { RuleTester } from "eslint";
import tsparser from "@typescript-eslint/parser";
import validateExternalPluginConsistencyPlugin from "../../eslint-rules/validate-external-plugin-consistency.js";

const ruleTester = new RuleTester({
  languageOptions: {
    parser: tsparser,
    ecmaVersion: 2022,
    sourceType: "module",
  },
});

// Basic test that validates the rule structure and doesn't crash
const rule = (validateExternalPluginConsistencyPlugin as any).rules["validate-external-plugin-consistency"];

if (!rule) {
  throw new Error("Rule not found");
}

if (!rule.meta) {
  throw new Error("Rule meta not found");
}

if (!rule.create) {
  throw new Error("Rule create function not found");
}

// Test meta information
if (rule.meta.type !== "problem") {
  throw new Error("Rule type should be 'problem'");
}

if (!rule.meta.docs.description.includes("plugin ID consistency")) {
  throw new Error("Rule description should contain 'plugin ID consistency'");
}

if (!rule.meta.messages.pluginIdMismatch) {
  throw new Error("Rule should have pluginIdMismatch message");
}

if (!rule.meta.messages.missingManifest) {
  throw new Error("Rule should have missingManifest message");
}

if (!rule.meta.messages.sequenceFileError) {
  throw new Error("Rule should have sequenceFileError message");
}

// Test schema
if (!rule.meta.schema || !Array.isArray(rule.meta.schema)) {
  throw new Error("Rule should have schema array");
}

const schema = rule.meta.schema[0];
if (!schema.properties.packagePattern) {
  throw new Error("Schema should have packagePattern property");
}

if (!schema.properties.sequenceDirs) {
  throw new Error("Schema should have sequenceDirs property");
}

if (!schema.properties.manifestPath) {
  throw new Error("Schema should have manifestPath property");
}

if (!schema.properties.manifestKey) {
  throw new Error("Schema should have manifestKey property");
}

// Basic ESLint rule test
ruleTester.run("validate-external-plugin-consistency", rule, {
  valid: [
    {
      filename: "src/some-file.ts",
      code: `
        export function someFunction() {
          // This file is not related to external plugins so should be ignored
        }
      `,
    },
  ],
  invalid: [],
});

console.log("All basic tests passed!");