import { RuleTester } from "eslint";
import tsparser from "@typescript-eslint/parser";
import validSequenceHandlersPlugin from "../../eslint-rules/valid-sequence-handlers.js";

const ruleTester = new RuleTester({
  languageOptions: {
    parser: tsparser,
    ecmaVersion: 2022,
    sourceType: "module",
  },
});

describe("valid-sequence-handlers ESLint rule", () => {
  const rule = (validSequenceHandlersPlugin as any).rules["validate-handlers"];

  // For now, let's test the rule structure without complex file system mocking
  // The rule will be tested in integration when we run it on actual files
  
  it("should be defined", () => {
    expect(rule).toBeDefined();
    expect(rule.meta).toBeDefined();
    expect(rule.create).toBeDefined();
  });

  it("should have correct meta information", () => {
    expect(rule.meta.type).toBe("problem");
    expect(rule.meta.docs.description).toContain("handler names");
    expect(rule.meta.messages.missingHandler).toBeDefined();
  });

  // Basic test that the rule doesn't crash on valid TypeScript
  ruleTester.run("validate-handlers", rule, {
    valid: [
      {
        filename: "src/some-file.ts",
        code: `
          export function someFunction() {
            // This file is not in plugins/ so should be ignored
          }
        `,
      },
      {
        filename: "plugins/test/test.spec.ts",
        code: `
          // Test files should be ignored
          function testFunction() {}
        `,
      },
    ],
    invalid: [
      // We'll add integration tests once the rule is working
    ],
  });
});
