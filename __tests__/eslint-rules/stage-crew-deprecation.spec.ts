import { describe, it, expect, vi } from "vitest";
import rule from "../../eslint-rules/deprecate-stagecrew-api.js";

function run(ruleName: string, code: string, filename: string) {
  const messages: any[] = [];
  const context: any = {
    getFilename: vi.fn(() => filename),
    report: vi.fn((msg) => messages.push(msg)),
    sourceCode: { getText: (n: any) => (n && n.name ? n.name : "") },
  };
  const visitor = (rule as any).rules[ruleName].create(context);
  const ast = {} as any; // We don't parse; our rule visits via Program and does simple text checks
  visitor.Program?.(ast);
  return messages;
}

describe("deprecate-stagecrew-api ESLint rule", () => {
  it("reports usage of ctx.stageCrew.beginBeat() in stage-crew files", () => {
    const code = `export function demo(data:any, ctx:any){ const txn = ctx.stageCrew.beginBeat(); txn.commit(); }`;
    const msgs = run(
      "no-stagecrew-api-in-stage-crew",
      code,
      "__tests__/fixtures/lint/uses-stagecrew.stage-crew.ts"
    );
    expect(msgs.some((m) => m.messageId === "deprecatedStageCrew")).toBe(true);
  });

  it("does not report in non-stage-crew files", () => {
    const code = `export function pure(data:any, ctx:any){ return data }`;
    const msgs = run(
      "no-stagecrew-api-in-stage-crew",
      code,
      "__tests__/fixtures/lint/no-stagecrew.pure.ts"
    );
    expect(msgs.length).toBe(0);
  });
});
