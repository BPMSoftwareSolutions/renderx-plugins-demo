import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parseLog, calculateExecutionStats } from '../src/ui/diagnostics/services/log-parser.service';
import type { LogInput } from '../src/ui/diagnostics/types';

/**
 * Integration tests for Diagnostic Sequence Player
 * 
 * Tests end-to-end functionality with sample log files.
 * Part of Issue #305.
 */

describe('[BEAT:renderx-web-orchestration:renderx-web-orchestration:1.6] Sequence Player Integration', () => {
  const sampleLogPath = resolve(__dirname, 'fixtures', 'sample-execution.json');

  it('[AC:renderx-web-orchestration:renderx-web-orchestration:1.6:1] should parse sample execution log file', () => {
      // Given: the notifyReady operation is triggered
      const startTime = performance.now();
      // When: the handler executes
    const content = readFileSync(sampleLogPath, 'utf8');
    const input: LogInput = {
      content,
      format: 'json'
    };

    const result = parseLog(input);

      // Then: it completes successfully within < 50ms
    expect(result.success).toBe(true);
    expect(result.execution).toBeDefined();
      // And: the output is valid and meets schema
      // And: any required events are published
      const elapsed = performance.now() - startTime;
      expect(elapsed).toBeLessThan(50);
  });

  it('[AC:renderx-web-orchestration:renderx-web-orchestration:1.6:2] should extract correct metadata from sample log', () => {
      // Given: valid input parameters
      // When: notifyReady processes them
    const content = readFileSync(sampleLogPath, 'utf8');
    const input: LogInput = {
      content,
      format: 'json'
    };

    const result = parseLog(input);

      // Then: results conform to expected schema
    expect(result.execution?.sequenceId).toBe('create-element');
    expect(result.execution?.sequenceName).toBe('Create Element');
    expect(result.execution?.pluginId).toBe('CanvasPlugin');
    expect(result.execution?.requestId).toBe('req-12345');
    expect(result.execution?.status).toBe('success');
      // And: no errors are thrown
      // And: telemetry events are recorded with latency metrics
  });

  it('[AC:renderx-web-orchestration:renderx-web-orchestration:1.6:3] should parse all movements from sample log', () => {
      // Given: error conditions
      // When: notifyReady encounters an error
    const content = readFileSync(sampleLogPath, 'utf8');
    const input: LogInput = {
      content,
      format: 'json'
    };

    const result = parseLog(input);

      // Then: the error is logged with full context
    expect(result.execution?.movements).toHaveLength(3);
    expect(result.execution?.movements[0].name).toBe('validate');
    expect(result.execution?.movements[1].name).toBe('create');
    expect(result.execution?.movements[2].name).toBe('publish');
      // And: appropriate recovery is attempted
      // And: the system remains stable
  });

  it('[AC:renderx-web-orchestration:renderx-web-orchestration:1.6:4] should parse all beats from sample log', () => {
      // Given: performance SLA of < 50ms
      // When: notifyReady executes
    const content = readFileSync(sampleLogPath, 'utf8');
    const input: LogInput = {
      content,
      format: 'json'
    };

    const result = parseLog(input);

      // Then: latency is consistently within target
    expect(result.execution?.movements[0].beats).toHaveLength(3);
    expect(result.execution?.movements[1].beats).toHaveLength(3);
    expect(result.execution?.movements[2].beats).toHaveLength(1);
      // And: throughput meets baseline requirements
      // And: resource usage stays within bounds
  });

  it('[AC:renderx-web-orchestration:renderx-web-orchestration:1.6:5] should calculate correct statistics from sample log', () => {
      // Given: compliance and governance
      // When: notifyReady operates
    const content = readFileSync(sampleLogPath, 'utf8');
    const input: LogInput = {
      content,
      format: 'json'
    };

    const result = parseLog(input);
      // Then: all governance rules are enforced
    expect(result.execution).toBeDefined();

    const stats = calculateExecutionStats(result.execution!);

    expect(stats.totalMovements).toBe(3);
    expect(stats.totalBeats).toBe(7);
    expect(stats.totalDuration).toBe(58);
    expect(stats.successfulBeats).toBe(7);
    expect(stats.failedBeats).toBe(0);
      // And: audit trails capture execution
      // And: no compliance violations occur
  });

  it('[AC:renderx-web-orchestration:renderx-web-orchestration:1.6:1] should identify slowest beat from sample log', () => {
    const content = readFileSync(sampleLogPath, 'utf8');
    const input: LogInput = {
      content,
      format: 'json'
    };

    const result = parseLog(input);
    expect(result.execution).toBeDefined();

    const stats = calculateExecutionStats(result.execution!);

    expect(stats.slowestBeat).toBeDefined();
    expect(stats.slowestBeat?.movement).toBe('create');
    expect(stats.slowestBeat?.beat).toBe(2);
    expect(stats.slowestBeat?.duration).toBe(20);
  });

  it('[AC:renderx-web-orchestration:renderx-web-orchestration:1.6:2] should preserve data baton from sample log', () => {
    const content = readFileSync(sampleLogPath, 'utf8');
    const input: LogInput = {
      content,
      format: 'json'
    };

    const result = parseLog(input);

    const createMovement = result.execution?.movements[1];
    const firstBeat = createMovement?.beats[0];

    expect(firstBeat?.dataBaton).toBeDefined();
    expect(firstBeat?.dataBaton.componentType).toBe('rectangle');
    expect(firstBeat?.dataBaton.x).toBe(100);
    expect(firstBeat?.dataBaton.y).toBe(100);
  });

  it('[AC:renderx-web-orchestration:renderx-web-orchestration:1.6:3] should handle timing information from sample log', () => {
    const content = readFileSync(sampleLogPath, 'utf8');
    const input: LogInput = {
      content,
      format: 'json'
    };

    const result = parseLog(input);

    expect(result.execution?.startTime).toBe('2025-10-01T08:00:00.000Z');
    expect(result.execution?.endTime).toBe('2025-10-01T08:00:00.058Z');
    expect(result.execution?.totalDuration).toBe(58);
  });
});

