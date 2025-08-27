import { RuleTester } from "eslint";
import tsparser from "@typescript-eslint/parser";
import ruleEngineCoverage from "../../eslint-rules/rule-engine-coverage.js";

const ruleTester = new RuleTester({
  languageOptions: {
    parser: tsparser,
    ecmaVersion: 2022,
    sourceType: "module",
  },
});

describe("rule-engine-coverage ESLint rule", () => {
  const rule = (ruleEngineCoverage as any).rules[
    "validate-control-panel-rules"
  ];

  it("should be defined", () => {
    expect(rule).toBeDefined();
    expect(rule.meta).toBeDefined();
    expect(rule.create).toBeDefined();
  });

  it("should have correct meta information", () => {
    expect(rule.meta.type).toBe("problem");
    expect(rule.meta.docs.description).toContain(
      "control panel schema properties"
    );
    expect(rule.meta.messages.missingUpdateRule).toBeDefined();
    expect(rule.meta.messages.noRulesForComponent).toBeDefined();
  });

  // Basic test that the rule doesn't crash on valid TypeScript
  ruleTester.run("validate-control-panel-rules", rule, {
    valid: [
      {
        filename: "src/some-file.ts",
        code: `
          export function someFunction() {
            // This file is not rule-engine.ts so should be ignored
          }
        `,
      },
    ],
    invalid: [
      // The rule will be tested in integration when we run it on the actual rule-engine.ts file
      // since it requires reading JSON files and parsing the rule engine content
    ],
  });

  it("should only check rule-engine.ts files", () => {
    // The rule should ignore files that are not rule-engine.ts
    const context = {
      getFilename: () => "src/other-file.ts",
      getCwd: () => process.cwd(),
      report: vi.fn(),
    };

    const visitor = rule.create(context);
    expect(visitor).toEqual({}); // Should return empty visitor for non-rule-engine files
  });

  it("should report no bidirectional consistency issues in real rule engine", () => {
    // Validate the actual rule engine is bidirectionally consistent for covered components
    const context = {
      getFilename: () => "src/component-mapper/rule-engine.ts",
      getCwd: () => process.cwd(),
      report: vi.fn(),
    };

    const visitor = rule.create(context);

    // Simulate running the rule on a Program node
    if (visitor.Program) {
      visitor.Program({} as any);
    }

    // Collect rule reports
    const reportCalls = context.report.mock.calls;

    // There should be no bidirectional mismatches now that extraction is implemented
    const bidirectionalIssues = reportCalls.filter(
      (call: any) => call[0].messageId === "bidirectionalMismatch"
    );

    expect(bidirectionalIssues.length).toBe(0);
  });
});
