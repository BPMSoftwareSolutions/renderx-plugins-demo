/**
 * PerformanceTracker - Performance timing and beat execution tracking
 * Handles beat timing, execution duration tracking, and performance monitoring
 */

export interface BeatTiming {
  sequenceName: string;
  beat: number;
  startTime: number;
  endTime?: number;
  duration?: number;
}

export interface SequenceTiming {
  sequenceName: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  beatCount: number;
}

export interface MovementTiming {
  sequenceName: string;
  movementName: string;
  requestId: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  beatsCount: number;
}

export class PerformanceTracker {
  private beatStartTimes: Map<string, number> = new Map();
  private sequenceTimings: Map<string, SequenceTiming> = new Map();
  private movementStartTimes: Map<string, number> = new Map();
  private completedBeats: BeatTiming[] = [];
  private completedMovements: MovementTiming[] = [];
  private maxHistorySize: number = 1000;

  /**
   * Start tracking a beat execution
   * @param sequenceName - Sequence name
   * @param beat - Beat number
   * @returns Beat key for tracking
   */
  startBeatTiming(sequenceName: string, beat: number): string {
    const beatKey = `${sequenceName}-${beat}`;
    const startTime = performance.now();
    this.beatStartTimes.set(beatKey, startTime);

    console.log(
      `⏱️ PerformanceTracker: Started timing beat ${beat} for ${sequenceName}`
    );

    return beatKey;
  }

  /**
   * End tracking a beat execution
   * @param sequenceName - Sequence name
   * @param beat - Beat number
   * @returns Beat duration in milliseconds
   */
  endBeatTiming(sequenceName: string, beat: number): number | null {
    const beatKey = `${sequenceName}-${beat}`;
    const startTime = this.beatStartTimes.get(beatKey);

    if (!startTime) {
      console.warn(
        `⏱️ PerformanceTracker: No start time found for beat ${beat} in ${sequenceName}`
      );
      return null;
    }

    const endTime = performance.now();
    const duration = endTime - startTime;

    // Record the completed beat
    const beatTiming: BeatTiming = {
      sequenceName,
      beat,
      startTime,
      endTime,
      duration,
    };

    this.completedBeats.push(beatTiming);
    this.beatStartTimes.delete(beatKey);

    // Maintain history size limit
    if (this.completedBeats.length > this.maxHistorySize) {
      this.completedBeats = this.completedBeats.slice(-this.maxHistorySize / 2);
    }

    console.log(
      `⏱️ PerformanceTracker: Beat ${beat} completed in ${duration.toFixed(
        2
      )}ms`
    );

    return duration;
  }

  /**
   * Clean up timing data for a failed beat
   * @param sequenceName - Sequence name
   * @param beat - Beat number
   */
  cleanupFailedBeat(sequenceName: string, beat: number): void {
    const beatKey = `${sequenceName}-${beat}`;
    this.beatStartTimes.delete(beatKey);

    console.warn(
      `⏱️ PerformanceTracker: Cleaned up failed beat ${beat} for ${sequenceName}`
    );
  }

  /**
   * Start tracking a movement execution
   * @param sequenceName - Sequence name
   * @param movementName - Movement name
   * @param requestId - Request identifier
   * @returns Movement key for tracking
   */
  startMovementTiming(
    sequenceName: string,
    movementName: string,
    requestId: string
  ): string {
    const movementKey = `${sequenceName}-${movementName}-${requestId}`;
    const startTime = performance.now();
    this.movementStartTimes.set(movementKey, startTime);

    console.log(
      `⏱️ PerformanceTracker: Started timing movement ${movementName} for ${sequenceName}`
    );

    return movementKey;
  }

