/**
 * PerformanceTracker Unit Tests
 * Tests for movement timing telemetry functionality
 */

import { PerformanceTracker, MovementTiming } from "../../../../../modules/communication/sequences/monitoring/PerformanceTracker.js";

describe("PerformanceTracker - Movement Timing", () => {
  let performanceTracker: PerformanceTracker;

  beforeEach(() => {
    performanceTracker = new PerformanceTracker();

    // Stub global logging hooks used by PerformanceTracker so tests
    // do not depend on console.* directly.
    (globalThis as any).__MC_LOG = jest.fn();
    (globalThis as any).__MC_WARN = jest.fn();

    // Mock performance.now() for consistent testing
    jest.spyOn(performance, "now")
      .mockReturnValueOnce(1000) // First call (start)
      .mockReturnValueOnce(1250); // Second call (end)
  });

  afterEach(() => {
    jest.restoreAllMocks();
    delete (globalThis as any).__MC_LOG;
    delete (globalThis as any).__MC_WARN;
  });

  describe("MovementTiming Interface", () => {
    it("should have correct MovementTiming interface structure", () => {
      // This test ensures the interface is properly defined
      const mockMovementTiming: MovementTiming = {
        sequenceName: "TestSequence",
        movementName: "TestMovement",
        requestId: "req-123",
        startTime: 1000,
        endTime: 1250,
        duration: 250,
        beatsCount: 3
      };

      expect(mockMovementTiming.sequenceName).toBe("TestSequence");
      expect(mockMovementTiming.movementName).toBe("TestMovement");
      expect(mockMovementTiming.requestId).toBe("req-123");
      expect(mockMovementTiming.startTime).toBe(1000);
      expect(mockMovementTiming.endTime).toBe(1250);
      expect(mockMovementTiming.duration).toBe(250);
      expect(mockMovementTiming.beatsCount).toBe(3);
    });
  });

  describe("startMovementTiming", () => {
    it("should start timing a movement and return movement key", () => {
      const logSpy = (globalThis as any).__MC_LOG as jest.Mock;

      const movementKey = performanceTracker.startMovementTiming(
        "LoadComponents",
        "Setup",
        "req-123"
      );

      expect(movementKey).toBe("LoadComponents-Setup-req-123");
      expect(logSpy).toHaveBeenCalledWith(
        "⏱️ PerformanceTracker: Started timing movement Setup for LoadComponents"
      );
    });

    it("should track multiple movements simultaneously", () => {
      const key1 = performanceTracker.startMovementTiming("Seq1", "Move1", "req-1");
      const key2 = performanceTracker.startMovementTiming("Seq2", "Move2", "req-2");

      expect(key1).toBe("Seq1-Move1-req-1");
      expect(key2).toBe("Seq2-Move2-req-2");

      const activeTimings = performanceTracker.getActiveTimings();
      expect(activeTimings.activeMovements).toHaveLength(2);
    });
  });

  describe("endMovementTiming", () => {
    it("should end timing a movement and return duration", () => {
      const logSpy = (globalThis as any).__MC_LOG as jest.Mock;

      // Start timing
      performanceTracker.startMovementTiming("LoadComponents", "Setup", "req-123");

      // End timing
      const duration = performanceTracker.endMovementTiming(
        "LoadComponents",
        "Setup",
        "req-123",
        3
      );

      expect(duration).toBe(250); // 1250 - 1000
      expect(logSpy).toHaveBeenCalledWith(
        "⏱️ PerformanceTracker: Movement Setup completed in 250.00ms"
      );
    });

    it("should return null for movement that was not started", () => {
      const warnSpy = (globalThis as any).__MC_WARN as jest.Mock;

      const duration = performanceTracker.endMovementTiming(
        "NonExistent",
        "Movement",
        "req-123",
        0
      );

      expect(duration).toBeNull();
      expect(warnSpy).toHaveBeenCalledWith(
        "⏱️ PerformanceTracker: No start time found for movement Movement in NonExistent"
      );
    });

    it("should store completed movement timing data", () => {
      // Start and end timing
      performanceTracker.startMovementTiming("LoadComponents", "Setup", "req-123");
      performanceTracker.endMovementTiming("LoadComponents", "Setup", "req-123", 3);

      const movementTimings = performanceTracker.getMovementTimings();
      expect(movementTimings).toHaveLength(1);
      
      const timing = movementTimings[0];
      expect(timing.sequenceName).toBe("LoadComponents");
      expect(timing.movementName).toBe("Setup");
      expect(timing.requestId).toBe("req-123");
      expect(timing.startTime).toBe(1000);
      expect(timing.endTime).toBe(1250);
      expect(timing.duration).toBe(250);
      expect(timing.beatsCount).toBe(3);
    });
  });

  describe("getMovementTimings", () => {
    it("should return empty array when no movements completed", () => {
      const timings = performanceTracker.getMovementTimings();
      expect(timings).toEqual([]);
    });

    it("should return all completed movement timings", () => {
      // Complete two movements
      performanceTracker.startMovementTiming("Seq1", "Move1", "req-1");
      performanceTracker.endMovementTiming("Seq1", "Move1", "req-1", 2);
      
      performanceTracker.startMovementTiming("Seq2", "Move2", "req-2");
      performanceTracker.endMovementTiming("Seq2", "Move2", "req-2", 4);

      const timings = performanceTracker.getMovementTimings();
      expect(timings).toHaveLength(2);
      expect(timings[0].sequenceName).toBe("Seq1");
      expect(timings[1].sequenceName).toBe("Seq2");
    });

    it("should filter by sequence name when provided", () => {
      // Complete movements for different sequences
      performanceTracker.startMovementTiming("Seq1", "Move1", "req-1");
      performanceTracker.endMovementTiming("Seq1", "Move1", "req-1", 2);
      
      performanceTracker.startMovementTiming("Seq2", "Move2", "req-2");
      performanceTracker.endMovementTiming("Seq2", "Move2", "req-2", 4);

      const seq1Timings = performanceTracker.getMovementTimings("Seq1");
      expect(seq1Timings).toHaveLength(1);
      expect(seq1Timings[0].sequenceName).toBe("Seq1");
    });
  });

  describe("cleanupFailedMovement", () => {
    it("should clean up timing data for failed movement", () => {
      const logSpy = (globalThis as any).__MC_LOG as jest.Mock;

      // Start timing
      performanceTracker.startMovementTiming("LoadComponents", "Setup", "req-123");

      // Verify movement is active
      let activeTimings = performanceTracker.getActiveTimings();
      expect(activeTimings.activeMovements).toHaveLength(1);

      // Clean up failed movement
      performanceTracker.cleanupFailedMovement("LoadComponents", "Setup", "req-123");

      // Verify movement is no longer active
      activeTimings = performanceTracker.getActiveTimings();
      expect(activeTimings.activeMovements).toHaveLength(0);

      expect(logSpy).toHaveBeenCalledWith(
        "⏱️ PerformanceTracker: Cleaned up tracking for movement Setup in LoadComponents"
      );
    });
  });

  describe("getActiveTimings", () => {
    it("should include active movements in timing information", () => {
      performanceTracker.startMovementTiming("Seq1", "Move1", "req-1");
      performanceTracker.startMovementTiming("Seq2", "Move2", "req-2");

      const activeTimings = performanceTracker.getActiveTimings();
      
      expect(activeTimings.activeMovements).toHaveLength(2);
      expect(activeTimings.activeMovements[0].key).toBe("Seq1-Move1-req-1");
      expect(activeTimings.activeMovements[1].key).toBe("Seq2-Move2-req-2");
      expect(typeof activeTimings.activeMovements[0].elapsed).toBe("number");
    });
  });

  describe("reset", () => {
    it("should clear all movement timing data", () => {
      // Add some movement data
      performanceTracker.startMovementTiming("Seq1", "Move1", "req-1");
      performanceTracker.endMovementTiming("Seq1", "Move1", "req-1", 2);
      performanceTracker.startMovementTiming("Seq2", "Move2", "req-2");

      // Verify data exists
      expect(performanceTracker.getMovementTimings()).toHaveLength(1);
      expect(performanceTracker.getActiveTimings().activeMovements).toHaveLength(1);

      // Reset
      performanceTracker.reset();

      // Verify data is cleared
      expect(performanceTracker.getMovementTimings()).toHaveLength(0);
      expect(performanceTracker.getActiveTimings().activeMovements).toHaveLength(0);
    });
  });
});
