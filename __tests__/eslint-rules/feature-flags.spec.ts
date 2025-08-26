import { RuleTester } from "eslint";
import tsparser from "@typescript-eslint/parser";
// Intentionally import the rule that does not exist yet (TDD):
import featureFlagsPlugin from "../../eslint-rules/feature-flags.js";

const ruleTester = new RuleTester({
  languageOptions: {
    parser: tsparser,
    ecmaVersion: 2022,
    sourceType: "module",
  },
});

describe("feature-flags ESLint rules", () => {
  const rule = (featureFlagsPlugin as any).rules["enforce-flag-ids"];

  ruleTester.run("enforce-flag-ids", rule, {
    valid: [
      {
        filename: "src/some/module.ts",
        code: `
          import { isFlagEnabled } from "../../src/feature-flags/flags";
          if (isFlagEnabled("perf.fast-initial-drag")) {
            console.log("fast path");
          }
        `,
      },
      {
        filename: "plugins/canvas-component/ui/some-ui.tsx",
        code: `
          import { isFlagEnabled } from "../../../src/feature-flags/flags";
          const enabled = isFlagEnabled("feature.control-panel.sequences");
        `,
      },
    ],
    invalid: [
      {
        filename: "src/another/module.ts",
        code: `
          import { isFlagEnabled } from "../../src/feature-flags/flags";
          if (isFlagEnabled("does.not.exist")) {
            // ...
          }
        `,
        errors: [
          {
            messageId: "unknownFlagId",
          },
        ],
      },
      {
        filename: "src/dynamic/module.ts",
        code: `
          import { isFlagEnabled } from "../../src/feature-flags/flags";
          const name = "perf.fast-initial-drag";
          isFlagEnabled(name);
        `,
        errors: [
          {
            messageId: "nonLiteralFlagId",
          },
        ],
      },
    ],
  });
});

