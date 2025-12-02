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
    const content = readFileSync(sampleLogPath, 'utf8');
    const input: LogInput = {
      content,
      format: 'json'
    };

    const result = parseLog(input);

    expect(result.success).toBe(true);
    expect(result.execution).toBeDefined();
  });

  it('[AC:renderx-web-orchestration:renderx-web-orchestration:1.6:2] should extract correct metadata from sample log', () => {
    const content = readFileSync(sampleLogPath, 'utf8');
    const input: LogInput = {
      content,
      format: 'json'
    };

    const result = parseLog(input);

    expect(result.execution?.sequenceId).toBe('create-element');
    expect(result.execution?.sequenceName).toBe('Create Element');
    expect(result.execution?.pluginId).toBe('CanvasPlugin');
    expect(result.execution?.requestId).toBe('req-12345');
    expect(result.execution?.status).toBe('success');
  });

  it('[AC:renderx-web-orchestration:renderx-web-orchestration:1.6:3] should parse all movements from sample log', () => {
    const content = readFileSync(sampleLogPath, 'utf8');
    const input: LogInput = {
      content,
      format: 'json'
    };

    const result = parseLog(input);

    expect(result.execution?.movements).toHaveLength(3);
    expect(result.execution?.movements[0].name).toBe('validate');
    expect(result.execution?.movements[1].name).toBe('create');
    expect(result.execution?.movements[2].name).toBe('publish');
  });

  it('[AC:renderx-web-orchestration:renderx-web-orchestration:1.6:4] should parse all beats from sample log', () => {
    const content = readFileSync(sampleLogPath, 'utf8');
    const input: LogInput = {
      content,
      format: 'json'
    };

    const result = parseLog(input);

    expect(result.execution?.movements[0].beats).toHaveLength(3);
    expect(result.execution?.movements[1].beats).toHaveLength(3);
    expect(result.execution?.movements[2].beats).toHaveLength(1);
  });

  it('[AC:renderx-web-orchestration:renderx-web-orchestration:1.6:5] should calculate correct statistics from sample log', () => {
    const content = readFileSync(sampleLogPath, 'utf8');
    const input: LogInput = {
      content,
      format: 'json'
    };

    const result = parseLog(input);
    expect(result.execution).toBeDefined();

    const stats = calculateExecutionStats(result.execution!);

    expect(stats.totalMovements).toBe(3);
    expect(stats.totalBeats).toBe(7);
    expect(stats.totalDuration).toBe(58);
    expect(stats.successfulBeats).toBe(7);
    expect(stats.failedBeats).toBe(0);
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

