import { RuleTester } from "eslint";
import tsparser from "@typescript-eslint/parser";
import ruleModule from "../../eslint-rules/handler-export-exists.js";
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

describe("handler-export-exists ESLint rule", () => {
  const baseSeqDir = path.join(process.cwd(), "json-sequences", "lint-handler-exports");
  const srcHandlersDir = path.join(process.cwd(), "src", "plugins", "lint-handler-exports");

  beforeAll(() => {
    fs.mkdirSync(baseSeqDir, { recursive: true });
    fs.mkdirSync(srcHandlersDir, { recursive: true });

    // Create sequence and index
    const seq = {
      movements: [
        { beats: [ { handler: "create" }, { handler: "missing" } ] },
      ],
    };
    fs.writeFileSync(path.join(baseSeqDir, "bar.json"), JSON.stringify(seq), "utf8");

    const indexJson = {
      sequences: [
        { file: "bar.json", handlersPath: "/src/plugins/lint-handler-exports/handlers.ts" },
      ],
    };
    fs.writeFileSync(path.join(baseSeqDir, "index.json"), JSON.stringify(indexJson), "utf8");

    // Handlers module with only `create`
    fs.writeFileSync(
      path.join(srcHandlersDir, "handlers.ts"),
      "export const handlers = { create: () => {} };",
      "utf8"
    );
  });

  afterAll(() => {
    try { fs.rmSync(baseSeqDir, { recursive: true, force: true }); } catch {}
    try { fs.rmSync(srcHandlersDir, { recursive: true, force: true }); } catch {}
  });

  const rule = (ruleModule as any).rules["handler-export-exists"]; 

  it("reports missing handler names referenced by sequences", () => {
    ruleTester.run("handler-export-exists", rule, {
      valid: [],
      invalid: [
        {
          filename: "src/dummy.ts",
          code: "export {}",
          errors: [ { messageId: "missingHandler" } ],
        },
      ],
    });
  });
});

