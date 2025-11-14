/**
 * PerformanceReporter - Generate performance reports from sequence execution
 */

import type { PlayResult, BeatTiming } from "../engines/SequencePlayerEngine";

export class PerformanceReporter {
  private readonly SLOW_BEAT_THRESHOLD = 100; // ms

  /**
   * Generate a formatted performance report
   */
  generate(result: PlayResult): string {
    if (result.status === "failed") {
      return this.generateErrorReport(result);
    }

    return this.generateSuccessReport(result);
  }

  /**
   * Compare two execution results
   */
  compare(current: PlayResult, previousFile: string): string {
    // TODO: Load previous result from file and compare
    return "Comparison not yet implemented";
  }

  private generateSuccessReport(result: PlayResult): string {
    const lines: string[] = [];

    lines.push("🎵 Sequence Player Report");
    lines.push("═".repeat(63));
    lines.push("");

    // Header
    lines.push(`Sequence: ${result.sequenceName}`);
    lines.push(`Mode: ${result.mode === "mocked" ? "Mocked" : "Full Integration"}`);
    if (result.mockServices.length) {
      lines.push(`Mocked Services: ${result.mockServices.join(", ")}`);
    }
    lines.push("");

    // Timing breakdown
    lines.push("📊 Timing Breakdown");
    lines.push("─".repeat(63));

    const slowBeats = result.beats.filter(
      (b) => b.duration > this.SLOW_BEAT_THRESHOLD
    );

    result.beats.forEach((beat) => {
      const isSlow = beat.duration > this.SLOW_BEAT_THRESHOLD;
      const slowMarker = isSlow ? " ⚠️ SLOW" : "";
      const mockMarker = beat.isMocked ? " 🔇 MOCKED" : " ✨ REAL";

      lines.push(
        `Beat ${beat.beat} (${beat.event.split(":").pop()})` +
          `${mockMarker}${slowMarker}`.padEnd(20) +
          `${beat.duration}ms`
      );
    });

    lines.push("─".repeat(63));
    lines.push(`Total Duration: ${result.duration}ms`);
    lines.push("");

    // Analysis
    if (slowBeats.length > 0) {
      lines.push("🔍 Analysis");
      lines.push("─".repeat(63));
      slowBeats.forEach((beat) => {
        lines.push(
          `⚠️ Beat ${beat.beat} (${beat.event}) is slow: ${beat.duration}ms`
        );
        if (beat.timing) {
          lines.push(`   Timing: "${beat.timing}"`);
        }
        if (beat.kind) {
          lines.push(`   Kind: "${beat.kind}"`);
        }
      });
      lines.push("");

      // Recommendations
      lines.push("💡 Recommendations");
      lines.push("─".repeat(63));
      slowBeats.forEach((beat) => {
        if (beat.timing === "after-beat") {
          lines.push(
            `  - Beat ${beat.beat}: Consider changing timing from "after-beat" to "immediate"`
          );
        }
      });
    }

    lines.push("═".repeat(63));

    return lines.join("\n");
  }

  private generateErrorReport(result: PlayResult): string {
    const lines: string[] = [];

    lines.push("❌ Sequence Player Error Report");
    lines.push("═".repeat(63));
    lines.push("");
    lines.push(`Sequence: ${result.sequenceId}`);
    lines.push(`Status: FAILED`);
    lines.push("");

    if (result.errors.length > 0) {
      lines.push("Errors:");
      result.errors.forEach((error) => {
        lines.push(`  - ${error.message || error}`);
      });
    }

    lines.push("═".repeat(63));

    return lines.join("\n");
  }
}

