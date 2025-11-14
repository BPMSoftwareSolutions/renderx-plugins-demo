/**
 * GapDetector - Detects and reports performance gaps in real-time
 * 
 * This monitors activity and emits telemetry events when gaps > threshold are detected.
 * Works in conjunction with HeartbeatMonitor to provide comprehensive performance monitoring.
 */

import { EventBus } from "../../EventBus.js";

export interface GapDetectorConfig {
  /** Threshold in milliseconds for gap detection (default: 5000 = 5 seconds) */
  threshold: number;
  /** Whether to enable gap detection (default: false) */
  enabled: boolean;
  /** Whether to emit telemetry events for gaps (default: true) */
  emitTelemetry: boolean;
}

export interface PerformanceGap {
  /** Start timestamp of the gap */
  startTime: number;
  /** End timestamp of the gap */
  endTime: number;
  /** Duration of the gap in milliseconds */
  duration: number;
  /** Type of gap: 'idle' (no activity) or 'blocking' (suspected blocking operation) */
  type: 'idle' | 'blocking';
  /** Context information about what was happening before the gap */
  context?: {
    lastSequence?: string;
    lastEvent?: string;
    lastActivity?: string;
  };
}

/**
 * GapDetector class
 * Monitors activity and detects performance gaps
 */
export class GapDetector {
  private config: GapDetectorConfig;
  private eventBus: EventBus;
  private lastActivityTime: number;
  private lastActivityContext: {
    sequence?: string;
    event?: string;
    activity?: string;
  };
  private checkIntervalId: NodeJS.Timeout | number | null = null;
  private detectedGaps: PerformanceGap[] = [];

  constructor(eventBus: EventBus, config: Partial<GapDetectorConfig> = {}) {
    this.eventBus = eventBus;
    this.config = {
      threshold: config.threshold || 5000, // 5 seconds default
      enabled: config.enabled ?? false,
      emitTelemetry: config.emitTelemetry ?? true,
    };

    this.lastActivityTime = Date.now();
    this.lastActivityContext = {};
  }

  /**
   * Start the gap detector
   */
  start(): void {
    if (!this.config.enabled) {
      (globalThis as any).__MC_LOG?.(
        "🔍 GapDetector: Disabled (set enabled: true to enable)"
      );
      return;
    }

    if (this.checkIntervalId !== null) {
      (globalThis as any).__MC_WARN?.(
        "🔍 GapDetector: Already running, skipping start"
      );
      return;
    }

    (globalThis as any).__MC_LOG?.(
      `🔍 GapDetector: Starting with ${this.config.threshold}ms threshold`
    );

    // Check for gaps every second
    this.checkIntervalId = setInterval(() => {
      this.checkForGap();
    }, 1000);

    // Subscribe to activity events
    this.subscribeToActivityEvents();
  }

  /**
   * Stop the gap detector
   */
  stop(): void {
    if (this.checkIntervalId !== null) {
      clearInterval(this.checkIntervalId as any);
      this.checkIntervalId = null;
      (globalThis as any).__MC_LOG?.("🔍 GapDetector: Stopped");
    }
  }

  /**
   * Subscribe to activity events to track last activity
   */
  private subscribeToActivityEvents(): void {
    // Track sequence executions
    this.eventBus.subscribe("musical-conductor:sequence:started", (data: any) => {
      this.recordActivity("sequence", data.sequenceName, data.event);
    });

    this.eventBus.subscribe("musical-conductor:sequence:completed", (data: any) => {
      this.recordActivity("sequence", data.sequenceName, "completed");
    });

    // Track beat executions
    this.eventBus.subscribe("musical-conductor:beat:started", (data: any) => {
      this.recordActivity("beat", data.sequenceName, data.event);
    });

    this.eventBus.subscribe("musical-conductor:beat:completed", (data: any) => {
      this.recordActivity("beat", data.sequenceName, data.event);
    });

    // Track movement executions
    this.eventBus.subscribe("musical-conductor:movement:started", (data: any) => {
      this.recordActivity("movement", data.sequenceName, data.movementName);
    });

    this.eventBus.subscribe("musical-conductor:movement:completed", (data: any) => {
      this.recordActivity("movement", data.sequenceName, data.movementName);
    });
  }

