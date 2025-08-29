import { RuleTester } from "eslint";
import tsparser from "@typescript-eslint/parser";

// TDD: rule implementation will come later
import plugin from "../../eslint-rules/no-hardcoded-slot-names.js";

const tester = new RuleTester({
  languageOptions: { parser: tsparser as any, ecmaVersion: 2022, sourceType: "module" }
});

describe("no-hardcoded-slot-names (TDD)", () => {
  it("flags union types of known slot names", () => {
    tester.run("no-hardcoded-slot-names", (plugin as any).rules["no-hardcoded-slot-names"], {
      valid: [
        { filename: "src/components/X.tsx", code: "type Slot = string;" },
        { filename: "src/components/P.tsx", code: "export function P(props: { slot: string }) { return null; }" }
      ],
      invalid: [
        {
          filename: "src/components/PanelSlot.tsx",
          code: "export function PanelSlot(props: { slot: 'library' | 'canvas' | 'controlPanel' }) { return null; }",
          errors: [{ message: /hardcoded slot names/i }]
        }
      ]
    });
  });
});

