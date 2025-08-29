import { RuleTester } from "eslint";
import tsparser from "@typescript-eslint/parser";

import plugin from "../../eslint-rules/require-slot-manifest-registration.js";

const tester = new RuleTester({
  languageOptions: { parser: tsparser as any, ecmaVersion: 2022, sourceType: "module" }
});

describe("require-slot-manifest-registration (TDD)", () => {
  it("requires that string literal slot values appear in layout-manifest.json", () => {
    tester.run("require-slot-manifest-registration", (plugin as any).rules["require-slot-manifest-registration"], {
      valid: [
        { filename: "src/App.tsx", code: "<PanelSlot slot={slotName} />" }
      ],
      invalid: [
        {
          filename: "src/App.tsx",
          code: "<PanelSlot slot=\"unknown\" />",
          errors: [{ message: /slot.*not registered/i }]
        }
      ]
    });
  });
});