  /**
   * End tracking a movement execution
   * @param sequenceName - Sequence name
   * @param movementName - Movement name
   * @param requestId - Request identifier
   * @param beatsCount - Number of beats executed in the movement
   * @returns Movement duration in milliseconds
   */
  endMovementTiming(
    sequenceName: string,
    movementName: string,
    requestId: string,
    beatsCount: number
  ): number | null {
    const movementKey = `${sequenceName}-${movementName}-${requestId}`;
    const startTime = this.movementStartTimes.get(movementKey);

    if (!startTime) {
      console.warn(
        `⏱️ PerformanceTracker: No start time found for movement ${movementName} in ${sequenceName}`
      );
      return null;
    }

    const endTime = performance.now();
    const duration = endTime - startTime;

    // Record the completed movement
    const movementTiming: MovementTiming = {
      sequenceName,
      movementName,
      requestId,
      startTime,
      endTime,
      duration,
      beatsCount,
    };

    this.completedMovements.push(movementTiming);
    this.movementStartTimes.delete(movementKey);

    // Maintain history size limit
    if (this.completedMovements.length > this.maxHistorySize) {
      this.completedMovements = this.completedMovements.slice(
        -this.maxHistorySize / 2
      );
    }

    console.log(
      `⏱️ PerformanceTracker: Movement ${movementName} completed in ${duration.toFixed(
        2
      )}ms`
    );

    return duration;
  }

  /**
   * Clean up timing data for a failed movement
   * @param sequenceName - Sequence name
   * @param movementName - Movement name
   * @param requestId - Request identifier
   */
  cleanupFailedMovement(
    sequenceName: string,
    movementName: string,
    requestId: string
  ): void {
    const movementKey = `${sequenceName}-${movementName}-${requestId}`;
    this.movementStartTimes.delete(movementKey);

    console.warn(
      `⏱️ PerformanceTracker: Cleaned up failed movement ${movementName} for ${sequenceName}`
    );
  }

  /**
   * Start tracking a sequence execution
   * @param sequenceName - Sequence name
   * @param executionId - Execution identifier
   */
  startSequenceTiming(sequenceName: string, executionId: string): void {
    const startTime = performance.now();
    this.sequenceTimings.set(executionId, {
      sequenceName,
      startTime,
      beatCount: 0,
    });

    console.log(
      `⏱️ PerformanceTracker: Started timing sequence ${sequenceName} (${executionId})`
    );
  }

  /**
   * End tracking a sequence execution
   * @param executionId - Execution identifier
   * @returns Sequence duration in milliseconds
   */
  endSequenceTiming(executionId: string): number | null {
    const timing = this.sequenceTimings.get(executionId);

    if (!timing) {
      console.warn(
        `⏱️ PerformanceTracker: No timing found for execution ${executionId}`
      );
      return null;
    }

    const endTime = performance.now();
    const duration = endTime - timing.startTime;

    timing.endTime = endTime;
    timing.duration = duration;

    console.log(
      `⏱️ PerformanceTracker: Sequence ${
        timing.sequenceName
      } completed in ${duration.toFixed(2)}ms`
    );

    // Clean up after recording
    this.sequenceTimings.delete(executionId);

    return duration;
  }

  /**
   * Increment beat count for a sequence
   * @param executionId - Execution identifier
   */
  incrementBeatCount(executionId: string): void {
    const timing = this.sequenceTimings.get(executionId);
    if (timing) {
      timing.beatCount++;
    }
  }

  /**
   * Get current beat timing information
   * @param sequenceName - Sequence name
   * @param beat - Beat number
   * @returns Current timing info or null
   */
  getCurrentBeatTiming(
    sequenceName: string,
    beat: number
  ): { startTime: number; elapsed: number } | null {
    const beatKey = `${sequenceName}-${beat}`;
    const startTime = this.beatStartTimes.get(beatKey);

    if (!startTime) {
      return null;
    }

    return {
      startTime,
      elapsed: performance.now() - startTime,
    };
  }

