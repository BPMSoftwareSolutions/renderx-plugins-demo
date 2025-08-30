import { RuleTester } from "eslint";
import tsparser from "@typescript-eslint/parser";
import rulePlugin from "../../eslint-rules/no-host-internals-in-plugins.js";

const ruleTester = new RuleTester({
  languageOptions: { parser: tsparser as any, ecmaVersion: 2022, sourceType: "module" },
});

describe("no-host-internals-in-plugins", () => {
  const rule = (rulePlugin as any).rules["no-host-internals-in-plugins"];

  ruleTester.run("no-host-internals-in-plugins", rule, {
    valid: [
      {
        filename: "plugins/library/ui/ok.tsx",
        code: "import { useConductor } from '@renderx/host-sdk';",
      },
      {
        filename: "plugins/library/utils/foo.ts",
        code: "import { x } from '../local';",
      },
    ],
    invalid: [
      {
        filename: "plugins/library/ui/bad.tsx",
        code: "import { useConductor } from '../../../src/conductor';",
        errors: [{ messageId: "forbiddenImport" }],
      },
      {
        filename: "plugins/canvas/ui/bad2.tsx",
        code: "import { EventRouter } from '../../src/EventRouter';",
        errors: [{ messageId: "forbiddenImport" }],
      },
    ],
  });
});

