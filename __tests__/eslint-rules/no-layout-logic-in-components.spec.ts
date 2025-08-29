import { RuleTester } from "eslint";
import tsparser from "@typescript-eslint/parser";

import plugin from "../../eslint-rules/no-layout-logic-in-components.js";

const tester = new RuleTester({
  languageOptions: { parser: tsparser as any, ecmaVersion: 2022, sourceType: "module" }
});

describe("no-layout-logic-in-components (TDD)", () => {
  it("flags computing grid template outside src/layout/**", () => {
    tester.run("no-layout-logic-in-components", (plugin as any).rules["no-layout-logic-in-components"], {
      valid: [
        { filename: "src/layout/LayoutEngine.tsx", code: "const cols = computeFromManifest(m);" }
      ],
      invalid: [
        {
          filename: "src/App.tsx",
          code: "const cols = ['320px','1fr','360px'].join(' ');",
          errors: [{ message: /layout logic must live in src\/layout/i }]
        }
      ]
    });
  });
});