  /**
   * Get beat performance statistics
   * @param sequenceName - Optional sequence name filter
   * @returns Beat performance statistics
   */
  getBeatStatistics(sequenceName?: string): {
    totalBeats: number;
    averageDuration: number;
    minDuration: number;
    maxDuration: number;
    recentBeats: BeatTiming[];
  } {
    const filteredBeats = sequenceName
      ? this.completedBeats.filter((b) => b.sequenceName === sequenceName)
      : this.completedBeats;

    if (filteredBeats.length === 0) {
      return {
        totalBeats: 0,
        averageDuration: 0,
        minDuration: 0,
        maxDuration: 0,
        recentBeats: [],
      };
    }

    const durations = filteredBeats
      .map((b) => b.duration!)
      .filter((d) => d !== undefined);
    const averageDuration =
      durations.reduce((sum, d) => sum + d, 0) / durations.length;
    const minDuration = Math.min(...durations);
    const maxDuration = Math.max(...durations);

    return {
      totalBeats: filteredBeats.length,
      averageDuration,
      minDuration,
      maxDuration,
      recentBeats: filteredBeats.slice(-10), // Last 10 beats
    };
  }

  /**
   * Get movement performance statistics
   * @param sequenceName - Optional sequence name filter
   * @returns Movement performance statistics
   */
  getMovementTimings(sequenceName?: string): MovementTiming[] {
    const filteredMovements = sequenceName
      ? this.completedMovements.filter((m) => m.sequenceName === sequenceName)
      : this.completedMovements;

    return filteredMovements.slice(); // Return a copy
  }

  /**
   * Get active timing information
   * @returns Currently active timings
   */
  getActiveTimings(): {
    activeBeats: Array<{ key: string; elapsed: number }>;
    activeSequences: Array<{
      executionId: string;
      sequenceName: string;
      elapsed: number;
    }>;
    activeMovements: Array<{ key: string; elapsed: number }>;
  } {
    const now = performance.now();

    const activeBeats = Array.from(this.beatStartTimes.entries()).map(
      ([key, startTime]) => ({
        key,
        elapsed: now - startTime,
      })
    );

    const activeSequences = Array.from(this.sequenceTimings.entries()).map(
      ([executionId, timing]) => ({
        executionId,
        sequenceName: timing.sequenceName,
        elapsed: now - timing.startTime,
      })
    );

    const activeMovements = Array.from(this.movementStartTimes.entries()).map(
      ([key, startTime]) => ({
        key,
        elapsed: now - startTime,
      })
    );

    return {
      activeBeats,
      activeSequences,
      activeMovements,
    };
  }

  /**
   * Get performance warnings for long-running operations
   * @param beatThreshold - Beat duration threshold in ms (default: 5000)
   * @param sequenceThreshold - Sequence duration threshold in ms (default: 30000)
   * @returns Performance warnings
   */
  getPerformanceWarnings(
    beatThreshold: number = 5000,
    sequenceThreshold: number = 30000
  ): string[] {
    const warnings: string[] = [];
    const now = performance.now();

    // Check for long-running beats
    for (const [beatKey, startTime] of this.beatStartTimes.entries()) {
      const elapsed = now - startTime;
      if (elapsed > beatThreshold) {
        warnings.push(
          `Long-running beat: ${beatKey} (${elapsed.toFixed(0)}ms)`
        );
      }
    }

    // Check for long-running sequences
    for (const [executionId, timing] of this.sequenceTimings.entries()) {
      const elapsed = now - timing.startTime;
      if (elapsed > sequenceThreshold) {
        warnings.push(
          `Long-running sequence: ${timing.sequenceName} (${elapsed.toFixed(
            0
          )}ms)`
        );
      }
    }

    return warnings;
  }

  /**
   * Reset all performance tracking data
   */
  reset(): void {
    this.beatStartTimes.clear();
    this.sequenceTimings.clear();
    this.movementStartTimes.clear();
    this.completedBeats = [];
    this.completedMovements = [];

    console.log("🧹 PerformanceTracker: All tracking data reset");
  }

  /**
   * Get debug information
   * @returns Debug performance information
   */
  getDebugInfo(): {
    activeBeats: number;
    activeSequences: number;
    completedBeatsHistory: number;
    beatStatistics: ReturnType<PerformanceTracker["getBeatStatistics"]>;
    warnings: string[];
  } {
    return {
      activeBeats: this.beatStartTimes.size,
      activeSequences: this.sequenceTimings.size,
      completedBeatsHistory: this.completedBeats.length,
      beatStatistics: this.getBeatStatistics(),
      warnings: this.getPerformanceWarnings(),
    };
  }
}
