import { RuleTester } from "eslint";
import tsparser from "@typescript-eslint/parser";

import plugin from "../../eslint-rules/no-hardcoded-layout-styles.js";

const tester = new RuleTester({
  languageOptions: { parser: tsparser as any, ecmaVersion: 2022, sourceType: "module" }
});

describe("no-hardcoded-layout-styles (TDD)", () => {
  it("flags inline grid template styles outside src/layout/**", () => {
    tester.run("no-hardcoded-layout-styles", (plugin as any).rules["no-hardcoded-layout-styles"], {
      valid: [
        { filename: "src/layout/LayoutEngine.tsx", code: "const s = { display: 'grid', gridTemplateColumns: '1fr' }" }
      ],
      invalid: [
        {
          filename: "src/App.tsx",
          code: "const s = { display: 'grid', gridTemplateColumns: '320px 1fr 360px' }",
          errors: [{ message: /hardcoded layout style/i }]
        }
      ]
    });
  });
});

