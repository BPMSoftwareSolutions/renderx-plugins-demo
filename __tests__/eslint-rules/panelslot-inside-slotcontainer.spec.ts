import { RuleTester } from "eslint";
import tsparser from "@typescript-eslint/parser";
import plugin from "../../eslint-rules/panelslot-inside-slotcontainer.js";

const tester = new RuleTester({
  languageOptions: { parser: tsparser as any, ecmaVersion: 2022, sourceType: "module" }
});

describe("panelslot-inside-slotcontainer (TDD)", () => {
  it("flags bare PanelSlot usage and allows when wrapped by SlotContainer", () => {
    tester.run(
      "panelslot-inside-slotcontainer",
      (plugin as any).rules["panelslot-inside-slotcontainer"],
      {
        valid: [
          {
            filename: "src/layout/X.tsx",
            code: "export function X(){ return <SlotContainer slot=\"x\"><PanelSlot slot=\"x\" /></SlotContainer>; }",
          },
        ],
        invalid: [
          {
            filename: "src/layout/X.tsx",
            code: "export function X(){ return <PanelSlot slot=\"x\" />; }",
            errors: [{ message: /must be nested inside <SlotContainer>/i }],
          },
        ],
      }
    );
  });
});

