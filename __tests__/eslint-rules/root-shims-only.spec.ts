import { RuleTester } from "eslint";
import tsparser from "@typescript-eslint/parser";
import plugin from "../../eslint-rules/root-shims-only.js";

const tester = new RuleTester({
  languageOptions: { parser: tsparser as any, ecmaVersion: 2022, sourceType: "module" },
});

describe("root-shims-only (Phase C)", () => {
  const rule = (plugin as any).rules["require-root-shims-only"]; 

  tester.run("require-root-shims-only", rule, {
    valid: [
      {
        filename: "src/env.ts",
        code: "export * from './core/environment/env';",
      },
      {
        filename: "src/interactionManifest.ts",
        code: "export * from './core/manifests/interactionManifest';",
      },
      {
        // index.tsx is not part of guardrail
        filename: "src/index.tsx",
        code: "import React from 'react'; export const x = 1;",
      },
      {
        // Subdirectories are out of scope for this rule
        filename: "src/ui/App/App.tsx",
        code: "export const App = () => null;",
      },
    ],
    invalid: [
      {
        filename: "src/env.ts",
        code: "const x = 1; export const y = x;",
        errors: [{ message: /pure re-export shim/i }],
      },
      {
        filename: "src/sanitizeHtml.ts",
        code: "export * from './utils/sanitize';", // not core/domain
        errors: [{ message: /pure re-export shim/i }],
      },
    ],
  });
});

