import { RuleTester } from "eslint";
import tsparser from "@typescript-eslint/parser";
import rulePlugin from "../../eslint-rules/no-cross-plugin-imports.js";

const ruleTester = new RuleTester({
  languageOptions: { parser: tsparser as any, ecmaVersion: 2022, sourceType: "module" },
});

describe("no-cross-plugin-imports", () => {
  const rule = (rulePlugin as any).rules["no-cross-plugin-imports"];

  ruleTester.run("no-cross-plugin-imports", rule, {
    valid: [
      {
        filename: "plugins/library/ui/ok.tsx",
        code: "import { x } from '../utils/local';",
      },
      {
        filename: "plugins/control-panel/ui/ok2.tsx",
        code: "import thing from './Local';",
      },
      {
        filename: "plugins/library/ui/ok3.tsx",
        code: "import { useConductor } from '@renderx-plugins/host-sdk';",
      },
    ],
    invalid: [
      {
        filename: "plugins/library/symphonies/bad.ts",
        code: "import { cssRegistry } from '../../control-panel/state/css-registry.store';",
        errors: [{ messageId: "crossImport" }],
      },
      {
        filename: "plugins/control-panel/ui/bad2.tsx",
        code: "import { LibraryPanel } from '../../library/ui/LibraryPanel';",
        errors: [{ messageId: "crossImport" }],
      },
      {
        filename: "plugins/canvas/ui/bad3.tsx",
        code: "import x from 'plugins/library/utils/u';",
        errors: [{ messageId: "crossImport" }],
      },
    ],
  });
});

