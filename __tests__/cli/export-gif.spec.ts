import { describe, it, expect, vi, beforeEach } from "vitest";
import { runExport } from "../../scripts/lib/export-svg-to-gif-runner.js";
import * as child from "node:child_process";

vi.mock("node:child_process", async () => {
  const real = await vi.importActual<any>("node:child_process");
  return {
    ...real,
    spawn: vi.fn(),
  };
});

function mockSpawnSequence({
  exitCode = 0,
  stdoutLines = [],
  stderrLines = [],
}: any) {
  const events: Record<string, Function[]> = {};
  const childProc: any = {
    stdout: {
      setEncoding: vi.fn(),
      on: (ev: string, cb: any) => {
        (events[`out:${ev}`] ||= []).push(cb);
      },
    },
    stderr: {
      setEncoding: vi.fn(),
      on: (ev: string, cb: any) => {
        (events[`err:${ev}`] ||= []).push(cb);
      },
    },
    on: (ev: string, cb: any) => {
      (events[ev] ||= []).push(cb);
    },
  };
  (child.spawn as any).mockImplementationOnce(() => {
    // Emit lines async
    setTimeout(() => {
      for (const l of stdoutLines) {
        (events["out:data"] || []).forEach((cb) => cb(l + "\n"));
      }
      for (const l of stderrLines) {
        (events["err:data"] || []).forEach((cb) => cb(l + "\n"));
      }
      (events["close"] || []).forEach((cb) => cb(exitCode));
    }, 0);
    return childProc;
  });
}

describe("export-svg-to-gif runner", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("parses progress and resolves on success", async () => {
    const onProgress = vi.fn();
    mockSpawnSequence({
      exitCode: 0,
      stdoutLines: ["Progress: 10.0% (1/10)", "Progress: 100.0% (10/10)"],
    });

    const res = await runExport({
      input: "in.svg",
      output: "out.gif",
      onProgress,
      skipEnvChecks: true,
    });
    expect(res.code).toBe(0);
    expect(onProgress).toHaveBeenCalledWith(10, 1, 10);
    expect(onProgress).toHaveBeenCalledWith(100, 10, 10);
  });

  it("surfaces stderr on failure", async () => {
    mockSpawnSequence({
      exitCode: 1,
      stderrLines: ["FFmpeg is required but not found"],
    });
    await expect(
      runExport({ input: "in.svg", output: "out.gif", skipEnvChecks: true })
    ).rejects.toThrow(/FFmpeg/);
  });
});
