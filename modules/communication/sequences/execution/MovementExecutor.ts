/**
 * MovementExecutor - Executes individual movements within a sequence
 * Handles movement-level orchestration and beat coordination
 */

import { EventBus } from "../../EventBus";
import { SPAValidator } from "../../SPAValidator";
import type {
  SequenceMovement,
  SequenceExecutionContext,
  MusicalSequence,
} from "../SequenceTypes";
import {
  MUSICAL_CONDUCTOR_EVENT_TYPES,
  MUSICAL_TIMING,
} from "../SequenceTypes";
import { BeatExecutor } from "./BeatExecutor";

export class MovementExecutor {
  private eventBus: EventBus;
  private spaValidator: SPAValidator;
  private beatExecutor: BeatExecutor;

  constructor(eventBus: EventBus, spaValidator: SPAValidator) {
    this.eventBus = eventBus;
    this.spaValidator = spaValidator;
    this.beatExecutor = new BeatExecutor(eventBus, spaValidator);
  }

  /**
   * Execute a movement within a sequence
   * @param movement - The movement to execute
   * @param executionContext - The sequence execution context
   * @param sequence - The parent sequence
   */
  async executeMovement(
    movement: SequenceMovement,
    executionContext: SequenceExecutionContext,
    sequence: MusicalSequence
  ): Promise<void> {
    console.log(
      `🎵 MovementExecutor: Starting movement "${movement.name}" with ${movement.beats.length} beats`
    );

    // Emit movement started event
    this.eventBus.emit(MUSICAL_CONDUCTOR_EVENT_TYPES.MOVEMENT_STARTED, {
      sequenceName: sequence.name,
      movementName: movement.name,
      requestId: executionContext.id,
      beatsCount: movement.beats.length,
    });

    try {
      // Execute beats in sequence
      for (let beatIndex = 0; beatIndex < movement.beats.length; beatIndex++) {
        const beat = movement.beats[beatIndex];
        executionContext.currentBeat = beat.beat;

        console.log(
          `🥁 MovementExecutor: Executing beat ${beat.beat} (${beatIndex + 1}/${
            movement.beats.length
          })`
        );

        // Execute the beat
        await this.beatExecutor.executeBeat(
          beat,
          executionContext,
          sequence,
          movement
        );

        // Update execution context
        executionContext.completedBeats.push(beat.beat);

        // Handle timing between beats
        await this.handleBeatTiming(beat, sequence);
      }

      // Emit movement completed event
      this.eventBus.emit(MUSICAL_CONDUCTOR_EVENT_TYPES.MOVEMENT_COMPLETED, {
        sequenceName: sequence.name,
        movementName: movement.name,
        requestId: executionContext.id,
        beatsExecuted: movement.beats.length,
      });

      console.log(
        `✅ MovementExecutor: Movement "${movement.name}" completed successfully`
      );
    } catch (error) {
      // Handle movement execution error
      console.error(
        `❌ MovementExecutor: Movement "${movement.name}" failed:`,
        error
      );

      // Add error to execution context
      executionContext.errors.push({
        beat: executionContext.currentBeat,
        error: error instanceof Error ? error.message : String(error),
        timestamp: Date.now(),
      });

      // Emit movement failed event
      this.eventBus.emit(MUSICAL_CONDUCTOR_EVENT_TYPES.MOVEMENT_FAILED, {
        sequenceName: sequence.name,
        movementName: movement.name,
        requestId: executionContext.id,
        error: error instanceof Error ? error.message : String(error),
      });

      throw error;
    }
  }

