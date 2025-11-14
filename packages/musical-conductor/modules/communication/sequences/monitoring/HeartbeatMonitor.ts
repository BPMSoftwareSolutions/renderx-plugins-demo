/**
 * HeartbeatMonitor - Emits periodic heartbeat logs to detect idle vs. blocking operations
 * 
 * This helps identify performance gaps in telemetry logs by emitting a heartbeat
 * every N seconds. If heartbeats are missing, it indicates either:
 * 1. User idle time (expected)
 * 2. Blocking operation (performance issue)
 * 
 * The heartbeat includes activity metrics to help distinguish between the two.
 */

export interface HeartbeatConfig {
  /** Interval in milliseconds between heartbeats (default: 10000 = 10 seconds) */
  interval: number;
  /** Whether to enable heartbeat monitoring (default: false) */
  enabled: boolean;
  /** Whether to include detailed metrics in heartbeat (default: false) */
  includeMetrics: boolean;
}

export interface HeartbeatMetrics {
  /** Number of sequences executed since last heartbeat */
  sequencesExecuted: number;
  /** Number of events emitted since last heartbeat */
  eventsEmitted: number;
  /** Number of topics subscribed since last heartbeat */
  topicsSubscribed: number;
  /** Timestamp of last activity */
  lastActivityTime: number;
}

/**
 * HeartbeatMonitor class
 * Emits periodic heartbeat logs with optional activity metrics
 */
export class HeartbeatMonitor {
  private config: HeartbeatConfig;
  private intervalId: NodeJS.Timeout | number | null = null;
  private metrics: HeartbeatMetrics;
  private startTime: number;
  private heartbeatCount: number = 0;

  constructor(config: Partial<HeartbeatConfig> = {}) {
    this.config = {
      interval: config.interval || 10000, // 10 seconds default
      enabled: config.enabled ?? false,
      includeMetrics: config.includeMetrics ?? false,
    };

    this.metrics = {
      sequencesExecuted: 0,
      eventsEmitted: 0,
      topicsSubscribed: 0,
      lastActivityTime: Date.now(),
    };

    this.startTime = Date.now();
  }

  /**
   * Start the heartbeat monitor
   */
  start(): void {
    if (!this.config.enabled) {
      (globalThis as any).__MC_LOG?.(
        "💓 HeartbeatMonitor: Disabled (set enabled: true to enable)"
      );
      return;
    }

    if (this.intervalId !== null) {
      (globalThis as any).__MC_WARN?.(
        "💓 HeartbeatMonitor: Already running, skipping start"
      );
      return;
    }

    (globalThis as any).__MC_LOG?.(
      `💓 HeartbeatMonitor: Starting with ${this.config.interval}ms interval`
    );

    this.intervalId = setInterval(() => {
      this.emitHeartbeat();
    }, this.config.interval);

    // Emit initial heartbeat
    this.emitHeartbeat();
  }

  /**
   * Stop the heartbeat monitor
   */
  stop(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId as any);
      this.intervalId = null;
      (globalThis as any).__MC_LOG?.("💓 HeartbeatMonitor: Stopped");
    }
  }

  /**
   * Record sequence execution activity
   */
  recordSequenceExecution(): void {
    this.metrics.sequencesExecuted++;
    this.metrics.lastActivityTime = Date.now();
  }

  /**
   * Record event emission activity
   */
  recordEventEmission(): void {
    this.metrics.eventsEmitted++;
    this.metrics.lastActivityTime = Date.now();
  }

  /**
   * Record topic subscription activity
   */
  recordTopicSubscription(): void {
    this.metrics.topicsSubscribed++;
    this.metrics.lastActivityTime = Date.now();
  }

  /**
   * Emit a heartbeat log
   */
  private emitHeartbeat(): void {
    this.heartbeatCount++;
    const now = Date.now();
    const uptime = now - this.startTime;
    const timeSinceLastActivity = now - this.metrics.lastActivityTime;

    if (this.config.includeMetrics) {
      (globalThis as any).__MC_LOG?.(
        `💓 Heartbeat #${this.heartbeatCount} | ` +
        `Uptime: ${Math.floor(uptime / 1000)}s | ` +
        `Idle: ${Math.floor(timeSinceLastActivity / 1000)}s | ` +
        `Activity: ${this.metrics.sequencesExecuted} seqs, ` +
        `${this.metrics.eventsEmitted} events, ` +
        `${this.metrics.topicsSubscribed} subs`
      );
    } else {
      (globalThis as any).__MC_LOG?.(
        `💓 Heartbeat #${this.heartbeatCount} | ` +
        `Uptime: ${Math.floor(uptime / 1000)}s | ` +
        `Idle: ${Math.floor(timeSinceLastActivity / 1000)}s`
      );
    }

    // Reset metrics after each heartbeat
    this.metrics.sequencesExecuted = 0;
    this.metrics.eventsEmitted = 0;
    this.metrics.topicsSubscribed = 0;
  }

  /**
   * Get current configuration
   */
  getConfig(): HeartbeatConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   * @param config - Partial configuration to update
   */
  updateConfig(config: Partial<HeartbeatConfig>): void {
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
   * Get current metrics
   */
  getMetrics(): HeartbeatMetrics & { uptime: number; heartbeatCount: number } {
    return {
      ...this.metrics,
      uptime: Date.now() - this.startTime,
      heartbeatCount: this.heartbeatCount,
    };
  }

  /**
   * Reset metrics
   */
  resetMetrics(): void {
    this.metrics = {
      sequencesExecuted: 0,
      eventsEmitted: 0,
      topicsSubscribed: 0,
      lastActivityTime: Date.now(),
    };
    this.heartbeatCount = 0;
    this.startTime = Date.now();
  }
}

