import { describe, it, expect } from 'vitest';
import { recommendFixes } from '../../src/handlers/diagnosis/recommend.fixes';

/**
 * Business BDD Test: recommendFixes
 * User Story: As an Engineering Manager I want actionable fix recommendations so remediation can be scheduled.
 */

describe('Business BDD: recommendFixes', () => {
  it('Scenario: Generate recommendations for mixed issues', () => {
    const slice: any = {
      performanceIssues: [ { anomalyId: 'p1', handler: 'slowHandler', latencyRatio: 4, severity: 'high', description: 'slow' } ],
      behavioralIssues: [ { anomalyId: 'b1', handler: 'seqA', missingHandlers: ['seqB'], outOfOrder: false, severity: 'medium', description: 'missing handler' } ],
      coverageIssues: [ { anomalyId: 'c1', handler: 'handlerC', coveragePercent: 50, severity: 'high', description: 'low coverage' } ],
      errorIssues: [ { anomalyId: 'e1', handler: 'handlerE', errorRate: 0.2, pattern: 'E_TIMEOUT', severity: 'high', description: 'timeout errors' } ],
      sequenceId: 'diag-recommend',
      generatedAt: new Date().toISOString()
    };
    const result = recommendFixes(slice);
    expect(result.context.recommendations.length).toBeGreaterThanOrEqual(4);
    const perfRec = result.context.recommendations.find(r => r.type === 'code');
    expect(perfRec).toBeDefined();
    const testRec = result.context.recommendations.find(r => r.type === 'test');
    expect(testRec).toBeDefined();
  });
});
