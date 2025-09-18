import { RuleTester } from "eslint";
import tsparser from "@typescript-eslint/parser";

import plugin from "../../eslint-rules/require-manifest-validation.js";

const tester = new RuleTester({
  languageOptions: { parser: tsparser as any, ecmaVersion: 2022, sourceType: "module" }
});

describe("require-manifest-validation (TDD)", () => {
  it("requires validateLayoutManifest in legacy root LayoutEngine implementation", () => {
    tester.run("require-manifest-validation", (plugin as any).rules["require-manifest-validation"], {
      valid: [
        { filename: "src/layout/LayoutEngine.tsx", code: "async function run(){const m = await load(); validateLayoutManifest(m); render(m);}" }
      ],
      invalid: [
        {
          filename: "src/layout/LayoutEngine.tsx",
          code: "async function run(){const m = await load(); render(m);}",
          errors: [{ message: /validateLayoutManifest/i }]
        }
      ]
    });
  });

  it("requires validateLayoutManifest in domain LayoutEngine implementation", () => {
    tester.run("require-manifest-validation", (plugin as any).rules["require-manifest-validation"], {
      valid: [
        { filename: "src/domain/layout/LayoutEngine.tsx", code: "const m = await load(); validateLayoutManifest(m); render(m);" }
      ],
      invalid: [
        {
          filename: "src/domain/layout/LayoutEngine.tsx",
          code: "const m = await load(); render(m);",
          errors: [{ message: /validateLayoutManifest/i }]
        }
      ]
    });
  });

  it("allows pure re-export shim without validation call (transitional)", () => {
    tester.run("require-manifest-validation", (plugin as any).rules["require-manifest-validation"], {
      valid: [
        { filename: "src/layout/LayoutEngine.tsx", code: "export * from '../domain/layout/LayoutEngine';" },
        { filename: "src/domain/layout/LayoutEngine.tsx", code: "export * from '../../layout/LayoutEngine';" }
      ],
      invalid: []
    });
  });
});

