/**
 * Sequence Player Tests
 * Tests for CLI Bug Detective sequence replay functionality
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { SequencePlayerEngine } from "../../../tools/cli/engines/SequencePlayerEngine";
import { LogParser } from "../../../tools/cli/parsers/LogParser";
import { PerformanceReporter } from "../../../tools/cli/reporters/PerformanceReporter";
import * as fs from "fs";
import * as path from "path";

describe("SequencePlayerEngine", () => {
  let engine: SequencePlayerEngine;

  beforeEach(() => {
    engine = new SequencePlayerEngine();
  });

  it("should initialize without errors", () => {
    expect(engine).toBeDefined();
  });

  it("should list available sequences", async () => {
    const sequences = await engine.listSequences();
    expect(Array.isArray(sequences)).toBe(true);
  });

  it("should handle missing sequence gracefully", async () => {
    const result = await engine.play("non-existent-sequence");
    expect(result.status).toBe("failed");
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("should play a sequence with full integration", async () => {
    // This test requires a real sequence to be registered
    // For now, we test the structure
    const result = await engine.play("test-sequence", {});
    expect(result).toHaveProperty("sequenceId");
    expect(result).toHaveProperty("duration");
    expect(result).toHaveProperty("beats");
  });

  it("should support mock options", async () => {
    const result = await engine.play("test-sequence", {}, {
      mockServices: ["io"],
      mockBeats: [],
    });
    expect(result.mockServices).toContain("io");
  });

  it("should support mock beat options", async () => {
    const result = await engine.play("test-sequence", {}, {
      mockServices: [],
      mockBeats: [1, 2],
    });
    expect(result.mockBeats).toEqual([1, 2]);
  });
});

describe("LogParser", () => {
  let parser: LogParser;
  let tempLogFile: string;

  beforeEach(() => {
    parser = new LogParser();
    tempLogFile = path.join(__dirname, "test-log.txt");
  });

  afterEach(() => {
    if (fs.existsSync(tempLogFile)) {
      fs.unlinkSync(tempLogFile);
    }
  });

  it("should parse a valid log file", () => {
    const logContent = `2025-11-14T10:00:00Z SequenceExecutor: Executing sequence canvas-component-create-symphony
2025-11-14T10:00:01Z BeatExecutor: Executing beat 1
2025-11-14T10:00:02Z EventBus: Emitting event canvas:component:resolve-template
2025-11-14T10:00:03Z SequenceExecutor: Sequence completed`;

    fs.writeFileSync(tempLogFile, logContent);

    const result = parser.parseLog(tempLogFile);
    expect(result.sequenceId).toBe("canvas-component-create-symphony");
    expect(result.context).toBeDefined();
  });

  it("should throw error for missing log file", () => {
    expect(() => parser.parseLog("/non/existent/file.log")).toThrow();
  });

  it("should extract sequences from log", () => {
    const logContent = `2025-11-14T10:00:00Z SequenceExecutor: Executing sequence seq1
2025-11-14T10:00:01Z BeatExecutor: Executing beat 1
2025-11-14T10:00:02Z BeatExecutor: Executing beat 2
2025-11-14T10:00:03Z SequenceExecutor: Sequence completed`;

    fs.writeFileSync(tempLogFile, logContent);

    const sequences = parser.extractSequences(tempLogFile);
    expect(Array.isArray(sequences)).toBe(true);
    expect(sequences.length).toBeGreaterThan(0);
  });

  it("should extract beat count from log", () => {
    const logContent = `2025-11-14T10:00:00Z SequenceExecutor: Executing sequence seq1
2025-11-14T10:00:01Z BeatExecutor: Executing beat 1
2025-11-14T10:00:02Z BeatExecutor: Executing beat 2
2025-11-14T10:00:03Z BeatExecutor: Executing beat 3
2025-11-14T10:00:04Z SequenceExecutor: Sequence completed`;

    fs.writeFileSync(tempLogFile, logContent);

    const sequences = parser.extractSequences(tempLogFile);
    expect(sequences[0].beats).toBe(3);
  });
});

describe("PerformanceReporter", () => {
  let reporter: PerformanceReporter;

  beforeEach(() => {
    reporter = new PerformanceReporter();
  });

  it("should generate a report for successful execution", () => {
    const result = {
      sequenceId: "test-seq",
      sequenceName: "Test Sequence",
      mode: "full-integration" as const,
      mockServices: [],
      mockBeats: [],
      startTime: 1000,
      endTime: 1100,
      duration: 100,
      beats: [
        {
          beat: 1,
          event: "test:event",
          duration: 50,
          startTime: 1000,
          endTime: 1050,
          isMocked: false,
        },
        {
          beat: 2,
          event: "test:event2",
          duration: 50,
          startTime: 1050,
          endTime: 1100,
          isMocked: false,
        },
      ],
      totalBeats: 2,
      errors: [],
      status: "success" as const,
    };

    const report = reporter.generate(result);
    expect(report).toContain("Sequence Player Report");
    expect(report).toContain("Test Sequence");
    expect(report).toContain("100ms");
  });

  it("should highlight slow beats in report", () => {
    const result = {
      sequenceId: "test-seq",
      sequenceName: "Test Sequence",
      mode: "full-integration" as const,
      mockServices: [],
      mockBeats: [],
      startTime: 1000,
      endTime: 1200,
      duration: 200,
      beats: [
        {
          beat: 1,
          event: "test:event",
          duration: 150,
          startTime: 1000,
          endTime: 1150,
          isMocked: false,
        },
      ],
      totalBeats: 1,
      errors: [],
      status: "success" as const,
    };

    const report = reporter.generate(result);
    expect(report).toContain("SLOW");
    expect(report).toContain("Analysis");
  });

  it("should generate error report for failed execution", () => {
    const result = {
      sequenceId: "test-seq",
      sequenceName: "",
      mode: "full-integration" as const,
      mockServices: [],
      mockBeats: [],
      startTime: 1000,
      endTime: 1100,
      duration: 100,
      beats: [],
      totalBeats: 0,
      errors: [new Error("Test error")],
      status: "failed" as const,
    };

    const report = reporter.generate(result);
    expect(report).toContain("Error Report");
    expect(report).toContain("FAILED");
  });
});

