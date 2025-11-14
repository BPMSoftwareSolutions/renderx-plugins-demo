/**
 * Mock Executor
 * 
 * Executes beats with selective mocking to isolate performance issues.
 * Supports incremental unmocking to find bottlenecks.
 */

import type { MusicalSequence } from '../../modules/communication/sequences/SequenceTypes';
import {
  shouldMockBeat,
  getMockDelay,
  formatMockContext,
  type BeatKind,
  type MockOptions,
} from './MockHandlerRegistry';

export interface ExecutionResult {
  beatNumber: number;
  handler: string;
  kind: BeatKind;
  isMocked: boolean;
  duration: number;
  startTime: number;
  endTime: number;
  status: 'success' | 'error';
  message?: string;
}

export class MockExecutor {
  private results: ExecutionResult[] = [];
  private totalDuration: number = 0;

  /**
   * Execute a sequence with selective mocking
   */
  async executeWithMocking(
    sequence: MusicalSequence,
    options: MockOptions = {}
  ): Promise<ExecutionResult[]> {
    this.results = [];
    const startTime = Date.now();

    console.log('\n🎬 [MockExecutor] Starting sequence execution with mocking');
    console.log(`   Sequence: ${sequence.name}`);
    if (options.mockServices?.length) {
      console.log(`   Mock Services: ${options.mockServices.join(', ')}`);
    }
    if (options.mockBeats?.length) {
      console.log(`   Mock Beats: ${options.mockBeats.join(', ')}`);
    }
    console.log('');

    for (const movement of sequence.movements) {
      for (const beat of movement.beats) {
        const beatStartTime = Date.now();
        const kind = (beat as any).kind || 'pure';
        const handler = (beat as any).handler || `beat${beat.beat}`;
        const isMocked = shouldMockBeat(beat.beat, kind, options);

        console.log(formatMockContext({
          isMocked,
          kind,
          beatNumber: beat.beat,
          handler,
        }));

        try {
          if (isMocked) {
            // Simulate the beat with a small delay
            const delay = getMockDelay(kind);
            await new Promise(r => setTimeout(r, delay));
            console.log(`   ⏱️  Simulated in ${delay}ms`);
          } else {
            // In a real implementation, we would call the actual handler
            // For now, just simulate a realistic delay
            const delay = Math.random() * 50 + 10; // 10-60ms
            await new Promise(r => setTimeout(r, delay));
            console.log(`   ⚡ Executed in ${delay.toFixed(1)}ms`);
          }

          const duration = Date.now() - beatStartTime;
          this.results.push({
            beatNumber: beat.beat,
            handler,
            kind,
            isMocked,
            duration,
            startTime: beatStartTime,
            endTime: Date.now(),
            status: 'success',
          });
        } catch (error) {
          const duration = Date.now() - beatStartTime;
          this.results.push({
            beatNumber: beat.beat,
            handler,
            kind,
            isMocked,
            duration,
            startTime: beatStartTime,
            endTime: Date.now(),
            status: 'error',
            message: String(error),
          });
          console.log(`   ❌ Error: ${error}`);
        }
      }
    }

    this.totalDuration = Date.now() - startTime;
    console.log(`\n✅ Sequence completed in ${this.totalDuration}ms\n`);

    return this.results;
  }

  /**
   * Get execution results
   */
  getResults(): ExecutionResult[] {
    return this.results;
  }

  /**
   * Get total duration
   */
  getTotalDuration(): number {
    return this.totalDuration;
  }

  /**
   * Generate summary report
   */
  generateSummary(): string {
    const mocked = this.results.filter(r => r.isMocked).length;
    const unmocked = this.results.filter(r => !r.isMocked).length;
    const slowBeats = this.results.filter(r => r.duration > 100);

    let summary = `\n📊 Execution Summary\n`;
    summary += `   Total Duration: ${this.totalDuration}ms\n`;
    summary += `   Beats: ${this.results.length} (${mocked} mocked, ${unmocked} unmocked)\n`;
    summary += `   Slow Beats (>100ms): ${slowBeats.length}\n`;

    if (slowBeats.length > 0) {
      summary += `\n   ⚠️  Slow Beats:\n`;
      slowBeats.forEach(beat => {
        summary += `      Beat ${beat.beatNumber}: ${beat.handler} - ${beat.duration}ms\n`;
      });
    }

    return summary;
  }
}

