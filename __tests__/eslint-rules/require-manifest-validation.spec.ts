import { RuleTester } from "eslint";
import tsparser from "@typescript-eslint/parser";

import plugin from "../../eslint-rules/require-manifest-validation.js";

const tester = new RuleTester({
  languageOptions: { parser: tsparser as any, ecmaVersion: 2022, sourceType: "module" }
});

describe("require-manifest-validation (TDD)", () => {
  it("requires validateLayoutManifest to be called in LayoutEngine before use", () => {
    tester.run("require-manifest-validation", (plugin as any).rules["require-manifest-validation"], {
      valid: [
        { filename: "src/layout/LayoutEngine.tsx", code: "const m = await load(); validateLayoutManifest(m); render(m);" }
      ],
      invalid: [
        {
          filename: "src/layout/LayoutEngine.tsx",
          code: "const m = await load(); render(m);",
          errors: [{ message: /validateLayoutManifest/i }]
        }
      ]
    });
  });
});

