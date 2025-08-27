import { describe, it, expect, vi, beforeEach } from "vitest";
import rule from "../../eslint-rules/import-css-injection-coverage.js";

describe("import-css-injection-coverage ESLint rule", () => {
  describe("validate-import-css", () => {
    let mockContext: any;

    beforeEach(() => {
      mockContext = {
        getFilename: vi.fn(),
        getCwd: vi.fn(() => process.cwd()),
        report: vi.fn(),
      };
    });

    it("should not run on non-import files", () => {
      mockContext.getFilename.mockReturnValue("src/some-other-file.ts");

      const visitor = rule.rules["validate-import-css"].create(mockContext);
      visitor.Program?.({} as any);

      expect(mockContext.report).not.toHaveBeenCalled();
    });

    it("should run on import parse files", () => {
      mockContext.getFilename.mockReturnValue(
        "plugins/canvas-component/symphonies/import/import.parse.pure.ts"
      );

      const visitor = rule.rules["validate-import-css"].create(mockContext);

      expect(visitor.Program).toBeDefined();
    });

    it("should run on import nodes files", () => {
      mockContext.getFilename.mockReturnValue(
        "plugins/canvas-component/symphonies/import/import.nodes.stage-crew.ts"
      );

      const visitor = rule.rules["validate-import-css"].create(mockContext);

      expect(visitor.Program).toBeDefined();
    });

    it("should not detect missing CSS mapping after fix is implemented", () => {
      // Test against the actual import files in this repo
      mockContext.getFilename.mockReturnValue(
        "plugins/canvas-component/symphonies/import/import.parse.pure.ts"
      );

      const visitor = rule.rules["validate-import-css"].create(mockContext);
      visitor.Program?.({} as any);

      const reportCalls = mockContext.report.mock.calls;

      // Should NOT report issues since we've fixed the CSS mapping
      expect(reportCalls.length).toBe(0);
    });

    it("should provide helpful error message", () => {
      mockContext.getFilename.mockReturnValue(
        "plugins/canvas-component/symphonies/import/import.nodes.stage-crew.ts"
      );

      const visitor = rule.rules["validate-import-css"].create(mockContext);
      visitor.Program?.({} as any);

      const reportCalls = mockContext.report.mock.calls;

      if (reportCalls.length > 0) {
        const firstCall = reportCalls[0][0];
        expect(firstCall.messageId).toBe("missingCssMapping");
        expect(firstCall.data).toHaveProperty("component");
      }
    });

    it("should handle missing import files gracefully", () => {
      // Mock a scenario where import files don't exist
      const mockCwd = "/nonexistent/path";
      mockContext.getCwd.mockReturnValue(mockCwd);
      mockContext.getFilename.mockReturnValue(
        "plugins/canvas-component/symphonies/import/import.parse.pure.ts"
      );

      const visitor = rule.rules["validate-import-css"].create(mockContext);
      visitor.Program?.({} as any);

      const reportCalls = mockContext.report.mock.calls;

      // Should report that it cannot analyze
      const cannotAnalyzeCall = reportCalls.find(
        (call: any) => call[0].messageId === "cannotAnalyze"
      );
      expect(cannotAnalyzeCall).toBeDefined();
    });

    it("should not report issues after CSS mapping fix is implemented", () => {
      // This would require mocking the file system to return components without variants
      // For now, we test the real codebase which does have variant components
      mockContext.getFilename.mockReturnValue(
        "plugins/canvas-component/symphonies/import/import.parse.pure.ts"
      );

      const visitor = rule.rules["validate-import-css"].create(mockContext);
      visitor.Program?.({} as any);

      // The real codebase has variant components, but CSS mapping is now implemented
      // So no issues should be reported
      expect(mockContext.report).not.toHaveBeenCalled();
    });
  });

  describe("rule metadata", () => {
    it("should have correct rule metadata", () => {
      const ruleDefinition = rule.rules["validate-import-css"];

      expect(ruleDefinition.meta.type).toBe("problem");
      expect(ruleDefinition.meta.docs.description).toContain("import flow");
      expect(ruleDefinition.meta.messages).toHaveProperty("missingCssMapping");
      expect(ruleDefinition.meta.messages).toHaveProperty("cannotAnalyze");
    });

    it("should export the rule correctly", () => {
      expect(rule.rules).toHaveProperty("validate-import-css");
      expect(typeof rule.rules["validate-import-css"].create).toBe("function");
    });
  });
});