  /**
   * Record activity
   */
  private recordActivity(activity: string, sequence?: string, event?: string): void {
    this.lastActivityTime = Date.now();
    this.lastActivityContext = {
      activity,
      sequence,
      event,
    };
  }

  /**
   * Check for performance gap
   */
  private checkForGap(): void {
    const now = Date.now();
    const timeSinceLastActivity = now - this.lastActivityTime;

    if (timeSinceLastActivity > this.config.threshold) {
      // Detected a gap
      const gap: PerformanceGap = {
        startTime: this.lastActivityTime,
        endTime: now,
        duration: timeSinceLastActivity,
        type: this.determineGapType(timeSinceLastActivity),
        context: {
          lastSequence: this.lastActivityContext.sequence,
          lastEvent: this.lastActivityContext.event,
          lastActivity: this.lastActivityContext.activity,
        },
      };

      // Only report each gap once
      const alreadyReported = this.detectedGaps.some(
        (g) => Math.abs(g.startTime - gap.startTime) < 1000
      );

      if (!alreadyReported) {
        this.reportGap(gap);
        this.detectedGaps.push(gap);

        // Keep only last 100 gaps
        if (this.detectedGaps.length > 100) {
          this.detectedGaps = this.detectedGaps.slice(-50);
        }
      }
    }
  }

  /**
   * Determine gap type based on duration
   */
  private determineGapType(duration: number): 'idle' | 'blocking' {
    // Gaps > 30 seconds are likely user idle time
    // Gaps 5-30 seconds could be blocking operations
    return duration > 30000 ? 'idle' : 'blocking';
  }

  /**
   * Report a detected gap
   */
  private reportGap(gap: PerformanceGap): void {
    const durationSec = (gap.duration / 1000).toFixed(1);
    const gapType = gap.type === 'idle' ? '💤' : '⚠️';

    (globalThis as any).__MC_WARN?.(
      `${gapType} GapDetector: ${gap.type.toUpperCase()} gap detected: ${durationSec}s | ` +
      `Last activity: ${gap.context?.lastActivity} (${gap.context?.lastSequence})`
    );

    // Emit telemetry event
    if (this.config.emitTelemetry) {
      this.eventBus.emit("musical-conductor:performance:gap", {
        gap,
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Get detected gaps
   */
  getDetectedGaps(): PerformanceGap[] {
    return [...this.detectedGaps];
  }

  /**
   * Get current configuration
   */
  getConfig(): GapDetectorConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<GapDetectorConfig>): void {
    const wasEnabled = this.config.enabled;
    this.config = { ...this.config, ...config };

    // Restart if enabled state changed
    if (wasEnabled && !this.config.enabled) {
      this.stop();
    } else if (!wasEnabled && this.config.enabled) {
      this.start();
    }
  }

  /**
   * Reset detector state
   */
  reset(): void {
    this.detectedGaps = [];
    this.lastActivityTime = Date.now();
    this.lastActivityContext = {};
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    totalGaps: number;
    idleGaps: number;
    blockingGaps: number;
    totalIdleTime: number;
    totalBlockingTime: number;
    averageGapDuration: number;
  } {
    const idleGaps = this.detectedGaps.filter((g) => g.type === 'idle');
    const blockingGaps = this.detectedGaps.filter((g) => g.type === 'blocking');

    const totalIdleTime = idleGaps.reduce((sum, g) => sum + g.duration, 0);
    const totalBlockingTime = blockingGaps.reduce((sum, g) => sum + g.duration, 0);

    const totalDuration = this.detectedGaps.reduce((sum, g) => sum + g.duration, 0);
    const averageGapDuration =
      this.detectedGaps.length > 0 ? totalDuration / this.detectedGaps.length : 0;

    return {
      totalGaps: this.detectedGaps.length,
      idleGaps: idleGaps.length,
      blockingGaps: blockingGaps.length,
      totalIdleTime,
      totalBlockingTime,
      averageGapDuration,
    };
  }
}

