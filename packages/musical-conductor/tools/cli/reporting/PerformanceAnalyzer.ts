/**
 * Performance Analyzer - Phase 3
 * Generates detailed timing breakdowns and performance recommendations
 */

export interface BeatPerformance {
  beatNumber: number;
  event: string;
  duration: number;
  isSlow: boolean;
  kind?: string;
  timing?: string;
}

export interface PerformanceAnalysis {
  totalDuration: number;
  beats: BeatPerformance[];
  slowBeats: BeatPerformance[];
  fastestBeat: BeatPerformance | null;
  slowestBeat: BeatPerformance | null;
  averageBeatDuration: number;
  recommendations: string[];
}

export class PerformanceAnalyzer {
  private slowThreshold = 100; // ms

  analyze(beats: BeatPerformance[]): PerformanceAnalysis {
    const slowBeats = beats.filter(b => b.duration > this.slowThreshold);
    const totalDuration = beats.reduce((sum, b) => sum + b.duration, 0);
    const averageBeatDuration = totalDuration / beats.length;

    const fastestBeat = beats.reduce((min, b) =>
      b.duration < min.duration ? b : min
    );

    const slowestBeat = beats.reduce((max, b) =>
      b.duration > max.duration ? b : max
    );

    const recommendations = this.generateRecommendations(
      beats,
      slowBeats,
      totalDuration,
      averageBeatDuration
    );

    return {
      totalDuration,
      beats,
      slowBeats,
      fastestBeat,
      slowestBeat,
      averageBeatDuration,
      recommendations,
    };
  }

  private generateRecommendations(
    beats: BeatPerformance[],
    slowBeats: BeatPerformance[],
    totalDuration: number,
    averageBeatDuration: number
  ): string[] {
    const recommendations: string[] = [];

    // Slow beat recommendations
    slowBeats.forEach(beat => {
      const percentage = ((beat.duration / totalDuration) * 100).toFixed(1);
      recommendations.push(
        `Beat ${beat.beatNumber} (${beat.event}) is slow: ${beat.duration}ms (${percentage}% of total)`
      );

      if (beat.timing === 'after-beat') {
        recommendations.push(
          `  → Consider changing timing from "after-beat" to "immediate" for beat ${beat.beatNumber}`
        );
      }

      if (beat.kind === 'stage-crew') {
        recommendations.push(
          `  → Beat ${beat.beatNumber} is rendering (stage-crew). Consider optimizing React component or using memoization`
        );
      }

      if (beat.kind === 'api') {
        recommendations.push(
          `  → Beat ${beat.beatNumber} is an API call. Consider caching or parallel execution`
        );
      }
    });

    // Overall recommendations
    if (totalDuration > 1000) {
      recommendations.push(
        `Total sequence duration is ${totalDuration}ms. Consider parallelizing independent beats.`
      );
    }

    if (slowBeats.length === 0) {
      recommendations.push('✅ All beats are performing well (< 100ms each)');
    }

    return recommendations;
  }

  formatAnalysis(analysis: PerformanceAnalysis): string {
    let output = '';

    output += '📊 Performance Analysis\n';
    output += '───────────────────────────────────────────────────────────────\n';
    output += `Total Duration: ${analysis.totalDuration}ms\n`;
    output += `Average Beat Duration: ${analysis.averageBeatDuration.toFixed(2)}ms\n`;
    output += `Fastest Beat: Beat ${analysis.fastestBeat?.beatNumber} (${analysis.fastestBeat?.duration}ms)\n`;
    output += `Slowest Beat: Beat ${analysis.slowestBeat?.beatNumber} (${analysis.slowestBeat?.duration}ms)\n`;
    output += `Slow Beats (>100ms): ${analysis.slowBeats.length}\n\n`;

    if (analysis.slowBeats.length > 0) {
      output += '⚠️ Slow Beats\n';
      output += '───────────────────────────────────────────────────────────────\n';
      analysis.slowBeats.forEach(beat => {
        const percentage = ((beat.duration / analysis.totalDuration) * 100).toFixed(1);
        output += `Beat ${beat.beatNumber} (${beat.event}): ${beat.duration}ms (${percentage}%)\n`;
      });
      output += '\n';
    }

    output += '💡 Recommendations\n';
    output += '───────────────────────────────────────────────────────────────\n';
    analysis.recommendations.forEach(rec => {
      output += `${rec}\n`;
    });

    return output;
  }

  exportJSON(analysis: PerformanceAnalysis): string {
    return JSON.stringify(analysis, null, 2);
  }
}

