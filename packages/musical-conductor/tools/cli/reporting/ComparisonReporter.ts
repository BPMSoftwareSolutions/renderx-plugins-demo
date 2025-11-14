/**
 * Comparison Reporter - Phase 3
 * Compares before/after performance metrics
 */

export interface PerformanceSnapshot {
  timestamp: string;
  sequenceId: string;
  totalDuration: number;
  slowBeats: number;
  averageBeatDuration: number;
  mockConfiguration?: string;
}

export interface PerformanceComparison {
  before: PerformanceSnapshot;
  after: PerformanceSnapshot;
  improvement: {
    durationReduction: number;
    durationReductionPercent: number;
    slowBeatsReduction: number;
    isImprovement: boolean;
  };
}

export class ComparisonReporter {
  compare(
    before: PerformanceSnapshot,
    after: PerformanceSnapshot
  ): PerformanceComparison {
    const durationReduction = before.totalDuration - after.totalDuration;
    const durationReductionPercent =
      (durationReduction / before.totalDuration) * 100;
    const slowBeatsReduction = before.slowBeats - after.slowBeats;
    const isImprovement = durationReduction > 0;

    return {
      before,
      after,
      improvement: {
        durationReduction,
        durationReductionPercent,
        slowBeatsReduction,
        isImprovement,
      },
    };
  }

  formatComparison(comparison: PerformanceComparison): string {
    const { before, after, improvement } = comparison;
    const arrow = improvement.isImprovement ? '📈' : '📉';
    const sign = improvement.isImprovement ? '+' : '';

    let output = '';
    output += '📊 Performance Comparison\n';
    output += '═══════════════════════════════════════════════════════════════\n\n';

    output += 'Before\n';
    output += '───────────────────────────────────────────────────────────────\n';
    output += `Timestamp: ${before.timestamp}\n`;
    output += `Total Duration: ${before.totalDuration}ms\n`;
    output += `Slow Beats: ${before.slowBeats}\n`;
    output += `Average Beat Duration: ${before.averageBeatDuration.toFixed(2)}ms\n`;
    if (before.mockConfiguration) {
      output += `Mock Configuration: ${before.mockConfiguration}\n`;
    }
    output += '\n';

    output += 'After\n';
    output += '───────────────────────────────────────────────────────────────\n';
    output += `Timestamp: ${after.timestamp}\n`;
    output += `Total Duration: ${after.totalDuration}ms\n`;
    output += `Slow Beats: ${after.slowBeats}\n`;
    output += `Average Beat Duration: ${after.averageBeatDuration.toFixed(2)}ms\n`;
    if (after.mockConfiguration) {
      output += `Mock Configuration: ${after.mockConfiguration}\n`;
    }
    output += '\n';

    output += `${arrow} Improvement\n`;
    output += '───────────────────────────────────────────────────────────────\n';
    output += `Duration Reduction: ${sign}${improvement.durationReduction}ms (${sign}${improvement.durationReductionPercent.toFixed(1)}%)\n`;
    output += `Slow Beats Reduction: ${sign}${improvement.slowBeatsReduction}\n`;
    output += `Status: ${improvement.isImprovement ? '✅ IMPROVED' : '❌ REGRESSED'}\n`;

    return output;
  }

  exportJSON(comparison: PerformanceComparison): string {
    return JSON.stringify(comparison, null, 2);
  }
}

