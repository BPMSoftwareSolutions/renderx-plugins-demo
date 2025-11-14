/**
 * SequencePlayerEngine - Core engine for playing sequences and measuring performance
 */

import { MusicalConductor } from "../../../modules/communication/sequences/MusicalConductor";
import { EventBus } from "../../../modules/communication/EventBus";
import type { MusicalSequence } from "../../../modules/communication/sequences/SequenceTypes";

export interface PlayOptions {
  mockServices?: string[];
  mockBeats?: number[];
}

export interface PlayResult {
  sequenceId: string;
  sequenceName: string;
  mode: "full-integration" | "mocked";
  mockServices: string[];
  mockBeats: number[];
  startTime: number;
  endTime: number;
  duration: number;
  beats: BeatTiming[];
  totalBeats: number;
  errors: any[];
  status: "success" | "failed";
}

export interface BeatTiming {
  beat: number;
  event: string;
  handler?: string;
  kind?: string;
  timing?: string;
  startTime: number;
  endTime: number;
  duration: number;
  isMocked: boolean;
}

export class SequencePlayerEngine {
  private conductor: MusicalConductor;
  private beatTimings: Map<number, BeatTiming> = new Map();

  constructor() {
    // Initialize conductor with event bus if not already initialized
    try {
      this.conductor = MusicalConductor.getInstance();
    } catch {
      // If conductor needs initialization, create event bus
      const eventBus = new EventBus();
      this.conductor = MusicalConductor.getInstance(eventBus);
    }
  }

  async play(
    sequenceId: string,
    context: any = {},
    options: PlayOptions = {}
  ): Promise<PlayResult> {
    const startTime = Date.now();
    this.beatTimings.clear();

    try {
      // Get sequence from registry
      const sequence = this.conductor.getSequence(sequenceId);
      if (!sequence) {
        throw new Error(`Sequence not found: ${sequenceId}`);
      }

      // Setup mocking if requested
      if (options.mockServices?.length || options.mockBeats?.length) {
        this.setupMocking(sequence, options);
      }

      // Execute sequence
      this.conductor.play("cli-player", sequenceId, context);

      // Collect timing data
      const beats = this.collectBeatTimings(sequence, options);

      const endTime = Date.now();

      return {
        sequenceId: sequence.id,
        sequenceName: sequence.name,
        mode: options.mockServices?.length ? "mocked" : "full-integration",
        mockServices: options.mockServices || [],
        mockBeats: options.mockBeats || [],
        startTime,
        endTime,
        duration: endTime - startTime,
        beats,
        totalBeats: beats.length,
        errors: [],
        status: "success",
      };
    } catch (error) {
      const endTime = Date.now();
      return {
        sequenceId,
        sequenceName: "",
        mode: "full-integration",
        mockServices: options.mockServices || [],
        mockBeats: options.mockBeats || [],
        startTime,
        endTime,
        duration: endTime - startTime,
        beats: [],
        totalBeats: 0,
        errors: [error instanceof Error ? error.message : String(error)],
        status: "failed",
      };
    }
  }

  async listSequences(): Promise<any[]> {
    // Get all registered sequences from conductor
    return this.conductor.getRegisteredSequences().map((seq) => ({
      id: seq.id,
      name: seq.name,
      category: seq.category,
      beats: seq.movements.reduce((sum, m) => sum + m.beats.length, 0),
    }));
  }

  private setupMocking(sequence: MusicalSequence, options: PlayOptions): void {
    // TODO: Implement mock handler setup
    // This will intercept handlers based on beat kind or beat number
  }

  private collectBeatTimings(
    sequence: MusicalSequence,
    options: PlayOptions
  ): BeatTiming[] {
    const timings: BeatTiming[] = [];

    sequence.movements.forEach((movement) => {
      movement.beats.forEach((beat) => {
        const isMocked =
          options.mockBeats?.includes(beat.beat) ||
          (options.mockServices?.includes(beat.kind || "pure") ?? false);

        timings.push({
          beat: beat.beat,
          event: beat.event,
          handler: (beat as any).handler,
          kind: beat.kind,
          timing: beat.timing,
          startTime: 0, // TODO: Get from execution context
          endTime: 0, // TODO: Get from execution context
          duration: 0, // TODO: Calculate
          isMocked,
        });
      });
    });

    return timings;
  }
}

