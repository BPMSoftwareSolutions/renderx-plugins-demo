import { RuleTester } from "eslint";
import tsparser from "@typescript-eslint/parser";
import interactionKeys from "../../eslint-rules/interaction-keys.js";

const ruleTester = new RuleTester({
  languageOptions: {
    parser: tsparser,
    ecmaVersion: 2022,
    sourceType: "module",
  },
});

describe("interaction-keys ESLint rule", () => {
  const rule = (interactionKeys as any).rules["valid-keys"];

  ruleTester.run("valid-keys", rule, {
    valid: [
      {
        filename: "plugins/canvas/ui/ok.ts",
        code: `
          import { resolveInteraction } from "../../src/interactionManifest";
          const r = resolveInteraction("canvas.component.drag.move");
        `,
      },
    ],
    invalid: [
      {
        filename: "plugins/canvas/ui/bad.ts",
        code: `
          import { resolveInteraction } from "../../src/interactionManifest";
          const r = resolveInteraction("canvas.component.drag");
        `,
        errors: [
          {
            messageId: "unknownKey",
          },
        ],
      },
    ],
  });
});
