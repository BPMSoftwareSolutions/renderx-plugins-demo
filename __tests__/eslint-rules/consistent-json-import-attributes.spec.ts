import { RuleTester } from "eslint";
import tsparser from "@typescript-eslint/parser";
import ruleModule from "../../eslint-rules/consistent-json-import-attributes.js";
import { describe, it } from "vitest";

const ruleTester = new RuleTester({
  languageOptions: {
    parser: tsparser,
    ecmaVersion: 2024,
    sourceType: "module",
  },
});

describe("consistent-json-import-attributes ESLint rule", () => {
  const rule = (ruleModule as any).rules["consistent-json-import-attributes"]; 

  it("requires import attributes for JSON imports", () => {
    ruleTester.run("consistent-json-import-attributes", rule, {
      valid: [
        {
          filename: "src/ok.ts",
          code: "import data from './a.json' with { type: 'json' }; export { data };",
        },
      ],
      invalid: [
        {
          filename: "src/bad.ts",
          code: "import data from './a.json'; export { data };",
          errors: [{ messageId: "requireAttrs" }],
        },
      ],
    });
  });
});

