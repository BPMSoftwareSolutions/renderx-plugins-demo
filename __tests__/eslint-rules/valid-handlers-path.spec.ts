import { RuleTester } from "eslint";
import tsparser from "@typescript-eslint/parser";
import ruleModule from "../../eslint-rules/valid-handlers-path.js";
import * as fs from "node:fs";
import * as path from "node:path";
import { describe, beforeAll, afterAll, it } from "vitest";

const ruleTester = new RuleTester({
  languageOptions: {
    parser: tsparser,
    ecmaVersion: 2022,
    sourceType: "module",
  },
});

describe("valid-handlers-path ESLint rule", () => {
  const pluginDir = path.join(process.cwd(), "json-sequences", "lint-valid-path");
  const srcHandlersDir = path.join(process.cwd(), "src", "plugins", "lint-valid-path");

  beforeAll(() => {
    fs.mkdirSync(pluginDir, { recursive: true });
    fs.mkdirSync(srcHandlersDir, { recursive: true });
    // Common sequence file referenced by index.json entries
    fs.writeFileSync(
      path.join(pluginDir, "foo.json"),
      JSON.stringify({ movements: [] }),
      "utf8"
    );
  });

  afterAll(() => {
    try { fs.rmSync(pluginDir, { recursive: true, force: true }); } catch {}
    try { fs.rmSync(srcHandlersDir, { recursive: true, force: true }); } catch {}
  });

  const rule = (ruleModule as any).rules["valid-handlers-path"];

  it("allows handlersPath under src that exists", () => {
    const indexPath = path.join(pluginDir, "index.json");
    const handlersPath = "/src/plugins/lint-valid-path/handlers.ts";
    fs.writeFileSync(
      indexPath,
      JSON.stringify({ sequences: [{ file: "foo.json", handlersPath }] }),
      "utf8"
    );
    fs.writeFileSync(
      path.join(srcHandlersDir, "handlers.ts"),
      "export const handlers = {};",
      "utf8"
    );

    ruleTester.run("valid-handlers-path", rule, {
      valid: [
        { filename: "src/dummy.ts", code: "export {}" },
      ],
      invalid: [],
    });
  });

  it("errors when handlersPath is under public/", () => {
    const indexPath = path.join(pluginDir, "index.json");
    const handlersPath = "/public/plugins/lint-valid-path/handlers.ts";
    fs.writeFileSync(
      indexPath,
      JSON.stringify({ sequences: [{ file: "foo.json", handlersPath }] }),
      "utf8"
    );

    ruleTester.run("valid-handlers-path", rule, {
      valid: [],
      invalid: [
        {
          filename: "src/dummy.ts",
          code: "export {}",
          errors: [{ messageId: "publicPath" }],
        },
      ],
    });
  });

  it("errors when handlersPath under src points to missing file", () => {
    const indexPath = path.join(pluginDir, "index.json");
    const handlersPath = "/src/plugins/lint-valid-path/missing.ts";
    fs.writeFileSync(
      indexPath,
      JSON.stringify({ sequences: [{ file: "foo.json", handlersPath }] }),
      "utf8"
    );

    ruleTester.run("valid-handlers-path", rule, {
      valid: [],
      invalid: [
        {
          filename: "src/dummy.ts",
          code: "export {}",
          errors: [{ messageId: "missingSrc" }],
        },
      ],
    });
  });

  it("errors when handlersPath is not src/ and not a resolvable package", () => {
    const indexPath = path.join(pluginDir, "index.json");
    const handlersPath = "@nonexistent/fake-package/handlers";
    fs.writeFileSync(
      indexPath,
      JSON.stringify({ sequences: [{ file: "foo.json", handlersPath }] }),
      "utf8"
    );

    ruleTester.run("valid-handlers-path", rule, {
      valid: [],
      invalid: [
        {
          filename: "src/dummy.ts",
          code: "export {}",
          errors: [{ messageId: "unresolvable" }],
        },
      ],
    });
  });
});