  /**
   * Handle timing between beats based on sequence tempo and beat timing
   * @param beat - The current beat
   * @param sequence - The parent sequence
   */
  private async handleBeatTiming(
    beat: any,
    sequence: MusicalSequence
  ): Promise<void> {
    // Skip timing for immediate beats
    if (beat.timing === MUSICAL_TIMING.IMMEDIATE) {
      return;
    }

    // Calculate delay based on sequence tempo
    const tempo = sequence.tempo || 120; // Default 120 BPM
    const beatDuration = (60 / tempo) * 1000; // Convert to milliseconds

    let delay = 0;

    switch (beat.timing) {
      case MUSICAL_TIMING.AFTER_BEAT:
        delay = beatDuration;
        break;
      case MUSICAL_TIMING.DELAYED:
        delay = beatDuration * 1.5;
        break;
      case MUSICAL_TIMING.SYNCHRONIZED:
        delay = beatDuration / 2;
        break;
      case MUSICAL_TIMING.IMMEDIATE:
      default:
        delay = 0;
    }

    if (delay > 0) {
      console.log(
        `⏱️ MovementExecutor: Waiting ${delay}ms for beat timing (${beat.timing})`
      );
      await this.sleep(delay);
    }
  }

  /**
   * Sleep for a specified duration
   * @param ms - Milliseconds to sleep
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Validate movement structure
   * @param movement - The movement to validate
   * @returns True if valid
   */
  validateMovement(movement: SequenceMovement): boolean {
    try {
      // Check required properties
      if (!movement.name || typeof movement.name !== "string") {
        throw new Error("Movement must have a valid name");
      }

      if (!movement.beats || !Array.isArray(movement.beats)) {
        throw new Error("Movement must have a beats array");
      }

      if (movement.beats.length === 0) {
        throw new Error("Movement must have at least one beat");
      }

      // Validate each beat
      movement.beats.forEach((beat, index) => {
        if (typeof beat.beat !== "number" || beat.beat < 1) {
          throw new Error(`Beat ${index} must have a valid beat number (>= 1)`);
        }

        if (!beat.event || typeof beat.event !== "string") {
          throw new Error(`Beat ${index} must have a valid event name`);
        }

        if (!beat.dynamics) {
          throw new Error(`Beat ${index} must have dynamics specified`);
        }

        if (!beat.timing) {
          throw new Error(`Beat ${index} must have timing specified`);
        }
      });

      return true;
    } catch (error) {
      console.error(
        `❌ MovementExecutor: Movement validation failed for "${movement.name}":`,
        error
      );
      return false;
    }
  }

  /**
   * Get movement execution statistics
   * @param movement - The movement to analyze
   * @returns Movement statistics
   */
  getMovementStatistics(movement: SequenceMovement): {
    name: string;
    totalBeats: number;
    beatTypes: Record<string, number>;
    timingDistribution: Record<string, number>;
    dynamicsDistribution: Record<string, number>;
  } {
    const beatTypes: Record<string, number> = {};
    const timingDistribution: Record<string, number> = {};
    const dynamicsDistribution: Record<string, number> = {};

    movement.beats.forEach((beat) => {
      // Count beat types (events)
      beatTypes[beat.event] = (beatTypes[beat.event] || 0) + 1;

      // Count timing distribution
      const timing = beat.timing || "unknown";
      timingDistribution[timing] = (timingDistribution[timing] || 0) + 1;

      // Count dynamics distribution
      const dynamics = beat.dynamics || "unknown";
      dynamicsDistribution[dynamics] =
        (dynamicsDistribution[dynamics] || 0) + 1;
    });

    return {
      name: movement.name,
      totalBeats: movement.beats.length,
      beatTypes,
      timingDistribution,
      dynamicsDistribution,
    };
  }

  /**
   * Estimate movement execution time
   * @param movement - The movement to analyze
   * @param tempo - The sequence tempo (BPM)
   * @returns Estimated execution time in milliseconds
   */
  estimateExecutionTime(
    movement: SequenceMovement,
    tempo: number = 120
  ): number {
    const beatDuration = (60 / tempo) * 1000; // Base beat duration in ms
    let totalTime = 0;

    movement.beats.forEach((beat) => {
      switch (beat.timing) {
        case MUSICAL_TIMING.IMMEDIATE:
          totalTime += 0;
          break;
        case MUSICAL_TIMING.AFTER_BEAT:
          totalTime += beatDuration;
          break;
        case MUSICAL_TIMING.SYNCHRONIZED:
          totalTime += beatDuration / 2;
          break;
        case MUSICAL_TIMING.DELAYED:
          totalTime += beatDuration * 1.5;
          break;
        default:
          totalTime += beatDuration;
      }
    });

    return Math.round(totalTime);
  }
}
